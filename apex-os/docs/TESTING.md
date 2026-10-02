# APEX OS — Testing

Runner: Vitest (`npm test`). Static checks: `npm run lint`, `npm run typecheck`, `npm run build`.

## Suites (`tests/`)
| Suite | Covers |
|---|---|
| `dates.test.ts` | logical day boundary (dayStartHour), ISO weeks, ranges, month math, leap years |
| `stats.test.ts` | median, MAD, Theil–Sen, Spearman, Cohen's d, percentiles, entropy |
| `events.test.ts` | payload validation, rejection of malformed events |
| `projector.test.ts` | timer lifecycle (pause/resume minutes), updates, deletes, settings versioning |
| `rebuild.test.ts` | incremental projection == full replay on a fictional multi-year dataset |
| `facts.test.ts` | DayFacts aggregation (phone denominators, ratios, deep classification) |
| `metrics.test.ts` | windows, ratio aggregation, streak, targets as-of settings version, execution %, phone compliance |
| `analytics.test.ts` | trend classes, anomalies, plateau/breakthrough, capacity, velocity, relations |
| `modules.test.ts` | German err/100, active ratio, law confidence matrix, retention buckets, overplanning, distraction cost, reclaimed time, sustainability warning, planning-replacing-execution |
| `forecast.test.ts` | pace, Monte Carlo reproducibility & bounds, scenarios, forecast error |
| `coach.test.ts` | priority formula, top-3 cap, planner capacity caps (never > sustained), maturity gating, experiment evaluation, recommendation verification |
| `backup.test.ts` | export → restore round trip, corrupted backup rejection (all-or-nothing), CSV import, duplicate event ids |
| `generator.test.ts` | multiple fictional years generate, determinism, performance budget |

## Fictional data
`src/data/generator.ts` creates deterministic multi-year personas (seeded PRNG):
phone reduction intervention, improving German error rate, a law area regression, overplanning period,
sustainability dip, tests and milestones. `npm run seed` (1 year) / `npm run seed:large` (3 years, high volume).

## Manual verification checklist
empty state · seeded state · long history (3y) · mobile (390 px) · desktop (1440 px) · corrupted backup ·
timer persistence across navigation · settings change keeps history · dark/light.

## Verification log (implementation run, 2026-10-02)
| Check | Result |
|---|---|
| `npm test` | 12 files, 71 tests passing |
| `npm run typecheck`, `npm run lint` | clean |
| `npm run build` | all 24 routes compile |
| Seed 2 fictional years | 20k events in 1.5 s; every route renders 200 in < 0.4 s |
| Large profile (3 y, 100 740 sessions, 985 093 answers, 203k events) | seed 16 s; full dataset rebuild 2.3 s (cached until the next write); insights 0.13 s |
| Browser workflow on an empty DB (Playwright) | empty state on all pages → goal → timer start → navigation + reload keep timer → pause/resume → finish with questions → phone grid → evening review → versioned settings change → corrupted backup rejected with data intact → export/restore round trip → Cmd+K search; no page errors |
| Layout | desktop 1440 px & mobile 390 px without horizontal page scroll; dark & light themes |

Known limitation: at stress volume the session projection load dominates (~1 s per 100k sessions). Realistic use
(≈5 sessions/day) stays far below that; incremental fact caching is the next optimisation if needed.
