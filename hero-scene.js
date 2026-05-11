// Hero scene — Planetono-inspired: a bold, cartoony low-poly 3D scene of a
// yellow plate with a stack of coins, a sprouting plant, and floating sparkles.
// Thick black outline feel via Fresnel-style emissive rims. Drag to rotate.

import * as THREE from "three";

const canvas = document.getElementById("hero-canvas");
if (canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 3.5, 7);

  // --- Palette
  const RED = 0xEB3322, YELLOW = 0xFCC634, INK = 0x0a0a0a, WHITE = 0xffffff, LEAF = 0x2f9e6a;
  function flatMat(color) {
    return new THREE.MeshToonMaterial({ color });
  }
  function outline(mesh, scale = 1.04, color = INK) {
    const o = new THREE.Mesh(mesh.geometry, new THREE.MeshBasicMaterial({ color, side: THREE.BackSide }));
    o.scale.multiplyScalar(scale);
    mesh.add(o);
    return o;
  }

  const root = new THREE.Group();
  scene.add(root);

  // Plate (red rounded disc with thick black rim)
  const plate = new THREE.Group();
  const platTop = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 0.35, 48), flatMat(RED));
  plate.add(platTop); outline(platTop, 1.04);
  const platRim = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.12, 12, 48), flatMat(INK));
  platRim.rotation.x = Math.PI / 2; platRim.position.y = 0.18;
  plate.add(platRim);
  plate.position.y = 0;
  plate.rotation.x = -0.2;
  root.add(plate);

  // Yellow tray on plate
  const tray = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 0.18, 32), flatMat(YELLOW));
  tray.position.y = 0.27; outline(tray, 1.05);
  plate.add(tray);

  // Stack of coins (the central "burger" stand-in)
  const stack = new THREE.Group();
  stack.position.y = 0.36;
  const coinMat = flatMat(YELLOW);
  const stackInk = flatMat(INK);
  for (let i = 0; i < 5; i++) {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.55 - i * 0.03, 0.55 - i * 0.03, 0.18, 32), coinMat);
    c.position.y = i * 0.2;
    outline(c, 1.06);
    stack.add(c);
  }
  // top dome
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2), flatMat(RED));
  dome.position.y = 1.05; outline(dome, 1.06);
  stack.add(dome);
  // Indian rupee glyph as a flat extruded shape on top (simplified ₹)
  const rupeeShape = new THREE.Shape();
  // simple ₹ approximated as bars + slash
  rupeeShape.moveTo(-0.2, 0.25); rupeeShape.lineTo(0.2, 0.25); rupeeShape.lineTo(0.2, 0.32);
  rupeeShape.lineTo(0.05, 0.32); rupeeShape.lineTo(0.2, 0.05); rupeeShape.lineTo(0.2, -0.05);
  rupeeShape.lineTo(0.05, -0.05); rupeeShape.lineTo(0.2, -0.32); rupeeShape.lineTo(-0.2, -0.32);
  rupeeShape.lineTo(-0.2, -0.22); rupeeShape.lineTo(-0.02, -0.22); rupeeShape.lineTo(-0.2, 0.15);
  rupeeShape.lineTo(-0.2, 0.25);
  const rupeeGeo = new THREE.ExtrudeGeometry(rupeeShape, { depth: 0.08, bevelEnabled: false });
  const rupee = new THREE.Mesh(rupeeGeo, flatMat(INK));
  rupee.position.set(0, 1.35, 0);
  rupee.rotation.x = -0.3;
  stack.add(rupee);
  plate.add(stack);

  // A sprout in a tiny pot beside the stack
  const sproutGroup = new THREE.Group();
  sproutGroup.position.set(1.2, 0.36, 0.4);
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.4, 0.45, 18), flatMat(INK));
  pot.position.y = 0.22; sproutGroup.add(pot);
  const potRim = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.05, 10, 24), flatMat(INK));
  potRim.rotation.x = Math.PI / 2; potRim.position.y = 0.45; sproutGroup.add(potRim);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 0.55, 8), flatMat(LEAF));
  stem.position.y = 0.7; outline(stem, 1.18); sproutGroup.add(stem);
  // 2 cartoon leaves
  for (let i = 0; i < 2; i++) {
    const leafG = new THREE.SphereGeometry(0.22, 16, 12);
    leafG.scale(1.3, 0.35, 0.8);
    const leaf = new THREE.Mesh(leafG, flatMat(LEAF));
    leaf.position.set(i ? 0.18 : -0.18, 0.85, 0);
    leaf.rotation.z = i ? -0.7 : 0.7;
    outline(leaf, 1.1);
    sproutGroup.add(leaf);
  }
  // Yellow flower on top
  const flower = new THREE.Group();
  flower.position.y = 1.15;
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const petal = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 10), flatMat(YELLOW));
    petal.scale.set(1, 0.5, 1);
    petal.position.set(Math.cos(a) * 0.18, 0, Math.sin(a) * 0.18);
    outline(petal, 1.1);
    flower.add(petal);
  }
  const flowerCenter = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), flatMat(RED));
  outline(flowerCenter, 1.1);
  flower.add(flowerCenter);
  sproutGroup.add(flower);
  sproutGroup.userData.flower = flower;
  plate.add(sproutGroup);

  // Small fries-cup of coins
  const friesGroup = new THREE.Group();
  friesGroup.position.set(-1.3, 0.36, 0.3);
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.26, 0.55, 16), flatMat(RED));
  cup.position.y = 0.27; outline(cup, 1.06); friesGroup.add(cup);
  // gold sticks (coins on edge)
  const fries = [];
  for (let i = 0; i < 6; i++) {
    const f = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.55, 0.06), flatMat(YELLOW));
    f.position.set((Math.random() - 0.5) * 0.35, 0.75 + Math.random() * 0.1, (Math.random() - 0.5) * 0.35);
    outline(f, 1.18);
    friesGroup.add(f); fries.push(f);
  }
  plate.add(friesGroup);

  // Comic-style sparkle stars floating around the plate
  const sparkleGroup = new THREE.Group();
  scene.add(sparkleGroup);
  function makeStar(scale = 1) {
    const s = new THREE.Shape();
    const spikes = 4, outer = 0.32, inner = 0.10;
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? outer : inner;
      const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(a) * r, y = Math.sin(a) * r;
      if (i === 0) s.moveTo(x, y); else s.lineTo(x, y);
    }
    s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.08, bevelEnabled: false });
    const m = new THREE.Mesh(geo, flatMat(WHITE));
    outline(m, 1.18);
    m.scale.setScalar(scale);
    return m;
  }
  const sparkData = [];
  for (let i = 0; i < 8; i++) {
    const s = makeStar(0.5 + Math.random() * 0.6);
    sparkleGroup.add(s);
    sparkData.push({
      base: new THREE.Vector3((Math.random() - 0.5) * 7, 1 + Math.random() * 3, (Math.random() - 0.5) * 3 - 0.5),
      bobAmp: 0.2 + Math.random() * 0.2,
      bobSpeed: 0.6 + Math.random() * 0.6,
      phase: Math.random() * Math.PI * 2,
      spin: 0.5 + Math.random() * 0.8,
    });
  }

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.9));
  const key = new THREE.DirectionalLight(0xffffff, 1.0);
  key.position.set(4, 6, 5); scene.add(key);
  const fill = new THREE.DirectionalLight(0xfcc634, 0.4);
  fill.position.set(-4, 1, 2); scene.add(fill);

  // Resize
  function resize() {
    const r = canvas.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    const a = r.width / r.height;
    if (a < 0.9) { camera.position.set(0, 4.0, 9.5); }
    else if (a < 1.4) { camera.position.set(0, 3.8, 8.4); }
    else { camera.position.set(0, 3.5, 7.5); }
    camera.lookAt(0, 0.4, 0);
    camera.updateProjectionMatrix();
  }
  resize(); window.addEventListener("resize", resize);

  // Drag to rotate
  let dragging = false, lastX = 0, lastY = 0, rotY = 0.4, rotX = -0.05, vy = 0, autospin = true;
  canvas.style.cursor = "grab";
  function down(e) { dragging = true; autospin = false; const p = e.touches ? e.touches[0] : e; lastX = p.clientX; lastY = p.clientY; canvas.style.cursor = "grabbing"; }
  function move(e) { if (!dragging) return; const p = e.touches ? e.touches[0] : e; vy = (p.clientX - lastX) * 0.005; rotY += vy; rotX += (p.clientY - lastY) * 0.003; rotX = Math.max(-0.4, Math.min(0.4, rotX)); lastX = p.clientX; lastY = p.clientY; e.preventDefault?.(); }
  function up() { dragging = false; canvas.style.cursor = "grab"; }
  canvas.addEventListener("pointerdown", down);
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up);
  canvas.addEventListener("touchstart", down, { passive: false });
  canvas.addEventListener("touchmove", move, { passive: false });
  canvas.addEventListener("touchend", up);

  let scrollY = 0;
  window.addEventListener("scroll", () => { scrollY = window.scrollY; }, { passive: true });

  function tick(t) {
    const time = t * 0.001;
    const sn = Math.min(scrollY / (window.innerHeight || 1), 2);
    if (!dragging) { if (autospin) rotY += 0.003; vy *= 0.94; rotX += (-0.05 - rotX) * 0.02; }
    root.rotation.y = rotY;
    root.rotation.x = rotX;
    root.position.y = -0.4 + Math.sin(time * 1.0) * 0.08 - sn * 1.6;
    root.scale.setScalar(1 - sn * 0.18);

    // Stack bobs
    stack.rotation.y = time * 0.4;
    rupee.rotation.y = -time * 0.4;
    sproutGroup.userData.flower.rotation.y = time * 0.6;

    // Fries jiggle
    fries.forEach((f, i) => { f.rotation.z = Math.sin(time * 2 + i) * 0.1; });

    // Sparkles
    sparkleGroup.children.forEach((s, i) => {
      const d = sparkData[i];
      s.position.x = d.base.x;
      s.position.y = d.base.y + Math.sin(time * d.bobSpeed + d.phase) * d.bobAmp;
      s.position.z = d.base.z;
      s.rotation.z = time * d.spin;
    });

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
