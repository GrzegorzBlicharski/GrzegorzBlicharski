# APEX OS — Architecture

> Personal Performance, Learning & Life Intelligence System.
> North-star philosophy metric: **maximum verified long-term progress per sustainable hour of effort.**
> Not maximised: hours, streaks, tasks, busyness.

APEX OS is a *private, local-first, single-user* operating system for development.
Every day it answers six questions:

| # | Question | Where answered | Engine |
|---|----------|----------------|--------|
| 1 | Where am I? | Today (`/`), domain dashboards | `analytics/windows`, `modules/*` |
| 2 | Am I improving? | Trends, Compare, Now-vs-30d | `analytics/trend` |
| 3 | How fast? | Velocity / acceleration panels | `analytics/velocity` |
| 4 | What limits me now? | Bottleneck, weaknesses | `coach/diagnose` |
| 5 | What gives the biggest progress now? | Leverage, one biggest lever | `coach/priority` |
| 6 | What should I do today? | Top-3 priorities, adaptive plan | `coach/planner` |

## 1. Conceptual model

### Value chain
```
LIFE INPUTS → ATTENTION → TIME → WORK → LEARNING → OUTPUT → KNOWLEDGE → SKILL
            → PERFORMANCE → RESULTS → GOALS → ADAPTATION
```
Each link is measured by a different class of data:

| Link | Example data | Metric family |
|------|--------------|---------------|
| Life inputs | sleep, energy, available time | `recovery.*` (self-reported) |
| Attention | phone, interruptions, switches, focus | `phone.*`, `attention.*` |
| Time | session minutes, plan vs actual | `time.*`, `exec.*` |
| Work | sessions by depth/value class | `deep.*`, `value.*` |
| Learning | active vs passive, recall ratio | `learning.*`, `german.active*` |
| Output | words, speaking min, questions, memos | `german.words`, `law.questions` |
| Knowledge | accuracy, retention by interval | `law.accuracy`, `law.retention.*` |
| Skill | error rates, test scores, competency evidence | `german.err100`, `tests.*` |
| Performance | mock/official results | `tests.*` (lagging) |
| Goals | goal pace, forecast | `goal.*` |
| Adaptation | experiments, interventions, recommendation verification | `experiments`, `coach` |

### Main loop
```
MEASURE → UNDERSTAND → DETECT → DIAGNOSE → PRIORITIZE → ACT → TEST → VERIFY → ADAPT
```
| Step | Implementation |
|------|----------------|
| Measure | append-only event store (`events` table), quick entry, timer, importers |
| Understand | projections → `DayFacts` → metric series with 7/30/90/365/all windows |
| Detect | anomalies (robust z), trend class, plateau/breakthrough, regression alerts |
| Diagnose | weakness/bottleneck rules with evidence, severity, confidence, goal relevance |
| Prioritize | visible priority score (Impact, Urgency, Confidence, Alignment, Effort) |
| Act | top-3 priorities, adaptive plan (minimum/normal/high-capacity), protocols |
| Test | experiments (max N concurrent), interventions 14/30/90 d |
| Verify | experiment evaluation with effect sizes + N; recommendation outcome tracking; forecast error log |
| Adapt | weekly KEEP/INCREASE/REDUCE/STOP/START/TEST, "How I work best" |

### Domains
Every domain is split into **INPUT → PROCESS → OUTPUT → OUTCOME**:

| Domain | Input | Process | Output | Outcome |
|---|---|---|---|---|
| German | minutes by skill, active/passive | active ratio, skill mix vs target | words, speaking min, exercises, reviews | error rates, test results, CEFR evidence |
| Law | minutes by area, reading | recall ratio, coverage, balance | questions, cases, memos, drafts | accuracy, retention, mock results, readiness components |
| Productivity | planned minutes | start delay, completion | actual productive minutes | execution %, goal pace |
| Attention | focus ratings | interruptions, switches/h | deep blocks | deep-work capacity trend |
| Digital hygiene | phone minutes by category | no-phone window compliance, pickups | budget remaining | distraction cost, reclaimed time conversion |
| Deep work | planned deep blocks | block length | deep hours | avg/longest block trend |
| Execution | tasks planned | started/postponed/abandoned | completed | completion rate, overplanning detection |
| Learning | consumption minutes | active-recall ratio | retrieval/production output | retention, velocity |
| Recovery | sleep, energy (optional) | workload vs capacity | — | sustainability warnings |
| Goals | targets, deadlines, weights | leading indicators | progress | lagging indicators, forecast accuracy |
| Career | courses, applications | portfolio work | documents/projects | competency evidence, certificates |
| Personal systems | system-building time | planning/entry overhead | — | "planning may be replacing execution" guard |

