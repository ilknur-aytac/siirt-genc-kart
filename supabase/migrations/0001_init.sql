-- Siirt Genç Kart — initial schema, RLS, storage, and helpers
-- Run in the Supabase SQL editor or via the CLI.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.app_role as enum ('student', 'business', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.application_status as enum ('draft', 'pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.student_status as enum ('active', 'expired', 'suspended');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.business_user_role as enum ('owner', 'staff');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null default 'student',
  first_name text not null default '',
  last_name text not null default '',
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  university text not null,
  student_number text not null,
  department text,
  document_path text,
  status public.application_status not null default 'pending',
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  application_id uuid references public.student_applications (id),
  membership_number text not null unique,
  university text not null,
  department text,
  status public.student_status not null default 'active',
  valid_from date not null default current_date,
  valid_until date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'genel',
  address text,
  city text not null default 'Ankara',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_users (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.business_user_role not null default 'staff',
  created_at timestamptz not null default now(),
  unique (business_id, user_id)
);

create table if not exists public.discounts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  percentage numeric(5, 2) not null check (percentage > 0 and percentage <= 100),
  description text,
  is_active boolean not null default true,
  valid_from date,
  valid_until date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.qr_tokens (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  token text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.redemptions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete restrict,
  business_id uuid not null references public.businesses (id) on delete restrict,
  business_user_id uuid references public.business_users (id) on delete set null,
  discount_id uuid references public.discounts (id) on delete set null,
  percentage numeric(5, 2) not null,
  qr_token_id uuid references public.qr_tokens (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index if not exists idx_profiles_role on public.profiles (role);
create index if not exists idx_applications_user on public.student_applications (user_id);
create index if not exists idx_applications_status on public.student_applications (status);
create index if not exists idx_students_user on public.students (user_id);
create index if not exists idx_students_status on public.students (status);
create index if not exists idx_business_users_user on public.business_users (user_id);
create index if not exists idx_business_users_business on public.business_users (business_id);
create index if not exists idx_discounts_business on public.discounts (business_id);
create index if not exists idx_qr_tokens_token on public.qr_tokens (token);
create index if not exists idx_qr_tokens_student on public.qr_tokens (student_id);
create index if not exists idx_qr_tokens_expires on public.qr_tokens (expires_at);
create index if not exists idx_redemptions_student on public.redemptions (student_id);
create index if not exists idx_redemptions_business on public.redemptions (business_id);
create index if not exists idx_redemptions_created on public.redemptions (created_at desc);
create index if not exists idx_audit_created on public.audit_logs (created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_applications_updated on public.student_applications;
create trigger trg_applications_updated before update on public.student_applications
for each row execute function public.set_updated_at();

drop trigger if exists trg_students_updated on public.students;
create trigger trg_students_updated before update on public.students
for each row execute function public.set_updated_at();

drop trigger if exists trg_businesses_updated on public.businesses;
create trigger trg_businesses_updated before update on public.businesses
for each row execute function public.set_updated_at();

drop trigger if exists trg_discounts_updated on public.discounts;
create trigger trg_discounts_updated before update on public.discounts
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- New auth user → profile
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, first_name, last_name)
  values (
    new.id,
    coalesce((new.raw_user_meta_data->>'role')::public.app_role, 'student'),
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Membership number helper
-- ---------------------------------------------------------------------------
create or replace function public.next_membership_number()
returns text
language plpgsql
as $$
declare
  n text;
begin
  loop
    n := 'SGK-' || lpad(floor(random() * 1000000)::int::text, 6, '0');
    exit when not exists (select 1 from public.students where membership_number = n);
  end loop;
  return n;
end;
$$;

-- ---------------------------------------------------------------------------
-- Role helpers (security definer, avoid RLS recursion)
-- ---------------------------------------------------------------------------
create or replace function public.current_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.current_business_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select business_id
  from public.business_users
  where user_id = auth.uid()
  limit 1;
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.student_applications enable row level security;
alter table public.students enable row level security;
alter table public.businesses enable row level security;
alter table public.business_users enable row level security;
alter table public.discounts enable row level security;
alter table public.qr_tokens enable row level security;
alter table public.redemptions enable row level security;
alter table public.audit_logs enable row level security;

-- profiles
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select p.role from public.profiles p where p.id = auth.uid()));

create policy "profiles_admin_all"
  on public.profiles for all
  using (public.is_admin())
  with check (public.is_admin());

-- student applications
create policy "applications_select_own_or_admin"
  on public.student_applications for select
  using (user_id = auth.uid() or public.is_admin());

create policy "applications_insert_own"
  on public.student_applications for insert
  with check (user_id = auth.uid());

create policy "applications_update_own_draft_pending"
  on public.student_applications for update
  using (user_id = auth.uid() and status in ('draft', 'pending'))
  with check (user_id = auth.uid());

create policy "applications_admin_all"
  on public.student_applications for all
  using (public.is_admin())
  with check (public.is_admin());

-- students: owners and admins; businesses never read the full table via RLS
create policy "students_select_own_or_admin"
  on public.students for select
  using (user_id = auth.uid() or public.is_admin());

create policy "students_admin_write"
  on public.students for all
  using (public.is_admin())
  with check (public.is_admin());

-- businesses: public catalog for authenticated users; admin writes
create policy "businesses_select_authenticated"
  on public.businesses for select
  to authenticated
  using (is_active = true or public.is_admin() or id = public.current_business_id());

create policy "businesses_admin_write"
  on public.businesses for all
  using (public.is_admin())
  with check (public.is_admin());

-- business_users
create policy "business_users_select_own_or_admin"
  on public.business_users for select
  using (user_id = auth.uid() or public.is_admin());

create policy "business_users_admin_write"
  on public.business_users for all
  using (public.is_admin())
  with check (public.is_admin());

-- discounts
create policy "discounts_select"
  on public.discounts for select
  to authenticated
  using (
    is_active = true
    or public.is_admin()
    or business_id = public.current_business_id()
  );

create policy "discounts_admin_write"
  on public.discounts for all
  using (public.is_admin())
  with check (public.is_admin());

-- qr_tokens: students insert/select own; never readable by businesses via client
create policy "qr_tokens_student_insert"
  on public.qr_tokens for insert
  with check (
    exists (
      select 1 from public.students s
      where s.id = student_id and s.user_id = auth.uid()
    )
  );

create policy "qr_tokens_student_select"
  on public.qr_tokens for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.students s
      where s.id = student_id and s.user_id = auth.uid()
    )
  );

create policy "qr_tokens_admin_all"
  on public.qr_tokens for all
  using (public.is_admin())
  with check (public.is_admin());

-- redemptions
create policy "redemptions_student_select"
  on public.redemptions for select
  using (
    public.is_admin()
    or exists (select 1 from public.students s where s.id = student_id and s.user_id = auth.uid())
    or business_id = public.current_business_id()
  );

create policy "redemptions_admin_all"
  on public.redemptions for all
  using (public.is_admin())
  with check (public.is_admin());

-- audit logs: admin only
create policy "audit_admin_select"
  on public.audit_logs for select
  using (public.is_admin());

create policy "audit_admin_insert"
  on public.audit_logs for insert
  with check (public.is_admin() or actor_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Storage: private student documents
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('student-documents', 'student-documents', false)
on conflict (id) do nothing;

create policy "student_docs_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'student-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "student_docs_select_own_or_admin"
  on storage.objects for select
  using (
    bucket_id = 'student-documents'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or public.is_admin()
    )
  );

create policy "student_docs_delete_own_or_admin"
  on storage.objects for delete
  using (
    bucket_id = 'student-documents'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or public.is_admin()
    )
  );

