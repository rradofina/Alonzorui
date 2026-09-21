function arenaBg(ctx, a, b) {
  const { g, w, h } = ctx;
  const bg = g.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, a); bg.addColorStop(1, b);
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  ctx.fillField("rgba(255,255,255,.22)");
}

export const games = {
  "pillow-pop": {
    title: "Pillow Pop",
    emoji: "🛏️",
    blurb: "Soft pillow bumps! First to 6 gentle pops.",
    hintAlon: "Alon: WASD bump",
    hintDad: "Dad: arrows bump",
    goal: "6 POPS",
    lives: 3,
    setup(ctx) {},
    update(ctx, dt) {
      [ctx.alon, ctx.dad].forEach((p) => { if (!p.out) ctx.moveTopDown(p, 260, dt); });
      if (ctx.circleHit(ctx.alon, ctx.dad, 4) && ctx.alon.inv <= 0 && ctx.dad.inv <= 0) {
        const speedA = Math.hypot(ctx.alon.vx, ctx.alon.vy);
        const speedD = Math.hypot(ctx.dad.vx, ctx.dad.vy);
        if (speedA >= speedD) { ctx.addScore(ctx.alon, 1); ctx.hurt(ctx.dad); }
        else { ctx.addScore(ctx.dad, 1); ctx.hurt(ctx.alon); }
        ctx.bumpPlayers(400);
      }
      ctx.maybeFirstTo(6);
      ctx.maybeLastHeart();
    },
    draw(ctx) {
      arenaBg(ctx, "#fbcfe8", "#c4b5fd");
      ctx.drawBuddies({ alon: "🛏️", dad: "🧸" });
      ctx.drawSparks(0.016);
    }
  },

  "snow-puff": {
    title: "Snow Puff",
    emoji: "❄️",
    blurb: "Toss fluffy snowballs the way you walk. First to 6 splats!",
    hintAlon: "Alon: WASD · W throw",
    hintDad: "Dad: arrows · ↑ throw",
    goal: "6 SPLATS",
    lives: 3,
    setup(ctx) {
      ctx.data.shots = [];
      ctx.data.cool = { alon: 0, dad: 0 };
      ctx.alon.aimx = 1; ctx.dad.aimx = -1;
      ctx.alon.aimy = 0; ctx.dad.aimy = 0;
    },
    update(ctx, dt) {
      [ctx.alon, ctx.dad].forEach((p) => {
        if (p.out) return;
        const inn = ctx.moveTopDown(p, 230, dt);
        if (Math.abs(inn.ax) + Math.abs(inn.ay) > 0.2) {
          const m = Math.hypot(inn.ax, inn.ay) || 1;
          p.aimx = inn.ax / m; p.aimy = inn.ay / m;
        }
        ctx.data.cool[p.id] -= dt;
        if (inn.up && ctx.data.cool[p.id] <= 0) {
          ctx.data.cool[p.id] = 0.38;
          ctx.data.shots.push({
            x: p.x, y: p.y, vx: p.aimx * 320, vy: p.aimy * 320,
            who: p.id, r: 10, life: 1.1, live: true
          });
          ctx.beep(300, 0.05, "sine", 0.05);
        }
      });
      ctx.data.shots.forEach((s) => {
        s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt;
        if (s.life <= 0) s.live = false;
        const o = s.who === "alon" ? ctx.dad : ctx.alon;
        if (s.live && !o.out && ctx.dist(s.x, s.y, o.x, o.y) < o.r + 8) {
          s.live = false;
          ctx.addScore(s.who === "alon" ? ctx.alon : ctx.dad, 1);
          ctx.hurt(o);
        }
      });
      ctx.data.shots = ctx.data.shots.filter((s) => s.live);
      ctx.maybeFirstTo(6);
      ctx.maybeLastHeart();
    },
    draw(ctx) {
      arenaBg(ctx, "#e0f2fe", "#38bdf8");
      (ctx.data.shots || []).forEach((s) => {
        ctx.g.fillStyle = "#fff";
        ctx.g.beginPath(); ctx.g.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.g.fill();
      });
      ctx.drawBuddies({ alon: "🐥", dad: "🐧" });
      ctx.drawSparks(0.016);
    }
  },

  "sumo-bump": {
    title: "Sumo Bump",
    emoji: "🍩",
    blurb: "Stay in the squishy ring. Bump the other out — first to 3!",
    hintAlon: "Alon: WASD bump",
    hintDad: "Dad: arrows bump",
    goal: "3 OUTS",
    hearts: false,
    setup(ctx) { resetSumo(ctx); },
    update(ctx, dt) {
      const c = ctx.data.c;
      [ctx.alon, ctx.dad].forEach((p) => {
        const inn = ctx.input(p.id);
        p.vx += inn.ax * 900 * dt;
        p.vy += inn.ay * 900 * dt;
        p.vx *= Math.pow(0.12, dt);
        p.vy *= Math.pow(0.12, dt);
        p.x += p.vx * dt; p.y += p.vy * dt;
      });
      if (ctx.circleHit(ctx.alon, ctx.dad, 2)) {
        const dx = ctx.dad.x - ctx.alon.x, dy = ctx.dad.y - ctx.alon.y, m = Math.hypot(dx, dy) || 1;
        ctx.alon.vx -= dx / m * 220; ctx.dad.vx += dx / m * 220;
        ctx.alon.vy -= dy / m * 220; ctx.dad.vy += dy / m * 220;
        ctx.beep(200, 0.06, "sine", 0.05);
      }
      [ctx.alon, ctx.dad].forEach((p) => {
        if (ctx.dist(p.x, p.y, c.x, c.y) > c.r) {
          const other = p.id === "alon" ? ctx.dad : ctx.alon;
          ctx.addScore(other, 1);
          ctx.flash(p.id);
          ctx.bump();
          resetSumo(ctx);
        }
      });
      ctx.maybeFirstTo(3);
    },
    draw(ctx) {
      arenaBg(ctx, "#fde68a", "#f97316");
      const c = ctx.data.c || { x: ctx.w / 2, y: ctx.h / 2, r: 120 };
      ctx.g.fillStyle = "rgba(255,255,255,.55)";
      ctx.g.beginPath(); ctx.g.arc(c.x, c.y, c.r, 0, Math.PI * 2); ctx.g.fill();
      ctx.g.strokeStyle = "#f97316"; ctx.g.lineWidth = 10;
      ctx.g.stroke();
      ctx.drawBuddies({ alon: "🐥", dad: "🐧" });
      ctx.drawSparks(0.016);
    }
  },

  "coin-dash": {
    title: "Coin Dash",
    emoji: "🪙",
    blurb: "Coins pop all over. First to grab 12 shiny ones!",
    hintAlon: "Alon: WASD grab",
    hintDad: "Dad: arrows grab",
    goal: "12 COINS",
    hearts: false,
    setup(ctx) {
      ctx.data.coins = [];
      const f = ctx.field;
      for (let i = 0; i < 6; i++) {
        ctx.data.coins.push({
          x: f.x + 40 + Math.random() * (f.w - 80),
          y: f.y + 40 + Math.random() * (f.h - 80),
          r: 12, live: true
        });
      }
    },
    update(ctx, dt) {
      const f = ctx.field;
      if ((ctx.data.coins || []).length < 7 && Math.random() < 0.08) {
        ctx.data.coins.push({
          x: f.x + 30 + Math.random() * (f.w - 60),
          y: f.y + 30 + Math.random() * (f.h - 60),
          r: 12, live: true
        });
      }
      [ctx.alon, ctx.dad].forEach((p) => {
        ctx.moveTopDown(p, 270, dt);
        ctx.data.coins.forEach((c) => {
          if (c.live && ctx.dist(p.x, p.y, c.x, c.y) < 26) {
            c.live = false;
            ctx.addScore(p, 1);
            ctx.chime();
            ctx.burst(c.x, c.y, "#fbbf24", 10);
          }
        });
      });
      ctx.data.coins = ctx.data.coins.filter((c) => c.live);
      ctx.maybeFirstTo(12);
    },
    draw(ctx) {
      arenaBg(ctx, "#facc15", "#fb923c");
      (ctx.data.coins || []).forEach((c) => ctx.icon(c.x, c.y, "🪙", "#fbbf24", 14));
      ctx.drawBuddies({ alon: "🐥", dad: "🐧" });
      ctx.drawSparks(0.016);
    }
  },

  "fruit-catch": {
    title: "Fruit Catch",
    emoji: "🍎",
    blurb: "Hold your basket. Catch 10 fruits — ducks miss the veggies.",
    hintAlon: "Alon: A D basket",
    hintDad: "Dad: ← → basket",
    goal: "10 FRUIT",
    hearts: false,
    setup(ctx) {
      ctx.data.fall = [];
      const f = ctx.field;
      ctx.alon.y = ctx.dad.y = f.y + f.h - 32;
      ctx.alon.x = f.x + f.w * 0.28;
      ctx.dad.x = f.x + f.w * 0.72;
      for (let i = 0; i < 4; i++) {
        ctx.data.fall.push({
          x: f.x + 30 + Math.random() * (f.w - 60),
          y: f.y + 20 + i * 30,
          kind: "fruit",
          vy: 140,
          live: true
        });
      }
    },
    update(ctx, dt) {
      const f = ctx.field;
      if (Math.random() < 0.045) {
        ctx.data.fall.push({
          x: f.x + 30 + Math.random() * (f.w - 60),
          y: f.y + 8,
          kind: Math.random() < 0.75 ? "fruit" : "bad",
          vy: 140 + Math.random() * 60,
          live: true
        });
      }
      [ctx.alon, ctx.dad].forEach((p) => {
        const inn = ctx.input(p.id);
        p.x += inn.ax * 300 * dt;
        p.x = ctx.clamp(p.x, f.x + 24, f.x + f.w - 24);
        p.y = f.y + f.h - 32;
      });
      ctx.data.fall.forEach((it) => {
        it.y += it.vy * dt;
        if (it.y > f.y + f.h) it.live = false;
        [ctx.alon, ctx.dad].forEach((p) => {
          if (it.live && Math.abs(it.x - p.x) < 32 && Math.abs(it.y - p.y) < 28) {
            it.live = false;
            if (it.kind === "fruit") { ctx.addScore(p, 1); ctx.chime(); }
            else { ctx.flash(p.id); ctx.bump(); }
          }
        });
      });
      ctx.data.fall = ctx.data.fall.filter((i) => i.live);
      ctx.maybeFirstTo(10);
    },
    draw(ctx) {
      arenaBg(ctx, "#4ade80", "#fb7185");
      (ctx.data.fall || []).forEach((it) => {
        const fruit = ["🍎", "🍌", "🍇", "🍊"][(it.x | 0) % 4];
        ctx.icon(it.x, it.y, it.kind === "fruit" ? fruit : "🥦", it.kind === "fruit" ? "#fb7185" : "#4ade80", 14);
      });
      ctx.drawBuddies({ alon: "🧺", dad: "🧺" });
      ctx.drawSparks(0.016);
    }
  },

  "bubble-pop": {
    title: "Bubble Pop",
    emoji: "🧼",
    blurb: "Bubbles float up. Poke 15 of them with your buddy!",
    hintAlon: "Alon: WASD poke",
    hintDad: "Dad: arrows poke",
    goal: "15 POPS",
    hearts: false,
    setup(ctx) {
      ctx.data.bub = [];
      const f = ctx.field;
      for (let i = 0; i < 5; i++) {
        ctx.data.bub.push({
          x: f.x + 30 + Math.random() * (f.w - 60),
          y: f.y + f.h * 0.4 + Math.random() * 80,
          r: 18 + Math.random() * 10,
          vy: -60,
          live: true
        });
      }
    },
    update(ctx, dt) {
      const f = ctx.field;
      if (ctx.data.bub.length < 8 && Math.random() < 0.06) {
        ctx.data.bub.push({
          x: f.x + 30 + Math.random() * (f.w - 60),
          y: f.y + f.h - 10,
          r: 16 + Math.random() * 10,
          vy: -(50 + Math.random() * 40),
          live: true
        });
      }
      [ctx.alon, ctx.dad].forEach((p) => ctx.moveTopDown(p, 250, dt));
      ctx.data.bub.forEach((b) => {
        b.y += b.vy * dt;
        b.x += Math.sin(ctx.t * 2 + b.x) * 16 * dt;
        if (b.y < f.y - 10) b.live = false;
        [ctx.alon, ctx.dad].forEach((p) => {
          if (b.live && ctx.dist(p.x, p.y, b.x, b.y) < p.r + b.r) {
            b.live = false;
            ctx.addScore(p, 1);
            ctx.chime();
            ctx.burst(b.x, b.y, "#67e8f9", 12);
          }
        });
      });
      ctx.data.bub = ctx.data.bub.filter((b) => b.live);
      ctx.maybeFirstTo(15);
    },
    draw(ctx) {
      arenaBg(ctx, "#67e8f9", "#a78bfa");
      (ctx.data.bub || []).forEach((b) => {
        ctx.g.fillStyle = "rgba(255,255,255,.55)";
        ctx.g.beginPath(); ctx.g.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.g.fill();
        ctx.g.strokeStyle = "rgba(255,255,255,.9)";
        ctx.g.stroke();
      });
      ctx.drawBuddies({ alon: "🐥", dad: "🐧" });
      ctx.drawSparks(0.016);
    }
  },

  "pet-rescue": {
    title: "Pet Rescue",
    emoji: "🐾",
    blurb: "Run to the little pets and free them. First to save 6!",
    hintAlon: "Alon: WASD rescue",
    hintDad: "Dad: arrows rescue",
    goal: "6 PETS",
    hearts: false,
    setup(ctx) { ctx.data.pets = []; spawnPets(ctx); },
    update(ctx, dt) {
      [ctx.alon, ctx.dad].forEach((p) => ctx.moveTopDown(p, 250, dt));
      ctx.data.pets.forEach((pet) => {
        if (pet.live) {
          [ctx.alon, ctx.dad].forEach((p) => {
            if (ctx.dist(p.x, p.y, pet.x, pet.y) < 30) {
              pet.live = false;
              ctx.addScore(p, 1);
              ctx.starChime();
              ctx.burst(pet.x, pet.y, p.color, 14);
            }
          });
        }
      });
      if (!ctx.data.pets.some((p) => p.live)) spawnPets(ctx);
      ctx.maybeFirstTo(6);
    },
    draw(ctx) {
      arenaBg(ctx, "#86efac", "#f9a8d4");
      (ctx.data.pets || []).forEach((pet) => {
        if (!pet.live) return;
        ctx.icon(pet.x, pet.y, pet.emoji, "#f9a8d4", 18);
      });
      ctx.drawBuddies({ alon: "🐥", dad: "🐧" });
      ctx.drawSparks(0.016);
    }
  }
};

function resetSumo(ctx) {
  const f = ctx.field;
  ctx.data.c = { x: f.x + f.w / 2, y: f.y + f.h / 2, r: Math.min(f.w, f.h) * 0.38 };
  ctx.alon.x = ctx.data.c.x - 40;
  ctx.dad.x = ctx.data.c.x + 40;
  ctx.alon.y = ctx.dad.y = ctx.data.c.y;
  ctx.alon.vx = ctx.dad.vx = ctx.alon.vy = ctx.dad.vy = 0;
}

function spawnPets(ctx) {
  const f = ctx.field;
  const em = ["🐶", "🐱", "🐰", "🐹", "🐥", "🦊"];
  ctx.data.pets = [];
  for (let i = 0; i < 3; i++) {
    ctx.data.pets.push({
      x: f.x + 40 + Math.random() * (f.w - 80),
      y: f.y + 40 + Math.random() * (f.h - 80),
      emoji: em[i % em.length],
      live: true
    });
  }
}
