export const games = {
  "block-buddies": {
    title: "Block Buddies",
    emoji: "📦",
    blurb: "Three tidy rooms! Push every crate onto a glow pad. Most pushes wins the heat when they're parked.",
    hintAlon: "Alon: WASD push",
    hintDad: "Dad: arrows push",
    goal: "BEST OF 3",
    hearts: false,
    rounds: 3,
    roundNames: ["One box", "Two box", "Heavy"],
    setup(ctx) { ctx.resetMatch(); },
    setupRound(ctx, n) {
      const f = ctx.field;
      const crates = [{ x: f.x + f.w * 0.4, y: f.y + f.h * 0.45, r: 22 }];
      if (n > 1) crates.push({ x: f.x + f.w * 0.6, y: f.y + f.h * 0.62, r: 22 });
      if (n > 2) crates.push({ x: f.x + f.w * 0.5, y: f.y + f.h * 0.3, r: 24 });
      ctx.data.crates = crates;
      ctx.data.pads = crates.map((_, i) => ({
        x: f.x + f.w * (0.2 + (i % 2) * 0.58),
        y: f.y + f.h * (0.28 + ((i / 2) | 0) * 0.44),
        r: 26
      }));
      ctx.data.pushes = { alon: 0, dad: 0 };
      ctx.place(0.18, 0.82, 0.55);
    },
    update(ctx, dt) {
      [ctx.alon, ctx.dad].forEach((p) => ctx.moveTopDown(p, 230, dt));
      ctx.data.crates.forEach((c) => {
        [ctx.alon, ctx.dad].forEach((p) => {
          if (ctx.dist(p.x, p.y, c.x, c.y) < p.r + c.r) {
            const dx = c.x - p.x, dy = c.y - p.y, m = Math.hypot(dx, dy) || 1;
            c.x += (dx / m) * 190 * dt; c.y += (dy / m) * 190 * dt;
            ctx.data.pushes[p.id] += dt;
            c.x = ctx.clamp(c.x, ctx.field.x + 24, ctx.field.x + ctx.field.w - 24);
            c.y = ctx.clamp(c.y, ctx.field.y + 24, ctx.field.y + ctx.field.h - 24);
          }
        });
      });
      const parked = ctx.data.crates.every((c) => ctx.data.pads.some((p) => ctx.dist(c.x, c.y, p.x, p.y) < 32));
      ctx.alon.score = (ctx.matchScore.alon | 0) + (ctx.data.pushes.alon | 0);
      ctx.dad.score = (ctx.matchScore.dad | 0) + (ctx.data.pushes.dad | 0);
      ctx.paint();
      if (parked) {
        const a = ctx.data.pushes.alon, d = ctx.data.pushes.dad;
        ctx.winRound(Math.abs(a - d) < 0.35 ? (a >= d ? "alon" : "dad") : a > d ? "alon" : "dad", "All tucked in!");
      }
    },
    draw(ctx) {
      ctx.withShake(() => {
        ctx.drawTheme("crate");
        (ctx.data.pads || []).forEach((p) => {
          ctx.g.fillStyle = "rgba(74,222,128,.5)";
          ctx.g.beginPath(); ctx.g.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.g.fill();
        });
        (ctx.data.crates || []).forEach((c) => ctx.prop("crate", c.x, c.y, 18));
        ctx.drawBuddies({ alon: "🐥", dad: "🐧" });
        ctx.drawJuice();
      });
    }
  },

  "mirror-maze": {
    title: "Mirror Maze",
    emoji: "🪞",
    blurb: "Three mazes. Alon walks normal — Dad's left/right is flipped. First to the star!",
    hintAlon: "Alon: WASD normal",
    hintDad: "Dad: arrows — L/R flipped",
    goal: "BEST OF 3",
    hearts: false,
    rounds: 3,
    roundNames: ["Hall", "Twist", "Lab"],
    setup(ctx) { ctx.resetMatch(); },
    setupRound(ctx, n) {
      const f = ctx.field;
      const walls = [];
      const rows = 4 + n;
      const corridor = Math.max(100, f.w * 0.3);
      const wallW = Math.min(f.w * 0.42, f.w - corridor * 2 + 20);
      for (let i = 0; i < rows; i++) {
        const y = f.y + 48 + i * ((f.h - 110) / Math.max(1, rows - 0.2));
        if (i % 2 === 0) walls.push({ x: f.x + corridor, y, w: wallW, h: 18 });
        else walls.push({ x: f.x + f.w - corridor - wallW, y, w: wallW, h: 18 });
      }
      ctx.data.walls = walls;
      ctx.data.star = { x: f.x + f.w - 52, y: f.y + 44 };
      ctx.data.keys = n === 3 ? [{ x: f.x + 52, y: f.y + f.h * 0.48, live: true }] : [];
      ctx.data.unlocked = n !== 3;
      ctx.alon.x = f.x + 52; ctx.dad.x = f.x + 108;
      ctx.alon.y = ctx.dad.y = f.y + f.h - 48;
    },
    update(ctx, dt) {
      const a = ctx.input("alon");
      ctx.alon.x += a.ax * 230 * dt; ctx.alon.y += a.ay * 230 * dt;
      const d = ctx.input("dad");
      ctx.dad.x += -d.ax * 230 * dt; ctx.dad.y += d.ay * 230 * dt;
      [ctx.alon, ctx.dad].forEach((p) => {
        ctx.keepInField(p);
        ctx.data.walls.forEach((w) => {
          const nx = ctx.clamp(p.x, w.x, w.x + w.w);
          const ny = ctx.clamp(p.y, w.y, w.y + w.h);
          const dx = p.x - nx, dy = p.y - ny;
          const dist = Math.hypot(dx, dy);
          if (dist < p.r - 2) {
            const m = dist || 1;
            p.x = nx + (dx / m) * p.r;
            p.y = ny + (dy / m) * p.r;
          }
        });
        ctx.data.keys.forEach((k) => {
          if (k.live && ctx.dist(p.x, p.y, k.x, k.y) < 26) { k.live = false; ctx.data.unlocked = true; ctx.starChime(); ctx.banner("Key!", 500); }
        });
        if (ctx.data.unlocked && ctx.dist(p.x, p.y, ctx.data.star.x, ctx.data.star.y) < 28) {
          ctx.addScore(p, 1); ctx.winRound(p.id, "Found the sparkle!");
        }
      });
    },
    draw(ctx) {
      ctx.withShake(() => {
        ctx.drawTheme("mirror");
        (ctx.data.walls || []).forEach((w) => {
          ctx.g.fillStyle = "#c4b5fd";
          ctx.g.beginPath(); ctx.g.roundRect(w.x, w.y, w.w, w.h, 8); ctx.g.fill();
        });
        (ctx.data.keys || []).forEach((k) => { if (k.live) ctx.prop("key", k.x, k.y, 12); });
        if (ctx.data.star) ctx.prop("star", ctx.data.star.x, ctx.data.star.y, 14);
        ctx.drawBuddies({ alon: "🐥", dad: "🐧" });
        ctx.drawJuice();
      });
    }
  },

  "color-dash": {
    title: "Color Dash",
    emoji: "🎯",
    blurb: "Three color races! A color shouts — stand on that pad. First to 5 wins the heat.",
    hintAlon: "Alon: WASD run",
    hintDad: "Dad: arrows run",
    goal: "BEST OF 3",
    hearts: false,
    rounds: 3,
    roundNames: ["Look", "Hurry", "Blitz"],
    setup(ctx) { ctx.resetMatch(); },
    setupRound(ctx, n) {
      ctx.data.need = 4 + n;
      ctx.data.got = { alon: 0, dad: 0 };
      ctx.data.wait = 0.2;
      nextColor(ctx, n);
    },
    update(ctx, dt) {
      [ctx.alon, ctx.dad].forEach((p) => ctx.moveTopDown(p, 270 + ctx.round * 10, dt));
      ctx.data.wait -= dt;
      if (ctx.data.wait > 0) return;
      const pads = colorPads(ctx);
      let scored = false;
      [ctx.alon, ctx.dad].forEach((p) => {
        const pad = pads[ctx.data.needIdx];
        if (!scored && ctx.dist(p.x, p.y, pad.x, pad.y) < 42) {
          ctx.data.got[p.id] += 1; ctx.addScore(p, 1, NAMES[ctx.data.needIdx]); ctx.starChime();
          ctx.burst(pad.x, pad.y, pad.color, 18); scored = true;
          if (ctx.data.got[p.id] >= ctx.data.need) ctx.winRound(p.id, "Color champ!");
          else nextColor(ctx, ctx.round);
        }
      });
      ctx.setGoal(`${Math.max(ctx.data.got.alon, ctx.data.got.dad)}/${ctx.data.need}`);
    },
    draw(ctx) {
      ctx.withShake(() => {
        ctx.drawTheme("bright");
        colorPads(ctx).forEach((p, i) => {
          ctx.g.fillStyle = p.color;
          ctx.g.beginPath(); ctx.g.arc(p.x, p.y, 38, 0, Math.PI * 2); ctx.g.fill();
          ctx.g.fillStyle = "rgba(255,255,255,.35)";
          ctx.g.beginPath(); ctx.g.arc(p.x - 8, p.y - 8, 10, 0, Math.PI * 2); ctx.g.fill();
          ctx.g.font = "800 13px Trebuchet MS, sans-serif";
          ctx.g.textAlign = "center"; ctx.g.textBaseline = "middle";
          ctx.g.fillStyle = "#fff";
          ctx.g.fillText(NAMES[i], p.x, p.y + 2);
          if (ctx.data && ctx.data.needIdx === i) { ctx.g.strokeStyle = "#fff"; ctx.g.lineWidth = 7; ctx.g.beginPath(); ctx.g.arc(p.x, p.y, 38, 0, Math.PI * 2); ctx.g.stroke(); }
        });
        ctx.drawBuddies({ alon: "🐥", dad: "🐧" });
        ctx.drawJuice();
      });
    }
  },

  "flip-race": {
    title: "Flip Race",
    emoji: "🃏",
    blurb: "Three memory boards. Walk onto cards to flip. Most pairs wins the heat.",
    hintAlon: "Alon: WASD flip",
    hintDad: "Dad: arrows flip",
    goal: "BEST OF 3",
    hearts: false,
    rounds: 3,
    roundNames: ["Six", "Eight", "Twelve"],
    setup(ctx) { ctx.resetMatch(); },
    setupRound(ctx, n) {
      const pool = ["🍎", "🌙", "⭐", "🎈", "🍇", "🧸", "🐟", "🌈"];
      const pairs = n === 1 ? 3 : n === 2 ? 4 : 6;
      const faces = pool.slice(0, pairs).concat(pool.slice(0, pairs));
      for (let i = faces.length - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0;
        [faces[i], faces[j]] = [faces[j], faces[i]];
      }
      const f = ctx.field;
      const cols = pairs === 6 ? 4 : pairs;
      const rows = Math.ceil(faces.length / cols);
      const padX = 56, padY = 56;
      ctx.data.cards = faces.map((face, i) => ({
        face,
        x: f.x + padX + (i % cols) * ((f.w - padX * 2) / Math.max(1, cols - 1)),
        y: f.y + padY + ((i / cols) | 0) * ((f.h - padY * 2 - 40) / Math.max(1, rows - 1)),
        open: false, done: false
      }));
      ctx.data.open = []; ctx.data.lock = 0;
      ctx.data.pairs = { alon: 0, dad: 0 };
      ctx.place(0.2, 0.8, 0.85);
    },
    update(ctx, dt) {
      ctx.data.lock -= dt;
      [ctx.alon, ctx.dad].forEach((p) => ctx.moveTopDown(p, 240, dt));
      if (ctx.data.lock > 0) return;
      [ctx.alon, ctx.dad].forEach((p) => {
        ctx.data.cards.forEach((c, i) => {
          if (c.done || c.open) return;
          if (ctx.dist(p.x, p.y, c.x, c.y) < 32 && ctx.data.open.length < 2) {
            c.open = true; ctx.data.open.push({ i, who: p.id }); ctx.beep(600, 0.05, "sine", 0.05);
            if (ctx.data.open.length === 2) {
              const a = ctx.data.cards[ctx.data.open[0].i], b = ctx.data.cards[ctx.data.open[1].i];
              if (a.face === b.face) {
                a.done = b.done = true;
                const who = ctx.data.open[1].who;
                ctx.data.pairs[who] += 1;
                ctx.addScore(who === "alon" ? ctx.alon : ctx.dad, 1, "PAIR");
                ctx.chime(); ctx.data.open = [];
              } else ctx.data.lock = 0.75;
            }
          }
        });
      });
      if (ctx.data.lock <= 0 && ctx.data.open.length === 2) {
        ctx.data.open.forEach((o) => { ctx.data.cards[o.i].open = false; });
        ctx.data.open = [];
      }
      if (ctx.data.cards.every((c) => c.done)) {
        const a = ctx.data.pairs.alon, d = ctx.data.pairs.dad;
        ctx.winRound(a === d ? (a >= d ? "alon" : "dad") : a > d ? "alon" : "dad", "Memory champs!");
      }
    },
    draw(ctx) {
      ctx.withShake(() => {
        ctx.drawTheme("cards");
        (ctx.data.cards || []).forEach((c) => {
          ctx.g.fillStyle = c.done ? "#86efac" : c.open ? "#fff" : "#7c3aed";
          ctx.g.beginPath(); ctx.g.roundRect(c.x - 32, c.y - 36, 64, 72, 12); ctx.g.fill();
          ctx.g.strokeStyle = "rgba(255,255,255,.45)"; ctx.g.lineWidth = 3;
          ctx.g.stroke();
          ctx.g.font = c.open || c.done ? "30px serif" : "800 28px Trebuchet MS, sans-serif";
          ctx.g.textAlign = "center"; ctx.g.textBaseline = "middle";
          ctx.g.fillStyle = c.open || c.done ? "#0c4a6e" : "#fde047";
          ctx.g.fillText(c.open || c.done ? c.face : "★", c.x, c.y);
        });
        ctx.drawBuddies({ alon: "🐥", dad: "🐧" });
        ctx.drawJuice();
      });
    }
  },

  "tower-stack": {
    title: "Tower Stack",
    emoji: "🗼",
    blurb: "Three build heats. Catch blocks on your side. First tower of 7/8/9 wins.",
    hintAlon: "Alon: A D catch",
    hintDad: "Dad: ← → catch",
    goal: "BEST OF 3",
    hearts: false,
    rounds: 3,
    roundNames: ["Cabin", "House", "Castle"],
    setup(ctx) { ctx.resetMatch(); },
    setupRound(ctx, n) {
      ctx.data.need = 6 + n;
      ctx.data.blocks = { alon: [], dad: [] };
      ctx.data.fall = { alon: null, dad: null };
      ctx.data.cool = { alon: 0, dad: 0 };
      ctx.data.miss = { alon: 0, dad: 0 };
      const f = ctx.field;
      ctx.alon.y = ctx.dad.y = ctx.standY();
      ctx.alon.x = f.x + f.w * 0.25; ctx.dad.x = f.x + f.w * 0.75;
    },
    update(ctx, dt) {
      const f = ctx.field;
      ["alon", "dad"].forEach((id) => {
        const p = id === "alon" ? ctx.alon : ctx.dad;
        const minX = id === "alon" ? f.x + 30 : f.x + f.w / 2 + 20;
        const maxX = id === "alon" ? f.x + f.w / 2 - 20 : f.x + f.w - 30;
        p.x += ctx.input(id).ax * 300 * dt;
        p.x = ctx.clamp(p.x, minX, maxX);
        p.y = ctx.standY();
        ctx.data.cool[id] -= dt;
        if (!ctx.data.fall[id] && ctx.data.cool[id] <= 0) {
          ctx.data.fall[id] = { x: p.x + (Math.random() - 0.5) * 30 * ctx.round, y: f.y + 12, vy: 140 + ctx.round * 20 };
        }
        const fl = ctx.data.fall[id];
        if (fl) {
          fl.vy += 240 * dt; fl.y += fl.vy * dt;
          fl.x += (p.x - fl.x) * 0.55 * dt;
          const top = ctx.standY() - 14 - ctx.data.blocks[id].length * 22;
          if (fl.y > top) {
            if (Math.abs(fl.x - p.x) < 42 || ctx.data.blocks[id].length === 0) {
              ctx.data.blocks[id].push({}); ctx.addScore(p, 1, "+blk"); ctx.chime();
              if (ctx.data.blocks[id].length >= ctx.data.need) ctx.winRound(id, "Tower up!");
            } else {
              ctx.data.miss[id] += 1; ctx.flash(id); ctx.bump(); ctx.punch(0.12);
            }
            ctx.data.fall[id] = null; ctx.data.cool[id] = 0.22;
          }
        }
      });
      ctx.setGoal(`${Math.max(ctx.data.blocks.alon.length, ctx.data.blocks.dad.length)}/${ctx.data.need}`);
    },
    draw(ctx) {
      ctx.withShake(() => {
        ctx.drawTheme("tower");
        if (!ctx.data.blocks) return;
        const { g, field: f } = ctx;
        g.fillStyle = "rgba(12,74,110,.12)";
        g.fillRect(f.x + f.w / 2 - 4, f.y, 8, f.h);
        ["alon", "dad"].forEach((id) => {
          const p = id === "alon" ? ctx.alon : ctx.dad;
          (ctx.data.blocks[id] || []).forEach((_, i) => {
            g.fillStyle = p.color;
            g.beginPath(); g.roundRect(p.x - 24, ctx.standY() - 24 - i * 22, 48, 20, 6); g.fill();
            g.fillStyle = "rgba(255,255,255,.28)";
            g.fillRect(p.x - 18, ctx.standY() - 20 - i * 22, 36, 5);
          });
          const fl = ctx.data.fall && ctx.data.fall[id];
          if (fl) { g.fillStyle = p.color; g.beginPath(); g.roundRect(fl.x - 20, fl.y, 40, 18, 6); g.fill(); }
        });
        ctx.drawBuddies({ alon: "🐥", dad: "🐧" });
        ctx.drawJuice();
      });
    }
  }
};

const COLS = ["#fb7185", "#38bdf8", "#facc15", "#4ade80"];
const NAMES = ["PINK", "BLUE", "GOLD", "GREEN"];
function colorPads(ctx) {
  const f = ctx.field;
  return [
    { x: f.x + f.w * 0.22, y: f.y + f.h * 0.3, color: COLS[0] },
    { x: f.x + f.w * 0.78, y: f.y + f.h * 0.3, color: COLS[1] },
    { x: f.x + f.w * 0.22, y: f.y + f.h * 0.72, color: COLS[2] },
    { x: f.x + f.w * 0.78, y: f.y + f.h * 0.72, color: COLS[3] }
  ];
}
function nextColor(ctx, n) {
  ctx.data.needIdx = (Math.random() * 4) | 0;
  ctx.data.wait = n === 3 ? 0.18 : 0.32;
  ctx.banner(NAMES[ctx.data.needIdx], 700);
}
