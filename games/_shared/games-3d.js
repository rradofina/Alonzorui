const THREE_URL = "https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js";

async function bootThree(ctx, bg) {
  if (ctx._three) {
    ctx.data.three = ctx._three;
    ctx._three.scene.background.setHex(bg || 0x7dd3fc);
    return ctx._three;
  }
  const THREE = await import(THREE_URL);
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, failIfMajorPerformanceCaveat: false });
  } catch (err) {
    console.warn("WebGL unavailable", err);
    return null;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.domElement.style.cssText = "position:fixed;inset:0;z-index:1;";
  document.body.appendChild(renderer.domElement);
  const canvas2 = document.getElementById("view");
  if (canvas2) canvas2.style.display = "none";
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(bg || 0x7dd3fc);
  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 260);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xffe7a8, 1.05));
  const sun = new THREE.DirectionalLight(0xfff4d2, 1.1);
  sun.position.set(12, 22, 8);
  scene.add(sun);
  const onResize = () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  };
  addEventListener("resize", onResize);
  ctx._three = { THREE, renderer, scene, camera, onResize };
  ctx.data.three = ctx._three;
  return ctx._three;
}

function makeOrb(THREE, color) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 18, 14),
    new THREE.MeshStandardMaterial({ color, roughness: 0.4 })
  );
  g.add(body);
  const belly = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 12, 10),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 })
  );
  belly.position.set(0, -0.06, 0.22);
  belly.scale.set(1, 0.85, 0.5);
  g.add(belly);
  const eyeM = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), eyeM);
  eye.position.set(0.16, 0.12, 0.4);
  g.add(eye);
  const eye2 = eye.clone();
  eye2.position.x = -0.16;
  g.add(eye2);
  const pupilM = new THREE.MeshStandardMaterial({ color: 0x1e293b });
  const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 6), pupilM);
  pupil.position.set(0.18, 0.12, 0.48);
  g.add(pupil);
  const pupil2 = pupil.clone();
  pupil2.position.x = -0.14;
  g.add(pupil2);
  const hat = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 10, 8),
    new THREE.MeshStandardMaterial({ color: color === 0xfb7185 ? 0xfde047 : 0x0c4a6e })
  );
  hat.position.set(0, 0.48, 0);
  g.add(hat);
  return g;
}

function render3d(ctx) {
  if (ctx.data.flat) {
    drawFlat(ctx);
    return;
  }
  const t = ctx.data.three || ctx._three;
  if (t) t.renderer.render(t.scene, t.camera);
}

function useFlat(ctx, t) {
  ctx.data.flat = !t;
  const canvas2 = document.getElementById("view");
  if (canvas2) canvas2.style.display = ctx.data.flat ? "block" : "none";
  return !t;
}

function laneX(ctx, id, lane) {
  const f = ctx.field;
  const base = id === "alon" ? f.x + f.w * 0.28 : f.x + f.w * 0.72;
  return base + (lane || 0) * 36;
}

