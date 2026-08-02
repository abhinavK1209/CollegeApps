# 04 — Design System, Color, Typography & Wireframes

## 1. Design Principles

1. **Calm is a feature.** The interface is quiet by default. Color is spent only on
   meaning. A screen full of red is a screen the student closes. (P-13)
2. **One primary action per screen.** Everything else recedes.
3. **Density with air.** Stripe-grade information density, Apple-grade spacing. Data-heavy
   surfaces get tight rhythm; decision surfaces get generous room.
4. **Motion explains, never decorates.** Every animation communicates origin, destination,
   or state change. All of it obeys `prefers-reduced-motion`.
5. **Never a dead end.** Every empty state, error, and zero-result has a next action.
6. **Keyboard-first, mouse-friendly.** Everything reachable in ≤ 2 keystrokes from ⌘K.
7. **Honest about uncertainty.** Seeded deadlines show their confidence and link to the
   source. We never fake authority.

## 2. Color

Neutral-first with a single restrained accent. Semantic colors carry strict meaning.

### 2.1 Semantic meaning (enforced, not decorative)

| Token | Meaning | Never used for |
|---|---|---|
| `accent` (indigo) | Primary action, selection, focus | Status |
| `success` (emerald) | Confirmed received, submitted, accepted | "Done-ish" |
| `warning` (amber) | Due soon, needs attention, unconfirmed | Errors |
| `danger` (rose) | **Late**, rule violation, denied | Ordinary work |
| `info` (sky) | Derived/seeded, informational | Success |

> Deliberate: **work that exists is not an error.** Red appears only when something is
> genuinely past due or a rule is broken. This is the single most important color decision
> in the product.

### 2.2 Palette

```css
/* ── Light ───────────────────────────────────────────── */
:root {
  --bg:              0 0% 100%;
  --bg-subtle:       240 20% 99%;
  --surface:         0 0% 100%;
  --surface-raised:  240 20% 99.5%;
  --overlay:         0 0% 100%;

  --border:          240 6% 90%;
  --border-strong:   240 6% 82%;

  --fg:              240 10% 8%;      /* near-black, slight cool cast */
  --fg-muted:        240 4% 46%;
  --fg-subtle:       240 4% 62%;

  --accent:          243 75% 59%;     /* indigo 600 */
  --accent-hover:    243 75% 52%;
  --accent-fg:       0 0% 100%;
  --accent-subtle:   243 75% 96%;
  --accent-ring:     243 75% 59% / 0.35;

  --success:         160 84% 33%;  --success-subtle: 160 60% 95%;
  --warning:          38 92% 46%;  --warning-subtle:  38 92% 95%;
  --danger:          349 78% 50%;  --danger-subtle:  349 78% 96%;
  --info:            199 89% 46%;  --info-subtle:    199 89% 95%;

  --shadow-sm:  0 1px 2px 0 hsl(240 10% 8% / .04);
  --shadow-md:  0 2px 8px -2px hsl(240 10% 8% / .08), 0 1px 3px hsl(240 10% 8% / .04);
  --shadow-lg:  0 12px 32px -8px hsl(240 10% 8% / .12), 0 2px 8px hsl(240 10% 8% / .04);
}

/* ── Dark (not inverted — recomposed) ────────────────── */
.dark {
  --bg:              240 12% 6%;
  --bg-subtle:       240 12% 8%;
  --surface:         240 10% 9.5%;
  --surface-raised:  240 9% 12%;
  --overlay:         240 10% 11%;

  --border:          240 8% 18%;
  --border-strong:   240 8% 26%;

  --fg:              240 15% 96%;
  --fg-muted:        240 6% 64%;
  --fg-subtle:       240 6% 46%;

  --accent:          243 82% 68%;     /* lifted for contrast on dark */
  --accent-hover:    243 82% 74%;
  --accent-fg:       240 12% 6%;
  --accent-subtle:   243 40% 18%;

  --success:         158 64% 52%;  --success-subtle: 160 40% 14%;
  --warning:          40 96% 60%;  --warning-subtle:  38 50% 14%;
  --danger:          350 82% 64%;  --danger-subtle:  349 45% 15%;
  --info:            199 90% 60%;  --info-subtle:    199 45% 14%;

  --shadow-sm:  0 1px 2px 0 hsl(0 0% 0% / .3);
  --shadow-md:  0 2px 8px -2px hsl(0 0% 0% / .45);
  --shadow-lg:  0 16px 40px -12px hsl(0 0% 0% / .6);
}
```

