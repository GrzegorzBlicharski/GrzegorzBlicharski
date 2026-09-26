# THE FIRM

A cinematic legal-thriller narrative game that runs in the browser — and a practice curriculum built around one career: **Polish-German commercial lawyer · employment · contracts & negotiation · sports & football · future boutique founder.**

**Chapter I — The Carbo Deal.** Monday, 07:12, Gliwice. Your first day on Adler Wendt's Polish-German desk. A Stuttgart investor is buying a Silesian football club. By 22:47 you are in Wrocław, and the deal is about to collapse — unless you read what everyone else skipped.

## Play
Open `index.html` in a desktop browser (Chrome, Edge, Firefox, Safari). No build step, no install. An internet connection loads the fonts; everything else is local.

For the best experience: large window, headphones.

Controls: mouse for everything · Space/Enter to advance dialogue · 1–3 to pick answers · Esc to put documents down · Tab to recall your objective.

## What's in Chapter IV — Oder Crossing
- Sunrise over the port on Szczecin's Wały Chrobrego. A dispatcher who works three days a week in Berlin was dismissed by email at 22:14.
- The intake is gameplay: four questions decide which facts — and documents — you will have.
- Draft the German Klage on the regional train to Berlin: deadline, Rome I, Brussels I bis, why the dismissal fails, costs.
- The conciliation hearing at the Arbeitsgericht Berlin, in German. Translations are veiled from here on (hover or hold G).

## What's in Chapter III — Eighty Positions
- February, the 06:00 shift at Silform's gate in snow. Eighty jobs in Hall 2 must go, and the board wants the operations director out by Friday.
- A Polish matter file: restructuring plan, the HR selection list (with its landmines), two union letters, the director's contracts, a draft termination, a KRS extract.
- A legal opinion for mec. Barbara Lis — six questions on collective redundancy, protected employees, severance and a board member's exit.
- Consult two company unions in Polish above the idle hall, then face the director and his counsel.

## What's in Chapter II — The Line Stops
- January, snow in Gliwice. A Stuttgart drivetrain maker stops its line and blames your client's die-cast housings: €18.4m.
- A matter file in German, Polish and English: framework supply agreement, quality agreement, both sides' standard terms, an engineering change notice, the engineers' emails, an X-ray report, the defect notice and the claim letter.
- Write a Stellungnahme: which law, which court, what the contract says, how far liability goes, what the client should do — each answer cited to a document.
- Fly to Stuttgart and present your position to German counsel in German, in a room above the stopped line. Arguments are only available if you found the document behind them.

## What's in Chapter I
- Opening cinematic: Gliwice in the rain → the tower → the lobby → a glass elevator to the 9th floor.
- Your desk as the interface: workstation, phone, case file, coffee, the window, the stairs to the partner floor.
- Dialogue with Dr. Helena Wendt, Jonas, Marta, the client and opposing counsel, with choices.
- Contract review: accept / reject / flag the seller's mark-up of a share purchase agreement.
- A data room with Polish originals (board minutes, registry extract, stadium lease, press clipping) — click passages to capture evidence.
- A case board: connect people, companies, clauses and money.
- The InterCity to Wrocław — your first written advice in German to the client's in-house lawyer — and a night negotiation whose outcome depends on what you found.
- Practice notes at the end: what you trained, mapped to the target tracks, and the road ahead.

## Structure
```
index.html          entry point
css/game.css        overlay UI, dialogue, cards, phone
css/desk.css        documents, redline, workstation OS, case board
js/core.js          loop, camera, parallax layers, input, scene manager
js/gfx.js           sky, clouds, skylines & landmarks, rain, glass droplets, post-processing
js/people.js        procedural character renderer with scene lighting
js/audio.js         procedural WebAudio: rain, city, room tone, score, foley
js/scenes/*.js      Gliwice exteriors, lobby & elevator, office, partner office, travel (taxi, train, flight), Wrocław
js/documents.js     document viewer, evidence, SPA redline
js/computer.js      the workstation (mail, documents, data room, calendar, research)
js/board.js         case board
js/story.js         Chapter I direction and dialogue (and the title screen)
js/story2.js        Chapter II direction and dialogue
js/story3.js        Chapter III direction, dialogue and workstation
js/story4.js        Chapter IV direction, dialogue and workstation
js/memo.js          generic work product (opinion / claim) with evidence citations
js/documents3.js    Chapter III matter file and the opinion's questions
js/documents4.js    Chapter IV matter file and the Klage's questions
js/scenes/silform.js  Silform plant gate, meeting room above Hall 2
js/scenes/oder.js     Szczecin embankment, Berlin on the Spree, Arbeitsgericht courtroom
js/documents2.js    Chapter II matter file, evidence and the Stellungnahme
docs/VISUAL_BIBLE.md art direction rules
docs/CURRICULUM.md  learning architecture: tiers, stages, tracks, source policy, chapter roadmap
docs/WORLD.md       cities, corridors, travel, seasons
js/curriculum.js    tracks / stages / chapters / practice notes (data)
tools/              screenshot & scripted-playthrough helpers (Playwright)
```

Developer jumps: `index.html?st=3` (start Chapter III), `index.html?st=3.consultation`, `index.html?st=4.hearing`, `index.html?scene=arbg_room`, `index.html?scene=office&mode=winter`, `index.html?scene=vk_room`, `index.html?scene=office&mode=evening`, `index.html?story=partner`, `index.html?story=negotiation&findall=1`.
