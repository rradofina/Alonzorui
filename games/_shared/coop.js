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
export function goalHorn() {
  [392, 523, 659, 784].forEach((f, i) => setTimeout(() => beep(f, 0.16, "square", 0.08), i * 90));
}

const THEMES = {
  meadow: { sky: ["#7dd3fc", "#bbf7d0"], hill: "#4ade80", hill2: "#86efac", field: "rgba(255,255,255,.2)" },
  candy: { sky: ["#fce7f3", "#fde68a"], hill: "#fb7185", hill2: "#f9a8d4", field: "rgba(255,255,255,.28)" },
  ice: { sky: ["#e0f2fe", "#7dd3fc"], hill: "#bae6fd", hill2: "#e0f2fe", field: "rgba(255,255,255,.28)" },
  sunset: { sky: ["#38bdf8", "#f9a8d4"], hill: "#fda4af", hill2: "#fde68a", field: "rgba(255,255,255,.18)" },
  sea: { sky: ["#67e8f9", "#0369a1"], hill: "#0ea5e9", hill2: "#22d3ee", field: "rgba(255,255,255,.1)" },
  jungle: { sky: ["#fde68a", "#86efac"], hill: "#22c55e", hill2: "#4ade80", field: "rgba(255,255,255,.16)" },
  night: { sky: ["#1e1b4b", "#312e81"], hill: "#312e81", hill2: "#1e1b4b", field: "rgba(255,255,255,.08)" },
  paint: { sky: ["#fdf4ff", "#e0f2fe"], hill: "#c4b5fd", hill2: "#f9a8d4", field: "rgba(255,255,255,.35)" },
  party: { sky: ["#fce7f3", "#fde68a"], hill: "#f472b6", hill2: "#fbbf24", field: "rgba(255,255,255,.22)" },
  track: { sky: ["#fdba74", "#facc15"], hill: "#f97316", hill2: "#fde68a", field: "rgba(255,255,255,.2)" },
  snow: { sky: ["#e0f2fe", "#93c5fd"], hill: "#fff", hill2: "#dbeafe", field: "rgba(255,255,255,.3)" },
  grass: { sky: ["#86efac", "#4ade80"], hill: "#16a34a", hill2: "#86efac", field: "rgba(255,255,255,.2)" },
  sand: { sky: ["#fde68a", "#fb923c"], hill: "#fbbf24", hill2: "#fdba74", field: "rgba(255,255,255,.22)" },
  pong: { sky: ["#fb7185", "#fbbf24"], hill: "#fb7185", hill2: "#fde68a", field: "rgba(255,255,255,.16)" },
  ice rink: { sky: ["#38bdf8", "#e0f2fe"], hill: "#7dd3fc", hill2: "#e0f2fe", field: "rgba(255,255,255,.28)" },
  gold: { sky: ["#fde047", "#fb7185"], hill: "#f59e0b", hill2: "#fbbf24", field: "rgba(255,255,255,.2)" },
  potato: { sky: ["#fdba74", "#fb7185"], hill: "#ea580c", hill2: "#fdba74", field: "rgba(255,255,255,.2)" },
  crate: { sky: ["#fef3c7", "#86efac"], hill: "#ca8a04", hill2: "#fde68a", field: "rgba(255,255,255,.3)" },
  mirror: { sky: ["#ede9fe", "#f9a8d4"], hill: "#c4b5fd", hill2: "#ddd6fe", field: "rgba(255,255,255,.3)" },
  bright: { sky: ["#fff7ed", "#bae6fd"], hill: "#fdba74", hill2: "#fde68a", field: "rgba(12,74,110,.06)" },
  cards: { sky: ["#f3e8ff", "#fde68a"], hill: "#a78bfa", hill2: "#ddd6fe", field: "rgba(255,255,255,.25)" },
  tower: { sky: ["#fff7ed", "#fdba74"], hill: "#fb923c", hill2: "#fde68a", field: "rgba(255,255,255,.28)" },
  pillow: { sky: ["#fbcfe8", "#c4b5fd"], hill: "#f9a8d4", hill2: "#e9d5ff", field: "rgba(255,255,255,.28)" },
  frost: { sky: ["#e0f2fe", "#38bdf8"], hill: "#fff", hill2: "#bae6fd", field: "rgba(255,255,255,.22)" },
  sumo: { sky: ["#fde68a", "#f97316"], hill: "#fb923c", hill2: "#fde047", field: "rgba(255,255,255,.22)" },
  coins: { sky: ["#facc15", "#fb923c"], hill: "#f59e0b", hill2: "#fde68a", field: "rgba(255,255,255,.18)" },
  orchard: { sky: ["#86efac", "#fb7185"], hill: "#22c55e", hill2: "#bbf7d0", field: "rgba(255,255,255,.2)" },
  soap: { sky: ["#67e8f9", "#a78bfa"], hill: "#22d3ee", hill2: "#c4b5fd", field: "rgba(255,255,255,.16)" },
  pets: { sky: ["#86efac", "#f9a8d4"], hill: "#4ade80", hill2: "#fbcfe8", field: "rgba(255,255,255,.22)" },
  noodle: { sky: ["#dcfce7", "#86efac"], hill: "#14532d", hill2: "#22c55e", field: "rgba(20,83,45,.55)" },
  glow: { sky: ["#020617", "#0f172a"], hill: "#022c22", hill2: "#164e63", field: "rgba(255,255,255,.04)" },
  blocks: { sky: ["#1e1b4b", "#312e81"], hill: "#1e1b4b", hill2: "#4c1d95", field: "rgba(255,255,255,.06)" },
  connect: { sky: ["#fff7ed", "#dbeafe"], hill: "#1d4ed8", hill2: "#93c5fd", field: "rgba(255,255,255,.25)" },
  mole: { sky: ["#86efac", "#4ade80"], hill: "#365314", hill2: "#65a30d", field: "#bbf7d0" },
  spark: { sky: ["#312e81", "#1e1b4b"], hill: "#4c1d95", hill2: "#312e81", field: "rgba(255,255,255,.08)" }
};

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

