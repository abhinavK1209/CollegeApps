# 03 — Architecture, API Design, Component Tree & Folder Structure

## 1. Stack & Rationale

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15** (App Router, RSC, PPR) | Server-render the dashboard shell; stream the slow widgets |
| UI | **React 19** | `useOptimistic`, `useActionState`, `use()` — optimistic task/essay UX is table stakes |
| Language | **TypeScript**, `strict` + `noUncheckedIndexedAccess` | Non-negotiable |
| Styling | **Tailwind CSS** + CSS variables | Theming via variables, not class swaps |
| Components | **shadcn/ui** (owned source, not a dependency) | We need to restyle deeply |
| Motion | **Framer Motion** | Layout animations, shared-element transitions |
| Icons | **Lucide** | Consistent 1.5px stroke |
| DB | **Supabase Postgres** + **Prisma** | Prisma for typed access & migrations; Supabase for auth infra, RLS, storage, realtime |
| Auth | **Auth.js v5** on Supabase Postgres | Credentials + Google + verification + reset in one adapter |
| Server state | **TanStack Query v5** | Cache, optimistic mutations, background refetch |
| Forms | **React Hook Form** + **Zod** | One schema → client validation, server validation, and TS types |
| Charts | **Recharts** | Composable, themeable |
| Dates | **date-fns** + **date-fns-tz** | Timezone-correct deadlines are a hard requirement |
| Uploads | **UploadThing** | Typed file router, no S3 plumbing |
| Email | **Resend** + **React Email** | Verification, resets, digests |
| Jobs | **Vercel Cron** → route handlers | Digests, reminder materialization, drift checks |
| Deploy | **Vercel** | |
| Quality | ESLint (flat) · Prettier · Vitest · Playwright · `tsc --noEmit` in CI | |

### Data-flow doctrine

```
Server Component  →  service layer  →  Prisma  →  Postgres      (initial render, no waterfall)
Client Component  →  TanStack Query →  route handler → service   (interactive refetch)
Client mutation   →  Server Action  →  service                   (writes; revalidate + invalidate)
```

**One rule, strictly enforced:** business logic lives **only** in `server/services/*`.
Server Actions and route handlers are thin adapters — authenticate, validate with Zod,
call a service, map errors. Nothing else. This is why the same "add application" logic is
callable from the UI, the seed script, the CSV importer, and the tests.

---

## 2. API Design

### 2.1 Conventions

- **Reads** → `GET /api/v1/*` route handlers, consumed by TanStack Query.
- **Writes** → Server Actions in `_actions.ts`, returning a discriminated result:
  ```ts
  type ActionResult<T> =
    | { ok: true;  data: T }
    | { ok: false; error: { code: ErrorCode; message: string; fieldErrors?: Record<string,string[]> } };
  ```
  Actions never throw to the client; they never return raw Prisma errors.
- Every handler: `requireUser()` → `schema.parse()` → service → typed response.
- Cursor pagination (`?cursor=&limit=`), `limit ≤ 100`.
- Rate limits on auth, upload, and share-link routes.

### 2.2 Route handlers (reads)

```
GET  /api/v1/dashboard                    aggregate payload (single round-trip)
GET  /api/v1/search?q=&types=&limit=      global search
GET  /api/v1/colleges?q=&state=&platform= college directory (public reference data)
GET  /api/v1/colleges/:slug

GET  /api/v1/applications?status=&round=&view=
GET  /api/v1/applications/:id             deep payload for detail page
GET  /api/v1/applications/:id/checklist
GET  /api/v1/applications/:id/activity

GET  /api/v1/tasks?status=&due=&label=&view=
GET  /api/v1/essays?status=&assigned=
GET  /api/v1/essays/:id/versions
GET  /api/v1/essays/:id/reuse-suggestions
GET  /api/v1/recommendations
GET  /api/v1/scholarships
GET  /api/v1/financial-aid/overview
GET  /api/v1/financial-aid/comparison     normalized net-price table
GET  /api/v1/calendar?from=&to=&types=
GET  /api/v1/calendar/feed.ics?token=     read-only iCal subscription
GET  /api/v1/timeline?from=&to=
GET  /api/v1/analytics/:metric
GET  /api/v1/notifications?unread=
GET  /api/v1/rules/findings
```

### 2.3 Server Actions (writes), grouped by feature

