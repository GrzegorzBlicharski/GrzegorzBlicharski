# APEX OS — Metrics Registry

Generated from `src/metrics/registry.ts` (`npm run docs:metrics`). Do not edit by hand.

Every number in APEX OS is reproducible from the event log plus the metric version below.
Types: MEASURED · SELF-REPORTED · DERIVED · ESTIMATED · FORECASTED.

Windows for every series metric: 7D · 30D · 90D · 365D · ALL (inclusive of the as-of day, clipped to the first tracked day).

## PRODUCTIVITY

### Productive time (core) `productive.min`

| Field | Value |
|---|---|
| DOMAIN | PRODUCTIVITY |
| TYPE | MEASURED |
| FORMULA | Σ minutes of completed sessions in core domains (German, Law, Career, Learning) |
| AGGREGATION | sum · calendar days |
| SOURCE | sessions |
| MIN SAMPLE | 7 days |
| LIMITATIONS | System building and admin are excluded by design; time ≠ progress. |
| VERSION | 1 |

### All tracked work `total.min`

| Field | Value |
|---|---|
| DOMAIN | PRODUCTIVITY |
| TYPE | MEASURED |
| FORMULA | Σ minutes of all completed sessions |
| AGGREGATION | sum · calendar days |
| SOURCE | sessions |
| MIN SAMPLE | 7 days |
| LIMITATIONS | Includes system building and admin. |
| VERSION | 1 |

### High-value share `value.highShare`

| Field | Value |
|---|---|
| DOMAIN | PRODUCTIVITY |
| TYPE | DERIVED |
| FORMULA | Σ minutes classified high-value / Σ all work minutes |
| AGGREGATION | ratio · days with data · ×100 |
| SOURCE | sessions + settings.classificationRules |
| MIN SAMPLE | 7 days |
| LIMITATIONS | Rule-based classification, user-editable. |
| VERSION | 1 |

## DEEP WORK

### Deep work `deep.min`

| Field | Value |
|---|---|
| DOMAIN | DEEP WORK |
| TYPE | DERIVED |
| FORMULA | Σ minutes of sessions classified DEEP (see classification rule v1) |
| AGGREGATION | sum · calendar days |
| SOURCE | sessions + settings.deep |
| MIN SAMPLE | 7 days |
| LIMITATIONS | Classification depends on self-rated focus and logged interruptions. |
| VERSION | 1 |

### Deep work ratio `deep.ratio`

| Field | Value |
|---|---|
| DOMAIN | DEEP WORK |
| TYPE | DERIVED |
| FORMULA | Σ deep minutes / Σ all work minutes |
| AGGREGATION | ratio · days with data · ×100 |
| SOURCE | sessions |
| MIN SAMPLE | 7 days |
| LIMITATIONS | Passive sessions are LIGHT by definition. |
| VERSION | 1 |

### Average deep block `deep.avgBlock`

| Field | Value |
|---|---|
| DOMAIN | DEEP WORK |
| TYPE | DERIVED |
| FORMULA | Σ deep block minutes / number of deep blocks |
| AGGREGATION | ratio · days with data |
| SOURCE | sessions |
| MIN SAMPLE | 5 days |
| LIMITATIONS | Pauses inside a timer session are excluded from minutes but do not split blocks. |
| VERSION | 1 |

### Longest deep block `deep.longest`

| Field | Value |
|---|---|
| DOMAIN | DEEP WORK |
| TYPE | DERIVED |
| FORMULA | max deep block minutes in window |
| AGGREGATION | max · days with data |
| SOURCE | sessions |
| MIN SAMPLE | 1 days |
| LIMITATIONS | Single-session record; not a sustained capacity measure. |
| VERSION | 1 |

### Session depth classification `classify.depth`

| Field | Value |
|---|---|
| DOMAIN | DEEP WORK |
| TYPE | DERIVED |
| FORMULA | DEEP if minutes ≥ deep.minMinutes ∧ interruptions ≤ deep.maxInterruptions ∧ (focus ≥ deep.minFocus ∨ unrated & active); LIGHT if minutes < 25 ∨ focus ≤ 2 ∨ passive; else NORMAL; user override wins |
| AGGREGATION | per session |
| SOURCE | sessions + settings (as of session day) |
| MIN SAMPLE | — |
| LIMITATIONS | Self-rated focus. |
| VERSION | 1 |

