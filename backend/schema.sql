-- RewardXtra — Postgres schema (Phase 8)
-- Supabase SQL editor mein paste karke run karo (ya backend khud bhi
-- startup pe CREATE TABLE IF NOT EXISTS chala leta hai).
--
-- PRINCIPLE: full card number / CVV / bank login YAHAN BHI kabhi nahi.
-- Sirf account + plan. Cards/payments ki tables aane wale phases mein.

create table if not exists users (
  id          uuid primary key default gen_random_uuid(),
  google_id   text unique not null,          -- Google ka 'sub' (stable user id)
  email       text not null,
  name        text,
  picture     text,
  plan        text not null default 'free',  -- 'free' | 'premium'
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- email pe lookup tez karne ke liye (future)
create index if not exists users_email_idx on users (email);
