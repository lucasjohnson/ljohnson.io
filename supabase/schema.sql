-- Job Application Dashboard — Supabase Schema
-- Run this in the Supabase SQL editor to set up your database

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Jobs table
create table if not exists jobs (
  id uuid primary key default uuid_generate_v4(),
  external_id text unique not null,
  source text not null,
  title text not null,
  company text not null,
  location text default '',
  remote boolean default false,
  visa_sponsorship boolean default false,
  salary text,
  tags text[] default '{}',
  url text not null,
  score integer default 1 check (score between 1 and 5),
  status text default 'new' check (status in ('new', 'prepared', 'approved', 'sent', 'rejected')),
  posted_at date,
  fetched_at date default current_date,
  applied_at timestamptz,
  notes text default '',
  created_at timestamptz default now()
);

-- Applications table
create table if not exists applications (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid references jobs(id) on delete cascade,
  resume_url text,
  cover_letter_url text,
  email_sent_at timestamptz,
  recipient_email text,
  created_at timestamptz default now()
);

-- Indexes for common queries
create index if not exists idx_jobs_status on jobs(status);
create index if not exists idx_jobs_score on jobs(score desc);
create index if not exists idx_jobs_fetched_at on jobs(fetched_at desc);
create index if not exists idx_jobs_external_id on jobs(external_id);
create index if not exists idx_applications_job_id on applications(job_id);

-- Row Level Security (simple: allow all for authenticated users)
alter table jobs enable row level security;
alter table applications enable row level security;

create policy "Allow all for authenticated users" on jobs
  for all using (true) with check (true);

create policy "Allow all for authenticated users" on applications
  for all using (true) with check (true);

-- Allow service role (for cron jobs) full access
-- The service role key bypasses RLS by default in Supabase