## PERSONAL SYSTEMS

### System building `system.min`

| Field | Value |
|---|---|
| DOMAIN | PERSONAL SYSTEMS |
| TYPE | MEASURED |
| FORMULA | Σ minutes in domain SYSTEM |
| AGGREGATION | sum · calendar days |
| SOURCE | sessions |
| MIN SAMPLE | 7 days |
| LIMITATIONS | Only counts sessions logged as SYSTEM. |
| VERSION | 1 |

### System-building share `system.share`

| Field | Value |
|---|---|
| DOMAIN | PERSONAL SYSTEMS |
| TYPE | DERIVED |
| FORMULA | Σ SYSTEM minutes / Σ all work minutes |
| AGGREGATION | ratio · days with data · ×100 |
| SOURCE | sessions |
| MIN SAMPLE | 7 days |
| LIMITATIONS | Some system work is valuable; the warning triggers only with flat execution. |
| VERSION | 1 |

### Evening review done `review.done`

| Field | Value |
|---|---|
| DOMAIN | PERSONAL SYSTEMS |
| TYPE | MEASURED |
| FORMULA | days with evening review / calendar days |
| AGGREGATION | ratio · calendar days · ×100 |
| SOURCE | reviews |
| MIN SAMPLE | 7 days |
| LIMITATIONS | — |
| VERSION | 1 |

### Planning may be replacing execution `planning.guard`

| Field | Value |
|---|---|
| DOMAIN | PERSONAL SYSTEMS |
| TYPE | DERIVED |
| FORMULA | (SYSTEM 14D ≥ 1.25× prev ∧ core 14D ≤ 1.05× prev ∧ SYSTEM ≥ 120 min) ∨ SYSTEM share ≥ 25% |
| AGGREGATION | 14D |
| SOURCE | sessions |
| MIN SAMPLE | 28 days |
| LIMITATIONS |  |
| VERSION | 1 |

## ATTENTION

### Focus (minute-weighted) `focus.avg`

| Field | Value |
|---|---|
| DOMAIN | ATTENTION |
| TYPE | SELF_REPORTED |
| FORMULA | Σ(focus × minutes) / Σ minutes of rated sessions (1–5) |
| AGGREGATION | ratio · days with data |
| SOURCE | sessions.focus |
| MIN SAMPLE | 7 days |
| LIMITATIONS | Self-rated; scale drift over months is possible. |
| VERSION | 1 |

### Interruptions / hour `interruptions.perHour`

| Field | Value |
|---|---|
| DOMAIN | ATTENTION |
| TYPE | DERIVED |
| FORMULA | Σ interruptions / Σ work hours |
| AGGREGATION | ratio · days with data |
| SOURCE | sessions.interruptions |
| MIN SAMPLE | 7 days |
| LIMITATIONS | Unlogged interruptions count as zero. |
| VERSION | 1 |

### Context switches / hour `switches.perHour`

| Field | Value |
|---|---|
| DOMAIN | ATTENTION |
| TYPE | DERIVED |
| FORMULA | Σ context switches / Σ hours of sessions where switches were logged |
| AGGREGATION | ratio · days with data |
| SOURCE | sessions.context_switches |
| MIN SAMPLE | 7 days |
| LIMITATIONS | Switching is not assumed to be bad; see relations. |
| VERSION | 1 |

### Unfinished sessions `unfinished.rate`

| Field | Value |
|---|---|
| DOMAIN | ATTENTION |
| TYPE | DERIVED |
| FORMULA | unfinished sessions / all sessions |
| AGGREGATION | ratio · days with data · ×100 |
| SOURCE | sessions.status |
| MIN SAMPLE | 10 days |
| LIMITATIONS | Depends on honest marking of unfinished sessions. |
| VERSION | 1 |

### Best working hours `bestHours`

