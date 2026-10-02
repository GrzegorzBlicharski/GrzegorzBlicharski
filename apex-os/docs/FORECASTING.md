# APEX OS — Forecasting

Rule: the system predicts only what can reasonably be modelled. Hours and output are modelled
mathematically from execution history. Skill progression is presented cautiously (range + LOW confidence).

## Goal pace (`forecasting/pace.ts`)
Cumulative goals: `expected = target × elapsed/total`; `pace = actual/expected`.
`AHEAD` > 1.10 ≥ `ON TRACK` ≥ 0.90 > `BEHIND`. Shows current rate (30D), required rate to deadline, projected
completion date at current rate. Rate goals (e.g. phone ≤ 60) compare 30D mean against target.

## Monte Carlo (`forecasting/monteCarlo.ts`)
- History: last 60 days of the goal metric (min 21 days, else "insufficient data").
- Block bootstrap of 7-day blocks (keeps weekly rhythm), 2 000 runs.
- Deterministic seed = hash(goalId + asOf) ⇒ reproducible.
- Output: P10/P50/P90 completion date, probability of reaching target by deadline rounded to 5 %, clamped to
  [5 %, 95 %] (the model cannot justify more certainty), assumptions listed:
  1. future days resemble the last 60 days; 2. no structural change; 3. missing days count as zero work.

## Scenarios (`forecasting/scenarios.ts`)
- Phone 30/60/90 min/day: reclaimed hours/month vs current — pure arithmetic.
- German 3/5/7 h/day, Law 1/2/3 h/day: realistic hours = scenario × historical execution ratio; days to goal;
  flagged `ABOVE SUSTAINED CAPACITY` if above max sustained 30D workload; law questions projected with 30D
  questions/hour.
- "If the current 30D trend continues…" — linear extrapolation with explicit caveat.

## Forecast log & model error (`forecasting/log.ts`)
Every recorded forecast stores method, horizon, projected value/date, P10/P90, assumptions. After the horizon:
actual (from facts), error, absolute % error; across forecasts: MAPE, bias (mean signed error) and calibration
(share of actuals inside [P10, P90]; ideal ≈ 80 %). The system therefore learns how accurate it is.

## Floor / target / stretch
For key daily metrics: FLOOR (minimum day), TARGET (settings), STRETCH. A plan is labelled using the user's own
distribution of actual days: `≤ P50` realistic, `≤ P85` stretch, `> P85` unlikely. Targets higher than any
sustained historical level trigger an information note.
