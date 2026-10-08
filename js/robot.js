/* =========================================================
   3D ROBOT — Three.js bilan yasalgan (tashqi model fayli kerak emas)
   Sahifa skroll qilinganda robot 360° aylanadi.
   Ranglarni shu yerdan o'zgartirasiz:
   ========================================================= */
import * as THREE from './three.module.min.js';
import { RoomEnvironment } from './RoomEnvironment.js';

const YELLOW = 0xffc800;
const AMBER = 0xff9500;
const WHITE = 0xf4f2ec;
const BLACK = 0x0b0b0b;

const canvas = document.getElementById('robot');
const hero = document.getElementById('bosh');
const degEl = document.getElementById('deg');

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
} catch (e) {
  canvas.remove();
  throw e;
}
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
camera.position.set(0, 0.25, 7.6);
camera.lookAt(0, 0.1, 0);

/* ---------- Yorug'lik: oq asosiy + sariq kontur nurlari ---------- */
const key = new THREE.DirectionalLight(0xffffff, 1.6);
key.position.set(-3, 4, 5);
scene.add(key);
const rimR = new THREE.DirectionalLight(YELLOW, 7);
rimR.position.set(4, 2, -3);
scene.add(rimR);
const rimL = new THREE.DirectionalLight(AMBER, 5);
rimL.position.set(-4, 1, -2);
scene.add(rimL);
const under = new THREE.PointLight(YELLOW, 6, 8, 2);
under.position.set(0, -1.4, 2.2);
scene.add(under);

/* ---------- Materiallar ---------- */
const shell = new THREE.MeshPhysicalMaterial({ color: WHITE, roughness: 0.26, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.12 });
const visorMat = new THREE.MeshPhysicalMaterial({ color: BLACK, roughness: 0.06, metalness: 0.7, clearcoat: 1, clearcoatRoughness: 0.03, side: THREE.DoubleSide });
const metal = new THREE.MeshStandardMaterial({ color: 0x1b1b1b, roughness: 0.35, metalness: 0.9 });
const glow = new THREE.MeshStandardMaterial({ color: YELLOW, emissive: YELLOW, emissiveIntensity: 2.6, roughness: 0.4 });

const robot = new THREE.Group();
scene.add(robot);

/* ---------- Bosh ---------- */
const head = new THREE.Group();
head.position.y = 1.2;
robot.add(head);

const HS = new THREE.Vector3(0.86, 0.92, 0.88); // bosh shakli (eni, bo'yi, chuqurligi)
const skull = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 96), shell);
skull.scale.copy(HS);
head.add(skull);

// Qora yuz oynasi (visor)
const visor = new THREE.Mesh(
  new THREE.SphereGeometry(1.012, 96, 64, Math.PI / 2 - 0.82, 1.64, 0.98, 0.82),
  visorMat
);
visor.scale.copy(HS);
head.add(visor);

// Visor chetidagi sariq chiziq
const edge = new THREE.Mesh(
  new THREE.SphereGeometry(1.016, 96, 8, Math.PI / 2 - 0.84, 1.68, 1.8, 0.025),
  glow
);
edge.scale.copy(HS);
head.add(edge);

// Ko'zlar
const eyeGeo = new THREE.CapsuleGeometry(0.045, 0.16, 8, 16);
const eyes = [-1, 1].map(s => {
  const e = new THREE.Mesh(eyeGeo, glow);
  const x = 0.27 * s, y = 0.06;
  const z = HS.z * Math.sqrt(Math.max(0, 1 - (x / HS.x) ** 2 - (y / HS.y) ** 2)) + 0.012;
  e.position.set(x, y, z);
  e.rotation.z = Math.PI / 2;
  e.rotation.y = Math.atan2(x, z) * 0.9;
  head.add(e);
  return e;
});

// Quloqlar
[-1, 1].forEach(s => {
  const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.27, 0.18, 64), shell);
  ear.rotation.z = Math.PI / 2;
  ear.position.set(0.85 * s, 0, 0);
  head.add(ear);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.04, 64), metal);
  cap.rotation.z = Math.PI / 2;
  cap.position.set(0.95 * s, 0, 0);
  head.add(cap);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.022, 16, 64), glow);
  ring.rotation.y = Math.PI / 2;
  ring.position.set(0.945 * s, 0, 0);
  head.add(ring);
});

// Antenna
const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.34, 16), metal);
ant.position.set(0, 1.08, -0.1);
head.add(ant);
const tip = new THREE.Mesh(new THREE.SphereGeometry(0.06, 32, 32), glow);
tip.position.set(0, 1.27, -0.1);
head.add(tip);

/* ---------- Bo'yin ---------- */
const neck = new THREE.Group();
robot.add(neck);
const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.55, 24), glow);
cable.position.y = 0.2;
neck.add(cable);
for (let i = 0; i < 4; i++) {
  const r = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.06, 20, 48), metal);
  r.rotation.x = Math.PI / 2;
  r.position.y = 0.0 + i * 0.12;
  neck.add(r);
}

