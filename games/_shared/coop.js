export const ALON = "alon";
export const DAD = "dad";
export const COLORS = {
  alon: "#fb7185",
  dad: "#38bdf8",
  gold: "#ffd166",
  ink: "#0c4a6e"
};

const KEYMAP = {
  alon: { left: "KeyA", right: "KeyD", up: "KeyW", down: "KeyS" },
  dad: { left: "ArrowLeft", right: "ArrowRight", up: "ArrowUp", down: "ArrowDown" }
};

export function beep(freq, dur, type, vol) {
  try {
    const ctx = window._ac || (window._ac = new (window.AudioContext || window.webkitAudioContext)());
    if (ctx.state === "suspended") ctx.resume();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type || "sine";
    o.frequency.value = freq;
    g.gain.value = vol == null ? 0.1 : vol;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.stop(ctx.currentTime + dur);
  } catch (err) {}
}
export function chime() {
  beep(760, 0.07, "triangle", 0.08);
  setTimeout(() => beep(1040, 0.1, "triangle", 0.09), 55);
}
export function starChime() {
  [784, 988, 1175, 1568].forEach((f, i) => setTimeout(() => beep(f, 0.12, "sine", 0.09), i * 70));
}
export function bump() {
  beep(180, 0.09, "sine", 0.07);
  setTimeout(() => beep(140, 0.12, "triangle", 0.06), 70);
}
export function fanfare() {
  [523, 659, 784, 988, 1175].forEach((f, i) => setTimeout(() => beep(f, 0.22, "triangle", 0.11), i * 110));
}

function injectShell(spec) {
  document.title = `${spec.title} · AlonzoRui`;
  const hintAlon = spec.hintAlon || "Alon: WASD";
  const hintDad = spec.hintDad || "Dad: arrows";
  document.body.insertAdjacentHTML("afterbegin", `
    <a class="home" href="../index.html">← Home</a>
    <div id="flash"></div>
    <div id="banner"></div>
    <div id="hud" class="off">
      <div class="pill alon" id="alonPill">
        <div class="who">ALON</div>
        <div class="hearts" id="alonHearts"></div>
        <div class="pts" id="alonScore">0</div>
      </div>
      <div class="pill goal">
        <div class="who" id="goalWho">${spec.goal || "PLAY"}</div>
        <div class="pts" id="goalPts">${spec.goalPts || ""}</div>
      </div>
      <div class="pill dad" id="dadPill">
        <div class="who">DAD</div>
        <div class="hearts" id="dadHearts"></div>
        <div class="pts" id="dadScore">0</div>
      </div>
    </div>
    <div class="hints off" id="hints">
      <div class="alon">${hintAlon}</div>
      <div class="dad">${hintDad}</div>
    </div>
    <div id="pads" class="pads off">
      <div class="pad alon" id="padAlon">
        <div class="pad-tag">ALON</div>
        <div class="dpad" aria-label="Alon pad">
          <button type="button" class="dir up" data-dir="up" tabindex="-1">▲</button>
          <button type="button" class="dir left" data-dir="left" tabindex="-1">◀</button>
          <button type="button" class="dir right" data-dir="right" tabindex="-1">▶</button>
          <button type="button" class="dir down" data-dir="down" tabindex="-1">▼</button>
          <div class="nub"></div>
        </div>
      </div>
      <div class="pad dad" id="padDad">
        <div class="pad-tag">DAD</div>
        <div class="dpad" aria-label="Dad pad">
          <button type="button" class="dir up" data-dir="up" tabindex="-1">▲</button>
          <button type="button" class="dir left" data-dir="left" tabindex="-1">◀</button>
          <button type="button" class="dir right" data-dir="right" tabindex="-1">▶</button>
          <button type="button" class="dir down" data-dir="down" tabindex="-1">▼</button>
          <div class="nub"></div>
        </div>
      </div>
    </div>
    <canvas id="view"></canvas>
    <div class="cover" id="start">
      <div class="emoji">${spec.emoji || "🎮"}</div>
      <h1>${spec.title}</h1>
      <p class="brand">Alonzo<span class="r">R</span>ui</p>
      <p>${spec.blurb || "Play together on one screen."}</p>
      <div class="pair">
        <span class="chip alon"><span class="for-keys">Alon: WASD</span><span class="for-touch">Alon: left pad</span></span>
        <span class="chip dad"><span class="for-keys">Dad: ←↑↓→</span><span class="for-touch">Dad: right pad</span></span>
      </div>
      <button class="play" id="go">Play</button>
      <a class="home-btn" href="../index.html">Home</a>
    </div>
    <div class="cover off" id="win">
      <div class="confetti" id="confetti"></div>
      <div class="emoji" id="winEmoji">🌈</div>
      <p class="brand">Alonzo<span class="r">R</span>ui</p>
      <h1 id="winTitle">Nice job!</h1>
      <p id="winText">What a round.</p>
      <div class="scores">
        <div class="box alon">Alon<div class="n" id="winAlon">0</div></div>
        <div class="box dad">Dad<div class="n" id="winDad">0</div></div>
      </div>
      <button class="play" id="again">Play again</button>
      <a class="home-btn" href="../index.html">Home</a>
    </div>
  `);
}