| Field | Value |
|---|---|
| DOMAIN | ATTENTION |
| TYPE | DERIVED |
| FORMULA | per clock hour (minutes spread): weighted focus, completion, accuracy; score = mean z across qualifying hours (≥5 sessions, ≥300 min); best contiguous 3h block |
| AGGREGATION | 180D |
| SOURCE | sessions + question timestamps |
| MIN SAMPLE | 6 qualifying hours |
| LIMITATIONS |  |
| VERSION | 1 |

## EXECUTION

### Start delay (median) `startDelay.median`

| Field | Value |
|---|---|
| DOMAIN | EXECUTION |
| TYPE | DERIVED |
| FORMULA | median(actual start − planned start) over sessions with a planned start |
| AGGREGATION | median · days with data |
| SOURCE | sessions.planned_start |
| MIN SAMPLE | 5 days |
| LIMITATIONS | Only sessions started from a planned block. |
| VERSION | 1 |

### Plan execution `exec.pct`

| Field | Value |
|---|---|
| DOMAIN | EXECUTION |
| TYPE | DERIVED |
| FORMULA | Σ actual work minutes / Σ planned minutes (days with a plan) |
| AGGREGATION | ratio · days with data · ×100 |
| SOURCE | plans + sessions |
| MIN SAMPLE | 7 days |
| LIMITATIONS | Can exceed 100%. Unplanned days are excluded. |
| VERSION | 1 |

### Planned time `plan.min`

| Field | Value |
|---|---|
| DOMAIN | EXECUTION |
| TYPE | MEASURED |
| FORMULA | mean planned minutes on days with a plan |
| AGGREGATION | mean · days with data |
| SOURCE | plans |
| MIN SAMPLE | 7 days |
| LIMITATIONS | — |
| VERSION | 1 |

### Task completion `tasks.completion`

| Field | Value |
|---|---|
| DOMAIN | EXECUTION |
| TYPE | DERIVED |
| FORMULA | completed tasks / tasks planned for the day (final planned day) |
| AGGREGATION | ratio · days with data · ×100 |
| SOURCE | tasks |
| MIN SAMPLE | 7 days |
| LIMITATIONS | Postponed tasks count on their final planned day. |
| VERSION | 1 |

### Minimum day kept `consistency.minimumDay`

| Field | Value |
|---|---|
| DOMAIN | EXECUTION |
| TYPE | DERIVED |
| FORMULA | days meeting every minimum-day item / calendar days |
| AGGREGATION | ratio · calendar days · ×100 |
| SOURCE | DayFacts + minimum day definition |
| MIN SAMPLE | 14 days |
| LIMITATIONS | Minimum-day definition may be system-suggested; see Settings. |
| VERSION | 1 |

### Systematic overplanning `exec.overplanning`

| Field | Value |
|---|---|
| DOMAIN | EXECUTION |
| TYPE | DERIVED |
| FORMULA | ≥10 planned days in 30D ∧ Σactual/Σplanned < 85%; suggested base = round15(median actual × 1.05) |
| AGGREGATION | 30D |
| SOURCE | plans + sessions |
| MIN SAMPLE | 10 planned days |
| LIMITATIONS |  |
| VERSION | 1 |

### Suggested minimum day `consistency.minimumDay.suggest`

| Field | Value |
|---|---|
| DOMAIN | EXECUTION |
| TYPE | DERIVED |
| FORMULA | per PRIMARY goal sum metric present on ≥70% of last 60 days: round5(P25 of active days ÷ 2) |
| AGGREGATION | 60D |
| SOURCE | DayFacts + goals |
| MIN SAMPLE | 10 active days |
| LIMITATIONS | Overridable in settings. |
| VERSION | 1 |

## GERMAN

### German time `german.min`

| Field | Value |
|---|---|
| DOMAIN | GERMAN |
| TYPE | MEASURED |
| FORMULA | Σ German session minutes |
| AGGREGATION | sum · calendar days |
| SOURCE | sessions |
| MIN SAMPLE | 7 days |
| LIMITATIONS | Time is an input, not an outcome. |
| VERSION | 1 |

