# THE FIRM — Visual Bible

The rules every scene, screen and document follows.

## North star
Premium neo-noir legal drama. Rain, glass, city light, restraint. The world is the interface.

## Rendering strategy
- **Cinematic 2.5D, procedural.** Canvas 2D scenes built from parallax layers (sky → far city → mid city → room → figures → foreground). No bitmap assets; everything is drawn in code so it stays crisp at any resolution and can be relit.
- **Layers** are pre-rendered offscreen once per scene; only live elements (rain, drips, lights, people, screens) are drawn per frame.
- **Camera** has handheld drift, mouse parallax and scripted dolly/zoom shots. Depth `d` controls parallax and how strongly a layer reacts to zoom (dolly feel).
- **Post**: soft-light colour grade per scene, vignette, animated film grain, lightning flash.

## Light
Lighting is a system, not decoration. Every scene declares key, ambient and rim light, and characters are shaded with it.
| Time | Key | Ambient | Rim | Grade |
|---|---|---|---|---|
| 07:12 Munich dawn, rain | cold window light | blue-grey | pale blue | cool, desaturated |
| 18:52 office evening | warm desk lamps | brown | steel blue | amber |
| 22:47 Warsaw night | pendant tungsten + laptop blue | dark umber | sodium orange (city) | orange/teal |

## Characters
Painted-noir figures: two-tone cel lighting with a soft terminator and Rembrandt patch, warm subsurface in shadows, rim light from the brightest source behind them. Silhouette first: status reads from posture, cut and palette before the face does.
- Wendt — black suit, jaw-length black bob, crossed arms. Authority by stillness.
- Adler — charcoal three-piece, silver swept hair, gold glasses.
- Jonas — rolled shirt sleeves, loosened tie, paper cup. Tired.
- Marta — charcoal turtleneck, auburn low ponytail.
- Nowicka — navy suit, blonde chignon, pearls. Appears on screens; cold light.
- Zieliński — open collar, no tie, club pin, stubble. A different world.
- Steinhauer — heavy build, navy suit, hands on hips; always backlit by the city.

## Typography
- Display: **Cormorant Garamond** — titles, dialogue, captions.
- Labels: **Barlow Condensed**, uppercase, 0.3–0.6em tracking — place/time stamps, UI labels.
- Documents: **EB Garamond** — contracts, minutes, letters.
- Workstation: **Inter**; data and clocks: **IBM Plex Mono**; handwriting: **Caveat**.

## Colour tokens
Ink `#07080b` · Paper `#f1ece2` · Brass `#c9a96b` (the firm) · Signal red `#b3322b` (stamps, deletions) · Cold `#9dbbe0`. Seller insertions in track changes: blue `#2b4fa8`; your decisions: brass.

## Interface philosophy
- No permanent HUD. Objectives whisper at the top and fade (Tab recalls them).
- Hover labels are two lines: object in tracked caps, verb in italic brass.
- Dialogue is subtitle-style over a bottom gradient — the character and the room stay visible. Words fade in; `|` marks a dramatic pause.
- Letterbox bars for cinematic beats.

## Documents
Paper has texture, weight, a slight rotation, a second sheet beneath it. Each kind has its own typography: KRS registry extract, newspaper, letterhead, board minutes with stamp and signatures, data-room index, printed email. Polish originals with a PL/EN toggle. Evidence is a highlighter stroke.

## Cities
- **Munich** — low, wide skyline; twin onion domes; TV tower; pitched roofs; blue-and-white tram; Apotheke sign. Cold dawn rain.
- **Warsaw** — the Palace of Culture floodlit against orange low clouds; glass towers with spires; yellow-and-red tram; KANTOR / APTEKA / BAR MLECZNY neon. Heavy night rain and lightning.

## Motion
Life, not spectacle: rain, drips running down glass, steam, blinking aviation lights, traffic streaks, breathing, blinking. Transitions are fades, dollies and short travel sequences — never slides or bounces.
