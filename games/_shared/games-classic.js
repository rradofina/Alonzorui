export const games = {
  "noodle-duel": {
    title: "Noodle Duel",
    emoji: "🍜",
    blurb: "Grow a snack noodle. Eat 8 bites — don't nibble a wall or pal.",
    hintAlon: "Alon: WASD steer",
    hintDad: "Dad: arrows steer",
    goal: "8 BITES",
    lives: 3,
    endOnOneOut: true,
    setup(ctx) {
      const f = ctx.field;
      ctx.data.cell = Math.max(14, Math.min(22, (Math.min(f.w, f.h) / 18) | 0));
      ctx.data.snakes = {
        alon: { body: [{ x: 4, y: 8 }], dir: { x: 1, y: 0 }, acc: 0 },
        dad: { body: [{ x: 12, y: 8 }], dir: { x: -1, y: 0 }, acc: 0 }
      };
      ctx.data.bite = { x: 8, y: 5 };
      ctx.data.cols = Math.max(8, (f.w / ctx.data.cell) | 0);
      ctx.data.rows = Math.max(8, (f.h / ctx.data.cell) | 0);
    },
    update(ctx, dt) {
      const cols = ctx.data.cols, rows = ctx.data.rows;
      ["alon", "dad"].forEach((id) => {
        const p = id === "alon" ? ctx.alon : ctx.dad;
        if (p.out) return;
        const inn = ctx.input(id);
        const s = ctx.data.snakes[id];
        if (inn.left) s.dir = { x: -1, y: 0 };
        if (inn.right) s.dir = { x: 1, y: 0 };
        if (inn.up) s.dir = { x: 0, y: -1 };
        if (inn.down) s.dir = { x: 0, y: 1 };
        s.acc += dt;
        if (s.acc > 0.18) {
          s.acc = 0;
          const head = s.body[0];
          const nx = head.x + s.dir.x, ny = head.y + s.dir.y;
          const hitWall = nx < 0 || ny < 0 || nx >= cols || ny >= rows;
          const other = ctx.data.snakes[id === "alon" ? "dad" : "alon"].body;
          const hit = hitWall || s.body.some((c) => c.x === nx && c.y === ny) || other.some((c) => c.x === nx && c.y === ny);
          if (hit) {
            ctx.hurt(p);
            s.body = [{ x: id === "alon" ? 3 : cols - 4, y: (rows / 2) | 0 }];
            return;
          }
          s.body.unshift({ x: nx, y: ny });
          if (nx === ctx.data.bite.x && ny === ctx.data.bite.y) {
            ctx.addScore(p, 1);
            ctx.chime();
            ctx.data.bite = { x: (Math.random() * cols) | 0, y: (Math.random() * rows) | 0 };
          } else s.body.pop();
        }
      });
      ctx.maybeFirstTo(8);
      ctx.maybeLastHeart();
    },
    draw(ctx) {
      const { g, w, h, field: f } = ctx;
      g.fillStyle = "#dcfce7"; g.fillRect(0, 0, w, h);
      ctx.fillField("#14532d");
      const cell = ctx.data.cell || 16;
      const drawSnake = (s, color) => {
        if (!s) return;
        s.body.forEach((c, i) => {
          g.fillStyle = color;
          g.globalAlpha = i ? 0.75 : 1;
          g.beginPath();
          g.roundRect(f.x + c.x * cell + 1, f.y + c.y * cell + 1, cell - 2, cell - 2, 6);
          g.fill();
          g.globalAlpha = 1;
        });
      };
      if (ctx.data.snakes) {
        drawSnake(ctx.data.snakes.alon, "#fb7185");
        drawSnake(ctx.data.snakes.dad, "#38bdf8");
      }
      if (ctx.data.bite) {
        g.font = `${cell}px serif`; g.textAlign = "center";
        g.fillText("🍜", f.x + ctx.data.bite.x * cell + cell / 2, f.y + ctx.data.bite.y * cell + cell * 0.8);
      }
      ctx.drawSparks(0.016);
    }
  },

  "glow-trails": {
    title: "Glow Trails",
    emoji: "⚡",
    blurb: "Leave a glow path. Last buddy rolling wins — 2 sparkles to victory.",
    hintAlon: "Alon: WASD steer",
    hintDad: "Dad: arrows steer",
    goal: "2 WINS",
    hearts: false,
    setup(ctx) { resetTrails(ctx); },
    update(ctx, dt) {
      ["alon", "dad"].forEach((id) => {
        const p = ctx.data.p[id];
        if (!p.live) return;
        const inn = ctx.input(id);
        if (inn.left) p.dir = { x: -1, y: 0 };
        if (inn.right) p.dir = { x: 1, y: 0 };
        if (inn.up) p.dir = { x: 0, y: -1 };
        if (inn.down) p.dir = { x: 0, y: 1 };
        p.acc += dt;
        if (p.acc > 0.07) {
          p.acc = 0;
          p.x += p.dir.x; p.y += p.dir.y;
          const key = p.x + "," + p.y;
          const f = ctx.field;
          const cols = ctx.data.cols, rows = ctx.data.rows;
          if (p.x < 0 || p.y < 0 || p.x >= cols || p.y >= rows || ctx.data.used.has(key)) {
            p.live = false;
            ctx.flash(id);
            ctx.bump();
          } else {
            ctx.data.used.add(key);
            p.trail.push({ x: p.x, y: p.y });
          }
        }
      });
      const a = ctx.data.p.alon.live, d = ctx.data.p.dad.live;
      if (!a || !d) {
        if (!ctx.data.scored) {
          ctx.data.scored = true;
          if (a && !d) ctx.addScore(ctx.alon, 1);
          else if (d && !a) ctx.addScore(ctx.dad, 1);
          setTimeout(() => {
            if (ctx.alon.score >= 2 || ctx.dad.score >= 2) ctx.maybeFirstTo(2);
            else if (ctx.playing) resetTrails(ctx);
          }, 600);
        }
      }
    },
    draw(ctx) {
      const { g, w, h, field: f } = ctx;
      g.fillStyle = "#020617"; g.fillRect(0, 0, w, h);
      ctx.fillField("rgba(255,255,255,.04)");
      const cell = ctx.data.cell || 10;
      const paint = (trail, color) => {
        g.fillStyle = color;
        (trail || []).forEach((c) => {
          g.fillRect(f.x + c.x * cell, f.y + c.y * cell, cell - 1, cell - 1);
        });
      };
      if (ctx.data.p) {
        paint(ctx.data.p.alon.trail, "#fb7185");
        paint(ctx.data.p.dad.trail, "#38bdf8");
      }
      ctx.drawSparks(0.016);
    }
  },

  "block-drop": {
    title: "Block Drop",
    emoji: "🧱",
    blurb: "Side-by-side falling blocks. Clear 5 lines first!",
    hintAlon: "Alon: A D move · W spin · S drop",
    hintDad: "Dad: ← → move · ↑ spin · ↓ drop",
    goal: "5 LINES",
    hearts: false,
    setup(ctx) {
      ctx.data.well = { alon: emptyWell(), dad: emptyWell() };
      ctx.data.piece = { alon: newPiece(), dad: newPiece() };
      ctx.data.fall = { alon: 0, dad: 0 };
    },
    update(ctx, dt) {
      ["alon", "dad"].forEach((id) => {
        const p = id === "alon" ? ctx.alon : ctx.dad;
        const well = ctx.data.well[id];
        let piece = ctx.data.piece[id];
        ctx.data.fall[id] += dt + (ctx.input(id).down ? dt * 3 : 0);
        if (ctx.pressed(id, "left")) tryMove(well, piece, -1, 0);
        if (ctx.pressed(id, "right")) tryMove(well, piece, 1, 0);
        if (ctx.pressed(id, "up")) tryRotate(well, piece);
        if (ctx.data.fall[id] > 0.55) {
          ctx.data.fall[id] = 0;
          if (!tryMove(well, piece, 0, 1)) {
            stamp(well, piece);
            const cleared = clearLines(well);
            if (cleared) { ctx.addScore(p, cleared); ctx.chime(); }
            ctx.data.piece[id] = newPiece();
            if (collides(well, ctx.data.piece[id])) {
              ctx.data.well[id] = emptyWell();
              ctx.flash(id);
            }
          }
        }
      });
      ctx.maybeFirstTo(5);
    },
    draw(ctx) {
      const { g, w, h, field: f } = ctx;
      g.fillStyle = "#1e1b4b"; g.fillRect(0, 0, w, h);
      ctx.fillField("rgba(255,255,255,.06)");
      const bw = f.w / 2 - 24;
      drawWell(g, ctx.data.well.alon, ctx.data.piece.alon, f.x + 12, f.y + 8, bw, f.h - 16, "#fb7185");
      drawWell(g, ctx.data.well.dad, ctx.data.piece.dad, f.x + f.w / 2 + 12, f.y + 8, bw, f.h - 16, "#38bdf8");
      ctx.drawSparks(0.016);
    }
  },

  "four-connect": {
    title: "Four Connect",
    emoji: "🔴",
    blurb: "Each buddy has a board. Drop discs — first happy four-in-a-row wins!",
    hintAlon: "Alon: A D aim · S drop",
    hintDad: "Dad: ← → aim · ↓ drop",
    goal: "CONNECT 4",
    hearts: false,
    setup(ctx) {
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
            ctx.data.cool[id] = 0.25;
            ctx.beep(480, 0.06, "sine", 0.05);
            if (wonBoard(ctx.data.board[id])) {
              const p = id === "alon" ? ctx.alon : ctx.dad;
              ctx.addScore(p, 1);
              ctx.end(id, `${p.name} wins!`, "Four in a cozy row!", "🔴");
            }
          }
        }
      });
    },
    draw(ctx) {
      const { g, w, h, field: f } = ctx;
      g.fillStyle = "#fff7ed"; g.fillRect(0, 0, w, h);
      ctx.fillField("rgba(255,255,255,.3)");
      const bw = f.w / 2 - 20;
      paintBoard(g, ctx.data.board.alon, ctx.data.col.alon, f.x + 10, f.y + 8, bw, f.h - 16, "#fb7185");
      paintBoard(g, ctx.data.board.dad, ctx.data.col.dad, f.x + f.w / 2 + 10, f.y + 8, bw, f.h - 16, "#38bdf8");
      ctx.drawSparks(0.016);
    }
  },

  "mole-duel": {
    title: "Mole Duel",
    emoji: "🐹",
    blurb: "Pink moles for Alon, blue moles for Dad. Whack 10 of yours!",
    hintAlon: "Alon: WASD move · W bonk",
    hintDad: "Dad: arrows move · ↑ bonk",
    goal: "10 BONKS",
    hearts: false,
    setup(ctx) {
      const f = ctx.field;
      ctx.data.holes = [];
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 3; c++) {
          ctx.data.holes.push({
            x: f.x + f.w * (0.2 + c * 0.3),
            y: f.y + f.h * (0.32 + r * 0.36),
            who: null,
            t: 0
          });
        }
      }
    },
    update(ctx, dt) {
      [ctx.alon, ctx.dad].forEach((p) => ctx.moveTopDown(p, 250, dt));
      ctx.data.holes.forEach((h) => {
        h.t -= dt;
        if (h.t <= 0) {
          h.who = Math.random() < 0.5 ? "alon" : "dad";
          h.t = 0.9 + Math.random() * 0.7;
        }
      });
      [ctx.alon, ctx.dad].forEach((p) => {
        if (!ctx.pressed(p.id, "up") && !ctx.input(p.id).up) return;
        ctx.data.holes.forEach((h) => {
          if (h.who && ctx.dist(p.x, p.y, h.x, h.y) < 40) {
            if (h.who === p.id) {
              ctx.addScore(p, 1);
              ctx.chime();
              ctx.burst(h.x, h.y, p.color, 12);
            } else {
              ctx.flash(p.id);
              ctx.bump();
            }
            h.who = null;
            h.t = 0.35;
          }
        });
      });
      ctx.maybeFirstTo(10);
    },
    draw(ctx) {
      const { g, w, h } = ctx;
      g.fillStyle = "#86efac"; g.fillRect(0, 0, w, h);
      ctx.fillField("#bbf7d0");
      (ctx.data.holes || []).forEach((hole) => {
        g.fillStyle = "#365314";
        g.beginPath(); g.ellipse(hole.x, hole.y + 10, 28, 14, 0, 0, Math.PI * 2); g.fill();
        if (hole.who) {
          g.font = "36px serif"; g.textAlign = "center";
          g.fillText(hole.who === "alon" ? "🐹" : "🐭", hole.x, hole.y);
        }
      });
      ctx.drawBuddies({ alon: "🔨", dad: "🔨" });
      ctx.drawSparks(0.016);
    }
  },

  "simon-spark": {
    title: "Simon Spark",
    emoji: "✨",
    blurb: "Watch the sparkles, then copy the path. Longest memory wins!",
    hintAlon: "Alon: WASD copy",
    hintDad: "Dad: arrows copy",
    goal: "MEMORY",
    lives: 3,
    endOnOneOut: true,
    setup(ctx) {
      ctx.data.seq = [randDir()];
      ctx.data.phase = "show";
      ctx.data.i = 0;
      ctx.data.timer = 0.6;
      ctx.data.step = { alon: 0, dad: 0 };
      ctx.data.alive = { alon: true, dad: true };
      ctx.banner("Watch!", 700);
    },
    update(ctx, dt) {
      ctx.data.timer -= dt;
      if (ctx.data.phase === "show") {
        if (ctx.data.timer <= 0) {
          ctx.data.i += 1;
          if (ctx.data.i >= ctx.data.seq.length) {
            ctx.data.phase = "copy";
            ctx.data.step = { alon: 0, dad: 0 };
            ctx.banner("Copy!", 600);
          } else ctx.data.timer = 0.55;
        }
      } else {
        ["alon", "dad"].forEach((id) => {
          const p = id === "alon" ? ctx.alon : ctx.dad;
          if (p.out || !ctx.data.alive[id]) return;
          const dir = readDir(ctx, id);
          if (!dir) return;
          const need = ctx.data.seq[ctx.data.step[id]];
          if (dir === need) {
            ctx.data.step[id] += 1;
            ctx.beep(500 + ctx.data.step[id] * 80, 0.06, "sine", 0.05);
            if (ctx.data.step[id] >= ctx.data.seq.length) {
              ctx.addScore(p, 1);
              ctx.data.alive[id] = "done";
            }
          } else {
            ctx.hurt(p);
            ctx.data.alive[id] = false;
          }
        });
        const a = ctx.data.alive.alon, d = ctx.data.alive.dad;
        if ((a === "done" || a === false) && (d === "done" || d === false)) {
          if (ctx.alon.out || ctx.dad.out) ctx.maybeLastHeart();
          ctx.data.seq.push(randDir());
          ctx.data.phase = "show";
          ctx.data.i = 0;
          ctx.data.timer = 0.6;
          ctx.data.alive = { alon: !ctx.alon.out, dad: !ctx.dad.out };
          ctx.banner("Watch!", 700);
        }
      }
      if (ctx.alon.score >= 6 || ctx.dad.score >= 6) ctx.maybeFirstTo(6);
    },
    draw(ctx) {
      const { g, w, h, field: f } = ctx;
      g.fillStyle = "#312e81"; g.fillRect(0, 0, w, h);
      ctx.fillField("rgba(255,255,255,.08)");
      const pads = [
        { dir: "up", x: f.x + f.w / 2, y: f.y + f.h * 0.28, e: "▲" },
        { dir: "down", x: f.x + f.w / 2, y: f.y + f.h * 0.72, e: "▼" },
        { dir: "left", x: f.x + f.w * 0.28, y: f.y + f.h / 2, e: "◀" },
        { dir: "right", x: f.x + f.w * 0.72, y: f.y + f.h / 2, e: "▶" }
      ];
      const lit = ctx.data.phase === "show" ? ctx.data.seq[ctx.data.i] : null;
      pads.forEach((p) => {
        g.fillStyle = p.dir === lit ? "#fde047" : "rgba(255,255,255,.15)";
        g.beginPath(); g.arc(p.x, p.y, 36, 0, Math.PI * 2); g.fill();
        g.fillStyle = "#fff";
        g.font = "28px Trebuchet MS"; g.textAlign = "center"; g.textBaseline = "middle";
        g.fillText(p.e, p.x, p.y);
      });
      ctx.drawBuddies({ alon: "✨", dad: "✨" });
      ctx.drawSparks(0.016);
    }
  }
};

