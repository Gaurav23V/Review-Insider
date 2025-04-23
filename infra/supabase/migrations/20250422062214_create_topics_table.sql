create table if not exists topics (
  topic_id   uuid        primary key default gen_random_uuid(),
  label      text        not null,
  review_ids uuid[]      not null,         -- array of review IDs
  created_at timestamptz not null default now()
);
