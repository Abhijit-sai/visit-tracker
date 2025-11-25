-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Organizations
create table organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  created_at timestamptz default now()
);

-- Branches
create table branches (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  name text not null,
  code text,
  address text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Admins (linked to Supabase Auth)
create table admins (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  auth_user_id uuid references auth.users(id),
  name text not null,
  email text unique not null,
  role text default 'ADMIN',
  created_at timestamptz default now()
);

-- Employees (Hosts)
create table employees (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  branch_id uuid references branches(id),
  name text not null,
  designation text,
  email text not null,
  phone text,
  requires_host_approval boolean default false,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Visitors
create table visitors (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  full_name text not null,
  company text,
  designation text,
  email text not null,
  phone text,
  email_verified_at timestamptz,
  auth_user_id uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Visits
create type visit_status as enum (
  'INCOMPLETE_PROFILE',
  'PENDING_VERIFICATION',
  'PENDING_APPROVAL',
  'APPROVED',
  'DECLINED',
  'CANCELLED'
);

create type validity_type as enum ('DURATION', 'UNTIL_DATE');
create type created_by_type as enum ('VISITOR', 'ADMIN');

create table visits (
  id uuid primary key default uuid_generate_v4(),
  public_id text unique default substring(replace(uuid_generate_v4()::text, '-', '') from 1 for 8),
  organization_id uuid references organizations(id) not null,
  branch_id uuid references branches(id) not null,
  visitor_id uuid references visitors(id) not null,
  host_employee_id uuid references employees(id) not null,
  purpose text not null,
  purpose_other text,
  scheduled_start_at timestamptz default now(),
  validity_type validity_type default 'DURATION',
  validity_hours integer,
  valid_until timestamptz,
  additional_visitor_count integer default 0,
  additional_visitor_names text,
  status visit_status default 'INCOMPLETE_PROFILE',
  status_reason text,
  requires_host_approval boolean default false,
  email_verification_required boolean default true,
  is_manual_verification boolean default false,
  checkin_at timestamptz,
  checkout_at timestamptz,
  created_by_type created_by_type default 'VISITOR',
  created_by_admin_id uuid references admins(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Visit Status History
create type changed_by_type as enum ('SYSTEM', 'ADMIN', 'HOST', 'VISITOR');

create table visit_status_history (
  id uuid primary key default uuid_generate_v4(),
  visit_id uuid references visits(id) not null,
  from_status visit_status,
  to_status visit_status not null,
  changed_by_type changed_by_type not null,
  changed_by_admin_id uuid references admins(id),
  changed_by_host_email text,
  note text,
  created_at timestamptz default now()
);

-- Attachments
create type attachment_type as enum ('VISITOR_PHOTO', 'ID_PHOTO');

create table attachments (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  visit_id uuid references visits(id) not null,
  visitor_id uuid references visitors(id) not null,
  type attachment_type not null,
  storage_path text not null,
  created_at timestamptz default now()
);

-- Organization Config
create type approval_recipient_type as enum ('HOST', 'SECURITY_EMAIL', 'BOTH');

create table organization_config (
  organization_id uuid primary key references organizations(id),
  approval_required boolean default true,
  approval_recipient approval_recipient_type default 'HOST',
  security_email text,
  email_verification_required boolean default true,
  allow_manual_walkin boolean default true,
  auto_cancel_incomplete_after_hours integer default 24,
  default_validity_options jsonb default '[1, 4, 12, 24]'::jsonb
);

-- Field Config
create table field_config (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  field_key text not null,
  is_visible boolean default true,
  is_required boolean default false,
  help_text text,
  unique(organization_id, field_key)
);

-- Email Templates
create type email_template_type as enum (
  'VISITOR_VERIFICATION',
  'HOST_APPROVAL_REQUEST',
  'VISIT_APPROVED_VISITOR',
  'VISIT_DECLINED_VISITOR'
);

create table email_templates (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  type email_template_type not null,
  subject text not null,
  body text not null,
  is_active boolean default true,
  unique(organization_id, type)
);

-- RLS Policies

-- Enable RLS on all tables
alter table organizations enable row level security;
alter table branches enable row level security;
alter table admins enable row level security;
alter table employees enable row level security;
alter table visitors enable row level security;
alter table visits enable row level security;
alter table visit_status_history enable row level security;
alter table attachments enable row level security;
alter table organization_config enable row level security;
alter table field_config enable row level security;
alter table email_templates enable row level security;

-- Helper function to get current admin org id
create or replace function get_admin_org_id()
returns uuid as $$
  select organization_id from admins where auth_user_id = auth.uid() limit 1;
$$ language sql security definer;

-- Organizations: Admins can view their own org
create policy "Admins can view their own org" on organizations
  for select using (id = get_admin_org_id());

-- Branches: Admins can view/edit their own branches. Public can view active branches.
create policy "Admins can view branches" on branches
  for select using (organization_id = get_admin_org_id());
create policy "Admins can insert branches" on branches
  for insert with check (organization_id = get_admin_org_id());
create policy "Admins can update branches" on branches
  for update using (organization_id = get_admin_org_id());
create policy "Public can view active branches" on branches
  for select using (is_active = true);

-- Admins: Admins can view themselves
create policy "Admins can view themselves" on admins
  for select using (auth_user_id = auth.uid());

-- Employees: Admins can manage. Public can view (for host selection).
create policy "Admins can manage employees" on employees
  for all using (organization_id = get_admin_org_id());
create policy "Public can view active employees" on employees
  for select using (is_active = true);

-- Visitors: Admins can view. Public can insert (creation).
create policy "Admins can view visitors" on visitors
  for select using (organization_id = get_admin_org_id());
create policy "Public can insert visitors" on visitors
  for insert with check (true);
create policy "Public can update own visitor record" on visitors
  for update using (true); -- In real app, would restrict by session/token

-- Visits: Admins can view/manage. Public can insert.
create policy "Admins can manage visits" on visits
  for all using (organization_id = get_admin_org_id());
create policy "Public can insert visits" on visits
  for insert with check (true);
create policy "Public can view own visit" on visits
  for select using (true); -- Needs refinement for security, but ok for v1 kiosk flow

-- Visit Status History: Admins view. System inserts.
create policy "Admins can view history" on visit_status_history
  for select using (visit_id in (select id from visits where organization_id = get_admin_org_id()));
create policy "Everyone can insert history" on visit_status_history
  for insert with check (true);

-- Attachments: Admins view. Public insert.
create policy "Admins can view attachments" on attachments
  for select using (organization_id = get_admin_org_id());
create policy "Public can insert attachments" on attachments
  for insert with check (true);

-- Configs: Admins manage. Public read.
create policy "Admins manage org config" on organization_config
  for all using (organization_id = get_admin_org_id());
create policy "Public read org config" on organization_config
  for select using (true);

create policy "Admins manage field config" on field_config
  for all using (organization_id = get_admin_org_id());
create policy "Public read field config" on field_config
  for select using (true);

create policy "Admins manage email templates" on email_templates
  for all using (organization_id = get_admin_org_id());