```
applications/  createApplication · updateApplication · setRound · setStatus
               recordDecision · archiveApplication · regenerateChecklist
               updatePortalAccount · markRequirementReceived · runPortalSweep

tasks/         createTask · updateTask · toggleTask · reorderTasks(fractional index)
               setDependency · bulkComplete · snoozeTask

essays/        createEssay · updateEssayMeta · saveVersion(autosave|explicit)
               restoreVersion · assignEssay · unassignEssay · markAssignmentSubmitted
               addComment · resolveComment · createShareLink

recs/          createRecommender · updateRecommender · assignToApplications
               advanceRecommendationStatus · sendThankYouReminder

aid/           upsertAidProfile · upsertAidRequirement · upsertAward · setAppealStatus
scholarships/  createScholarship · updateScholarship · recordAward
documents/     confirmUpload · linkDocument · deleteDocument
notes/         createNote · updateNote · togglePin
profile/       updateProfile · upsertTestScore · updateSettings
collab/        inviteCollaborator · revokeCollaborator · acceptInvite
onboarding/    completeOnboarding
```

### 2.4 Background jobs (Vercel Cron)

| Schedule | Job | Work |
|---|---|---|
| `*/15 * * * *` | `dispatch-notifications` | Send due notifications; respect quiet hours + timezone |
| `0 * * * *` | `materialize-reminders` | Create Notification rows from `reminderOffsetsDays` |
| `0 5 * * *` | `daily-digest` | Per-user digest at their local `digestHourLocal` |
| `0 6 * * *` | `recompute-derived` | Overdue flags, rule findings, staleness, recurring tasks |
| `0 7 * * 0` | `weekly-portal-sweep` | Raise the sweep ritual for submitted applications |
| `0 3 * * 1` | `reference-drift-check` | Diff seeded templates vs. user copies → drift notices |

### 2.5 Security

- Auth.js session cookies: `httpOnly`, `secure`, `sameSite=lax`.
- **Every service call takes `userId` and scopes its query.** No handler ever trusts an ID
  from the client without an ownership check. Supabase RLS is the second layer.
- Collaborator scopes enforced in the service layer via a `visibleScopes` guard —
  a parent's `GET /applications/:id` returns a *different shape*, not a hidden div.
- Share links: hashed tokens, expiring, single-purpose, revocable.
- CSP with nonces; no inline scripts. Zod-validated env at boot (`env.ts`).
- Uploads: type + size allowlist server-side; private storage bucket; signed URLs.
- Audit: every mutation writes an `ActivityEvent`.

---

## 3. Folder Structure

