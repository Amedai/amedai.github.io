-- Выполните целиком в SQL Editor существующего проекта Supabase.
-- Таблицы debt не изменяются. Владелец — тот же предоставленный аккаунт.
-- Посетители читают задачи; только владелец изменяет данные.
begin;

create table if not exists public.worktime_settings (
  singleton boolean primary key default true check (singleton),
  owner_id uuid not null references auth.users(id)
);
insert into public.worktime_settings (singleton, owner_id)
values (true, 'edb177a9-ec4a-4cee-9489-4e2650811dca'::uuid)
on conflict (singleton) do update set owner_id = excluded.owner_id;
alter table public.worktime_settings enable row level security;
revoke all on public.worktime_settings from public, anon, authenticated;
grant select on public.worktime_settings to anon, authenticated;
drop policy if exists "Read worktime settings" on public.worktime_settings;
create policy "Read worktime settings" on public.worktime_settings for select to anon, authenticated using (singleton);

create table if not exists public.worktime_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  name text not null check (char_length(trim(name)) between 1 and 100),
  created_at timestamptz not null default now(),
  unique (id, user_id)
);
create table if not exists public.worktime_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  project_id uuid not null,
  title text not null check (char_length(trim(title)) between 1 and 200),
  note text not null default '' check (char_length(note) <= 2000),
  kind text not null check (kind in ('work', 'plan')),
  done boolean not null default false,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (project_id, user_id) references public.worktime_projects(id, user_id) on delete restrict,
  constraint worktime_interval check (
    (kind = 'plan' and started_at is null and ended_at is null)
    or (kind = 'work' and not done and started_at is not null and ended_at is not null
      and ended_at > started_at and ended_at - started_at <= interval '7 days')
  )
);
create index if not exists worktime_items_project_idx on public.worktime_items(project_id, user_id);
create index if not exists worktime_items_date_idx on public.worktime_items(user_id, started_at desc);

-- Обновление существующей базы: старые записи остаются ручными интервалами.
alter table public.worktime_items add column if not exists timer_state text not null default 'manual';
alter table public.worktime_items add column if not exists elapsed_ms bigint not null default 0;
alter table public.worktime_items add column if not exists running_since timestamptz;
alter table public.worktime_items add column if not exists timer_version integer not null default 0;
alter table public.worktime_items drop constraint if exists worktime_interval;
alter table public.worktime_items add constraint worktime_interval check (
  (kind = 'plan' and started_at is null and ended_at is null and timer_state = 'manual')
  or (kind = 'work' and not done and started_at is not null and (
    (timer_state = 'manual' and ended_at is not null and ended_at > started_at and ended_at - started_at <= interval '7 days')
    or (timer_state in ('running', 'paused') and ended_at is null and started_at <= clock_timestamp())
    or (timer_state = 'finished' and ended_at is not null and ended_at >= started_at
      and elapsed_ms <= floor(extract(epoch from (ended_at - started_at)) * 1000))
  ))
);
alter table public.worktime_items drop constraint if exists worktime_timer;
alter table public.worktime_items add constraint worktime_timer check (
  timer_state in ('manual','running','paused','finished') and elapsed_ms between 0 and 9007199254740991 and timer_version >= 0
  and (timer_state <> 'manual' or elapsed_ms = 0)
  and ((timer_state = 'running' and running_since is not null and running_since >= started_at
    and running_since <= clock_timestamp() and elapsed_ms <= floor(extract(epoch from (running_since - started_at)) * 1000))
    or (timer_state <> 'running' and running_since is null))
);
create unique index if not exists worktime_one_timer on public.worktime_items(user_id)
  where timer_state in ('running','paused');

