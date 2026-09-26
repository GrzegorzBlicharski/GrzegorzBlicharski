# DEUTSCHLAND: IMMERSION

A cinematic narrative RPG for learning German. Berlin, 06:42, Day 1 — the player arrives, and from the first minute German is the operating system of the world: station announcements, a landlady explaining the house rules too fast, a café where the card reader is broken, a phone call from a law firm, a football contract whose Polish translation is wrong, a dinner negotiation with a sporting director, and the Bürgeramt the morning after.

Long-term target: **B1 → B2 → C1 → C2 → Legal German → PL↔DE translation → sworn-translator exam preparation.**

## Run it

```bash
cd deutschland-immersion
npm install
npm run dev          # http://localhost:5173
npm run build && npm run preview
```

Best in Chrome/Edge (speech recognition). Sound starts after the first click/keypress (browser autoplay rules).

## Tests

```bash
npm test             # engine + content integrity (evaluator, rules, every dialogue link, every model answer)
npm run test:e2e     # plays the full V1 path in Chromium: new game → Day 1 → Day 2 → reload → continue
```

`src/content/content.test.ts` checks that every dialogue link resolves, every regex compiles, every mission objective can be ticked, every mission can be completed, and that **every authored native-model answer is graded "natural" or better by its own evaluator** — so content authors can't ship an exercise the engine can't grade.

## What is in V1 (Berlin, Day 1 + Day 2 opener)

| Mission | Language work |
|---|---|
| DAS FALSCHE GLEIS (Hauptbahnhof) | Read an SMS, read the departure board, understand a platform-change announcement (subtitles hidden), ask DB staff in free German, buy the right ticket, choose the platform under a timer. Misunderstanding sends you west to Bellevue and forces a formal apology SMS (`weil` + Perfekt mit *sein*). |
| DER SCHLÜSSEL (Kreuzberg) | Formal self-introduction, fast Hausordnung (listening), Wechselpräpositionen, asking for the Wohnungsgeberbestätigung — **or forgetting it, which blocks you at the Bürgeramt on Day 2**. |
| ERSTER KAFFEE | Ordering naturally (*Ich hätte gern …* vs. *Kann ich … haben*), adjective endings, du-register small talk. |
| DER ANRUF | Phone call, audio-first: *halb drei* = 14:30 trap, address, what to bring. |
| DER VERTRAG (boss) | du-offer at the office, briefing at speed, **interactive contract comparison DE/PL** (find the three real discrepancies), PL→DE and DE→PL legal translation with terminology checks (*Vertragsstrafe*, *außerordentliche Kündigung ≠ odstąpienie*), formal e-mail under a deadline. |
| ABENDESSEN UM 20:00 (boss) | Small talk, diplomatic negotiation (Konjunktiv II, concessive connectors), a timed decision, liaison interpreting DE→PL for the player. Rain, 21:47, a phone call that sets up the next arc. |
| DAS AMT (Tag 2) | Behördendeutsch, passive voice in listening, formal e-mail if you forgot the document. |

Plus: map travel, in-game phone (messages, mail, missions, contacts with memories, notes, terminology, career), dossier (CEFR estimate, 11 skills, then-vs-now, weaknesses, error log, terminology DB, achievements, career ladder), training room, debriefs, day summary, settings, save export/import.

## Architecture

```
src/
  engine/            game-agnostic systems (no Berlin content)
    types.ts          data model: missions, dialogue nodes, input specs, targets, terms …
    store.ts          zustand store: state, effects, missions, XP, career, persistence (localStorage)
    evaluator.ts      multi-dimensional grading (correctness, naturalness, precision, register, style, idiomaticity) → 6 tiers
    genericRules.ts   conservative German checks: V2, verb-final, cases after prepositions, Perfekt+sein, genus, du/Sie, anglicisms
    languageModel.ts  per-target mastery + spaced repetition, recognition vs production, error log, Elo-style skills, snapshots
    difficulty.ts     help, subtitles, TTS speed, strictness, timers by demonstrated level
    speech.ts         TTS (speechSynthesis) + speech recognition (Web Speech API) with graceful fallback
    audio.ts          procedural WebAudio ambience & SFX (no third-party assets)
    aiReviewer.ts     optional Claude reviewer (player's own API key)
  content/            all educational & narrative content as data
    berlin/           npcs, locations, missions, dialogues/*
    shared/           language targets B1–C2, retrieval bank, drills, vocabulary, PL↔DE terminology, achievements, career
    index.ts          registry — add a city by adding a folder and registering it here
  ui/                 React presentation: scenes (layered SVG + parallax + rain), dialogue, phone, map, dossier …
```

### Adding a mission

1. Add a `Mission` to `content/<city>/missions.ts` (objectives, language targets, rewards).
2. Write the dialogue with `dlg()` in `content/<city>/dialogues/*.ts`. Nodes can speak, show documents, offer choices, request free input (`FreeInputSpec` with required content, error patterns, bonuses, native models), run inspections, branch on flags/items/relationships, and inject adaptive retrieval moments.
3. Hook it into a location (`hotspots` / `onEnter`) and register the file in `content/index.ts`.
4. `npm test` tells you if a link is broken or a model answer doesn't pass its own grading.

### How learning works

- **Evaluation is honest.** A plain correct sentence is *Korrekt*. *Natürlich / Professionell / Muttersprachlich* require positive evidence (idiomatic markers, register, closeness to a native formulation). Polish or English answers are not accepted.
- **Invisible spaced repetition.** Every error updates the target's mastery and schedule. Weak, due targets come back as SMS from Kasia/Lukas/Dr. Kessler or as small moments in conversations with Emre/Lukas — without announcing a grammar topic.
- **Recognition ≠ production.** Picking the right option can raise mastery only to 60 %; above that requires producing the structure. Vocabulary is tracked as seen → recognised → produced → mastered.
- **Help costs credit.** Revealing subtitles or the Polish gloss reduces listening/reading credit. At B2 help becomes costly, at C2 it disappears.
- **Progress = demonstrated competence.** XP scales with answer quality; career ranks are gated by skill ratings, not XP.

### Honest limits of this build

- The rule engine grades what rules can verify. It cannot judge every nuance of free text; for that, add an Anthropic API key in *Einstellungen* and the **KI-Prüfer** (Claude) refines naturalness, register, style and translation quality. The key stays in the browser and is sent only to `api.anthropic.com`.
- Speech output quality depends on the German voices installed in the OS/browser. Speech input uses the browser's Web Speech API (Chrome/Edge); elsewhere, typed input is used.
- The sworn-translator exam pathway (Tłumacz przysięgły) is visible in the career ladder but its exam simulations are **not yet built**: the current official rules of the Państwowa Komisja Egzaminacyjna must be verified from authoritative sources first.
- Only Berlin exists; other cities are shown as locked on the Germany map. The next Berlin arc (*48 STUNDEN*, *MATCHDAY*, *DIE VERHANDLUNG*) is listed as in production.

All characters, companies, clubs and places of business are fictional.