```
CollegeApps/
├── docs/                              ← these documents
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed/
│       ├── index.ts
│       ├── colleges.ts                ~2,000 colleges
│       ├── deadlines.ts               college × cycle × round
│       ├── prompts.ts                 essay prompt templates
│       └── requirements.ts
├── public/
├── emails/                            React Email templates
│   ├── verify-email.tsx  reset-password.tsx  daily-digest.tsx  deadline-alert.tsx
└── src/
    ├── app/
    │   ├── (marketing)/page.tsx
    │   ├── (auth)/login|signup|forgot-password|reset-password|verify-email/
    │   ├── (onboarding)/onboarding/
    │   ├── (app)/
    │   │   ├── layout.tsx             sidebar · topbar · ⌘K · toaster · providers
    │   │   ├── dashboard/
    │   │   │   ├── page.tsx  loading.tsx  error.tsx
    │   │   │   └── _components/       next-best-action · progress-rings · funnel
    │   │   │                          heatmap · countdowns · decision-tracker
    │   │   ├── applications/
    │   │   │   ├── page.tsx  loading.tsx  _components/  _actions.ts
    │   │   │   └── [id]/
    │   │   │       ├── layout.tsx     header + tab nav (shared shell)
    │   │   │       ├── page.tsx       overview
    │   │   │       ├── checklist|deadlines|essays|recommendations|documents/
    │   │   │       ├── financial-aid|interview|notes|portal|activity/
    │   │   │       └── _components/
    │   │   ├── colleges/ · calendar/ · timeline/ · tasks/ · essays/[id]/versions/
    │   │   ├── scholarships/ · financial-aid/ · recommendations/ · documents/
    │   │   ├── notes/ · analytics/ · profile/ · settings/ · search/
    │   ├── api/
    │   │   ├── auth/[...nextauth]/route.ts
    │   │   ├── uploadthing/route.ts
    │   │   ├── cron/[job]/route.ts
    │   │   └── v1/**/route.ts
    │   ├── layout.tsx  globals.css  not-found.tsx  error.tsx
    ├── features/                      ← the real code lives here
    │   ├── applications/
    │   │   ├── components/            ApplicationCard, RoundPicker, ChecklistTable…
    │   │   ├── hooks/                 useApplications, useApplicationDetail
    │   │   ├── schemas/               Zod: create/update/decision
    │   │   ├── types.ts
    │   │   └── utils/                 progress.ts, grouping.ts
    │   ├── essays/                    + reuse-engine.ts, diff.ts, word-count.ts
    │   ├── tasks/                     + scoring.ts, fractional-index.ts, rrule.ts
    │   ├── recommendations/ · financial-aid/  (+ net-price.ts)
    │   ├── scholarships/    (+ expected-value.ts)
    │   ├── calendar/ · dashboard/ · analytics/ · search/ · notifications/
    │   ├── onboarding/ · profile/ · settings/ · collaboration/
    ├── server/
    │   ├── auth/                      config.ts, guards.ts, password.ts
    │   ├── db.ts                      Prisma singleton
    │   ├── services/                  ← ALL business logic
    │   │   ├── application.service.ts
    │   │   ├── requirement-engine.ts  ⭐ derive checklists from templates
    │   │   ├── rule-engine.ts         ⭐ ED/REA/QB compliance
    │   │   ├── scheduling.service.ts  ⭐ back-scheduling & soft deadlines
    │   │   ├── next-action.service.ts ⭐ ranking
    │   │   ├── essay.service.ts · recommendation.service.ts
    │   │   ├── aid.service.ts · scholarship.service.ts · task.service.ts
    │   │   ├── search.service.ts · notification.service.ts
    │   │   ├── activity.service.ts · milestone.service.ts
    │   │   └── analytics.service.ts
    │   ├── jobs/                      one file per cron job
    │   └── email/
    ├── components/
    │   ├── ui/                        shadcn primitives (owned, restyled)
    │   ├── layout/                    AppSidebar, TopBar, PageHeader, TabNav
    │   ├── command/                   CommandPalette, QuickAdd, SearchResults
    │   ├── data/                      DataTable, KanbanBoard, EmptyState, Skeletons
    │   ├── charts/                    ProgressRing, Heatmap, FunnelChart, Sparkline
    │   ├── feedback/                  Toaster, Confetti, RuleWarningBanner
    │   └── providers/                 Theme, Query, KeyboardShortcut, Toast
    ├── hooks/                         useKeyboardShortcut, useDebounce, useMediaQuery,
    │                                  useLocalStorage, useOptimisticList, useConfetti
    ├── lib/
    │   ├── utils.ts (cn) · dates.ts (tz-aware) · format.ts (money/words)
    │   ├── constants.ts · errors.ts · rate-limit.ts · env.ts
    │   └── query-keys.ts              centralized TanStack Query key factory
    ├── types/
    ├── styles/
    └── test/
```

**The rule that keeps this clean:** `app/` contains routing and composition only.
`features/` owns UI + client logic per domain. `server/services/` owns truth.
Nothing in `features/` imports Prisma. Nothing in `server/` imports React.

---

## 4. Component Tree