### German active time `german.activeMin`

| Field | Value |
|---|---|
| DOMAIN | GERMAN |
| TYPE | MEASURED |
| FORMULA | Σ German minutes in active mode |
| AGGREGATION | sum · calendar days |
| SOURCE | sessions.mode |
| MIN SAMPLE | 7 days |
| LIMITATIONS | Mode defaults by activity; overridable per session. |
| VERSION | 1 |

### German passive time `german.passiveMin`

| Field | Value |
|---|---|
| DOMAIN | GERMAN |
| TYPE | MEASURED |
| FORMULA | Σ German minutes in passive mode |
| AGGREGATION | sum · calendar days |
| SOURCE | sessions.mode |
| MIN SAMPLE | 7 days |
| LIMITATIONS | — |
| VERSION | 1 |

### German active ratio `german.activeRatio`

| Field | Value |
|---|---|
| DOMAIN | GERMAN |
| TYPE | DERIVED |
| FORMULA | Σ active German minutes / Σ German minutes |
| AGGREGATION | ratio · days with data · ×100 |
| SOURCE | sessions |
| MIN SAMPLE | 7 days |
| LIMITATIONS | — |
| VERSION | 1 |

### Words written `german.words`

| Field | Value |
|---|---|
| DOMAIN | GERMAN |
| TYPE | MEASURED |
| FORMULA | Σ output.words of German sessions |
| AGGREGATION | sum · calendar days |
| SOURCE | sessions.output |
| MIN SAMPLE | 7 days |
| LIMITATIONS | — |
| VERSION | 1 |

### Speaking minutes `german.speakingMin`

| Field | Value |
|---|---|
| DOMAIN | GERMAN |
| TYPE | MEASURED |
| FORMULA | Σ output.speakingMin of German sessions |
| AGGREGATION | sum · calendar days |
| SOURCE | sessions.output |
| MIN SAMPLE | 7 days |
| LIMITATIONS | Actual speaking time, not session length. |
| VERSION | 1 |

### Errors / 100 written words `german.err100`

| Field | Value |
|---|---|
| DOMAIN | GERMAN |
| TYPE | MEASURED |
| FORMULA | Σ errors / Σ evaluated words × 100 |
| AGGREGATION | ratio · days with data · ×100 |
| SOURCE | german_evals (writing) |
| MIN SAMPLE | 3 days |
| LIMITATIONS | Depends on evaluator consistency; text difficulty varies. |
| VERSION | 1 |

### Errors / speaking minute `german.errPerSpeakMin`

| Field | Value |
|---|---|
| DOMAIN | GERMAN |
| TYPE | MEASURED |
| FORMULA | Σ spoken errors / Σ evaluated speaking minutes |
| AGGREGATION | ratio · days with data |
| SOURCE | german_evals (speaking) |
| MIN SAMPLE | 3 days |
| LIMITATIONS | Hard to measure consistently; treat as indicative. |
| VERSION | 1 |

### Vocabulary retention `german.vocabRetention`

| Field | Value |
|---|---|
| DOMAIN | GERMAN |
| TYPE | MEASURED |
| FORMULA | Σ correct reviews / Σ reviews |
| AGGREGATION | ratio · days with data · ×100 |
| SOURCE | vocab_reviews |
| MIN SAMPLE | 7 days |
| LIMITATIONS | Mixes intervals unless imported item-level. |
| VERSION | 1 |

### CEFR evidence `german.cefr`

| Field | Value |
|---|---|
| DOMAIN | GERMAN |
| TYPE | MEASURED |
| FORMULA | best level per skill ranked by evidence kind OFFICIAL > EXTERNAL > MOCK > SELF > SYSTEM |
| AGGREGATION | latest |
| SOURCE | tests |
| MIN SAMPLE | 1 test |
| LIMITATIONS | System estimates labelled; never certified. |
| VERSION | 1 |

### Error-rate change `german.rateChange`

