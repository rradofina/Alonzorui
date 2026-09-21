export const games = {
  "noodle-duel": {
    title: "Noodle Duel",
    emoji: "🍜",
    blurb: "Three snack races! Steer a chunky noodle, gulp bites. Walls wrap — first to the bowl wins the heat.",
    hintAlon: "Alon: WASD steer",
    hintDad: "Dad: arrows steer",
    goal: "BEST OF 3",
    hearts: false,
    rounds: 3,
    roundNames: ["Broth", "Bowl", "Feast"],
    setup(ctx) { ctx.resetMatch(); },
    setupRound(ctx, n) {
      const f = ctx.field;
      ctx.data.cell = Math.max(22, Math.min(32, (Math.min(f.w, f.h) / 14) | 0));
      ctx.data.cols = Math.max(10, (f.w / ctx.data.cell) | 0);
      ctx.data.rows = Math.max(8, (f.h / ctx.data.cell) | 0);
      const mid = (ctx.data.rows / 2) | 0;
      ctx.data.snakes = {
        alon: { body: [{ x: 2, y: mid }, { x: 1, y: mid }], dir: { x: 1, y: 0 }, next: { x: 1, y: 0 }, acc: 0 },
        dad: { body: [{ x: ctx.data.cols - 3, y: mid }, { x: ctx.data.cols - 2, y: mid }], dir: { x: -1, y: 0 }, next: { x: -1, y: 0 }, acc: 0 }
      };
      ctx.data.need = 4 + n;
      ctx.data.got = { alon: 0, dad: 0 };
      ctx.data.tick = 0.3;
      ctx.data.bite = placeBite(ctx);
    },
    update(ctx, dt) {
      ["alon", "dad"].forEach((id) => {
        const inn = ctx.input(id);
        const s = ctx.data.snakes[id];
        const want = inn.left ? { x: -1, y: 0 } : inn.right ? { x: 1, y: 0 } : inn.up ? { x: 0, y: -1 } : inn.down ? { x: 0, y: 1 } : null;
        if (want && (want.x !== -s.dir.x || want.y !== -s.dir.y)) s.next = want;
        s.acc += dt;
        if (s.acc < ctx.data.tick) return;
        s.acc = 0;
        s.dir = s.next;
        const head = s.body[0];
        let nx = head.x + s.dir.x, ny = head.y + s.dir.y;
        if (nx < 0) nx = ctx.data.cols - 1;
        if (ny < 0) ny = ctx.data.rows - 1;
        if (nx >= ctx.data.cols) nx = 0;
        if (ny >= ctx.data.rows) ny = 0;
        const selfHit = s.body.some((c) => c.x === nx && c.y === ny);
        if (selfHit) {
          s.body = s.body.slice(0, Math.max(2, s.body.length - 1));
          ctx.flash(id); ctx.bump();
          return;
        }
        s.body.unshift({ x: nx, y: ny });
        if (nx === ctx.data.bite.x && ny === ctx.data.bite.y) {
          ctx.data.got[id] += 1;
          ctx.addScore(id === "alon" ? ctx.alon : ctx.dad, 1, "YUM");
          ctx.chime();
          ctx.burst(ctx.field.x + (nx + 0.5) * ctx.data.cell, ctx.field.y + (ny + 0.5) * ctx.data.cell, "#fbbf24", 12);
          ctx.data.bite = placeBite(ctx);
          if (ctx.data.got[id] >= ctx.data.need) ctx.winRound(id, "Noodle champ!");
        } else s.body.pop();
      });
      ctx.setGoal(`${Math.max(ctx.data.got.alon, ctx.data.got.dad)}/${ctx.data.need}`);
    },
    draw(ctx) {
      ctx.withShake(() => {
        ctx.drawTheme("noodle");
        const { g, field: f } = ctx;
        const cell = ctx.data.cell || 22;
        const paint = (s, color) => {
          if (!s) return;
          s.body.forEach((c, i) => {
            g.fillStyle = color;
            g.globalAlpha = i ? 0.78 : 1;
            g.beginPath();
            g.roundRect(f.x + c.x * cell + 2, f.y + c.y * cell + 2, cell - 4, cell - 4, 8);
            g.fill();
            g.globalAlpha = 1;
          });
        };
        if (ctx.data.snakes) {
          paint(ctx.data.snakes.alon, "#fb7185");
          paint(ctx.data.snakes.dad, "#38bdf8");
        }
        if (ctx.data.bite) ctx.icon(f.x + ctx.data.bite.x * cell + cell / 2, f.y + ctx.data.bite.y * cell + cell / 2, "🍜", "#fbbf24", cell * 0.32);
        ctx.drawJuice();
      });
    }
  },

  "glow-trails": {
    title: "Glow Trails",
    emoji: "⚡",
    blurb: "Three neon heats! Leave a fat glow path. Last buddy rolling takes the heat.",
    hintAlon: "Alon: WASD steer",
    hintDad: "Dad: arrows steer",
    goal: "BEST OF 3",
    hearts: false,
    rounds: 3,
    roundNames: ["Spark", "Arc", "Nova"],
    setup(ctx) { ctx.resetMatch(); },
    setupRound(ctx, n) { resetTrails(ctx, n); },
    update(ctx, dt) {
      ["alon", "dad"].forEach((id) => {
        const p = ctx.data.p[id];
        if (!p.live) return;
        const inn = ctx.input(id);
        const want = inn.left ? { x: -1, y: 0 } : inn.right ? { x: 1, y: 0 } : inn.up ? { x: 0, y: -1 } : inn.down ? { x: 0, y: 1 } : null;
        if (want && (want.x !== -p.dir.x || want.y !== -p.dir.y)) p.dir = want;
        p.acc += dt;
        if (p.acc < ctx.data.tick) return;
        p.acc = 0;
        p.x += p.dir.x; p.y += p.dir.y;
        const key = p.x + "," + p.y;
        if (p.x < 0 || p.y < 0 || p.x >= ctx.data.cols || p.y >= ctx.data.rows || ctx.data.used.has(key)) {
          p.live = false;
          ctx.flash(id);
          ctx.bump();
          ctx.punch(0.18);
        } else {
          ctx.data.used.add(key);
          p.trail.push({ x: p.x, y: p.y });
        }
      });
      const a = ctx.data.p.alon.live, d = ctx.data.p.dad.live;
      if (!a || !d) {
        if (!ctx.data.scored) {
          ctx.data.scored = true;
          if (a && !d) ctx.winRound("alon", "Glow last!");
          else if (d && !a) ctx.winRound("dad", "Glow last!");
          else {
            const la = ctx.data.p.alon.trail.length, ld = ctx.data.p.dad.trail.length;
            ctx.winRound(la >= ld ? "alon" : "dad", "Glow last!");
          }
        }
      }
    },
    draw(ctx) {
      ctx.withShake(() => {
        ctx.drawTheme("glow");
        const { g, field: f } = ctx;
        const cell = ctx.data.cell || 16;
        const paint = (trail, color) => {
          g.fillStyle = color;
          (trail || []).forEach((c) => {
            g.globalAlpha = 0.9;
            g.beginPath();
            g.roundRect(f.x + c.x * cell + 1, f.y + c.y * cell + 1, cell - 2, cell - 2, 4);
            g.fill();
            g.globalAlpha = 1;
          });
        };
        if (ctx.data.p) {
          paint(ctx.data.p.alon.trail, "#fb7185");
          paint(ctx.data.p.dad.trail, "#38bdf8");
        }
        ctx.drawJuice();
      });
    }
  },

  "block-drop": {
    title: "Block Drop",
    emoji: "🧱",
    blurb: "Three cozy wells. Slide fat blocks, clear lines. First to the line goal wins the heat.",
    hintAlon: "Alon: A D move · W spin · S drop",
    hintDad: "Dad: ← → move · ↑ spin · ↓ drop",
    goal: "BEST OF 3",
    hearts: false,
    rounds: 3,
    roundNames: ["Soft", "Stack", "Rush"],
    setup(ctx) { ctx.resetMatch(); },
    setupRound(ctx, n) {
      ctx.data.well = { alon: emptyWell(), dad: emptyWell() };
      ctx.data.piece = { alon: newPiece(), dad: newPiece() };
      ctx.data.fall = { alon: 0, dad: 0 };
      ctx.data.need = 3 + n;
      ctx.data.lines = { alon: 0, dad: 0 };
      ctx.data.das = { alon: 0, dad: 0 };
    },
    update(ctx, dt) {
      ["alon", "dad"].forEach((id) => {
        const p = id === "alon" ? ctx.alon : ctx.dad;
        const well = ctx.data.well[id];
        const piece = ctx.data.piece[id];
        const inn = ctx.input(id);
        ctx.data.das[id] -= dt;
        if (ctx.pressed(id, "left")) { tryMove(well, piece, -1, 0); ctx.data.das[id] = 0.16; }
        else if (inn.left && ctx.data.das[id] <= 0) { tryMove(well, piece, -1, 0); ctx.data.das[id] = 0.12; }
        if (ctx.pressed(id, "right")) { tryMove(well, piece, 1, 0); ctx.data.das[id] = 0.16; }
        else if (inn.right && ctx.data.das[id] <= 0) { tryMove(well, piece, 1, 0); ctx.data.das[id] = 0.12; }
        if (ctx.pressed(id, "up")) tryRotate(well, piece);
        ctx.data.fall[id] += dt + (inn.down ? dt * 2.4 : 0);
        if (ctx.data.fall[id] > 0.72) {
          ctx.data.fall[id] = 0;
          if (!tryMove(well, piece, 0, 1)) {
            stamp(well, piece);
            const cleared = clearLines(well);
            if (cleared) {
              ctx.data.lines[id] += cleared;
              ctx.addScore(p, cleared, cleared > 1 ? "LINES" : "+");
              ctx.chime();
              if (ctx.data.lines[id] >= ctx.data.need) ctx.winRound(id, "Line party!");
            }
            ctx.data.piece[id] = newPiece();
            if (collides(well, ctx.data.piece[id])) {
              ctx.data.well[id] = emptyWell();
              ctx.flash(id);
              ctx.bump();
            }
          }
        }
      });
      ctx.setGoal(`${Math.max(ctx.data.lines.alon, ctx.data.lines.dad)}/${ctx.data.need}`);
    },
    draw(ctx) {
      ctx.withShake(() => {
        ctx.drawTheme("blocks");
        const { g, field: f } = ctx;
        const bw = f.w / 2 - 24;
        drawWell(g, ctx.data.well.alon, ctx.data.piece.alon, f.x + 12, f.y + 28, bw, f.h - 40, "#fb7185");
        drawWell(g, ctx.data.well.dad, ctx.data.piece.dad, f.x + f.w / 2 + 12, f.y + 28, bw, f.h - 40, "#38bdf8");
        ctx.drawJuice();
      });
    }
  },

  "four-connect": {
    title: "Four Connect",
    emoji: "🔴",
    blurb: "Three cozy boards. Drop chunky discs — first happy four-in-a-row wins the heat.",
    hintAlon: "Alon: A D aim · S drop",
    hintDad: "Dad: ← → aim · ↓ drop",
    goal: "BEST OF 3",
    hearts: false,
    rounds: 3,
    roundNames: ["Drop", "Stack", "Clutch"],
    setup(ctx) { ctx.resetMatch(); },
    setupRound(ctx) {
      ctx.data.board = { alon: emptyBoard(), dad: emptyBoard() };
      ctx.data.col = { alon: 3, dad: 3 };
      ctx.data.cool = { alon: 0, dad: 0 };
    },
    update(ctx, dt) {
      ["alon", "dad"].forEach((id) => {
        ctx.data.cool[id] -= dt;
        if (ctx.pressed(id, "left")) ctx.data.col[id] = Math.max(0, ctx.data.col[id] - 1);
        if (ctx.pressed(id, "right")) ctx.data.col[id] = Math.min(6, ctx.data.col[id] + 1);
        if ((ctx.pressed(id, "down") || ctx.pressed(id, "up")) && ctx.data.cool[id] <= 0) {
          if (dropDisc(ctx.data.board[id], ctx.data.col[id], 1)) {
            ctx.data.cool[id] = 0.22;
            ctx.pop();
            if (wonBoard(ctx.data.board[id])) {
              ctx.addScore(id === "alon" ? ctx.alon : ctx.dad, 1, "FOUR");
              ctx.winRound(id, "Four in a cozy row!");
            } else if (boardFull(ctx.data.board[id])) {
              ctx.data.board[id] = emptyBoard();
              ctx.banner("Fresh board!", 600);
            }
          }
        }
      });
    },
    draw(ctx) {
      ctx.withShake(() => {
        ctx.drawTheme("connect");
        const { g, field: f } = ctx;
        const bw = f.w / 2 - 20;
        paintBoard(g, ctx.data.board.alon, ctx.data.col.alon, f.x + 10, f.y + 28, bw, f.h - 40, "#fb7185");
        paintBoard(g, ctx.data.board.dad, ctx.data.col.dad, f.x + f.w / 2 + 10, f.y + 28, bw, f.h - 40, "#38bdf8");
        ctx.drawJuice();
      });
    }
  },

  "mole-duel": {
    title: "Mole Duel",
    emoji: "🐹",
    blurb: "Three garden heats! Pink moles for Alon, blue for Dad. Bonk yours — first to the goal wins.",
    hintAlon: "Alon: WASD move · W bonk",
    hintDad: "Dad: arrows move · ↑ bonk",
    goal: "BEST OF 3",
    hearts: false,
    rounds: 3,
    roundNames: ["Peek", "Pop", "Whack"],
    setup(ctx) { ctx.resetMatch(); },
    setupRound(ctx, n) {
      const f = ctx.field;
      ctx.data.holes = [];
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 3; c++) {
          ctx.data.holes.push({
            x: f.x + f.w * (0.2 + c * 0.3),
            y: f.y + f.h * (0.34 + r * 0.34),
            who: null,
            t: 0.2 + Math.random() * 0.4
          });
        }
      }
      ctx.data.need = 5 + n;
      ctx.data.got = { alon: 0, dad: 0 };
      ctx.data.stay = 1.7 + (3 - n) * 0.25;
      ctx.place(0.18, 0.82, 0.82);
    },
    update(ctx, dt) {
      [ctx.alon, ctx.dad].forEach((p) => ctx.moveTopDown(p, 260, dt));
      ctx.data.holes.forEach((h) => {
        h.t -= dt;
        if (h.t <= 0) {
          h.who = Math.random() < 0.5 ? "alon" : "dad";
          h.t = ctx.data.stay + Math.random() * 0.5;
        }
      });
      [ctx.alon, ctx.dad].forEach((p) => {
        if (!ctx.pressed(p.id, "up") && !ctx.input(p.id).up) return;
        ctx.data.holes.forEach((h) => {
          if (h.who && ctx.dist(p.x, p.y, h.x, h.y) < 56) {
            if (h.who === p.id) {
              ctx.data.got[p.id] += 1;
              ctx.addScore(p, 1, "BONK");
              ctx.chime();
              ctx.burst(h.x, h.y, p.color, 12);
              if (ctx.data.got[p.id] >= ctx.data.need) ctx.winRound(p.id, "Mole champ!");
            }
            h.who = null;
            h.t = 0.28;
          }
        });
      });
      ctx.setGoal(`${Math.max(ctx.data.got.alon, ctx.data.got.dad)}/${ctx.data.need}`);
    },
    draw(ctx) {
      ctx.withShake(() => {
        ctx.drawTheme("mole");
        (ctx.data.holes || []).forEach((hole) => {
          ctx.g.fillStyle = "#365314";
          ctx.g.beginPath(); ctx.g.ellipse(hole.x, hole.y + 12, 34, 16, 0, 0, Math.PI * 2); ctx.g.fill();
          if (hole.who) ctx.icon(hole.x, hole.y - 6, hole.who === "alon" ? "🐹" : "🐭", hole.who === "alon" ? "#fb7185" : "#38bdf8", 18);
        });
        ctx.drawBuddies({ alon: "🔨", dad: "🔨" });
        ctx.drawJuice();
      });
    }
  },

  "simon-spark": {
    title: "Simon Spark",
    emoji: "✨",
    blurb: "Three memory heats! Watch the big pads, then copy. First to finish the path wins — AFK pals just sit out the heat.",
    hintAlon: "Alon: WASD copy",
    hintDad: "Dad: arrows copy",
    goal: "BEST OF 3",
    hearts: false,
    rounds: 3,
    roundNames: ["Twinkle", "Glow", "Dazzle"],
    setup(ctx) { ctx.resetMatch(); },
    setupRound(ctx, n) {
      const len = 3 + n;
      ctx.data.seq = [];
      for (let i = 0; i < len; i++) ctx.data.seq.push(randDir());
      ctx.data.phase = "show";
      ctx.data.i = 0;
      ctx.data.timer = 0.85;
      ctx.data.step = { alon: 0, dad: 0 };
      ctx.data.done = { alon: false, dad: false };
      ctx.data.miss = { alon: false, dad: false };
      ctx.data.copyTime = 0;
      ctx.place(0.22, 0.78, 0.86);
      ctx.banner("Watch!", 700);
    },
    update(ctx, dt) {
      ctx.data.timer -= dt;
      if (ctx.data.phase === "show") {
        if (ctx.data.timer > 0) return;
        ctx.data.i += 1;
        if (ctx.data.i >= ctx.data.seq.length) {
          ctx.data.phase = "copy";
          ctx.data.copyTime = 9 + ctx.data.seq.length;
          ctx.data.step = { alon: 0, dad: 0 };
          ctx.banner("Copy!", 600);
        } else ctx.data.timer = 0.7;
        return;
      }
      ctx.data.copyTime -= dt;
      ["alon", "dad"].forEach((id) => {
        if (ctx.data.done[id] || ctx.data.miss[id]) return;
        const dir = readDir(ctx, id);
        if (!dir) return;
        const need = ctx.data.seq[ctx.data.step[id]];
        if (dir === need) {
          ctx.data.step[id] += 1;
          ctx.beep(500 + ctx.data.step[id] * 80, 0.06, "sine", 0.05);
          if (ctx.data.step[id] >= ctx.data.seq.length) {
            ctx.data.done[id] = true;
            ctx.addScore(id === "alon" ? ctx.alon : ctx.dad, 1, "YES");
          }
        } else {
          ctx.data.miss[id] = true;
          ctx.flash(id);
          ctx.bump();
        }
      });
      if (ctx.data.done.alon) ctx.winRound("alon", "Spark memory!");
      else if (ctx.data.done.dad) ctx.winRound("dad", "Spark memory!");
      else if (ctx.data.copyTime <= 0 || (ctx.data.miss.alon && ctx.data.miss.dad)) {
        const sa = ctx.data.step.alon, sd = ctx.data.step.dad;
        ctx.winRound(sa === sd ? (sa >= sd ? "alon" : "dad") : sa > sd ? "alon" : "dad", "Spark memory!");
      }
    },
    draw(ctx) {
      ctx.withShake(() => {
        ctx.drawTheme("spark");
        const f = ctx.field;
        const pads = [
          { dir: "up", x: f.x + f.w / 2, y: f.y + f.h * 0.26, e: "▲" },
          { dir: "down", x: f.x + f.w / 2, y: f.y + f.h * 0.74, e: "▼" },
          { dir: "left", x: f.x + f.w * 0.26, y: f.y + f.h / 2, e: "◀" },
          { dir: "right", x: f.x + f.w * 0.74, y: f.y + f.h / 2, e: "▶" }
        ];
        const lit = ctx.data.phase === "show" ? ctx.data.seq[ctx.data.i] : null;
        pads.forEach((p) => {
          ctx.g.fillStyle = p.dir === lit ? "#fde047" : "rgba(255,255,255,.18)";
          ctx.g.beginPath(); ctx.g.arc(p.x, p.y, 48, 0, Math.PI * 2); ctx.g.fill();
          ctx.g.fillStyle = "#fff";
          ctx.g.font = "32px Trebuchet MS"; ctx.g.textAlign = "center"; ctx.g.textBaseline = "middle";
          ctx.g.fillText(p.e, p.x, p.y);
        });
        ctx.drawBuddies({ alon: "✨", dad: "✨" });
        ctx.drawJuice();
      });
    }
  }
};

