create extension if not exists "pgcrypto";

drop trigger if exists profiles_set_updated_at on public.profiles;
drop trigger if exists devices_set_updated_at on public.devices;
drop trigger if exists authorized_cards_set_updated_at on public.authorized_cards;
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists create_device_status_after_insert on public.devices;

drop function if exists public.set_updated_at();
drop function if exists public.handle_new_user();
drop function if exists public.is_admin(uuid);
drop function if exists public.create_device_status();

drop table if exists public.door_events cascade;
drop table if exists public.authorized_cards cascade;
drop table if exists public.device_status cascade;
drop table if exists public.devices cascade;
drop table if exists public.profiles cascade;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'viewer' check (role in ('admin', 'viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.devices (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  device_code text not null unique,
  secret_token text not null unique,
  location text,
  is_active boolean not null default true,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.device_status (
  device_id uuid primary key references public.devices(id) on delete cascade,
  door_state text not null default 'unknown' check (door_state in ('locked', 'unlocked', 'alarm', 'unknown')),
  last_event_id uuid,
  last_event_type text check (
    last_event_type in (
      'SYSTEM_READY',
      'RFID_OK',
      'RFID_INVALID',
      'OTP_SENT',
      'OTP_FAILED',
      'ACCESS_GRANTED',
      'ACCESS_DENIED',
      'DOOR_UNLOCKED',
      'DOOR_LOCKED',
      'ALARM',
      'RESET',
      'CANCELLED'
    )
  ),
  last_message text,
  last_seen_at timestamptz,
  is_online boolean not null default false,
  updated_at timestamptz not null default now()
);

create table public.authorized_cards (
  id uuid primary key default gen_random_uuid(),
  device_id uuid references public.devices(id) on delete set null,
  uid text not null unique,
  label text not null,
  owner_name text,
  is_enabled boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.door_events (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null references public.devices(id) on delete cascade,
  event_type text not null check (
    event_type in (
      'SYSTEM_READY',
      'RFID_OK',
      'RFID_INVALID',
      'OTP_SENT',
      'OTP_FAILED',
      'ACCESS_GRANTED',
      'ACCESS_DENIED',
      'DOOR_UNLOCKED',
      'DOOR_LOCKED',
      'ALARM',
      'RESET',
      'CANCELLED'
    )
  ),
  uid text,
  message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.device_status
  add constraint device_status_last_event_id_fkey
  foreign key (last_event_id)
  references public.door_events(id)
  on delete set null;

create index devices_last_seen_idx on public.devices(last_seen_at desc);
create index authorized_cards_uid_idx on public.authorized_cards(uid);
create index door_events_device_idx on public.door_events(device_id, created_at desc);
create index door_events_type_idx on public.door_events(event_type, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger devices_set_updated_at
before update on public.devices
for each row execute function public.set_updated_at();

create trigger authorized_cards_set_updated_at
before update on public.authorized_cards
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'viewer')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1
    from public.profiles
    where id = uid and role = 'admin'
  );
$$;

create or replace function public.create_device_status()
returns trigger
language plpgsql
as $$
begin
  insert into public.device_status (device_id)
  values (new.id)
  on conflict (device_id) do nothing;
  return new;
end;
$$;

create trigger create_device_status_after_insert
after insert on public.devices
for each row execute function public.create_device_status();

alter table public.profiles enable row level security;
alter table public.devices enable row level security;
alter table public.device_status enable row level security;
alter table public.authorized_cards enable row level security;
alter table public.door_events enable row level security;

create policy "profiles_select_own"
  on public.profiles
  for select
  using (auth.uid() = id or public.is_admin(auth.uid()));

create policy "profiles_update_own"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "admin_manage_devices"
  on public.devices
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "admin_manage_device_status"
  on public.device_status
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "admin_manage_authorized_cards"
  on public.authorized_cards
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "admin_read_events"
  on public.door_events
  for select
  using (public.is_admin(auth.uid()));

create policy "admin_manage_events"
  on public.door_events
  for insert
  with check (public.is_admin(auth.uid()));

insert into public.profiles (id, full_name, role)
select id, raw_user_meta_data->>'full_name', 'viewer'
from auth.users
on conflict (id) do nothing;

-- Promote an auth user to admin after sign-up:
-- update public.profiles set role = 'admin' where id = 'YOUR_AUTH_USER_UUID';
