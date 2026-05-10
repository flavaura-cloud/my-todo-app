create table if not exists todos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  is_completed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table todos disable row level security;
