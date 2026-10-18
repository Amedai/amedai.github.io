-- UUID владельца уже заполнен для предоставленного аккаунта.
-- Выполните ВЕСЬ файл в Supabase → SQL Editor → New query → Run.
-- При подключении другого аккаунта измените UUID в строке values (true, ...).
-- Старые долги не удаляются.
-- Список и примечания станут видны всем; изменения доступны только владельцу.
begin;

create table if not exists public.debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  direction text not null check (direction in ('me', 'i')),
  title text not null check (char_length(trim(title)) between 1 and 120),
  amount_cents bigint not null check (amount_cents between 1 and 999999999999),
  person text not null check (char_length(trim(person)) between 1 and 120),
  created_at timestamptz not null default now()
);

alter table public.debts add column if not exists note text not null default '';
alter table public.debts drop constraint if exists debts_note_length;
alter table public.debts add constraint debts_note_length check (char_length(note) <= 2000);
create index if not exists debts_user_created_idx on public.debts(user_id, created_at desc, id);

-- Настройки читаются посетителями, но меняются только через SQL Editor.
create table if not exists public.debt_settings (
  singleton boolean primary key default true check (singleton),
  owner_id uuid not null references auth.users(id)
);

insert into public.debt_settings (singleton, owner_id)
values (true, 'edb177a9-ec4a-4cee-9489-4e2650811dca'::uuid)
on conflict (singleton) do update set owner_id = excluded.owner_id;

alter table public.debt_settings enable row level security;
revoke all on public.debt_settings from public, anon, authenticated;
grant select on public.debt_settings to anon, authenticated;
drop policy if exists "Anyone reads ledger owner" on public.debt_settings;
create policy "Anyone reads ledger owner" on public.debt_settings
  for select to anon, authenticated using (singleton);

alter table public.debts enable row level security;
revoke all on public.debts from public, anon, authenticated;
grant select on public.debts to anon, authenticated;
grant insert, update, delete on public.debts to authenticated;

drop policy if exists "Users manage their own debts" on public.debts;
drop policy if exists "Anyone reads owner debts" on public.debts;
drop policy if exists "Only owner inserts debts" on public.debts;
drop policy if exists "Only owner updates debts" on public.debts;
drop policy if exists "Only owner deletes debts" on public.debts;
drop policy if exists "Ledger owner boundary" on public.debts;

-- Ограничение действует даже при наличии других разрешающих политик.
create policy "Ledger owner boundary" on public.debts as restrictive
  for all to anon, authenticated
  using (user_id = (select owner_id from public.debt_settings where singleton))
  with check (user_id = (select owner_id from public.debt_settings where singleton));

create policy "Anyone reads owner debts" on public.debts
  for select to anon, authenticated
  using (user_id = (select owner_id from public.debt_settings where singleton));

create policy "Only owner inserts debts" on public.debts
  for insert to authenticated
  with check ((select auth.uid()) = user_id
    and user_id = (select owner_id from public.debt_settings where singleton));

create policy "Only owner updates debts" on public.debts
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Only owner deletes debts" on public.debts
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Запрещаем запись чужому аккаунту даже при другой разрешающей политике.
drop policy if exists "Writer must own inserted debt" on public.debts;
create policy "Writer must own inserted debt" on public.debts as restrictive
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Writer must own updated debt" on public.debts;
create policy "Writer must own updated debt" on public.debts as restrictive
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
drop policy if exists "Writer must own deleted debt" on public.debts;
create policy "Writer must own deleted debt" on public.debts as restrictive
  for delete to authenticated using ((select auth.uid()) = user_id);

commit;