function placeBite(ctx) {
  const taken = new Set();
  ["alon", "dad"].forEach((id) => {
    (ctx.data.snakes[id].body || []).forEach((c) => taken.add(c.x + "," + c.y));
  });
  for (let tries = 0; tries < 80; tries++) {
    const x = 1 + ((Math.random() * (ctx.data.cols - 2)) | 0);
    const y = 1 + ((Math.random() * (ctx.data.rows - 2)) | 0);
    if (!taken.has(x + "," + y)) return { x, y };
  }
  return { x: (ctx.data.cols / 2) | 0, y: 1 };
}

function resetTrails(ctx, n) {
  const f = ctx.field;
  ctx.data.cell = 18;
  ctx.data.cols = Math.max(12, (f.w / ctx.data.cell) | 0);
  ctx.data.rows = Math.max(10, (f.h / ctx.data.cell) | 0);
  ctx.data.used = new Set();
  ctx.data.scored = false;
  ctx.data.tick = 0.13 - n * 0.01;
  const mid = (ctx.data.rows / 2) | 0;
  ctx.data.p = {
    alon: { x: 3, y: mid, dir: { x: 1, y: 0 }, trail: [{ x: 3, y: mid }], acc: 0, live: true },
    dad: { x: ctx.data.cols - 4, y: mid, dir: { x: -1, y: 0 }, trail: [{ x: ctx.data.cols - 4, y: mid }], acc: 0, live: true }
  };
  ctx.data.used.add("3," + mid);
  ctx.data.used.add(ctx.data.p.dad.x + "," + mid);
}

