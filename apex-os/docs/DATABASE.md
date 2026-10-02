# APEX OS — Database

Engine: SQLite via Node's built-in `node:sqlite` (no native build step, local file `data/apex.db`,
override with `APEX_DB_PATH`). All SQL is portable (TEXT/INTEGER/REAL, no SQLite-only types) to allow a
PostgreSQL driver later. Migrations: `src/data/migrations.ts` (ordered, recorded in `schema_migrations`).

## Source of truth
```sql
events(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  schema_version INTEGER NOT NULL,
  occurred_at TEXT NOT NULL,
  recorded_at TEXT NOT NULL,
  entity_id TEXT,
  source TEXT NOT NULL,
  payload TEXT NOT NULL      -- JSON
)
INDEX events(type), events(entity_id), events(occurred_at)
```

## Projections (rebuildable from events)
| Table | Key columns | Notes |
|---|---|---|
| `sessions` | `id, day, domain, activity, area, mode, depth, depth_source, start, end, minutes, paused_minutes, planned_start, planned_minutes, start_delay, focus, interruptions, context_switches, status (running/paused/completed/unfinished), output JSON, words, speaking_min, questions, pages, cases, memos, value_class, notes, task_id, paused_at` | indexes `(day)`, `(domain, day)`, `(status)` |
| `plans` | `day PK, planned_minutes, by_domain JSON, available_minutes, energy, mode, blocks JSON` | latest DAY_PLANNED wins |
| `tasks` | `id, title, domain, planned_day, est_minutes, priority, status, created_day, closed_day, postpone_count` | |
| `phone_usage` | `id, day, category, minutes, start, end, app, pickups, source` | `(day)` |
| `phone_days` | `day PK, pickups, first_use, last_use, longest_session_min` | manual summary |
| `question_attempts` | `id, ts, day, area, topic, n, n_correct, n_correct_conf, n_correct_unsure, n_wrong_conf, n_wrong_unsure, response_sec, difficulty, minutes, set_id` | `(day)`, `(area, day)`, `(area, topic, ts)` for LAG-based retention |
| `german_evals` | `id, day, kind (writing/speaking), words, minutes, errors_total, errors JSON` | |
| `german_eval_errors` | `eval_id, day, kind, category, count` | normalised for category trends |
| `vocab_reviews` | `id, day, reviewed, correct, new_words, word` | |
| `tests` | `id, date, domain, kind, name, skill, area, score, max_score, pct, level, ref` | |
| `goals` | `id, title, domain, kind, metric_key, target, unit, start_date, deadline, weight, tier, leading JSON, status` | |
| `goal_progress` | `goal_id, date, value` | manual goals |
| `forecasts` | `id, created_at, goal_id, metric_key, method, horizon_date, projected_value, projected_date, p10, p90, assumptions JSON` | resolution computed at read time |
| `experiments` | `id, title, hypothesis, change, metrics JSON, primary_metric, baseline_days, duration_days, start_date, status, decision, note` | |
| `interventions` | `id, bottleneck, action, metric_key, direction, duration_days, start_date, ended_at, note` | |
| `recommendations` | `id, issued_day, rule_id, title, metric_key, direction, baseline_value, horizon_days, status, status_day` | |
| `recovery` | `day PK, sleep_hours, sleep_quality, energy, fatigue, recovery` | |
| `reviews` | `day PK, executed, blocked, worked, tomorrow_priority, duration_sec` | |
| `checkins` | `day PK, wake_time, available_minutes, energy` | |
| `protocols` | `id, name, steps JSON, active` | |
| `protocol_runs` | `day, protocol_id, completed JSON, completed_count, total` | PK `(day, protocol_id)` |
| `competencies` / `competency_evidence` | | |
| `milestones` | `id, date, kind, title, ref, notes` | |
| `notes` | `id, day, kind, text, session_id` | searchable |
| `settings_versions` | `id, effective_from, recorded_at, data JSON` | full snapshot per version; never overwritten |
| `ux_entries` | `id, ts, form, duration_ms, abandoned` | |
| `imports` | `id, ts, source, count, note` | |

## Rebuild
`rebuildProjections(db)` deletes all projection rows and replays `events` ordered by `id` through the same
projector used on append. Test `projector.rebuild.test.ts` asserts identical table contents.

## Derived layer: DayFacts
`data/facts.ts` executes ~12 grouped queries (`GROUP BY day[, domain|area|category|hour]`) and assembles one
`DayFacts` object per logical day. All analytics consume `DayFacts[]`. For 3 years this is ~1 100 objects
regardless of how many raw rows exist.

## Backup
- **Complete backup** = JSON `{ format: "apex-os-backup", version, exportedAt, events: [...] }`. Restore =
  validate all → wipe → insert events → rebuild projections (single transaction).
- **CSV exports** of key projections (sessions, phone, attempts, tests, daily facts) for spreadsheets.
- **Import**: Screen Time–style CSV (`date,category,minutes[,start,end,app,pickups]`), generic JSON events
  (deduplicated by `event_id`).

## Performance notes
- WAL mode, `synchronous=NORMAL`, prepared statements, one transaction per append batch.
- Seeding 3 fictional years with the large profile (~100k sessions, ~1M answered questions as aggregate +
  individual rows) is supported by `npm run seed:large`.