## 2. Technical architecture

```
┌──────────────────────── UI (Next.js App Router, React, Tailwind) ─────────────────────────┐
│  Today · Log (mobile) · Domain dashboards · Analyze/Compare/Explore · Coach · Reports    │
│  Server Components read via `server/context.ts`; mutations via Server Actions            │
└───────────────────────────────▲───────────────────────────────────┬──────────────────────┘
                                │ ViewModels (plain JSON)           │ appendEvent(...)
┌───────────────────────────────┴───────────────┐   ┌───────────────▼───────────────────────┐
│ Intelligence layer (pure TypeScript, no I/O)  │   │ Data layer                            │
│  analytics/  trend, windows, stats, anomalies │   │  events/catalog  (types + validation) │
│  modules/    german, law, digital, attention, │   │  data/store      append-only log      │
│              execution, recovery, goals ...   │   │  data/projector  event → tables       │
│  forecasting/ pace, monte carlo, simulations  │   │  data/facts      SQL aggregates →     │
│  experiments/ evaluation                      │◄──┤                  DayFacts[]           │
│  coach/      diagnose, priority, planner,     │   │  data/backup     JSON/CSV export,     │
│              weekly, how-I-work, reliability  │   │                  restore, validation  │
│  metrics/    registry (formula, type, version)│   │  data/importers  Screen Time CSV, JSON│
└───────────────────────────────────────────────┘   └───────────────┬───────────────────────┘
                                                                    │ node:sqlite (local file)
                                                          ┌─────────▼─────────┐
                                                          │ SQLite  data/apex.db │
                                                          └───────────────────┘
```

### Principles
1. **Event-sourced.** The `events` table is the only source of truth. Every projection table can be
   dropped and rebuilt (`npm run rebuild`); a test asserts *incremental projection == full replay*.
2. **Pure intelligence layer.** All analytics are pure functions over `DayFacts[]` + small entity lists.
   No AI dependency. Every number is reproducible from events + metric version.
3. **Transparent.** Each metric has a registry entry (formula, type, source, min sample, limitations,
   version). The UI exposes "How calculated" on KPIs. Insights carry `n` and a confidence label.
4. **Local-first & private.** SQLite file on disk, no network calls, no telemetry. External connectors are
   *importers* that produce events; the core never depends on an external API.
5. **Never silently overwrite.** Settings are versioned (`SETTINGS_CHANGED` with `effectiveFrom`); targets
   are evaluated *as of* the day they applied. Edits are `*_UPDATED` events, deletes are tombstones.
6. **Operationally simple.** Daily manual input target < 2 min. Totals, averages, streaks, forecasts are
   never entered manually.
7. **Sustainability guard-rails.** The planner never schedules beyond historically sustained capacity ×1.1,
   never treats sleep as a resource to cut, and caps high-capacity days.
8. **Not reactive to noise.** Insights need minimum samples; a single bad session never changes strategy;
   data-maturity stages gate recommendation types.

