# APEX OS — Coach Engine

A deterministic, rule-based engine (`src/coach`). No empty motivational text, no grading of the person.
Every output follows **FACT → INTERPRETATION → ACTION** and carries evidence (`n`, window), confidence and trend.

## Insight model
```ts
Insight {
  id, ruleId, domain, kind: weakness|strength|bottleneck|opportunity|warning|pattern|lowValue,
  title, facts: string[], interpretation, action,
  evidence: { n, window }, severity 1-5, confidence LOW|MEDIUM|HIGH, trend,
  goalRelevance 0-1, impact 1-5, urgency 1-5, effort 1-5, metricKey?, direction?
}
```

## Priority score (visible in UI)
```
Priority = 100 × (Impact/5) × GoalAlignment × ConfidenceFactor × (0.6 + 0.4 × Urgency/5) / √(Effort/3)
ConfidenceFactor: LOW 0.4 · MEDIUM 0.7 · HIGH 1.0      (clamped to 0–100)
```
Goal alignment = max over active goals of `goalWeight/5 × tierFactor (PRIMARY 1, SECONDARY .7, MAINTENANCE .4)`
when the insight's domain/metric is a goal metric or leading indicator; otherwise 0.3.

## Rule families (detectors)
| Family | Examples |
|---|---|
| Execution | systematic overplanning, rising start delay, low completion, planning replacing execution |
| Attention | phone over budget, morning phone, deep-work interruptions, falling deep block length |
| German | skill under target mix, passive overload, recurring error category, error rate not improving, no writing/speaking evaluation in 30D |
| Law | high-confidence errors, due/at-risk topics, area regression, low coverage, reading-heavy/low-retention |
| Goals | behind pace, deadline proximity, target above sustained capacity |
| Sustainability | sustainability warning, workload > capacity |
| Strengths | fastest improving metric, highest retention area, best productivity patterns |
| Low value | high time + low output + no improvement (flag for analysis) |

Data-maturity gating: in *baseline gathering* only descriptive facts are emitted.

## Outputs
- **Today**: max 3 main priorities, most important action, current bottleneck, top weakness.
- **Bottleneck per goal**: leading indicator with the largest deficit vs required pace, else highest-priority
  linked weakness.
- **High-leverage opportunities**: insights with impact ≥ 4 and effort ≤ 2.
- **Weekly review**: KEEP / INCREASE / REDUCE / STOP / START / TEST.
- **One biggest lever for next week**: OBSERVATION, EVIDENCE, HYPOTHESIS, ACTION, EXPECTED EFFECT,
  HOW WE WILL TEST IT, CONFIDENCE.
- **Known / Likely / Unknown / Test next**: HIGH / MEDIUM / LOW-confidence findings + suggested experiments.
- **How I work best / What tends not to work for me**: each point with evidence; "insufficient data"
  otherwise.

## Adaptive planner (`coach/planner.ts`)
Inputs: available minutes (check-in or median actual for that weekday), energy (optional), historical execution
ratio, sustained capacity, goals (weight, tier, deficit, deadline), due reviews, weaknesses, best hours.
1. Capacity = min(available × execution ratio, sustained30 × 1.1); high-capacity mode ≤ sustained7 × 1.15 and
   never above 9 h; minimum mode = minimum day.
2. Allocation proportional to `weight × tierFactor × (1 + deficit)`; due reviews reserved first.
3. Hard work placed in best hours when known; low energy ⇒ lower-difficulty blocks first, minimum kept.
4. Plan labelled realistic / stretch / unlikely vs own history.
5. Never schedules sleep reduction; the plan is advice, the user decides.

## Experiments & interventions
- Max concurrent experiments: `settings.maxConcurrentExperiments` (default 2).
- Evaluation: baseline window vs experiment window per metric — mean, Δ, Cohen's d, n each side, confidence;
  decision suggestion (adopt if primary metric improves with d ≥ 0.3 and n ≥ 14 each side).
- Interventions (14/30/90 d) attach to a bottleneck and are evaluated identically.

## Recommendation verification
Recommendations can be issued (persisted), accepted, rejected, implemented. After `horizonDays` the linked
metric is compared with the baseline: hit if moved in the intended direction by ≥ 5 % (or 0.2 SD).
Coach hit rate = hits / verifiable implemented recommendations. Unverifiable recommendations are excluded.
