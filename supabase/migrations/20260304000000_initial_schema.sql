-- ═══════════════════════════════════════════
-- VERD Database Schema Migration
-- ═══════════════════════════════════════════

-- 1. Create Profiles Table (extends Supabase Auth)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  display_name text,
  role text check (role in ('farmer', 'admin')),
  location jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Profiles
alter table public.profiles enable row level security;

-- Profile Policies
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check ( auth.uid() = id );


-- 2. Create Scans Table
create table if not exists public.scans (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
  condition text not null,
  severity text not null,
  confidence integer not null,
  color text,
  description text,
  recommendations jsonb,
  file_name text,
  file_size text,
  ml_data jsonb,
  soil_metrics jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS for Scans
alter table public.scans enable row level security;

-- Scan Policies
drop policy if exists "Users can view their own scans" on public.scans;
create policy "Users can view their own scans"
  on public.scans for select
  using ( auth.uid() = user_id );

drop policy if exists "Admins can view all scans" on public.scans;
create policy "Admins can view all scans"
  on public.scans for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

drop policy if exists "Users can insert their own scans" on public.scans;
create policy "Users can insert their own scans"
  on public.scans for insert
  with check ( auth.uid() = user_id );

drop policy if exists "Users can delete their own scans" on public.scans;
create policy "Users can delete their own scans"
  on public.scans for delete
  using ( auth.uid() = user_id );


-- 3. Automatic Profile Creation on Signup Trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, role)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'display_name',
    coalesce(new.raw_user_meta_data->>'role', 'farmer')
  );
  return new;
end;
$$;

-- Trigger the function every time a user is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
