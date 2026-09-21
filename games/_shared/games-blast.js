function spawnBlob(ctx, fromRight) {
  const f = ctx.field;
  return {
    x: fromRight ? f.x + f.w + 20 : f.x + 40 + Math.random() * (f.w - 80),
    y: f.y + 40 + Math.random() * (f.h - 80),
    r: 18 + Math.random() * 8,
    vx: fromRight ? -(80 + Math.random() * 70) : (Math.random() - 0.5) * 40,
    vy: (Math.random() - 0.5) * 30,
    live: true,
    emoji: ["👾", "🟣", "🟢", "🟡"][(Math.random() * 4) | 0]
  };
}

export const games = {
  "bubble-blaster": {
    title: "Bubble Blaster",
    emoji: "🫧",
    blurb: "Side-by-side bubble poppers. Blast 10 silly blobs with soft bubbles!",
    hintAlon: "Alon: WASD move · hold W to puff",
    hintDad: "Dad: arrows move · hold ↑ to puff",
    goal: "10 POPS",
    hearts: false,
    setup(ctx) {
      ctx.data.shots = [];
      ctx.data.blobs = [];
      ctx.data.cool = { alon: 0, dad: 0 };
      for (let i = 0; i < 6; i++) ctx.data.blobs.push(spawnBlob(ctx, true));
      const f = ctx.field;
      ctx.alon.x = f.x + 70;
      ctx.dad.x = f.x + 120;
      ctx.alon.y = ctx.dad.y = f.y + f.h * 0.55;
    },
    update(ctx, dt) {
      [ctx.alon, ctx.dad].forEach((p) => {
        ctx.moveTopDown(p, 220, dt);
        ctx.data.cool[p.id] -= dt;
        const inn = ctx.input(p.id);
        if (inn.up && ctx.data.cool[p.id] <= 0) {
          ctx.data.cool[p.id] = 0.22;
          ctx.data.shots.push({
            x: p.x + 16, y: p.y, vx: 380, r: 10, who: p.id, live: true
          });
          ctx.beep(880, 0.05, "sine", 0.05);
        }
      });
      ctx.data.shots.forEach((s) => {
        s.x += s.vx * dt;
        if (s.x > ctx.field.x + ctx.field.w) s.live = false;
      });
      if (ctx.data.blobs.filter((b) => b.live).length < 6) ctx.data.blobs.push(spawnBlob(ctx, true));
      ctx.data.blobs.forEach((b) => {
        if (!b.live) return;
        b.x += b.vx * dt;
        b.y += Math.sin(ctx.t * 3 + b.x) * 20 * dt;
        if (b.x < ctx.field.x - 20) b.live = false;
        ctx.data.shots.forEach((s) => {
          if (s.live && b.live && ctx.dist(s.x, s.y, b.x, b.y) < b.r + s.r) {
            b.live = false; s.live = false;
            const p = s.who === "alon" ? ctx.alon : ctx.dad;
            ctx.addScore(p, 1);
            ctx.chime();
            ctx.burst(b.x, b.y, p.color, 16);
          }
        });
      });
      ctx.data.shots = ctx.data.shots.filter((s) => s.live);
      ctx.data.blobs = ctx.data.blobs.filter((b) => b.live);
      ctx.maybeFirstTo(10);
    },
    draw(ctx) {
      const { g, w, h } = ctx;
      const bg = g.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, "#e0f2fe"); bg.addColorStop(1, "#c4b5fd");
      g.fillStyle = bg; g.fillRect(0, 0, w, h);
      ctx.fillField("rgba(255,255,255,.2)");
      (ctx.data.blobs || []).forEach((b) => {
        g.font = `${b.r * 2}px serif`;
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.fillText(b.emoji, b.x, b.y);
      });
      (ctx.data.shots || []).forEach((s) => {
        g.fillStyle = s.who === "alon" ? "rgba(251,113,133,.85)" : "rgba(56,189,248,.85)";
        g.beginPath(); g.arc(s.x, s.y, s.r, 0, Math.PI * 2); g.fill();
      });
      ctx.drawBuddies({ alon: "🐥", dad: "🐧" });
      ctx.drawSparks(0.016);
    }
  },

  "star-shower": {
    title: "Star Shower",
    emoji: "🌟",
    blurb: "Fly along the bottom. Beam stars up and pop 12 sky rocks.",
    hintAlon: "Alon: A D move · W beam",
    hintDad: "Dad: ← → move · ↑ beam",
    goal: "12 STARS",
    hearts: false,
    setup(ctx) {
      const f = ctx.field;
      ctx.data.shots = [];
      ctx.data.rocks = [];
      ctx.data.cool = { alon: 0, dad: 0 };
      ctx.alon.y = ctx.dad.y = f.y + f.h - 36;
      ctx.alon.x = f.x + f.w * 0.3;
      ctx.dad.x = f.x + f.w * 0.7;
    },
    update(ctx, dt) {
      const f = ctx.field;
      [ctx.alon, ctx.dad].forEach((p) => {
        const inn = ctx.input(p.id);
        p.x += inn.ax * 280 * dt;
        p.x = ctx.clamp(p.x, f.x + p.r, f.x + f.w - p.r);
        p.y = f.y + f.h - 36;
        ctx.data.cool[p.id] -= dt;
        if (inn.up && ctx.data.cool[p.id] <= 0) {
          ctx.data.cool[p.id] = 0.18;
          ctx.data.shots.push({ x: p.x, y: p.y - 20, vy: -420, who: p.id, r: 8, live: true });
          ctx.beep(980, 0.04, "sine", 0.05);
        }
      });
      if (Math.random() < 0.03) {
        ctx.data.rocks.push({
          x: f.x + 30 + Math.random() * (f.w - 60),
          y: f.y - 10, r: 16, vy: 70 + Math.random() * 50, live: true
        });
      }
      ctx.data.shots.forEach((s) => {
        s.y += s.vy * dt;
        if (s.y < f.y) s.live = false;
      });
      ctx.data.rocks.forEach((r) => {
        r.y += r.vy * dt;
        if (r.y > f.y + f.h) r.live = false;
        ctx.data.shots.forEach((s) => {
          if (s.live && r.live && ctx.dist(s.x, s.y, r.x, r.y) < 20) {
            r.live = false; s.live = false;
            const p = s.who === "alon" ? ctx.alon : ctx.dad;
            ctx.addScore(p, 1);
            ctx.chime();
            ctx.burst(r.x, r.y, "#fde047", 14);
          }
        });
      });
      ctx.data.shots = ctx.data.shots.filter((s) => s.live);
      ctx.data.rocks = ctx.data.rocks.filter((r) => r.live);
      ctx.maybeFirstTo(12);
    },
    draw(ctx) {
      const { g, w, h } = ctx;
      g.fillStyle = "#1e1b4b"; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 24; i++) {
        g.fillStyle = "rgba(255,255,255,.35)";
        g.fillRect((i * 97 + ctx.t * 12) % w, (i * 53) % h, 2, 2);
      }
      ctx.fillField("rgba(255,255,255,.08)");
      (ctx.data.rocks || []).forEach((r) => {
        g.font = "28px serif"; g.textAlign = "center"; g.textBaseline = "middle";
        g.fillText("🪨", r.x, r.y);
      });
      (ctx.data.shots || []).forEach((s) => {
        g.fillStyle = "#fde047";
        g.beginPath(); g.arc(s.x, s.y, s.r, 0, Math.PI * 2); g.fill();
      });
      ctx.drawBuddies({ alon: "🚀", dad: "🛸" });
      ctx.drawSparks(0.016);
    }
  },

  "paint-arena": {
    title: "Paint Arena",
    emoji: "🎨",
    blurb: "Twin-pad splat! Face where you walk, tap up to toss paint. First to 6 hits.",
    hintAlon: "Alon: WASD move · W splat",
    hintDad: "Dad: arrows move · ↑ splat",
    goal: "6 SPLATS",
    lives: 3,
    setup(ctx) {
      ctx.data.shots = [];
      ctx.data.cool = { alon: 0, dad: 0 };
      ctx.alon.aimx = 1; ctx.alon.aimy = 0;
      ctx.dad.aimx = -1; ctx.dad.aimy = 0;
    },
    update(ctx, dt) {
      [ctx.alon, ctx.dad].forEach((p) => {
        if (p.out) return;
        const inn = ctx.moveTopDown(p, 230, dt);
        if (Math.abs(inn.ax) + Math.abs(inn.ay) > 0.2) {
          const m = Math.hypot(inn.ax, inn.ay) || 1;
          p.aimx = inn.ax / m;
          p.aimy = inn.ay / m;
        }
        ctx.data.cool[p.id] -= dt;
        if (inn.up && ctx.data.cool[p.id] <= 0) {
          ctx.data.cool[p.id] = 0.32;
          ctx.data.shots.push({
            x: p.x, y: p.y, vx: p.aimx * 340, vy: p.aimy * 340,
            who: p.id, r: 12, live: true, life: 1.1
          });
          ctx.beep(420, 0.05, "triangle", 0.06);
        }
      });
      ctx.data.shots.forEach((s) => {
        s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt;
        if (s.life <= 0) s.live = false;
        const other = s.who === "alon" ? ctx.dad : ctx.alon;
        if (s.live && !other.out && ctx.dist(s.x, s.y, other.x, other.y) < other.r + s.r) {
          s.live = false;
          const shooter = s.who === "alon" ? ctx.alon : ctx.dad;
          ctx.addScore(shooter, 1);
          ctx.hurt(other);
          ctx.burst(other.x, other.y, shooter.color, 20);
        }
      });
      ctx.data.shots = ctx.data.shots.filter((s) => s.live);
      ctx.maybeFirstTo(6);
      ctx.maybeLastHeart();
    },
    draw(ctx) {
      const { g, w, h } = ctx;
      g.fillStyle = "#fdf4ff"; g.fillRect(0, 0, w, h);
      ctx.fillField("#fff7ed");
      (ctx.data.shots || []).forEach((s) => {
        g.fillStyle = s.who === "alon" ? "#fb7185" : "#38bdf8";
        g.beginPath(); g.arc(s.x, s.y, s.r, 0, Math.PI * 2); g.fill();
      });
      ctx.drawBuddies({ alon: "🎨", dad: "🖌️" });
      ctx.drawSparks(0.016);
    }
  },

  "balloon-boss": {
    title: "Balloon Boss",
    emoji: "🎈",
    blurb: "A giant party balloon! Puff stars at it. Most pops when it bursts wins.",
    hintAlon: "Alon: WASD · W puff",
    hintDad: "Dad: arrows · ↑ puff",
    goal: "BOSS HP",
    hearts: false,
    setup(ctx) {
      const f = ctx.field;
      ctx.data.hp = 24;
      ctx.data.shots = [];
      ctx.data.cool = { alon: 0, dad: 0 };
      ctx.data.boss = { x: f.x + f.w / 2, y: f.y + f.h * 0.32, r: 54 };
    },
    update(ctx, dt) {
      const b = ctx.data.boss;
      b.x = ctx.field.x + ctx.field.w / 2 + Math.sin(ctx.t * 0.8) * ctx.field.w * 0.22;
      b.y = ctx.field.y + ctx.field.h * 0.3 + Math.cos(ctx.t * 1.1) * 24;
      [ctx.alon, ctx.dad].forEach((p) => {
        ctx.moveTopDown(p, 230, dt);
        ctx.data.cool[p.id] -= dt;
        const inn = ctx.input(p.id);
        if (inn.up && ctx.data.cool[p.id] <= 0) {
          ctx.data.cool[p.id] = 0.2;
          ctx.data.shots.push({ x: p.x, y: p.y, vx: 0, vy: -360, who: p.id, r: 9, live: true });
          ctx.beep(700, 0.05, "sine", 0.05);
        }
      });
      ctx.data.shots.forEach((s) => {
        s.x += s.vx * dt; s.y += s.vy * dt;
        if (s.y < ctx.field.y) s.live = false;
        if (s.live && ctx.dist(s.x, s.y, b.x, b.y) < b.r) {
          s.live = false;
          ctx.data.hp -= 1;
          const p = s.who === "alon" ? ctx.alon : ctx.dad;
          ctx.addScore(p, 1);
          ctx.chime();
          ctx.burst(s.x, s.y, p.color, 10);
        }
      });
      ctx.data.shots = ctx.data.shots.filter((s) => s.live);
      ctx.setGoal(`${Math.max(0, ctx.data.hp)} hits`);
      if (ctx.data.hp <= 0) {
        const a = ctx.alon.score, d = ctx.dad.score;
        ctx.end(a === d ? "tie" : a > d ? "alon" : "dad", null, "The balloon went POP!", "🎈");
      }
    },
    draw(ctx) {
      const { g, w, h } = ctx;
      const bg = g.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, "#fce7f3"); bg.addColorStop(1, "#fde68a");
      g.fillStyle = bg; g.fillRect(0, 0, w, h);
      ctx.fillField("rgba(255,255,255,.22)");
      const b = ctx.data.boss || { x: w / 2, y: 180, r: 54 };
      g.font = `${b.r * 2}px serif`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText("🎈", b.x, b.y);
      (ctx.data.shots || []).forEach((s) => {
        g.fillStyle = "#fde047";
        g.beginPath(); g.arc(s.x, s.y, s.r, 0, Math.PI * 2); g.fill();
      });
      ctx.drawBuddies({ alon: "🐥", dad: "🐧" });
      ctx.drawSparks(0.016);
    }
  }
};
