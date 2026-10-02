# APEX OS — Analytics

All analytics are pure functions (`src/analytics`, `src/modules`) over `DayFacts[]` plus small entity
lists. Same inputs + same metric version ⇒ same output. Every insight carries `n`, a window and a
confidence label (`LOW` / `MEDIUM` / `HIGH`). Correlation ≠ causation: relationships are described, and the
UI offers "Turn into experiment" instead of claiming effects.

## 1. Windows and aggregation
- Windows: `7D, 30D, 90D, 365D, ALL`, inclusive of the as-of day, clipped to the first tracked day.
- Metric aggregation types:
  - `sum` (minutes, counts): total + per-day mean over **calendar days** in window.
  - `ratio` (accuracy, execution, err/100 words): `Σnum / Σden` — never the mean of daily ratios.
  - `mean` (focus, sleep): weighted mean over **days with data** (missing ≠ 0).
- Phone metrics use *days with phone data* as the denominator; days without data are reported as
  "no data", never as 0 minutes.

## 2. Trend classification (`analytics/trend.ts`)
For window W (default 30D) on days with data:
1. Theil–Sen slope `b` (median of pairwise slopes; robust to outliers).
2. Level `m` = median, spread `s` = 1.4826·MAD, `cv = s/|m|`.
3. Relative change `rel = b·(W−1)/max(|m|, ε)`, oriented by `higherIsBetter`.

| Class | Rule |
|---|---|
| INSUFFICIENT | n < metric.minSample (default 10) |
| VOLATILE | `cv > 0.8` and `|rel| < cv/2` |
| IMPROVING | oriented `rel ≥ +0.10` |
| DECLINING | oriented `rel ≤ −0.10` |
| STABLE | otherwise |

## 3. Velocity & acceleration
`velocity_30 = mean(last 30D) − mean(prev 30D)`; `acceleration_30 = velocity_30 − (mean(prev 30D) − mean(prev-prev 30D))`.
Same for 90D. Learning velocity is shown as separate components (never one number):
knowledge (law accuracy Δ/30d), skill (German err/100 words Δ/month), retention Δ, error reduction, test
score progression (Theil–Sen slope of test % per month by domain), plus *change per 100 study hours*.

## 4. Relationships (`analytics/relations.ts`)
- **Spearman ρ** on paired days, optional lag (X day t vs Y day t+lag), `n`, approximate 95 % CI via
  Fisher z with SE = 1.06/√(n−3).
- **Split comparison**: groups by threshold (e.g. phone ≤ limit vs > limit): mean of Y per group, `n` per group,
  difference, Cohen's d (pooled SD). This is the primary, readable effect size.
- Confidence: `LOW` if n < 14 or CI crosses 0; `MEDIUM` if n ≥ 14, CI excludes 0, |ρ| ≥ 0.2;
  `HIGH` if n ≥ 45, CI excludes 0, |ρ| ≥ 0.3. Strength wording: <0.1 none, <0.3 weak, <0.5 moderate, ≥0.5 strong.
- If no relationship is detected the UI says so explicitly ("No detectable relationship in N days").
- Probabilities are never shown with false precision (rounded to 5 %).

## 5. Anomalies
Robust z-score against trailing 30 days (excluding the day): `z = (x − median)/(1.4826·MAD)`; |z| ≥ 3 ⇒
"unusual" (requires ≥ 14 baseline days, MAD > 0). Used for: unusually productive day, unusual phone use,
focus drop, unusually high workload. A single anomaly never changes strategy.

## 6. Plateau, breakthrough, regression
- **Plateau**: last 28 data days with |rel| < 0.05 and cv < 0.5.
- **Potential breakthrough**: a plateau (28 days, ending 14 days ago) followed by 14 days whose mean exceeds the
  plateau mean by > max(10 %, 1.5·s) with ≥ 10 of 14 days above the plateau mean.
- **Regression alert** (law areas, German error categories): weekly series (min sample per week); 3
  consecutive worsening weeks *and* last week worse than the 8-week median *and* the skill was previously
  established (8-week accuracy ≥ 75 %). Example: "KPC accuracy fell for the third week in a row".

## 7. Capacity & sustainability (`modules/recovery.ts`)
- Highest sustained workload: max rolling mean of productive minutes/day over complete 7/30/90-day windows.
- Target vs capacity gap: `target − sustained90`; if target > every sustained level historically achieved, the
  planner says so.
- **SUSTAINABILITY WARNING** (behavioural, not medical): last 14D vs previous 14D productive minutes +10 %
  and at least two of: focus −0.3, accuracy −3 pp, completion −5 pp, sleep −0.5 h (if logged).
- Optional sleep/energy relations reuse §4. Never recommends sleep restriction.