create table if not exists public.worktime_invoices (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users(id),
  period_start date not null,
  period_end date not null check (period_end >= period_start),
  created_at timestamptz not null default now(),
  paid_at timestamptz check (paid_at >= created_at),
  items jsonb not null check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) between 1 and 10000)
);
alter table public.worktime_invoices enable row level security;
revoke all on public.worktime_invoices from public, anon, authenticated;
grant select on public.worktime_invoices to anon, authenticated;
grant insert, update, delete on public.worktime_invoices to authenticated;

-- Состав счёта неизменяем. Даже запрос в обход интерфейса не изменит историю.
create or replace function public.worktime_guard_invoice() returns trigger
language plpgsql security invoker set search_path = '' as $$
declare entry jsonb; task public.worktime_items%rowtype;
begin
  if tg_op = 'DELETE' then
    perform pg_advisory_xact_lock(hashtextextended(old.user_id::text, 0));
    if old.paid_at is not null then raise exception 'Оплаченный счёт нельзя удалить'; end if;
    return old;
  end if;
  perform pg_advisory_xact_lock(hashtextextended(new.user_id::text, 0));
  if tg_op = 'UPDATE' then
    if (to_jsonb(new) - 'paid_at') is distinct from (to_jsonb(old) - 'paid_at')
      or (old.paid_at is not null and new.paid_at is distinct from old.paid_at) then
      raise exception 'Состав и оплата сохранённого счёта не могут быть изменены';
    end if;
    return new;
  end if;
  if (select count(distinct e->>'id') from jsonb_array_elements(new.items) e) <> jsonb_array_length(new.items) then
    raise exception 'Задача включена дважды';
  end if;
  for entry in select * from jsonb_array_elements(new.items) loop
    select * into task from public.worktime_items where id = (entry->>'id')::uuid and user_id = new.user_id for update;
    if not found or task.kind <> 'work' or task.timer_state in ('running','paused')
      or (task.started_at at time zone 'Europe/Moscow')::date not between new.period_start and new.period_end
      or nullif(trim(entry->>'project_name'), '') is null
      or char_length(entry->>'project_name') > 100
      or to_jsonb(jsonb_populate_record(null::public.worktime_items, entry || jsonb_build_object('user_id',new.user_id))) is distinct from to_jsonb(task) then
      raise exception 'Задача счёта изменилась или не завершена. Обновите список';
    end if;
    if exists (select 1 from public.worktime_invoices i where i.items @> jsonb_build_array(jsonb_build_object('id',task.id))) then
      raise exception 'Задача уже включена в другой счёт';
    end if;
  end loop;
  return new;
end $$;
drop trigger if exists worktime_guard_invoice on public.worktime_invoices;
create trigger worktime_guard_invoice before insert or update or delete on public.worktime_invoices for each row execute function public.worktime_guard_invoice();

create or replace function public.worktime_guard_billed_item() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if exists (select 1 from public.worktime_invoices i where i.items @> jsonb_build_array(jsonb_build_object('id',old.id))) then
    raise exception 'Задача уже включена в счёт и сохранена для истории';
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end $$;
drop trigger if exists worktime_guard_billed_item on public.worktime_items;
create trigger worktime_guard_billed_item before update or delete on public.worktime_items for each row execute function public.worktime_guard_billed_item();

alter table public.worktime_projects enable row level security;
alter table public.worktime_items enable row level security;
revoke all on public.worktime_projects, public.worktime_items from public, anon, authenticated;
grant select on public.worktime_projects, public.worktime_items to anon, authenticated;
grant insert, update, delete on public.worktime_projects, public.worktime_items to authenticated;

