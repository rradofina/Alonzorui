function P(ctx, x, y, w, h, extra) {
  return Object.assign({ x, y, w, h }, extra || {});
}

function ground(ctx, worldW) {
  const f = ctx.field;
  return [P(ctx, 0, f.y + f.h - 28, worldW, 32)];
}

function followCam(ctx, dt) {
  const f = ctx.field;
  const pad = (ctx.alon.r || 42) * 2.2;
  const left = Math.min(ctx.alon.x, ctx.dad.x) - pad;
  const right = Math.max(ctx.alon.x, ctx.dad.x) + pad;
  const mid = (left + right) * 0.5;
  const want = ctx.clamp(mid - f.w * 0.5, 0, Math.max(0, (ctx.data.worldW || f.w) - f.w));
  const cur = ctx.data.camX || 0;
  const gap = Math.abs(want - cur);
  if (gap > 280) ctx.data.camX = want;
  else ctx.data.camX = cur + (want - cur) * Math.min(1, (gap > 120 ? 12 : 6) * dt);
}

function toScreen(ctx, x) { return x - (ctx.data.camX || 0); }

function platTick(ctx, dt, opts) {
  const grav = opts.ice ? { onGround: true, ice: 3.2, speed: 400, jump: 740 } : { onGround: true, bouncePad: !!opts.bounce, speed: opts.speed || 290, jump: opts.jump || 740 };
  [ctx.alon, ctx.dad].forEach((p) => {
    ctx.movePlatform(p, grav, dt);
    ctx.landOn(p, ctx.data.plats);
    p.x = ctx.clamp(p.x, p.r, ctx.data.worldW - p.r);
    if (p.y > ctx.field.y + ctx.field.h + 20) {
      const home = (ctx.data.plats || [])[1] || (ctx.data.plats || [])[0];
      p.x = (home ? home.x + p.r * 1.4 : 80) + (p.id === "dad" ? p.r * 2.2 : 0);
      p.y = home ? home.y - p.r : ctx.field.y + ctx.field.h * 0.5;
      p.vy = 0;
      p.vx = 0;
      p._ground = true;
      ctx.data.camX = ctx.clamp(p.x - ctx.field.w * 0.35, 0, Math.max(0, (ctx.data.worldW || ctx.field.w) - ctx.field.w));
      ctx.hurt(p);
      ctx.punch(0.25);
    }
  });
}

function drawScrollWorld(ctx, theme, extras) {
  const r = ctx.alon.r || 42;
  ctx.withShake(() => {
    ctx.drawTheme(theme);
    ctx.g.save();
    ctx.g.beginPath();
    ctx.g.roundRect(ctx.field.x, ctx.field.y, ctx.field.w, ctx.field.h, 24);
    ctx.g.clip();
    ctx.g.translate(-(ctx.data.camX || 0), 0);
    ctx.drawPlats(ctx.data.plats, extras.platColor);
    (ctx.data.coins || []).forEach((c) => { if (c.live) ctx.prop(extras.coin || "coin", c.x, c.y, Math.max(16, r * 0.38)); });
    (ctx.data.haz || []).forEach((h) => { if (h.live !== false) ctx.prop(extras.haz || "veg", h.x, h.y, Math.max(16, r * 0.36)); });
    if (ctx.data.flag) {
      const fl = ctx.data.flag;
      const pole = Math.max(56, r * 1.35);
      ctx.g.fillStyle = "#92400e";
      ctx.g.fillRect(fl.x - 4, fl.y - 10, 8, pole);
      ctx.g.fillStyle = "#fbbf24";
      ctx.g.beginPath();
      ctx.g.moveTo(fl.x + 4, fl.y - 8);
      ctx.g.lineTo(fl.x + Math.max(46, r * 1.15), fl.y + r * 0.35);
      ctx.g.lineTo(fl.x + 4, fl.y + r * 0.72);
      ctx.g.fill();
      ctx.icon(fl.x + 10, fl.y + 8, "🏁", "#fde047", Math.max(16, r * 0.4));
    }
    const ox = ctx.data.camX || 0;
    ctx.alon.x -= ox; ctx.dad.x -= ox;
    ctx.drawBuddies(extras.faces);
    ctx.g.restore();
    ctx.drawBuddies(extras.faces);
    ctx.alon.x += ox; ctx.dad.x += ox;
    ctx.drawJuice();
  });
}