-- ---------------------------------------------------------------------------
-- Server-side QR validation (service role / security definer)
-- Businesses never receive the student UUID through this function.
-- ---------------------------------------------------------------------------
create or replace function public.validate_qr_token(p_token text)
returns table (
  token_id uuid,
  first_name text,
  last_name text,
  university text,
  avatar_url text,
  membership_valid boolean,
  valid_until date,
  discount_percentage numeric,
  discount_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_business uuid;
begin
  if auth.uid() is null then
    raise exception 'unauthorized';
  end if;

  v_business := public.current_business_id();
  if v_business is null and not public.is_admin() then
    raise exception 'forbidden';
  end if;

  return query
  select
    t.id,
    p.first_name,
    p.last_name,
    st.university,
    p.avatar_url,
    (st.status = 'active' and st.valid_until >= current_date) as membership_valid,
    st.valid_until,
    d.percentage,
    d.id
  from public.qr_tokens t
  join public.students st on st.id = t.student_id
  join public.profiles p on p.id = st.user_id
  left join lateral (
    select disc.id, disc.percentage
    from public.discounts disc
    where disc.business_id = coalesce(v_business, disc.business_id)
      and disc.is_active = true
      and (disc.valid_from is null or disc.valid_from <= current_date)
      and (disc.valid_until is null or disc.valid_until >= current_date)
    order by disc.percentage desc
    limit 1
  ) d on true
  where t.token = p_token
    and t.used_at is null
    and t.expires_at > now()
  limit 1;
end;
$$;

revoke all on function public.validate_qr_token(text) from public;
grant execute on function public.validate_qr_token(text) to authenticated;

create or replace function public.apply_discount(p_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_business uuid;
  v_bu uuid;
  v_student uuid;
  v_token_id uuid;
  v_discount_id uuid;
  v_pct numeric;
  v_redemption uuid;
begin
  if auth.uid() is null then
    raise exception 'unauthorized';
  end if;

  select bu.id, bu.business_id into v_bu, v_business
  from public.business_users bu
  where bu.user_id = auth.uid()
  limit 1;

  if v_business is null then
    raise exception 'forbidden';
  end if;

  select t.id, t.student_id into v_token_id, v_student
  from public.qr_tokens t
  join public.students st on st.id = t.student_id
  where t.token = p_token
    and t.used_at is null
    and t.expires_at > now()
    and st.status = 'active'
    and st.valid_until >= current_date
  for update of t;

  if v_token_id is null then
    raise exception 'invalid_token';
  end if;

  select d.id, d.percentage into v_discount_id, v_pct
  from public.discounts d
  where d.business_id = v_business
    and d.is_active = true
    and (d.valid_from is null or d.valid_from <= current_date)
    and (d.valid_until is null or d.valid_until >= current_date)
  order by d.percentage desc
  limit 1;

  if v_pct is null then
    raise exception 'no_discount';
  end if;

  update public.qr_tokens set used_at = now() where id = v_token_id;

  insert into public.redemptions (
    student_id, business_id, business_user_id, discount_id, percentage, qr_token_id
  ) values (
    v_student, v_business, v_bu, v_discount_id, v_pct, v_token_id
  ) returning id into v_redemption;

  insert into public.audit_logs (actor_id, action, entity, entity_id, metadata)
  values (
    auth.uid(),
    'redemption.create',
    'redemptions',
    v_redemption,
    jsonb_build_object('business_id', v_business, 'percentage', v_pct)
  );

  return v_redemption;
end;
$$;

revoke all on function public.apply_discount(text) from public;
grant execute on function public.apply_discount(text) to authenticated;