| Field | Value |
|---|---|
| DOMAIN | GERMAN |
| TYPE | DERIVED |
| FORMULA | Theil–Sen slope of monthly errors/100 words per month; per 100 study hours = slope vs cumulative hours × 100 |
| AGGREGATION | monthly |
| SOURCE | german_evals + sessions |
| MIN SAMPLE | 3 months (4 for MEDIUM) |
| LIMITATIONS |  |
| VERSION | 1 |

## LAW

### Law time `law.min`

| Field | Value |
|---|---|
| DOMAIN | LAW |
| TYPE | MEASURED |
| FORMULA | Σ Law session minutes |
| AGGREGATION | sum · calendar days |
| SOURCE | sessions |
| MIN SAMPLE | 7 days |
| LIMITATIONS | Time is an input, not an outcome. |
| VERSION | 1 |

### Law questions `law.questions`

| Field | Value |
|---|---|
| DOMAIN | LAW |
| TYPE | MEASURED |
| FORMULA | Σ answered questions (singles + sets) |
| AGGREGATION | sum · calendar days |
| SOURCE | question_attempts |
| MIN SAMPLE | 7 days |
| LIMITATIONS | — |
| VERSION | 1 |

### Law accuracy `law.accuracy`

| Field | Value |
|---|---|
| DOMAIN | LAW |
| TYPE | MEASURED |
| FORMULA | Σ correct / Σ answered |
| AGGREGATION | ratio · days with data · ×100 |
| SOURCE | question_attempts |
| MIN SAMPLE | 7 days |
| LIMITATIONS | Question difficulty mix affects accuracy. |
| VERSION | 1 |

### High-confidence errors `law.highConfErrors`

| Field | Value |
|---|---|
| DOMAIN | LAW |
| TYPE | MEASURED |
| FORMULA | Σ incorrect+confident / Σ answered |
| AGGREGATION | ratio · days with data · ×100 |
| SOURCE | question_attempts |
| MIN SAMPLE | 7 days |
| LIMITATIONS | Batch logs only include confident errors if entered. |
| VERSION | 1 |

### Questions / hour `law.qPerHour`

| Field | Value |
|---|---|
| DOMAIN | LAW |
| TYPE | DERIVED |
| FORMULA | Σ questions / Σ logged question minutes |
| AGGREGATION | ratio · days with data |
| SOURCE | question_attempts.minutes |
| MIN SAMPLE | 7 days |
| LIMITATIONS | Speed is only meaningful together with accuracy. |
| VERSION | 1 |

### Law active-recall ratio `law.recallRatio`

| Field | Value |
|---|---|
| DOMAIN | LAW |
| TYPE | DERIVED |
| FORMULA | Σ retrieval minutes (recall, review, questions, testing) / Σ Law minutes |
| AGGREGATION | ratio · days with data · ×100 |
| SOURCE | sessions.activity |
| MIN SAMPLE | 7 days |
| LIMITATIONS | — |
| VERSION | 1 |

### Cases solved `law.cases`

| Field | Value |
|---|---|
| DOMAIN | LAW |
| TYPE | MEASURED |
| FORMULA | Σ output.cases |
| AGGREGATION | sum · calendar days |
| SOURCE | sessions.output |
| MIN SAMPLE | 7 days |
| LIMITATIONS | — |
| VERSION | 1 |

### Pages read `law.pages`

| Field | Value |
|---|---|
| DOMAIN | LAW |
| TYPE | MEASURED |
| FORMULA | Σ output.pages |
| AGGREGATION | sum · calendar days |
| SOURCE | sessions.output |
| MIN SAMPLE | 7 days |
| LIMITATIONS | Consumption — not rewarded on its own. |
| VERSION | 1 |

### Retention by review interval `law.retention.bucket`

| Field | Value |
|---|---|
| DOMAIN | LAW |
| TYPE | DERIVED |
| FORMULA | accuracy of attempts grouped by gap since previous attempt on same (area, topic): 1D 1–3, 7D 4–14, 30D 15–60, 90D 61–135, 180D 136+ |
| AGGREGATION | all-time / 90D |
| SOURCE | question_attempts (SQL LAG) |
| MIN SAMPLE | 20 per bucket |
| LIMITATIONS | Batch sets share one timestamp. |
| VERSION | 1 |