function drawFlat(ctx) {
  const kind = ctx.data.flatKind;
  ctx.withShake(() => {
    if (kind === "lanes") {
      ctx.drawTheme("sunset");
      const f = ctx.field;
      ["alon", "dad"].forEach((id) => {
        const x = laneX(ctx, id, 0);
        ctx.g.fillStyle = id === "alon" ? "rgba(251,113,133,.28)" : "rgba(56,189,248,.28)";
        ctx.g.fillRect(x - 54, f.y + 12, 108, f.h - 24);
      });
      (ctx.data.puffs || []).forEach((p) => {
        const y = f.y + f.h - 40 - ((p.z + (ctx.data.z[p.who] || 0)) * 4);
        if (y < f.y - 20 || y > f.y + f.h + 20) return;
        ctx.prop("pearl", laneX(ctx, p.who, p.lane), y, 14);
      });
      ctx.alon.x = laneX(ctx, "alon", ctx.data.lanes.alon);
      ctx.dad.x = laneX(ctx, "dad", ctx.data.lanes.dad);
      ctx.alon.y = ctx.dad.y = f.y + f.h - 50;
      ctx.drawBuddies({ alon: "🐥", dad: "🐧" });
    } else if (kind === "rings") {
      ctx.drawTheme("sunset");
      (ctx.data.flatRings || []).forEach((r) => {
        ctx.g.strokeStyle = r.hit.alon || r.hit.dad ? "#86efac" : "#fbbf24";
        ctx.g.lineWidth = 6;
        ctx.g.beginPath(); ctx.g.arc(r.x, r.y, 28, 0, Math.PI * 2); ctx.g.stroke();
      });
      ctx.drawBuddies({ alon: "🐥", dad: "🐧" });
    } else if (kind === "marble") {
      ctx.drawTheme("jungle");
      (ctx.data.flatWalls || []).forEach((w) => {
        ctx.g.fillStyle = "#115e59";
        ctx.g.fillRect(w.x, w.y, w.w, w.h);
      });
      if (ctx.data.flatHole) ctx.prop("star", ctx.data.flatHole.x, ctx.data.flatHole.y, 16);
      ctx.drawBuddies({ alon: "🐥", dad: "🐧" });
    } else if (kind === "pads") {
      ctx.drawTheme("night");
      (ctx.data.flatPads || []).forEach((p, i) => {
        ctx.g.fillStyle = i === ctx.data.flatPads.length - 1 ? "#fde047" : "#a78bfa";
        ctx.g.beginPath(); ctx.g.ellipse(p.x, p.y, 28, 14, 0, 0, Math.PI * 2); ctx.g.fill();
      });
      ctx.drawBuddies({ alon: "🐥", dad: "🐧" });
    }
    ctx.drawJuice();
  });
}

function addMesh(ctx, mesh) {
  ctx._extra = ctx._extra || [];
  ctx._extra.push(mesh);
  ctx._three.scene.add(mesh);
}

function addClouds(ctx, THREE, n) {
  for (let i = 0; i < (n || 8); i++) {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(0.7 + (i % 3) * 0.25, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.88 })
    );
    m.position.set((i % 2 ? -8 : 8) + (i % 3) * 0.6, 2.4 + (i % 4) * 0.4, -10 - i * 12);
    addMesh(ctx, m);
  }
}