function emptyWell() {
  return Array.from({ length: 12 }, () => Array(8).fill(0));
}
function newPiece() {
  const kinds = [
    [[1, 1], [1, 1]],
    [[1, 1, 1, 1]],
    [[1, 1, 1], [0, 1, 0]],
    [[1, 1, 0], [0, 1, 1]],
    [[1, 1, 1], [1, 0, 0]]
  ];
  return { x: 3, y: 0, cells: kinds[(Math.random() * kinds.length) | 0] };
}
function collides(well, piece, ox, oy) {
  const cells = piece.cells;
  for (let r = 0; r < cells.length; r++) {
    for (let c = 0; c < cells[r].length; c++) {
      if (!cells[r][c]) continue;
      const x = piece.x + c + (ox || 0), y = piece.y + r + (oy || 0);
      if (x < 0 || x >= 8 || y >= 12 || (y >= 0 && well[y][x])) return true;
    }
  }
  return false;
}
function tryMove(well, piece, dx, dy) {
  if (collides(well, piece, dx, dy)) return false;
  piece.x += dx; piece.y += dy;
  return true;
}
function tryRotate(well, piece) {
  const src = piece.cells;
  const next = src[0].map((_, i) => src.map((row) => row[i]).reverse());
  const old = piece.cells;
  const ox = piece.x;
  piece.cells = next;
  if (!collides(well, piece) || tryMove(well, piece, -1, 0) || tryMove(well, piece, 1, 0)) return;
  piece.cells = old;
  piece.x = ox;
}
function stamp(well, piece) {
  piece.cells.forEach((row, r) => row.forEach((v, c) => {
    if (v && piece.y + r >= 0) well[piece.y + r][piece.x + c] = 1;
  }));
}
function clearLines(well) {
  let n = 0;
  for (let r = well.length - 1; r >= 0; r--) {
    if (well[r].every((v) => v)) {
      well.splice(r, 1);
      well.unshift(Array(8).fill(0));
      n += 1;
      r++;
    }
  }
  return n;
}
function drawWell(g, well, piece, x, y, w, h, color) {
  if (!well) return;
  const cw = w / 8, ch = h / 12;
  g.fillStyle = "rgba(0,0,0,.28)";
  g.fillRect(x, y, w, h);
  const paint = (c, r, on) => {
    if (!on) return;
    g.fillStyle = color;
    g.beginPath();
    g.roundRect(x + c * cw + 2, y + r * ch + 2, cw - 4, ch - 4, 4);
    g.fill();
  };
  well.forEach((row, r) => row.forEach((v, c) => paint(c, r, v)));
  if (piece) {
    piece.cells.forEach((row, r) => row.forEach((v, c) => paint(piece.x + c, piece.y + r, v)));
  }
}

