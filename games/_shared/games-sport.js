function drawCourt(ctx, color) {
  const { g } = ctx;
  const bg = g.createLinearGradient(0, 0, 0, ctx.h);
  bg.addColorStop(0, color[0]); bg.addColorStop(1, color[1]);
  g.fillStyle = bg; g.fillRect(0, 0, ctx.w, ctx.h);
  ctx.fillField("rgba(255,255,255,.2)");
}

export const games = {
  "kart-cruise": {
    title: "Kart Cruise",
    emoji: "🏎️",
    blurb: "Zoom the sunny oval. First kart to finish 2 laps wins!",
    hintAlon: "Alon: WASD steer",
    hintDad: "Dad: arrows steer",
    goal: "2 LAPS",
    hearts: false,
    setup(ctx) {
      const f = ctx.field;
      ctx.data.cx = f.x + f.w / 2;
      ctx.data.cy = f.y + f.h / 2;
      ctx.data.rx = f.w * 0.36;
      ctx.data.ry = f.h * 0.32;
      ctx.alon.a = 0.08; ctx.dad.a = 0.42;
      ctx.data.laps = { alon: 0, dad: 0 };
    },
    update(ctx, dt) {
      [ctx.alon, ctx.dad].forEach((p) => {
        const inn = ctx.input(p.id);
        const speed = 2.05 + (inn.up ? 0.7 : 0) - (inn.down ? 0.7 : 0);
        p.a += Math.max(0.7, speed) * dt;
        if (p.a >= Math.PI * 2) {
          p.a -= Math.PI * 2;
          ctx.data.laps[p.id] += 1;
          ctx.addScore(p, 1);
          ctx.chime();
        }
        p.x = ctx.data.cx + Math.cos(p.a) * ctx.data.rx;
        p.y = ctx.data.cy + Math.sin(p.a) * ctx.data.ry;
        if (ctx.data.laps[p.id] >= 2) ctx.end(p.id, `${p.name} wins!`, "Kart parade!", "🏎️");
      });
      ctx.setGoal(`${Math.max(ctx.data.laps.alon, ctx.data.laps.dad)} / 2`);
    },
    draw(ctx) {
      drawCourt(ctx, ["#fdba74", "#facc15"]);
      const { g } = ctx;
      const { cx, cy, rx, ry } = ctx.data;
      g.strokeStyle = "#fff";
      g.lineWidth = 34;
      g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = "#f97316";
      g.lineWidth = 4;
      g.setLineDash([12, 10]);
      g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.stroke();
      g.setLineDash([]);
      g.fillStyle = "#fff";
      g.fillRect(cx + rx - 8, cy - 18, 16, 36);
      ctx.drawBuddies({ alon: "🚗", dad: "🚙" });
      ctx.drawSparks(0.016);
    }
  },

  "sled-zoom": {
    title: "Sled Zoom",
    emoji: "🛷",
    blurb: "Slide the hill! Jump flakes, grab cocoa. First to 10 sips wins.",
    hintAlon: "Alon: W jump · S duck",
    hintDad: "Dad: ↑ jump · ↓ duck",
    goal: "10 COCOA",
    hearts: false,
    setup(ctx) {
      ctx.data.items = [];
      ctx.data.scroll = 0;
      const f = ctx.field;
      ctx.alon.x = f.x + f.w * 0.3;
      ctx.dad.x = f.x + f.w * 0.62;
      ctx.alon.y = ctx.dad.y = f.y + f.h * 0.62;
    },
    update(ctx, dt) {
      ctx.data.scroll += dt;
      if (Math.random() < 0.04) {
        ctx.data.items.push({
          x: ctx.field.x + ctx.field.w + 10,
          y: ctx.field.y + ctx.field.h * (Math.random() < 0.5 ? 0.5 : 0.72),
          kind: Math.random() < 0.65 ? "cocoa" : "flake",
          r: 16, live: true
        });
      }
      ctx.data.items.forEach((it) => { it.x -= 260 * dt; if (it.x < ctx.field.x - 20) it.live = false; });
      [ctx.alon, ctx.dad].forEach((p) => {
        const inn = ctx.input(p.id);
        const base = ctx.field.y + ctx.field.h * 0.62;
        p.want = inn.up ? base - 70 : inn.down ? base + 50 : base;
        p.y += (p.want - p.y) * Math.min(1, 8 * dt);
        ctx.data.items.forEach((it) => {
          if (!it.live) return;
          if (Math.abs(it.x - p.x) < 28 && Math.abs(it.y - p.y) < 30) {
            it.live = false;
            if (it.kind === "cocoa") { ctx.addScore(p, 1); ctx.chime(); }
            else { ctx.flash(p.id); ctx.bump(); }
            ctx.burst(it.x, it.y, p.color, 10);
          }
        });
      });
      ctx.data.items = ctx.data.items.filter((i) => i.live);
      ctx.maybeFirstTo(10);
    },
    draw(ctx) {
      drawCourt(ctx, ["#e0f2fe", "#93c5fd"]);
      const { g, field: f } = ctx;
      g.fillStyle = "#fff";
      g.fillRect(f.x, f.y + f.h * 0.78, f.w, f.h * 0.22);
      (ctx.data.items || []).forEach((it) => {
        ctx.icon(it.x, it.y, it.kind === "cocoa" ? "🍫" : "❄️", it.kind === "cocoa" ? "#b45309" : "#e0f2fe", 14);
      });
      ctx.drawBuddies({ alon: "🛷", dad: "🎿" });
      ctx.drawSparks(0.016);
    }
  },

  "sunny-soccer": {
    title: "Sunny Soccer",
    emoji: "⚽",
    blurb: "Alon is the left goal, Dad the right. First to 3 sunny goals!",
    hintAlon: "Alon: WASD kick",
    hintDad: "Dad: arrows kick",
    goal: "FIRST TO 3",
    hearts: false,
    setup(ctx) {
      const f = ctx.field;
      ctx.data.ball = { x: f.x + f.w / 2, y: f.y + f.h / 2, vx: 0, vy: 0, r: 16 };
      ctx.alon.x = f.x + 70; ctx.dad.x = f.x + f.w - 70;
      ctx.alon.y = ctx.dad.y = f.y + f.h / 2;
    },
    update(ctx, dt) {
      [ctx.alon, ctx.dad].forEach((p) => ctx.moveTopDown(p, 260, dt));
      const b = ctx.data.ball;
      [ctx.alon, ctx.dad].forEach((p) => {
        if (ctx.dist(p.x, p.y, b.x, b.y) < p.r + b.r) {
          const dx = b.x - p.x, dy = b.y - p.y, m = Math.hypot(dx, dy) || 1;
          b.vx = (dx / m) * 320 + p.vx * 0.4;
          b.vy = (dy / m) * 320 + p.vy * 0.4;
          ctx.beep(300, 0.05, "sine", 0.05);
        }
      });
      b.x += b.vx * dt; b.y += b.vy * dt;
      b.vx *= Math.pow(0.5, dt); b.vy *= Math.pow(0.5, dt);
      const f = ctx.field;
      if (b.y < f.y + b.r || b.y > f.y + f.h - b.r) { b.vy *= -1; b.y = ctx.clamp(b.y, f.y + b.r, f.y + f.h - b.r); }
      const goalH = f.h * 0.36;
      const gy0 = f.y + (f.h - goalH) / 2;
      if (b.x < f.x + 18 && b.y > gy0 && b.y < gy0 + goalH) {
        ctx.addScore(ctx.dad, 1); ctx.starChime(); resetBall(ctx, 1);
      } else if (b.x > f.x + f.w - 18 && b.y > gy0 && b.y < gy0 + goalH) {
        ctx.addScore(ctx.alon, 1); ctx.starChime(); resetBall(ctx, -1);
      }
      if (b.x < f.x + b.r) { b.x = f.x + b.r; b.vx *= -0.6; }
      if (b.x > f.x + f.w - b.r) { b.x = f.x + f.w - b.r; b.vx *= -0.6; }
      ctx.maybeFirstTo(3);
    },
    draw(ctx) {
      drawCourt(ctx, ["#4ade80", "#86efac"]);
      const { g, field: f } = ctx;
      const goalH = f.h * 0.36;
      const gy0 = f.y + (f.h - goalH) / 2;
      g.fillStyle = "#fb7185"; g.fillRect(f.x, gy0, 14, goalH);
      g.fillStyle = "#38bdf8"; g.fillRect(f.x + f.w - 14, gy0, 14, goalH);
      const b = ctx.data.ball;
      if (b) { g.font = "34px serif"; g.textAlign = "center"; g.fillText("⚽", b.x, b.y + 10); }
      ctx.drawBuddies({ alon: "🐥", dad: "🐧" });
      ctx.drawSparks(0.016);
    }
  },

  "beach-volley": {
    title: "Beach Volley",
    emoji: "🏐",
    blurb: "Bump the beach ball over the net. First to 5 sunny points!",
    hintAlon: "Alon: WASD bump",
    hintDad: "Dad: arrows bump",
    goal: "FIRST TO 5",
    hearts: false,
    setup(ctx) { resetVolley(ctx, 1); },
    update(ctx, dt) {
      const f = ctx.field;
      const netX = f.x + f.w / 2;
      [ctx.alon, ctx.dad].forEach((p) => {
        const half = p.id === "alon"
          ? { x: f.x, y: f.y, w: f.w / 2 - 10, h: f.h }
          : { x: netX + 10, y: f.y, w: f.w / 2 - 10, h: f.h };
        ctx.moveTopDown(p, 240, dt, half);
      });
      const b = ctx.data.ball;
      b.vy += 700 * dt;
      b.x += b.vx * dt; b.y += b.vy * dt;
      [ctx.alon, ctx.dad].forEach((p) => {
        if (ctx.dist(p.x, p.y, b.x, b.y) < p.r + b.r) {
          b.vy = -420;
          b.vx = (b.x - p.x) * 8;
          ctx.beep(400, 0.05, "triangle", 0.05);
        }
      });
      if (b.x > netX - 8 && b.x < netX + 8 && b.y > f.y + f.h * 0.35) {
        b.vx *= -1; b.x += b.vx * dt;
      }
      if (b.y > f.y + f.h - 10) {
        if (b.x < netX) ctx.addScore(ctx.dad, 1);
        else ctx.addScore(ctx.alon, 1);
        ctx.chime();
        resetVolley(ctx, b.x < netX ? 1 : -1);
      }
      if (b.x < f.x) { b.x = f.x + 8; b.vx *= -1; }
      if (b.x > f.x + f.w) { b.x = f.x + f.w - 8; b.vx *= -1; }
      ctx.maybeFirstTo(5);
    },
    draw(ctx) {
      drawCourt(ctx, ["#fde68a", "#fb923c"]);
      const { g, field: f } = ctx;
      g.fillStyle = "#fff";
      g.fillRect(f.x + f.w / 2 - 5, f.y + f.h * 0.35, 10, f.h * 0.65);
      const b = ctx.data.ball;
      if (b) { g.font = "32px serif"; g.textAlign = "center"; g.fillText("🏐", b.x, b.y); }
      ctx.drawBuddies({ alon: "🐥", dad: "🐧" });
      ctx.drawSparks(0.016);
    }
  },

  "paddy-pong": {
    title: "Paddy Pong",
    emoji: "🏓",
    blurb: "Big paddles, bouncy ball. First to 5 points!",
    hintAlon: "Alon: W S paddle",
    hintDad: "Dad: ↑ ↓ paddle",
    goal: "FIRST TO 5",
    hearts: false,
    setup(ctx) { resetPong(ctx, 1); },
    update(ctx, dt) {
      const f = ctx.field;
      [ctx.alon, ctx.dad].forEach((p) => {
        const inn = ctx.input(p.id);
        p.y += inn.ay * 320 * dt;
        p.y = ctx.clamp(p.y, f.y + 40, f.y + f.h - 40);
        p.x = p.id === "alon" ? f.x + 28 : f.x + f.w - 28;
      });
      const b = ctx.data.ball;
      b.x += b.vx * dt; b.y += b.vy * dt;
      if (b.y < f.y + 12 || b.y > f.y + f.h - 12) b.vy *= -1;
      [ctx.alon, ctx.dad].forEach((p) => {
        if (Math.abs(b.x - p.x) < 18 && Math.abs(b.y - p.y) < 46) {
          b.vx = Math.abs(b.vx) * (p.id === "alon" ? 1 : -1) * 1.05;
          b.vy = (b.y - p.y) * 6;
          ctx.beep(500, 0.04, "square", 0.04);
        }
      });
      if (b.x < f.x) { ctx.addScore(ctx.dad, 1); resetPong(ctx, 1); ctx.chime(); }
      if (b.x > f.x + f.w) { ctx.addScore(ctx.alon, 1); resetPong(ctx, -1); ctx.chime(); }
      ctx.maybeFirstTo(5);
    },
    draw(ctx) {
      drawCourt(ctx, ["#fb7185", "#fbbf24"]);
      const { g } = ctx;
      g.fillStyle = "#fff";
      [ctx.alon, ctx.dad].forEach((p) => {
        g.fillStyle = p.color;
        g.beginPath(); g.roundRect(p.x - 8, p.y - 42, 16, 84, 8); g.fill();
      });
      const b = ctx.data.ball;
      if (b) { g.fillStyle = "#fff"; g.beginPath(); g.arc(b.x, b.y, 10, 0, Math.PI * 2); g.fill(); }
      ctx.drawSparks(0.016);
    }
  },

  "air-puck": {
    title: "Air Puck",
    emoji: "🏒",
    blurb: "Zippy table hockey. First to 5 goals!",
    hintAlon: "Alon: WASD glide",
    hintDad: "Dad: arrows glide",
    goal: "FIRST TO 5",
    hearts: false,
    setup(ctx) {
      const f = ctx.field;
      ctx.data.ball = { x: f.x + f.w / 2, y: f.y + f.h / 2, vx: 180, vy: 80, r: 14 };
      ctx.alon.x = f.x + 80; ctx.dad.x = f.x + f.w - 80;
    },
    update(ctx, dt) {
      const f = ctx.field;
      [ctx.alon, ctx.dad].forEach((p) => {
        const half = p.id === "alon"
          ? { x: f.x, y: f.y, w: f.w / 2, h: f.h }
          : { x: f.x + f.w / 2, y: f.y, w: f.w / 2, h: f.h };
        ctx.moveTopDown(p, 300, dt, half);
      });
      const b = ctx.data.ball;
      b.x += b.vx * dt; b.y += b.vy * dt;
      if (b.y < f.y + b.r || b.y > f.y + f.h - b.r) b.vy *= -1;
      [ctx.alon, ctx.dad].forEach((p) => {
        if (ctx.dist(p.x, p.y, b.x, b.y) < p.r + b.r) {
          const dx = b.x - p.x, dy = b.y - p.y, m = Math.hypot(dx, dy) || 1;
          b.vx = dx / m * 380; b.vy = dy / m * 380;
        }
      });
      const gh = f.h * 0.3, gy = f.y + (f.h - gh) / 2;
      if (b.x < f.x + 8 && b.y > gy && b.y < gy + gh) { ctx.addScore(ctx.dad, 1); resetPuck(ctx); }
      else if (b.x > f.x + f.w - 8 && b.y > gy && b.y < gy + gh) { ctx.addScore(ctx.alon, 1); resetPuck(ctx); }
      else {
        if (b.x < f.x + b.r) { b.x = f.x + b.r; b.vx *= -1; }
        if (b.x > f.x + f.w - b.r) { b.x = f.x + f.w - b.r; b.vx *= -1; }
      }
      ctx.maybeFirstTo(5);
    },
    draw(ctx) {
      drawCourt(ctx, ["#38bdf8", "#e0f2fe"]);
      const { g, field: f } = ctx;
      const gh = f.h * 0.3, gy = f.y + (f.h - gh) / 2;
      g.fillStyle = "#fb7185"; g.fillRect(f.x, gy, 12, gh);
      g.fillStyle = "#0284c7"; g.fillRect(f.x + f.w - 12, gy, 12, gh);
      const b = ctx.data.ball;
      if (b) { g.fillStyle = "#0c4a6e"; g.beginPath(); g.arc(b.x, b.y, b.r, 0, Math.PI * 2); g.fill(); }
      ctx.drawBuddies({ alon: "🔴", dad: "🔵" });
      ctx.drawSparks(0.016);
    }
  },

  "tug-stars": {
    title: "Tug Stars",
    emoji: "⭐",
    blurb: "Hold toward your side to tug the star. First to pull it home 2 times!",
    hintAlon: "Alon: A tug left",
    hintDad: "Dad: → tug right",
    goal: "2 PULLS",
    hearts: false,
    setup(ctx) {
      ctx.data.x = 0.5;
      ctx.alon.x = ctx.field.x + 60;
      ctx.dad.x = ctx.field.x + ctx.field.w - 60;
      ctx.alon.y = ctx.dad.y = ctx.field.y + ctx.field.h / 2;
    },
    update(ctx, dt) {
      const a = ctx.input("alon"), d = ctx.input("dad");
      ctx.data.x += ((d.right || d.ax > 0.2 ? 1 : 0) - (a.left || a.ax < -0.2 ? 1 : 0)) * 0.22 * dt;
      ctx.data.x += (d.ax - a.ax) * 0.12 * dt;
      ctx.data.x = ctx.clamp(ctx.data.x, 0.08, 0.92);
      const f = ctx.field;
      if (ctx.data.x <= 0.12) {
        ctx.addScore(ctx.alon, 1); ctx.starChime(); ctx.data.x = 0.5; ctx.burst(f.x + 40, f.y + f.h / 2, ctx.alon.color, 20);
      }
      if (ctx.data.x >= 0.88) {
        ctx.addScore(ctx.dad, 1); ctx.starChime(); ctx.data.x = 0.5; ctx.burst(f.x + f.w - 40, f.y + f.h / 2, ctx.dad.color, 20);
      }
      ctx.maybeFirstTo(2);
    },
    draw(ctx) {
      drawCourt(ctx, ["#fbbf24", "#fb7185"]);
      const { g, field: f } = ctx;
      g.strokeStyle = "#fff";
      g.lineWidth = 10;
      g.beginPath();
      g.moveTo(f.x + 40, f.y + f.h / 2);
      g.lineTo(f.x + f.w - 40, f.y + f.h / 2);
      g.stroke();
      const x = f.x + f.w * (ctx.data.x || 0.5);
      g.font = "56px serif"; g.textAlign = "center";
      g.fillText("⭐", x, f.y + f.h / 2 + 8);
      ctx.drawBuddies({ alon: "🐥", dad: "🐧" });
      ctx.drawSparks(0.016);
    }
  },

  "hot-spud": {
    title: "Hot Spud",
    emoji: "🥔",
    blurb: "Grab the potato and bump to pass it. Don't hold it when it pops!",
    hintAlon: "Alon: WASD run",
    hintDad: "Dad: arrows run",
    goal: "HOT!",
    lives: 3,
    endOnOneOut: true,
    setup(ctx) {
      ctx.data.hold = null;
      ctx.data.timer = 3.2;
      ctx.data.spud = { x: ctx.field.x + ctx.field.w / 2, y: ctx.field.y + ctx.field.h / 2, r: 16 };
    },
    update(ctx, dt) {
      [ctx.alon, ctx.dad].forEach((p) => { if (!p.out) ctx.moveTopDown(p, 250, dt); });
      const s = ctx.data.spud;
      if (!ctx.data.hold) {
        [ctx.alon, ctx.dad].forEach((p) => {
          if (!p.out && ctx.dist(p.x, p.y, s.x, s.y) < 30) {
            ctx.data.hold = p.id;
            ctx.beep(360, 0.06, "sine", 0.06);
          }
        });
      } else {
        const holder = ctx.data.hold === "alon" ? ctx.alon : ctx.dad;
        s.x = holder.x; s.y = holder.y - 28;
        const other = holder.id === "alon" ? ctx.dad : ctx.alon;
        if (!other.out && ctx.dist(holder.x, holder.y, other.x, other.y) < 46) {
          ctx.data.hold = other.id;
          ctx.data.timer = Math.max(1.2, ctx.data.timer);
          ctx.chime();
        }
        ctx.data.timer -= dt;
        ctx.setGoal(ctx.data.timer.toFixed(1) + "s");
        if (ctx.data.timer <= 0) {
          ctx.hurt(holder);
          ctx.addScore(other, 1);
          ctx.data.hold = null;
          ctx.data.timer = 3.2;
          s.x = ctx.field.x + ctx.field.w / 2;
          s.y = ctx.field.y + ctx.field.h / 2;
        }
      }
      ctx.maybeLastHeart();
    },
    draw(ctx) {
      drawCourt(ctx, ["#fdba74", "#fb7185"]);
      const s = ctx.data.spud;
      if (s) {
        ctx.g.font = "36px serif"; ctx.g.textAlign = "center";
        ctx.g.fillText("🥔", s.x, s.y);
      }
      ctx.drawBuddies({ alon: "🐥", dad: "🐧" });
      ctx.drawSparks(0.016);
    }
  }
};

function resetBall(ctx, dir) {
  const f = ctx.field;
  ctx.data.ball.x = f.x + f.w / 2;
  ctx.data.ball.y = f.y + f.h / 2;
  ctx.data.ball.vx = 180 * dir;
  ctx.data.ball.vy = (Math.random() - 0.5) * 120;
}
function resetVolley(ctx, dir) {
  const f = ctx.field;
  ctx.data.ball = { x: f.x + f.w / 2 + dir * 40, y: f.y + 50, vx: dir * 80, vy: 40, r: 14 };
  ctx.alon.x = f.x + f.w * 0.22; ctx.dad.x = f.x + f.w * 0.78;
  ctx.alon.y = ctx.dad.y = f.y + f.h * 0.7;
}
function resetPong(ctx, dir) {
  const f = ctx.field;
  ctx.data.ball = { x: f.x + f.w / 2, y: f.y + f.h / 2, vx: 220 * dir, vy: 140, r: 10 };
}
function resetPuck(ctx) {
  const f = ctx.field;
  ctx.data.ball = { x: f.x + f.w / 2, y: f.y + f.h / 2, vx: (Math.random() < 0.5 ? 1 : -1) * 200, vy: 80, r: 14 };
  ctx.chime();
}
