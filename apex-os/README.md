# APEX OS

**Personal Performance, Learning & Life Intelligence System** — a private, local-first operating system for
one person's long-term development.

Philosophy metric: **maximum verified long-term progress per sustainable hour of effort.**
Not hours, streaks, tasks or busyness. Sleep, recovery and real-life obligations are never traded away.

Every day it answers: *Where am I? Am I improving? How fast? What limits me? What gives the biggest progress
now? What should I do today?*

## Quick start

```bash
cd apex-os
npm install
npm run build && npm start        # http://localhost:3000  (or: npm run dev)
```

Requires Node ≥ 22.13 (uses the built-in `node:sqlite`; no native build step). Data lives in `data/apex.db`
(override with `APEX_DB_PATH`). Nothing is sent over the network.

To explore with **fictional** data: open *Data & backup → Load fictional demo data* (labelled in the header),
or `npm run seed -- --years=2 --reset=true`. Wipe it before real use.

## Daily use (< 2 minutes of input)
1. **Quick log** (`/log`, mobile-friendly): start/stop the timer or log a session, phone minutes per category,
   a question set, and the 4-question evening review.
2. **Today** (`/`): status in under 10 seconds — targets, phone budget, execution, goal pace, bottleneck,
   top weakness, most important action, top-3 priorities, sustainability, momentum. Every KPI drills down.
3. **Plan** (`/plan`): adaptive minimum / normal / high-capacity plan, capped by your historically sustained capacity.
4. Weekly: **Coach** (`/coach`) and **Reports** (`/reports`).

Totals, averages, streaks, trends and forecasts are never entered by hand.

## What is inside
| Area | Highlights |
|---|---|
| Data | Append-only event log (SQLite), validated catalog, rebuildable projections, versioned settings, JSON/CSV export, all-or-nothing restore, Screen-Time CSV import |
| German | skill mix vs your target mix, active/passive ratio, errors/100 words & per speaking minute, recurring error categories, CEFR evidence ladder (OFFICIAL > EXTERNAL > MOCK > SELF > SYSTEM) |
| Law | area map, confidence matrix (incorrect + confident flagged), retention by review interval, forgetting risk, readiness *components*, reading-vs-retention check, value per hour |
| Digital hygiene | configurable phone limit, compliance (limit as of each day), categories, no-phone windows, distraction cost, reclaimed time & conversion, budgets |
| Attention | deep-work classification, capacity evolution, best hours computed from data, session-length effects, start delays, switches |
| Execution | plan vs actual, systematic overplanning, task flow, protocols, minimum day, consistency, planning-replacing-execution guard |
| Sustainability | sustained 7/30/90-day capacity, behavioural sustainability warning, optional sleep/energy relations |
| Analytics | 7D/30D/90D/365D/ALL windows, trends, velocity & acceleration, anomalies, plateaus/breakthroughs, relations with n + CI + effect sizes, Date A vs Date B, 30 days ago vs now, year over year |
| Forecasting | goal pace, reproducible Monte Carlo, scenarios, forecast log with model error & calibration |
| Coach | FACT → INTERPRETATION → ACTION insights, visible priority formula, top-3, bottleneck per goal, weekly KEEP/INCREASE/REDUCE/STOP/START/TEST, one biggest lever, known/likely/unknown, how I work best, recommendation hit rate |
| Experiments | hypothesis/baseline/period/result/decision, concurrency limit, 14/30/90-day interventions |

## Documentation
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) · [`DATABASE.md`](docs/DATABASE.md) · [`EVENTS.md`](docs/EVENTS.md) ·
[`METRICS.md`](docs/METRICS.md) (generated) · [`ANALYTICS.md`](docs/ANALYTICS.md) · [`FORECASTING.md`](docs/FORECASTING.md) ·
[`COACH_ENGINE.md`](docs/COACH_ENGINE.md) · [`TESTING.md`](docs/TESTING.md)

## Scripts
| Command | Purpose |
|---|---|
| `npm test` | Vitest suites (date logic, stats, events, projector, rebuild, metrics, analytics, modules, forecasting, coach, backup, multi-year fiction) |
| `npm run lint` / `npm run typecheck` / `npm run build` | static checks |
| `npm run seed -- --years=2 --reset=true` | fictional data into `data/apex.db` |
| `npm run seed:large -- --reset=true` | 3-year high-volume stress profile (~100k sessions, ~1M answers) |
| `npm run docs:metrics` | regenerate `docs/METRICS.md` from the registry |
| `npm run rebuild` | drop and replay all projections from the event log |