**Round color coding** (used consistently on badges, calendar, heatmap, funnel):

| Round | Hue |
|---|---|
| ED1 / ED2 | violet 500 (binding = distinct and slightly serious) |
| REA / SCEA | fuchsia 500 |
| EA | sky 500 |
| RD | slate 500 |
| Rolling | teal 500 |
| QuestBridge | amber 500 |

Accessibility: all text/background pairs ≥ **4.5:1**, UI/graphical ≥ **3:1**, in both
themes. Status is never conveyed by color alone — every status pill carries an icon and a
label.

## 3. Typography

```
Sans      Inter Variable          — UI, everything by default
Display   Inter Variable, tighter tracking + optical sizing — page titles, hero numbers
Serif     Source Serif 4          — essay composer reading surface only
Mono      JetBrains Mono          — counts, countdowns, tabular numbers
```

`font-feature-settings: "cv11","ss01","tnum"` — slashed zero, single-storey a, and
**tabular numerals everywhere numbers change** (countdowns, word counts, money) so digits
don't jitter.

| Token | Size / Line | Weight | Tracking | Use |
|---|---|---|---|---|
| `display-xl` | 48 / 52 | 640 | −0.03em | Marketing hero |
| `display-lg` | 36 / 40 | 620 | −0.025em | Dashboard greeting |
| `h1` | 28 / 34 | 600 | −0.02em | Page title |
| `h2` | 22 / 28 | 600 | −0.015em | Section |
| `h3` | 17 / 24 | 600 | −0.01em | Card title |
| `body` | 15 / 24 | 400 | 0 | Default |
| `body-sm` | 13.5 / 20 | 400 | 0 | Secondary |
| `label` | 13 / 16 | 500 | 0 | Form labels |
| `caption` | 12 / 16 | 500 | 0.01em | Metadata |
| `overline` | 11 / 14 | 600 | 0.06em | Section eyebrows (uppercase) |
| `mono-num` | 13 / 18 | 500 | 0 | Counts, `tnum` |

**Essay composer** overrides: Source Serif 4, 18/1.75, `max-width: 68ch`. Writing surfaces
should feel like paper, not like a form field.

## 4. Space, Radius, Elevation

- **4px base scale**: 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80
- Radius: `sm 6` · `md 10` · `lg 14` · `xl 20` · `2xl 28` · `full`
  Cards use `lg`/`xl`; inputs and buttons `md`; the command palette `xl`.
- Elevation is 4 steps only: flat → `sm` (cards) → `md` (popovers/dropdowns) →
  `lg` (modals, ⌘K). Dark mode leans on **surface lightness**, not shadow.
- Layout: sidebar 260px (collapses to 64px icon rail, then a sheet below `md`);
  content `max-width: 1200px`, `1440px` on data-dense views.

## 5. Motion

```
instant   100ms  cubic-bezier(.4,0,.2,1)     hover, focus
fast      160ms  cubic-bezier(.4,0,.2,1)     dropdowns, tooltips, checkbox
base      220ms  cubic-bezier(.32,.72,0,1)   cards, tabs, panels
slow      320ms  cubic-bezier(.32,.72,0,1)   modals, drawers, route transitions
spring           { type:"spring", stiffness:400, damping:32, mass:.8 }  drag, rings
```

Signature moments:
- **Task complete** — checkbox spring-scales, row desaturates and collapses over 220ms;
  count decrements with a tabular-number roll.
- **Progress rings** — animate from previous value, not from 0, so change is legible.
- **⌘K** — 320ms scale 0.96→1 + backdrop blur 0→8px.
- **Application card → detail** — Framer Motion shared `layoutId` on the crest and title.
- **Confetti** — only on `Milestone` rows, once each, ~1.6s, disable-able, auto-off under
  `prefers-reduced-motion`. Milestones are earned, not sprinkled.