export const games = {
  "flag-dash": {
    title: "Flag Dash",
    emoji: "🏁",
    blurb: "Best of 3 flag races! Jump the gaps, grab coins, hug the flag first.",
    hintAlon: "Alon: A D run · W jump",
    hintDad: "Dad: ← → run · ↑ jump",
    goal: "BEST OF 3",
    hearts: false,
    lives: 99,
    rounds: 3,
    roundNames: ["Meadow", "Canyon", "Castle"],
    setup(ctx) { ctx.resetMatch(); ctx.data.camX = 0; },
    setupRound(ctx, n) {
      const f = ctx.field;
      const r = ctx.sizeBuddies();
      const platH = Math.max(30, Math.round(r * 0.7));
      const steps = f.h < 340 ? 3 : n === 1 ? 4 : 5;
      ctx.data.worldW = f.x + f.w;
      ctx.data.camX = 0;
      const left = f.x + 10;
      const right = f.x + f.w - 10;
      const floorY = f.y + f.h - platH;
      const topY = f.y + Math.max(r * 1.7, f.h * 0.16);
      const rise = Math.min(r * 2.05, (floorY - platH - topY) / Math.max(1, steps - 1));
      const homeW = Math.min((right - left) * 0.36, r * 6.6);
      const stepW = Math.min((right - left) * 0.3, r * 5.4);
      const plats = [P(ctx, f.x, floorY, f.w, platH + 10)];
      for (let i = 0; i < steps; i++) {
        const t = steps === 1 ? 0 : i / (steps - 1);
        const w = i === 0 ? homeW : stepW;
        const x = left + t * (right - left - w);
        const y = floorY - 8 - i * rise;
        plats.push(P(ctx, x, y, w, platH));
      }
      const last = plats[plats.length - 1];
      ctx.data.plats = plats;
      ctx.data.coins = plats.slice(1, -1).map((pl) => ({
        x: pl.x + pl.w * 0.62, y: pl.y - r * 0.7, live: true
      }));
      ctx.data.flag = { x: last.x + last.w * 0.72, y: last.y - r * 0.08 };
      ctx.parkTogether();
      ctx.alon.hearts = ctx.dad.hearts = 99;
    },
    update(ctx, dt) {
      const jump = ctx.field.h < 360 ? 580 : 740;
      platTick(ctx, dt, { speed: 300, jump });
      ctx.data.camX = 0;
      const r = ctx.alon.r || 42;
      const last = (ctx.data.plats || [])[(ctx.data.plats || []).length - 1];
      const fl = ctx.data.flag;
      [ctx.alon, ctx.dad].forEach((p) => {
        p.x = ctx.clamp(p.x, ctx.field.x + p.r * 0.4, ctx.field.x + ctx.field.w - p.r * 0.4);
        ctx.data.coins.forEach((c) => {
          if (c.live && ctx.dist(p.x, p.y, c.x, c.y) < p.r * 0.85) {
            c.live = false; ctx.pickup(p, "+coin"); ctx.chime(); ctx.burst(c.x, c.y, "#fbbf24", 10);
          }
        });
        if (!fl) return;
        const hug = ctx.dist(p.x, p.y, fl.x, fl.y) < p.r + 30;
        const pole = Math.abs(p.x - fl.x) < Math.max(26, p.r * 0.55)
          && p.y < fl.y + p.r && p.y + p.r > fl.y - Math.max(110, r * 1.5);
        const onLast = last && p.x > last.x - 6 && p.x < last.x + last.w + 6
          && p.y + p.r >= last.y - 16 && p.y + p.r <= last.y + Math.max(40, (last.h || 28) + 20);
        if (hug || pole || onLast) ctx.winRound(p.id, "Flag hug!");
      });
    },
    draw(ctx) {
      const r = ctx.alon.r || 42;
      ctx.withShake(() => {
        ctx.drawTheme("meadow");
        ctx.drawPlats(ctx.data.plats);
        (ctx.data.coins || []).forEach((c) => {
          if (c.live) ctx.prop("coin", c.x, c.y, Math.max(18, r * 0.42));
        });
        const fl = ctx.data.flag;
        if (fl) {
          const pole = Math.max(64, r * 1.45);
          ctx.g.fillStyle = "#92400e";
          ctx.g.fillRect(fl.x - 5, fl.y - 12, 10, pole);
          ctx.g.fillStyle = "#fbbf24";
          ctx.g.beginPath();
          ctx.g.moveTo(fl.x + 5, fl.y - 10);
          ctx.g.lineTo(fl.x + Math.max(52, r * 1.25), fl.y + r * 0.38);
          ctx.g.lineTo(fl.x + 5, fl.y + r * 0.78);
          ctx.g.fill();
          ctx.icon(fl.x + 12, fl.y + 10, "🏁", "#fde047", Math.max(18, r * 0.42));
        }
        ctx.drawBuddies({ alon: "🐥", dad: "🐧" });
        ctx.drawJuice();
      });
    }
  },

  "bounce-caps": {
    title: "Bounce Caps",
    emoji: "🍄",
    blurb: "Boing the pink caps! First to the coin goal each round wins — best of 3.",
    hintAlon: "Alon: A D · W bounce",
    hintDad: "Dad: ← → · ↑ bounce",
    goal: "BEST OF 3",
    hearts: false,
    rounds: 3,
    roundNames: ["Sprout", "Grove", "Canopy"],
    setup(ctx) { ctx.resetMatch(); },
    setupRound(ctx, n) {
      const f = ctx.field;
      const r = ctx.sizeBuddies();
      const ph = Math.max(26, Math.round(r * 0.55));
      ctx.data.need = 5 + n * 2;
      ctx.data.got = { alon: 0, dad: 0 };
      ctx.data.worldW = f.w;
      ctx.data.camX = 0;
      ctx.data.plats = [
        P(ctx, f.x, f.y + f.h - ph, f.w, ph + 6),
        ...[0.06, 0.36, 0.64].map((nx, i) => P(ctx, f.x + f.w * nx, f.y + f.h * (0.74 - i * 0.1), f.w * 0.3, ph, { bounce: true })),
        ...[0.2, 0.5].map((nx, i) => P(ctx, f.x + f.w * nx, f.y + f.h * (0.48 - i * 0.08), f.w * 0.28, ph, { bounce: true }))
      ];
      if (n > 1) ctx.data.plats.push(P(ctx, f.x + f.w * 0.38, f.y + f.h * 0.28, f.w * 0.28, ph, { bounce: true }));
      ctx.data.coins = ctx.data.plats.slice(1).map((pl) => ({
        x: pl.x + pl.w * 0.5, y: pl.y - 36, live: true
      }));
      ctx.data.plats.slice(1).forEach((pl) => {
        ctx.data.coins.push({ x: pl.x + pl.w * 0.25, y: pl.y - 58, live: true });
      });
      ctx.data.haz = [];
      for (let i = 0; i < n; i++) {
        ctx.data.haz.push({ x: f.x + 80 + i * 140, y: f.y + 20, vy: 50 + n * 20, live: true });
      }
      ctx.place(0.2, 0.8, 0.86);
    },
    update(ctx, dt) {
      [ctx.alon, ctx.dad].forEach((p) => {
        ctx.movePlatform(p, { onGround: true, bouncePad: true, speed: 250, jump: 560 }, dt);
        ctx.landOn(p, ctx.data.plats);
        ctx.keepInField(p);
        ctx.data.coins.forEach((c) => {
          if (c.live && ctx.dist(p.x, p.y, c.x, c.y) < 28) {
            c.live = false;
            ctx.data.got[p.id] += 1;
            ctx.addScore(p, 1);
            ctx.chime();
            ctx.burst(c.x, c.y, "#fbbf24", 12);
            if (ctx.data.got[p.id] >= ctx.data.need) ctx.winRound(p.id, "Boing champ!");
          }
        });
      });
      ctx.data.haz.forEach((h) => {
        h.y += h.vy * dt;
        if (h.y > ctx.field.y + ctx.field.h - 20) { h.y = ctx.field.y + 10; h.x = ctx.field.x + 40 + Math.random() * (ctx.field.w - 80); }
        [ctx.alon, ctx.dad].forEach((p) => {
          if (ctx.dist(p.x, p.y, h.x, h.y) < 26) { ctx.flash(p.id); ctx.bump(); p.vy = -220; ctx.punch(0.15); }
        });
      });
      ctx.setGoal(`${Math.max(ctx.data.got.alon, ctx.data.got.dad)}/${ctx.data.need}`);
    },
    draw(ctx) {
      ctx.withShake(() => {
        ctx.drawTheme("candy");
        ctx.drawPlats(ctx.data.plats);
        (ctx.data.plats || []).forEach((pl) => { if (pl.bounce) ctx.prop("mush", pl.x + pl.w / 2, pl.y + 4, 12); });
        (ctx.data.coins || []).forEach((c) => { if (c.live) ctx.prop("coin", c.x, c.y, 13); });
        (ctx.data.haz || []).forEach((h) => ctx.prop("fruit", h.x, h.y, 12, { color: "#f9a8d4" }));
        ctx.drawBuddies({ alon: "🐰", dad: "🐻" });
        ctx.drawJuice();
      });
    }
  },

  "frost-slide": {
    title: "Frost Slide",
    emoji: "🧊",
    blurb: "Slippery ice lakes! Scoop stars, hop holes. Best of 3 chilly races.",
    hintAlon: "Alon: A D skate · W hop",
    hintDad: "Dad: ← → skate · ↑ hop",
    goal: "BEST OF 3",
    lives: 3,
    rounds: 3,
    roundNames: ["Puddle", "Lake", "Floe"],
    setup(ctx) { ctx.resetMatch(); },
    setupRound(ctx, n) {
      const f = ctx.field;
      const r = ctx.sizeBuddies();
      const ph = Math.max(26, Math.round(r * 0.5));
      ctx.data.need = 4 + n;
      ctx.data.got = { alon: 0, dad: 0 };
      ctx.data.plats = [
        P(ctx, f.x, f.y + f.h * 0.86, f.w * 0.4, ph, { ice: true }),
        P(ctx, f.x + f.w * 0.44, f.y + f.h * 0.86, f.w * 0.24, ph, { ice: true }),
        P(ctx, f.x + f.w * 0.72, f.y + f.h * 0.86, f.w * 0.28, ph, { ice: true }),
        P(ctx, f.x + f.w * 0.08, f.y + f.h * 0.62, f.w * 0.36, ph, { ice: true }),
        P(ctx, f.x + f.w * 0.5, f.y + f.h * 0.48, f.w * 0.36, ph, { ice: true }),
        P(ctx, f.x + f.w * 0.2, f.y + f.h * 0.3, f.w * 0.5, ph, { ice: true })
      ];
      if (n === 3) ctx.data.plats.push(P(ctx, f.x + f.w * 0.55, f.y + f.h * 0.18, f.w * 0.32, ph, { ice: true }));
      ctx.data.stars = ctx.data.plats.map((pl) => ({
        x: pl.x + pl.w * 0.5, y: pl.y - 30, live: true
      }));
      ctx.alon.hearts = ctx.dad.hearts = 3;
      ctx.alon.out = ctx.dad.out = false;
      ctx.place(0.18, 0.82, 0.8);
    },
    update(ctx, dt) {
      const water = ctx.field.y + ctx.field.h - 10;
      [ctx.alon, ctx.dad].forEach((p) => {
        if (p.out) return;
        ctx.movePlatform(p, { onGround: true, ice: 3.4, speed: 430, jump: 600 }, dt);
        ctx.landOn(p, ctx.data.plats);
        if (p.x < ctx.field.x + p.r) { p.x = ctx.field.x + p.r; p.vx *= -0.35; }
        if (p.x > ctx.field.x + ctx.field.w - p.r) { p.x = ctx.field.x + ctx.field.w - p.r; p.vx *= -0.35; }
        if (p.y > water && !p._ground) {
          ctx.hurt(p);
          p.x = ctx.field.x + ctx.field.w * (p.id === "alon" ? 0.18 : 0.82);
          p.y = ctx.field.y + 50; p.vy = 0;
        }
        ctx.data.stars.forEach((s) => {
          if (s.live && ctx.dist(p.x, p.y, s.x, s.y) < 28) {
            s.live = false; ctx.data.got[p.id] += 1; ctx.addScore(p, 1); ctx.starChime();
            ctx.burst(s.x, s.y, "#fde047", 14);
            if (ctx.data.got[p.id] >= ctx.data.need) ctx.winRound(p.id, "Ice sparkle!");
          }
        });
      });
      ctx.setGoal(`${Math.max(ctx.data.got.alon, ctx.data.got.dad)}/${ctx.data.need}`);
    },
    draw(ctx) {
      ctx.withShake(() => {
        ctx.drawTheme("ice");
        ctx.g.fillStyle = "#0ea5e9";
        ctx.g.fillRect(ctx.field.x, ctx.field.y + ctx.field.h - 16, ctx.field.w, 16);
        ctx.drawPlats(ctx.data.plats, "#bae6fd");
        (ctx.data.stars || []).forEach((s) => { if (s.live) ctx.prop("star", s.x, s.y, 14); });
        ctx.drawBuddies({ alon: "🐧", dad: "🦭" });
        ctx.drawJuice();
      });
    }
  },

  "cloud-hop": {
    title: "Cloud Hop",
    emoji: "☁️",
    blurb: "Race up three sky peaks. First to the sun each round wins!",
    hintAlon: "Alon: A D · W jump",
    hintDad: "Dad: ← → · ↑ jump",
    goal: "BEST OF 3",
    hearts: false,
    lives: 99,
    rounds: 3,
    roundNames: ["Puff", "Storm", "Heaven"],
    setup(ctx) { ctx.resetMatch(); },
    setupRound(ctx, n) {
      const f = ctx.field;
      const r = ctx.sizeBuddies();
      const ph = Math.max(26, Math.round(r * 0.5));
      const count = 8 + n * 2;
      const plats = [P(ctx, f.x, f.y + f.h - ph, f.w, ph + 6)];
      const gap = Math.max(r * 1.35, f.h * 0.09);
      for (let i = 0; i < count; i++) {
        plats.push(P(ctx, f.x + (i % 2 ? 0.08 : 0.42) * f.w,
          f.y + f.h - ph - 20 - i * gap, f.w * 0.5, ph));
      }
      ctx.data.plats = plats;
      ctx.data.cam = 0;
      ctx.data.top = plats[plats.length - 1].y - r;
      ctx.data.wind = n === 3 ? 12 : n === 2 ? 6 : 0;
      ctx.alon.x = f.x + r * 1.4; ctx.dad.x = f.x + r * 3.2;
      ctx.alon.y = ctx.dad.y = plats[0].y - r;
    },
    update(ctx, dt) {
      const best = Math.min(ctx.alon.y, ctx.dad.y);
      const want = Math.min(0, best - ctx.field.y - ctx.field.h * 0.42);
      ctx.data.cam += (want - ctx.data.cam) * Math.min(1, 4 * dt);
      [ctx.alon, ctx.dad].forEach((p) => {
        ctx.movePlatform(p, { onGround: true, speed: 250, jump: 660, gravity: 1500 }, dt);
        p.x += Math.sin(ctx.t * 1.4) * ctx.data.wind * dt;
        ctx.landOn(p, ctx.data.plats);
        p.x = ctx.clamp(p.x, ctx.field.x + p.r, ctx.field.x + ctx.field.w - p.r);
        if (p.y < ctx.data.top + 20) ctx.winRound(p.id, "Cloud champion!");
      });
    },
    draw(ctx) {
      const cam = ctx.data.cam || 0;
      ctx.withShake(() => {
        ctx.drawTheme("sunset");
        ctx.g.save();
        ctx.g.translate(0, -cam);
        ctx.drawPlats(ctx.data.plats, "#fff");
        ctx.icon(ctx.field.x + ctx.field.w / 2, (ctx.data.top || 80) - 8, "🌞", "#fde047", 22);
        ctx.g.restore();
        const oa = ctx.alon.y, od = ctx.dad.y;
        ctx.alon.y = oa - cam; ctx.dad.y = od - cam;
        ctx.drawBuddies({ alon: "🐥", dad: "🐧" });
        ctx.alon.y = oa; ctx.dad.y = od;
        ctx.drawJuice();
      });
    }
  },

  "bubbly-bay": {
    title: "Bubbly Bay",
    emoji: "🫧",
    blurb: "Three reefs of pearls! Swim past tickly jellies. Best of 3.",
    hintAlon: "Alon: WASD swim",
    hintDad: "Dad: arrows swim",
    goal: "BEST OF 3",
    lives: 3,
    rounds: 3,
    roundNames: ["Cove", "Reef", "Trench"],
    setup(ctx) { ctx.resetMatch(); },
    setupRound(ctx, n) {
      const f = ctx.field;
      ctx.data.need = 5 + n * 2;
      ctx.data.got = { alon: 0, dad: 0 };
      ctx.data.pearls = [];
      for (let i = 0; i < 10 + n * 3; i++) {
        ctx.data.pearls.push({
          x: f.x + 40 + Math.random() * (f.w - 80),
          y: f.y + 40 + Math.random() * (f.h - 80),
          live: true, wob: Math.random() * 6
        });
      }
      ctx.data.jellies = [];
      for (let i = 0; i < 3 + n; i++) {
        ctx.data.jellies.push({
          x: f.x + 70 + i * (f.w / (4 + n)),
          y: f.y + 70 + (i % 2) * 80,
          r: 18, vx: 50 + n * 18, wob: i
        });
      }
      ctx.alon.hearts = ctx.dad.hearts = 3;
      ctx.alon.out = ctx.dad.out = false;
      ctx.place(0.12, 0.88, 0.5);
    },
    update(ctx, dt) {
      [ctx.alon, ctx.dad].forEach((p) => {
        if (p.out) return;
        ctx.movePlatform(p, { swim: true, speed: 230, gravity: 0 }, dt);
        ctx.keepInField(p, true);
        ctx.data.pearls.forEach((c) => {
          c.wob += dt;
          if (c.live && ctx.dist(p.x, p.y, c.x, c.y + Math.sin(c.wob * 3) * 6) < 26) {
            c.live = false; ctx.data.got[p.id] += 1; ctx.addScore(p, 1); ctx.chime();
            ctx.burst(c.x, c.y, "#e0f2fe", 12);
            if (ctx.data.got[p.id] >= ctx.data.need) ctx.winRound(p.id, "Pearl diver!");
          }
        });
        ctx.data.jellies.forEach((j) => {
          if (ctx.dist(p.x, p.y, j.x, j.y) < p.r + j.r) { ctx.hurt(p); p.vx *= -1; p.vy *= -1; }
        });
      });
      ctx.data.jellies.forEach((j) => {
        j.x += j.vx * dt;
        j.y += Math.sin(ctx.t * 2 + j.wob) * 26 * dt;
        if (j.x < ctx.field.x + 20 || j.x > ctx.field.x + ctx.field.w - 20) j.vx *= -1;
      });
      ctx.setGoal(`${Math.max(ctx.data.got.alon, ctx.data.got.dad)}/${ctx.data.need}`);
    },
    draw(ctx) {
      ctx.withShake(() => {
        ctx.drawTheme("sea");
        (ctx.data.pearls || []).forEach((c) => { if (c.live) ctx.prop("pearl", c.x, c.y + Math.sin(c.wob * 3) * 6, 9); });
        (ctx.data.jellies || []).forEach((j) => ctx.prop("jelly", j.x, j.y, 16));
        ctx.drawBuddies({ alon: "🐠", dad: "🐡" });
        ctx.drawJuice();
      });
    }
  },

  "critter-ride": {
    title: "Critter Ride",
    emoji: "🦕",
    blurb: "Ride bean beasts down three trails. Jump pits, grab snacks, first finish wins the heat.",
    hintAlon: "Alon: A D lane · W jump",
    hintDad: "Dad: ← → lane · ↑ jump",
    goal: "BEST OF 3",
    hearts: false,
    rounds: 3,
    roundNames: ["Garden", "Grove", "Gorge"],
    setup(ctx) { ctx.resetMatch(); },
    setupRound(ctx, n) {
      const f = ctx.field;
      ctx.data.scroll = 0;
      ctx.data.speed = 190 + n * 25;
      ctx.data.pits = [420, 720, 1040, 1360].slice(0, 2 + n);
      if (n === 3) ctx.data.pits.push(1680);
      ctx.data.snacks = [240, 500, 740, 1000, 1240, 1500];
      ctx.data.ate = new Set();
      ctx.data.finish = 1200 + n * 400;
      ctx.data.dist = { alon: 0, dad: 0 };
      const r = ctx.sizeBuddies();
      ctx.alon.x = f.x + f.w * 0.3; ctx.dad.x = f.x + f.w * 0.62;
      ctx.alon.y = ctx.dad.y = f.y + f.h - Math.max(70, r * 1.35);
    },
    update(ctx, dt) {
      ctx.data.scroll += ctx.data.speed * dt;
      const ground = ctx.field.y + ctx.field.h - 48;
      [ctx.alon, ctx.dad].forEach((p) => {
        const inn = ctx.input(p.id);
        if (p._ground) p._coyote = 0.22;
        else p._coyote = Math.max(0, (p._coyote || 0) - dt);
        if (inn.up) p._buffer = 0.2;
        else p._buffer = Math.max(0, (p._buffer || 0) - dt);
        p.vy += 1700 * dt;
        if (p._buffer > 0 && (p._ground || p._coyote > 0) && !p._jumpLock) {
          p.vy = -680; p._ground = false; p._coyote = 0; p._buffer = 0;
          p._jumpLock = true; ctx.beep(540, 0.06, "square", 0.05); p.squish = 1.2;
        }
        if (!inn.up) p._jumpLock = false;
        p.y += p.vy * dt;
        p.x += inn.ax * 180 * dt;
        p.x = ctx.clamp(p.x, ctx.field.x + 50, ctx.field.x + ctx.field.w - 50);
        p.squish += (1 - (inn.down ? 0.72 : p.squish)) * 10 * dt;
        const worldX = ctx.data.dist[p.id] + 80;
        const inPit = ctx.data.pits.some((pit) => worldX > pit && worldX < pit + 64);
        if (p.y >= ground && !inPit) { p.y = ground; p.vy = 0; p._ground = true; }
        else p._ground = false;
        ctx.data.dist[p.id] += ctx.data.speed * dt;
        ctx.data.snacks.forEach((sx) => {
          const key = p.id + sx;
          if (!ctx.data.ate.has(key) && Math.abs(worldX - sx) < 20 && p.y < ground + 10) {
            ctx.data.ate.add(key); ctx.addScore(p, 1, "+yum"); ctx.chime();
          }
        });
        if (inPit && p.y > ground + 6) {
          ctx.data.dist[p.id] = Math.max(0, ctx.data.dist[p.id] - 110);
          p.y = ground - 24; p.vy = -180; ctx.flash(p.id); ctx.bump(); ctx.punch(0.2);
        }
        if (ctx.data.dist[p.id] >= ctx.data.finish) ctx.winRound(p.id, "The bean beast did it!");
      });
      ctx.setGoal(`${Math.max(ctx.data.dist.alon, ctx.data.dist.dad) | 0}m`);
    },
    draw(ctx) {
      ctx.withShake(() => {
        ctx.drawTheme("jungle");
        const { g, field: f } = ctx;
        g.fillStyle = "#4ade80";
        g.fillRect(f.x, f.y + f.h - 36, f.w, 36);
        const sc = ctx.data.scroll || 0;
        (ctx.data.pits || []).forEach((pit) => {
          const x = f.x + 40 + (pit - sc);
          if (x < f.x - 80 || x > f.x + f.w + 80) return;
          g.fillStyle = "#0c4a6e"; g.fillRect(x, f.y + f.h - 36, 62, 36);
          g.fillStyle = "rgba(15,23,42,.35)";
          g.fillRect(x + 8, f.y + f.h - 52, 46, 16);
        });
        (ctx.data.snacks || []).forEach((sx) => {
          const x = f.x + 40 + (sx - sc);
          if (x > f.x && x < f.x + f.w) ctx.prop("apple", x, f.y + f.h - 70, 12);
        });
        const fx = f.x + 40 + ((ctx.data.finish || 0) - sc);
        if (fx > f.x && fx < f.x + f.w) {
          g.fillStyle = "#92400e"; g.fillRect(fx - 2, f.y + f.h - 86, 5, 50);
          g.fillStyle = "#fbbf24";
          g.beginPath(); g.moveTo(fx + 3, f.y + f.h - 86); g.lineTo(fx + 28, f.y + f.h - 74); g.lineTo(fx + 3, f.y + f.h - 62); g.fill();
        }
        ctx.drawBuddies({ alon: "🦕", dad: "🐢" });
        ctx.drawJuice();
      });
    }
  }
};
