const THREE_URL = "https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js";

async function bootThree(ctx, bg) {
  if (ctx.data.three) return ctx.data.three;
  const THREE = await import(THREE_URL);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.domElement.style.cssText = "position:fixed;inset:0;z-index:1;";
  document.body.appendChild(renderer.domElement);
  const canvas2 = document.getElementById("view");
  if (canvas2) canvas2.style.display = "none";
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(bg || 0x7dd3fc);
  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 220);
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
  ctx.data.three = { THREE, renderer, scene, camera, onResize };
  ctx._persist = Object.assign(ctx._persist || {}, { three: ctx.data.three });
  return ctx.data.three;
}

function makeOrb(THREE, color) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 16, 12),
    new THREE.MeshStandardMaterial({ color, roughness: 0.45 })
  );
  g.add(body);
  return g;
}

export const games = {
  "sky-lanes": {
    title: "Sky Lanes",
    emoji: "🌈",
    blurb: "A short 3-lane sky dash. Swap lanes and race to the rainbow gate!",
    hintAlon: "Alon: A D lanes",
    hintDad: "Dad: ← → lanes",
    goal: "RACE",
    hearts: false,
    mode: "3d",
    async setup(ctx) {
      if (ctx._worldSky) {
        ctx.data.lanes = { alon: 0, dad: 0 };
        ctx.data.z = { alon: 0, dad: 0 };
        ctx.data.x = { alon: ctx.data.centers.alon, dad: ctx.data.centers.dad };
        ctx.data.done = { alon: false, dad: false };
        return;
      }
      const t = await bootThree(ctx, 0x7dd3fc);
      const { THREE, scene, camera } = t;
      camera.position.set(0, 6.2, 12);
      // Camera looks toward -Z, so +X is screen-right.
      const ALON_X = -3.4, DAD_X = 3.4;
      ctx.data.centers = { alon: ALON_X, dad: DAD_X };
      ctx.data.lanes = { alon: 0, dad: 0 };
      ctx.data.z = { alon: 0, dad: 0 };
      ctx.data.x = { alon: ALON_X, dad: DAD_X };
      ctx.data.done = { alon: false, dad: false };
      const road = (x, color) => {
        const m = new THREE.Mesh(
          new THREE.BoxGeometry(5.4, 0.25, 220),
          new THREE.MeshStandardMaterial({ color })
        );
        m.position.set(x, -0.2, -90);
        scene.add(m);
      };
      road(ALON_X, 0xfb7185);
      road(DAD_X, 0x38bdf8);
      const gate = new THREE.Mesh(
        new THREE.TorusGeometry(2.2, 0.12, 8, 24),
        new THREE.MeshStandardMaterial({ color: 0xfde047, emissive: 0xfacc15, emissiveIntensity: 0.4 })
      );
      gate.position.set(0, 1.6, -110);
      scene.add(gate);
      ctx.data.orbs = {
        alon: makeOrb(THREE, 0xfb7185),
        dad: makeOrb(THREE, 0x38bdf8)
      };
      scene.add(ctx.data.orbs.alon, ctx.data.orbs.dad);
      ctx.alon.x = ALON_X; ctx.dad.x = DAD_X;
      ctx._worldSky = true;
    },
    update(ctx, dt) {
      const t = ctx.data.three;
      if (!t) return;
      const { camera } = t;
      ["alon", "dad"].forEach((id) => {
        if (ctx.data.done[id]) return;
        const inn = ctx.input(id);
        if (ctx.pressed(id, "left")) ctx.data.lanes[id] = Math.max(-1, ctx.data.lanes[id] - 1);
        if (ctx.pressed(id, "right")) ctx.data.lanes[id] = Math.min(1, ctx.data.lanes[id] + 1);
        const want = ctx.data.centers[id] + ctx.data.lanes[id] * 1.6;
        ctx.data.x[id] += (want - ctx.data.x[id]) * Math.min(1, 10 * dt);
        ctx.data.z[id] += (18 + (inn.up ? 6 : 0)) * dt;
        const orb = ctx.data.orbs[id];
        orb.position.set(ctx.data.x[id], 0.8 + Math.sin(ctx.t * 6) * 0.08, -ctx.data.z[id]);
        if (ctx.data.z[id] >= 110) {
          ctx.data.done[id] = true;
          ctx.addScore(id === "alon" ? ctx.alon : ctx.dad, 1);
          ctx.end(id, `${id === "alon" ? "Alon" : "Dad"} wins!`, "Rainbow gate!", "🌈");
        }
      });
      ctx.setGoal(`${Math.max(ctx.data.z.alon, ctx.data.z.dad) | 0}m`);
      const midX = (ctx.data.x.alon + ctx.data.x.dad) * 0.08;
      const lead = Math.max(ctx.data.z.alon, ctx.data.z.dad);
      camera.position.lerp({ x: midX, y: 6, z: 12 - lead } , 0.08);
      camera.lookAt(midX, 1.2, -lead - 12);
      t.renderer.render(t.scene, camera);
    },
    draw() {}
  },

  "ring-glide": {
    title: "Ring Glide",
    emoji: "💍",
    blurb: "Fly a hoop course in the sky. First to thread 8 rings wins!",
    hintAlon: "Alon: WASD fly",
    hintDad: "Dad: arrows fly",
    goal: "8 RINGS",
    hearts: false,
    mode: "3d",
    async setup(ctx) {
      if (ctx._worldRing) {
        ctx.data.pos = { alon: { x: -2.2, y: 2, z: 0 }, dad: { x: 2.2, y: 2, z: 0 } };
        ctx.data.rings.forEach((r) => { r.userData.hit = { alon: false, dad: false }; });
        return;
      }
      const t = await bootThree(ctx, 0x38bdf8);
      const { THREE, scene, camera } = t;
      camera.position.set(0, 4, 10);
      ctx.data.pos = {
        alon: { x: -2.2, y: 2, z: 0 },
        dad: { x: 2.2, y: 2, z: 0 }
      };
      ctx.data.orbs = { alon: makeOrb(THREE, 0xfb7185), dad: makeOrb(THREE, 0x38bdf8) };
      scene.add(ctx.data.orbs.alon, ctx.data.orbs.dad);
      ctx.data.rings = [];
      for (let i = 0; i < 10; i++) {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(1.1, 0.08, 8, 24),
          new THREE.MeshStandardMaterial({ color: i % 2 ? 0xfbbf24 : 0xf472b6 })
        );
        ring.position.set((i % 2 ? 1.4 : -1.4), 1.6 + (i % 3) * 0.5, -12 - i * 9);
        ring.userData.hit = { alon: false, dad: false };
        scene.add(ring);
        ctx.data.rings.push(ring);
      }
      ctx._worldRing = true;
    },
    update(ctx, dt) {
      const t = ctx.data.three;
      if (!t) return;
      ["alon", "dad"].forEach((id) => {
        const inn = ctx.input(id);
        const p = ctx.data.pos[id];
        // +X is screen-right while looking toward -Z.
        p.x += inn.ax * 6 * dt;
        p.y += -inn.ay * 5 * dt;
        p.z -= (7 + (inn.up ? 3 : 0)) * dt;
        p.x = ctx.clamp(p.x, -6, 6);
        p.y = ctx.clamp(p.y, 0.4, 6);
        ctx.data.orbs[id].position.set(p.x, p.y, p.z);
        ctx.data.rings.forEach((r) => {
          if (r.userData.hit[id]) return;
          const d = Math.hypot(r.position.x - p.x, r.position.y - p.y, r.position.z - p.z);
          if (d < 1.2) {
            r.userData.hit[id] = true;
            ctx.addScore(id === "alon" ? ctx.alon : ctx.dad, 1);
            ctx.chime();
          }
        });
      });
      const lead = Math.min(ctx.data.pos.alon.z, ctx.data.pos.dad.z);
      t.camera.position.lerp({ x: 0, y: 4.2, z: lead + 10 }, 0.1);
      t.camera.lookAt(0, 2, lead - 8);
      t.renderer.render(t.scene, t.camera);
      ctx.maybeFirstTo(8);
    },
    draw() {}
  },

  "maze-marble": {
    title: "Maze Marble",
    emoji: "🔮",
    blurb: "Tilt your marble through the walls. First into the glow hole wins!",
    hintAlon: "Alon: WASD tilt",
    hintDad: "Dad: arrows tilt",
    goal: "HOLE",
    hearts: false,
    mode: "3d",
    async setup(ctx) {
      if (ctx._worldMarble) {
        ctx.data.ball = { alon: { x: -5.5, z: 5.5, vx: 0, vz: 0 }, dad: { x: -4.4, z: 5.5, vx: 0, vz: 0 } };
        return;
      }
      const t = await bootThree(ctx, 0x134e4a);
      const { THREE, scene, camera } = t;
      camera.position.set(0, 14, 10);
      const floor = new THREE.Mesh(
        new THREE.BoxGeometry(16, 0.3, 16),
        new THREE.MeshStandardMaterial({ color: 0x34d399 })
      );
      floor.position.y = -0.15;
      scene.add(floor);
      ctx.data.walls = [];
      const addWall = (x, z, w, d) => {
        const m = new THREE.Mesh(
          new THREE.BoxGeometry(w, 0.8, d),
          new THREE.MeshStandardMaterial({ color: 0x115e59 })
        );
        m.position.set(x, 0.4, z);
        scene.add(m);
        ctx.data.walls.push({ x, z, w, d });
      };
      addWall(0, -3, 10, 0.4);
      addWall(-3, 1.5, 0.4, 8);
      addWall(3, 2, 0.4, 6);
      addWall(0, 5, 8, 0.4);
      const hole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.55, 0.55, 0.2, 18),
        new THREE.MeshStandardMaterial({ color: 0xfde047, emissive: 0xfacc15, emissiveIntensity: 0.5 })
      );
      hole.position.set(5.2, 0.05, -5.2);
      scene.add(hole);
      ctx.data.hole = { x: 5.2, z: -5.2 };
      ctx.data.ball = {
        alon: { x: -5.5, z: 5.5, vx: 0, vz: 0 },
        dad: { x: -4.4, z: 5.5, vx: 0, vz: 0 }
      };
      ctx.data.orbs = { alon: makeOrb(THREE, 0xfb7185), dad: makeOrb(THREE, 0x38bdf8) };
      scene.add(ctx.data.orbs.alon, ctx.data.orbs.dad);
      ctx._worldMarble = true;
    },
    update(ctx, dt) {
      const t = ctx.data.three;
      if (!t) return;
      ["alon", "dad"].forEach((id) => {
        const inn = ctx.input(id);
        const b = ctx.data.ball[id];
        // Screen-right is +X; screen-up (away) is -Z from this camera.
        b.vx += inn.ax * 18 * dt;
        b.vz += inn.ay * 18 * dt;
        b.vx *= Math.pow(0.18, dt);
        b.vz *= Math.pow(0.18, dt);
        b.x += b.vx * dt;
        b.z += b.vz * dt;
        b.x = ctx.clamp(b.x, -7.4, 7.4);
        b.z = ctx.clamp(b.z, -7.4, 7.4);
        ctx.data.walls.forEach((w) => {
          const dx = Math.abs(b.x - w.x) - (w.w / 2 + 0.35);
          const dz = Math.abs(b.z - w.z) - (w.d / 2 + 0.35);
          if (dx < 0 && dz < 0) {
            if (dx > dz) { b.x += Math.sign(b.x - w.x) * -dx; b.vx *= -0.3; }
            else { b.z += Math.sign(b.z - w.z) * -dz; b.vz *= -0.3; }
          }
        });
        ctx.data.orbs[id].position.set(b.x, 0.42, b.z);
        if (Math.hypot(b.x - ctx.data.hole.x, b.z - ctx.data.hole.z) < 0.7) {
          ctx.addScore(id === "alon" ? ctx.alon : ctx.dad, 1);
          ctx.end(id, `${id === "alon" ? "Alon" : "Dad"} wins!`, "Down the glow hole!", "🔮");
        }
      });
      t.camera.lookAt(0, 0, 0);
      t.renderer.render(t.scene, t.camera);
    },
    draw() {}
  },

  "space-pads": {
    title: "Space Pads",
    emoji: "🚀",
    blurb: "Hop the moon pads. First buddy to the flag pad wins!",
    hintAlon: "Alon: A D step · W hop",
    hintDad: "Dad: ← → step · ↑ hop",
    goal: "MOON",
    hearts: false,
    mode: "3d",
    async setup(ctx) {
      if (ctx._worldPads) {
        ctx.data.idx = { alon: 0, dad: 0 };
        ctx.data.cool = { alon: 0, dad: 0 };
        return;
      }
      const t = await bootThree(ctx, 0x0f172a);
      const { THREE, scene, camera } = t;
      camera.position.set(0, 8, 12);
      ctx.data.pads = [];
      for (let i = 0; i < 8; i++) {
        const m = new THREE.Mesh(
          new THREE.CylinderGeometry(0.9, 0.9, 0.25, 16),
          new THREE.MeshStandardMaterial({ color: i === 7 ? 0xfde047 : 0xa78bfa })
        );
        m.position.set((i % 2 ? 1.6 : -1.6), 0, -i * 3.4);
        scene.add(m);
        ctx.data.pads.push(m.position.clone());
      }
      ctx.data.idx = { alon: 0, dad: 0 };
      ctx.data.cool = { alon: 0, dad: 0 };
      ctx.data.orbs = { alon: makeOrb(THREE, 0xfb7185), dad: makeOrb(THREE, 0x38bdf8) };
      scene.add(ctx.data.orbs.alon, ctx.data.orbs.dad);
      ctx._worldPads = true;
    },
    update(ctx, dt) {
      const t = ctx.data.three;
      if (!t) return;
      ["alon", "dad"].forEach((id) => {
        ctx.data.cool[id] -= dt;
        const inn = ctx.input(id);
        const pads = ctx.data.pads;
        let i = ctx.data.idx[id];
        if (ctx.data.cool[id] <= 0 && (inn.up || inn.right || (id === "alon" && inn.right))) {
          if (inn.up || inn.right) {
            i = Math.min(pads.length - 1, i + 1);
            ctx.data.idx[id] = i;
            ctx.data.cool[id] = 0.28;
            ctx.beep(640, 0.06, "triangle", 0.05);
          }
        }
        if (ctx.data.cool[id] <= 0 && inn.left && ctx.data.idx[id] > 0) {
          ctx.data.idx[id] -= 1;
          ctx.data.cool[id] = 0.28;
        }
        const target = pads[ctx.data.idx[id]];
        const orb = ctx.data.orbs[id];
        orb.position.lerp({ x: target.x + (id === "alon" ? -0.25 : 0.25), y: 0.7, z: target.z }, 0.2);
        if (ctx.data.idx[id] >= pads.length - 1) {
          ctx.addScore(id === "alon" ? ctx.alon : ctx.dad, 1);
          ctx.end(id, `${id === "alon" ? "Alon" : "Dad"} wins!`, "Moon hop!", "🚀");
        }
      });
      const lead = ctx.data.orbs.alon.position.clone().lerp(ctx.data.orbs.dad.position, 0.5);
      t.camera.position.lerp({ x: 0, y: 8, z: lead.z + 10 }, 0.08);
      t.camera.lookAt(lead.x, 0.4, lead.z);
      t.renderer.render(t.scene, t.camera);
    },
    draw() {}
  }
};