function emptyBoard() {
  return Array.from({ length: 6 }, () => Array(7).fill(0));
}
function dropDisc(board, col, who) {
  for (let r = 5; r >= 0; r--) {
    if (!board[r][col]) { board[r][col] = who; return true; }
  }
  return false;
}
function boardFull(b) {
  return b[0].every((v) => v);
}
function wonBoard(b) {
  const dirs = [[1, 0], [0, 1], [1, 1], [1, -1]];
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 7; c++) {
      if (!b[r][c]) continue;
      for (const [dr, dc] of dirs) {
        let n = 0;
        for (let k = 0; k < 4; k++) {
          const rr = r + dr * k, cc = c + dc * k;
          if (rr < 0 || cc < 0 || rr >= 6 || cc >= 7 || b[rr][cc] !== b[r][c]) break;
          n++;
        }
        if (n === 4) return true;
      }
    }
  }
  return false;
}
function paintBoard(g, board, col, x, y, w, h, color) {
  if (!board) return;
  const cw = w / 7, ch = (h - 34) / 6;
  g.fillStyle = "#1d4ed8";
  g.beginPath(); g.roundRect(x, y + 30, w, h - 30, 16); g.fill();
  const rad = Math.min(cw, ch) * 0.38;
  board.forEach((row, r) => row.forEach((v, c) => {
    g.fillStyle = v ? color : "#0f172a";
    g.beginPath();
    g.arc(x + (c + 0.5) * cw, y + 44 + (r + 0.5) * ch, rad, 0, Math.PI * 2);
    g.fill();
  }));
  g.fillStyle = color;
  g.beginPath();
  g.arc(x + (col + 0.5) * cw, y + 16, 12, 0, Math.PI * 2);
  g.fill();
}

function randDir() {
  return ["up", "down", "left", "right"][(Math.random() * 4) | 0];
}
function readDir(ctx, id) {
  if (ctx.pressed(id, "up")) return "up";
  if (ctx.pressed(id, "down")) return "down";
  if (ctx.pressed(id, "left")) return "left";
  if (ctx.pressed(id, "right")) return "right";
  return null;
}