### Module map (`src/`)
| Module | Responsibility |
|---|---|
| `core/` | dates (day boundary, ISO weeks), stats, RNG, shared types, settings schema & defaults |
| `events/` | event catalog, payload validation, schema versions |
| `data/` | DB connection, migrations, event store, projector, facts builder, queries, backup/restore, importers, fictional data generator |
| `domains/` | catalog: session domains, activities, German skills, law areas, phone categories, error categories |
| `metrics/` | series metric catalog (extractors over DayFacts) + documentation registry |
| `analytics/` | windows, trends, velocity/acceleration, correlation/effect sizes, anomalies, capacity, plateau/breakthrough |
| `modules/` | domain analyzers: german, law, digital, attention, execution, recovery, goals, career, learning |
| `forecasting/` | goal pace, Monte Carlo, scenario simulation, forecast log resolution |
| `experiments/` | experiment/intervention evaluation |
| `coach/` | candidate generation, diagnosis, priority scoring, planner, weekly review, lever, how-I-work, reliability, recommendation verification |
| `reports/` | weekly / monthly / 90-day / annual report assembly |
| `server/` | request context (cached facts keyed on last event id), server actions, search |
| `app/` | routes |
| `components/` | UI kit: KPI, panels, charts, tables, command palette, timer |

### Scale design
- Target: 100k sessions, 1M question attempts, multi-year history.
- Analytics run on **daily aggregates** produced by indexed SQL `GROUP BY day` queries (≈ 365 rows/year),
  never on raw rows in JS. Topic-level retention uses SQL window functions (`LAG`) over indexed columns.
- Facts are memoised per process keyed by `max(events.id)` → any write invalidates.
- Batch logging (question sets) is stored as aggregate attempt rows (`n`, `n_correct`, confidence quadrants),
  so 1M answers do not require 1M rows unless entered individually.

### Migration path
- Repository code uses plain SQL with portable types (TEXT/INTEGER/REAL). PostgreSQL migration = new
  driver implementing `Db` (prepare/run/all/get/transaction) + translated migrations.
- Because events are the source of truth, migration can also be done by *replaying the event log* into any
  new store.

### AI extension points (not required by core)
`coach/ai.ts` declares interfaces (`Summarizer`, `WritingEvaluator`, `Classifier`). The core never calls
them; when configured they may *produce events* (e.g. `GERMAN_WRITING_EVALUATED` with `source: "ai"`),
which keeps every downstream number reproducible.

## 3. Screens (information architecture)

| Route | Purpose |
|---|---|
| `/` | Today: <10 s status — targets, phone budget, execution, streak (secondary), goal pace, bottleneck, top weakness, most important action, top 3, sustainability, momentum |
| `/log` | Mobile quick entry: timer, phone, question set, German output, recovery, evening review (30–60 s) |
| `/sessions` | Session list, CRUD, filters |
| `/german`, `/law` | Domain telemetry dashboards |
| `/digital` | Digital hygiene: budget, compliance, categories, no-phone windows, distraction cost, reclaimed time |
| `/attention` | Focus, deep work capacity, best hours, start delays, switches |
| `/execution` | Plan vs actual, tasks, overplanning, protocols |
| `/recovery` | Sustainability, capacity, optional sleep/energy relationships |
| `/goals` | Goals, pace, floor/target/stretch, leading vs lagging, forecasts |
| `/forecast` | Scenarios, Monte Carlo, forecast log & model error |
| `/analyze` | Explorer (metric vs metric), compare Date A vs Date B, now vs 30d, trends, records |
| `/experiments` | Experiments & interventions |
| `/coach` | Bottlenecks, leverage, priorities with formula, weekly review, one biggest lever, known/likely/unknown, recommendation track record |
| `/reports` | Weekly, monthly, 90-day transformation, annual, "How I work best" |
| `/career` | Competency map with evidence, achievements, specialization depth |
| `/timeline` | Milestones, strategy changes, interventions |
| `/metrics` | Metric registry ("how calculated") |
| `/data` | Export / import / restore / CSV import / validation / rebuild |
| `/settings` | Targets (versioned), phone limit, no-phone windows, budgets, minimum day, protocols, classification rules |

## 4. Delivery phases
| Phase | Scope | Status |
|---|---|---|
| 1 | Foundation: event store, projections, sessions, timer, goals, settings versioning | implemented |
| 2 | German & Law telemetry | implemented |
| 3 | Phone, attention, execution, deep work | implemented |
| 4 | Analytics, trends, forecasts | implemented |
| 5 | Weakness, bottleneck, intervention, experiments | implemented |
| 6 | Adaptive planner, coach | implemented (rule-based) |
| 7 | Advanced analyst tools (explorer, compare, reports) | implemented, iterating |
