# Sequence

**An admissions operating system.** It turns 14 months of chaos into one ranked list of
what to do today.

Built to replace the spreadsheet — by encoding what a *college*, a *round*, a
*requirement*, and a *deadline* actually are, so the app can derive your workload instead
of asking you to maintain it.

---

## Status

**v1 shipped.** Thirteen working pages, 102 unit tests, deployed on Vercel + Neon.

Design documents live in [`docs/`](./docs) — start with
[`docs/README.md`](./docs/README.md).

Authentication is deliberately deferred; the app runs single-user, with every
model and service already `userId`-scoped so it drops in without a migration.

## What makes it not a spreadsheet

1. **Requirement Engine** — pick a college and a round; the system derives the deadlines,
   supplemental prompts, recommendation requirements, school forms, and aid deadlines.
   You never build a tracker.
2. **Rule Engine** — catches the mistakes that actually cost people admission: two binding
   Early Decision applications, Restrictive Early Action violations, QuestBridge ranking
   conflicts, and the Common App rule where submitting the Final Report permanently locks
   the Mid-Year Report.
3. **Essay Graph** — essays are entities mapped many-to-many onto prompts, with real
   version history, per-school submitted-version stamping, reuse scored on prompt kind and
   word-limit fit, and a wrong-school-name check before you submit.

One opinion is encoded directly in the math: **"Submitted" caps an application at 90%.**
The last 10% is confirming the college actually received everything — which is where
applications actually fail.

## Stack

Next.js 15 · React 19 · TypeScript (strict) · Tailwind v4 · shadcn/ui · Framer Motion ·
Prisma · Neon Postgres · TanStack Query · React Hook Form · Zod · Recharts ·
date-fns · Vercel

Authentication is deliberately deferred — the app runs single-user for now. Every model
and service is still scoped by `userId`, so auth drops in later with no migration.

## Setup — entirely from github.com, no terminal

Everything below happens in the browser.

### 1. Add three secrets

**Settings → Secrets and variables → Actions → New repository secret.**

| Secret name | Where to get the value |
|---|---|
| `DATABASE_URL` | [console.neon.tech](https://console.neon.tech) → your project → Connection string, **"Pooled connection" ON** (host contains `-pooler`) |
| `DATABASE_URL_UNPOOLED` | Same screen, **"Pooled connection" OFF** (no `-pooler`) |
| `COLLEGE_SCORECARD_API_KEY` | Free at [api.data.gov/signup](https://api.data.gov/signup/) |

Both connection strings are needed because Prisma runs queries through Neon's
pooler, but migrations cannot — they need a direct connection.

### 2. Run the setup workflow

**Actions → "Set up database" → Run workflow.**

It applies migrations, loads the 140-college catalog, and pulls real admit
rates, test-score ranges, cost, and enrollment from the U.S. Department of
Education. Takes a couple of minutes and prints a summary when it finishes.

Tick **"Also add every US degree-granting institution"** if you want the full
~6,000-school directory for search rather than the curated set.

Safe to re-run at any time. It never touches your applications, essays, tasks,
or profile.

### 3. Open your site

Vercel redeploys on every push to `main`, and the build applies migrations and
loads the catalog automatically — so the workflow above is only needed to pull
in the Scorecard statistics.

## Running locally (optional)

```bash
pnpm install
cp .env.example .env      # then fill in the same three values
pnpm db:up                # local Postgres in Docker, if you'd rather not use Neon
pnpm dev                  # → http://localhost:3000
```

## Documents

| Document | Contents |
|---|---|
| [00-RESEARCH](./docs/00-RESEARCH.md) | Platform mechanics, round rules, aid systems, 16 student pain points |
| [01-PRD](./docs/01-PRD.md) | Personas, features, user flows, information architecture |
| [02-DATA-MODEL](./docs/02-DATA-MODEL.md) | Schema, ER diagram, scoring and scheduling logic |
| [03-ARCHITECTURE](./docs/03-ARCHITECTURE.md) | API design, folder structure, component tree |
| [04-DESIGN-SYSTEM](./docs/04-DESIGN-SYSTEM.md) | Color, typography, motion, wireframes |
| [05-ROADMAP](./docs/05-ROADMAP.md) | Roadmap, build order, risks, future features |

## Non-goals

No AI essay writing. No admit-probability predictions. No peer comparison feeds.
No third-party portal passwords — there is deliberately no field for them in the schema.
