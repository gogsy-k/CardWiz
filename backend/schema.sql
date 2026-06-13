-- RewardXtra — Postgres schema (Phase 8)
-- Supabase SQL editor mein paste karke run karo (ya backend khud bhi
-- startup pe CREATE TABLE IF NOT EXISTS chala leta hai).
--
-- PRINCIPLE: full card number / CVV / bank login YAHAN BHI kabhi nahi.
-- Sirf account + plan + synced wallet (card type/nickname/last-4/due-date).

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

-- Cards — cross-device synced wallet (Phase 10).
-- last4 SIRF; poora card number / CVV / expiry KABHI nahi.
create table if not exists cards (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references users(id) on delete cascade,
  client_id     text not null,                 -- local wallet entry uuid (device-stable)
  card_id       text not null,                 -- catalog card e.g. 'hdfc-millennia'
  nickname      text,
  last4         text,                          -- ONLY last 4 digits
  due_day       int,                           -- 1..31
  reminder_days_before int,
  updated_at    timestamptz not null default now(),
  unique (user_id, client_id)
);

create index if not exists cards_user_idx on cards (user_id);

-- Payments — premium upgrade records (Phase 11, Razorpay). Koi card data nahi.
create table if not exists payments (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references users(id) on delete cascade,
  rzp_link_id    text,                          -- Razorpay payment link id (plink_...)
  rzp_payment_id text,                          -- Razorpay payment id (pay_...)
  amount         int not null,                  -- paise
  status         text not null default 'created', -- created | paid | failed
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists payments_user_idx on payments (user_id);
create index if not exists payments_link_idx on payments (rzp_link_id);