- **Kanban drag** — card lifts to `shadow-lg`, 2° tilt, others reflow with layout spring.

## 6. Voice

Plain, warm, second person, never cutesy. Never alarmist.

| Situation | ✅ | ❌ |
|---|---|---|
| Overdue | "Duke's supplement was due 2 days ago. 20 minutes should finish it." | "⚠️ OVERDUE!!! You're falling behind!" |
| Empty essays | "No essays yet. Adding a college brings its prompts with it." | "Nothing here." |
| Milestone | "First application submitted. That's the hardest one." | "🎉🎉 AMAZING JOB SUPERSTAR 🎉🎉" |
| Rule violation | "You're holding two binding Early Decision applications. Only one is allowed — here's what that means." | "ERROR: constraint violated" |
| Seeded data | "From our 2026 data · verify on Brown's site" | *(silent, implying certainty)* |

---

## 7. Wireframes

### 7.1 Dashboard

```
┌────────────┬───────────────────────────────────────────────────────────────────────┐
│ ◈ Sequence │  Dashboard                        ⌘K Search    ＋ Add     🔔 3    ◑   │
│            ├───────────────────────────────────────────────────────────────────────┤
│ Senior Fall│                                                                       │
│ 12d to ED  │  Good evening, Maya.                                                  │
│            │  12 days until your Duke ED deadline. You're on track.                │
│ PLAN       │                                                                       │
│ ▸ Dashboard│  ┌─ ⚡ NEXT BEST ACTION ─────────────────────────────────────────┐   │
│   Calendar │  │  Finish the Duke "Why Duke?" supplement            ~35 min    │   │
│   Timeline │  │  250 words · currently 180 · due in 5 days                    │   │
│   Tasks  7 │  │  Unblocks 2 other tasks.                    [ Open essay → ]  │   │
│            │  └───────────────────────────────────────────────────────────────┘   │
│ APPLY      │                                                                       │
│   Applica..│  ┌─ LATE ────────────────────────────────────────────── 1 item ──┐   │
│   Colleges │  │ ● Request transcript from counselor    2 days late   [ Do it ]│   │
│   Essays  4│  └───────────────────────────────────────────────────────────────┘   │
│   Recs   ●2│                                                                       │
│            │  TODAY                                                    +7 more ▾   │
│ MONEY      │  ☐ Draft UMich community essay          P1  ·  60m  ·  Essays        │
│   Aid      │  ☐ Email Ms. Chen the brag sheet        P1  ·  10m  ·  Recs          │
│   Scholar..│  ☐ Portal sweep — 4 schools             P2  ·  15m  ·  Weekly        │
│            │                                                                       │
│ LIBRARY    │  ┌──────────┬──────────┬──────────┬──────────┐                       │
│   Documents│  │   ◕ 68%  │   ◔ 41%  │   ◕ 75%  │   ◑ 50%  │                       │
│   Notes    │  │   Apps   │  Essays  │   Recs   │   Aid    │                       │
│   Analytics│  └──────────┴──────────┴──────────┴──────────┘                       │
│            │                                                                       │
│ ─────────  │  UPCOMING                                                             │
│ ◍ Maya R.  │  ┌───────────┐ ┌───────────┐ ┌───────────┐                           │
│            │  │ ED · Duke │ │ EA · UMich│ │ QB Rank   │                           │
│            │  │   12 d    │ │   12 d    │ │    3 d    │                           │
│            │  │ Nov 1     │ │ Nov 1     │ │ Oct 15    │                           │
│            │  └───────────┘ └───────────┘ └───────────┘                           │
│            │                                                                       │
│            │  FUNNEL                          WORKLOAD · next 16 weeks             │
│            │  Research ██ 2                   ▁▂▃▅█▇▅▃▂▁▁▂▄▆█▅                    │
│            │  Planning ████ 4                 Oct        Dec       Feb            │
│            │  Progress ██████ 6               ⚠ Week of Dec 29 looks heavy        │
│            │  Submitted ██ 2                                                       │
└────────────┴───────────────────────────────────────────────────────────────────────┘
```

