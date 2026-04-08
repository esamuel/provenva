-- ============================================================
-- ProvenVA — Supabase SQL Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── VAs table ───────────────────────────────────────────────
create table if not exists public.vas (
  id                  uuid primary key default uuid_generate_v4(),
  clerk_user_id       text unique not null,
  full_name           text not null,
  avatar_url          text,
  headline            text not null,
  bio                 text not null,
  category            text not null check (category in (
                        'admin','bookkeeping','customer_service',
                        'social_media','ecommerce','content','technical'
                      )),
  skills              text[] not null default '{}',
  hourly_rate_usd     integer not null check (hourly_rate_usd > 0),
  availability        text not null check (availability in ('full_time','part_time','contract')),
  timezone            text not null,
  country             text not null,
  status              text not null default 'pending'
                        check (status in ('pending','in_review','verified','rejected')),
  test_score          integer check (test_score between 0 and 100),
  portfolio_url       text,
  linkedin_url        text,
  years_experience    integer not null default 0,
  rehire_rate         integer check (rehire_rate between 0 and 100),
  avg_response_hours  numeric(4,1),
  completed_jobs      integer not null default 0,
  is_premium          boolean not null default false,
  stripe_customer_id  text,
  stripe_subscription_id text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ── Businesses table ─────────────────────────────────────────
create table if not exists public.businesses (
  id                     uuid primary key default uuid_generate_v4(),
  clerk_user_id          text unique not null,
  company_name           text not null,
  contact_name           text not null,
  avatar_url             text,
  industry               text,
  company_size           text check (company_size in ('1-5','6-20','21-50','51-200','200+')),
  plan                   text check (plan in ('starter','pro','scale')),
  stripe_customer_id     text,
  stripe_subscription_id text,
  subscription_status    text check (subscription_status in ('active','past_due','canceled')),
  saved_vas              uuid[] not null default '{}',
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- ── VA Applications table ────────────────────────────────────
create table if not exists public.va_applications (
  id                uuid primary key default uuid_generate_v4(),
  clerk_user_id     text,
  full_name         text not null,
  email             text not null,
  category          text not null,
  years_experience  integer not null default 0,
  headline          text not null,
  bio               text not null,
  hourly_rate_usd   integer not null,
  availability      text not null,
  timezone          text not null,
  country           text not null,
  skills            text[] not null default '{}',
  portfolio_url     text,
  linkedin_url      text,
  status            text not null default 'submitted'
                      check (status in ('submitted','test_sent','test_completed','approved','rejected')),
  test_score        integer check (test_score between 0 and 100),
  reviewer_notes    text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ── Hires table ──────────────────────────────────────────────
create table if not exists public.hires (
  id                   uuid primary key default uuid_generate_v4(),
  business_id          uuid not null references public.businesses(id) on delete cascade,
  va_id                uuid not null references public.vas(id) on delete cascade,
  status               text not null default 'active'
                         check (status in ('active','completed','cancelled')),
  started_at           timestamptz not null default now(),
  ended_at             timestamptz,
  placement_fee_paid   boolean not null default false,
  rehired              boolean not null default false,
  business_rating      integer check (business_rating between 1 and 5),
  va_rating            integer check (va_rating between 1 and 5),
  review_text          text,
  created_at           timestamptz not null default now()
);

-- ── Updated_at trigger ────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger vas_updated_at
  before update on public.vas
  for each row execute procedure public.set_updated_at();

create trigger businesses_updated_at
  before update on public.businesses
  for each row execute procedure public.set_updated_at();

create trigger va_applications_updated_at
  before update on public.va_applications
  for each row execute procedure public.set_updated_at();

-- ── Indexes ───────────────────────────────────────────────────
create index if not exists vas_status_idx        on public.vas(status);
create index if not exists vas_category_idx      on public.vas(category);
create index if not exists vas_clerk_idx         on public.vas(clerk_user_id);
create index if not exists businesses_clerk_idx  on public.businesses(clerk_user_id);
create index if not exists hires_business_idx    on public.hires(business_id);
create index if not exists hires_va_idx          on public.hires(va_id);

-- Full-text search index for marketplace keyword search
create index if not exists vas_search_fts_idx
  on public.vas
  using gin (to_tsvector(
    'english',
    coalesce(full_name,'') || ' ' ||
    coalesce(headline,'')  || ' ' ||
    coalesce(bio,'')       || ' ' ||
    coalesce(array_to_string(skills,' '), '')
  ));

-- Marketplace search RPC (ranked + filterable + paginated)
create or replace function public.search_verified_vas(
  p_q text default null,
  p_category text default null,
  p_availability text default null,
  p_min_rate integer default null,
  p_max_rate integer default null,
  p_sort text default 'relevance',
  p_limit integer default 24,
  p_offset integer default 0
)
returns setof public.vas
language plpgsql
stable
as $$
declare
  q text := nullif(trim(coalesce(p_q, '')), '');
begin
  return query
  with base as (
    select
      v.*,
      case
        when q is null then null
        else ts_rank_cd(
          to_tsvector(
            'english',
            coalesce(v.full_name,'') || ' ' ||
            coalesce(v.headline,'')  || ' ' ||
            coalesce(v.bio,'')       || ' ' ||
            coalesce(array_to_string(v.skills,' '), '')
          ),
          websearch_to_tsquery('english', q)
        )
      end as rank
    from public.vas v
    where v.status = 'verified'
      and (p_category is null or v.category = p_category)
      and (p_availability is null or v.availability = p_availability)
      and (p_min_rate is null or v.hourly_rate_usd >= p_min_rate)
      and (p_max_rate is null or v.hourly_rate_usd <= p_max_rate)
      and (
        q is null
        or to_tsvector(
            'english',
            coalesce(v.full_name,'') || ' ' ||
            coalesce(v.headline,'')  || ' ' ||
            coalesce(v.bio,'')       || ' ' ||
            coalesce(array_to_string(v.skills,' '), '')
          ) @@ websearch_to_tsquery('english', q)
      )
  )
  select b.*
  from base b
  order by
    case when p_sort = 'rate_asc' then b.hourly_rate_usd end asc nulls last,
    case when p_sort = 'rate_desc' then b.hourly_rate_usd end desc nulls last,
    case when p_sort = 'response_asc' then b.avg_response_hours end asc nulls last,
    case when p_sort = 'skill_desc' then b.test_score end desc nulls last,
    case when p_sort = 'newest' then b.created_at end desc nulls last,
    case when p_sort = 'relevance' then b.rank end desc nulls last,
    b.test_score desc nulls last,
    b.created_at desc
  limit greatest(1, least(p_limit, 50))
  offset greatest(p_offset, 0);
end;
$$;

-- ── Row Level Security ────────────────────────────────────────
alter table public.vas              enable row level security;
alter table public.businesses       enable row level security;
alter table public.va_applications  enable row level security;
alter table public.hires            enable row level security;

-- VAs: anyone can read verified profiles; only owner can update
create policy "verified vas are public"
  on public.vas for select
  using (status = 'verified');

create policy "va owner can update own profile"
  on public.vas for update
  using (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Businesses: owner reads/updates own record only
create policy "business owner reads own record"
  on public.businesses for select
  using (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

create policy "business owner updates own record"
  on public.businesses for update
  using (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Applications: applicant reads own; admins use service role (bypasses RLS)
create policy "applicant reads own application"
  on public.va_applications for select
  using (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Hires: business sees its own hires
create policy "business sees own hires"
  on public.hires for select
  using (
    business_id in (
      select id from public.businesses
      where clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- ── Seed: sample verified VAs for dev/testing ─────────────────
insert into public.vas (
  clerk_user_id, full_name, headline, bio, category, skills,
  hourly_rate_usd, availability, timezone, country, status,
  test_score, years_experience, rehire_rate, avg_response_hours, completed_jobs
) values
(
  'seed_va_001', 'Maria Santos', 'QuickBooks expert for e-commerce brands',
  'I help small e-commerce businesses keep their books clean and tax-ready. Five years reconciling accounts for Shopify and Amazon sellers.',
  'bookkeeping', ARRAY['QuickBooks','Xero','Bank reconciliation','Invoicing','Payroll'],
  35, 'full_time', 'GMT+8 (Manila)', 'Philippines', 'verified',
  94, 5, 82, 2.5, 47
),
(
  'seed_va_002', 'James Okonkwo', 'Customer support specialist — Zendesk certified',
  'Managed support queues for SaaS companies with 10k+ users. I turn frustrated customers into loyal ones.',
  'customer_service', ARRAY['Zendesk','Freshdesk','Live chat','Email support','Complaint handling'],
  28, 'full_time', 'GMT+1 (Lagos)', 'Nigeria', 'verified',
  91, 4, 76, 1.8, 38
),
(
  'seed_va_003', 'Ana Rodrigues', 'Executive VA — calendars, travel, inbox zero',
  'I have supported C-suite executives for six years. My clients never miss a meeting and their inboxes stay under 20 emails.',
  'admin', ARRAY['Email management','Calendar scheduling','Travel booking','Data entry','Document prep'],
  32, 'part_time', 'GMT-3 (São Paulo)', 'Brazil', 'verified',
  88, 6, 90, 3.0, 61
);