### Forgetting risk `law.due`

| Field | Value |
|---|---|
| DOMAIN | LAW |
| TYPE | DERIVED |
| FORMULA | interval = [1,7,30,90,180][review days − 1] (one step shorter if last accuracy < 70%); due if days since ≥ interval; at-risk if overdue ≥ 50% of interval or last accuracy < 70% |
| AGGREGATION | per topic |
| SOURCE | question_attempts |
| MIN SAMPLE | 1 review |
| LIMITATIONS | Topic granularity depends on logging. |
| VERSION | 1 |

### Law readiness components `law.readiness`

| Field | Value |
|---|---|
| DOMAIN | LAW |
| TYPE | ESTIMATED |
| FORMULA | coverage, accuracy, recent accuracy, spaced retention, mock %, volume vs target, balance (entropy); composite = weighted mean of ≥4 available components (weights in settings) |
| AGGREGATION | window |
| SOURCE | question_attempts + tests |
| MIN SAMPLE | see components |
| LIMITATIONS | Not a pass probability. |
| VERSION | 1 |

## LEARNING

### Active-recall ratio (all learning) `learning.recallRatio`

| Field | Value |
|---|---|
| DOMAIN | LEARNING |
| TYPE | DERIVED |
| FORMULA | Σ retrieval minutes / Σ (consumption + retrieval + production) minutes in core domains |
| AGGREGATION | ratio · days with data · ×100 |
| SOURCE | sessions.activity |
| MIN SAMPLE | 7 days |
| LIMITATIONS | — |
| VERSION | 1 |

## DIGITAL

### Phone time `phone.total`

| Field | Value |
|---|---|
| DOMAIN | DIGITAL |
| TYPE | MEASURED |
| FORMULA | mean daily phone minutes over days with phone data |
| AGGREGATION | mean · days with data |
| SOURCE | phone_usage |
| MIN SAMPLE | 7 days |
| LIMITATIONS | Days without data are excluded, not counted as 0. |
| VERSION | 1 |

### Unproductive screen time `phone.unproductive`

| Field | Value |
|---|---|
| DOMAIN | DIGITAL |
| TYPE | DERIVED |
| FORMULA | mean daily phone minutes outside productive categories |
| AGGREGATION | mean · days with data |
| SOURCE | phone_usage + settings.productivePhoneCategories |
| MIN SAMPLE | 7 days |
| LIMITATIONS | — |
| VERSION | 1 |

### Productive phone time `phone.productive`

| Field | Value |
|---|---|
| DOMAIN | DIGITAL |
| TYPE | DERIVED |
| FORMULA | mean daily phone minutes in productive categories |
| AGGREGATION | mean · days with data |
| SOURCE | phone_usage |
| MIN SAMPLE | 7 days |
| LIMITATIONS | — |
| VERSION | 1 |

### Phone limit compliance `phone.compliance`

| Field | Value |
|---|---|
| DOMAIN | DIGITAL |
| TYPE | DERIVED |
| FORMULA | days with phone ≤ limit (limit as of that day) / days with phone data |
| AGGREGATION | ratio · days with data · ×100 |
| SOURCE | phone_usage + settings history |
| MIN SAMPLE | 7 days |
| LIMITATIONS | — |
| VERSION | 1 |

### Morning phone `phone.morning`

| Field | Value |
|---|---|
| DOMAIN | DIGITAL |
| TYPE | DERIVED |
| FORMULA | mean timed phone minutes before settings.morningEnd |
| AGGREGATION | mean · days with data |
| SOURCE | phone_usage (timed) |
| MIN SAMPLE | 7 days |
| LIMITATIONS | Requires records with start/end. |
| VERSION | 1 |

### Late phone use `phone.evening`

| Field | Value |
|---|---|
| DOMAIN | DIGITAL |
| TYPE | DERIVED |
| FORMULA | mean timed phone minutes after settings.eveningStart |
| AGGREGATION | mean · days with data |
| SOURCE | phone_usage (timed) |
| MIN SAMPLE | 7 days |
| LIMITATIONS | Requires records with start/end. |
| VERSION | 1 |

