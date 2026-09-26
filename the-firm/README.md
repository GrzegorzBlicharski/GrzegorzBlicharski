# THE FIRM

A cinematic legal-thriller narrative game that runs in the browser. **Chapter I — The Syrena Deal.**

Monday, 07:12, Munich. Your first day at Adler Wendt. By 22:47 you are in Warsaw, and a football-club acquisition is about to collapse — unless you read what everyone else skipped.

## Play
Open `index.html` in a desktop browser (Chrome, Edge, Firefox, Safari). No build step, no install. An internet connection loads the fonts; everything else is local.

For the best experience: large window, headphones.

Controls: mouse for everything · Space/Enter to advance dialogue · 1–3 to pick answers · Esc to put documents down · Tab to recall your objective.

## What's in Chapter I
- Opening cinematic: Munich in the rain → the tower → the lobby → a glass elevator to the 22nd floor.
- Your desk as the interface: workstation, phone, case file, coffee, the window, the stairs to the partner floor.
- Dialogue with Dr. Helena Wendt, Jonas, Marta, the client and opposing counsel, with choices.
- Contract review: accept / reject / flag the seller's mark-up of a share purchase agreement.
- A data room with Polish originals (board minutes, registry extract, stadium lease, press clipping) — click passages to capture evidence.
- A case board: connect people, companies, clauses and money.
- Travel to Warsaw and a night negotiation whose outcome depends on what you found.

## Structure
```
index.html          entry point
css/game.css        overlay UI, dialogue, cards, phone
css/desk.css        documents, redline, workstation OS, case board
js/core.js          loop, camera, parallax layers, input, scene manager
js/gfx.js           sky, clouds, skylines & landmarks, rain, glass droplets, post-processing
js/people.js        procedural character renderer with scene lighting
js/audio.js         procedural WebAudio: rain, city, room tone, score, foley
js/scenes/*.js      Munich exteriors, lobby & elevator, office, partner office, travel, Warsaw
js/documents.js     document viewer, evidence, SPA redline
js/computer.js      the workstation (mail, documents, data room, calendar, research)
js/board.js         case board
js/story.js         Chapter I direction and dialogue
docs/VISUAL_BIBLE.md art direction rules
tools/              screenshot & scripted-playthrough helpers (Playwright)
```

Developer jumps: `index.html?scene=office&mode=evening`, `index.html?story=partner`, `index.html?story=negotiation&findall=1`.