function iHash(s) {
  let h = 0;
  for (let i = 0; i < (s || "").length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return (h % 7) * 0.4;
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
  g.strokeStyle = "rgba(255,255,255,.55)";
  g.lineWidth = 3;
  g.stroke();
  g.fillStyle = "rgba(255,255,255,.32)";
  g.beginPath();
  g.arc(-p.r * 0.28, -p.r * 0.28, p.r * 0.32, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#fff";
  g.beginPath();
  g.arc(-p.r * 0.28, -p.r * 0.12, p.r * 0.18, 0, Math.PI * 2);
  g.arc(p.r * 0.28, -p.r * 0.12, p.r * 0.18, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#1e293b";
  g.beginPath();
  g.arc(-p.r * 0.22 + p.facing * 3, -p.r * 0.1, p.r * 0.09, 0, Math.PI * 2);
  g.arc(p.r * 0.34 + p.facing * 3, -p.r * 0.1, p.r * 0.09, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "#1e293b";
  g.lineWidth = 2.5;
  g.beginPath();
  g.arc(0, p.r * 0.2, p.r * 0.32, 0.15, Math.PI - 0.15);
  g.stroke();
  if (emoji) {
    g.font = `${p.r}px serif`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(emoji, p.r * 0.55, -p.r * 0.7);
  }
  g.restore();
}

export function drawLabel(g, p, text) {
  g.save();
  g.font = "800 16px Trebuchet MS, sans-serif";
  g.textAlign = "center";
  g.lineWidth = 4;
  g.strokeStyle = "rgba(12,74,110,.35)";
  g.strokeText(text || p.name, p.x, p.y - p.r - 12);
  g.fillStyle = p.color;
  g.fillText(text || p.name, p.x, p.y - p.r - 12);
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
    beep, chime, starChime, bump, fanfare, pop, whoosh, goalHorn,
    clamp, dist, aabb, circleHit,
    data: {},
    freeze: 0, shake: 0, floaters: [],
    round: 1, maxRounds: spec.rounds || 3,
    roundWins: { alon: 0, dad: 0 },
    matchScore: { alon: 0, dad: 0 },
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
      return inn;
    },
    landOn(p, platforms) {
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
    float(x, y, text, color) {
      ctx.floaters.push({ x, y, text, color: color || "#fff", life: 0.8, vy: -50 });
    },
    punch(n) { ctx.shake = Math.max(ctx.shake, n || 0.28); },
    frozen() { return ctx.freeze > 0; },
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
      ctx.freeze = 0;
      ctx.floaters = [];
      ctx.shake = 0;
    },
    countIn(roundName) {
      ctx.freeze = 2.35;
      const label = roundName || `Round ${ctx.round}`;
      ctx.banner(label, 700);
      setTimeout(() => { if (ctx.playing) { ctx.banner("3", 350); beep(392, 0.08, "square", 0.07); } }, 750);
      setTimeout(() => { if (ctx.playing) { ctx.banner("2", 350); beep(440, 0.08, "square", 0.07); } }, 1150);
      setTimeout(() => { if (ctx.playing) { ctx.banner("1", 350); beep(523, 0.08, "square", 0.07); } }, 1550);
      setTimeout(() => { if (ctx.playing) { ctx.banner("GO!", 400); pop(); ctx.freeze = 0; } }, 1950);
    },
    async startRound(n, title) {
      ctx.round = n;
      ctx.freeze = 2.4;
      if (spec.setupRound) await spec.setupRound(ctx, n);
      ctx.setGoal(`R${n}/${ctx.maxRounds}`);
      ctx.countIn(title || `Round ${n}`);
    },
    winRound(who, text) {
      if (ctx.frozen() || !ctx.playing) return;
      ctx.roundWins[who] = (ctx.roundWins[who] || 0) + 1;
      const p = who === "alon" ? ctx.alon : ctx.dad;
      ctx.addScore(p, 1, "ROUND!");
      ctx.punch(0.4);
      ctx.goalHorn();
      ctx.burst(p.x, p.y, p.color, 36);
      ctx.banner(`${p.name} takes round ${ctx.round}!`, 900);
      ctx.freeze = 1.35;
      const need = Math.ceil(ctx.maxRounds / 2);
      setTimeout(() => {
        if (!ctx.playing) return;
        if (ctx.roundWins[who] >= need || ctx.round >= ctx.maxRounds) {
          const a = ctx.roundWins.alon, d = ctx.roundWins.dad;
          const w = a === d ? "tie" : a > d ? "alon" : "dad";
          ctx.end(w, w === "tie" ? "Match tie!" : `${w === "alon" ? "Alon" : "Dad"} wins the match!`,
            text || `Rounds  Alon ${a} – ${d} Dad`, spec.emoji);
        } else {
          ctx.startRound(ctx.round + 1);
        }
      }, 1300);
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
      setTimeout(() => { if (ctx.playing) ctx.startRound(ctx.round + 1); }, 1000);
    },
    drawTheme(name) {
      const th = THEMES[name] || THEMES.meadow;
      const sky = g.createLinearGradient(0, 0, 0, ctx.h);
      sky.addColorStop(0, th.sky[0]); sky.addColorStop(1, th.sky[1]);
      g.fillStyle = sky; g.fillRect(0, 0, ctx.w, ctx.h);
      if (name === "night" || name === "glow" || name === "spark" || name === "blocks") {
        g.fillStyle = "rgba(255,255,255,.35)";
        for (let i = 0; i < 28; i++) {
          const x = ((i * 97 + ctx.t * 8) % ctx.w);
          const y = (i * 53 + 20) % (ctx.h * 0.7);
          g.fillRect(x, y, 2, 2);
        }
      } else {
        g.fillStyle = "rgba(255,255,255,.55)";
        for (let i = 0; i < 5; i++) {
          const x = ((ctx.t * (12 + i * 4) + i * 160) % (ctx.w + 80)) - 40;
          const y = 40 + (i % 3) * 28;
          g.beginPath();
          g.ellipse(x, y, 28, 16, 0, 0, Math.PI * 2);
          g.ellipse(x + 18, y + 4, 22, 12, 0, 0, Math.PI * 2);
          g.fill();
        }
      }
      g.fillStyle = th.hill2;
      g.beginPath();
      g.moveTo(0, ctx.h);
      for (let x = 0; x <= ctx.w; x += 20) {
        g.lineTo(x, ctx.h * 0.78 + Math.sin(x * 0.01 + iHash(name)) * 18);
      }
      g.lineTo(ctx.w, ctx.h); g.closePath(); g.fill();
      g.fillStyle = th.hill;
      g.beginPath();
      g.moveTo(0, ctx.h);
      for (let x = 0; x <= ctx.w; x += 18) {
        g.lineTo(x, ctx.h * 0.86 + Math.sin(x * 0.014 + 2) * 12);
      }
      g.lineTo(ctx.w, ctx.h); g.closePath(); g.fill();
      ctx.fillField(th.field);
      g.save();
      g.font = "800 15px Trebuchet MS, sans-serif";
      g.fillStyle = "rgba(12,74,110,.45)";
      g.fillText(`Round ${ctx.round} / ${ctx.maxRounds}   Alon ${ctx.roundWins.alon} – ${ctx.roundWins.dad} Dad`,
        ctx.field.x + 14, ctx.field.y + 20);
      g.restore();
    },
    drawPlats(plats, color) {
      (plats || []).forEach((p) => {
        g.fillStyle = p.bounce ? "#f472b6" : p.ice ? "#e0f2fe" : p.hurt ? "#fb923c" : (color || "#86efac");
        g.beginPath();
        g.roundRect(p.x, p.y, p.w, p.h, 10);
        g.fill();
        g.strokeStyle = "rgba(255,255,255,.35)";
        g.stroke();
        if (p.bounce) ctx.icon(p.x + p.w / 2, p.y + p.h / 2, "🍄", "#fb7185", 10);
      });
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
        g.font = "800 22px Trebuchet MS, sans-serif";
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
      g.strokeStyle = "rgba(255,255,255,.55)";
      g.lineWidth = 4;
      g.stroke();
    },
    icon(x, y, emoji, color, r) {
      const rad = r || 14;
      g.save();
      g.fillStyle = color || "#fbbf24";
      g.beginPath();
      g.arc(x, y, rad, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = "rgba(255,255,255,.7)";
      g.lineWidth = 2;
      g.stroke();
      g.font = `${rad * 1.6}px serif`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(emoji, x, y + 1);
      g.restore();
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
      p.r = spec.radius || 30;
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
      ctx.resetMatch();
      ctx.t = 0;
      showPlayChrome();
      if (spec.setup) await spec.setup(ctx);
      ctx.maxRounds = spec.rounds || 3;
      ctx.paint();
      playing = true;
      ctx.playing = true;
      if (spec.setupRound) await spec.setupRound(ctx, 1);
      ctx.setGoal(`R1/${ctx.maxRounds}`);
      ctx.countIn(spec.roundNames ? spec.roundNames[0] : "Round 1");
    }

  function tick(now) {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    ctx.now = now;
    ctx.t += dt;
    ctx.tickJuice(dt);
    bannerT -= dt;
    if (bannerT <= 0) document.getElementById("banner").classList.remove("on");
    if (playing) {
      if (!ctx.frozen() && spec.update) spec.update(ctx, dt);
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
