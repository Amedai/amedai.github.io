-- Выполните один раз в SQL Editor своего проекта Supabase.
create table if not exists public.debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  direction text not null check (direction in ('me', 'i')),
  title text not null check (char_length(trim(title)) between 1 and 120),
  amount_cents bigint not null check (amount_cents between 1 and 999999999999),
  person text not null check (char_length(trim(person)) between 1 and 120),
  created_at timestamptz not null default now()
);

create index if not exists debts_user_created_idx on public.debts(user_id, created_at desc, id);

alter table public.debts enable row level security;
revoke all on public.debts from anon;
grant select, insert, update, delete on public.debts to authenticated;

drop policy if exists "Users manage their own debts" on public.debts;
create policy "Users manage their own debts" on public.debts
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