```
RootLayout
└─ Providers  (Theme · Query · Toast · KeyboardShortcuts · Motion reduced-motion)
   └─ AppShell
      ├─ AppSidebar
      │  ├─ Logo · SeasonBadge ("Senior Fall · 12 days to ED")
      │  ├─ NavSection[Plan]     Dashboard · Calendar · Timeline · Tasks
      │  ├─ NavSection[Apply]    Applications · Colleges · Essays · Recommendations
      │  ├─ NavSection[Money]    Financial Aid · Scholarships
      │  ├─ NavSection[Library]  Documents · Notes · Analytics
      │  └─ UserMenu (theme · settings · sign out)
      ├─ TopBar
      │  ├─ Breadcrumbs · SearchTrigger(⌘K) · QuickAddMenu(⌘N)
      │  └─ NotificationBell → NotificationPopover
      ├─ CommandPalette (portal)
      │  ├─ CommandInput · RecentGroup · ActionsGroup · NavigationGroup
      │  └─ ResultsGroup[College|Application|Essay|Task|Scholarship|Note]
      ├─ <main> {page}
      ├─ Toaster
      └─ ConfettiCanvas (milestone-triggered, respects reduce-motion)

DashboardPage
├─ GreetingHeader (adaptive to season)
├─ NextBestActionCard        ← the hero; explains its own ranking
├─ LateSection               ← renders only when non-empty
├─ TodayList → TaskRow[]
├─ ProgressRingGrid → ProgressRing × 4
├─ CountdownRow → CountdownWidget × 3
├─ ApplicationFunnel (Recharts)
├─ DeadlineHeatmap (16-week grid)
├─ DecisionTracker (post-decision only)
├─ AidProgressCard · ScholarshipProgressCard
├─ RecentlyEditedList
└─ QuickAddDock

ApplicationDetailLayout
├─ ApplicationHeader
│  ├─ CollegeCrest · Name · RoundBadge · StatusPill · TierBadge
│  ├─ CompletionRing · DaysRemainingChip
│  └─ ActionMenu (change round · record decision · archive)
├─ RuleWarningBanner (if findings)
├─ TabNav  Overview·Checklist·Deadlines·Essays·Recs·Docs·Aid·Interview·Notes·Portal·Activity
└─ {tab}
   ├─ OverviewTab      ChecklistSummary · NextActions · KeyDates · QuickStats
   ├─ ChecklistTab     RequirementTable (inline-editable, two-phase status)
   ├─ EssaysTab        PromptCard[] → EssayAssignmentPicker → ReuseSuggestions
   ├─ RecsTab          RecommendationPipeline (visual stage tracker)
   ├─ AidTab           AidRequirementList · AwardBreakdown · NetPriceCallout
   ├─ InterviewTab     InterviewStatusCard · PrepChecklist · ThankYouTracker
   ├─ PortalTab        PortalLinkCard · LastCheckedAt · MissingItemsChecklist
   └─ ActivityTab      ActivityFeed

EssayComposerPage
├─ EssayHeader (title · prompt · status · assignment chips)
├─ EditorPane
│  ├─ RichTextEditor (autosave → version)
│  └─ StatsBar (words/limit · chars · reading time · over-limit warning)
├─ SidePanel (tabbed)
│  ├─ VersionHistory → VersionDiffViewer
│  ├─ CommentsPanel → CommentThread[]
│  ├─ ReuseSuggestions → ReuseSuggestionCard[]
│  └─ AssignmentsPanel → AssignmentRow[] (per-school submitted version)
└─ PreSubmitCheckDialog (wrong-school-name · over-limit · unresolved comments)
```

### Shared primitives worth naming
`PageHeader` · `EmptyState` (illustration + one primary action, never a dead end) ·
`DataTable` (sort/filter/select/bulk) · `KanbanBoard` (dnd-kit + fractional indexing) ·
`StatusPill` · `PriorityFlag` · `DatePickerField` (timezone-aware) · `InlineEditText` ·
`ProgressRing` (SVG, spring-animated) · `Skeleton*` matched 1:1 to each real component ·
`ConfirmDialog` · `KeyboardHint`.

---

## 5. Performance

- **PPR**: dashboard shell is static; widgets stream via `<Suspense>` with matched skeletons.
- Single `/api/v1/dashboard` aggregate → one round-trip, not twelve.
- TanStack Query: `staleTime` 30s default, 5m for reference data, `keepPreviousData` on
  paginated views.
- Optimistic updates on every task toggle, drag, and status change via `useOptimistic`.
- Route prefetch on sidebar hover.
- Recharts and the rich-text editor are dynamically imported.
- Route-level `revalidateTag` on mutation; query-key invalidation from a central factory.
- Budget: LCP < 1.2s, TTI < 2.0s, route transitions p75 < 150ms.

## 6. Testing

| Layer | Tool | Coverage target |
|---|---|---|
| Pure logic (rule engine, scheduling, scoring, net price, reuse) | Vitest | **> 90%** |
| Services (against a test Postgres) | Vitest + Testcontainers | > 80% |
| Components | Vitest + Testing Library | key interactive components |
| E2E: signup → add college → derive checklist → submit → verify | Playwright | 6 critical paths |
| a11y | axe-core in Playwright | zero serious violations |

The rule engine and back-scheduler get table-driven tests with the real cases from
research — Harvard REA + Georgia Tech EA (legal), Harvard REA + Duke ED (illegal),
QuestBridge ranking + Duke ED (illegal), ED accepted → withdraw cascade.
