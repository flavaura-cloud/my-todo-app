-- Supabase SQL Editor에서 실행하세요

create table if not exists todos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

-- RLS(Row Level Security) 비활성화 (개인 프로젝트용)
alter table todos disable row level security;
