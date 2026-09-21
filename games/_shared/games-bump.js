export const games = {
  "pillow-pop": {
    title: "Pillow Pop",
    emoji: "🛏️",
    blurb: "Three pillow bouts! Charge in and bump. First to 4 pops wins the bout.",
    hintAlon: "Alon: WASD bump",
    hintDad: "Dad: arrows bump",
    goal: "BEST OF 3",
    lives: 3,
    rounds: 3,
    roundNames: ["Fluff", "Feather", "Boom"],
    setup(ctx) { ctx.resetMatch(); },
    setupRound(ctx, n) {
      ctx.data.need = 3 + n;
      ctx.data.hits = { alon: 0, dad: 0 };
      const f = ctx.field;
      ctx.data.beds = [
        { x: f.x + f.w * 0.5, y: f.y + f.h * 0.32, r: 26 },
        { x: f.x + f.w * 0.32, y: f.y + f.h * 0.62, r: 22 },
        { x: f.x + f.w * 0.68, y: f.y + f.h * 0.62, r: 22 }
      ];
      if (n > 1) ctx.data.beds.push({ x: f.x + f.w * 0.5, y: f.y + f.h * 0.78, r: 20 });
      ctx.alon.hearts = ctx.dad.hearts = 3;
      ctx.alon.out = ctx.dad.out = false;
      ctx.place(0.25, 0.75, 0.5);
    },
    update(ctx, dt) {
      [ctx.alon, ctx.dad].forEach((p) => {
        if (!p.out) ctx.moveTopDown(p, 250 + ctx.round * 15, dt);
        (ctx.data.beds || []).forEach((b) => {
          if (ctx.dist(p.x, p.y, b.x, b.y) < p.r + b.r - 6) {
            const dx = p.x - b.x, dy = p.y - b.y, m = Math.hypot(dx, dy) || 1;
            p.x = b.x + (dx / m) * (p.r + b.r);
            p.y = b.y + (dy / m) * (p.r + b.r);
            p.vx += (dx / m) * 80; p.vy += (dy / m) * 80;
          }
        });
      });
      if (ctx.circleHit(ctx.alon, ctx.dad, 4) && ctx.alon.inv <= 0 && ctx.dad.inv <= 0) {
        const speedA = Math.hypot(ctx.alon.vx, ctx.alon.vy);
        const speedD = Math.hypot(ctx.dad.vx, ctx.dad.vy);
        const winner = speedA >= speedD ? ctx.alon : ctx.dad;
        const loser = winner.id === "alon" ? ctx.dad : ctx.alon;
        ctx.data.hits[winner.id] += 1;
        ctx.addScore(winner, 1, "POP"); ctx.hurt(loser); ctx.punch(0.25); ctx.bumpPlayers(480);
        if (ctx.data.hits[winner.id] >= ctx.data.need) ctx.winRound(winner.id, "Pillow champ!");
      }
      ctx.setGoal(`${Math.max(ctx.data.hits.alon, ctx.data.hits.dad)}/${ctx.data.need}`);
    },
    draw(ctx) {
      ctx.withShake(() => {
        ctx.drawTheme("pillow");
        (ctx.data.beds || []).forEach((b) => ctx.prop("pillow", b.x, b.y, b.r * 0.7));
        ctx.drawBuddies({ alon: "🛏️", dad: "🧸" });
        ctx.drawJuice();
      });
    }
  },

  "snow-puff": {
    title: "Snow Puff",
    emoji: "❄️",
    blurb: "Three snowball fights! Toss the way you walk. First to 4 splats wins the bout.",
    hintAlon: "Alon: WASD · W throw",
    hintDad: "Dad: arrows · ↑ throw",
    goal: "BEST OF 3",
    lives: 3,
    rounds: 3,
    roundNames: ["Flurry", "Storm", "Blizzard"],
    setup(ctx) { ctx.resetMatch(); },
    setupRound(ctx, n) {
      ctx.data.shots = []; ctx.data.cool = { alon: 0, dad: 0 };
      ctx.data.need = 3 + n; ctx.data.hits = { alon: 0, dad: 0 };
      ctx.data.piles = [
        { x: ctx.field.x + 50, y: ctx.field.y + ctx.field.h - 50 },
        { x: ctx.field.x + ctx.field.w - 50, y: ctx.field.y + 50 }
      ];
      ctx.alon.aimx = 1; ctx.dad.aimx = -1; ctx.alon.aimy = 0; ctx.dad.aimy = 0;
      ctx.data.ammo = { alon: 2, dad: 2 };
      ctx.alon.hearts = ctx.dad.hearts = 3; ctx.alon.out = ctx.dad.out = false;
      ctx.place(0.22, 0.78, 0.5);
    },
    update(ctx, dt) {
      [ctx.alon, ctx.dad].forEach((p) => {
        if (p.out) return;
        const inn = ctx.moveTopDown(p, 230, dt);
        if (Math.abs(inn.ax) + Math.abs(inn.ay) > 0.2) {
          const m = Math.hypot(inn.ax, inn.ay) || 1;
          p.aimx = inn.ax / m; p.aimy = inn.ay / m;
        }
        ctx.data.piles.forEach((pile) => {
          if (ctx.dist(p.x, p.y, pile.x, pile.y) < 30 && ctx.data.ammo[p.id] < 3) {
            ctx.data.ammo[p.id] = 3; ctx.float(p.x, p.y, "AMMO", "#e0f2fe");
          }
        });
        ctx.data.cool[p.id] -= dt;
        if (inn.up && ctx.data.cool[p.id] <= 0 && ctx.data.ammo[p.id] > 0) {
          ctx.data.cool[p.id] = 0.36; ctx.data.ammo[p.id] -= 1;
          ctx.data.shots.push({ x: p.x, y: p.y, vx: p.aimx * 330, vy: p.aimy * 330, who: p.id, r: 10, life: 1.1, live: true });
          ctx.beep(300, 0.05, "sine", 0.05);
        }
      });
      ctx.data.shots.forEach((s) => {
        s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt;
        if (s.life <= 0) s.live = false;
        const o = s.who === "alon" ? ctx.dad : ctx.alon;
        if (s.live && !o.out && ctx.dist(s.x, s.y, o.x, o.y) < o.r + 8) {
          s.live = false;
          const sh = s.who === "alon" ? ctx.alon : ctx.dad;
          ctx.data.hits[sh.id] += 1; ctx.addScore(sh, 1, "SPLAT"); ctx.hurt(o); ctx.punch(0.2);
          if (ctx.data.hits[sh.id] >= ctx.data.need) ctx.winRound(sh.id, "Snow puff!");
        }
      });
      ctx.data.shots = ctx.data.shots.filter((s) => s.live);
      ctx.setGoal(`${Math.max(ctx.data.hits.alon, ctx.data.hits.dad)}/${ctx.data.need}`);
    },
    draw(ctx) {
      ctx.withShake(() => {
        ctx.drawTheme("frost");
        (ctx.data.piles || []).forEach((p) => ctx.prop("snowman", p.x, p.y, 16));
        (ctx.data.shots || []).forEach((s) => { ctx.g.fillStyle = "#fff"; ctx.g.beginPath(); ctx.g.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.g.fill(); });
        ctx.drawBuddies({ alon: "🐥", dad: "🐧" });
        ctx.drawJuice();
      });
    }
  },

  "sumo-bump": {
    title: "Sumo Bump",
    emoji: "🍩",
    blurb: "Three ring bouts! The ring shrinks each heat. First to shove the other out wins.",
    hintAlon: "Alon: WASD bump",
    hintDad: "Dad: arrows bump",
    goal: "BEST OF 3",
    hearts: false,
    rounds: 3,
    roundNames: ["Big", "Mid", "Tiny"],
    setup(ctx) { ctx.resetMatch(); },
    setupRound(ctx, n) { resetSumo(ctx, Math.max(0.36, 0.44 - n * 0.03)); },
    update(ctx, dt) {
      const c = ctx.data.c;
      [ctx.alon, ctx.dad].forEach((p) => {
        const inn = ctx.input(p.id);
        p.vx += inn.ax * (920 + ctx.round * 40) * dt;
        p.vy += inn.ay * (920 + ctx.round * 40) * dt;
        p.vx *= Math.pow(0.1, dt); p.vy *= Math.pow(0.1, dt);
        p.x += p.vx * dt; p.y += p.vy * dt;
      });
      if (ctx.circleHit(ctx.alon, ctx.dad, 2)) {
        const dx = ctx.dad.x - ctx.alon.x, dy = ctx.dad.y - ctx.alon.y, m = Math.hypot(dx, dy) || 1;
        ctx.alon.vx -= dx / m * 240; ctx.dad.vx += dx / m * 240;
        ctx.alon.vy -= dy / m * 240; ctx.dad.vy += dy / m * 240;
        ctx.beep(200, 0.06, "sine", 0.05); ctx.punch(0.12);
      }
      [ctx.alon, ctx.dad].forEach((p) => {
        if (ctx.dist(p.x, p.y, c.x, c.y) > c.r) {
          const other = p.id === "alon" ? "dad" : "alon";
          ctx.addScore(other === "alon" ? ctx.alon : ctx.dad, 1, "OUT");
          ctx.flash(p.id); ctx.winRound(other, "Ring out!");
        }
      });
    },
    draw(ctx) {
      ctx.withShake(() => {
        ctx.drawTheme("sumo");
        const c = ctx.data.c || { x: ctx.w / 2, y: ctx.h / 2, r: 120 };
        ctx.g.fillStyle = "rgba(255,255,255,.72)";
        ctx.g.beginPath(); ctx.g.arc(c.x, c.y, c.r, 0, Math.PI * 2); ctx.g.fill();
        ctx.g.strokeStyle = "#f97316"; ctx.g.lineWidth = 12; ctx.g.stroke();
        ctx.g.strokeStyle = "#fde047"; ctx.g.lineWidth = 4;
        ctx.g.beginPath(); ctx.g.arc(c.x, c.y, c.r - 16, 0, Math.PI * 2); ctx.g.stroke();
        ctx.drawBuddies({ alon: "🐥", dad: "🐧" });
        ctx.drawJuice();
      });
    }
  },

  "coin-dash": {
    title: "Coin Dash",
    emoji: "🪙",
    blurb: "Three treasure bursts! Grab coins, rare stars, dodge the ghost. First to the goal wins the heat.",
    hintAlon: "Alon: WASD grab",
    hintDad: "Dad: arrows grab",
    goal: "BEST OF 3",
    hearts: false,
    rounds: 3,
    roundNames: ["Pocket", "Purse", "Vault"],
    setup(ctx) { ctx.resetMatch(); },
    setupRound(ctx, n) {
      const f = ctx.field;
      ctx.data.need = 8 + n * 3;
      ctx.data.got = { alon: 0, dad: 0 };
      ctx.data.coins = [];
      for (let i = 0; i < 8; i++) spawnCoin(ctx, n);
      ctx.data.ghost = { x: f.x + f.w / 2, y: f.y + 40, t: 0 };
      ctx.place(0.22, 0.78, 0.7);
    },
    update(ctx, dt) {
      if (ctx.data.coins.filter((c) => c.live).length < 6 + ctx.round && Math.random() < 0.08) spawnCoin(ctx, ctx.round);
      const gho = ctx.data.ghost;
      gho.t += dt;
      gho.x += Math.sin(gho.t * 1.3) * 80 * dt;
      gho.y += Math.cos(gho.t * 0.9) * 60 * dt;
      gho.x = ctx.clamp(gho.x, ctx.field.x + 30, ctx.field.x + ctx.field.w - 30);
      gho.y = ctx.clamp(gho.y, ctx.field.y + 30, ctx.field.y + ctx.field.h - 30);
      [ctx.alon, ctx.dad].forEach((p) => {
        ctx.moveTopDown(p, 280, dt);
        if (ctx.dist(p.x, p.y, gho.x, gho.y) < 28 && p.inv <= 0) {
          p.inv = 0.8; ctx.flash(p.id); ctx.bump();
          if (ctx.data.got[p.id] > 0) { ctx.data.got[p.id] -= 1; p.score = Math.max(0, p.score - 1); ctx.float(p.x, p.y, "-1", "#fb7185"); ctx.paint(); }
        }
        ctx.data.coins.forEach((c) => {
          if (c.live && ctx.dist(p.x, p.y, c.x, c.y) < 26) {
            c.live = false;
            const n = c.star ? 2 : 1;
            ctx.data.got[p.id] += n; ctx.addScore(p, n, c.star ? "STAR" : "+");
            ctx.chime(); ctx.burst(c.x, c.y, "#fbbf24", 10);
            if (ctx.data.got[p.id] >= ctx.data.need) ctx.winRound(p.id, "Coin rush!");
          }
        });
      });
      ctx.data.coins = ctx.data.coins.filter((c) => c.live);
      ctx.setGoal(`${Math.max(ctx.data.got.alon, ctx.data.got.dad)}/${ctx.data.need}`);
    },
    draw(ctx) {
      ctx.withShake(() => {
        ctx.drawTheme("coins");
        (ctx.data.coins || []).forEach((c) => ctx.prop(c.star ? "star" : "coin", c.x, c.y, c.star ? 15 : 13));
        if (ctx.data.ghost) ctx.prop("ghost", ctx.data.ghost.x, ctx.data.ghost.y, 16);
        ctx.drawBuddies({ alon: "🐥", dad: "🐧" });
        ctx.drawJuice();
      });
    }
  },

  "fruit-catch": {
    title: "Fruit Catch",
    emoji: "🍎",
    blurb: "Three orchard waves. Catch fruit, duck veggies. First to the basket goal wins the heat.",
    hintAlon: "Alon: A D basket",
    hintDad: "Dad: ← → basket",
    goal: "BEST OF 3",
    hearts: false,
    rounds: 3,
    roundNames: ["Apple", "Berry", "Harvest"],
    setup(ctx) { ctx.resetMatch(); },
    setupRound(ctx, n) {
      ctx.data.fall = [];
      ctx.data.need = 7 + n * 2;
      ctx.data.got = { alon: 0, dad: 0 };
      ctx.data.speed = 150 + n * 25;
      const f = ctx.field;
      ctx.alon.y = ctx.dad.y = f.y + f.h - 32;
      ctx.alon.x = f.x + f.w * 0.28; ctx.dad.x = f.x + f.w * 0.72;
      for (let i = 0; i < 3; i++) spawnFruit(ctx, true);
    },
    update(ctx, dt) {
      const f = ctx.field;
      if (Math.random() < 0.05 + ctx.round * 0.01) spawnFruit(ctx, false);
      [ctx.alon, ctx.dad].forEach((p) => {
        p.x += ctx.input(p.id).ax * 320 * dt;
        p.x = ctx.clamp(p.x, f.x + 24, f.x + f.w - 24);
        p.y = f.y + f.h - 32;
      });
      ctx.data.fall.forEach((it) => {
        it.y += it.vy * dt;
        if (it.y > f.y + f.h) it.live = false;
        [ctx.alon, ctx.dad].forEach((p) => {
          if (it.live && Math.abs(it.x - p.x) < 34 && Math.abs(it.y - p.y) < 30) {
            it.live = false;
            if (it.kind === "fruit") {
              ctx.data.got[p.id] += 1; ctx.addScore(p, 1, "+yum"); ctx.chime();
              if (ctx.data.got[p.id] >= ctx.data.need) ctx.winRound(p.id, "Fruit feast!");
            } else { ctx.flash(p.id); ctx.bump(); ctx.punch(0.12); }
          }
        });
      });
      ctx.data.fall = ctx.data.fall.filter((i) => i.live);
      ctx.setGoal(`${Math.max(ctx.data.got.alon, ctx.data.got.dad)}/${ctx.data.need}`);
    },
    draw(ctx) {
      ctx.withShake(() => {
        ctx.drawTheme("orchard");
        (ctx.data.fall || []).forEach((it) => {
          const fruits = ["#fb7185", "#facc15", "#a78bfa", "#fb923c"];
          ctx.prop(it.kind === "fruit" ? "fruit" : "veg", it.x, it.y, 14, {
            color: it.kind === "fruit" ? fruits[(it.x | 0) % 4] : "#4ade80"
          });
        });
        [ctx.alon, ctx.dad].forEach((p) => {
          ctx.g.fillStyle = "#b45309";
          ctx.g.beginPath();
          ctx.g.ellipse(p.x, p.y + 10, 22, 10, 0, 0, Math.PI * 2);
          ctx.g.fill();
        });
        ctx.drawBuddies({ alon: "🧺", dad: "🧺" });
        ctx.drawJuice();
      });
    }
  },

  "bubble-pop": {
    title: "Bubble Pop",
    emoji: "🧼",
    blurb: "Three bubble skies. Poke regulars and golds. First to the pop goal wins the heat.",
    hintAlon: "Alon: WASD poke",
    hintDad: "Dad: arrows poke",
    goal: "BEST OF 3",
    hearts: false,
    rounds: 3,
    roundNames: ["Soap", "Fizz", "Foam"],
    setup(ctx) { ctx.resetMatch(); },
    setupRound(ctx, n) {
      ctx.data.bub = [];
      ctx.data.need = 10 + n * 3;
      ctx.data.got = { alon: 0, dad: 0 };
      for (let i = 0; i < 5; i++) spawnBub(ctx, n);
    },
    update(ctx, dt) {
      const f = ctx.field;
      if (ctx.data.bub.length < 7 + ctx.round && Math.random() < 0.07) spawnBub(ctx, ctx.round);
      [ctx.alon, ctx.dad].forEach((p) => ctx.moveTopDown(p, 255, dt));
      ctx.data.bub.forEach((b) => {
        b.y += b.vy * dt;
        b.x += Math.sin(ctx.t * 2 + b.x) * 18 * dt;
        if (b.y < f.y - 10) b.live = false;
        [ctx.alon, ctx.dad].forEach((p) => {
          if (b.live && ctx.dist(p.x, p.y, b.x, b.y) < p.r + b.r) {
            b.live = false;
            const n = b.gold ? 2 : 1;
            ctx.data.got[p.id] += n; ctx.addScore(p, n, b.gold ? "GOLD" : "+");
            ctx.chime(); ctx.burst(b.x, b.y, "#67e8f9", 12);
            if (ctx.data.got[p.id] >= ctx.data.need) ctx.winRound(p.id, "Bubble bath!");
          }
        });
      });
      ctx.data.bub = ctx.data.bub.filter((b) => b.live);
      ctx.setGoal(`${Math.max(ctx.data.got.alon, ctx.data.got.dad)}/${ctx.data.need}`);
    },
    draw(ctx) {
      ctx.withShake(() => {
        ctx.drawTheme("soap");
        (ctx.data.bub || []).forEach((b) => {
          ctx.g.fillStyle = b.gold ? "rgba(253,224,71,.55)" : "rgba(255,255,255,.5)";
          ctx.g.beginPath(); ctx.g.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.g.fill();
          ctx.g.strokeStyle = "rgba(255,255,255,.9)"; ctx.g.stroke();
        });
        ctx.drawBuddies({ alon: "🐥", dad: "🐧" });
        ctx.drawJuice();
      });
    }
  },

  "pet-rescue": {
    title: "Pet Rescue",
    emoji: "🐾",
    blurb: "Three yards of fluff! Pets wander — tag them to free. First to save the crew wins the heat.",
    hintAlon: "Alon: WASD rescue",
    hintDad: "Dad: arrows rescue",
    goal: "BEST OF 3",
    hearts: false,
    rounds: 3,
    roundNames: ["Yard", "Park", "Farm"],
    setup(ctx) { ctx.resetMatch(); },
    setupRound(ctx, n) {
      ctx.data.need = 4 + n;
      ctx.data.got = { alon: 0, dad: 0 };
      spawnPets(ctx, 3 + n);
      ctx.place(0.5, 0.55, 0.8);
    },
    update(ctx, dt) {
      [ctx.alon, ctx.dad].forEach((p) => ctx.moveTopDown(p, 255, dt));
      ctx.data.pets.forEach((pet) => {
        if (!pet.live) return;
        pet.x += pet.vx * dt; pet.y += pet.vy * dt;
        if (pet.x < ctx.field.x + 20 || pet.x > ctx.field.x + ctx.field.w - 20) pet.vx *= -1;
        if (pet.y < ctx.field.y + 20 || pet.y > ctx.field.y + ctx.field.h - 20) pet.vy *= -1;
        [ctx.alon, ctx.dad].forEach((p) => {
          if (ctx.dist(p.x, p.y, pet.x, pet.y) < 30) {
            pet.live = false; ctx.data.got[p.id] += 1; ctx.addScore(p, 1, "FREE"); ctx.starChime();
            ctx.burst(pet.x, pet.y, p.color, 14);
            if (ctx.data.got[p.id] >= ctx.data.need) ctx.winRound(p.id, "Hero of fluff!");
          }
        });
      });
      if (!ctx.data.pets.some((p) => p.live)) spawnPets(ctx, 3);
      ctx.setGoal(`${Math.max(ctx.data.got.alon, ctx.data.got.dad)}/${ctx.data.need}`);
    },
    draw(ctx) {
      ctx.withShake(() => {
        ctx.drawTheme("pets");
        (ctx.data.pets || []).forEach((pet) => {
          if (pet.live) ctx.prop("pet", pet.x, pet.y, 16, { color: pet.color || "#f9a8d4" });
        });
        ctx.drawBuddies({ alon: "🐥", dad: "🐧" });
        ctx.drawJuice();
      });
    }
  }
};

