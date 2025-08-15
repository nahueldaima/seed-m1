-- Extensions
create extension if not exists "pgcrypto"; -- for gen_random_uuid()

-- RBAC System (integrates with Supabase Auth) ---------------

create table groups (
  id   uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  filters text[] default null, -- Array of filter strings for permission scoping
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create table permissions (
  id   serial primary key,
  code text not null unique,
  description text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create table user_groups (
  user_id  uuid references auth.users on delete cascade,
  group_id uuid references groups on delete cascade,
  primary key (user_id, group_id)
);

create table group_permissions (
  group_id uuid references groups on delete cascade,
  perm_id  int  references permissions on delete cascade,
  primary key (group_id, perm_id)
);

-- User profiles (extends Supabase Auth users)
create table user_profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  is_superadmin boolean default false,
  mongo_filters jsonb default '{}', -- filters from MongoDB collections
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- MongoDB collection mappings (dynamic configuration)
create table mongo_collections (
  id uuid primary key default gen_random_uuid(),
  collection_key text not null unique, -- Key used in code/API (e.g. 'centers')
  mongo_collection_name text not null, -- Actual MongoDB collection name
  description text,
  search_fields jsonb default '[]', -- Array of field names to search in MongoDB
  display_field text not null, -- Field to display in UI dropdowns
  enabled boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Processes & Job Runs --------------------------------------
create type process_run_status as enum ('STARTED','RUNNING','SUCCESS','FAIL','WARNING');
create type process_events_status as enum ('FAIL', 'WARNING', 'SUCCESS');
create type environment as enum ('develop', 'uat', 'demo', 'production', 'staging', 'test');


create table processes (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  description text,
  default_meta jsonb,
  mongo_filters jsonb default '{}', -- reference to MongoDB filter collections
  created_at  timestamptz default now(),
  account     text,
  updated_at  timestamptz default now(),
  log_group   text,
  log_stream  text,
  environment environment,
  cron_details text
);

create table processes_runs (
  id          uuid primary key default gen_random_uuid(),
  uuid        text not null unique,
  environment environment,
  account     text,
  process_id  uuid references processes on delete cascade,
  filters     jsonb default '[]', -- values from MongoDB collections
  status      process_run_status default 'STARTED',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  duration_ms integer,
  meta        jsonb default '{}',
  created_by  uuid references auth.users,
  finished boolean default false
);


create table processes_events (
  id             uuid primary key default gen_random_uuid(),
  process_run_id uuid references processes_runs on delete cascade,
  uuid           text,
  thread_id      text,
  environment    environment,
  last_event     boolean not null default false,
  created_at     timestamptz default now(),
  message        text,
  status         process_events_status not null,
  details        jsonb default '{}'
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_groups_updated_at 
    BEFORE UPDATE ON groups 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_permissions_updated_at 
    BEFORE UPDATE ON permissions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mongo_collections_updated_at 
    BEFORE UPDATE ON mongo_collections 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_processes_updated_at 
    BEFORE UPDATE ON processes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_processes_runs_updated_at 
    BEFORE UPDATE ON processes_runs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();


-- Indexes for performance
create index idx_user_groups_user_id on user_groups(user_id);
create index idx_user_groups_group_id on user_groups(group_id);
create index idx_group_permissions_group_id on group_permissions(group_id);
create index idx_group_permissions_perm_id on group_permissions(perm_id);
create index idx_processes_runs_process_id on processes_runs(process_id);
create index idx_processes_runs_created_at on processes_runs(created_at);
create index idx_processes_runs_status on processes_runs(status);
create index idx_processes_runs_uuid on processes_runs(uuid);
create index idx_processes_runs_environment on processes_runs(environment);
create index idx_processes_runs_account on processes_runs(account);
create index idx_processes_events_process_run_id on processes_events(process_run_id);
create index idx_processes_events_uuid on processes_events(uuid);
create index idx_processes_events_thread_id on processes_events(thread_id);
create index idx_processes_events_last_event on processes_events(last_event) where last_event = true;
create index idx_user_profiles_is_superadmin on user_profiles(is_superadmin) where is_superadmin = true;

-- Row Level Security (RLS)
alter table groups enable row level security;
alter table permissions enable row level security;
alter table user_groups enable row level security;
alter table group_permissions enable row level security;
alter table user_profiles enable row level security;
alter table mongo_collections enable row level security;
alter table processes enable row level security;
alter table processes_runs enable row level security;
alter table processes_events enable row level security;

-- Delete any existing policies
DROP POLICY IF EXISTS "AuthUsersCanAccess" ON public.groups;
DROP POLICY IF EXISTS "AuthUsersCanAccess" ON public.permissions;
DROP POLICY IF EXISTS "AuthUsersCanAccess" ON public.user_groups;
DROP POLICY IF EXISTS "AuthUsersCanAccess" ON public.group_permissions;
DROP POLICY IF EXISTS "AuthUsersCanAccess" ON public.user_profiles;
DROP POLICY IF EXISTS "AuthUsersCanAccess" ON public.mongo_collections;
DROP POLICY IF EXISTS "AuthUsersCanAccess" ON public.processes;
DROP POLICY IF EXISTS "AuthUsersCanAccess" ON public.processes_runs;
DROP POLICY IF EXISTS "AuthUsersCanAccess" ON public.processes_events;

-- Basic RLS policies (can be customized based on requirements)

-- Groups: Users can read groups they belong to, admins can manage
CREATE POLICY "AuthUsersCanAccess" ON "public"."groups"
FOR ALL
TO authenticated
USING (true);

CREATE POLICY "AuthUsersCanAccess" ON "public"."permissions"
FOR ALL
TO authenticated
USING (true);

CREATE POLICY "AuthUsersCanAccess" ON "public"."user_groups"
FOR ALL
TO authenticated
USING (true);

CREATE POLICY "AuthUsersCanAccess" ON "public"."group_permissions"
FOR ALL
TO authenticated
USING (true);

CREATE POLICY "AuthUsersCanAccess" ON "public"."user_profiles"
FOR ALL
TO authenticated
USING (true);

CREATE POLICY "AuthUsersCanAccess" ON "public"."mongo_collections"
FOR ALL
TO authenticated
USING (true);

CREATE POLICY "AuthUsersCanAccess" ON "public"."processes"
FOR ALL
TO authenticated
USING (true);

CREATE POLICY "AuthUsersCanAccess" ON "public"."processes_runs"
FOR ALL
TO authenticated
USING (true);

CREATE POLICY "AuthUsersCanAccess" ON "public"."processes_events"
FOR ALL
TO authenticated
USING (true);