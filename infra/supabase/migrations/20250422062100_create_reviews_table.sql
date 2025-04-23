create table if not exists reviews (
  id           uuid        primary key default gen_random_uuid(),
  text         text        not null,
  review_date  timestamp   not null,
  metadata     jsonb       default '{}'::jsonb,
  created_at   timestamptz not null default now()
);
