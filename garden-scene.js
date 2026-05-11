// Rewardify garden — FarmVille-inspired isometric 3D farm.
// Cartoony low-poly tile grid with stylized plants representing each financial product.
// Scroll-driven: camera arcs over the farm; plants grow in.

import * as THREE from "three";

const wrapper = document.getElementById("rewardify-canvas");
if (wrapper) {
  const renderCanvas = document.createElement("canvas");
  renderCanvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;z-index:2";
  wrapper.appendChild(renderCanvas);
  wrapper.classList.add("has-webgl");

  const renderer = new THREE.WebGLRenderer({ canvas: renderCanvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  // Soft pink-violet background for the canvas area
  scene.background = null;

  // Isometric-style perspective camera
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(7, 7, 7);
  camera.lookAt(0, 0.5, 0);

  // ---- Env ----
  function makeEnv() {
    const c = document.createElement("canvas");
    c.width = 1024; c.height = 512;
    const ctx = c.getContext("2d");
    const g = ctx.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, "#3a1a5a");
    g.addColorStop(0.5, "#ff8fd1");
    g.addColorStop(1, "#1a0a36");
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1024, 512);
    const tex = new THREE.CanvasTexture(c);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }
  scene.environment = makeEnv();

  // ---- Materials ----
  const matSoil = new THREE.MeshStandardMaterial({ color: 0x6b3a1f, roughness: 0.85 });
  const matSoilDark = new THREE.MeshStandardMaterial({ color: 0x5a2e15, roughness: 0.9 });
  const matGrass = new THREE.MeshStandardMaterial({ color: 0x6ed16a, roughness: 0.7 });
  const matGrassDark = new THREE.MeshStandardMaterial({ color: 0x57b85a, roughness: 0.75 });
  const matFence = new THREE.MeshStandardMaterial({ color: 0xc89a5a, roughness: 0.7 });
  const matFencePost = new THREE.MeshStandardMaterial({ color: 0xa17a3e, roughness: 0.8 });
  const matStone = new THREE.MeshStandardMaterial({ color: 0xb7a8c8, roughness: 0.6 });

  // ---- Build the farm ----
  const farm = new THREE.Group();
  scene.add(farm);

  // Ground base (chunky disc/square for the whole plot)
  const baseSize = 6.5;
  const baseGeo = new THREE.BoxGeometry(baseSize, 0.35, baseSize);
  const base = new THREE.Mesh(baseGeo, matGrass);
  base.position.y = -0.175;
  farm.add(base);

  // Grass edge highlight (slightly larger thinner layer)
  const edge = new THREE.Mesh(
    new THREE.BoxGeometry(baseSize + 0.15, 0.08, baseSize + 0.15),
    matGrassDark
  );
  edge.position.y = -0.36;
  farm.add(edge);

  // ---- Tile grid: 3x3 of cultivated plots, each holds a plant ----
  const GRID = 3;
  const TILE = 1.6;
  const tileGap = 0.05;
  const offset = -((GRID - 1) * TILE) / 2;

  // Order: 5 financial plants + 4 decorative tiles (grass with small accents)
  // Center the 5 financial plants in interesting positions.
  const plantSlots = {
    "0,0": "sprout",   // top-left: Savings
    "2,0": "oak",      // top-right: FD
    "1,1": "bloom",    // center: Index Fund
    "0,2": "sunflower",// bottom-left: Gold
    "2,2": "cactus",   // bottom-right: Crypto
  };

  function makeSoilTile() {
    const t = new THREE.Group();
    // Soil square slightly raised
    const soil = new THREE.Mesh(new THREE.BoxGeometry(TILE - 0.1, 0.18, TILE - 0.1), matSoil);
    soil.position.y = 0.04;
    t.add(soil);
    // darker soil dots (rows)
    for (let i = 0; i < 3; i++) {
      const row = new THREE.Mesh(
        new THREE.BoxGeometry(TILE - 0.25, 0.04, 0.06),
        matSoilDark
      );
      row.position.set(0, 0.14, -0.45 + i * 0.45);
      t.add(row);
    }
    return t;
  }

  function makeGrassTile(variant = 0) {
    const t = new THREE.Group();
    const g = new THREE.Mesh(new THREE.BoxGeometry(TILE - 0.1, 0.12, TILE - 0.1), matGrass);
    g.position.y = 0.01;
    t.add(g);
    // Decorations: a tiny stone, a flower, a bush, depending on variant
    if (variant === 0) {
      // small stones
      for (let i = 0; i < 2; i++) {
        const s = new THREE.Mesh(new THREE.DodecahedronGeometry(0.12 + i * 0.04, 0), matStone);
        s.position.set((Math.random() - 0.5) * 0.9, 0.1, (Math.random() - 0.5) * 0.9);
        s.rotation.set(Math.random(), Math.random(), Math.random());
        t.add(s);
      }
    } else if (variant === 1) {
      // tiny flowers
      for (let i = 0; i < 3; i++) {
        const flower = new THREE.Group();
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.18, 6), new THREE.MeshStandardMaterial({ color: 0x4ea84a, roughness: 0.6 }));
        stem.position.y = 0.09;
        flower.add(stem);
        const colors = [0xff8fd1, 0xffc78a, 0x7ee8ff];
        const petal = new THREE.Mesh(
          new THREE.SphereGeometry(0.07, 12, 8),
          new THREE.MeshStandardMaterial({ color: colors[i % 3], roughness: 0.5 })
        );
        petal.position.y = 0.21;
        petal.scale.set(1, 0.6, 1);
        flower.add(petal);
        flower.position.set((Math.random() - 0.5) * 0.9, 0.06, (Math.random() - 0.5) * 0.9);
        t.add(flower);
      }
    } else if (variant === 2) {
      // little bush
      const bush = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.28, 0),
        new THREE.MeshStandardMaterial({ color: 0x4ea84a, roughness: 0.7 })
      );
      bush.position.set(0.2, 0.18, -0.15);
      t.add(bush);
      const bush2 = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.22, 0),
        new THREE.MeshStandardMaterial({ color: 0x57b85a, roughness: 0.7 })
      );
      bush2.position.set(-0.25, 0.15, 0.2);
      t.add(bush2);
    } else {
      // mushroom
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.16, 10), new THREE.MeshStandardMaterial({ color: 0xf6efdf, roughness: 0.6 }));
      stem.position.set(0, 0.13, 0);
      t.add(stem);
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xff6b8a, roughness: 0.55 }));
      cap.position.set(0, 0.22, 0);
      cap.scale.set(1, 0.65, 1);
      t.add(cap);
      // white dots
      for (let i = 0; i < 4; i++) {
        const dot = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), new THREE.MeshStandardMaterial({ color: 0xffffff }));
        const a = (i / 4) * Math.PI * 2;
        dot.position.set(Math.cos(a) * 0.1, 0.27, Math.sin(a) * 0.1);
        t.add(dot);
      }
    }
    return t;
  }

  // ---- Plants ----
  function makeSprout() {
    // Savings — small sprout
    const g = new THREE.Group();
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.05, 0.45, 8),
      new THREE.MeshStandardMaterial({ color: 0x4ea84a, roughness: 0.6 })
    );
    stem.position.y = 0.32;
    g.add(stem);
    // Two leaves
    for (let i = 0; i < 2; i++) {
      const leaf = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 14, 10),
        new THREE.MeshStandardMaterial({ color: 0x7ee8ff, roughness: 0.5, emissive: 0x9fffd5, emissiveIntensity: 0.1 })
      );
      leaf.scale.set(1.2, 0.4, 0.7);
      leaf.position.set(i === 0 ? -0.16 : 0.16, 0.5, 0);
      leaf.rotation.z = i === 0 ? 0.5 : -0.5;
      g.add(leaf);
    }
    return g;
  }

  function makeOak() {
    // FD — sturdy oak/tree
    const g = new THREE.Group();
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.16, 0.7, 10),
      new THREE.MeshStandardMaterial({ color: 0x7a4a25, roughness: 0.8 })
    );
    trunk.position.y = 0.45;
    g.add(trunk);
    // Layered foliage
    const foliage = new THREE.Group();
    const fmat1 = new THREE.MeshStandardMaterial({ color: 0xb48bff, roughness: 0.55, emissive: 0x6e4ab0, emissiveIntensity: 0.15 });
    const fmat2 = new THREE.MeshStandardMaterial({ color: 0x9d75ec, roughness: 0.55 });
    const f1 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.36, 0), fmat1);
    f1.position.set(0, 0.95, 0);
    foliage.add(f1);
    const f2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.28, 0), fmat2);
    f2.position.set(-0.22, 1.0, 0.12);
    foliage.add(f2);
    const f3 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.26, 0), fmat1);
    f3.position.set(0.22, 1.05, -0.1);
    foliage.add(f3);
    const f4 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 0), fmat2);
    f4.position.set(0.05, 1.25, 0.04);
    foliage.add(f4);
    g.add(foliage);
    g.userData = { foliage };
    return g;
  }

  function makeBloom() {
    // Index fund — flowering plant
    const g = new THREE.Group();
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.07, 0.6, 8),
      new THREE.MeshStandardMaterial({ color: 0x4ea84a, roughness: 0.6 })
    );
    stem.position.y = 0.4;
    g.add(stem);
    // Multiple blossoms
    const headG = new THREE.Group();
    headG.position.y = 0.78;
    const petalMat = new THREE.MeshStandardMaterial({ color: 0xff8fd1, roughness: 0.45, emissive: 0xff6db8, emissiveIntensity: 0.18 });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const petal = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 10), petalMat);
      petal.scale.set(1, 0.45, 1);
      petal.position.set(Math.cos(a) * 0.15, 0, Math.sin(a) * 0.15);
      headG.add(petal);
    }
    const center = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 18, 14),
      new THREE.MeshStandardMaterial({ color: 0xffc78a, roughness: 0.5, emissive: 0xff8a4a, emissiveIntensity: 0.3 })
    );
    headG.add(center);
    g.add(headG);
    // Two leaves on stem
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x57b85a, roughness: 0.55 });
    for (let i = 0; i < 2; i++) {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8), leafMat);
      leaf.scale.set(1.3, 0.35, 0.7);
      leaf.position.set(i === 0 ? -0.14 : 0.14, 0.42, 0);
      leaf.rotation.z = i === 0 ? 0.7 : -0.7;
      g.add(leaf);
    }
    g.userData = { headG };
    return g;
  }

  function makeSunflower() {
    // Gold — sunflower with gold center
    const g = new THREE.Group();
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.08, 0.85, 8),
      new THREE.MeshStandardMaterial({ color: 0x4ea84a, roughness: 0.6 })
    );
    stem.position.y = 0.55;
    g.add(stem);
    const headG = new THREE.Group();
    headG.position.y = 1.05;
    headG.rotation.x = -0.3;
    // Petals
    const petalMat = new THREE.MeshStandardMaterial({ color: 0xffc78a, roughness: 0.45, emissive: 0xff9a3a, emissiveIntensity: 0.2 });
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const p = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 10), petalMat);
      p.scale.set(0.6, 0.25, 1.3);
      p.position.set(Math.cos(a) * 0.22, 0, Math.sin(a) * 0.22);
      p.lookAt(0, 0, 0);
      headG.add(p);
    }
    // Center: gold disc (metallic)
    const center = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.16, 0.05, 24),
      new THREE.MeshPhysicalMaterial({
        color: 0xffd25e, metalness: 0.95, roughness: 0.2,
        iridescence: 0.5, iridescenceIOR: 1.3,
        emissive: 0xffa520, emissiveIntensity: 0.25,
      })
    );
    center.rotation.x = Math.PI / 2;
    headG.add(center);
    // Big leaf
    const leaf = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 14, 10),
      new THREE.MeshStandardMaterial({ color: 0x57b85a, roughness: 0.55 })
    );
    leaf.scale.set(1.4, 0.35, 0.8);
    leaf.position.set(-0.2, 0.55, 0);
    leaf.rotation.z = 0.8;
    g.add(leaf);
    g.add(headG);
    g.userData = { headG };
    return g;
  }

  function makeCactus() {
    // Crypto — saguaro cactus, spiky
    const g = new THREE.Group();
    const mainMat = new THREE.MeshStandardMaterial({
      color: 0x4caa6e, roughness: 0.65,
      emissive: 0x2a7a4a, emissiveIntensity: 0.1,
    });
    // Main trunk
    const trunk = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.65, 10, 14), mainMat);
    trunk.position.y = 0.55;
    g.add(trunk);
    // Two arms
    const arm1 = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.32, 8, 12), mainMat);
    arm1.position.set(-0.22, 0.55, 0);
    arm1.rotation.z = 0.6;
    g.add(arm1);
    const arm1Up = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.25, 8, 12), mainMat);
    arm1Up.position.set(-0.34, 0.78, 0);
    g.add(arm1Up);
    const arm2 = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.26, 8, 12), mainMat);
    arm2.position.set(0.18, 0.65, 0);
    arm2.rotation.z = -0.6;
    g.add(arm2);
    const arm2Up = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.2, 8, 12), mainMat);
    arm2Up.position.set(0.28, 0.86, 0);
    g.add(arm2Up);
    // Spikes (small cones)
    const spikeMat = new THREE.MeshStandardMaterial({ color: 0xfff5d8, roughness: 0.4 });
    for (let i = 0; i < 16; i++) {
      const s = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.05, 6), spikeMat);
      const a = (i / 16) * Math.PI * 2;
      const y = 0.3 + (i % 5) * 0.15;
      s.position.set(Math.cos(a) * 0.2, y, Math.sin(a) * 0.2);
      s.rotation.z = Math.PI / 2;
      s.lookAt(s.position.x * 2, y, s.position.z * 2);
      g.add(s);
    }
    // Bitcoin-orange flower on top
    const flower = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 18, 12),
      new THREE.MeshPhysicalMaterial({
        color: 0xff9a3a, roughness: 0.3, metalness: 0.3,
        emissive: 0xff6b1a, emissiveIntensity: 0.45,
        iridescence: 0.6, iridescenceIOR: 1.3,
      })
    );
    flower.position.y = 1.0;
    flower.scale.set(1, 0.7, 1);
    g.add(flower);
    g.userData = { flower };
    return g;
  }

  const plantBuilders = { sprout: makeSprout, oak: makeOak, bloom: makeBloom, sunflower: makeSunflower, cactus: makeCactus };
  const plants = [];

  // Build grid
  let grassVariant = 0;
  for (let z = 0; z < GRID; z++) {
    for (let x = 0; x < GRID; x++) {
      const key = `${x},${z}`;
      const slot = plantSlots[key];
      const tileGroup = new THREE.Group();
      tileGroup.position.set(offset + x * (TILE + tileGap), 0, offset + z * (TILE + tileGap));
      if (slot) {
        const soilTile = makeSoilTile();
        tileGroup.add(soilTile);
        const plant = plantBuilders[slot]();
        plant.userData.kind = slot;
        plant.userData.targetScale = 1;
        plant.scale.setScalar(0.001);
        tileGroup.add(plant);
        plants.push(plant);
      } else {
        const gTile = makeGrassTile(grassVariant++);
        tileGroup.add(gTile);
      }
      farm.add(tileGroup);
    }
  }

  // ---- Fence around the farm ----
  function buildFence() {
    const fence = new THREE.Group();
    const halfBase = baseSize / 2;
    const postH = 0.45;
    const postCount = 6;
    const railLen = baseSize / (postCount - 1);
    for (let side = 0; side < 4; side++) {
      for (let i = 0; i < postCount; i++) {
        const t = -halfBase + i * railLen;
        let x = 0, z = 0;
        if (side === 0) { x = t; z = -halfBase; }
        else if (side === 1) { x = halfBase; z = t; }
        else if (side === 2) { x = t; z = halfBase; }
        else { x = -halfBase; z = t; }
        // Post
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, postH, 0.1), matFencePost);
        post.position.set(x, postH / 2, z);
        fence.add(post);
      }
      // Two rails per side
      for (let r = 0; r < 2; r++) {
        const rail = new THREE.Mesh(
          new THREE.BoxGeometry((side % 2 === 0) ? baseSize : 0.06, 0.05, (side % 2 === 0) ? 0.06 : baseSize),
          matFence
        );
        const y = 0.16 + r * 0.18;
        if (side === 0) rail.position.set(0, y, -halfBase);
        else if (side === 1) rail.position.set(halfBase, y, 0);
        else if (side === 2) rail.position.set(0, y, halfBase);
        else rail.position.set(-halfBase, y, 0);
        fence.add(rail);
      }
    }
    return fence;
  }
  farm.add(buildFence());

  // ---- Sun (top-right) ----
  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 24, 18),
    new THREE.MeshBasicMaterial({ color: 0xfff0c8 })
  );
  sun.position.set(3.5, 4, -2.5);
  scene.add(sun);
  const sunGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 24, 18),
    new THREE.MeshBasicMaterial({ color: 0xffc78a, transparent: true, opacity: 0.3 })
  );
  sunGlow.position.copy(sun.position);
  scene.add(sunGlow);

  // ---- Clouds (cartoon puffy spheres) ----
  const clouds = new THREE.Group();
  scene.add(clouds);
  function makeCloud(x, y, z, scale = 1) {
    const c = new THREE.Group();
    const m = new THREE.MeshStandardMaterial({ color: 0xfff5fa, roughness: 0.9, emissive: 0xff8fd1, emissiveIntensity: 0.05 });
    const positions = [
      [0, 0, 0, 0.45],
      [0.38, 0.05, 0, 0.32],
      [-0.35, 0.0, 0, 0.36],
      [0.18, 0.18, 0, 0.28],
      [-0.15, 0.18, 0, 0.26],
    ];
    positions.forEach(([px, py, pz, r]) => {
      const s = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 14), m);
      s.position.set(px, py, pz);
      c.add(s);
    });
    c.position.set(x, y, z);
    c.scale.setScalar(scale);
    return c;
  }
  const cloudData = [
    { c: makeCloud(-2.5, 3.5, -2, 0.8), speed: 0.03 },
    { c: makeCloud(2, 4, 0.5, 0.6), speed: 0.04 },
    { c: makeCloud(-3, 3.8, 1.5, 0.7), speed: 0.025 },
    { c: makeCloud(2.8, 3.4, -3, 0.55), speed: 0.035 },
  ];
  cloudData.forEach(d => clouds.add(d.c));

  // ---- Floating coins (FarmVille-style XP) ----
  const coins = new THREE.Group();
  scene.add(coins);
  const coinData = [];
  for (let i = 0; i < 8; i++) {
    const coin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.13, 0.04, 24),
      new THREE.MeshPhysicalMaterial({
        color: 0xffd25e, metalness: 0.95, roughness: 0.15,
        iridescence: 0.5, iridescenceIOR: 1.3,
        emissive: 0xffa520, emissiveIntensity: 0.3,
      })
    );
    coin.rotation.x = Math.PI / 2;
    coinData.push({
      base: new THREE.Vector3((Math.random() - 0.5) * 5, 2 + Math.random() * 1.5, (Math.random() - 0.5) * 5),
      bobSpeed: 0.8 + Math.random() * 1.2,
      bobAmp: 0.15 + Math.random() * 0.15,
      spin: 0.5 + Math.random() * 1.0,
      phase: Math.random() * Math.PI * 2,
    });
    coins.add(coin);
  }

  // ---- Butterfly (cute detail) ----
  function makeButterfly(color1, color2) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.025, 0.1, 4, 8),
      new THREE.MeshStandardMaterial({ color: 0x1a0a2e, roughness: 0.6 })
    );
    g.add(body);
    const wingMat1 = new THREE.MeshStandardMaterial({ color: color1, roughness: 0.4, emissive: color1, emissiveIntensity: 0.2, side: THREE.DoubleSide });
    const wingMat2 = new THREE.MeshStandardMaterial({ color: color2, roughness: 0.4, emissive: color2, emissiveIntensity: 0.2, side: THREE.DoubleSide });
    const wingGeo = new THREE.SphereGeometry(0.12, 14, 10);
    wingGeo.scale(1, 0.05, 0.7);
    const wL = new THREE.Mesh(wingGeo, wingMat1);
    wL.position.set(-0.12, 0, 0);
    const wR = new THREE.Mesh(wingGeo, wingMat2);
    wR.position.set(0.12, 0, 0);
    g.add(wL); g.add(wR);
    g.userData = { wL, wR };
    return g;
  }
  const butterfly = makeButterfly(0xff8fd1, 0x7ee8ff);
  scene.add(butterfly);

  // ---- Lights ----
  const sunLight = new THREE.DirectionalLight(0xfff0d0, 1.5);
  sunLight.position.set(3.5, 5, -2);
  scene.add(sunLight);
  const fillLight = new THREE.DirectionalLight(0xff8fd1, 0.55);
  fillLight.position.set(-4, 2, 3);
  scene.add(fillLight);
  const rim = new THREE.DirectionalLight(0x7ee8ff, 0.6);
  rim.position.set(0, 1, -4);
  scene.add(rim);
  scene.add(new THREE.AmbientLight(0xc9b8ff, 0.5));

  // ---- Resize ----
  function resize() {
    const r = wrapper.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  // ---- Scroll progress for this section ----
  function getScrollProgress() {
    const r = wrapper.getBoundingClientRect();
    const vh = window.innerHeight;
    const total = r.height + vh;
    const seen = vh - r.top;
    return Math.max(0, Math.min(1, seen / total));
  }

  let mouseX = 0, mouseY = 0;
  wrapper.addEventListener("pointermove", (e) => {
    const r = wrapper.getBoundingClientRect();
    mouseX = ((e.clientX - r.left) / r.width - 0.5) * 2;
    mouseY = ((e.clientY - r.top) / r.height - 0.5) * 2;
  });

  // ---- Animate ----
  function tick(t) {
    const time = t * 0.001;
    const prog = getScrollProgress();

    // Camera arc: isometric → slightly closer/lower as we scroll through
    const camAngle = Math.PI / 4 + prog * 0.6 + mouseX * 0.2;
    const camDist = 9.5 - prog * 1.5;
    const camHeight = 7 - prog * 1.2 + mouseY * 0.5;
    camera.position.x = Math.cos(camAngle) * camDist;
    camera.position.z = Math.sin(camAngle) * camDist;
    camera.position.y = camHeight;
    camera.lookAt(0, 0.4, 0);

    // Plants grow in based on scroll + per-plant phase
    plants.forEach((p, i) => {
      const grow = Math.min(1, Math.max(0, prog * 1.6 - i * 0.05));
      const targetScale = grow;
      p.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.06);
      // Gentle sway
      p.rotation.z = Math.sin(time * 0.8 + i) * 0.05;
      if (p.userData.headG) {
        p.userData.headG.rotation.y = Math.sin(time * 0.6 + i) * 0.15;
      }
      if (p.userData.flower) {
        p.userData.flower.position.y = 1.0 + Math.sin(time * 1.5 + i) * 0.03;
      }
    });

    // Clouds drift
    cloudData.forEach(d => {
      d.c.position.x += d.speed * 0.01;
      if (d.c.position.x > 5) d.c.position.x = -5;
    });

    // Coins
    coins.children.forEach((c, i) => {
      const d = coinData[i];
      c.position.x = d.base.x + Math.cos(time * 0.5 + d.phase) * 0.4;
      c.position.y = d.base.y + Math.sin(time * d.bobSpeed + d.phase) * d.bobAmp;
      c.position.z = d.base.z + Math.sin(time * 0.4 + d.phase) * 0.4;
      c.rotation.y += d.spin * 0.04;
    });

    // Sun pulse
    sunGlow.scale.setScalar(1 + Math.sin(time * 1.5) * 0.08);

    // Butterfly figure-8
    const bx = Math.sin(time * 0.6) * 1.8;
    const bz = Math.sin(time * 1.2) * 1.4;
    const by = 1.0 + Math.sin(time * 0.8) * 0.3;
    butterfly.position.set(bx, by, bz);
    butterfly.rotation.y = Math.atan2(Math.cos(time * 0.6), Math.cos(time * 1.2) * 1.4 / 1.8);
    // Wing flap
    const flap = Math.sin(time * 18) * 0.7;
    butterfly.userData.wL.rotation.z = flap;
    butterfly.userData.wR.rotation.z = -flap;

    // Subtle farm tilt with mouse
    farm.rotation.y = mouseX * 0.08;

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
