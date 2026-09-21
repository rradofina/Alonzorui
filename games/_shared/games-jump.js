function platformsFor(ctx, list) {
  const f = ctx.field;
  return list.map(([nx, ny, nw, nh, extra]) => Object.assign({
    x: f.x + f.w * nx,
    y: f.y + f.h * ny,
    w: f.w * nw,
    h: (nh || 0.035) * f.h
  }, extra || {}));
}

function drawPlats(g, plats, color) {
  plats.forEach((p) => {
    g.fillStyle = p.bounce ? "#f472b6" : (p.ice ? "#e0f2fe" : (color || "#86efac"));
    g.beginPath();
    g.roundRect(p.x, p.y, p.w, p.h, 10);
    g.fill();
    if (p.bounce) {
      g.font = "16px serif";
      g.textAlign = "center";
      g.fillText("🍄", p.x + p.w / 2, p.y + 4);
    }
  });
}

function sideRaceSetup(ctx, finishX) {
  const f = ctx.field;
  ctx.alon.x = f.x + 50;
  ctx.dad.x = f.x + 90;
  ctx.alon.y = ctx.dad.y = f.y + f.h - 50;
  ctx.data.finish = finishX || (f.x + f.w - 48);
}

export const games = {
  "flag-dash": {
    title: "Flag Dash",
    emoji: "🏁",
    blurb: "Race across the grassy steps. First buddy to hug the flag wins!",
    hintAlon: "Alon: A D run · W jump",
    hintDad: "Dad: ← → run · ↑ jump",
    goal: "FIRST FLAG",
    hearts: false,
    setup(ctx) {
      ctx.data.plats = platformsFor(ctx, [
        [0, 0.92, 1, 0.08],
        [0.08, 0.72, 0.22, 0.04],
        [0.38, 0.58, 0.22, 0.04],
        [0.62, 0.44, 0.2, 0.04],
        [0.78, 0.28, 0.2, 0.04]
      ]);
      sideRaceSetup(ctx);
      ctx.alon.x = ctx.field.x + 70;
      ctx.dad.x = ctx.field.x + 130;
      ctx.alon.y = ctx.dad.y = ctx.field.y + ctx.field.h - 56;
    },
    update(ctx, dt) {
      [ctx.alon, ctx.dad].forEach((p) => {
        ctx.movePlatform(p, { onGround: true, speed: 260, jump: 620 }, dt);
        ctx.landOn(p, ctx.data.plats);
        ctx.keepInField(p);
        if (p.x > ctx.data.finish - 10) {
          ctx.addScore(p, 1);
          ctx.burst(p.x, p.y, p.color, 24);
          ctx.starChime();
          ctx.end(p.id, `${p.name} wins!`, "Flag hug!", "🏁");
        }
      });
    },
    draw(ctx) {
      const { g, w, h, field: f } = ctx;
      const sky = g.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, "#7dd3fc"); sky.addColorStop(1, "#86efac");
      g.fillStyle = sky; g.fillRect(0, 0, w, h);
      ctx.fillField("rgba(255,255,255,.18)");
      drawPlats(g, ctx.data.plats || []);
      ctx.icon(ctx.data.finish || (f.x + f.w - 40), f.y + f.h * 0.24, "🏁", "#fbbf24", 22);
      ctx.drawBuddies({ alon: "🐥", dad: "🐧" });
      ctx.drawSparks(0.016);
    }
  },

  "bounce-caps": {
    title: "Bounce Caps",
    emoji: "🍄",
    blurb: "Boing on the pink caps and grab 8 coins. Highest hopper wins!",
    hintAlon: "Alon: A D · W bounce",
    hintDad: "Dad: ← → · ↑ bounce",
    goal: "8 COINS",
    hearts: false,
    setup(ctx) {
      ctx.data.plats = platformsFor(ctx, [
        [0, 0.92, 1, 0.08],
        [0.1, 0.74, 0.18, 0.045, { bounce: true }],
        [0.42, 0.6, 0.18, 0.045, { bounce: true }],
        [0.7, 0.46, 0.18, 0.045, { bounce: true }],
        [0.22, 0.34, 0.18, 0.045, { bounce: true }],
        [0.55, 0.2, 0.2, 0.045, { bounce: true }]
      ]);
      ctx.data.coins = [];
      const f = ctx.field;
      for (let i = 0; i < 10; i++) {
        ctx.data.coins.push({
          x: f.x + 40 + Math.random() * (f.w - 80),
          y: f.y + 30 + Math.random() * (f.h * 0.7),
          r: 12, live: true
        });
      }
      ctx.alon.y = ctx.dad.y = f.y + f.h - 40;
    },
    update(ctx, dt) {
      [ctx.alon, ctx.dad].forEach((p) => {
        ctx.movePlatform(p, { onGround: true, bouncePad: true, speed: 240, jump: 540 }, dt);
        ctx.landOn(p, ctx.data.plats);
        ctx.keepInField(p);
        ctx.data.coins.forEach((c) => {
          if (c.live && ctx.dist(p.x, p.y, c.x, c.y) < p.r + 14) {
            c.live = false;
            ctx.addScore(p, 1);
            ctx.chime();
            ctx.burst(c.x, c.y, "#fbbf24", 12);
          }
        });
      });
      if (!ctx.data.coins.some((c) => c.live) || ctx.alon.score >= 8 || ctx.dad.score >= 8) {
        const a = ctx.alon.score, d = ctx.dad.score;
        ctx.end(a === d ? "tie" : a > d ? "alon" : "dad", null, "Boing boing!", "🍄");
      }
    },
    draw(ctx) {
      const { g, w, h } = ctx;
      g.fillStyle = "#fce7f3"; g.fillRect(0, 0, w, h);
      ctx.fillField("rgba(251,113,133,.12)");
      drawPlats(g, ctx.data.plats || []);
      (ctx.data.coins || []).forEach((c) => {
        if (!c.live) return;
        ctx.icon(c.x, c.y, "🪙", "#fbbf24", 14);
      });
      ctx.drawBuddies({ alon: "🐰", dad: "🐻" });
      ctx.drawSparks(0.016);
    }
  },

  "frost-slide": {
    title: "Frost Slide",
    emoji: "🧊",
    blurb: "Slippery ice! Scoot up 6 stars. Don't splash in the holes.",
    hintAlon: "Alon: A D skate · W hop",
    hintDad: "Dad: ← → skate · ↑ hop",
    goal: "6 STARS",
    lives: 3,
    setup(ctx) {
      const f = ctx.field;
      ctx.data.plats = platformsFor(ctx, [
        [0, 0.88, 0.28, 0.06, { ice: true }],
        [0.36, 0.88, 0.28, 0.06, { ice: true }],
        [0.72, 0.88, 0.28, 0.06, { ice: true }],
        [0.12, 0.62, 0.3, 0.05, { ice: true }],
        [0.56, 0.48, 0.3, 0.05, { ice: true }],
        [0.28, 0.28, 0.4, 0.05, { ice: true }]
      ]);
      ctx.data.stars = [];
      for (let i = 0; i < 8; i++) {
        ctx.data.stars.push({
          x: f.x + 50 + (i % 4) * (f.w / 4.2),
          y: f.y + 40 + (i % 3) * (f.h / 4),
          r: 14, live: true
        });
      }
      ctx.alon.y = ctx.dad.y = f.y + f.h * 0.8;
    },
    update(ctx, dt) {
      const waterY = ctx.field.y + ctx.field.h - 8;
      [ctx.alon, ctx.dad].forEach((p) => {
        if (p.out) return;
        ctx.movePlatform(p, { onGround: true, ice: 3.2, speed: 420, jump: 580 }, dt);
        ctx.landOn(p, ctx.data.plats);
        if (p.x < ctx.field.x + p.r) { p.x = ctx.field.x + p.r; p.vx *= -0.3; }
        if (p.x > ctx.field.x + ctx.field.w - p.r) { p.x = ctx.field.x + ctx.field.w - p.r; p.vx *= -0.3; }
        if (p.y > waterY && !p._ground) {
          ctx.hurt(p);
          p.x = ctx.field.x + ctx.field.w * (p.id === "alon" ? 0.2 : 0.8);
          p.y = ctx.field.y + 40;
          p.vy = 0;
        }
        ctx.data.stars.forEach((s) => {
          if (s.live && ctx.dist(p.x, p.y, s.x, s.y) < 28) {
            s.live = false;
            ctx.addScore(p, 1);
            ctx.starChime();
            ctx.burst(s.x, s.y, "#fde047", 16);
          }
        });
      });
      ctx.maybeFirstTo(6);
      ctx.maybeLastHeart();
    },
    draw(ctx) {
      const { g, w, h, field: f } = ctx;
      const sky = g.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, "#e0f2fe"); sky.addColorStop(1, "#38bdf8");
      g.fillStyle = sky; g.fillRect(0, 0, w, h);
      g.fillStyle = "#0ea5e9";
      g.fillRect(f.x, f.y + f.h - 18, f.w, 18);
      ctx.fillField("rgba(255,255,255,.2)");
      drawPlats(g, ctx.data.plats || [], "#bae6fd");
      (ctx.data.stars || []).forEach((s) => {
        if (!s.live) return;
        ctx.icon(s.x, s.y, "⭐", "#fde047", 15);
      });
      ctx.drawBuddies({ alon: "🐧", dad: "🦭" });
      ctx.drawSparks(0.016);
    }
  },

  "cloud-hop": {
    title: "Cloud Hop",
    emoji: "☁️",
    blurb: "Hop the fluffy stairs. First to the sun flag at the top wins!",
    hintAlon: "Alon: A D · W jump",
    hintDad: "Dad: ← → · ↑ jump",
    goal: "RACE UP",
    hearts: false,
    setup(ctx) {
      const f = ctx.field;
      const plats = [{ x: f.x, y: f.y + f.h - 24, w: f.w, h: 24 }];
      for (let i = 0; i < 14; i++) {
        plats.push({
          x: f.x + (i % 2 ? 0.12 : 0.48) * f.w,
          y: f.y + f.h - 70 - i * 52,
          w: f.w * 0.38,
          h: 18
        });
      }
      ctx.data.plats = plats;
      ctx.data.cam = 0;
      ctx.data.top = plats[plats.length - 1].y - 40;
      ctx.alon.x = f.x + 70;
      ctx.dad.x = f.x + 130;
      ctx.alon.y = ctx.dad.y = f.y + f.h - 50;
    },
    update(ctx, dt) {
      const best = Math.min(ctx.alon.y, ctx.dad.y);
      const want = Math.min(0, best - ctx.field.y - ctx.field.h * 0.45);
      ctx.data.cam += (want - ctx.data.cam) * Math.min(1, 4 * dt);
      [ctx.alon, ctx.dad].forEach((p) => {
        ctx.movePlatform(p, { onGround: true, speed: 250, jump: 640, gravity: 1500 }, dt);
        ctx.landOn(p, ctx.data.plats);
        p.x = ctx.clamp(p.x, ctx.field.x + p.r, ctx.field.x + ctx.field.w - p.r);
        if (p.y < ctx.data.top + 24) {
          ctx.addScore(p, 1);
          ctx.end(p.id, `${p.name} wins!`, "Cloud champion!", "☁️");
        }
      });
    },
    draw(ctx) {
      const { g, w, h } = ctx;
      const sky = g.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, "#38bdf8"); sky.addColorStop(1, "#f9a8d4");
      g.fillStyle = sky; g.fillRect(0, 0, w, h);
      ctx.fillField("rgba(255,255,255,.12)");
      g.save();
      g.translate(0, -ctx.data.cam || 0);
      (ctx.data.plats || []).forEach((p) => {
        g.fillStyle = "#fff";
        g.beginPath();
        g.roundRect(p.x, p.y, p.w, p.h, 12);
        g.fill();
      });
      g.font = "40px serif";
      g.textAlign = "center";
      g.fillText("🌞", ctx.field.x + ctx.field.w / 2, (ctx.data.top || 80) - 10);
      g.restore();
      const cam = ctx.data.cam || 0;
      const oa = ctx.alon.y, od = ctx.dad.y;
      ctx.alon.y = oa - cam; ctx.dad.y = od - cam;
      ctx.drawBuddies({ alon: "🐥", dad: "🐧" });
      ctx.alon.y = oa; ctx.dad.y = od;
      ctx.drawSparks(0.016);
    }
  },

  "bubbly-bay": {
    title: "Bubbly Bay",
    emoji: "🫧",
    blurb: "Swim for 8 shiny pearls. Jelly bumps are only a tickle.",
    hintAlon: "Alon: WASD swim",
    hintDad: "Dad: arrows swim",
    goal: "8 PEARLS",
    lives: 3,
    setup(ctx) {
      const f = ctx.field;
      ctx.data.pearls = [];
      ctx.data.jellies = [];
      for (let i = 0; i < 12; i++) {
        ctx.data.pearls.push({
          x: f.x + 40 + Math.random() * (f.w - 80),
          y: f.y + 40 + Math.random() * (f.h - 80),
          r: 12, live: true, wob: Math.random() * 6
        });
      }
      for (let i = 0; i < 4; i++) {
        ctx.data.jellies.push({
          x: f.x + 80 + i * (f.w / 5),
          y: f.y + 80 + (i % 2) * 90,
          r: 20, vx: 40 + i * 10, wob: i
        });
      }
      ctx.alon.x = f.x + 60;
      ctx.dad.x = f.x + f.w - 60;
      ctx.alon.y = ctx.dad.y = f.y + f.h / 2;
    },
    update(ctx, dt) {
      [ctx.alon, ctx.dad].forEach((p) => {
        if (p.out) return;
        ctx.movePlatform(p, { swim: true, speed: 220, gravity: 0 }, dt);
        ctx.keepInField(p, true);
        ctx.data.pearls.forEach((c) => {
          c.wob += dt;
          if (c.live && ctx.dist(p.x, p.y, c.x, c.y + Math.sin(c.wob * 3) * 6) < 26) {
            c.live = false;
            ctx.addScore(p, 1);
            ctx.chime();
            ctx.burst(c.x, c.y, "#e0f2fe", 12);
          }
        });
        ctx.data.jellies.forEach((j) => {
          if (ctx.dist(p.x, p.y, j.x, j.y) < p.r + j.r) ctx.hurt(p);
        });
      });
      (ctx.data.jellies || []).forEach((j) => {
        j.x += j.vx * dt;
        j.y += Math.sin(ctx.t * 2 + j.wob) * 20 * dt;
        if (j.x < ctx.field.x + 20 || j.x > ctx.field.x + ctx.field.w - 20) j.vx *= -1;
      });
      ctx.maybeFirstTo(8);
      ctx.maybeLastHeart();
    },
    draw(ctx) {
      const { g, w, h } = ctx;
      const water = g.createLinearGradient(0, 0, 0, h);
      water.addColorStop(0, "#7dd3fc"); water.addColorStop(1, "#0369a1");
      g.fillStyle = water; g.fillRect(0, 0, w, h);
      ctx.fillField("rgba(255,255,255,.1)");
      (ctx.data.pearls || []).forEach((c) => {
        if (!c.live) return;
        ctx.icon(c.x, c.y + Math.sin(c.wob * 3) * 6, "•", "#f8fafc", 10);
      });
      (ctx.data.jellies || []).forEach((j) => {
        g.font = "36px serif";
        g.textAlign = "center";
        g.fillText("🪼", j.x, j.y + 10);
      });
      ctx.drawBuddies({ alon: "🐠", dad: "🐡" });
      ctx.drawSparks(0.016);
    }
  },

  "critter-ride": {
    title: "Critter Ride",
    emoji: "🦕",
    blurb: "Ride a bouncy bean beast. Jump the pits — first to the snack flag!",
    hintAlon: "Alon: W jump",
    hintDad: "Dad: ↑ jump",
    goal: "RIDE!",
    hearts: false,
    setup(ctx) {
      const f = ctx.field;
      ctx.data.scroll = 0;
      ctx.data.pits = [420, 720, 980, 1280, 1500];
      ctx.data.finish = 1750;
      ctx.alon.x = f.x + f.w * 0.28;
      ctx.dad.x = f.x + f.w * 0.62;
      ctx.alon.y = ctx.dad.y = f.y + f.h - 70;
      ctx.data.dist = { alon: 0, dad: 0 };
    },
    update(ctx, dt) {
      ctx.data.scroll += 220 * dt;
      const ground = ctx.field.y + ctx.field.h - 48;
      [ctx.alon, ctx.dad].forEach((p) => {
        const inn = ctx.input(p.id);
        p.vy += 1600 * dt;
        if (inn.up && p._ground && !p._jumpLock) {
          p.vy = -640;
          p._ground = false;
          p._jumpLock = true;
          ctx.beep(540, 0.06, "square", 0.05);
        }
        if (!inn.up) p._jumpLock = false;
        p.y += p.vy * dt;
        const worldX = ctx.data.dist[p.id] + 80;
        const inPit = ctx.data.pits.some((pit) => worldX > pit && worldX < pit + 70);
        if (p.y >= ground && !inPit) {
          p.y = ground;
          p.vy = 0;
          p._ground = true;
        } else {
          p._ground = false;
        }
        ctx.data.dist[p.id] += 220 * dt;
        if (inPit && p.y > ground + 8) {
          ctx.data.dist[p.id] = Math.max(0, ctx.data.dist[p.id] - 90);
          p.y = ground - 20;
          p.vy = -200;
          ctx.flash(p.id);
          ctx.bump();
        }
        if (ctx.data.dist[p.id] >= ctx.data.finish) {
          ctx.addScore(p, 1);
          ctx.end(p.id, `${p.name} wins!`, "The bean beast did it!", "🦕");
        }
      });
      ctx.setGoal(`${Math.max(ctx.data.dist.alon, ctx.data.dist.dad) | 0}m`);
    },
    draw(ctx) {
      const { g, w, h, field: f } = ctx;
      const sky = g.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, "#fde68a"); sky.addColorStop(1, "#86efac");
      g.fillStyle = sky; g.fillRect(0, 0, w, h);
      ctx.fillField("rgba(255,255,255,.16)");
      g.fillStyle = "#4ade80";
      g.fillRect(f.x, f.y + f.h - 36, f.w, 36);
      const sc = ctx.data.scroll || 0;
      (ctx.data.pits || []).forEach((pit) => {
        const x = f.x + 40 + (pit - sc);
        if (x < f.x - 80 || x > f.x + f.w + 80) return;
        g.fillStyle = "#0c4a6e";
        g.fillRect(x, f.y + f.h - 36, 70, 36);
      });
      const fx = f.x + 40 + ((ctx.data.finish || 0) - sc);
      if (fx > f.x && fx < f.x + f.w) {
        g.font = "40px serif";
        g.fillText("🏁", fx, f.y + f.h - 50);
      }
      ctx.drawBuddies({ alon: "🦕", dad: "🐢" });
      ctx.drawSparks(0.016);
    }
  }
};
