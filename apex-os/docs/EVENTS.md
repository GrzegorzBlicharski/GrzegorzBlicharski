# APEX OS — Event Catalog

The event log is the single source of truth. Every user action, timer tick that matters, import and
setting change is an immutable event. Projections (tables) and all metrics are derived from events.

## Envelope
| Field | Type | Notes |
|---|---|---|
| `id` | INTEGER | monotonic sequence (replay order) |
| `event_id` | TEXT | UUID, globally unique (idempotent import) |
| `type` | TEXT | see catalog |
| `schema_version` | INTEGER | payload version for this type (upcasters live in `events/catalog.ts`) |
| `occurred_at` | TEXT | local wall-clock `YYYY-MM-DDTHH:mm[:ss]` when it happened |
| `recorded_at` | TEXT | ISO timestamp when written |
| `entity_id` | TEXT | id of the entity the event refers to (session, goal …) |
| `source` | TEXT | `manual`, `timer`, `quick`, `import:<name>`, `seed`, `system`, `ai` |
| `payload` | TEXT (JSON) | type-specific, validated on append |

Time model: APEX is single-user and local-first; times are stored as **local wall-clock** strings, which keeps
every computation independent of server time zone. The *logical day* uses `settings.dayStartHour`
(default 04:00): a session at 01:30 belongs to the previous day. Travel/DST: documented limitation.

## Lifecycle conventions
- Create: `<ENTITY>_CREATED` / domain verb (`SESSION_STARTED`, `TEST_RECORDED`).
- Edit: `<ENTITY>_UPDATED { id, patch }` — patch is shallow-merged; history stays in the log.
- Delete: `<ENTITY>_DELETED { id, reason? }` — projection row removed/flagged; event remains.
- Never mutate or delete an event row. Corrections are new events.

## Catalog

### Sessions (work, study, timer)
| Type | Payload |
|---|---|
| `SESSION_STARTED` | `sessionId, domain, activity, area?, title?, plannedStart?, plannedMinutes?, depth?, mode?, taskId?` |
| `SESSION_PAUSED` | `sessionId` (time = occurred_at) |
| `SESSION_RESUMED` | `sessionId` |
| `SESSION_COMPLETED` | `sessionId, focus?(1-5), interruptions?, contextSwitches?, output?, notes?, unfinished?, depth?` |
| `SESSION_LOGGED` | full retro session: `sessionId, domain, activity, area?, start, end or minutes, plannedStart?, focus?, interruptions?, contextSwitches?, output?, depth?, mode?, notes?, unfinished?` |
| `SESSION_UPDATED` | `sessionId, patch` |
| `SESSION_DELETED` | `sessionId` |

`output` keys (all optional numbers): `words, speakingMin, conversations, exercises, chapters, mockTests,
newWords, vocabReviews, questions, questionsCorrect, cases, statutes, pages, memos, contracts, analyses,
drafts, research, articles, judgments`.

### Plans & tasks
| Type | Payload |
|---|---|
| `DAY_PLANNED` | `day, plannedMinutes, byDomain?, availableMinutes?, energy?, mode?, blocks?[{domain, activity?, start, minutes}]` (latest per day wins) |
| `TASK_CREATED` | `taskId, title, domain, plannedDay, estMinutes?, priority?` |
| `TASK_STATUS_CHANGED` | `taskId, status: planned/started/completed/abandoned/postponed, newDay?` |
| `TASK_UPDATED` / `TASK_DELETED` | `taskId, patch` / `taskId` |
| `MORNING_CHECKIN` | `day, wakeTime?, availableMinutes?, energy?` |
| `DAILY_REVIEW_COMPLETED` | `day, executed: yes/partial/no, blocked?, worked?, tomorrowPriority?, durationSec?` |
| `PROTOCOL_DEFINED` | `protocolId, name, steps[{id, time?, label}]` |
| `PROTOCOL_UPDATED` / `PROTOCOL_DELETED` | |
| `PROTOCOL_RUN_LOGGED` | `day, protocolId, completedStepIds[]` |

### Digital hygiene
| Type | Payload |
|---|---|
| `PHONE_USAGE_ADDED` | `usageId, day, category, minutes, start?, end?, app?, pickups?` |
| `PHONE_USAGE_DELETED` | `usageId` |
| `PHONE_DAY_SUMMARY` | `day, pickups?, firstUse?, lastUse?, longestSessionMin?` (latest per day wins; derived values preferred when timed records exist) |