function resetTrails(ctx) {
  const f = ctx.field;
  ctx.data.cell = 12;
  ctx.data.cols = Math.max(10, (f.w / 12) | 0);
  ctx.data.rows = Math.max(10, (f.h / 12) | 0);
  ctx.data.used = new Set();
  ctx.data.scored = false;
  ctx.data.p = {
    alon: { x: 3, y: (ctx.data.rows / 2) | 0, dir: { x: 1, y: 0 }, trail: [], acc: 0, live: true },
    dad: { x: ctx.data.cols - 4, y: (ctx.data.rows / 2) | 0, dir: { x: -1, y: 0 }, trail: [], acc: 0, live: true }
  };
  ctx.data.used.add("3," + ctx.data.p.alon.y);
  ctx.data.used.add(ctx.data.p.dad.x + "," + ctx.data.p.dad.y);
}

function emptyWell() {
  return Array.from({ length: 12 }, () => Array(6).fill(0));
}
function newPiece() {
  const kinds = [
    [[1, 1], [1, 1]],
    [[1, 1, 1, 1]],
    [[1, 1, 1], [0, 1, 0]]
  ];
  return { x: 2, y: 0, cells: kinds[(Math.random() * kinds.length) | 0] };
}
function collides(well, piece, ox, oy) {
  const cells = piece.cells;
  for (let r = 0; r < cells.length; r++) {
    for (let c = 0; c < cells[r].length; c++) {
      if (!cells[r][c]) continue;
      const x = piece.x + c + (ox || 0), y = piece.y + r + (oy || 0);
      if (x < 0 || x >= 6 || y >= 12 || (y >= 0 && well[y][x])) return true;
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
  piece.cells = next;
  if (collides(well, piece)) piece.cells = old;
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
      well.unshift(Array(6).fill(0));
      n += 1;
      r++;
    }
  }
  return n;
}
function drawWell(g, well, piece, x, y, w, h, color) {
  if (!well) return;
  const cw = w / 6, ch = h / 12;
  g.fillStyle = "rgba(0,0,0,.25)";
  g.fillRect(x, y, w, h);
  const paint = (c, r, on) => {
    if (!on) return;
    g.fillStyle = color;
    g.fillRect(x + c * cw + 1, y + r * ch + 1, cw - 2, ch - 2);
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
  const cw = w / 7, ch = (h - 30) / 6;
  g.fillStyle = "#1d4ed8";
  g.beginPath(); g.roundRect(x, y + 28, w, h - 28, 16); g.fill();
  board.forEach((row, r) => row.forEach((v, c) => {
    g.fillStyle = v ? color : "#0f172a";
    g.beginPath();
    g.arc(x + (c + 0.5) * cw, y + 40 + (r + 0.5) * ch, Math.min(cw, ch) * 0.36, 0, Math.PI * 2);
    g.fill();
  }));
  g.fillStyle = color;
  g.beginPath();
  g.arc(x + (col + 0.5) * cw, y + 14, 10, 0, Math.PI * 2);
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
