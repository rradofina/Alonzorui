function kickoff(ctx, dir) {
  const f = ctx.field;
  ctx.data.ball = {
    x: f.x + f.w / 2, y: f.y + f.h / 2,
    vx: (dir || (Math.random() < 0.5 ? 1 : -1)) * (180 + ctx.round * 20),
    vy: (Math.random() - 0.5) * 140,
    r: 16
  };
}

export const games = {
  "kart-cruise": {
    title: "Kart Cruise",
    emoji: "🏎️",
    blurb: "Three sunny cups! Steer the oval, grab pillows, first to 2 laps wins the heat.",
    hintAlon: "Alon: A D lane · W gas",
    hintDad: "Dad: ← → lane · ↑ gas",
    goal: "BEST OF 3",
    hearts: false,
    rounds: 3,
    roundNames: ["Sunday", "Turbo", "Grand"],
    setup(ctx) { ctx.resetMatch(); },
    setupRound(ctx, n) {
      const f = ctx.field;
      ctx.data.cx = f.x + f.w / 2;
      ctx.data.cy = f.y + f.h / 2;
      ctx.data.rx = f.w * (0.34 + n * 0.01);
      ctx.data.ry = f.h * 0.3;
      ctx.alon.a = 0.05; ctx.dad.a = 0.5;
      ctx.alon.lane = 0; ctx.dad.lane = 0;
      ctx.data.laps = { alon: 0, dad: 0 };
      ctx.data.boost = { alon: 0, dad: 0 };
      ctx.data.item = { a: Math.PI * 0.6, lane: 1, live: true };
    },
    update(ctx, dt) {
      [ctx.alon, ctx.dad].forEach((p) => {
        const inn = ctx.input(p.id);
        ctx.data.boost[p.id] = Math.max(0, ctx.data.boost[p.id] - dt);
        if (ctx.pressed(p.id, "left")) p.lane = Math.max(-1, (p.lane || 0) - 1);
        if (ctx.pressed(p.id, "right")) p.lane = Math.min(1, (p.lane || 0) + 1);
        const gas = 1.85 + ctx.round * 0.15 + (inn.up ? 0.7 : 0) - (inn.down ? 0.8 : 0) + (ctx.data.boost[p.id] > 0 ? 0.9 : 0) + ((p.lane || 0) < 0 ? 0.22 : 0);
        p.a += Math.max(0.6, gas) * dt;
        if (p.a >= Math.PI * 2) {
          p.a -= Math.PI * 2;
          ctx.data.laps[p.id] += 1;
          ctx.addScore(p, 1, "LAP");
          ctx.starChime();
          if (ctx.data.laps[p.id] >= 2) ctx.winRound(p.id, "Kart parade!");
        }
        const rr = ctx.data.rx + (p.lane || 0) * 22;
        const ry = ctx.data.ry + (p.lane || 0) * 14;
        p.x = ctx.data.cx + Math.cos(p.a) * rr;
        p.y = ctx.data.cy + Math.sin(p.a) * ry;
        if (ctx.data.item.live) {
          const ir = ctx.data.rx + (ctx.data.item.lane || 0) * 22;
          const iyR = ctx.data.ry + (ctx.data.item.lane || 0) * 14;
          const ix = ctx.data.cx + Math.cos(ctx.data.item.a) * ir;
          const iy = ctx.data.cy + Math.sin(ctx.data.item.a) * iyR;
          if (ctx.dist(p.x, p.y, ix, iy) < 28) {
            ctx.data.item.live = false;
            ctx.data.boost[p.id] = 1.4;
            ctx.pop(); ctx.float(p.x, p.y, "ZOOM", p.color);
          }
        }
      });
      if (!ctx.data.item.live && Math.random() < 0.008) {
        ctx.data.item = { a: Math.random() * Math.PI * 2, lane: ((Math.random() * 3) | 0) - 1, live: true };
      }
      ctx.setGoal(`laps ${Math.max(ctx.data.laps.alon, ctx.data.laps.dad)}/2`);
    },
    draw(ctx) {
      ctx.withShake(() => {
        ctx.drawTheme("track");
        if (ctx.data.cx == null) return;
        const { g } = ctx;
        const { cx, cy, rx, ry } = ctx.data;
        g.fillStyle = "#4ade80";
        g.beginPath(); g.ellipse(cx, cy, rx - 28, ry - 22, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = "#86efac";
        g.beginPath(); g.ellipse(cx, cy, rx - 48, ry - 36, 0, 0, Math.PI * 2); g.fill();
        g.strokeStyle = "#fff"; g.lineWidth = 36;
        g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.stroke();
        g.strokeStyle = "#f97316"; g.lineWidth = 4; g.setLineDash([12, 10]);
        g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.stroke();
        g.setLineDash([]);
        g.fillStyle = "#fff"; g.fillRect(cx + rx - 8, cy - 16, 16, 32);
        g.fillStyle = "#facc15";
        g.fillRect(cx + rx - 18, cy - 28, 8, 12);
        g.fillRect(cx + rx + 10, cy - 28, 8, 12);
        if (ctx.data.item && ctx.data.item.live) {
          const ir = rx + (ctx.data.item.lane || 0) * 22;
          const iyR = ry + (ctx.data.item.lane || 0) * 14;
          ctx.prop("star", cx + Math.cos(ctx.data.item.a) * ir, cy + Math.sin(ctx.data.item.a) * iyR, 12);
        }
        ctx.drawBuddies({ alon: "🚗", dad: "🚙" });
        ctx.drawJuice();
      });
    }
  },

  "sled-zoom": {
    title: "Sled Zoom",
    emoji: "🛷",
    blurb: "Three snow hills. Jump flakes, sip cocoa — first to 8 sips wins the heat.",
    hintAlon: "Alon: A D slide · W hop",
    hintDad: "Dad: ← → slide · ↑ hop",
    goal: "BEST OF 3",
    hearts: false,
    rounds: 3,
    roundNames: ["Hill", "Forest", "Alpine"],
    setup(ctx) { ctx.resetMatch(); },
    setupRound(ctx, n) {
      ctx.data.items = [];
      ctx.data.need = 6 + n * 2;
      ctx.data.got = { alon: 0, dad: 0 };
      ctx.data.speed = 240 + n * 30;
      ctx.place(0.3, 0.62, 0.62);
    },
    update(ctx, dt) {
      if (Math.random() < 0.05 + ctx.round * 0.01) {
        ctx.data.items.push({
          x: ctx.field.x + ctx.field.w + 12,
          y: ctx.field.y + ctx.field.h * (Math.random() < 0.45 ? 0.48 : 0.7),
          kind: Math.random() < 0.62 ? "cocoa" : "flake",
          live: true
        });
      }
      ctx.data.items.forEach((it) => { it.x -= ctx.data.speed * dt; if (it.x < ctx.field.x - 20) it.live = false; });
      [ctx.alon, ctx.dad].forEach((p) => {
        const inn = ctx.input(p.id);
        const base = ctx.field.y + ctx.field.h * 0.62;
        p.want = inn.up ? base - 78 : inn.down ? base + 48 : base;
        p.y += (p.want - p.y) * Math.min(1, 9 * dt);
        p.x += inn.ax * 260 * dt;
        p.x = ctx.clamp(p.x, ctx.field.x + 40, ctx.field.x + ctx.field.w - 40);
        ctx.data.items.forEach((it) => {
          if (!it.live) return;
          if (Math.abs(it.x - p.x) < 30 && Math.abs(it.y - p.y) < 32) {
            it.live = false;
            if (it.kind === "cocoa") {
              ctx.data.got[p.id] += 1; ctx.addScore(p, 1, "+sip"); ctx.chime();
              if (ctx.data.got[p.id] >= ctx.data.need) ctx.winRound(p.id, "Cocoa champ!");
            } else { ctx.flash(p.id); ctx.bump(); ctx.punch(0.12); }
          }
        });
      });
      ctx.data.items = ctx.data.items.filter((i) => i.live);
      ctx.setGoal(`${Math.max(ctx.data.got.alon, ctx.data.got.dad)}/${ctx.data.need}`);
    },
    draw(ctx) {
      ctx.withShake(() => {
        ctx.drawTheme("snow");
        ctx.g.fillStyle = "#fff";
        ctx.g.fillRect(ctx.field.x, ctx.field.y + ctx.field.h * 0.78, ctx.field.w, ctx.field.h * 0.22);
        (ctx.data.items || []).forEach((it) => ctx.prop(it.kind === "cocoa" ? "cocoa" : "flake", it.x, it.y, 13));
        ctx.drawBuddies({ alon: "🛷", dad: "🎿" });
        ctx.drawJuice();
      });
    }
  },

  "sunny-soccer": {
    title: "Sunny Soccer",
    emoji: "⚽",
    blurb: "Three sunny periods. Alon left goal, Dad right. First to 2 goals wins the period.",
    hintAlon: "Alon: WASD kick",
    hintDad: "Dad: arrows kick",
    goal: "BEST OF 3",
    hearts: false,
    rounds: 3,
    roundNames: ["1st", "2nd", "3rd"],
    setup(ctx) { ctx.resetMatch(); },
    setupRound(ctx, n) {
      ctx.data.goals = { alon: 0, dad: 0 };
      ctx.data.need = 2;
      kickoff(ctx, n % 2 ? 1 : -1);
      ctx.place(0.18, 0.82, 0.5);
    },
    update(ctx, dt) {
      [ctx.alon, ctx.dad].forEach((p) => ctx.moveTopDown(p, 270, dt));
      const b = ctx.data.ball;
      [ctx.alon, ctx.dad].forEach((p) => {
        if (ctx.dist(p.x, p.y, b.x, b.y) < p.r + b.r) {
          const dx = b.x - p.x, dy = b.y - p.y, m = Math.hypot(dx, dy) || 1;
          const power = 340 + Math.hypot(p.vx, p.vy) * 0.4;
          b.vx = (dx / m) * power; b.vy = (dy / m) * power;
          ctx.beep(300, 0.05, "sine", 0.05); p.squish = 1.15;
        }
      });
      b.x += b.vx * dt; b.y += b.vy * dt;
      b.vx *= Math.pow(0.46, dt); b.vy *= Math.pow(0.46, dt);
      const f = ctx.field;
      if (b.y < f.y + b.r || b.y > f.y + f.h - b.r) { b.vy *= -1; b.y = ctx.clamp(b.y, f.y + b.r, f.y + f.h - b.r); }
      const goalH = f.h * 0.38, gy0 = f.y + (f.h - goalH) / 2;
      if (b.x < f.x + 16 && b.y > gy0 && b.y < gy0 + goalH) {
        ctx.data.goals.dad += 1; ctx.addScore(ctx.dad, 1, "GOAL"); ctx.goalHorn(); ctx.punch(0.35);
        if (ctx.data.goals.dad >= ctx.data.need) ctx.winRound("dad", "Goal party!");
        else kickoff(ctx, 1);
      } else if (b.x > f.x + f.w - 16 && b.y > gy0 && b.y < gy0 + goalH) {
        ctx.data.goals.alon += 1; ctx.addScore(ctx.alon, 1, "GOAL"); ctx.goalHorn(); ctx.punch(0.35);
        if (ctx.data.goals.alon >= ctx.data.need) ctx.winRound("alon", "Goal party!");
        else kickoff(ctx, -1);
      }
      if (b.x < f.x + b.r) { b.x = f.x + b.r; b.vx *= -0.55; }
      if (b.x > f.x + f.w - b.r) { b.x = f.x + f.w - b.r; b.vx *= -0.55; }
      ctx.setGoal(`${ctx.data.goals.alon} – ${ctx.data.goals.dad}`);
    },
    draw(ctx) {
      ctx.withShake(() => {
        ctx.drawTheme("grass");
        const { g, field: f } = ctx;
        const goalH = f.h * 0.38, gy0 = f.y + (f.h - goalH) / 2;
        g.strokeStyle = "rgba(255,255,255,.7)"; g.lineWidth = 3;
        g.strokeRect(f.x + f.w / 2 - 1, f.y, 2, f.h);
        g.fillStyle = "#fb7185"; g.fillRect(f.x, gy0, 16, goalH);
        g.fillStyle = "#38bdf8"; g.fillRect(f.x + f.w - 16, gy0, 16, goalH);
        g.strokeStyle = "rgba(255,255,255,.8)"; g.lineWidth = 4;
        g.strokeRect(f.x, gy0, 16, goalH);
        g.strokeRect(f.x + f.w - 16, gy0, 16, goalH);
        const b = ctx.data.ball;
        if (b) ctx.prop("soccer", b.x, b.y, 14);
        ctx.drawBuddies({ alon: "🐥", dad: "🐧" });
        ctx.drawJuice();
      });
    }
  },

  "beach-volley": {
    title: "Beach Volley",
    emoji: "🏐",
    blurb: "Three sandy sets. Bump over the net — first to 3 points takes the set.",
    hintAlon: "Alon: WASD bump",
    hintDad: "Dad: arrows bump",
    goal: "BEST OF 3",
    hearts: false,
    rounds: 3,
    roundNames: ["Set 1", "Set 2", "Set 3"],
    setup(ctx) { ctx.resetMatch(); },
    setupRound(ctx, n) {
      ctx.data.pts = { alon: 0, dad: 0 };
      resetVolley(ctx, 1);
    },
    update(ctx, dt) {
      const f = ctx.field, netX = f.x + f.w / 2;
      [ctx.alon, ctx.dad].forEach((p) => {
        const half = p.id === "alon" ? { x: f.x, y: f.y, w: f.w / 2 - 10, h: f.h } : { x: netX + 10, y: f.y, w: f.w / 2 - 10, h: f.h };
        ctx.moveTopDown(p, 250, dt, half);
      });
      const b = ctx.data.ball;
      b.vy += (720 + ctx.round * 40) * dt;
      b.x += b.vx * dt; b.y += b.vy * dt;
      [ctx.alon, ctx.dad].forEach((p) => {
        if (ctx.dist(p.x, p.y, b.x, b.y) < p.r + b.r) {
          b.vy = -440; b.vx = (b.x - p.x) * 8; ctx.beep(400, 0.05, "triangle", 0.05); p.squish = 1.12;
        }
      });
      if (b.x > netX - 8 && b.x < netX + 8 && b.y > f.y + f.h * 0.32) { b.vx *= -1; b.x += b.vx * dt; }
      if (b.y > f.y + f.h - 8) {
        const scorer = b.x < netX ? "dad" : "alon";
        ctx.data.pts[scorer] += 1;
        ctx.addScore(scorer === "alon" ? ctx.alon : ctx.dad, 1, "POINT");
        ctx.chime();
        if (ctx.data.pts[scorer] >= 3) ctx.winRound(scorer, "Sandy smash!");
        else resetVolley(ctx, b.x < netX ? 1 : -1);
      }
      if (b.x < f.x) { b.x = f.x + 8; b.vx *= -1; }
      if (b.x > f.x + f.w) { b.x = f.x + f.w - 8; b.vx *= -1; }
      ctx.setGoal(`${ctx.data.pts.alon} – ${ctx.data.pts.dad}`);
    },
    draw(ctx) {
      ctx.withShake(() => {
        ctx.drawTheme("sand");
        ctx.g.fillStyle = "#fff";
        ctx.g.fillRect(ctx.field.x + ctx.field.w / 2 - 5, ctx.field.y + ctx.field.h * 0.32, 10, ctx.field.h * 0.68);
        ctx.g.fillStyle = "#f97316";
        ctx.g.fillRect(ctx.field.x + ctx.field.w / 2 - 14, ctx.field.y + ctx.field.h * 0.3, 28, 10);
        if (ctx.data.ball) ctx.prop("volley", ctx.data.ball.x, ctx.data.ball.y, 14);
        ctx.drawBuddies({ alon: "🐥", dad: "🐧" });
        ctx.drawJuice();
      });
    }
  },

  "paddy-pong": {
    title: "Paddy Pong",
    emoji: "🏓",
    blurb: "Three paddle sets. Rallies get zippy. First to 4 points wins the set.",
    hintAlon: "Alon: W S paddle",
    hintDad: "Dad: ↑ ↓ paddle",
    goal: "BEST OF 3",
    hearts: false,
    rounds: 3,
    roundNames: ["Ping", "Pong", "Rally"],
    setup(ctx) { ctx.resetMatch(); },
    setupRound(ctx, n) {
      ctx.data.pts = { alon: 0, dad: 0 };
      resetPong(ctx, 1);
    },
    update(ctx, dt) {
      const f = ctx.field;
      [ctx.alon, ctx.dad].forEach((p) => {
        p.y += ctx.input(p.id).ay * 340 * dt;
        p.y = ctx.clamp(p.y, f.y + 46, f.y + f.h - 46);
        p.x = p.id === "alon" ? f.x + 30 : f.x + f.w - 30;
      });
      const b = ctx.data.ball;
      b.x += b.vx * dt; b.y += b.vy * dt;
      if (b.y < f.y + 12 || b.y > f.y + f.h - 12) { b.vy *= -1; ctx.beep(280, 0.03, "sine", 0.03); }
      [ctx.alon, ctx.dad].forEach((p) => {
        if (Math.abs(b.x - p.x) < 18 && Math.abs(b.y - p.y) < 50) {
          b.vx = Math.abs(b.vx) * (p.id === "alon" ? 1 : -1) * 1.06;
          b.vy = (b.y - p.y) * 7;
          ctx.pop(); p.squish = 1.12;
        }
      });
      if (b.x < f.x) {
        ctx.data.pts.dad += 1; ctx.addScore(ctx.dad, 1, "POINT");
        if (ctx.data.pts.dad >= 4) ctx.winRound("dad", "Paddle ace!");
        else resetPong(ctx, 1);
      }
      if (b.x > f.x + f.w) {
        ctx.data.pts.alon += 1; ctx.addScore(ctx.alon, 1, "POINT");
        if (ctx.data.pts.alon >= 4) ctx.winRound("alon", "Paddle ace!");
        else resetPong(ctx, -1);
      }
      ctx.setGoal(`${ctx.data.pts.alon} – ${ctx.data.pts.dad}`);
    },
    draw(ctx) {
      ctx.withShake(() => {
        ctx.drawTheme("pong");
        [ctx.alon, ctx.dad].forEach((p) => {
          ctx.g.fillStyle = p.color;
          ctx.g.beginPath(); ctx.g.roundRect(p.x - 9, p.y - 46, 18, 92, 8); ctx.g.fill();
          ctx.head(p.x + (p.id === "alon" ? 22 : -22), p.y, p.id, 16);
        });
        const b = ctx.data.ball;
        if (b) ctx.prop("ball", b.x, b.y, 11);
        ctx.drawJuice();
      });
    }
  },

  "air-puck": {
    title: "Air Puck",
    emoji: "🏒",
    blurb: "Three zippy periods. Bumpers bounce. First to 3 goals wins the period.",
    hintAlon: "Alon: WASD glide",
    hintDad: "Dad: arrows glide",
    goal: "BEST OF 3",
    hearts: false,
    rounds: 3,
    roundNames: ["P1", "P2", "P3"],
    setup(ctx) { ctx.resetMatch(); },
    setupRound(ctx, n) {
      const f = ctx.field;
      ctx.data.goals = { alon: 0, dad: 0 };
      ctx.data.ball = { x: f.x + f.w / 2, y: f.y + f.h / 2, vx: 210, vy: 90, r: 14 };
      ctx.data.bumps = [
        { x: f.x + f.w * 0.5, y: f.y + f.h * 0.28, r: 18 },
        { x: f.x + f.w * 0.5, y: f.y + f.h * 0.72, r: 18 }
      ];
      ctx.place(0.2, 0.8, 0.5);
    },
    update(ctx, dt) {
      const f = ctx.field;
      [ctx.alon, ctx.dad].forEach((p) => {
        const half = p.id === "alon" ? { x: f.x, y: f.y, w: f.w / 2, h: f.h } : { x: f.x + f.w / 2, y: f.y, w: f.w / 2, h: f.h };
        ctx.moveTopDown(p, 310, dt, half);
      });
      const b = ctx.data.ball;
      b.x += b.vx * dt; b.y += b.vy * dt;
      if (b.y < f.y + b.r || b.y > f.y + f.h - b.r) b.vy *= -1;
      ctx.data.bumps.forEach((u) => {
        if (ctx.dist(b.x, b.y, u.x, u.y) < u.r + b.r) {
          const dx = b.x - u.x, dy = b.y - u.y, m = Math.hypot(dx, dy) || 1;
          b.vx = dx / m * 360; b.vy = dy / m * 360; ctx.beep(200, 0.04, "sine", 0.04);
        }
      });
      [ctx.alon, ctx.dad].forEach((p) => {
        if (ctx.dist(p.x, p.y, b.x, b.y) < p.r + b.r) {
          const dx = b.x - p.x, dy = b.y - p.y, m = Math.hypot(dx, dy) || 1;
          b.vx = dx / m * 400; b.vy = dy / m * 400;
        }
      });
      const gh = f.h * 0.3, gy = f.y + (f.h - gh) / 2;
      if (b.x < f.x + 8 && b.y > gy && b.y < gy + gh) {
        ctx.data.goals.dad += 1; ctx.addScore(ctx.dad, 1, "GOAL");
        if (ctx.data.goals.dad >= 3) ctx.winRound("dad", "Table ace!");
        else resetPuck(ctx);
      } else if (b.x > f.x + f.w - 8 && b.y > gy && b.y < gy + gh) {
        ctx.data.goals.alon += 1; ctx.addScore(ctx.alon, 1, "GOAL");
        if (ctx.data.goals.alon >= 3) ctx.winRound("alon", "Table ace!");
        else resetPuck(ctx);
      } else {
        if (b.x < f.x + b.r) { b.x = f.x + b.r; b.vx *= -1; }
        if (b.x > f.x + f.w - b.r) { b.x = f.x + f.w - b.r; b.vx *= -1; }
      }
      ctx.setGoal(`${ctx.data.goals.alon} – ${ctx.data.goals.dad}`);
    },
    draw(ctx) {
      ctx.withShake(() => {
        ctx.drawTheme("ice rink");
        const { g, field: f } = ctx;
        const gh = f.h * 0.3, gy = f.y + (f.h - gh) / 2;
        g.fillStyle = "#fb7185"; g.fillRect(f.x, gy, 12, gh);
        g.fillStyle = "#0284c7"; g.fillRect(f.x + f.w - 12, gy, 12, gh);
        (ctx.data.bumps || []).forEach((u) => { g.fillStyle = "#fbbf24"; g.beginPath(); g.arc(u.x, u.y, u.r, 0, Math.PI * 2); g.fill(); g.fillStyle = "#fff"; g.beginPath(); g.arc(u.x - 4, u.y - 4, 5, 0, Math.PI * 2); g.fill(); });
        if (ctx.data.ball) ctx.prop("puck", ctx.data.ball.x, ctx.data.ball.y, ctx.data.ball.r);
        ctx.drawBuddies({ alon: "🔴", dad: "🔵" });
        ctx.drawJuice();
      });
    }
  },

  "tug-stars": {
    title: "Tug Stars",
    emoji: "⭐",
    blurb: "Three tugs! Hold toward your side. Power pulses make it juicy. First to pull it home wins the heat.",
    hintAlon: "Alon: hold A",
    hintDad: "Dad: hold →",
    goal: "BEST OF 3",
    hearts: false,
    rounds: 3,
    roundNames: ["Twinkle", "Pull", "Yank"],
    setup(ctx) { ctx.resetMatch(); },
    setupRound(ctx, n) {
      ctx.data.x = 0.5;
      ctx.data.pulse = 0;
      ctx.place(0.12, 0.88, 0.5);
    },
    update(ctx, dt) {
      const a = ctx.input("alon"), d = ctx.input("dad");
      ctx.data.pulse = 0.85 + Math.sin(ctx.t * (3 + ctx.round)) * 0.2;
      const pull = ((d.right || d.ax > 0.2 ? 1 : 0) - (a.left || a.ax < -0.2 ? 1 : 0)) * 0.26 * ctx.data.pulse;
      ctx.data.x = ctx.clamp(ctx.data.x + (pull + (d.ax - a.ax) * 0.1) * dt, 0.08, 0.92);
      const f = ctx.field;
      if (ctx.data.x <= 0.12) ctx.winRound("alon", "Star tug!");
      if (ctx.data.x >= 0.88) ctx.winRound("dad", "Star tug!");
      ctx.alon.x = f.x + 56; ctx.dad.x = f.x + f.w - 56;
    },
    draw(ctx) {
      ctx.withShake(() => {
        ctx.drawTheme("gold");
        const { g, field: f } = ctx;
        const midY = f.y + f.h / 2;
        g.strokeStyle = "#fde68a"; g.lineWidth = 14;
        g.beginPath(); g.moveTo(f.x + 56, midY); g.lineTo(f.x + f.w - 56, midY); g.stroke();
        g.strokeStyle = "#f59e0b"; g.lineWidth = 4; g.setLineDash([10, 8]);
        g.beginPath(); g.moveTo(f.x + 56, midY); g.lineTo(f.x + f.w - 56, midY); g.stroke();
        g.setLineDash([]);
        const pullA = (ctx.input("alon").left || ctx.input("alon").ax < -0.2) ? 1 : 0.25;
        const pullD = (ctx.input("dad").right || ctx.input("dad").ax > 0.2) ? 1 : 0.25;
        g.fillStyle = "rgba(251,113,133,.35)"; g.fillRect(f.x + 20, midY + 36, 90, 12);
        g.fillStyle = "#fb7185"; g.fillRect(f.x + 20, midY + 36, 90 * pullA, 12);
        g.fillStyle = "rgba(56,189,248,.35)"; g.fillRect(f.x + f.w - 110, midY + 36, 90, 12);
        g.fillStyle = "#38bdf8"; g.fillRect(f.x + f.w - 20 - 90 * pullD, midY + 36, 90 * pullD, 12);
        const x = f.x + f.w * (ctx.data.x || 0.5);
        ctx.prop("star", x, midY, 22);
        ctx.drawBuddies({ alon: "🐥", dad: "🐧" });
        ctx.drawJuice();
      });
    }
  },

  "hot-spud": {
    title: "Hot Spud",
    emoji: "🥔",
    blurb: "Three hotter potatoes! Grab, bump to pass. Don't hold it when it pops.",
    hintAlon: "Alon: WASD run",
    hintDad: "Dad: arrows run",
    goal: "BEST OF 3",
    lives: 3,
    rounds: 3,
    roundNames: ["Warm", "Toasty", "Sizzle"],
    setup(ctx) { ctx.resetMatch(); },
    setupRound(ctx, n) {
      ctx.data.hold = null;
      ctx.data.timer = 3.6 - n * 0.4;
      ctx.data.max = ctx.data.timer;
      ctx.data.spud = { x: ctx.field.x + ctx.field.w / 2, y: ctx.field.y + ctx.field.h / 2, r: 16 };
      ctx.alon.hearts = ctx.dad.hearts = 3;
      ctx.alon.out = ctx.dad.out = false;
      ctx.place(0.25, 0.75, 0.5);
    },
    update(ctx, dt) {
      [ctx.alon, ctx.dad].forEach((p) => { if (!p.out) ctx.moveTopDown(p, 260, dt); });
      const s = ctx.data.spud;
      if (!ctx.data.hold) {
        [ctx.alon, ctx.dad].forEach((p) => {
          if (!p.out && ctx.dist(p.x, p.y, s.x, s.y) < 30) {
            ctx.data.hold = p.id; ctx.beep(360, 0.06, "sine", 0.06);
          }
        });
      } else {
        const holder = ctx.data.hold === "alon" ? ctx.alon : ctx.dad;
        s.x = holder.x; s.y = holder.y - 30;
        const other = holder.id === "alon" ? ctx.dad : ctx.alon;
        if (!other.out && ctx.dist(holder.x, holder.y, other.x, other.y) < 48) {
          ctx.data.hold = other.id; ctx.chime(); ctx.float(holder.x, holder.y, "PASS", "#fde047");
        }
        ctx.data.timer -= dt;
        ctx.setGoal(ctx.data.timer.toFixed(1) + "s");
        if (ctx.data.timer <= 0) {
          ctx.hurt(holder); ctx.addScore(other, 1, "POP"); ctx.punch(0.3);
          ctx.data.hold = null; ctx.data.timer = ctx.data.max;
          s.x = ctx.field.x + ctx.field.w / 2; s.y = ctx.field.y + ctx.field.h / 2;
          if (holder.out) ctx.winRound(other.id, "Hot potato!");
        }
      }
      if (ctx.alon.out && !ctx.dad.out) ctx.winRound("dad", "Hot potato!");
      if (ctx.dad.out && !ctx.alon.out) ctx.winRound("alon", "Hot potato!");
    },
    draw(ctx) {
      ctx.withShake(() => {
        ctx.drawTheme("potato");
        if (ctx.data.spud) {
          const s = ctx.data.spud;
          const frac = ctx.data.max ? ctx.data.timer / ctx.data.max : 1;
          ctx.g.strokeStyle = frac < 0.3 ? "#fb7185" : "#fde047";
          ctx.g.lineWidth = 5;
          ctx.g.beginPath(); ctx.g.arc(s.x, s.y, 24, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0, frac)); ctx.g.stroke();
          ctx.prop("potato", s.x, s.y, 16);
        }
        ctx.drawBuddies({ alon: "🐥", dad: "🐧" });
        ctx.drawJuice();
      });
    }
  }
};

function resetVolley(ctx, dir) {
  const f = ctx.field;
  ctx.data.ball = { x: f.x + f.w / 2 + dir * 40, y: f.y + 50, vx: dir * 90, vy: 30, r: 14 };
  ctx.alon.x = f.x + f.w * 0.22; ctx.dad.x = f.x + f.w * 0.78;
  ctx.alon.y = ctx.dad.y = f.y + f.h * 0.7;
}
function resetPong(ctx, dir) {
  const f = ctx.field;
  ctx.data.ball = { x: f.x + f.w / 2, y: f.y + f.h / 2, vx: (220 + ctx.round * 20) * dir, vy: 150, r: 10 };
}
function resetPuck(ctx) {
  const f = ctx.field;
  ctx.data.ball = { x: f.x + f.w / 2, y: f.y + f.h / 2, vx: (Math.random() < 0.5 ? 1 : -1) * 220, vy: 90, r: 14 };
  ctx.chime();
}