### 7.2 Applications — board view

```
 Applications                              [ Board | Table | Timeline ]   ＋ Add school
 ─────────────────────────────────────────────────────────────────────────────────────
 Filter: All rounds ▾   All tiers ▾   Status ▾                        14 schools

 RESEARCHING 2      PLANNING 4         IN PROGRESS 6      SUBMITTED 2     DECIDED 0
 ┌─────────────┐   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
 │ Bowdoin     │   │ Rice        │    │ Duke   ◕68% │    │ UMich  ✓    │
 │ RD · Reach  │   │ ED2 · Reach │    │ ED1 · Reach │    │ EA · Target │
 │ Jan 1       │   │ Jan 4       │    │ ⏱ 12 days   │    │ ✓ Submitted │
 │ ○ 0/9       │   │ ◔ 2/11      │    │ 2 essays ⚠  │    │ ⚠ 1 unconf. │
 └─────────────┘   └─────────────┘    └─────────────┘    └─────────────┘
                                       ┌─────────────┐
 ⚠ Two binding ED applications (Duke ED1, Rice ED2). Only one is allowed. [ Review ]
```

### 7.3 Application detail

```
 ← Applications
 ┌───────────────────────────────────────────────────────────────────────────────────┐
 │  🅳  Duke University                                              ⋯               │
 │      ED I · Reach · In Progress                    ◕ 68%      ⏱ 12 days          │
 └───────────────────────────────────────────────────────────────────────────────────┘
  Overview  Checklist  Deadlines  Essays  Recs  Docs  Aid  Interview  Notes  Portal  Activity
 ─────────────────────────────────────────────────────────────────────────────────────
  CHECKLIST                                                       9 of 13 complete

  ✓  Common App core sections                    submitted      confirmed  Oct 12
  ✓  Personal statement (650w)                   submitted      confirmed  Oct 12
  ◐  "Why Duke?" supplement (250w)               drafting       180/250    [ open ]
  ○  Duke perspective supplement (250w)          not started               [ start ]
  ✓  Teacher rec — Ms. Chen (AP Bio)             submitted      confirmed  Oct 20
  ◐  Teacher rec — Mr. Patel (APUSH)             invited        ⏱ nudge Oct 24
  ✓  Counselor rec + School Report               submitted      confirmed  Oct 18
  ✓  Official transcript                         sent           ⚠ unconfirmed  [ verify ]
  ✓  SAT scores (1520)                           sent           confirmed  Sep 30
  ○  CSS Profile                                 not started    due Nov 1  [ start ]
  ○  FAFSA                                       not started    due Nov 1
  ○  Application fee / waiver                    not started
  —  Interview                                   college-initiated after submission

  ⚠ "Official transcript" has been unconfirmed for 9 days. Check the Duke portal.
```

### 7.4 Essay composer

```
 ← Essays        Why Duke? (250w)         ◐ Drafting ▾          ⌘S save version   ⋯
 ┌────────────────────────────────────────────────┬────────────────────────────────┐
 │ PROMPT                                         │ Versions │ Comments │ Reuse ▸  │
 │ What is your sense of Duke as a university…    │ ────────────────────────────── │
 │ 250 words or fewer.                            │ REUSE SUGGESTIONS              │
 │ ──────────────────────────────────────────────│                                │
 │                                                │ ┌────────────────────────────┐ │
 │   When I toured the Duke Marine Lab last       │ │ Why Michigan (400w)   82%  │ │
 │   spring, I expected to be shown a building.   │ │ Same kind: WHY_US          │ │
 │   Instead a sophomore handed me a corer and…   │ │ Tags: research, place      │ │
 │                                                │ │ Needs −150 words           │ │
 │                                                │ │            [ Adapt → ]     │ │
 │                                                │ └────────────────────────────┘ │
 │                                                │ ┌────────────────────────────┐ │
 │                                                │ │ UC PIQ #6 (350w)      54%  │ │
 │                                                │ │ ⚠ Different system — UC    │ │
 │                                                │ │   answers need rewriting,  │ │
 │                                                │ │   not trimming.            │ │
 │                                                │ └────────────────────────────┘ │
 ├────────────────────────────────────────────────┤                                │
 │ 180 / 250 words · 1,042 chars · 48s read       │ ASSIGNED TO                    │
 │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░  72%          ✓ saved 12s │ ● Duke ED1 — planned           │
 └────────────────────────────────────────────────┴────────────────────────────────┘
```

