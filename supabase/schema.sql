-- Warrior Identity Academy — Supabase schema (mirror of lib/domain/types.ts)
-- Not applied by the app yet: the Supabase repository driver is a stub.
-- Every feature table carries warrior_id → warriors(id) so all data is namespaced per warrior.

create extension if not exists "pgcrypto";

-- enums ----------------------------------------------------------------
create type theme_id as enum ('arcane', 'ember', 'gilded');
create type locale as enum ('en', 'he');
create type domain as enum ('body', 'mind', 'spirit', 'relationships', 'finance', 'purpose');
create type onboarding_step as enum (
  'commitment', 'ideal-selves', 'future-biography', 'attractions',
  'emergency-kit', 'life-rules', 'first-practice'
);
create type task_kind as enum ('anchor', 'major', 'side');
create type task_schedule as enum ('daily', 'once');
create type xp_source as enum ('task', 'journal', 'reflection', 'onboarding', 'bonus', 'mvw');
create type reflection_cadence as enum ('weekly', 'monthly', 'quarterly');
create type ai_origin as enum ('internal', 'external');
create type emergency_kit_kind as enum (
  'passage', 'film', 'poem', 'prayer', 'song', 'speech', 'letter', 'scripture', 'quote'
);

-- app settings (singleton per auth user; auth not wired in the MVP) -----
create table app_settings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid,                         -- future: auth.users(id)
  locale locale not null default 'en',
  active_warrior_id text,
  intro_seen boolean not null default false,
  first_launch_at timestamptz,
  updated_at timestamptz not null default now()
);

-- warriors ---------------------------------------------------------------
create table warriors (
  id text primary key,
  owner_id uuid,                         -- future: auth.users(id)
  name text not null,
  epithet text not null default '',
  archetype text not null default 'warrior',
  theme theme_id not null default 'arcane',
  sigil text not null default '⚔️',
  seed boolean not null default false,
  active_ideal_self_id text,
  quarterly_focus domain,
  streak_current int not null default 0,
  streak_best int not null default 0,
  streak_last_active_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ideal selves -----------------------------------------------------------
create table ideal_selves (
  id text primary key,
  warrior_id text not null references warriors(id) on delete cascade,
  name text not null,
  tagline text not null default '',
  description text not null default '',
  traits text[] not null default '{}',
  theme theme_id not null default 'arcane',
  is_active boolean not null default false,
  refined jsonb,      -- AiRefinement {text, provider, createdAt, origin}
  translated jsonb,   -- AiTranslation {locale, text, provider, createdAt, origin}
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index ideal_selves_warrior_idx on ideal_selves(warrior_id);

-- onboarding state (one row per warrior) ---------------------------------
create table onboarding (
  id text primary key,                   -- == warrior_id
  warrior_id text not null unique references warriors(id) on delete cascade,
  current_step onboarding_step not null default 'commitment',
  completed_steps onboarding_step[] not null default '{}',
  completed_at timestamptz,
  commitment jsonb,        -- Commitment
  future_biography jsonb,  -- FutureBiography
  attractions jsonb,       -- Attractions {receptive[], participatory[], insight}
  life_rules jsonb,        -- LifeRules {mustAvoid[], mustHave[]}
  emergency_kit jsonb,     -- EmergencyKit {items[{id,title,kind,url,note}]}
  first_practice jsonb,    -- FirstPractice
  extra jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- tasks ------------------------------------------------------------------
create table tasks (
  id text primary key,
  warrior_id text not null references warriors(id) on delete cascade,
  kind task_kind not null,
  title text not null,
  notes text,
  domain domain not null,
  xp_reward int not null default 10,
  schedule task_schedule not null default 'daily',
  due_date date,
  completions date[] not null default '{}',
  archived boolean not null default false,
  system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index tasks_warrior_idx on tasks(warrior_id);

-- xp events --------------------------------------------------------------
create table xp_events (
  id text primary key,
  warrior_id text not null references warriors(id) on delete cascade,
  amount int not null,
  base_amount int not null,
  multiplier numeric(4,2) not null default 1,
  source xp_source not null,
  ref_id text,
  domain domain,
  date date not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index xp_events_warrior_date_idx on xp_events(warrior_id, date);

-- minimum viable weeks ---------------------------------------------------
create table minimum_viable_weeks (
  id text primary key,
  warrior_id text not null references warriors(id) on delete cascade,
  week_key text not null,                -- "YYYY-Www"
  reason text,
  kept_task_ids text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (warrior_id, week_key)
);

-- journal ----------------------------------------------------------------
create table journal_entries (
  id text primary key,
  warrior_id text not null references warriors(id) on delete cascade,
  date date not null,
  title text,
  body text not null,
  mood smallint check (mood between 1 and 5),
  tags text[] not null default '{}',
  domain domain,
  refined jsonb,
  translated jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index journal_warrior_date_idx on journal_entries(warrior_id, date desc);

-- reflections ------------------------------------------------------------
create table reflections (
  id text primary key,
  warrior_id text not null references warriors(id) on delete cascade,
  cadence reflection_cadence not null,
  period_key text not null,              -- "2026-W35" | "2026-08" | "2026-Q3"
  answers jsonb not null default '[]',   -- ReflectionAnswer[]
  completed_at timestamptz,
  refined jsonb,
  translated jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (warrior_id, cadence, period_key)
);

-- AI pattern hypotheses --------------------------------------------------
create table pattern_hypotheses (
  id text primary key,
  warrior_id text not null references warriors(id) on delete cascade,
  title text not null,
  hypothesis text not null,
  evidence text[] not null default '{}',
  confidence numeric(3,2) not null default 0.5,
  dismissed boolean not null default false,
  provider text not null default 'mock',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index patterns_warrior_idx on pattern_hypotheses(warrior_id);

-- career audit (types-and-scoring stub in lib/domain/careerAudit.ts) -----
create table career_audits (
  id text primary key,
  warrior_id text not null references warriors(id) on delete cascade,
  ratings jsonb not null,                -- {engagement, meaning, strengths, community, sustainability: 1..5}
  work_thesis jsonb,                     -- {road, thesis}
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS placeholders (enable once auth exists) -----------------------------
-- alter table warriors enable row level security;
-- create policy "own warriors" on warriors for all using (owner_id = auth.uid());
