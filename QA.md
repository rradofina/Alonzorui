# AlonzoRui dual-viewport QA

Played in real Chrome (puppeteer-core + system Chrome) against `http://127.0.0.1:4173` — the same static files as a Vercel deploy.

Viewports:
- **phone** 390×844 touch
- **desktop** 1024×456 (Raymond's live Flag Dash size)

Each game: cover → Play → drive Alon (WASD) and Dad (arrows) ≥1.5s → screenshot → Home. Fail-card games skip Play and use fail Home.

Screenshots live under `/opt/cursor/artifacts/qa/` with the filenames below. This VM cannot create a WebGL context (`BindToCurrentSequence`), so Sky Buddies and the 3D GPU path were not played as 3D.

| slug | desktop boot | desktop play | desktop result | desktop home | phone boot | phone play | phone result | phone home | screenshots | issue + fix |
|---|---|---|---|---|---|---|---|---|---|---|
| hub | pass | n/a | n/a | n/a | pass | n/a | n/a | n/a | hub_desktop.png, hub_phone.png | 41 cards on both viewports. |
| sky-buddies | pass | n/a | fail-card | pass | pass | n/a | fail-card | pass | sky-buddies_desktop.png, sky-buddies_phone.png | VM has no WebGL. Fail card (Try again + Home) shows on boot. Home returns to hub. Not a 2D flyer — needs a real GPU to play. |
| flag-dash | pass | pass | pass | pass | pass | pass | pass | pass | flag-dash_desktop_boot.png, flag-dash_phone_boot.png, flag-dash_desktop.png, flag-dash_phone.png | Fixed this pass: larger planted buddies, stairs fill the field, coins/flag readable, hints inset, pills show round wins (R1 · first to 2). Camera snaps if someone falls. |
| bounce-caps | pass | pass | pass | pass | pass | pass | pass | pass | bounce-caps_desktop.png, bounce-caps_phone.png |  |
| frost-slide | pass | pass | pass | pass | pass | pass | pass | pass | frost-slide_desktop.png, frost-slide_phone.png |  |
| cloud-hop | pass | pass | pass | pass | pass | pass | pass | pass | cloud-hop_desktop.png, cloud-hop_phone.png |  |
| bubbly-bay | pass | pass | pass | pass | pass | pass | pass | pass | bubbly-bay_desktop.png, bubbly-bay_phone.png |  |
| critter-ride | pass | pass | pass | pass | pass | pass | pass | pass | critter-ride_desktop.png, critter-ride_phone.png |  |
| bubble-blaster | pass | pass | pass | pass | pass | pass | pass | pass | bubble-blaster_desktop.png, bubble-blaster_phone.png |  |
| star-shower | pass | pass | pass | pass | pass | pass | pass | pass | star-shower_desktop.png, star-shower_phone.png |  |
| paint-arena | pass | pass | pass | pass | pass | pass | pass | pass | paint-arena_desktop.png, paint-arena_phone.png | Playable splat room; thinner than mole/soccer. |
| balloon-boss | pass | pass | pass | pass | pass | pass | pass | pass | balloon-boss_desktop.png, balloon-boss_phone.png |  |
| kart-cruise | pass | pass | pass | pass | pass | pass | pass | pass | kart-cruise_desktop.png, kart-cruise_phone.png |  |
| sky-lanes | pass | pass | pass | pass | pass | pass | pass | pass | sky-lanes_desktop.png, sky-lanes_phone.png | 2D fallback roads. GPU path not verified here. |
| sled-zoom | pass | pass | pass | pass | pass | pass | pass | pass | sled-zoom_desktop.png, sled-zoom_phone.png |  |
| sunny-soccer | pass | pass | pass | pass | pass | pass | pass | pass | sunny-soccer_desktop.png, sunny-soccer_phone.png |  |
| beach-volley | pass | pass | pass | pass | pass | pass | pass | pass | beach-volley_desktop.png, beach-volley_phone.png |  |
| paddy-pong | pass | pass | pass | pass | pass | pass | pass | pass | paddy-pong_desktop.png, paddy-pong_phone.png |  |
| air-puck | pass | pass | pass | pass | pass | pass | pass | pass | air-puck_desktop.png, air-puck_phone.png |  |
| tug-stars | pass | pass | pass | pass | pass | pass | pass | pass | tug-stars_desktop.png, tug-stars_phone.png |  |
| hot-spud | pass | pass | pass | pass | pass | pass | pass | pass | hot-spud_desktop.png, hot-spud_phone.png |  |
| block-buddies | pass | pass | pass | pass | pass | pass | pass | pass | block-buddies_desktop.png, block-buddies_phone.png |  |
| mirror-maze | pass | pass | pass | pass | pass | pass | pass | pass | mirror-maze_desktop.png, mirror-maze_phone.png |  |
| color-dash | pass | pass | pass | pass | pass | pass | pass | pass | color-dash_desktop.png, color-dash_phone.png |  |
| flip-race | pass | pass | pass | pass | pass | pass | pass | pass | flip-race_desktop.png, flip-race_phone.png |  |
| tower-stack | pass | pass | pass | pass | pass | pass | pass | pass | tower-stack_desktop.png, tower-stack_phone.png |  |
| pillow-pop | pass | pass | pass | pass | pass | pass | pass | pass | pillow-pop_desktop.png, pillow-pop_phone.png | Playable but still a thinner bump room than soccer. |
| snow-puff | pass | pass | pass | pass | pass | pass | pass | pass | snow-puff_desktop.png, snow-puff_phone.png |  |
| sumo-bump | pass | pass | pass | pass | pass | pass | pass | pass | sumo-bump_desktop.png, sumo-bump_phone.png |  |
| coin-dash | pass | pass | pass | pass | pass | pass | pass | pass | coin-dash_desktop.png, coin-dash_phone.png |  |
| fruit-catch | pass | pass | pass | pass | pass | pass | pass | pass | fruit-catch_desktop.png, fruit-catch_phone.png |  |
| bubble-pop | pass | pass | pass | pass | pass | pass | pass | pass | bubble-pop_desktop.png, bubble-pop_phone.png |  |
| pet-rescue | pass | pass | pass | pass | pass | pass | pass | pass | pet-rescue_desktop.png, pet-rescue_phone.png |  |
| ring-glide | pass | pass | pass | pass | pass | pass | pass | pass | ring-glide_desktop.png, ring-glide_phone.png | 2D hoop course. GPU path not verified here. |
| maze-marble | pass | pass | pass | pass | pass | pass | pass | pass | maze-marble_desktop.png, maze-marble_phone.png | 2D fallback is a wide yard with a few walls, not a full 3D maze. Playable; GPU path not verified in this VM. |
| space-pads | pass | pass | pass | pass | pass | pass | pass | pass | space-pads_desktop.png, space-pads_phone.png | 2D moon pads. GPU path not verified here. Round wins HUD correct (Alon 1 / R2 · first to 2 after a heat). |
| noodle-duel | pass | pass | pass | pass | pass | pass | pass | pass | noodle-duel_desktop.png, noodle-duel_phone.png |  |
| glow-trails | pass | pass | pass | pass | pass | pass | pass | pass | glow-trails_desktop.png, glow-trails_phone.png |  |
| block-drop | pass | pass | pass | pass | pass | pass | pass | pass | block-drop_desktop.png, block-drop_phone.png |  |
| four-connect | pass | pass | pass | pass | pass | pass | pass | pass | four-connect_desktop.png, four-connect_phone.png | Dual boards work; landscape holes look dense but drops register. |
| mole-duel | pass | pass | pass | pass | pass | pass | pass | pass | mole-duel_desktop.png, mole-duel_phone.png |  |
| simon-spark | pass | pass | pass | pass | pass | pass | pass | pass | simon-spark_desktop.png, simon-spark_phone.png |  |

## Environment limits (honest)
- No WebGL in this VM. Sky Buddies was verified as the fail card only. Sky Lanes / Ring Glide / Maze Marble / Space Pads were played on their 2D fallbacks.
- Automated play is a short round, not a full best-of-3 for every slug. Space Pads and several jump/sport games did reach a round win and advanced the HUD.
- Flag Dash desktop boot + play were re-shot after the camera/scale fix; those frames are the ones to judge against Raymond's live screenshot.

## Flag Dash checklist
- Characters 2–3× prior size, planted on the home pad: **yes** (see `flag-dash_desktop_boot.png`)
- Stairs / coins / flag fill the play area: **yes**
- Hints inset on 1024×456 (bottom 446 / 456): **yes**
- HUD `0 / R1 · first to 2 / 0` — coins do not inflate pills: **yes**
- Phone pads stay below the field; buddies stay on pads: **yes** (`flag-dash_phone.png`)