### German
| Type | Payload |
|---|---|
| `GERMAN_WRITING_EVALUATED` | `evalId, day, words, errors{category: count}, source?, ref?` |
| `GERMAN_SPEAKING_EVALUATED` | `evalId, day, minutes, errors{category: count}` |
| `VOCAB_REVIEW_LOGGED` | `day, reviewed, correct, newWords?, word?` (item-level when `word` is set) |

### Law & questions
| Type | Payload |
|---|---|
| `QUESTION_ANSWERED` | `attemptId, area, topic?, correct, confidence: high/low, responseSec?, difficulty?(1-3), setId?` |
| `QUESTION_SET_LOGGED` | `attemptId, area, topic?, total, correct, wrongConfident?, correctUnsure?, minutes?, difficulty?` |

### Tests & evidence
| Type | Payload |
|---|---|
| `TEST_RECORDED` | `testId, date, domain, kind: OFFICIAL/MOCK/EXTERNAL/SELF/SYSTEM, name, skill?, area?, score, maxScore, level?, ref?` |
| `TEST_DELETED` | `testId` |

### Goals & forecasts
| Type | Payload |
|---|---|
| `GOAL_CREATED` | `goalId, title, domain, kind: cumulative/level/manual, metricKey?, target, unit, startDate, deadline?, weight(1-5), tier: PRIMARY/SECONDARY/MAINTENANCE, leading?[metricKey]` |
| `GOAL_UPDATED` | `goalId, patch` |
| `GOAL_PROGRESS_RECORDED` | `goalId, date, value` (manual/level goals) |
| `GOAL_STATUS_CHANGED` | `goalId, status: active/achieved/paused/dropped` |
| `FORECAST_RECORDED` | `forecastId, goalId?, metricKey, method, horizonDate, projectedValue?, projectedDate?, p10?, p90?, assumptions` |

### Experiments, interventions, recommendations
| Type | Payload |
|---|---|
| `EXPERIMENT_CREATED` | `experimentId, title, hypothesis, change, metrics[metricKey], primaryMetric, baselineDays, durationDays, startDate` |
| `EXPERIMENT_UPDATED` | `experimentId, patch` |
| `EXPERIMENT_CONCLUDED` | `experimentId, decision: adopt/reject/extend/inconclusive, note?` |
| `INTERVENTION_STARTED` | `interventionId, bottleneck, action, metricKey, direction: up/down, durationDays: 14/30/90, startDate` |
| `INTERVENTION_ENDED` | `interventionId, note?` |
| `RECOMMENDATION_ISSUED` | `recId, ruleId, title, metricKey?, direction?, baselineValue?, horizonDays` |
| `RECOMMENDATION_STATUS_CHANGED` | `recId, status: accepted/rejected/implemented` |

### Recovery
| Type | Payload |
|---|---|
| `RECOVERY_LOGGED` | `day, sleepHours?, sleepQuality?(1-5), energy?(1-5), fatigue?(1-5), recovery?(1-5)` (latest per day wins, fields merged) |

### Career, timeline, notes
| Type | Payload |
|---|---|
| `COMPETENCY_DEFINED` | `competencyId, name, domain, tier?` |
| `COMPETENCY_EVIDENCE_ADDED` | `evidenceId, competencyId, type: test/project/exercise/document/assessment, title, date, score?, ref?` |
| `MILESTONE_RECORDED` | `milestoneId, date, kind: strategy/milestone/test/habit/intervention/goal/achievement/certification/exam/project/portfolio, title, ref?, notes?` |
| `MILESTONE_DELETED` | `milestoneId` |
| `NOTE_ADDED` | `noteId, day, kind: distraction/insight/general, text, sessionId?` |

### System
| Type | Payload |
|---|---|
| `SETTINGS_CHANGED` | `patch, effectiveFrom (day)` — creates a new settings version; previous versions kept |
| `UX_ENTRY_TIMED` | `form, durationMs, abandoned` — measures logging friction |
| `IMPORT_COMPLETED` | `source, count, note?` |

## Validation
`events/catalog.ts` validates every payload on append (required fields, enums, numeric ranges,
day format). Invalid events are rejected; restore of a backup validates all events first and refuses
partial restores (all-or-nothing transaction).