## 8. Execution (`modules/execution.ts`)
- `execution% = Σ actual productive minutes / Σ planned minutes` over days that have a plan.
- Start delay = `actual start − planned start` (minutes, sessions started from planned blocks); 7/30/90D medians.
- Task completion rate = completed / (completed + abandoned + postponed + still open past day).
- **SYSTEMATIC OVERPLANNING**: ≥ 10 planned days in 30D and execution < 85 %. Recommendation: base plan ≈
  historical median actual on planned days (shown with numbers).
- **PLANNING MAY BE REPLACING EXECUTION**: system-building (domain `SYSTEM`) minutes 14D ↑ ≥ 25 % while core
  productive minutes not ↑, or system share ≥ 25 % of total work time.

## 9. Attention & digital hygiene
- Depth classification (auto unless user override): `DEEP` if minutes ≥ deepMin (45) ∧ interruptions ≤ 1 ∧
  focus ≥ 4 (or unrated & active); `LIGHT` if minutes < 25 ∨ focus ≤ 2 ∨ mode passive; else `NORMAL`.
- Deep metrics: deep h/day, h/week, deep ratio (deep / productive), avg deep block, longest block, monthly
  evolution of average block length (capacity to work uninterrupted).
- Best hours: minutes are spread over the clock hours a session covers; per hour: weighted focus, question
  accuracy, completion rate, output/hour (domain-specific, never mixed). Min 5 sessions & 300 min per hour.
  Composite score = mean of available z-scores (visible). Best contiguous 3-hour block recommended for the
  hardest work when ≥ 6 hours qualify.
- Switches/hour = context switches / session hours; relation with focus/accuracy analysed — not assumed bad.
- Phone: total, productive (categories in `settings.productivePhoneCategories`), non-productive, morning
  (before `morningEnd`), evening (after `eveningStart`), pickups, longest/avg session, first/last use (derived
  from timed records, else from day summary), compliance with limit *as of that day's settings*.
- Separate indicators (no magic number): daily compliance, unproductive screen time, morning discipline
  (no phone within N minutes of wake / before `morningEnd`), deep-work interruptions, late phone use.
- **Distraction cost**: session with planned start and delay > 5 min where timed non-productive phone use
  overlaps `[plannedStart − 10 min, actualStart]` ⇒ "possible distraction-related start delay".
- **Reclaimed time**: `max(0, baseline phone/day − current 30D phone/day)`, ×30 per month. Conversion check:
  change in productive minutes/day over the same windows, shown as co-occurrence — not causation.

## 10. German (`modules/german.ts`)
Active vs passive minutes and ratio; skill shares vs target mix (`settings.german.targetMix`), flags such as
"too little Speaking" *only* when deviation from the user's target > 40 % relative; errors/100 written
words and errors/speaking minute (overall and by category, monthly slope); recurring errors (category
share ≥ 15 % for 3 of last 4 months); vocab retention; CEFR evidence ladder per skill (kinds ranked
OFFICIAL > EXTERNAL > MOCK > SELF > SYSTEM; system estimates labelled ESTIMATED, never certified).

## 11. Law (`modules/law.ts`)
Per area: minutes, questions, accuracy (all, 30D), retention, last reviewed, cases/reading/practical output.
Confidence matrix: correct+confident, correct+uncertain, incorrect+uncertain, **incorrect+confident** (flagged).
Retention by review interval: attempt gap since previous attempt on same `(area, topic)` via SQL `LAG`,
bucketed 1D (1–3 d), 7D (4–14), 30D (15–60), 90D (61–135), 180D (136+). Forgetting risk: days since last
review vs expanding schedule [1, 7, 30, 90, 180] by successful reviews. Readiness is shown as components:
coverage, accuracy, recent accuracy, retention, mock performance, volume, balance (normalised entropy) —
optional composite with visible weights, labelled ESTIMATED. Detects "reading a lot, retaining little":
reading share ≥ 50 % of law minutes with retention < 70 % or active-recall ratio < 30 %.

## 12. Effectiveness ("development value per hour")
For activities with a linked outcome (law area → accuracy, German skill → skill test %), compare hours spent in
a period with outcome change → "Δ outcome per 10 h", with n and LOW confidence unless ≥ 3 measurement points
each side. Activities with high time, low output and no improvement are *flagged for analysis*, never
condemned automatically.

## 13. Data maturity
| Days tracked | Stage | Allowed outputs |
|---|---|---|
| 0–14 | Baseline gathering | descriptive only |
| 15–30 | Basic patterns | trends, simple flags |
| 31–90 | Adaptive recommendations | coach, planner adaptation |
| 91–365 | Personal optimisation | best hours, how-I-work |
| 365+ | Long-term intelligence | year-over-year, baselines |
Plus stream coverage (phone, focus, plans, recovery, tests) — describing system reliability, not the user.
