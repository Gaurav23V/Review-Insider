-- Migration file: <timestamp>_create_weekly_summaries_table.sql

create table if not exists weekly_summaries (
  id           uuid        primary key default gen_random_uuid(),
  summary_text text        not null,
  generated_at timestamptz not null default now()
);

-- Optional: Add an index for faster retrieval of the latest summary
create index if not exists idx_weekly_summaries_generated_at_desc on weekly_summaries(generated_at desc);
