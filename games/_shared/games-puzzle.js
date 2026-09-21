export const games = {
  "block-buddies": {
    title: "Block Buddies",
    emoji: "📦",
    blurb: "Push the crates onto the glow pads. Most pushes when both sit wins!",
    hintAlon: "Alon: WASD push",
    hintDad: "Dad: arrows push",
    goal: "PARK IT",
    hearts: false,
    setup(ctx) {
      const f = ctx.field;
      ctx.data.crates = [
        { x: f.x + f.w * 0.35, y: f.y + f.h * 0.4, r: 22, who: null },
        { x: f.x + f.w * 0.6, y: f.y + f.h * 0.65, r: 22, who: null }
      ];
      ctx.data.pads = [
        { x: f.x + f.w * 0.22, y: f.y + f.h * 0.72, r: 26 },
        { x: f.x + f.w * 0.78, y: f.y + f.h * 0.28, r: 26 }
      ];
      ctx.data.pushes = { alon: 0, dad: 0 };
    },
    update(ctx, dt) {
      [ctx.alon, ctx.dad].forEach((p) => ctx.moveTopDown(p, 230, dt));
      ctx.data.crates.forEach((c) => {
        [ctx.alon, ctx.dad].forEach((p) => {
          if (ctx.dist(p.x, p.y, c.x, c.y) < p.r + c.r) {
            const dx = c.x - p.x, dy = c.y - p.y, m = Math.hypot(dx, dy) || 1;
            c.x += (dx / m) * 180 * dt;
            c.y += (dy / m) * 180 * dt;
            ctx.data.pushes[p.id] += dt;
            c.x = ctx.clamp(c.x, ctx.field.x + 24, ctx.field.x + ctx.field.w - 24);
            c.y = ctx.clamp(c.y, ctx.field.y + 24, ctx.field.y + ctx.field.h - 24);
          }
        });
      });
      const parked = ctx.data.crates.every((c) => ctx.data.pads.some((p) => ctx.dist(c.x, c.y, p.x, p.y) < 30));
      ctx.alon.score = ctx.data.pushes.alon | 0;
      ctx.dad.score = ctx.data.pushes.dad | 0;
      ctx.paint();
      if (parked) {
        const a = ctx.data.pushes.alon, d = ctx.data.pushes.dad;
        ctx.end(Math.abs(a - d) < 0.4 ? "coop" : a > d ? "alon" : "dad",
          Math.abs(a - d) < 0.4 ? "Team park!" : null, "Crates tucked in!", "📦");
      }
    },
    draw(ctx) {
      const { g, w, h } = ctx;
      g.fillStyle = "#fef3c7"; g.fillRect(0, 0, w, h);
      ctx.fillField("rgba(255,255,255,.35)");
      (ctx.data.pads || []).forEach((p) => {
        g.fillStyle = "rgba(74,222,128,.45)";
        g.beginPath(); g.arc(p.x, p.y, p.r, 0, Math.PI * 2); g.fill();
      });
      (ctx.data.crates || []).forEach((c) => {
        g.font = "40px serif"; g.textAlign = "center"; g.textBaseline = "middle";
        g.fillText("📦", c.x, c.y);
      });
      ctx.drawBuddies({ alon: "🐥", dad: "🐧" });
      ctx.drawSparks(0.016);
    }
  },

  "mirror-maze": {
    title: "Mirror Maze",
    emoji: "🪞",
    blurb: "Alon walks normal. Dad's left/right is flipped! First to the star.",
    hintAlon: "Alon: WASD normal",
    hintDad: "Dad: arrows — L/R flipped",
    goal: "FIND ⭐",
    hearts: false,
    setup(ctx) {
      const f = ctx.field;
      ctx.data.walls = [];
      for (let i = 0; i < 7; i++) {
        ctx.data.walls.push({
          x: f.x + (i % 2 ? 0.15 : 0.45) * f.w,
          y: f.y + 40 + i * (f.h / 8),
          w: f.w * 0.38,
          h: 16
        });
      }
      ctx.data.star = { x: f.x + f.w * 0.82, y: f.y + 36, r: 16 };
      ctx.alon.x = f.x + 40; ctx.dad.x = f.x + 80;
      ctx.alon.y = ctx.dad.y = f.y + f.h - 40;
    },
    update(ctx, dt) {
      const a = ctx.input("alon");
      ctx.alon.x += a.ax * 220 * dt;
      ctx.alon.y += a.ay * 220 * dt;
      const d = ctx.input("dad");
      ctx.dad.x += -d.ax * 220 * dt;
      ctx.dad.y += d.ay * 220 * dt;
      [ctx.alon, ctx.dad].forEach((p) => {
        ctx.keepInField(p);
        ctx.data.walls.forEach((w) => {
          if (p.x > w.x && p.x < w.x + w.w && p.y > w.y && p.y < w.y + w.h + p.r) {
            if (p.vy >= 0 && p.y < w.y + w.h) p.y = w.y - p.r;
            else p.y = w.y + w.h + p.r;
          }
        });
        if (ctx.dist(p.x, p.y, ctx.data.star.x, ctx.data.star.y) < 28) {
          ctx.addScore(p, 1);
          ctx.end(p.id, `${p.name} wins!`, "Found the sparkle!", "⭐");
        }
      });
    },
    draw(ctx) {
      const { g, w, h } = ctx;
      g.fillStyle = "#ede9fe"; g.fillRect(0, 0, w, h);
      ctx.fillField("rgba(255,255,255,.3)");
      (ctx.data.walls || []).forEach((w) => {
        g.fillStyle = "#c4b5fd";
        g.beginPath(); g.roundRect(w.x, w.y, w.w, w.h, 8); g.fill();
      });
      if (ctx.data.star) {
        g.font = "32px serif"; g.textAlign = "center";
        g.fillText("⭐", ctx.data.star.x, ctx.data.star.y);
      }
      ctx.drawBuddies({ alon: "🐥", dad: "🐧" });
      ctx.drawSparks(0.016);
    }
  },

  "color-dash": {
    title: "Color Dash",
    emoji: "🎯",
    blurb: "A color shouts. Race onto that pad! First to 6 matches.",
    hintAlon: "Alon: WASD run",
    hintDad: "Dad: arrows run",
    goal: "6 MATCHES",
    hearts: false,
    setup(ctx) { nextColor(ctx); },
    update(ctx, dt) {
      [ctx.alon, ctx.dad].forEach((p) => ctx.moveTopDown(p, 260, dt));
      ctx.data.wait -= dt;
      if (ctx.data.wait > 0) return;
      const pads = colorPads(ctx);
      let scored = false;
      [ctx.alon, ctx.dad].forEach((p) => {
        const pad = pads[ctx.data.need];
        if (!scored && ctx.dist(p.x, p.y, pad.x, pad.y) < 40) {
          ctx.addScore(p, 1);
          ctx.starChime();
          ctx.burst(pad.x, pad.y, pad.color, 18);
          scored = true;
          nextColor(ctx);
        }
      });
      ctx.maybeFirstTo(6);
    },
    draw(ctx) {
      const { g, w, h } = ctx;
      g.fillStyle = "#fff7ed"; g.fillRect(0, 0, w, h);
      ctx.fillField("rgba(12,74,110,.06)");
      colorPads(ctx).forEach((p, i) => {
        g.fillStyle = p.color;
        g.beginPath(); g.arc(p.x, p.y, 36, 0, Math.PI * 2); g.fill();
        if (ctx.data && ctx.data.need === i) {
          g.strokeStyle = "#fff"; g.lineWidth = 6;
          g.stroke();
        }
      });
      ctx.drawBuddies({ alon: "🐥", dad: "🐧" });
      ctx.drawSparks(0.016);
    }
  },

  "flip-race": {
    title: "Flip Race",
    emoji: "🃏",
    blurb: "Walk onto cards to flip them. Most matching pairs wins!",
    hintAlon: "Alon: WASD flip",
    hintDad: "Dad: arrows flip",
    goal: "PAIRS",
    hearts: false,
    setup(ctx) {
      const faces = ["🍎", "🌙", "⭐", "🎈", "🍇", "🧸", "🍎", "🌙", "⭐", "🎈", "🍇", "🧸"];
      for (let i = faces.length - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0;
        [faces[i], faces[j]] = [faces[j], faces[i]];
      }
      const f = ctx.field;
      ctx.data.cards = faces.map((face, i) => ({
        face, x: f.x + 50 + (i % 4) * (f.w / 4.3),
        y: f.y + 40 + ((i / 4) | 0) * (f.h / 3.4),
        open: false, done: false, r: 28
      }));
      ctx.data.open = [];
      ctx.data.lock = 0;
    },
    update(ctx, dt) {
      ctx.data.lock -= dt;
      [ctx.alon, ctx.dad].forEach((p) => ctx.moveTopDown(p, 230, dt));
      if (ctx.data.lock > 0) return;
      [ctx.alon, ctx.dad].forEach((p) => {
        ctx.data.cards.forEach((c, i) => {
          if (c.done || c.open) return;
          if (ctx.dist(p.x, p.y, c.x, c.y) < 30 && ctx.data.open.length < 2) {
            c.open = true;
            ctx.data.open.push({ i, who: p.id });
            ctx.beep(600, 0.05, "sine", 0.05);
            if (ctx.data.open.length === 2) {
              const a = ctx.data.cards[ctx.data.open[0].i];
              const b = ctx.data.cards[ctx.data.open[1].i];
              if (a.face === b.face) {
                a.done = b.done = true;
                const who = ctx.data.open[1].who;
                ctx.addScore(who === "alon" ? ctx.alon : ctx.dad, 1);
                ctx.chime();
                ctx.data.open = [];
              } else {
                ctx.data.lock = 0.7;
              }
            }
          }
        });
      });
      if (ctx.data.lock <= 0 && ctx.data.open.length === 2) {
        ctx.data.open.forEach((o) => { ctx.data.cards[o.i].open = false; });
        ctx.data.open = [];
      }
      if (ctx.data.cards.every((c) => c.done)) {
        const a = ctx.alon.score, d = ctx.dad.score;
        ctx.end(a === d ? "tie" : a > d ? "alon" : "dad", null, "Memory champs!", "🃏");
      }
    },
    draw(ctx) {
      const { g, w, h } = ctx;
      g.fillStyle = "#f3e8ff"; g.fillRect(0, 0, w, h);
      ctx.fillField("rgba(255,255,255,.25)");
      (ctx.data.cards || []).forEach((c) => {
        g.fillStyle = c.done ? "#86efac" : c.open ? "#fff" : "#a78bfa";
        g.beginPath(); g.roundRect(c.x - 28, c.y - 28, 56, 56, 12); g.fill();
        g.font = "28px serif"; g.textAlign = "center"; g.textBaseline = "middle";
        g.fillText(c.open || c.done ? c.face : "?", c.x, c.y);
      });
      ctx.drawBuddies({ alon: "🐥", dad: "🐧" });
      ctx.drawSparks(0.016);
    }
  },

  "tower-stack": {
    title: "Tower Stack",
    emoji: "🗼",
    blurb: "Catch falling blocks on your side. First tower of 8 wins!",
    hintAlon: "Alon: A D catch",
    hintDad: "Dad: ← → catch",
    goal: "STACK 8",
    hearts: false,
    setup(ctx) {
      const f = ctx.field;
      ctx.data.blocks = { alon: [], dad: [] };
      ctx.data.fall = { alon: null, dad: null };
      ctx.data.cool = { alon: 0, dad: 0 };
      ctx.alon.y = ctx.dad.y = f.y + f.h - 30;
      ctx.alon.x = f.x + f.w * 0.25;
      ctx.dad.x = f.x + f.w * 0.75;
    },
    update(ctx, dt) {
      const f = ctx.field;
      ["alon", "dad"].forEach((id) => {
        const p = id === "alon" ? ctx.alon : ctx.dad;
        const inn = ctx.input(id);
        const minX = id === "alon" ? f.x + 30 : f.x + f.w / 2 + 20;
        const maxX = id === "alon" ? f.x + f.w / 2 - 20 : f.x + f.w - 30;
        p.x += inn.ax * 280 * dt;
        p.x = ctx.clamp(p.x, minX, maxX);
        p.y = f.y + f.h - 28;
        ctx.data.cool[id] -= dt;
        if (!ctx.data.fall[id] && ctx.data.cool[id] <= 0) {
          ctx.data.fall[id] = { x: p.x, y: f.y + 10, vy: 160 };
        }
        const fl = ctx.data.fall[id];
        if (fl) {
          fl.vy += 220 * dt;
          fl.y += fl.vy * dt;
          fl.x += (p.x - fl.x) * 0.8 * dt;
          const top = f.y + f.h - 40 - ctx.data.blocks[id].length * 22;
          if (fl.y > top) {
            if (Math.abs(fl.x - p.x) < 40 || ctx.data.blocks[id].length === 0) {
              ctx.data.blocks[id].push({ x: p.x });
              ctx.addScore(p, 1);
              ctx.chime();
            } else {
              ctx.flash(id);
              ctx.bump();
            }
            ctx.data.fall[id] = null;
            ctx.data.cool[id] = 0.25;
          }
        }
      });
      if (ctx.alon.score >= 8 || ctx.dad.score >= 8) {
        ctx.maybeFirstTo(8);
      }
    },
    draw(ctx) {
      const { g, w, h, field: f } = ctx;
      g.fillStyle = "#fff7ed"; g.fillRect(0, 0, w, h);
      ctx.fillField("rgba(255,255,255,.3)");
      g.fillStyle = "rgba(12,74,110,.12)";
      g.fillRect(f.x + f.w / 2 - 4, f.y, 8, f.h);
      ["alon", "dad"].forEach((id) => {
        const p = id === "alon" ? ctx.alon : ctx.dad;
        (ctx.data.blocks[id] || []).forEach((b, i) => {
          g.fillStyle = p.color;
          g.beginPath();
          g.roundRect(p.x - 22, f.y + f.h - 50 - i * 22, 44, 20, 6);
          g.fill();
        });
        const fl = ctx.data.fall && ctx.data.fall[id];
        if (fl) {
          g.fillStyle = p.color;
          g.beginPath(); g.roundRect(fl.x - 20, fl.y, 40, 18, 6); g.fill();
        }
      });
      ctx.drawBuddies({ alon: "🐥", dad: "🐧" });
      ctx.drawSparks(0.016);
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
function nextColor(ctx) {
  ctx.data.need = (Math.random() * 4) | 0;
  ctx.data.wait = 0.35;
  ctx.banner(NAMES[ctx.data.need], 800);
}