-- Даже посторонняя разрешающая политика не расширяет границы владельца.
do $$
declare target text;
begin
  foreach target in array array['worktime_projects', 'worktime_items', 'worktime_invoices'] loop
    execute format('drop policy if exists "Owner boundary" on public.%I', target);
    execute format('create policy "Owner boundary" on public.%I as restrictive for all to anon, authenticated
      using (user_id = (select owner_id from public.worktime_settings where singleton))
      with check (user_id = (select owner_id from public.worktime_settings where singleton))', target);
    execute format('drop policy if exists "Read owner data" on public.%I', target);
    execute format('create policy "Read owner data" on public.%I for select to anon, authenticated using (true)', target);
    execute format('drop policy if exists "Owner writes" on public.%I', target);
    execute format('create policy "Owner writes" on public.%I for all to authenticated
      using (auth.uid() = user_id) with check (auth.uid() = user_id)', target);
    execute format('drop policy if exists "Insert boundary" on public.%I', target);
    execute format('create policy "Insert boundary" on public.%I as restrictive for insert to authenticated with check (auth.uid() = user_id)', target);
    execute format('drop policy if exists "Update boundary" on public.%I', target);
    execute format('create policy "Update boundary" on public.%I as restrictive for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id)', target);
    execute format('drop policy if exists "Delete boundary" on public.%I', target);
    execute format('create policy "Delete boundary" on public.%I as restrictive for delete to authenticated using (auth.uid() = user_id)', target);
  end loop;
end $$;

-- Импорт целиком в одной транзакции; существующие ID не перезаписываются.
create or replace function public.worktime_import(payload jsonb) returns void
language plpgsql security invoker set search_path = '' as $$
begin
  if auth.uid() is distinct from (select owner_id from public.worktime_settings where singleton) then
    raise exception 'Only the owner can import';
  end if;
  if jsonb_typeof(payload->'projects') is distinct from 'array'
    or jsonb_typeof(payload->'items') is distinct from 'array' then
    raise exception 'Invalid backup';
  end if;
  if jsonb_array_length(payload->'projects') > 10000 or jsonb_array_length(payload->'items') > 10000 then
    raise exception 'Backup is too large';
  end if;
  insert into public.worktime_projects (id, user_id, name, created_at)
    select id, auth.uid(), name, created_at from jsonb_to_recordset(payload->'projects')
      as p(id uuid, name text, created_at timestamptz)
    on conflict (id) do nothing;
  insert into public.worktime_items (id, user_id, project_id, title, note, kind, done, started_at, ended_at, created_at,
    timer_state, elapsed_ms, running_since, timer_version)
    select id, auth.uid(), project_id, title, coalesce(note, ''), kind, done, started_at, ended_at, created_at,
      coalesce(timer_state, 'manual'), coalesce(elapsed_ms, 0), running_since, coalesce(timer_version, 0)
    from jsonb_to_recordset(payload->'items')
      as i(id uuid, project_id uuid, title text, note text, kind text, done boolean,
        started_at timestamptz, ended_at timestamptz, created_at timestamptz,
        timer_state text, elapsed_ms bigint, running_since timestamptz, timer_version integer)
    on conflict (id) do nothing;
  insert into public.worktime_invoices (id, user_id, period_start, period_end, created_at, paid_at, items)
    select id, auth.uid(), period_start, period_end, created_at, paid_at, items
    from jsonb_to_recordset(coalesce(payload->'invoices','[]'::jsonb))
      as i(id uuid, period_start date, period_end date, created_at timestamptz, paid_at timestamptz, items jsonb)
    where not exists (select 1 from public.worktime_invoices existing where existing.id = i.id);
  if (select count(*) from public.worktime_projects) > 10000 or (select count(*) from public.worktime_items) > 10000 then
    raise exception 'Too many records';
  end if;
end $$;
revoke all on function public.worktime_import(jsonb) from public, anon;
grant execute on function public.worktime_import(jsonb) to authenticated;

-- Время перехода определяет сервер; блокировка и версия защищают от двойных
-- нажатий и устаревших команд с другого устройства.
create or replace function public.worktime_timer_action(item_id uuid, operation text, expected_version integer) returns void
language plpgsql security invoker set search_path = '' as $$
declare
  task public.worktime_items%rowtype;
  moment timestamptz;
  active_ms bigint;
begin
  if auth.uid() is distinct from (select owner_id from public.worktime_settings where singleton) then
    raise exception 'Only the owner can control the timer';
  end if;
  select * into task from public.worktime_items where id = item_id and user_id = auth.uid() for update;
  if not found or expected_version is distinct from task.timer_version
    or task.timer_state not in ('running','paused')
    or operation is null or operation not in ('pause','resume','finish')
    or (operation = 'pause' and task.timer_state <> 'running')
    or (operation = 'resume' and task.timer_state <> 'paused') then
    raise exception 'Timer changed. Refresh the list';
  end if;
  moment := clock_timestamp();
  active_ms := task.elapsed_ms;
  if task.timer_state = 'running' then
    active_ms := active_ms + greatest(0, floor(extract(epoch from (moment - task.running_since)) * 1000))::bigint;
  end if;
  update public.worktime_items set
    elapsed_ms = active_ms,
    timer_state = case operation when 'pause' then 'paused' when 'resume' then 'running' else 'finished' end,
    running_since = case when operation = 'resume' then moment else null end,
    ended_at = case when operation = 'finish' then moment else null end,
    timer_version = timer_version + 1
  where id = item_id;
end $$;
revoke all on function public.worktime_timer_action(uuid, text, integer) from public, anon;
grant execute on function public.worktime_timer_action(uuid, text, integer) to authenticated;

create or replace function public.worktime_create_invoice(invoice_id uuid, date_start date, date_end date, selected_project uuid default null) returns void
language plpgsql security invoker set search_path = '' as $$
declare snapshot jsonb;
begin
  if auth.uid() is distinct from (select owner_id from public.worktime_settings where singleton) then raise exception 'Only the owner can create invoices'; end if;
  if date_start is null or date_end is null or date_end < date_start then raise exception 'Проверьте период счёта'; end if;
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text, 0));
  -- Блокируем выбранные записи до сохранения снимка.
  perform 1 from public.worktime_items t where t.user_id = auth.uid() and t.kind = 'work'
    and t.timer_state not in ('running','paused') and (selected_project is null or t.project_id = selected_project)
    and (t.started_at at time zone 'Europe/Moscow')::date between date_start and date_end order by t.id for update;
  select jsonb_agg((to_jsonb(t) - 'user_id') || jsonb_build_object('project_name',p.name) order by t.started_at,t.id) into snapshot
    from public.worktime_items t join public.worktime_projects p on p.id = t.project_id
    where t.user_id = auth.uid() and t.kind = 'work' and t.timer_state not in ('running','paused')
      and (selected_project is null or t.project_id = selected_project)
      and (t.started_at at time zone 'Europe/Moscow')::date between date_start and date_end
      and not exists (select 1 from public.worktime_invoices i where i.items @> jsonb_build_array(jsonb_build_object('id',t.id)));
  if snapshot is null then raise exception 'Нет завершённых задач для нового счёта'; end if;
  insert into public.worktime_invoices(id,user_id,period_start,period_end,items) values (invoice_id,auth.uid(),date_start,date_end,snapshot);
end $$;
revoke all on function public.worktime_create_invoice(uuid,date,date,uuid) from public, anon;
grant execute on function public.worktime_create_invoice(uuid,date,date,uuid) to authenticated;

create or replace function public.worktime_pay_invoice(invoice_id uuid) returns void
language plpgsql security invoker set search_path = '' as $$
begin
  if auth.uid() is distinct from (select owner_id from public.worktime_settings where singleton) then raise exception 'Only the owner can mark invoices paid'; end if;
  update public.worktime_invoices set paid_at = coalesce(paid_at,clock_timestamp()) where id = invoice_id and user_id = auth.uid();
  if not found then raise exception 'Счёт не найден. Обновите список'; end if;
end $$;
revoke all on function public.worktime_pay_invoice(uuid) from public, anon;
grant execute on function public.worktime_pay_invoice(uuid) to authenticated;
commit;
