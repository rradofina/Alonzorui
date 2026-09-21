function spawnEnemy(ctx, kind, extra) {
  const f = ctx.field;
  return Object.assign({
    x: extra && extra.x != null ? extra.x : f.x + f.w + 20,
    y: extra && extra.y != null ? extra.y : f.y + 40 + Math.random() * (f.h - 80),
    r: 16 + Math.random() * 8,
    vx: extra && extra.vx != null ? extra.vx : -(90 + Math.random() * 70),
    vy: extra && extra.vy != null ? extra.vy : (Math.random() - 0.5) * 40,
    hp: extra && extra.hp || 1,
    live: true,
    kind: kind || "blob"
  }, extra || {});
}

export const games = {
  "bubble-blaster": {
    title: "Bubble Blaster",
    emoji: "🫧",
    blurb: "Three blob waves! Puff bubbles, dodge bops, pop the big boss each round.",
    hintAlon: "Alon: WASD move · hold W puff",
    hintDad: "Dad: arrows move · hold ↑ puff",
    goal: "BEST OF 3",
    hearts: false,
    lives: 3,
    rounds: 3,
    roundNames: ["Puddle", "Fizz", "Storm"],
    setup(ctx) { ctx.resetMatch(); },
    setupRound(ctx, n) {
      ctx.data.shots = [];
      ctx.data.blobs = [];
      ctx.data.cool = { alon: 0, dad: 0 };
      ctx.data.spawned = 0;
      ctx.data.need = 8 + n * 3;
      ctx.data.pops = { alon: 0, dad: 0 };
      ctx.data.boss = null;
      ctx.data.rate = 0.9 - n * 0.12;
      ctx.alon.hearts = ctx.dad.hearts = 3;
      ctx.alon.out = ctx.dad.out = false;
      ctx.place(0.14, 0.22, 0.55);
    },
    update(ctx, dt) {
      const f = ctx.field;
      [ctx.alon, ctx.dad].forEach((p) => {
        if (p.out) return;
        ctx.moveTopDown(p, 230, dt);
        ctx.data.cool[p.id] -= dt;
        if (ctx.input(p.id).up && ctx.data.cool[p.id] <= 0) {
          ctx.data.cool[p.id] = 0.2;
          ctx.data.shots.push({ x: p.x + 18, y: p.y, vx: 400, r: 10, who: p.id, live: true });
          ctx.beep(880, 0.04, "sine", 0.05);
        }
      });
      ctx.data.rate -= dt;
      if (ctx.data.spawned < ctx.data.need && ctx.data.rate <= 0) {
        ctx.data.blobs.push(spawnEnemy(ctx, "blob"));
        ctx.data.spawned += 1;
        ctx.data.rate = 0.55;
      }
      if (ctx.data.spawned >= ctx.data.need && !ctx.data.boss && ctx.data.blobs.every((b) => !b.live)) {
        ctx.data.boss = spawnEnemy(ctx, "boss", { x: f.x + f.w - 80, y: f.y + f.h / 2, r: 36, vx: -40, hp: 6 + ctx.round, kind: "boss" });
        ctx.banner("Big blob!", 700);
        ctx.data.blobs.push(ctx.data.boss);
      }
      ctx.data.shots.forEach((s) => { s.x += s.vx * dt; if (s.x > f.x + f.w) s.live = false; });
      ctx.data.blobs.forEach((b) => {
        if (!b.live) return;
        b.x += b.vx * dt;
        b.y += Math.sin(ctx.t * 3 + b.x) * 24 * dt;
        if (b.x < f.x - 30) b.live = false;
        [ctx.alon, ctx.dad].forEach((p) => {
          if (!p.out && ctx.dist(p.x, p.y, b.x, b.y) < p.r + b.r - 4) ctx.hurt(p);
        });
        ctx.data.shots.forEach((s) => {
          if (s.live && b.live && ctx.dist(s.x, s.y, b.x, b.y) < b.r + s.r) {
            s.live = false; b.hp -= 1;
            const p = s.who === "alon" ? ctx.alon : ctx.dad;
            ctx.burst(b.x, b.y, p.color, 10);
            if (b.hp <= 0) {
              b.live = false; ctx.data.pops[p.id] += b.kind === "boss" ? 3 : 1;
              ctx.addScore(p, b.kind === "boss" ? 3 : 1, b.kind === "boss" ? "BOSS" : "+pop");
              ctx.chime();
              if (b.kind === "boss") ctx.winRound(p.id, "Blob popper!");
            }
          }
        });
      });
      ctx.data.shots = ctx.data.shots.filter((s) => s.live);
      ctx.setGoal(`pops ${ctx.data.pops.alon + ctx.data.pops.dad}`);
    },
    draw(ctx) {
      ctx.withShake(() => {
        ctx.drawTheme("paint");
        (ctx.data.blobs || []).forEach((b) => {
          if (!b.live) return;
          ctx.prop("blob", b.x, b.y, b.r, { color: b.kind === "boss" ? "#a78bfa" : "#c4b5fd" });
        });
        (ctx.data.shots || []).forEach((s) => {
          ctx.g.fillStyle = s.who === "alon" ? "rgba(251,113,133,.9)" : "rgba(56,189,248,.9)";
          ctx.g.beginPath(); ctx.g.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.g.fill();
        });
        ctx.drawBuddies({ alon: "🐥", dad: "🐧" });
        ctx.drawJuice();
      });
    }
  },

  "star-shower": {
    title: "Star Shower",
    emoji: "🌟",
    blurb: "Three night waves. Beam the sky rocks — first to the star goal wins the heat.",
    hintAlon: "Alon: A D move · W beam",
    hintDad: "Dad: ← → move · ↑ beam",
    goal: "BEST OF 3",
    hearts: false,
    rounds: 3,
    roundNames: ["Dusk", "Night", "Meteor"],
    setup(ctx) { ctx.resetMatch(); },
    setupRound(ctx, n) {
      const f = ctx.field;
      ctx.data.shots = []; ctx.data.rocks = [];
      ctx.data.cool = { alon: 0, dad: 0 };
      ctx.data.need = 8 + n * 3;
      ctx.data.got = { alon: 0, dad: 0 };
      ctx.data.left = 14 + n * 4;
      ctx.alon.y = ctx.dad.y = f.y + f.h - 38;
      ctx.alon.x = f.x + f.w * 0.3; ctx.dad.x = f.x + f.w * 0.7;
    },
    update(ctx, dt) {
      const f = ctx.field;
      [ctx.alon, ctx.dad].forEach((p) => {
        const inn = ctx.input(p.id);
        p.x += inn.ax * 300 * dt;
        p.x = ctx.clamp(p.x, f.x + p.r, f.x + f.w - p.r);
        p.y = f.y + f.h - 38;
        ctx.data.cool[p.id] -= dt;
        if (inn.up && ctx.data.cool[p.id] <= 0) {
          ctx.data.cool[p.id] = 0.16;
          ctx.data.shots.push({ x: p.x, y: p.y - 22, vy: -440, who: p.id, r: 8, live: true });
          ctx.beep(980, 0.04, "sine", 0.05);
        }
      });
      if (ctx.data.left > 0 && Math.random() < 0.025 + ctx.round * 0.01) {
        ctx.data.rocks.push({
          x: f.x + 30 + Math.random() * (f.w - 60),
          y: f.y - 12, r: 14 + ctx.round * 2, vy: 80 + ctx.round * 25, live: true, gold: Math.random() < 0.15
        });
        ctx.data.left -= 1;
      }
      ctx.data.shots.forEach((s) => { s.y += s.vy * dt; if (s.y < f.y) s.live = false; });
      ctx.data.rocks.forEach((r) => {
        r.y += r.vy * dt;
        if (r.y > f.y + f.h) r.live = false;
        ctx.data.shots.forEach((s) => {
          if (s.live && r.live && ctx.dist(s.x, s.y, r.x, r.y) < 22) {
            r.live = false; s.live = false;
            const p = s.who === "alon" ? ctx.alon : ctx.dad;
            const n = r.gold ? 2 : 1;
            ctx.data.got[p.id] += n; ctx.addScore(p, n, r.gold ? "STAR" : "+");
            ctx.chime(); ctx.burst(r.x, r.y, "#fde047", 14);
            if (ctx.data.got[p.id] >= ctx.data.need) ctx.winRound(p.id, "Sky beams!");
          }
        });
      });
      ctx.data.shots = ctx.data.shots.filter((s) => s.live);
      ctx.data.rocks = ctx.data.rocks.filter((r) => r.live);
      ctx.setGoal(`${Math.max(ctx.data.got.alon, ctx.data.got.dad)}/${ctx.data.need}`);
    },
    draw(ctx) {
      ctx.withShake(() => {
        ctx.drawTheme("night");
        (ctx.data.rocks || []).forEach((r) => ctx.prop(r.gold ? "star" : "rock", r.x, r.y, r.r * 0.7, { gold: r.gold }));
        (ctx.data.shots || []).forEach((s) => {
          ctx.g.fillStyle = "#fde047";
          ctx.g.beginPath(); ctx.g.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.g.fill();
        });
        ctx.drawBuddies({ alon: "🚀", dad: "🛸" });
        ctx.drawJuice();
      });
    }
  },

  "paint-arena": {
    title: "Paint Arena",
    emoji: "🎨",
    blurb: "Three splat rounds! Face where you walk, toss paint, hide behind pillows.",
    hintAlon: "Alon: WASD move · W splat",
    hintDad: "Dad: arrows move · ↑ splat",
    goal: "BEST OF 3",
    lives: 3,
    rounds: 3,
    roundNames: ["Dab", "Splash", "Mess"],
    setup(ctx) { ctx.resetMatch(); },
    setupRound(ctx, n) {
      const f = ctx.field;
      ctx.data.shots = [];
      ctx.data.cool = { alon: 0, dad: 0 };
      ctx.data.need = 3 + n;
      ctx.data.hits = { alon: 0, dad: 0 };
      ctx.data.cover = [
        { x: f.x + f.w * 0.5, y: f.y + f.h * 0.5, r: 28 },
        { x: f.x + f.w * 0.28, y: f.y + f.h * 0.32, r: 22 },
        { x: f.x + f.w * 0.72, y: f.y + f.h * 0.68, r: 22 }
      ];
      ctx.alon.aimx = 1; ctx.alon.aimy = 0;
      ctx.dad.aimx = -1; ctx.dad.aimy = 0;
      ctx.alon.hearts = ctx.dad.hearts = 3;
      ctx.alon.out = ctx.dad.out = false;
      ctx.place(0.2, 0.8, 0.5);
    },
    update(ctx, dt) {
      [ctx.alon, ctx.dad].forEach((p) => {
        if (p.out) return;
        const inn = ctx.moveTopDown(p, 220 + ctx.round * 15, dt);
        if (Math.abs(inn.ax) + Math.abs(inn.ay) > 0.2) {
          const m = Math.hypot(inn.ax, inn.ay) || 1;
          p.aimx = inn.ax / m; p.aimy = inn.ay / m;
        }
        ctx.data.cool[p.id] -= dt;
        if (inn.up && ctx.data.cool[p.id] <= 0) {
          ctx.data.cool[p.id] = 0.34;
          ctx.data.shots.push({
            x: p.x, y: p.y, vx: p.aimx * 360, vy: p.aimy * 360,
            who: p.id, r: 12, live: true, life: 1.15
          });
          ctx.beep(420, 0.05, "triangle", 0.06);
        }
      });
      ctx.data.shots.forEach((s) => {
        s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt;
        if (s.life <= 0) s.live = false;
        if (ctx.data.cover.some((c) => ctx.dist(s.x, s.y, c.x, c.y) < c.r)) s.live = false;
        const other = s.who === "alon" ? ctx.dad : ctx.alon;
        if (s.live && !other.out && ctx.dist(s.x, s.y, other.x, other.y) < other.r + s.r) {
          s.live = false;
          const shooter = s.who === "alon" ? ctx.alon : ctx.dad;
          ctx.data.hits[shooter.id] += 1;
          ctx.addScore(shooter, 1, "SPLAT");
          ctx.hurt(other);
          ctx.punch(0.22);
          if (ctx.data.hits[shooter.id] >= ctx.data.need) ctx.winRound(shooter.id, "Paint party!");
        }
      });
      ctx.data.shots = ctx.data.shots.filter((s) => s.live);
      ctx.setGoal(`${Math.max(ctx.data.hits.alon, ctx.data.hits.dad)}/${ctx.data.need}`);
    },
    draw(ctx) {
      ctx.withShake(() => {
        ctx.drawTheme("paint");
        const { g, field: f } = ctx;
        const blobs = ["#fb7185", "#38bdf8", "#facc15", "#a78bfa"];
        for (let i = 0; i < 10; i++) {
          g.globalAlpha = 0.22;
          g.fillStyle = blobs[i % 4];
          g.beginPath();
          g.arc(f.x + 30 + (i * 97) % (f.w - 60), f.y + 24 + (i * 53) % (f.h - 50), 16 + (i % 3) * 6, 0, Math.PI * 2);
          g.fill();
        }
        g.globalAlpha = 1;
        (ctx.data.cover || []).forEach((c) => ctx.prop("pillow", c.x, c.y, c.r * 0.7));
        (ctx.data.shots || []).forEach((s) => {
          ctx.g.fillStyle = s.who === "alon" ? "#fb7185" : "#38bdf8";
          ctx.g.beginPath(); ctx.g.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.g.fill();
        });
        ctx.drawBuddies({ alon: "🎨", dad: "🖌️" });
        ctx.drawJuice();
      });
    }
  },

  "balloon-boss": {
    title: "Balloon Boss",
    emoji: "🎈",
    blurb: "Three party balloons! Puff stars up. Most pops when a balloon bursts wins the heat.",
    hintAlon: "Alon: WASD · W puff",
    hintDad: "Dad: arrows · ↑ puff",
    goal: "BEST OF 3",
    hearts: false,
    rounds: 3,
    roundNames: ["Pink", "Gold", "Rainbow"],
    setup(ctx) { ctx.resetMatch(); },
    setupRound(ctx, n) {
      const f = ctx.field;
      ctx.data.hp = 16 + n * 8;
      ctx.data.max = ctx.data.hp;
      ctx.data.shots = [];
      ctx.data.cool = { alon: 0, dad: 0 };
      ctx.data.hits = { alon: 0, dad: 0 };
      ctx.data.boss = { x: f.x + f.w / 2, y: f.y + f.h * 0.28, r: 48 + n * 4 };
      ctx.data.drops = [];
      ctx.place(0.28, 0.72, 0.78);
    },
    update(ctx, dt) {
      const b = ctx.data.boss;
      const amp = ctx.field.w * (0.18 + ctx.round * 0.04);
      b.x = ctx.field.x + ctx.field.w / 2 + Math.sin(ctx.t * (0.8 + ctx.round * 0.2)) * amp;
      b.y = ctx.field.y + ctx.field.h * 0.28 + Math.cos(ctx.t * 1.2) * 22;
      if (ctx.round > 1 && Math.random() < 0.012) {
        ctx.data.drops.push({ x: b.x, y: b.y + 30, vy: 140, live: true });
      }
      [ctx.alon, ctx.dad].forEach((p) => {
        ctx.moveTopDown(p, 240, dt);
        ctx.data.cool[p.id] -= dt;
        if (ctx.input(p.id).up && ctx.data.cool[p.id] <= 0) {
          ctx.data.cool[p.id] = 0.18;
          ctx.data.shots.push({ x: p.x, y: p.y, vy: -380, who: p.id, r: 9, live: true });
          ctx.beep(700, 0.04, "sine", 0.05);
        }
        ctx.data.drops.forEach((d) => {
          if (d.live && ctx.dist(p.x, p.y, d.x, d.y) < 24) { d.live = false; ctx.flash(p.id); ctx.bump(); }
        });
      });
      ctx.data.drops.forEach((d) => { d.y += d.vy * dt; if (d.y > ctx.field.y + ctx.field.h) d.live = false; });
      ctx.data.shots.forEach((s) => {
        s.y += s.vy * dt;
        if (s.y < ctx.field.y) s.live = false;
        if (s.live && ctx.dist(s.x, s.y, b.x, b.y) < b.r) {
          s.live = false; ctx.data.hp -= 1;
          const p = s.who === "alon" ? ctx.alon : ctx.dad;
          ctx.data.hits[p.id] += 1; ctx.addScore(p, 1); ctx.chime();
          ctx.burst(s.x, s.y, p.color, 8); ctx.punch(0.08);
        }
      });
      ctx.data.shots = ctx.data.shots.filter((s) => s.live);
      ctx.data.drops = ctx.data.drops.filter((d) => d.live);
      ctx.setGoal(`${Math.max(0, ctx.data.hp)} hp`);
      if (ctx.data.hp <= 0) {
        const a = ctx.data.hits.alon, d = ctx.data.hits.dad;
        ctx.winRound(a === d ? (Math.random() < 0.5 ? "alon" : "dad") : a > d ? "alon" : "dad", "POP!");
      }
    },
    draw(ctx) {
      ctx.withShake(() => {
        ctx.drawTheme("party");
        const b = ctx.data.boss || { x: ctx.w / 2, y: 160, r: 50 };
        const colors = ["#fb7185", "#fbbf24", "#a78bfa"];
        ctx.prop("balloon", b.x, b.y, b.r * 0.55, { color: colors[ctx.round - 1] || "#fb7185" });
        ctx.g.fillStyle = "#fff";
        ctx.g.beginPath(); ctx.g.arc(b.x - 10, b.y - 6, 6, 0, Math.PI * 2); ctx.g.arc(b.x + 10, b.y - 6, 6, 0, Math.PI * 2); ctx.g.fill();
        ctx.g.fillStyle = "#1e293b";
        ctx.g.beginPath(); ctx.g.arc(b.x - 8, b.y - 5, 2.5, 0, Math.PI * 2); ctx.g.arc(b.x + 12, b.y - 5, 2.5, 0, Math.PI * 2); ctx.g.fill();
        ctx.g.fillStyle = "rgba(12,74,110,.25)";
        ctx.g.fillRect(ctx.field.x + 40, ctx.field.y + 10, ctx.field.w - 80, 10);
        ctx.g.fillStyle = "#fb7185";
        const w = (ctx.field.w - 80) * (ctx.data.hp / (ctx.data.max || 1));
        ctx.g.fillRect(ctx.field.x + 40, ctx.field.y + 10, Math.max(0, w), 10);
        (ctx.data.shots || []).forEach((s) => { ctx.g.fillStyle = "#fde047"; ctx.g.beginPath(); ctx.g.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.g.fill(); });
        (ctx.data.drops || []).forEach((d) => ctx.prop("pearl", d.x, d.y, 8));
        ctx.drawBuddies({ alon: "🐥", dad: "🐧" });
        ctx.drawJuice();
      });
    }
  }
};