### Pickups `phone.pickups`

| Field | Value |
|---|---|
| DOMAIN | DIGITAL |
| TYPE | MEASURED |
| FORMULA | mean daily pickups/unlocks |
| AGGREGATION | mean · days with data |
| SOURCE | phone_days / phone_usage.pickups |
| MIN SAMPLE | 7 days |
| LIMITATIONS | — |
| VERSION | 1 |

### Phone during deep work `phone.deepInterruptions`

| Field | Value |
|---|---|
| DOMAIN | DIGITAL |
| TYPE | DERIVED |
| FORMULA | mean non-productive timed phone minutes overlapping DEEP sessions |
| AGGREGATION | mean · days with data |
| SOURCE | phone_usage (timed) × sessions |
| MIN SAMPLE | 7 days |
| LIMITATIONS | Requires timed phone records. |
| VERSION | 1 |

### Possible distraction-related start delay `phone.distraction`

| Field | Value |
|---|---|
| DOMAIN | DIGITAL |
| TYPE | DERIVED |
| FORMULA | planned session started > 5 min late with ≥1 min non-productive timed phone use overlapping [planned − 10 min, actual start] |
| AGGREGATION | event |
| SOURCE | sessions × phone_usage (timed) |
| MIN SAMPLE | — |
| LIMITATIONS | Not causal. |
| VERSION | 1 |

### Reclaimed time `phone.reclaimed`

| Field | Value |
|---|---|
| DOMAIN | DIGITAL |
| TYPE | DERIVED |
| FORMULA | max(0, baseline phone/day − current 30D phone/day); monthly = ×30; conversion = Δ productive/day ÷ reclaimed |
| AGGREGATION | window |
| SOURCE | phone_usage + sessions |
| MIN SAMPLE | 14 days each window |
| LIMITATIONS | Arithmetic; co-occurrence only. |
| VERSION | 1 |

## RECOVERY

### Sleep duration `sleep.h`

| Field | Value |
|---|---|
| DOMAIN | RECOVERY |
| TYPE | SELF_REPORTED |
| FORMULA | mean logged sleep hours |
| AGGREGATION | mean · days with data |
| SOURCE | recovery |
| MIN SAMPLE | 7 days |
| LIMITATIONS | Not a medical measure. |
| VERSION | 1 |

### Sleep quality (self) `sleep.q`

| Field | Value |
|---|---|
| DOMAIN | RECOVERY |
| TYPE | SELF_REPORTED |
| FORMULA | mean self-rated sleep quality 1–5 |
| AGGREGATION | mean · days with data |
| SOURCE | recovery |
| MIN SAMPLE | 7 days |
| LIMITATIONS | Self-rating. |
| VERSION | 1 |

### Energy (self) `energy`

| Field | Value |
|---|---|
| DOMAIN | RECOVERY |
| TYPE | SELF_REPORTED |
| FORMULA | mean self-rated energy 1–5 (recovery log, else check-in, else plan) |
| AGGREGATION | mean · days with data |
| SOURCE | recovery / checkins / plans |
| MIN SAMPLE | 7 days |
| LIMITATIONS | Self-rating. |
| VERSION | 1 |

### Highest sustained workload `capacity.sustained`

| Field | Value |
|---|---|
| DOMAIN | RECOVERY |
| TYPE | DERIVED |
| FORMULA | max rolling mean of core minutes/day over complete 7/30/90-day windows |
| AGGREGATION | rolling |
| SOURCE | DayFacts |
| MIN SAMPLE | window length |
| LIMITATIONS |  |
| VERSION | 1 |

### Sustainability warning `sustainability.warning`

| Field | Value |
|---|---|
| DOMAIN | RECOVERY |
| TYPE | DERIVED |
| FORMULA | 14D vs prev 14D: work hours ≥ +10% ∧ ≥2 of {focus −0.3, accuracy −3pp, completion −5pp, sleep −0.5h} |
| AGGREGATION | window |
| SOURCE | DayFacts |
| MIN SAMPLE | 28 days |
| LIMITATIONS | Behavioural, not medical. |
| VERSION | 1 |