/* ---------- Gavda (yelka va ko'krak) ---------- */
const profile = [
  [0.0, 0.02], [0.3, 0.0], [0.62, -0.1], [0.92, -0.3], [1.06, -0.55],
  [1.08, -0.9], [1.0, -1.4], [0.92, -2.0], [0.0, -2.0]
].map(([x, y]) => new THREE.Vector2(x, y));
const torso = new THREE.Mesh(new THREE.LatheGeometry(new THREE.SplineCurve(profile).getPoints(60), 128), shell.clone());
torso.material.side = THREE.DoubleSide;
torso.scale.z = 0.58;
torso.position.y = -0.1;
robot.add(torso);

// Ko'krakdagi panel va yonib turuvchi yadro
const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.06, 64), metal);
plate.rotation.x = Math.PI / 2;
plate.position.set(0, -0.92, 0.62);
plate.rotation.y = 0;
robot.add(plate);
const core = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.045, 24, 64), glow);
core.position.set(0, -0.92, 0.66);
robot.add(core);
const coreDot = new THREE.Mesh(new THREE.SphereGeometry(0.08, 32, 32), glow);
coreDot.position.set(0, -0.92, 0.65);
coreDot.scale.z = 0.5;
robot.add(coreDot);

// Yelka bo'g'imlari
[-1, 1].forEach(s => {
  const pad = new THREE.Mesh(new THREE.SphereGeometry(0.42, 64, 64), shell);
  pad.scale.set(1, 0.85, 1);
  pad.position.set(1.12 * s, -0.62, 0);
  robot.add(pad);
  const joint = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.035, 16, 64), glow);
  joint.rotation.y = Math.PI / 2;
  joint.position.set(1.5 * s, -0.62, 0);
  robot.add(joint);
});

// Gavdadagi chiziq (dizayn detali)
const seam = new THREE.Mesh(new THREE.TorusGeometry(1.075, 0.012, 8, 128), metal);
seam.rotation.x = Math.PI / 2;
seam.scale.y = 0.58;
seam.position.y = -0.95;
robot.add(seam);

/* ---------- O'lcham va joylashuv ---------- */
const base = { x: 0, y: 0, s: 1 };
function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  const visH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
  const visW = visH * camera.aspect;
  if (camera.aspect > 1.05) {        // kompyuter: robot o'ngda
    base.x = visW * 0.2; base.y = -0.42; base.s = 0.8;
  } else if (camera.aspect > 0.75) { // planshet
    base.x = visW * 0.14; base.y = -0.9; base.s = 0.72;
  } else {                           // telefon: robot pastda, markazda
    base.x = 0; base.y = -1.62; base.s = 0.6;
  }
}
new ResizeObserver(resize).observe(canvas);
resize();

/* ---------- Skroll va sichqoncha ---------- */
let progress = 0, mx = 0, my = 0;
const cur = { rot: 0, mx: 0, my: 0 };
function readScroll() {
  const r = hero.getBoundingClientRect();
  const range = r.height - innerHeight;
  progress = range > 0 ? Math.min(Math.max(-r.top / range, 0), 1) : 0;
}
addEventListener('scroll', readScroll, { passive: true });
readScroll();
addEventListener('pointermove', e => {
  mx = e.clientX / innerWidth - 0.5;
  my = e.clientY / innerHeight - 0.5;
}, { passive: true });

/* Faqat hero ko'rinib turganda chizamiz (batareyani tejash) */
let visible = true;
new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(hero);

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clock = new THREE.Clock();
let shownDeg = -1;

renderer.setAnimationLoop(() => {
  if (!visible) return;
  const dt = Math.min(clock.getDelta(), 0.1);
  const t = clock.elapsedTime;
  const k = 1 - Math.exp(-dt * 7), km = 1 - Math.exp(-dt * 4);

  // Skroll: 0 → 360° aylanish
  const target = progress * Math.PI * 2;
  cur.rot += (target - cur.rot) * k;
  cur.mx += (mx - cur.mx) * km;
  cur.my += (my - cur.my) * km;

  const idle = reduce ? 0 : 1;
  robot.rotation.y = cur.rot - 0.35 + cur.mx * 0.5;
  robot.rotation.x = cur.my * 0.12;
  robot.position.set(base.x, base.y + Math.sin(t * 1.2) * 0.06 * idle, 0);
  const zoom = 1 + Math.sin(progress * Math.PI) * 0.08;
  robot.scale.setScalar(base.s * zoom);

  // Bosh sichqonchaga qaraydi
  head.rotation.y = cur.mx * 0.45 + Math.sin(t * 0.7) * 0.05 * idle;
  head.rotation.x = cur.my * 0.25;
  head.rotation.z = Math.sin(t * 0.9) * 0.03 * idle;

  // Ko'z pirpiratish va yadro pulsatsiyasi
  const blink = idle && (t % 4.2) < 0.12 ? 0.15 : 1;
  eyes.forEach(e => (e.scale.x = blink));
  glow.emissiveIntensity = 2.4 + Math.sin(t * 2.4) * 0.5 * idle;
  core.rotation.z = t * 0.8;

  renderer.render(scene, camera);

  const deg = Math.round(progress * 360);
  if (degEl && deg !== shownDeg) { degEl.textContent = String(deg).padStart(3, '0'); shownDeg = deg; }
});

document.documentElement.classList.add('robot-ready');
