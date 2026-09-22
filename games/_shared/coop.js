import { paintWorld, paintBuddy, paintPlat, paintIcon, paintLabel, paintProp, paintHead } from "./art.js";

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
export function pop() {
  beep(880, 0.05, "square", 0.05);
  setTimeout(() => beep(1320, 0.07, "triangle", 0.06), 40);
}
export function whoosh() {
  beep(220, 0.12, "sawtooth", 0.03);
}
export function thud() {
  beep(140, 0.05, "sine", 0.05);
}
export function goalHorn() {
  [392, 523, 659, 784].forEach((f, i) => setTimeout(() => beep(f, 0.16, "square", 0.08), i * 90));
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
      <button class="play" id="go" type="button">Play</button>
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
      <button class="play" id="again" type="button">Play again</button>
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

export function drawBuddy(g, p, emoji, t) {
  paintBuddy(g, p, t, emoji);
}

export function drawLabel(g, p, text) {
  paintLabel(g, p, text);
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
    t: 0, now: 0, playing: false, bootGen: 0, starting: false,
    beep, chime, starChime, bump, fanfare, pop, whoosh, thud, goalHorn,
    clamp, dist, aabb, circleHit,
    data: {},
    freeze: 0, shake: 0, floaters: [],
    round: 1, maxRounds: spec.rounds || 3,
    roundWins: { alon: 0, dad: 0 },
    matchScore: { alon: 0, dad: 0 },
    padReserve() {
      const coarse = matchMedia("(pointer: coarse), (max-width: 900px)").matches;
      if (!coarse) return innerHeight < 520 ? 76 : 70;
      const landscape = innerWidth > innerHeight;
      const pad = landscape ? Math.min(innerHeight * 0.28, 168) : Math.min(innerWidth * 0.40, 184);
      return pad + 52;
    },
    buddySize() {
      const f = ctx.field;
      const byH = f.h * 0.2;
      const byW = f.w * 0.14;
      return ctx.clamp(Math.round(Math.min(byH, byW * 1.35)), 48, 100);
    },
    sizeBuddies() {
      const r = ctx.buddySize();
      ctx.alon.r = ctx.dad.r = r;
      return r;
    },
    needWins() {
      return Math.ceil((ctx.maxRounds || spec.rounds || 3) / 2);
    },
    matchHud() {
      return !!(spec.rounds && spec.rounds > 1);
    },
    setRoundGoal(n) {
      ctx.setGoal(`R${n}/${ctx.maxRounds || spec.rounds || 3}`);
    },
    resize() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      ctx.w = innerWidth;
      ctx.h = innerHeight;
      canvas.width = ctx.w * dpr;
      canvas.height = ctx.h * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const landscape = innerWidth > innerHeight;
      const top = innerWidth < 720 ? (landscape ? 72 : 118) : (innerHeight < 520 ? 62 : 72);
      ctx.field = {
        x: 16,
        y: top,
        w: ctx.w - 32,
        h: Math.max(160, ctx.h - top - ctx.padReserve() - 8)
      };
      if (ctx.playing) ctx.sizeBuddies();
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
      const speed = opts.speed || 280;
      const grav = opts.gravity == null ? 1150 : opts.gravity;
      const jump = opts.jump || 720;
      const ice = opts.ice || 0;
      if (p._ground) p._coyote = 0.22;
      else p._coyote = Math.max(0, (p._coyote || 0) - dt);
      if (inn.up) p._buffer = 0.2;
      else p._buffer = Math.max(0, (p._buffer || 0) - dt);
      if (opts.swim) {
        p.vx += inn.ax * speed * 3 * dt;
        p.vy += inn.ay * speed * 3 * dt;
        p.vx *= Math.pow(0.08, dt);
        p.vy *= Math.pow(0.08, dt);
      } else if (ice) {
        p.vx += inn.ax * speed * ice * dt;
        p.vx *= Math.pow(0.22, dt);
      } else {
        p.vx = inn.ax * speed;
      }
      if (inn.ax) p.facing = inn.ax > 0 ? 1 : -1;
      p.vy += grav * dt;
      const canJump = opts.onGround && p._buffer > 0 && (p._ground || p._coyote > 0) && !p._jumpLock;
      if (canJump) {
        p.vy = -jump;
        p._ground = false;
        p._coyote = 0;
        p._buffer = 0;
        p._jumpLock = true;
        p.squish = 1.18;
        beep(520, 0.06, "square", 0.05);
      }
      if (!inn.up) p._jumpLock = false;
      if (opts.bouncePad && p._bounce) {
        p.vy = -jump * 1.28;
        p._bounce = false;
        p.squish = 1.25;
        beep(640, 0.08, "triangle", 0.07);
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.squish += (1 - p.squish) * 10 * dt;
      p.inv -= dt;
      if (p._ground && Math.abs(p.vx) > 80 && Math.random() < 0.12) ctx.dust(p.x, p.y + p.r * 0.7, "#fff");
      return inn;
    },
    landOn(p, platforms) {
      const wasAir = !p._ground;
      p._ground = false;
      p._bounce = false;
      for (const plat of platforms) {
        const pad = 14;
        const left = p.x + p.r * 0.12 > plat.x - pad && p.x - p.r * 0.12 < plat.x + plat.w + pad;
        const feet = p.y + p.r;
        const window = Math.max(34, (plat.h || 18) + 20) + Math.abs(p.vy) * 0.06;
        if (left && feet >= plat.y - 6 && feet <= plat.y + window && p.vy >= -50) {
          p.y = plat.y - p.r;
          p.vy = 0;
          p._ground = true;
          p._coyote = 0.22;
          if (plat.bounce) p._bounce = true;
        }
      }
      if (p._ground && wasAir) {
        thud();
        ctx.dust(p.x, p.y + p.r * 0.8, p.color);
      }
    },
    dust(x, y, color) {
      for (let i = 0; i < 7; i++) {
        sparks.push({
          x, y,
          vx: (Math.random() - 0.5) * 140,
          vy: -20 - Math.random() * 50,
          life: 0.28 + Math.random() * 0.18,
          color: color || "#fff",
          r: 2 + Math.random() * 3
        });
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
    addScore(p, n, label) {
      p.score += n;
      ctx.matchScore[p.id] = p.score;
      const el = document.getElementById(p.id === "alon" ? "alonPill" : "dadPill");
      el.classList.remove("pop");
      void el.offsetWidth;
      el.classList.add("pop");
      ctx.float(p.x, p.y - p.r - 8, label || ("+" + n), p.color);
      ctx.paint();
    },
    pickup(p, label) {
      ctx.float(p.x, p.y - p.r - 8, label || "+", p.color);
    },
    float(x, y, text, color) {
      ctx.floaters.push({ x, y, text, color: color || "#fff", life: 1.05, vy: -64 });
    },
    punch(n) { ctx.shake = Math.max(ctx.shake, n || 0.28); },
    frozen() { return ctx.freeze > 0; },
    standY(lift) {
      return ctx.field.y + ctx.field.h - (lift == null ? 56 : lift);
    },
    place(alonN, dadN, yN) {
      const f = ctx.field;
      ctx.alon.x = f.x + f.w * (alonN == null ? 0.22 : alonN);
      ctx.dad.x = f.x + f.w * (dadN == null ? 0.78 : dadN);
      ctx.alon.y = ctx.dad.y = f.y + f.h * (yN == null ? 0.72 : yN);
      ctx.alon.vx = ctx.dad.vx = ctx.alon.vy = ctx.dad.vy = 0;
    },
    resetMatch() {
      ctx.round = 1;
      ctx.roundWins = { alon: 0, dad: 0 };
      ctx.matchScore = { alon: 0, dad: 0 };
      ctx.alon.score = 0;
      ctx.dad.score = 0;
      ctx.freeze = 0;
      ctx.floaters = [];
      ctx.shake = 0;
      ctx.data.camX = 0;
      const who = document.getElementById("goalWho");
      if (who) who.textContent = spec.goal || "PLAY";
      ctx.setGoal(spec.goalPts || "");
      ctx.paint();
    },
    parkTogether() {
      ctx.data.camX = 0;
      const home = (ctx.data.plats || [])[1] || (ctx.data.plats || [])[0];
      const r = ctx.alon.r || ctx.buddySize();
      if (home) {
        const left = home.x + r * 1.05;
        const right = home.x + Math.max(home.w, r * 3.2) - r * 1.05;
        const gap = Math.min(r * 2.2, Math.max(r * 1.65, (right - left) * 0.45));
        ctx.alon.x = left;
        ctx.dad.x = Math.min(right, left + gap);
        ctx.alon.y = ctx.dad.y = home.y - r;
      } else {
        ctx.place(0.22, 0.4, 0.72);
      }
      ctx.alon.vx = ctx.dad.vx = ctx.alon.vy = ctx.dad.vy = 0;
      ctx.alon._ground = ctx.dad._ground = true;
    },
    later(ms, fn) {
      const gen = ctx.bootGen;
      setTimeout(() => { if (ctx.bootGen === gen && ctx.playing) fn(); }, ms);
    },
    countIn(roundName) {
      ctx.freeze = 2.35;
      const label = roundName || `Round ${ctx.round}`;
      ctx.banner(label, 700);
      ctx.later(750, () => { ctx.banner("3", 350); beep(392, 0.08, "square", 0.07); });
      ctx.later(1150, () => { ctx.banner("2", 350); beep(440, 0.08, "square", 0.07); });
      ctx.later(1550, () => { ctx.banner("1", 350); beep(523, 0.08, "square", 0.07); });
      ctx.later(1950, () => { ctx.banner("GO!", 400); pop(); ctx.freeze = 0; });
    },
    async startRound(n, title) {
      ctx.round = n;
      ctx.freeze = 2.4;
      ctx.sizeBuddies();
      if (spec.setupRound) await spec.setupRound(ctx, n);
      const whoEl = document.getElementById("goalWho");
      if (whoEl) whoEl.textContent = spec.goal || "PLAY";
      ctx.setRoundGoal(n);
      ctx.paint();
      ctx.countIn(title || `Round ${n}`);
    },
    winRound(who, text) {
      if (ctx.frozen() || !ctx.playing) return;
      ctx.roundWins[who] = (ctx.roundWins[who] || 0) + 1;
      const p = who === "alon" ? ctx.alon : ctx.dad;
      const taken = ctx.round;
      ctx.float(p.x, p.y - p.r - 8, "ROUND!", p.color);
      ctx.paint();
      const whoEl = document.getElementById("goalWho");
      if (whoEl) whoEl.textContent = "ROUND";
      ctx.setGoal(`${p.name} takes R${taken}!`);
      ctx.punch(0.4);
      ctx.goalHorn();
      ctx.burst(p.x, p.y, p.color, 36);
      ctx.banner(`${p.name} takes R${taken}!`, 700);
      if (spec.parkOnWin !== false) ctx.parkTogether();
      ctx.freeze = 0.7;
      const need = ctx.needWins();
      ctx.later(620, () => {
        if (ctx.roundWins[who] >= need || taken >= ctx.maxRounds) {
          const a = ctx.roundWins.alon, d = ctx.roundWins.dad;
          const w = a === d ? "tie" : a > d ? "alon" : "dad";
          ctx.end(w, w === "tie" ? "Match tie!" : `${w === "alon" ? "Alon" : "Dad"} wins the match!`,
            text || `Rounds  Alon ${a} – ${d} Dad`, spec.emoji);
        } else {
          ctx.startRound(taken + 1);
        }
      });
    },
    closeWaves(text) {
      const a = ctx.alon.score, d = ctx.dad.score;
      ctx.end(a === d ? "tie" : a > d ? "alon" : "dad", null, text || "What a match!", spec.emoji);
    },
    nextWaveOrEnd(waveGoal, text) {
      if (ctx.round >= ctx.maxRounds) { ctx.closeWaves(text); return; }
      ctx.freeze = 1.1;
      ctx.banner(`Wave ${ctx.round} clear!`, 800);
      ctx.starChime();
      ctx.later(1000, () => ctx.startRound(ctx.round + 1));
    },
    drawTheme(name) {
      paintWorld(g, ctx, name);
    },
    drawPlats(plats, color) {
      (plats || []).forEach((p) => paintPlat(g, p, color));
    },
    tickJuice(dt) {
      ctx.freeze = Math.max(0, ctx.freeze - dt);
      ctx.shake = Math.max(0, ctx.shake - dt);
      ctx.floaters = ctx.floaters.filter((f) => {
        f.life -= dt; f.y += f.vy * dt; return f.life > 0;
      });
    },
    drawJuice() {
      ctx.floaters.forEach((f) => {
        g.globalAlpha = Math.max(0, f.life * 1.4);
        g.font = "800 26px Trebuchet MS, sans-serif";
        g.textAlign = "center";
        g.fillStyle = f.color;
        g.fillText(f.text, f.x, f.y);
        g.globalAlpha = 1;
      });
      ctx.drawSparks(0.016);
    },
    withShake(fn) {
      g.save();
      if (ctx.shake > 0) {
        g.translate((Math.random() - 0.5) * ctx.shake * 22, (Math.random() - 0.5) * ctx.shake * 16);
      }
      fn();
      g.restore();
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
      const aPts = ctx.matchHud() ? (ctx.roundWins.alon | 0) : (alon.score | 0);
      const dPts = ctx.matchHud() ? (ctx.roundWins.dad | 0) : (dad.score | 0);
      document.getElementById("alonScore").textContent = String(aPts);
      document.getElementById("dadScore").textContent = String(dPts);
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
      g.strokeStyle = "rgba(255,255,255,.55)";
      g.lineWidth = 4;
      g.stroke();
    },
    icon(x, y, emoji, color, r) {
      paintIcon(g, x, y, emoji, color, r, ctx.t);
    },
    prop(kind, x, y, r, extra) {
      paintProp(g, kind, x, y, r || 14, ctx.t, extra);
    },
    head(x, y, who, r) {
      paintHead(g, x, y, who, r);
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
        paintBuddy(g, p, ctx.t, emotes && emotes[p.id]);
        paintLabel(g, p);
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
      document.getElementById("winAlon").textContent = String(ctx.matchHud() ? (ctx.roundWins.alon | 0) : (alon.score | 0));
      document.getElementById("winDad").textContent = String(ctx.matchHud() ? (ctx.roundWins.dad | 0) : (dad.score | 0));
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
      p.r = spec.radius || ctx.buddySize();
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
      if (ctx.starting) return;
      ctx.starting = true;
      ctx.bootGen = (ctx.bootGen || 0) + 1;
      try {
        ctx.resize();
        ctx.resetMatch();
        resetPlayers();
        ctx.resetMatch();
        ctx.t = 0;
        showPlayChrome();
        if (spec.setup) await spec.setup(ctx);
        ctx.maxRounds = spec.rounds || 3;
        ctx.paint();
        playing = true;
        ctx.playing = true;
        ctx.sizeBuddies();
        if (spec.setupRound) await spec.setupRound(ctx, 1);
        ctx.setRoundGoal(1);
        ctx.paint();
        ctx.countIn(spec.roundNames ? spec.roundNames[0] : "Round 1");
        window.__qa = ctx;
      } finally {
        ctx.starting = false;
      }
    }

  function tick(now) {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    ctx.now = now;
    ctx.t += dt;
    ctx.tickJuice(dt);
    bannerT -= dt;
    if (bannerT <= 0) document.getElementById("banner").classList.remove("on");
    try {
      if (playing) {
        if (!ctx.frozen() && spec.update) spec.update(ctx, dt);
        if (!ctx.frozen()) ctx.latchPrev();
      }
      if (spec.draw) spec.draw(ctx, dt);
      else if (!spec.mode) {
        g.clearRect(0, 0, ctx.w, ctx.h);
      }
    } catch (err) {
      console.warn(spec.title || "game", err);
    }
    requestAnimationFrame(tick);
  }

  addEventListener("resize", () => ctx.resize());
  ctx.resize();
  resetPlayers();
  ctx.resetMatch();
  if (spec.idleSetup) spec.idleSetup(ctx);
  requestAnimationFrame(tick);
  document.getElementById("go").onclick = () => startGame();
  document.getElementById("again").onclick = () => startGame();
  return ctx;
}