## ANALYTICS

### Trend class `trend.class`

| Field | Value |
|---|---|
| DOMAIN | ANALYTICS |
| TYPE | DERIVED |
| FORMULA | Theil–Sen slope × window / \|median\|, oriented; VOLATILE if cv>0.8 ∧ \|rel\|<cv/2; IMPROVING ≥ +10%; DECLINING ≤ −10% |
| AGGREGATION | window |
| SOURCE | daily series |
| MIN SAMPLE | metric.minSample |
| LIMITATIONS | Window-dependent. |
| VERSION | 1 |

### Velocity & acceleration `velocity`

| Field | Value |
|---|---|
| DOMAIN | ANALYTICS |
| TYPE | DERIVED |
| FORMULA | v = agg(last W) − agg(prev W); a = v − (agg(prev W) − agg(prev-prev W)) |
| AGGREGATION | window |
| SOURCE | daily series |
| MIN SAMPLE | 3W days |
| LIMITATIONS | Sensitive to seasonality. |
| VERSION | 1 |

### Relationship (Spearman + split) `relation`

| Field | Value |
|---|---|
| DOMAIN | ANALYTICS |
| TYPE | DERIVED |
| FORMULA | ρ over paired tracked days (lag optional); 95% CI via Fisher z (SE 1.06/√(n−3)); split means + Cohen's d |
| AGGREGATION | window |
| SOURCE | daily series |
| MIN SAMPLE | 10 (14 for MEDIUM, 45 for HIGH) |
| LIMITATIONS | Association only. |
| VERSION | 1 |

### Unusual day `anomaly`

| Field | Value |
|---|---|
| DOMAIN | ANALYTICS |
| TYPE | DERIVED |
| FORMULA | \|x − median₃₀\| / (1.4826·MAD₃₀) ≥ 3 |
| AGGREGATION | day |
| SOURCE | daily series |
| MIN SAMPLE | 14 baseline days |
| LIMITATIONS | Not a strategy trigger. |
| VERSION | 1 |

## GOALS

### Goal pace `goal.pace`

| Field | Value |
|---|---|
| DOMAIN | GOALS |
| TYPE | DERIVED |
| FORMULA | pace = actual / (target × elapsed/total); AHEAD > 1.10 ≥ ON TRACK ≥ 0.90 > BEHIND |
| AGGREGATION | cumulative |
| SOURCE | goals + metric |
| MIN SAMPLE | — |
| LIMITATIONS | Linear expectation. |
| VERSION | 1 |

### Monte Carlo completion `goal.montecarlo`

| Field | Value |
|---|---|
| DOMAIN | GOALS |
| TYPE | FORECASTED |
| FORMULA | 2 000 runs of 7-day block bootstrap from last 60 days; P10/P50/P90 dates; P(by deadline) rounded to 5%, clamped 5–95%; seed = hash(goal+asOf) |
| AGGREGATION | simulation |
| SOURCE | daily series |
| MIN SAMPLE | 21 days |
| LIMITATIONS | Assumes no structural change. |
| VERSION | 1 |

## COACH

### Priority score `coach.priority`

| Field | Value |
|---|---|
| DOMAIN | COACH |
| TYPE | DERIVED |
| FORMULA | 100 × Impact/5 × Alignment × Conf(0.4/0.7/1) × (0.6 + 0.4·Urgency/5) / √(Effort/3) |
| AGGREGATION | per insight |
| SOURCE | insights + goals |
| MIN SAMPLE | — |
| LIMITATIONS | Rule-based scores. |
| VERSION | 1 |

### Coach hit rate `coach.hitRate`

| Field | Value |
|---|---|
| DOMAIN | COACH |
| TYPE | DERIVED |
| FORMULA | hits / verified implemented-or-accepted recommendations; hit = metric moved ≥ 5% in intended direction within horizon |
| AGGREGATION | all-time |
| SOURCE | recommendations + metric |
| MIN SAMPLE | 1 verified |
| LIMITATIONS | Unverifiable advice excluded. |
| VERSION | 1 |