### 7.5 Command palette

```
        ┌──────────────────────────────────────────────────────────┐
        │ ⌕  duke                                                  │
        ├──────────────────────────────────────────────────────────┤
        │ APPLICATIONS                                             │
        │  🅳 Duke University            ED I · 12 days      ↵      │
        │ ESSAYS                                                   │
        │  ✎ Why Duke? (250w)            drafting · 180/250        │
        │  ✎ Duke perspective (250w)     not started               │
        │ TASKS                                                    │
        │  ☐ Finish Duke supplement      P1 · due Oct 27           │
        │ ACTIONS                                                  │
        │  ＋ Add a task to Duke                                   │
        │  ⏱ Record a decision for Duke                            │
        ├──────────────────────────────────────────────────────────┤
        │ ↑↓ navigate   ↵ open   ⌘↵ new tab   esc close            │
        └──────────────────────────────────────────────────────────┘
```

### 7.6 Financial aid comparison (April)

```
 Financial Aid › Compare offers                    ⏱ 23 days until May 1
 ─────────────────────────────────────────────────────────────────────────────────────
                          UMich        Duke         Rice         State U
  Cost of attendance     $78,400      $89,200      $76,800      $31,400
  ─────────────────────────────────────────────────────────────────────
  Institutional grant    $24,000      $61,000      $52,000       $2,000
  Federal/state grant     $7,395       $7,395       $7,395       $7,395
  Outside scholarships    $3,500       $3,500       $3,500       $3,500
  ─────────────────────────────────────────────────────────────────────
  ▸ NET PRICE            $43,505      $17,305      $13,905      $18,505
    4-year projection   $174,020      $69,220      $55,620      $74,020
  ─────────────────────────────────────────────────────────────────────
  Loans offered          $5,500       $5,500       $3,500       $5,500
  Work-study             $2,500       $3,000       $2,500           $0
  ℹ Loans and work-study are not subtracted — they're debt and wages, not discounts.

  [ Upload an award letter ]   [ Start an appeal ]   [ Export comparison PDF ]
```

### 7.7 Mobile (< 640px)

```
┌─────────────────────┐
│ ☰  Sequence     🔔  │
├─────────────────────┤
│ Good evening, Maya  │
│ 12 days to ED       │
│                     │
│ ┌─────────────────┐ │
│ │ ⚡ NEXT         │ │
│ │ Finish "Why     │ │
│ │ Duke?"  ~35 min │ │
│ │   [ Open → ]    │ │
│ └─────────────────┘ │
│                     │
│ TODAY            3  │
│ ☐ UMich essay       │
│ ☐ Email Ms. Chen    │
│ ☐ Portal sweep      │
│                     │
│ ◕68 ◔41 ◕75 ◑50    │
│ App  Ess  Rec  Aid  │
├─────────────────────┤
│ ⌂    ✓    ✎    ▤   │
│ Home Task Essay More│
└─────────────────────┘
```

## 8. Loading, Empty & Error States

**Skeletons** mirror final layout exactly — same dimensions, same rhythm — with a 1.6s
shimmer. No spinners above the fold, ever.

**Empty states** always: illustration → one honest sentence → one primary action.

| Surface | Copy | Action |
|---|---|---|
| Applications | "No schools yet. Add one and we'll build its checklist for you." | Add a school |
| Essays | "Essays show up here automatically when you add a college." | Add a school |
| Today (all clear) | "Nothing due today. Next up is Duke's supplement on Oct 27." | Work ahead |
| Search | "Nothing matches 'xyz'." | Create a task named "xyz" |
| Aid | "Tell us you need aid and we'll add FAFSA, CSS Profile, and your schools' deadlines." | Turn on aid tracking |

**Errors**: what happened, whether their data is safe, one recovery action. Server Action
failures surface as toasts with retry; optimistic updates roll back visibly.
