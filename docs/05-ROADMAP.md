# 05 — Roadmap, Build Order, Risk Analysis & Future Features

## 1. Feature Roadmap

### v0.1 — Foundation *(not user-visible)*
Repo, tooling, CI, design tokens, shadcn primitives, Prisma schema, migrations, seed
harness, auth.

### v1.0 — "Never miss a deadline" *(the shippable core)*
Auth · onboarding · college search & list · applications with rounds ·
**Requirement Engine** · **Rule Engine** · deadlines & back-scheduling · tasks (list,
board, calendar, dependencies, recurrence) · essays with versions, diff, assignments, and
reuse · recommendations pipeline · financial aid (FAFSA/CSS/IDOC/awards/comparison) ·
scholarships · interviews · documents · notes · dashboard · calendar · timeline ·
analytics · ⌘K global search · notifications & digests · dark mode · milestones/confetti ·
full responsive.

### v1.1 — "Never miss a *thing*"
Parent/counselor collaborator access · essay reviewer share links · CSV/Sheets importer ·
iCal subscription feed · Google Calendar two-way sync · PDF exports (comparison, checklist,
brag sheet) · reference-data drift notices · workload smoothing suggestions.

### v1.2 — "The second season"
Deferral/waitlist workspace with LOCI drafting scaffolds · decision-day countdown &
release-date tracker · enrollment deposit / housing / orientation checklist · final
transcript & AP score send tracking · summer melt checklist.

### v2.0 — "The other side of the desk"
Counselor workspace (caseload view across students) · consultant multi-client mode ·
school-district deployment · anonymized outcome analytics.

## 2. Build Status

| Phase | Scope | Status |
|---|---|---|
| 0 | Foundation, tokens, schema, CI | ✅ shipped |
| 1 | Profile, college explorer, list | ✅ shipped |
| 2 | Requirement Engine, Rule Engine | ✅ shipped |
| 3 | Back-scheduler, ranked tasks, dashboard | ✅ shipped |
| 4 | Essays, reuse engine, pre-submit checks | ✅ shipped |
| 5 | Recommendations, financial aid, scholarships | ✅ shipped |
| 6 | Calendar, ⌘K search, analytics | ✅ shipped |
| 7 | Milestones, loading/error states, mobile | ✅ shipped |
| 8 | Interview pipeline, document register | ✅ shipped |

Phase 8 closed the two surfaces whose models existed with no UI. Interviews
track the request deadline separately from the completion deadline, because the
request window closes first and closes quietly. Documents are a *register* —
what exists and where it lives — not a file store: most admissions paperwork
never passes through this app, and the upload fields stay nullable until it
does.

Deferred from v1, in priority order: authentication (the app runs single-user,
with every model already `userId`-scoped), essay reviewer share links, document
uploads, notifications and email digests, Kanban drag-and-drop, visit logging,
notes, and the deferral/waitlist LOCI workspace.

## 3. Build Order

Strictly dependency-ordered. Each phase ends green: `tsc --noEmit`, lint, tests, and a
deployable preview. Each bullet is roughly one commit.

**Phase 0 — Foundation**
1. Next.js 15 + TS strict + Tailwind + ESLint/Prettier + CI workflow
2. Design tokens, theme provider, dark mode, typography scale
3. shadcn primitives, restyled to the token set
4. AppShell: sidebar, topbar, layout, responsive breakpoints
5. Prisma schema + first migration + Neon connection
6. Seed harness + ~200 colleges (expand to 2,000 later)

**Phase 1 — Auth & profile**
7. Auth.js: credentials + Google · signup/login/logout
8. Email verification + password reset (Resend + React Email)
9. Route protection, session guards, `requireUser()`
10. Onboarding wizard → StudentProfile + UserSettings
11. Profile & settings pages

**Phase 2 — The spine** ⭐
12. College directory + search + detail
13. Applications CRUD, board/table views, status pipeline
14. Deadline templates seeded; **Requirement Engine** derives checklists
15. **Rule Engine** + warning banners
16. **Back-scheduler** generates soft deadlines & tasks
17. Application detail shell + Overview + Checklist tabs
18. Portal tracking + two-phase confirmation + Portal Sweep

**Phase 3 — Work**
19. Task service, list view, optimistic complete
20. Kanban (dnd-kit + fractional indexing)
21. Dependencies + recurrence (RRULE)
22. Task calendar view + quick add with NL dates
23. **Next-Best-Action** service

**Phase 4 — Essays** ⭐
24. Essay CRUD + composer + autosave
25. Versions, labels, restore, diff viewer
26. Assignments (essay ↔ prompt/scholarship), submitted-version stamping
27. Reuse engine + suggestion panel
28. Pre-submit checks (wrong school name, over limit)
29. Comments + reviewer share links

