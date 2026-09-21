import { run } from "./coop.js";
import { games as jump } from "./games-jump.js";
import { games as blast } from "./games-blast.js";
import { games as sport } from "./games-sport.js";
import { games as puzzle } from "./games-puzzle.js";
import { games as bump } from "./games-bump.js";
import { games as classic } from "./games-classic.js";
import { games as three } from "./games-3d.js";

const ALL = { ...jump, ...blast, ...sport, ...puzzle, ...bump, ...classic, ...three };

export function boot(slug) {
  const spec = ALL[slug];
  if (!spec) {
    document.body.innerHTML = `<p style="padding:24px;font:800 24px Trebuchet MS">Missing game: ${slug}</p>`;
    return;
  }
  run(spec);
}

export { ALL };
