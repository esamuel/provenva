# ProvenVA

**Hire virtual assistants who are already proven.**

Every VA on ProvenVA passes skill tests, background checks, and portfolio reviews before appearing in search results.

---

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 14 (App Router) |
| Hosting | Vercel (free tier) |
| Database | Supabase (Postgres + RLS) |
| Auth | Clerk |
| Payments | Paddle |
| Styling | Tailwind CSS |
| Language | TypeScript |

---

## Project Structure

```
provenva/
├── app/
│   ├── page.tsx                     # Homepage
│   ├── browse/page.tsx              # Browse verified VAs
│   ├── apply/page.tsx               # VA application form
│   ├── onboarding/page.tsx          # Role picker after signup
│   ├── va/[id]/page.tsx             # VA profile detail
│   ├── dashboard/
│   │   ├── business/page.tsx        # Business dashboard
│   │   └── va/page.tsx             # VA dashboard
│   └── api/
│       ├── apply/route.ts           # VA application endpoint
│       ├── onboarding/route.ts      # Role assignment
│       ├── checkout/
│       │   ├── business/route.ts    # Business subscription checkout
│       │   └── va/route.ts          # VA badge checkout
│       ├── billing/portal/route.ts  # Paddle customer portal
│       ├── webhooks/paddle/route.ts # Paddle webhook handler
│       └── webhooks/stripe/route.ts # Legacy alias to Paddle webhook
├── components/
│   ├── Navbar.tsx
│   └── VACard.tsx
├── lib/
│   ├── supabase.ts
│   ├── paddle.ts
│   └── paddle-webhook.ts
├── types/index.ts
├── middleware.ts                    # Clerk route protection
├── supabase-schema.sql             # Run this in Supabase SQL editor
└── .env.example                    # Copy to .env.local
```

---

## Setup Guide

### Step 1 — Clone and install

```bash
git clone https://github.com/yourusername/provenva.git
cd provenva
npm install
cp .env.example .env.local
```

### Step 2 — Set up Clerk (auth)

1. Go to https://dashboard.clerk.com and create a new app
2. Choose "Email + password" and optionally "Google" as sign-in methods
3. Copy your **Publishable Key** and **Secret Key** into `.env.local`
4. In Clerk dashboard → **Redirects**, set:
   - Sign-in redirect: `/dashboard/business`
   - Sign-up redirect: `/onboarding`

### Step 3 — Set up Supabase (database)

1. Go to https://supabase.com and create a new project
2. Copy your **Project URL** and **anon key** into `.env.local`
3. Also copy the **service_role key** (Settings → API)
4. Go to **SQL Editor** → New query → paste the entire contents of `supabase-schema.sql` → Run
5. This creates all tables, indexes, RLS policies, and 3 sample VAs for testing

### Step 4 — Set up Paddle (payments)

1. Go to https://vendors.paddle.com and create your vendor account
2. In **Developer Tools**, create:
   - API key → set `PADDLE_API_KEY`
   - Notification destination webhook secret → set `PADDLE_WEBHOOK_SECRET`
3. Create 4 recurring prices in Paddle catalog:
   - **Business Starter** — $49/month → `PADDLE_PRICE_BUSINESS_STARTER`
   - **Business Pro** — $99/month → `PADDLE_PRICE_BUSINESS_PRO`
   - **Business Scale** — $149/month → `PADDLE_PRICE_BUSINESS_SCALE`
   - **VA Verified Badge** — $29/month → `PADDLE_PRICE_VA_VERIFIED`
4. Set webhook endpoint:
   - Local/dev: `http://localhost:3000/api/webhooks/paddle`
   - Production: `https://yourdomain.com/api/webhooks/paddle`
5. Subscribe to these events:
   - `transaction.completed`
   - `subscription.created`
   - `subscription.updated`
   - `subscription.past_due`
   - `subscription.canceled`

### Step 5 — Run locally

```bash
npm run dev
```

Open http://localhost:3000

---

## Business Model

| Who | What they pay |
|---|---|
| Businesses | $49–$149/month subscription |
| Businesses | 10% placement fee on first hire |
| VAs | $29/month for verified badge + premium positioning |

---

## Pricing Plans

| Plan | Price | VA contacts/mo |
|---|---|---|
| Starter | $49/mo | 5 |
| Pro | $99/mo | 20 |
| Scale | $149/mo | Unlimited |

---

## Deployment (Vercel)

1. Push your code to GitHub
2. Go to https://vercel.com → Import project → select your repo
3. Add all environment variables from `.env.local` into Vercel's Environment Variables
4. Deploy — Vercel auto-deploys on every `git push`
5. Update `NEXT_PUBLIC_APP_URL` to your Vercel domain
6. Update Paddle webhook URL to your Vercel domain

---

## Key User Flows

### Business user
1. Signs up → `/onboarding` → picks "I'm hiring"
2. Business record created in Supabase
3. Browses `/browse` — sees all verified VAs for free
4. Clicks "Contact this VA" → prompted to subscribe
5. Subscribes via Paddle → webhook updates `businesses.plan`
6. Can now contact VAs through the platform

### VA user
1. Signs up → `/onboarding` → picks "I'm a VA" → redirected to `/apply`
2. Fills application form → saved to `va_applications`
3. Admin reviews application, sends skill test (manually or via Typeform)
4. Admin marks application `approved` → VA record created in `vas` table
5. VA optionally pays $29/month for premium badge → `is_premium = true`
6. VA profile goes live in `/browse`

---

## Admin Operations (via Supabase Dashboard)

For MVP, admin actions are done directly in the Supabase Table Editor:

- **Review applications**: Table Editor → `va_applications` → filter by `status = submitted`
- **Approve a VA**: Change application status to `approved`, then manually insert a row into `vas`
- **Reject a VA**: Change application status to `rejected`
- **Update test score**: Edit `vas.test_score` after reviewing their skill test

> For v2: build an `/admin` dashboard page with Clerk role-based access.

---

## Environment Variables

See `.env.example` for all required variables with instructions.