**Phase 5 — People & money**
30. Recommenders + recommendation pipeline + FERPA gating
31. Financial aid profile, FAFSA/CSS/IDOC/noncustodial tracking
32. Award entry + net-price comparison
33. Scholarships + expected-value ranking
34. Interviews ✅ · visits (deferred)

**Phase 6 — Surfaces**
35. Dashboard (all widgets, streamed)
36. Calendar (month/week/day/agenda)
37. Timeline (season scale)
38. Analytics + Recharts suite
39. ⌘K command palette + full-text search
40. Documents — register ✅ · uploads (UploadThing) and Notes (deferred)

**Phase 7 — The layer that makes it feel expensive**
41. Notifications, inbox, cron jobs, digests
42. Milestones + confetti
43. Skeletons, empty states, error boundaries — every route
44. Motion pass: shared-element transitions, microinteractions
45. Keyboard shortcuts + cheatsheet
46. a11y audit, mobile pass, performance pass
47. E2E suite + seeded demo account

## 4. Risk Analysis

| # | Risk | Impact | L | Mitigation |
|---|---|---|---|---|
| R1 | **Reference data goes stale** — deadlines/prompts change yearly; wrong data is worse than none | **Critical** | High | Cycle-versioned templates; `confidence` + `verifiedAt` + source link shown in UI; "verify on the college's site" affordance everywhere; weekly drift check; user overrides always win |
| R2 | **Scope** — 15 pages, 30+ models | High | High | Strict build order; Requirement + Rule engines first (they're the moat); everything else is CRUD around them |
| R3 | **Rule engine gives wrong advice** on ED/REA | **Critical** | Med | Warnings are advisory and always cite a source; never blocks the user; per-college policy stored as data, not code; table-driven tests from real cases |
| R4 | **Derived-item explosion** — 14 schools × 13 requirements × tasks = overwhelm, the exact thing we're solving | High | Med | Today view caps at 5; blocked tasks hidden; auto-tasks only materialize inside their lead-time window; workload heatmap |
| R5 | Seeding 2,000 colleges accurately | Med | High | Ship 200 well-curated schools; user-add for the rest; treat coverage as an ongoing data program |
| R6 | Version-history table growth (autosave) | Med | Med | Autosave coalesces within 5-min windows; keep all explicit versions + last 50 autosaves; prune older autosaves |
| R7 | Timezone bugs on deadlines | High | Med | `timestamptz` + IANA zone on every deadline; all date math via `date-fns-tz`; property tests across DST boundaries |
| R8 | Credential-storage temptation (portal passwords) | **Critical** | Low | Architecturally forbidden. No password field exists in the schema. Documented in the PRD as a non-goal |
| R9 | Student privacy — essays are deeply personal | High | Low | Private by default; server-enforced collaborator scopes; expiring hashed share tokens; RLS behind app authz |
| R10 | Seasonality — usage collapses Jan–Mar | Med | High | v1.2 second-season features (LOCI, mid-year, awards, deposits) exist precisely to hold this cohort; success metric explicitly tracks February retention |
| R11 | Notification fatigue → mute → missed deadline | High | Med | Digest-first, not per-event; escalation only for hard deadlines; user-tunable offsets; quiet hours |
| R12 | Perf on the dashboard aggregate | Med | Med | Single aggregate endpoint, PPR + streaming, composite indexes, cached derived values |
| R13 | Cold start for junior users (empty app, no urgency) | Med | Med | Junior-spring mode: list building + rec asks + testing only; hide the senior machinery until it applies |

## 5. Future Features

**Intelligence** — activity-résumé builder with the Common App's 150-char limits enforced ·
prompt-similarity clustering across the whole prompt corpus · effort forecasting from the
student's own historical pace · "schools that reuse essays you've already written."

**Collaboration** — real-time co-editing on essays · counselor caseload dashboard ·
teacher-side rec status page (no account required) · family financial-planning view.

**Integrations** — Common App status read-only import (if an API ever exists) ·
Google Docs import for essays · Naviance/Scoir CSV import · Google/Apple Calendar
two-way · College Board score-send tracking.

**Depth** — merit scholarship auto-matching from profile · net price calculator embeds ·
loan repayment projection vs. expected starting salary by major · gap-year and transfer
tracks · graduate school mode (the same engine, different templates).

**Mobile** — React Native shell wrapping the same services · push notifications ·
widget: "days until your next deadline" · offline essay drafting.

**Explicitly declined, permanently:** AI essay generation · chancing/admit-probability
predictions · peer comparison feeds · anything that increases anxiety in exchange for
engagement.
