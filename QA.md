# AlonzoRui dual-viewport QA

Played in real Chrome (puppeteer-core + system Chrome) against `http://127.0.0.1:4173` — the same static files as a Vercel deploy.

Viewports:
- **phone** 390×844 touch
- **desktop** 1024×456 (Raymond's live Flag Dash size)
- **wide** 1280×800 (Flag Dash MUST-FIX only)

Each catalog game: cover → Play (or fail-card) → drive Alon (WASD) and Dad (arrows) ≥2.5s → screenshot → Home.

Screenshots live under `/opt/cursor/artifacts/qa/`. This VM cannot create a WebGL context (`BindToCurrentSequence`), so Sky Buddies and the 3D GPU path were not played as 3D.

Flag Dash was playtested **past a real flag hug** on wide, short, and phone (not just a short drive). That pass is the source of truth for the five MUST-FIX items.

| slug | desktop boot | desktop play | desktop result | desktop home | phone boot | phone play | phone result | phone home | screenshots | issue + fix |
|---|---|---|---|---|---|---|---|---|---|---|
| hub | pass | n/a | n/a | n/a | pass | n/a | n/a | n/a | hub_desktop.png, hub_phone.png | 41 cards on both viewports. |
| sky-buddies | pass | n/a | fail-card | pass | pass | n/a | fail-card | pass | sky-buddies_desktop.png, sky-buddies_phone.png | VM has no WebGL. Fail card (Try again + Home) shows on boot. Home returns to hub. Not a 2D flyer — needs a real GPU to play. |
| flag-dash | pass | pass | pass | pass | pass | pass | pass | pass | flag-dash_desktop.png, flag-dash_phone.png, flag-dash_wide_ready.png, flag-dash_wide_scored.png, flag-dash_wide_r2.png, flag-dash_short_ready.png, flag-dash_short_scored.png, flag-dash_short_r2.png, flag-dash_phone_ready.png, flag-dash_phone_scored.png, flag-dash_phone_r2.png | MUST-FIX verified this pass: hug flag → HUD `Dad takes R1!` + pills 0–1 instantly; both park on the start pad; then `R2/3` count-in. Course fits the viewport (no empty 1280 X-scroll). Hints inset on 1024×456 (bottom 438 / 456). Reload/Play pills start 0–0 / R1/3. |
| bounce-caps | pass | pass | pass | pass | pass | pass | pass | pass | bounce-caps_desktop.png, bounce-caps_phone.png | Short drive only. |
| frost-slide | pass | pass | pass | pass | pass | pass | pass | pass | frost-slide_desktop.png, frost-slide_phone.png | Short drive only. |
| cloud-hop | pass | pass | pass | pass | pass | pass | pass | pass | cloud-hop_desktop.png, cloud-hop_phone.png | Short drive only. |
| bubbly-bay | pass | pass | pass | pass | pass | pass | pass | pass | bubbly-bay_desktop.png, bubbly-bay_phone.png | Short drive only. |
| critter-ride | pass | pass | pass | pass | pass | pass | pass | pass | critter-ride_desktop.png, critter-ride_phone.png | Short drive only. |
| bubble-blaster | pass | pass | pass | pass | pass | pass | pass | pass | bubble-blaster_desktop.png, bubble-blaster_phone.png | Short drive only. |
| star-shower | pass | pass | pass | pass | pass | pass | pass | pass | star-shower_desktop.png, star-shower_phone.png | Short drive only. |
| paint-arena | pass | pass | pass | pass | pass | pass | pass | pass | paint-arena_desktop.png, paint-arena_phone.png | Playable splat room; still thinner than mole/soccer. Short drive only. |
| balloon-boss | pass | pass | pass | pass | pass | pass | pass | pass | balloon-boss_desktop.png, balloon-boss_phone.png | Short drive only. |
| kart-cruise | pass | pass | pass | pass | pass | pass | pass | pass | kart-cruise_desktop.png, kart-cruise_phone.png | Short drive only. |
| sky-lanes | pass | pass | pass | pass | pass | pass | pass | pass | sky-lanes_desktop.png, sky-lanes_phone.png | 2D fallback roads. GPU path not verified here. |
| sled-zoom | pass | pass | pass | pass | pass | pass | pass | pass | sled-zoom_desktop.png, sled-zoom_phone.png | Short drive only. |
| sunny-soccer | pass | pass | pass | pass | pass | pass | pass | pass | sunny-soccer_desktop.png, sunny-soccer_phone.png | Short drive only. |
| beach-volley | pass | pass | pass | pass | pass | pass | pass | pass | beach-volley_desktop.png, beach-volley_phone.png | Short drive only. |
| paddy-pong | pass | pass | pass | pass | pass | pass | pass | pass | paddy-pong_desktop.png, paddy-pong_phone.png | Short drive only. |
| air-puck | pass | pass | pass | pass | pass | pass | pass | pass | air-puck_desktop.png, air-puck_phone.png | Short drive only. |
| tug-stars | pass | pass | pass | pass | pass | pass | pass | pass | tug-stars_desktop.png, tug-stars_phone.png | Short drive only. |
| hot-spud | pass | pass | pass | pass | pass | pass | pass | pass | hot-spud_desktop.png, hot-spud_phone.png | Short drive only. |
| block-buddies | pass | pass | pass | pass | pass | pass | pass | pass | block-buddies_desktop.png, block-buddies_phone.png | Short drive only. |
| mirror-maze | pass | pass | pass | pass | pass | pass | pass | pass | mirror-maze_desktop.png, mirror-maze_phone.png | Short drive only. |
| color-dash | pass | pass | pass | pass | pass | pass | pass | pass | color-dash_desktop.png, color-dash_phone.png | Short drive only. |
| flip-race | pass | pass | pass | pass | pass | pass | pass | pass | flip-race_desktop.png, flip-race_phone.png | Short drive only. |
| tower-stack | pass | pass | pass | pass | pass | pass | pass | pass | tower-stack_desktop.png, tower-stack_phone.png | Short drive only. |
| pillow-pop | pass | pass | pass | pass | pass | pass | pass | pass | pillow-pop_desktop.png, pillow-pop_phone.png | Playable bump room; still thinner than soccer. Short drive only. |
| snow-puff | pass | pass | pass | pass | pass | pass | pass | pass | snow-puff_desktop.png, snow-puff_phone.png | Short drive only. |
| sumo-bump | pass | pass | pass | pass | pass | pass | pass | pass | sumo-bump_desktop.png, sumo-bump_phone.png | Short drive only. |
| coin-dash | pass | pass | pass | pass | pass | pass | pass | pass | coin-dash_desktop.png, coin-dash_phone.png | Short drive only. |
| fruit-catch | pass | pass | pass | pass | pass | pass | pass | pass | fruit-catch_desktop.png, fruit-catch_phone.png | Short drive only. |
| bubble-pop | pass | pass | pass | pass | pass | pass | pass | pass | bubble-pop_desktop.png, bubble-pop_phone.png | Short drive only. |
| pet-rescue | pass | pass | pass | pass | pass | pass | pass | pass | pet-rescue_desktop.png, pet-rescue_phone.png | Short drive only. |
| ring-glide | pass | pass | pass | pass | pass | pass | pass | pass | ring-glide_desktop.png, ring-glide_phone.png | 2D hoop course. GPU path not verified here. |
| maze-marble | pass | pass | pass | pass | pass | pass | pass | pass | maze-marble_desktop.png, maze-marble_phone.png | 2D fallback is a wide yard with a few walls, not a full 3D maze. Playable; GPU path not verified in this VM. |
| space-pads | pass | pass | pass | pass | pass | pass | pass | pass | space-pads_desktop.png, space-pads_phone.png | 2D moon pads. GPU path not verified here. |
| noodle-duel | pass | pass | pass | pass | pass | pass | pass | pass | noodle-duel_desktop.png, noodle-duel_phone.png | Short drive only. |
| glow-trails | pass | pass | pass | pass | pass | pass | pass | pass | glow-trails_desktop.png, glow-trails_phone.png | Short drive only. |
| block-drop | pass | pass | pass | pass | pass | pass | pass | pass | block-drop_desktop.png, block-drop_phone.png | Short drive only. |
| four-connect | pass | pass | pass | pass | pass | pass | pass | pass | four-connect_desktop.png, four-connect_phone.png | Dual boards accept drops on a short drive. |
| mole-duel | pass | pass | pass | pass | pass | pass | pass | pass | mole-duel_desktop.png, mole-duel_phone.png | Short drive only. |
| simon-spark | pass | pass | pass | pass | pass | pass | pass | pass | simon-spark_desktop.png, simon-spark_phone.png | Short drive only. |

## Environment limits (honest)
- No WebGL in this VM. Sky Buddies was verified as the fail card only. Sky Lanes / Ring Glide / Maze Marble / Space Pads were played on their 2D fallbacks.
- Automated play for 40/41 slugs is a short drive (cover → Play → ~2.5s keys → Home), not a full best-of-3. **Do not read the table as “every match finished.”**
- Flag Dash is the exception: Dad was driven to the flag on 1280×800, 1024×456, and 390×844, and the HUD/reset/R2 path was recorded.

## Flag Dash MUST-FIX checklist
1. **Round HUD stuck** — gone. Flag hug immediately paints pills `0 / Dad takes R1! / 1`, banners the result, then counts in `R2/3`. See `flag-dash_wide_scored.png` → `flag-dash_wide_r2.png`.
2. **Alon vanishes after score** — gone. Both snap back onto the start pad together (camera 0). See scored shots on all three sizes.
3. **Empty field / tiny scale** — gone. Course fits the field (world width = viewport). Buddies r≈100 on 1280×800, r≈62 on 1024×456, r≈68 on 390×844. Stairs / flag / coins fill the play area.
4. **Short-height clip** — gone. On 1024×456 hints sit at bottom 438 / 456 (18px inset, nowrap pills).
5. **Stale Dad=3** — gone. Reload and Play start `0 / BEST OF 3 / R1/3 / 0`. Pills show **round wins**, never coin pickups. `resetMatch()` also runs on Play again.

Phone start pad is now wide enough that both buddies stand on it after a score (`flag-dash_phone_scored.png`).
