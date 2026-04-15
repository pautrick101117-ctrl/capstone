create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  middle_name text default '',
  last_name text not null,
  email text not null unique,
  password_hash text not null,
  address text default '',
  contact_number text default '',
  valid_id_url text,
  role text not null default 'resident',
  status text not null default 'pending',
  email_verified boolean not null default false,
  email_verified_at timestamptz,
  verification_provider text default 'gmail_app_password',
  has_voted boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists verification_codes (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  code text not null,
  sent_to text,
  provider text not null default 'gmail_app_password',
  method text not null default 'email',
  sent_at timestamptz not null default now(),
  expires_at timestamptz not null,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

alter table users add column if not exists email_verified_at timestamptz;
alter table users add column if not exists verification_provider text default 'gmail_app_password';
alter table verification_codes add column if not exists sent_to text;
alter table verification_codes add column if not exists provider text default 'gmail_app_password';
alter table verification_codes add column if not exists method text default 'email';
alter table verification_codes add column if not exists sent_at timestamptz not null default now();
alter table verification_codes add column if not exists verified_at timestamptz;

create table if not exists elections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  status text not null default 'draft',
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists election_options (
  id uuid primary key default gen_random_uuid(),
  election_id uuid not null references elections(id) on delete cascade,
  name text not null,
  description text default '',
  votes_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists votes (
  id uuid primary key default gen_random_uuid(),
  election_id uuid not null references elections(id) on delete cascade,
  option_id uuid not null references election_options(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (election_id, user_id)
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  title text not null,
  body text not null,
  kind text not null default 'info',
  broadcast boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  actor_role text,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists landing_content (
  key_name text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists complaints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  resident_name text not null,
  complaint_type text not null,
  details text default '',
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table complaints add column if not exists details text default '';
alter table complaints add column if not exists user_id uuid references users(id) on delete set null;
update users set role = 'admin' where role in ('super_admin', 'staff');

create table if not exists officials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  position text not null,
  term text not null default '2023-2026',
  contact text default '',
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists clearances (
  id uuid primary key default gen_random_uuid(),
  resident_name text not null,
  type text not null,
  request_date date not null default current_date,
  issued_date date,
  status text not null default 'pending',
  notes text default '',
  created_at timestamptz not null default now()
);

create table if not exists census_households (
  id uuid primary key default gen_random_uuid(),
  household_name text not null,
  purok text not null,
  members integer not null default 1,
  house_number text not null,
  status text not null default 'active',
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

insert into officials (name, position, term, contact, status)
values
  ('Brgy. Capt. Jose Magtoto', 'Barangay Captain', '2023-2026', '09182000000', 'active'),
  ('Kagawad Maria Lim', 'Kagawad', '2023-2026', '09182000001', 'active')
on conflict do nothing;

insert into clearances (resident_name, type, request_date, issued_date, status, notes)
values
  ('Maria Santos', 'Business Permit', current_date - interval '2 day', current_date - interval '1 day', 'approved', ''),
  ('Juan dela Cruz', 'Barangay ID', current_date - interval '1 day', null, 'pending', '')
on conflict do nothing;

insert into census_households (household_name, purok, members, house_number, status)
values
  ('Santos Household', 'Purok 1', 6, '#70', 'active'),
  ('Dela Cruz Household', 'Purok 2', 4, '#71', 'for update')
on conflict do nothing;

insert into landing_content (key_name, value)
values
  ('hero', '{"title":"Welcome to Barangay Iba!","description":"A Barangay Portal System is an online platform designed to optimize services and transactions within local barangay."}'),
  ('fund_projects', '["Project: Preparation for the Upcoming Basketball and Volleyball League","Project: Kontra Dengue Clean-Up Drive","Project: Nutrisyon para sa Kabataan","Project: Medical Mission and Free Check-Up"]'),
  ('contact', '{"phone":"639123456789","email":"barangayiba@gmail.com","facebook":"fb.com/BarangayIBAOfficialPage","address":"Barangay Iba, Silang, Cavite"}')
on conflict (key_name) do nothing;