function resetSumo(ctx, scale) {
  const f = ctx.field;
  ctx.data.c = { x: f.x + f.w / 2, y: f.y + f.h / 2, r: Math.min(f.w, f.h) * (scale || 0.38) };
  ctx.alon.x = ctx.data.c.x - 46; ctx.dad.x = ctx.data.c.x + 46;
  ctx.alon.y = ctx.dad.y = ctx.data.c.y;
  ctx.alon.vx = ctx.dad.vx = ctx.alon.vy = ctx.dad.vy = 0;
}
function spawnCoin(ctx, n) {
  const f = ctx.field;
  ctx.data.coins.push({
    x: f.x + 40 + Math.random() * (f.w - 80),
    y: f.y + 40 + Math.random() * (f.h - 80),
    live: true, star: Math.random() < 0.12 + n * 0.03
  });
}
function spawnFruit(ctx, start) {
  const f = ctx.field;
  ctx.data.fall.push({
    x: f.x + 30 + Math.random() * (f.w - 60),
    y: start ? f.y + 40 + Math.random() * 80 : f.y + 8,
    kind: Math.random() < 0.72 ? "fruit" : "bad",
    vy: ctx.data.speed || 160,
    live: true
  });
}
function spawnBub(ctx, n) {
  const f = ctx.field;
  ctx.data.bub.push({
    x: f.x + 30 + Math.random() * (f.w - 60),
    y: f.y + f.h - 16,
    r: 14 + Math.random() * 12,
    vy: -(55 + n * 12 + Math.random() * 30),
    live: true, gold: Math.random() < 0.12
  });
}
function spawnPets(ctx, n) {
  const cols = ["#f9a8d4", "#fdba74", "#86efac", "#93c5fd", "#fde047", "#fbcfe8"];
  ctx.data.pets = [];
  const f = ctx.field;
  for (let i = 0; i < n; i++) {
    ctx.data.pets.push({
      x: f.x + 40 + Math.random() * (f.w - 80),
      y: f.y + 40 + Math.random() * (f.h - 80),
      color: cols[i % cols.length],
      vx: (Math.random() - 0.5) * 70,
      vy: (Math.random() - 0.5) * 70,
      live: true
    });
  }
}