export const games = {
  "sky-lanes": {
    title: "Sky Lanes",
    emoji: "🌈",
    blurb: "Three sky cups! Swap the wide lanes, dodge puffs — first through the rainbow gate wins the heat.",
    hintAlon: "Alon: A D lanes",
    hintDad: "Dad: ← → lanes",
    goal: "BEST OF 3",
    hearts: false,
    mode: "3d",
    rounds: 3,
    roundNames: ["Breeze", "Gust", "Storm"],
    setup(ctx) { ctx.resetMatch(); },
    async setupRound(ctx, n) {
      const t = await bootThree(ctx, 0x7dd3fc);
      if (useFlat(ctx, t)) {
        ctx.data.flatKind = "lanes";
        ctx.data.lanes = { alon: 0, dad: 0 };
        ctx.data.z = { alon: 0, dad: 0 };
        ctx.data.done = { alon: false, dad: false };
        ctx.data.finish = 82;
        ctx.data.puffs = [];
        for (let i = 0; i < 4 + n; i++) {
          const lane = ((i * 2 + n) % 3) - 1;
          ["alon", "dad"].forEach((id) => ctx.data.puffs.push({ who: id, lane, z: -16 - i * 16 }));
        }
        return;
      }
      const { THREE, camera } = t;
      if (!ctx._worldSky) {
        camera.position.set(0, 6.2, 12);
        const ALON_X = -3.6, DAD_X = 3.6;
        ctx.data.centers = { alon: ALON_X, dad: DAD_X };
        const road = (x, color) => {
          const m = new THREE.Mesh(
            new THREE.BoxGeometry(6.2, 0.25, 240),
            new THREE.MeshStandardMaterial({ color })
          );
          m.position.set(x, -0.2, -90);
          addMesh(ctx, m);
        };
        road(ALON_X, 0xfb7185);
        road(DAD_X, 0x38bdf8);
        const grass = new THREE.Mesh(
          new THREE.BoxGeometry(28, 0.08, 240),
          new THREE.MeshStandardMaterial({ color: 0x86efac })
        );
        grass.position.set(0, -0.38, -90);
        addMesh(ctx, grass);
        addClouds(ctx, THREE, 10);
        ctx.data.orbs = { alon: makeOrb(THREE, 0xfb7185), dad: makeOrb(THREE, 0x38bdf8) };
        addMesh(ctx, ctx.data.orbs.alon);
        addMesh(ctx, ctx.data.orbs.dad);
        ctx._worldSky = true;
      }
      if (ctx.data.gate) t.scene.remove(ctx.data.gate);
      const gate = new THREE.Mesh(
        new THREE.TorusGeometry(2.4, 0.14, 8, 28),
        new THREE.MeshStandardMaterial({ color: 0xfde047, emissive: 0xfacc15, emissiveIntensity: 0.45 })
      );
      gate.position.set(0, 1.7, -88);
      t.scene.add(gate);
      ctx.data.gate = gate;
      (ctx.data.puffs || []).forEach((p) => t.scene.remove(p.mesh));
      ctx.data.puffs = [];
      for (let i = 0; i < 4 + n; i++) {
        const lane = ((i * 2 + n) % 3) - 1;
        ["alon", "dad"].forEach((id) => {
          const m = new THREE.Mesh(
            new THREE.SphereGeometry(0.55, 10, 8),
            new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 })
          );
          const z = -16 - i * 16;
          m.position.set(ctx.data.centers[id] + lane * 1.7, 0.9, z);
          t.scene.add(m);
          ctx.data.puffs.push({ mesh: m, who: id, lane, z });
        });
      }
      ctx.data.lanes = { alon: 0, dad: 0 };
      ctx.data.z = { alon: 0, dad: 0 };
      ctx.data.x = { alon: ctx.data.centers.alon, dad: ctx.data.centers.dad };
      ctx.data.done = { alon: false, dad: false };
      ctx.data.finish = 82;
    },
    update(ctx, dt) {
      const t = ctx.data.three;
      if (!t && !ctx.data.flat) return;
      ["alon", "dad"].forEach((id) => {
        if (ctx.data.done[id]) return;
        const inn = ctx.input(id);
        if (ctx.pressed(id, "left")) ctx.data.lanes[id] = Math.max(-1, ctx.data.lanes[id] - 1);
        if (ctx.pressed(id, "right")) ctx.data.lanes[id] = Math.min(1, ctx.data.lanes[id] + 1);
        ctx.data.z[id] += (15 + (inn.up ? 5 : 0)) * dt;
        if (!ctx.data.flat) {
          const want = ctx.data.centers[id] + ctx.data.lanes[id] * 1.7;
          ctx.data.x[id] += (want - ctx.data.x[id]) * Math.min(1, 12 * dt);
          ctx.data.orbs[id].position.set(ctx.data.x[id], 0.85 + Math.sin(ctx.t * 6) * 0.08, -ctx.data.z[id]);
        }
        ctx.data.puffs.forEach((p) => {
          if (p.who !== id) return;
          if (Math.abs(p.z + ctx.data.z[id]) < 0.7 && ctx.data.lanes[id] === p.lane) {
            ctx.data.z[id] = Math.max(0, ctx.data.z[id] - 8);
            ctx.flash(id); ctx.bump(); ctx.punch(0.12);
          }
        });
        if (ctx.data.z[id] >= ctx.data.finish) {
          ctx.data.done[id] = true;
          ctx.addScore(id === "alon" ? ctx.alon : ctx.dad, 1, "GATE");
          ctx.winRound(id, "Rainbow gate!");
        }
      });
      ctx.setGoal(`${Math.max(ctx.data.z.alon, ctx.data.z.dad) | 0}m`);
      if (t) {
        const midX = (ctx.data.x.alon + ctx.data.x.dad) * 0.08;
        const lead = Math.max(ctx.data.z.alon, ctx.data.z.dad);
        t.camera.position.lerp({ x: midX, y: 6, z: 12 - lead }, 0.1);
        t.camera.lookAt(midX, 1.2, -lead - 12);
        t.renderer.render(t.scene, t.camera);
      }
    },
    draw: render3d
  },

  "ring-glide": {
    title: "Ring Glide",
    emoji: "💍",
    blurb: "Three hoop courses! Fat rings sit on a gentle wave. First to thread the set wins the heat.",
    hintAlon: "Alon: WASD fly",
    hintDad: "Dad: arrows fly",
    goal: "BEST OF 3",
    hearts: false,
    mode: "3d",
    rounds: 3,
    roundNames: ["Loop", "Wave", "Ribbon"],
    setup(ctx) { ctx.resetMatch(); },
    async setupRound(ctx, n) {
      const t = await bootThree(ctx, 0x38bdf8);
      if (useFlat(ctx, t)) {
        ctx.data.flatKind = "rings";
        const f = ctx.field;
        const count = 6 + n;
        ctx.data.flatRings = [];
        for (let i = 0; i < count; i++) {
          ctx.data.flatRings.push({
            x: f.x + f.w * 0.5 + Math.sin(i * 0.8) * f.w * 0.22,
            y: f.y + f.h - 90 - i * 52,
            hit: { alon: false, dad: false }
          });
        }
        ctx.data.need = count;
        ctx.data.got = { alon: 0, dad: 0 };
        ctx.place(0.35, 0.65, 0.82);
        return;
      }
      const { THREE, camera } = t;
      if (!ctx._worldRing) {
        camera.position.set(0, 4.2, 10);
        ctx.data.orbs = { alon: makeOrb(THREE, 0xfb7185), dad: makeOrb(THREE, 0x38bdf8) };
        addMesh(ctx, ctx.data.orbs.alon);
        addMesh(ctx, ctx.data.orbs.dad);
        addClouds(ctx, THREE, 8);
        for (let i = 0; i < 6; i++) {
          const hill = new THREE.Mesh(
            new THREE.SphereGeometry(2.2, 10, 8),
            new THREE.MeshStandardMaterial({ color: 0x4ade80 })
          );
          hill.position.set(i % 2 ? -9 : 9, -1.2, -8 - i * 12);
          addMesh(ctx, hill);
        }
        ctx._worldRing = true;
      }
      (ctx.data.rings || []).forEach((r) => t.scene.remove(r));
      ctx.data.rings = [];
      const count = 6 + n;
      for (let i = 0; i < count; i++) {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(1.85, 0.12, 8, 28),
          new THREE.MeshStandardMaterial({ color: i % 2 ? 0xfbbf24 : 0xf472b6, emissive: 0xf59e0b, emissiveIntensity: 0.18 })
        );
        ring.position.set(Math.sin(i * 0.42) * 2.1, 2.15 + Math.sin(i * 0.65) * 0.55, -10 - i * 7);
        ring.userData.hit = { alon: false, dad: false };
        t.scene.add(ring);
        ctx.data.rings.push(ring);
      }
      ctx.data.pos = { alon: { x: -1.6, y: 2.1, z: 0 }, dad: { x: 1.6, y: 2.1, z: 0 } };
      ctx.data.need = count;
      ctx.data.got = { alon: 0, dad: 0 };
    },
    update(ctx, dt) {
      const t = ctx.data.three;
      if (ctx.data.flat) {
        [ctx.alon, ctx.dad].forEach((p) => {
          ctx.moveTopDown(p, 240, dt);
          (ctx.data.flatRings || []).forEach((r) => {
            if (r.hit[p.id]) return;
            if (ctx.dist(p.x, p.y, r.x, r.y) < 30) {
              r.hit[p.id] = true;
              ctx.data.got[p.id] += 1;
              ctx.addScore(p, 1, "RING");
              ctx.chime();
              if (ctx.data.got[p.id] >= ctx.data.need) ctx.winRound(p.id, "Hoop hero!");
            }
          });
        });
        ctx.setGoal(`${Math.max(ctx.data.got.alon, ctx.data.got.dad)}/${ctx.data.need}`);
        return;
      }
      if (!t) return;
      ["alon", "dad"].forEach((id) => {
        const inn = ctx.input(id);
        const p = ctx.data.pos[id];
        p.x += inn.ax * 7 * dt;
        p.y += -inn.ay * 5.5 * dt;
        p.z -= (6.2 + (inn.up ? 2.2 : 0)) * dt;
        p.x = ctx.clamp(p.x, -5.5, 5.5);
        p.y = ctx.clamp(p.y, 0.5, 5.2);
        ctx.data.orbs[id].position.set(p.x, p.y, p.z);
        ctx.data.rings.forEach((r) => {
          if (r.userData.hit[id]) return;
          const d = Math.hypot(r.position.x - p.x, r.position.y - p.y, r.position.z - p.z);
          if (d < 1.75) {
            r.userData.hit[id] = true;
            ctx.data.got[id] += 1;
            ctx.addScore(id === "alon" ? ctx.alon : ctx.dad, 1, "RING");
            ctx.chime();
            if (ctx.data.got[id] >= ctx.data.need) ctx.winRound(id, "Hoop hero!");
          }
        });
      });
      const lead = Math.min(ctx.data.pos.alon.z, ctx.data.pos.dad.z);
      t.camera.position.lerp({ x: 0, y: 4.4, z: lead + 10 }, 0.1);
      t.camera.lookAt(0, 2.1, lead - 8);
      t.renderer.render(t.scene, t.camera);
      ctx.setGoal(`${Math.max(ctx.data.got.alon, ctx.data.got.dad)}/${ctx.data.need}`);
    },
    draw: render3d
  },

  "maze-marble": {
    title: "Maze Marble",
    emoji: "🔮",
    blurb: "Three wide marble yards! Tilt to the glow hole — corridors stay fat so nobody gets stuck.",
    hintAlon: "Alon: WASD tilt",
    hintDad: "Dad: arrows tilt",
    goal: "BEST OF 3",
    hearts: false,
    mode: "3d",
    rounds: 3,
    roundNames: ["Yard", "Garden", "Lab"],
    setup(ctx) { ctx.resetMatch(); },
    async setupRound(ctx, n) {
      const t = await bootThree(ctx, 0x134e4a);
      if (useFlat(ctx, t)) {
        ctx.data.flatKind = "marble";
        const f = ctx.field;
        const map = (x, z) => ({
          x: f.x + f.w * (0.5 + x / 16),
          y: f.y + f.h * (0.5 + z / 16)
        });
        ctx.data.flatWalls = marbleLayout(n).map((w) => {
          const p = map(w[0], w[1]);
          return { x: p.x - w[2] * 10, y: p.y - w[3] * 10, w: w[2] * 20, h: w[3] * 20 };
        });
        ctx.data.flatHole = map(n === 1 ? 4.6 : 4.8, n === 1 ? -4.6 : -4.8);
        ctx.data.done = { alon: false, dad: false };
        const s = map(-5.2, 5.2);
        ctx.alon.x = s.x; ctx.alon.y = s.y;
        ctx.dad.x = s.x + 28; ctx.dad.y = s.y;
        return;
      }
      const { THREE, camera } = t;
      camera.position.set(0, 15, 11);
      if (!ctx._worldMarble) {
        const floor = new THREE.Mesh(
          new THREE.BoxGeometry(16, 0.3, 16),
          new THREE.MeshStandardMaterial({ color: 0x34d399 })
        );
        floor.position.y = -0.15;
        addMesh(ctx, floor);
        ctx.data.orbs = { alon: makeOrb(THREE, 0xfb7185), dad: makeOrb(THREE, 0x38bdf8) };
        addMesh(ctx, ctx.data.orbs.alon);
        addMesh(ctx, ctx.data.orbs.dad);
        ctx._worldMarble = true;
      }
      (ctx.data.wallMeshes || []).forEach((m) => t.scene.remove(m));
      if (ctx.data.holeMesh) t.scene.remove(ctx.data.holeMesh);
      ctx.data.walls = [];
      ctx.data.wallMeshes = [];
      const addWall = (x, z, w, d) => {
        const m = new THREE.Mesh(
          new THREE.BoxGeometry(w, 0.8, d),
          new THREE.MeshStandardMaterial({ color: 0x115e59 })
        );
        m.position.set(x, 0.4, z);
        t.scene.add(m);
        ctx.data.wallMeshes.push(m);
        ctx.data.walls.push({ x, z, w, d });
      };
      marbleLayout(n).forEach((w) => addWall(w[0], w[1], w[2], w[3]));
      const holePos = n === 1 ? { x: 4.6, z: -4.6 } : n === 2 ? { x: 4.8, z: -4.8 } : { x: 5.0, z: -5.0 };
      const hole = new THREE.Mesh(
        new THREE.CylinderGeometry(1.15, 1.15, 0.22, 22),
        new THREE.MeshStandardMaterial({ color: 0xfde047, emissive: 0xfacc15, emissiveIntensity: 0.55 })
      );
      hole.position.set(holePos.x, 0.05, holePos.z);
      t.scene.add(hole);
      ctx.data.holeMesh = hole;
      ctx.data.hole = holePos;
      ctx.data.done = { alon: false, dad: false };
      ctx.data.ball = {
        alon: { x: -5.2, z: 5.2, vx: 0, vz: 0 },
        dad: { x: -3.8, z: 5.2, vx: 0, vz: 0 }
      };
    },
    update(ctx, dt) {
      const t = ctx.data.three;
      if (ctx.data.flat) {
        [ctx.alon, ctx.dad].forEach((p) => {
          if (ctx.data.done[p.id]) return;
          ctx.moveTopDown(p, 220, dt);
          (ctx.data.flatWalls || []).forEach((w) => {
            const nx = ctx.clamp(p.x, w.x, w.x + w.w);
            const ny = ctx.clamp(p.y, w.y, w.y + w.h);
            const d = Math.hypot(p.x - nx, p.y - ny);
            if (d < p.r - 2) {
              const m = d || 1;
              p.x = nx + (p.x - nx) / m * p.r;
              p.y = ny + (p.y - ny) / m * p.r;
            }
          });
          if (ctx.data.flatHole && ctx.dist(p.x, p.y, ctx.data.flatHole.x, ctx.data.flatHole.y) < 26) {
            ctx.data.done[p.id] = true;
            ctx.addScore(p, 1, "HOLE");
            ctx.winRound(p.id, "Down the glow hole!");
          }
        });
        return;
      }
      if (!t) return;
      ["alon", "dad"].forEach((id) => {
        if (ctx.data.done[id]) return;
        const inn = ctx.input(id);
        const b = ctx.data.ball[id];
        b.vx += inn.ax * 16 * dt;
        b.vz += inn.ay * 16 * dt;
        b.vx *= Math.pow(0.16, dt);
        b.vz *= Math.pow(0.16, dt);
        b.x += b.vx * dt;
        b.z += b.vz * dt;
        b.x = ctx.clamp(b.x, -7.2, 7.2);
        b.z = ctx.clamp(b.z, -7.2, 7.2);
        ctx.data.walls.forEach((w) => {
          const dx = Math.abs(b.x - w.x) - (w.w / 2 + 0.42);
          const dz = Math.abs(b.z - w.z) - (w.d / 2 + 0.42);
          if (dx < 0 && dz < 0) {
            if (dx > dz) { b.x += Math.sign(b.x - w.x || 1) * -dx; b.vx *= -0.25; }
            else { b.z += Math.sign(b.z - w.z || 1) * -dz; b.vz *= -0.25; }
          }
        });
        ctx.data.orbs[id].position.set(b.x, 0.46, b.z);
        if (Math.hypot(b.x - ctx.data.hole.x, b.z - ctx.data.hole.z) < 1.15) {
          ctx.data.done[id] = true;
          ctx.addScore(id === "alon" ? ctx.alon : ctx.dad, 1, "HOLE");
          ctx.winRound(id, "Down the glow hole!");
        }
      });
      t.camera.lookAt(0, 0, 0);
      t.renderer.render(t.scene, t.camera);
    },
    draw: render3d
  },

  "space-pads": {
    title: "Space Pads",
    emoji: "🚀",
    blurb: "Three moon hops! Fat pads sit close together. Tap hop — first to the flag pad wins the heat.",
    hintAlon: "Alon: A D step · W hop",
    hintDad: "Dad: ← → step · ↑ hop",
    goal: "BEST OF 3",
    hearts: false,
    mode: "3d",
    rounds: 3,
    roundNames: ["Dust", "Crater", "Flag"],
    setup(ctx) { ctx.resetMatch(); },
    async setupRound(ctx, n) {
      const t = await bootThree(ctx, 0x0f172a);
      if (useFlat(ctx, t)) {
        ctx.data.flatKind = "pads";
        const f = ctx.field;
        const count = 6 + n;
        ctx.data.flatPads = [];
        for (let i = 0; i < count; i++) {
          ctx.data.flatPads.push({
            x: f.x + f.w * (i % 2 ? 0.58 : 0.42),
            y: f.y + f.h - 50 - i * 42
          });
        }
        ctx.data.idx = { alon: 0, dad: 0 };
        ctx.data.cool = { alon: 0, dad: 0 };
        ctx.data.done = { alon: false, dad: false };
        return;
      }
      const { THREE, camera } = t;
      if (!ctx._worldPads) {
        camera.position.set(0, 8, 12);
        ctx.data.orbs = { alon: makeOrb(THREE, 0xfb7185), dad: makeOrb(THREE, 0x38bdf8) };
        addMesh(ctx, ctx.data.orbs.alon);
        addMesh(ctx, ctx.data.orbs.dad);
        for (let i = 0; i < 18; i++) {
          const star = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 6, 6),
            new THREE.MeshStandardMaterial({ color: 0xfde047, emissive: 0xfacc15, emissiveIntensity: 0.6 })
          );
          star.position.set((i % 2 ? -6 : 6) + (i % 5) * 0.4, 2 + (i % 4), -4 - i * 2.2);
          addMesh(ctx, star);
        }
        ctx._worldPads = true;
      }
      (ctx.data.padMeshes || []).forEach((m) => t.scene.remove(m));
      ctx.data.padMeshes = [];
      ctx.data.pads = [];
      const count = 6 + n;
      for (let i = 0; i < count; i++) {
        const last = i === count - 1;
        const m = new THREE.Mesh(
          new THREE.CylinderGeometry(1.25, 1.25, 0.28, 18),
          new THREE.MeshStandardMaterial({ color: last ? 0xfde047 : 0xa78bfa })
        );
        const x = (i % 2 ? 0.9 : -0.9);
        const z = -i * 2.6;
        m.position.set(x, 0, z);
        t.scene.add(m);
        ctx.data.padMeshes.push(m);
        ctx.data.pads.push(m.position.clone());
      }
      ctx.data.idx = { alon: 0, dad: 0 };
      ctx.data.cool = { alon: 0, dad: 0 };
      ctx.data.done = { alon: false, dad: false };
    },
    update(ctx, dt) {
      const t = ctx.data.three;
      if (ctx.data.flat) {
        ["alon", "dad"].forEach((id) => {
          if (ctx.data.done[id]) return;
          ctx.data.cool[id] -= dt;
          const inn = ctx.input(id);
          const pads = ctx.data.flatPads;
          if (ctx.data.cool[id] <= 0 && (inn.up || inn.right)) {
            ctx.data.idx[id] = Math.min(pads.length - 1, ctx.data.idx[id] + 1);
            ctx.data.cool[id] = 0.22;
            ctx.beep(640, 0.06, "triangle", 0.05);
          }
          if (ctx.data.cool[id] <= 0 && inn.left && ctx.data.idx[id] > 0) {
            ctx.data.idx[id] -= 1;
            ctx.data.cool[id] = 0.22;
          }
          const target = pads[ctx.data.idx[id]];
          const p = id === "alon" ? ctx.alon : ctx.dad;
          p.x += (target.x + (id === "alon" ? -12 : 12) - p.x) * Math.min(1, 10 * dt);
          p.y += (target.y - 18 - p.y) * Math.min(1, 10 * dt);
          if (ctx.data.idx[id] >= pads.length - 1) {
            ctx.data.done[id] = true;
            ctx.addScore(p, 1, "MOON");
            ctx.winRound(id, "Moon hop!");
          }
        });
        return;
      }
      if (!t) return;
      ["alon", "dad"].forEach((id) => {
        if (ctx.data.done[id]) return;
        ctx.data.cool[id] -= dt;
        const inn = ctx.input(id);
        const pads = ctx.data.pads;
        if (ctx.data.cool[id] <= 0 && (inn.up || inn.right)) {
          ctx.data.idx[id] = Math.min(pads.length - 1, ctx.data.idx[id] + 1);
          ctx.data.cool[id] = 0.22;
          ctx.beep(640, 0.06, "triangle", 0.05);
        }
        if (ctx.data.cool[id] <= 0 && inn.left && ctx.data.idx[id] > 0) {
          ctx.data.idx[id] -= 1;
          ctx.data.cool[id] = 0.22;
        }
        const target = pads[ctx.data.idx[id]];
        const orb = ctx.data.orbs[id];
        orb.position.lerp({ x: target.x + (id === "alon" ? -0.28 : 0.28), y: 0.72, z: target.z }, 0.22);
        if (ctx.data.idx[id] >= pads.length - 1) {
          ctx.data.done[id] = true;
          ctx.addScore(id === "alon" ? ctx.alon : ctx.dad, 1, "MOON");
          ctx.winRound(id, "Moon hop!");
        }
      });
      const lead = ctx.data.orbs.alon.position.clone().lerp(ctx.data.orbs.dad.position, 0.5);
      t.camera.position.lerp({ x: 0, y: 8, z: lead.z + 10 }, 0.08);
      t.camera.lookAt(lead.x, 0.4, lead.z);
      t.renderer.render(t.scene, t.camera);
    },
    draw: render3d
  }
};

// Wide corridors (3+ units) from start (-5.2, 5.2) to the glow hole.
// Round 1: one short island — walk around either side.
// Round 2: two staggered bars with a 3.2-unit door.
// Round 3: gentle zigzag, still no squeeze gaps.
function marbleLayout(n) {
  if (n === 1) return [[0, 0, 4.2, 0.7]];
  if (n === 2) {
    return [
      [2.4, 2.2, 9.0, 0.7],
      [-2.4, -2.0, 9.0, 0.7]
    ];
  }
  return [
    [2.4, 3.0, 9.0, 0.7],
    [-2.4, 0.0, 9.0, 0.7],
    [2.4, -3.0, 9.0, 0.7]
  ];
}