function bindPad(el, who, pads) {
  const zone = el.querySelector(".dpad");
  const pointers = new Map();
  function read(x, y) {
    const r = zone.getBoundingClientRect();
    const nx = ((x - r.left) / Math.max(1, r.width)) * 2 - 1;
    const ny = ((y - r.top) / Math.max(1, r.height)) * 2 - 1;
    const dead = 0.16;
    return {
      left: nx < -dead,
      right: nx > dead,
      up: ny < -dead,
      down: ny > dead,
      ax: Math.abs(nx) < dead ? 0 : nx,
      ay: Math.abs(ny) < dead ? 0 : ny
    };
  }
  function merge() {
    const next = { left: false, right: false, up: false, down: false, ax: 0, ay: 0 };
    pointers.forEach((d) => {
      next.left = next.left || d.left;
      next.right = next.right || d.right;
      next.up = next.up || d.up;
      next.down = next.down || d.down;
      if (Math.abs(d.ax) > Math.abs(next.ax)) next.ax = d.ax;
      if (Math.abs(d.ay) > Math.abs(next.ay)) next.ay = d.ay;
    });
    pads[who] = next;
    el.classList.toggle("held", pointers.size > 0);
    el.querySelectorAll("[data-dir]").forEach((btn) => {
      btn.classList.toggle("held", next[btn.getAttribute("data-dir")]);
    });
  }
  function down(e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    try { el.setPointerCapture(e.pointerId); } catch (err) {}
    pointers.set(e.pointerId, read(e.clientX, e.clientY));
    merge();
  }
  function move(e) {
    if (!pointers.has(e.pointerId)) return;
    e.preventDefault();
    pointers.set(e.pointerId, read(e.clientX, e.clientY));
    merge();
  }
  function up(e) {
    if (!pointers.has(e.pointerId)) return;
    e.preventDefault();
    pointers.delete(e.pointerId);
    merge();
  }
  el.addEventListener("pointerdown", down);
  el.addEventListener("pointermove", move);
  el.addEventListener("pointerup", up);
  el.addEventListener("pointercancel", up);
  el.addEventListener("lostpointercapture", up);
  el.addEventListener("contextmenu", (e) => e.preventDefault());
}

export function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
export function dist(ax, ay, bx, by) { return Math.hypot(ax - bx, ay - by); }
export function aabb(a, b) {
  return Math.abs(a.x - b.x) < (a.w || a.r * 2) / 2 + (b.w || b.r * 2) / 2 &&
    Math.abs(a.y - b.y) < (a.h || a.r * 2) / 2 + (b.h || b.r * 2) / 2;
}
export function circleHit(a, b, extra) {
  const r = (a.r || 12) + (b.r || 12) + (extra || 0);
  return dist(a.x, a.y, b.x, b.y) < r;
}

function makePlayer(id) {
  return {
    id,
    name: id === "alon" ? "Alon" : "Dad",
    color: id === "alon" ? COLORS.alon : COLORS.dad,
    heart: id === "alon" ? "❤️" : "💙",
    empty: "🤍",
    x: 0, y: 0, vx: 0, vy: 0, r: 22,
    score: 0, hearts: 3, inv: 0, out: false,
    facing: id === "alon" ? 1 : -1,
    fx: 0, fy: 0, squish: 1, angle: 0,
    prev: { left: false, right: false, up: false, down: false }
  };
}

export function drawBuddy(g, p, emoji) {
  const s = p.r * 2.2;
  g.save();
  g.translate(p.x, p.y);
  g.scale(1, p.squish || 1);
  g.fillStyle = "rgba(12,74,110,.22)";
  g.beginPath();
  g.ellipse(0, p.r * 0.95, p.r * 0.85, p.r * 0.28, 0, 0, Math.PI * 2);
  g.fill();
  g.beginPath();
  g.fillStyle = p.color;
  g.arc(0, 0, p.r, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "rgba(255,255,255,.28)";
  g.beginPath();
  g.arc(-p.r * 0.28, -p.r * 0.28, p.r * 0.32, 0, Math.PI * 2);
  g.fill();
  if (emoji) {
    g.font = `${s * 0.72}px serif`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(emoji, 0, 2);
  } else {
    g.fillStyle = "#fff";
    g.beginPath();
    g.arc(-p.r * 0.28, -p.r * 0.12, p.r * 0.16, 0, Math.PI * 2);
    g.arc(p.r * 0.28, -p.r * 0.12, p.r * 0.16, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#1e293b";
    g.beginPath();
    g.arc(-p.r * 0.24 + p.facing * 2, -p.r * 0.1, p.r * 0.08, 0, Math.PI * 2);
    g.arc(p.r * 0.32 + p.facing * 2, -p.r * 0.1, p.r * 0.08, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = "#1e293b";
    g.lineWidth = 2;
    g.beginPath();
    g.arc(0, p.r * 0.18, p.r * 0.28, 0.15, Math.PI - 0.15);
    g.stroke();
  }
  g.restore();
}

export function drawLabel(g, p, text) {
  g.save();
  g.font = "800 13px Trebuchet MS, sans-serif";
  g.textAlign = "center";
  g.fillStyle = p.color;
  g.fillText(text || p.name, p.x, p.y - p.r - 10);
  g.restore();
}

export function run(spec) {
  injectShell(spec);
  const canvas = document.getElementById("view");
  const g = canvas.getContext("2d");
  const keys = new Set();
  const pads = {
    alon: { left: false, right: false, up: false, down: false, ax: 0, ay: 0 },
    dad: { left: false, right: false, up: false, down: false, ax: 0, ay: 0 }
  };
  bindPad(document.getElementById("padAlon"), "alon", pads);
  bindPad(document.getElementById("padDad"), "dad", pads);

  addEventListener("keydown", (e) => {
    keys.add(e.code);
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) e.preventDefault();
  });
  addEventListener("keyup", (e) => keys.delete(e.code));
  document.addEventListener("touchmove", (e) => e.preventDefault(), { passive: false });
  document.addEventListener("gesturestart", (e) => e.preventDefault());

  const alon = makePlayer("alon");
  const dad = makePlayer("dad");
  const sparks = [];
  let playing = false;
  let winner = null;
  let last = performance.now();
  let bannerT = 0;
  let ended = false;

  const ctx = {
    spec, canvas, g, keys, pads,
    alon, dad, sparks,
    w: 0, h: 0, field: { x: 0, y: 0, w: 0, h: 0 },
    t: 0, now: 0, playing: false,
    beep, chime, starChime, bump, fanfare,
    clamp, dist, aabb, circleHit,
    data: {},
    padReserve() {
      const coarse = matchMedia("(pointer: coarse), (max-width: 900px)").matches;
      if (!coarse) return 28;
      const landscape = innerWidth > innerHeight;
      return (landscape ? Math.min(innerHeight * 0.28, 168) : Math.min(innerWidth * 0.44, 200)) + 36;
    },
    resize() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      ctx.w = innerWidth;
      ctx.h = innerHeight;
      canvas.width = ctx.w * dpr;
      canvas.height = ctx.h * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const top = innerWidth < 720 ? 118 : 78;
      ctx.field = {
        x: 16,
        y: top,
        w: ctx.w - 32,
        h: ctx.h - top - ctx.padReserve() - 8
      };
    },
    input(who) {
      const map = KEYMAP[who];
      const p = pads[who];
      const left = keys.has(map.left) || p.left;
      const right = keys.has(map.right) || p.right;
      const up = keys.has(map.up) || p.up;
      const down = keys.has(map.down) || p.down;
      let ax = p.ax, ay = p.ay;
      if (keys.has(map.left)) ax = -1;
      if (keys.has(map.right)) ax = 1;
      if (keys.has(map.up)) ay = -1;
      if (keys.has(map.down)) ay = 1;
      if (left && !right && !ax) ax = -1;
      if (right && !left && !ax) ax = 1;
      if (up && !down && !ay) ay = -1;
      if (down && !up && !ay) ay = 1;
      return { left, right, up, down, ax, ay };
    },
    pressed(who, dir) {
      const p = who === "alon" ? alon : dad;
      const inn = ctx.input(who);
      const was = p.prev[dir];
      p.prev[dir] = inn[dir];
      return inn[dir] && !was;
    },
    latchPrev() {
      ["alon", "dad"].forEach((who) => {
        const p = who === "alon" ? alon : dad;
        const inn = ctx.input(who);
        p.prev.left = inn.left;
        p.prev.right = inn.right;
        p.prev.up = inn.up;
        p.prev.down = inn.down;
      });
    },
    moveTopDown(p, speed, dt, bounds) {
      const inn = ctx.input(p.id);
      p.vx = inn.ax * speed;
      p.vy = inn.ay * speed;
      if (inn.ax || inn.ay) {
        const m = Math.hypot(inn.ax, inn.ay) || 1;
        p.vx = (inn.ax / m) * speed;
        p.vy = (inn.ay / m) * speed;
        if (Math.abs(inn.ax) > 0.2) p.facing = inn.ax > 0 ? 1 : -1;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      const b = bounds || ctx.field;
      p.x = clamp(p.x, b.x + p.r, b.x + b.w - p.r);
      p.y = clamp(p.y, b.y + p.r, b.y + b.h - p.r);
      p.inv -= dt;
      return inn;
    },
    movePlatform(p, opts, dt) {
      const inn = ctx.input(p.id);
      const speed = opts.speed || 240;
      const grav = opts.gravity == null ? 1400 : opts.gravity;
      const jump = opts.jump || 520;
      const ice = opts.ice || 0;
      if (opts.swim) {
        p.vx += inn.ax * speed * 3 * dt;
        p.vy += inn.ay * speed * 3 * dt;
        p.vx *= Math.pow(0.08, dt);
        p.vy *= Math.pow(0.08, dt);
      } else if (ice) {
        p.vx += inn.ax * speed * ice * dt;
        p.vx *= Math.pow(0.25, dt);
      } else {
        p.vx = inn.ax * speed;
      }
      if (inn.ax) p.facing = inn.ax > 0 ? 1 : -1;
      p.vy += grav * dt;
      if (opts.onGround && inn.up && p._ground && !p._jumpLock) {
        p.vy = -jump;
        p._ground = false;
        p._jumpLock = true;
        p.squish = 1.18;
        beep(520, 0.06, "square", 0.05);
      }
      if (!inn.up) p._jumpLock = false;
      if (opts.bouncePad && p._bounce) {
        p.vy = -jump * 1.35;
        p._bounce = false;
        p.squish = 1.25;
        beep(640, 0.08, "triangle", 0.07);
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.squish += (1 - p.squish) * 10 * dt;
      p.inv -= dt;
      return inn;
    },
    landOn(p, platforms) {
      p._ground = false;
      p._bounce = false;
      for (const plat of platforms) {
        const left = p.x + p.r * 0.4 > plat.x && p.x - p.r * 0.4 < plat.x + plat.w;
        const feet = p.y + p.r;
        if (left && feet >= plat.y && feet <= plat.y + Math.max(18, plat.h || 16) + Math.max(0, p.vy) * 0.02 && p.vy >= -20) {
          p.y = plat.y - p.r;
          p.vy = 0;
          p._ground = true;
          if (plat.bounce) p._bounce = true;
        }
      }
    },
    keepInField(p, bounce) {
      const f = ctx.field;
      if (p.x < f.x + p.r) { p.x = f.x + p.r; if (bounce) p.vx *= -0.4; }
      if (p.x > f.x + f.w - p.r) { p.x = f.x + f.w - p.r; if (bounce) p.vx *= -0.4; }
      if (p.y < f.y + p.r) { p.y = f.y + p.r; if (bounce) p.vy *= -0.3; }
      if (p.y > f.y + f.h - p.r) { p.y = f.y + f.h - p.r; p.vy = 0; p._ground = true; }
    },
    bumpPlayers(power) {
      if (circleHit(alon, dad, 2)) {
        const dx = dad.x - alon.x || 1;
        const dy = dad.y - alon.y || 0;
        const m = Math.hypot(dx, dy) || 1;
        const k = power || 220;
        alon.x -= (dx / m) * 6;
        dad.x += (dx / m) * 6;
        alon.vx -= (dx / m) * k * 0.02;
        dad.vx += (dx / m) * k * 0.02;
        alon.vy -= (dy / m) * k * 0.02;
        dad.vy += (dy / m) * k * 0.02;
        return true;
      }
      return false;
    },
    burst(x, y, color, n) {
      for (let i = 0; i < (n || 14); i++) {
        sparks.push({
          x, y,
          vx: (Math.random() - 0.5) * 260,
          vy: (Math.random() - 0.8) * 260,
          life: 0.45 + Math.random() * 0.35,
          color, r: 3 + Math.random() * 4
        });
      }
    },
    flash(who) {
      const el = document.getElementById("flash");
      el.className = who || "";
      setTimeout(() => { el.className = ""; }, 140);
    },
    banner(text, ms) {
      const el = document.getElementById("banner");
      el.textContent = text;
      el.classList.add("on");
      bannerT = (ms || 900) / 1000;
    },
    addScore(p, n) {
      p.score += n;
      const el = document.getElementById(p.id === "alon" ? "alonPill" : "dadPill");
      el.classList.remove("pop");
      void el.offsetWidth;
      el.classList.add("pop");
      ctx.paint();
    },
    hurt(p) {
      if (p.out || p.inv > 0) return false;
      p.hearts -= 1;
      p.inv = 1.1;
      ctx.flash(p.id);
      ctx.bump();
      ctx.burst(p.x, p.y, p.color, 18);
      if (p.hearts <= 0) {
        p.hearts = 0;
        p.out = true;
      }
      ctx.paint();
      return true;
    },
    paint() {
      document.getElementById("alonScore").textContent = String(alon.score | 0);
      document.getElementById("dadScore").textContent = String(dad.score | 0);
      const hearts = (p, id) => {
        const el = document.getElementById(id);
        if (spec.hearts === false) { el.textContent = ""; return; }
        el.textContent = p.out ? "☁️ OUT" : p.heart.repeat(p.hearts) + p.empty.repeat(Math.max(0, (spec.lives || 3) - p.hearts));
      };
      hearts(alon, "alonHearts");
      hearts(dad, "dadHearts");
      if (spec.goalPts != null || spec.goalLive) {
        document.getElementById("goalPts").textContent = spec.goalLive ? spec.goalLive(ctx) : (spec.goalPts || "");
      }
    },
    setGoal(text) {
      document.getElementById("goalPts").textContent = text;
    },
    fillField(color, radius) {
      const f = ctx.field;
      g.fillStyle = color || "rgba(255,255,255,.16)";
      const r = radius || 28;
      g.beginPath();
      g.roundRect(f.x, f.y, f.w, f.h, r);
      g.fill();
    },
    drawSparks(dt) {
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life -= dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.vy += 420 * dt;
        if (s.life <= 0) sparks.splice(i, 1);
        else {
          g.globalAlpha = Math.max(0, s.life * 2);
          g.fillStyle = s.color;
          g.beginPath();
          g.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          g.fill();
          g.globalAlpha = 1;
        }
      }
    },
    drawBuddies(emotes) {
      const order = alon.y <= dad.y ? [alon, dad] : [dad, alon];
      order.forEach((p) => {
        if (p.inv > 0 && !p.out && ((ctx.now / 90) | 0) % 2 === 0) return;
        drawBuddy(g, p, emotes && emotes[p.id]);
        drawLabel(g, p);
      });
    },
    end(who, title, text, emoji) {
      if (ended) return;
      ended = true;
      playing = false;
      ctx.playing = false;
      winner = who;
      fanfare();
      document.getElementById("pads").classList.add("off");
      document.getElementById("hints").classList.add("off");
      document.getElementById("winAlon").textContent = String(alon.score | 0);
      document.getElementById("winDad").textContent = String(dad.score | 0);
      const names = { alon: "Alon", dad: "Dad", tie: "Both", coop: "Team" };
      document.getElementById("winTitle").textContent = title || (
        who === "tie" ? "It's a tie!" : who === "coop" ? "Team win!" : `${names[who]} wins!`
      );
      document.getElementById("winText").textContent = text || "Tap Play again for another round.";
      document.getElementById("winEmoji").textContent = emoji || spec.emoji || "🌈";
      const box = document.getElementById("confetti");
      box.innerHTML = "";
      for (let i = 0; i < 46; i++) {
        const d = document.createElement("i");
        d.style.left = Math.random() * 100 + "%";
        d.style.background = ["#fb7185", "#38bdf8", "#fbbf24", "#86efac", "#a78bfa"][i % 5];
        d.style.animationDelay = (Math.random() * 0.6) + "s";
        box.appendChild(d);
      }
      document.getElementById("win").classList.remove("off");
    },
    maybeFirstTo(n) {
      if (alon.score >= n && dad.score >= n) ctx.end("tie");
      else if (alon.score >= n) ctx.end("alon");
      else if (dad.score >= n) ctx.end("dad");
    },
    maybeLastHeart() {
      if (alon.out && dad.out) ctx.end(alon.score === dad.score ? "tie" : alon.score > dad.score ? "alon" : "dad");
      else if (alon.out && spec.endOnOneOut) ctx.end("dad", "Dad wins!", "Alon needs a cuddle.");
      else if (dad.out && spec.endOnOneOut) ctx.end("alon", "Alon wins!", "Nice moves!");
    }
  };

  function resetPlayers() {
    const f = ctx.field;
    const lives = spec.lives == null ? 3 : spec.lives;
    [alon, dad].forEach((p, i) => {
      p.score = 0;
      p.hearts = lives;
      p.inv = 0;
      p.out = false;
      p.vx = 0; p.vy = 0;
      p.r = spec.radius || 22;
      p.squish = 1;
      p.x = f.x + f.w * (i ? 0.72 : 0.28);
      p.y = f.y + f.h * 0.62;
      p.prev = { left: false, right: false, up: false, down: false };
    });
    sparks.length = 0;
    ended = false;
    winner = null;
    ctx.data = ctx.data || {};
    ctx.paint();
  }

  function showPlayChrome() {
    document.getElementById("start").classList.add("off");
    document.getElementById("win").classList.add("off");
    document.getElementById("hud").classList.remove("off");
    document.getElementById("hints").classList.remove("off");
    document.getElementById("pads").classList.remove("off");
  }

  async function startGame() {
      ctx.resize();
      resetPlayers();
      showPlayChrome();
      if (spec.setup) await spec.setup(ctx);
      ctx.paint();
      playing = true;
      ctx.playing = true;
      beep(523, 0.1, "triangle", 0.1);
      setTimeout(() => beep(784, 0.12, "triangle", 0.1), 90);
    }

  function tick(now) {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    ctx.now = now;
    ctx.t += dt;
    bannerT -= dt;
    if (bannerT <= 0) document.getElementById("banner").classList.remove("on");
    if (playing) {
      if (spec.update) spec.update(ctx, dt);
      ctx.latchPrev();
    }
    if (spec.draw) spec.draw(ctx, dt);
    else if (!spec.mode) {
      g.clearRect(0, 0, ctx.w, ctx.h);
    }
    requestAnimationFrame(tick);
  }

  addEventListener("resize", () => ctx.resize());
  ctx.resize();
  resetPlayers();
  if (spec.idleSetup) spec.idleSetup(ctx);
  requestAnimationFrame(tick);
  document.getElementById("go").onclick = () => startGame();
  document.getElementById("again").onclick = () => startGame();
  return ctx;
}
