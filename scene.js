// Kusog Fit Quest: 3D arena (hero avatar, enemies, battle effects)
import * as THREE from './three.module.min.js';

const SKIN = 0xc68a5e, HAIR = 0x17110d, HX = -1.15, EX = 1.35;
const std = (color, o = {}) => new THREE.MeshStandardMaterial(Object.assign({color, metalness: .55, roughness: .38}, o));
const glow = (color, i = 2) => new THREE.MeshStandardMaterial({color, emissive: color, emissiveIntensity: i, metalness: .1, roughness: .4});
function mesh(geo, mat, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); return m; }

function dispose(obj) {
  obj.traverse(o => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.dispose());
  });
}

/* ---------- Hero ---------- */
export function buildAvatar(cfg) {
  const f = cfg.fat, mu = cfg.muscle, st = cfg.stage;
  const body = std(cfg.body), acc = glow(cfg.glow, 1.8), skin = std(SKIN, {metalness: 0, roughness: .75});
  const dark = std(0x0b1020, {metalness: .4, roughness: .45});
  const g = new THREE.Group(); const parts = {};
  const legX = .15 + .06 * f, legR = .12 + .07 * f;

  for (const s of [-1, 1]) {
    g.add(mesh(new THREE.CapsuleGeometry(legR, .52, 6, 12), body, s * legX, .46, 0));
    g.add(mesh(new THREE.BoxGeometry(.2 + .05 * f, .12, .34), dark, s * legX, .06, .05));
    if (st >= 1) g.add(mesh(new THREE.BoxGeometry(.13, .09, .05), acc, s * legX, .5, legR + .01));
  }
  g.add(mesh(new THREE.SphereGeometry(.25 + .1 * f, 16, 12), body, 0, .86, 0));

  const torsoR = .26 + .12 * f, depth = .85 + .15 * f;
  const torso = mesh(new THREE.CapsuleGeometry(torsoR, .42, 8, 16), body, 0, 1.25, 0);
  torso.scale.set(1 + .14 * mu + .06 * f, 1, depth); g.add(torso); parts.torso = torso;
  const belly = mesh(new THREE.SphereGeometry(.18 + .24 * f, 18, 14), body, 0, 1.03, .04 + .15 * f);
  g.add(belly); parts.belly = belly;
  const front = torsoR * depth + .005;
  g.add(mesh(new THREE.BoxGeometry(.035, .32, .02), acc, 0, 1.33, front));
  if (st >= 3) { const core = mesh(new THREE.CylinderGeometry(.075, .075, .03, 20), acc, 0, 1.45, front + .01); core.rotation.x = Math.PI / 2; g.add(core); }

  g.add(mesh(new THREE.CylinderGeometry(.08 + .03 * f, .1 + .04 * f, .16, 12), skin, 0, 1.72, 0));
  const head = new THREE.Group(); head.position.set(0, 1.93, 0); g.add(head); parts.head = head;
  const hr = .2 + .02 * f;
  head.add(mesh(new THREE.SphereGeometry(hr, 20, 16), skin));
  head.add(mesh(new THREE.SphereGeometry(hr + .012, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2.3), std(HAIR, {metalness: 0, roughness: .9}), 0, .02, -.012));
  head.add(mesh(new THREE.BoxGeometry(.19, .035, .03), dark, 0, .02, hr - .01));
  if (cfg.head === 'visor' || cfg.head === 'helmet') {
    const v = mesh(new THREE.CylinderGeometry(hr + .025, hr + .025, .085, 24, 1, true, -1.1, 2.2),
      new THREE.MeshStandardMaterial({color: cfg.glow, emissive: cfg.glow, emissiveIntensity: 1.4, transparent: true, opacity: .75, side: THREE.DoubleSide}), 0, .02, 0);
    head.add(v);
  }
  if (cfg.head === 'helmet') {
    head.add(mesh(new THREE.SphereGeometry(hr + .045, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2.05), body, 0, .03, 0));
    head.add(mesh(new THREE.BoxGeometry(.03, .09, hr * 2), acc, 0, hr + .07, 0));
  }
  if (cfg.head === 'halo') {
    const h = mesh(new THREE.TorusGeometry(.2, .018, 8, 40), glow(0xffd36b, 2.6), 0, hr + .16, 0);
    h.rotation.x = Math.PI / 2; head.add(h); parts.halo = h;
  }

  const sx = .35 + .1 * f + .08 * mu;
  for (const s of [-1, 1]) {
    const sh = new THREE.Group(); sh.position.set(s * sx, 1.52, 0); g.add(sh);
    sh.add(mesh(new THREE.SphereGeometry(.12 + .03 * f + .05 * mu, 14, 12), body));
    if (st >= 2) {
      sh.add(mesh(new THREE.SphereGeometry(.17 + .05 * mu, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), body, 0, .03, 0));
      const t = mesh(new THREE.TorusGeometry(.165 + .05 * mu, .012, 6, 28), acc, 0, .035, 0); t.rotation.x = Math.PI / 2; sh.add(t);
    }
    const armR = .075 + .035 * f + .045 * mu;
    const arm = new THREE.Group(); arm.rotation.z = s * (.1 + .12 * f); sh.add(arm);
    arm.add(mesh(new THREE.CapsuleGeometry(armR, .5, 6, 10), body, 0, -.35, 0));
    if (st >= 4) arm.add(mesh(new THREE.CylinderGeometry(armR + .02, armR + .02, .16, 14), acc, 0, -.5, 0));
    const hand = new THREE.Group(); hand.position.set(0, -.7, 0); arm.add(hand);
    hand.add(mesh(new THREE.SphereGeometry(.07 + .02 * f, 12, 10), skin));
    if (s === 1) { parts.armL = sh; parts.handL = hand; }
  }

  // Weapon in the LEFT hand (keeps the injured right arm free)
  const w = new THREE.Group(); parts.handL.add(w);
  if (cfg.weapon === 'kettlebell') {
    const bell = mesh(new THREE.SphereGeometry(.16, 18, 14), std(0x20263a, {metalness: .8, roughness: .3}), 0, -.2, 0); w.add(bell);
    const band = mesh(new THREE.TorusGeometry(.16, .015, 6, 30), acc, 0, -.2, 0); band.rotation.x = Math.PI / 2; w.add(band);
    w.add(mesh(new THREE.TorusGeometry(.08, .02, 8, 20, Math.PI), std(0x20263a, {metalness: .8}), 0, -.05, 0));
  } else if (cfg.weapon === 'hammer') {
    w.add(mesh(new THREE.CylinderGeometry(.025, .025, .8, 10), dark, 0, .2, 0));
    w.add(mesh(new THREE.BoxGeometry(.36, .2, .2), body, 0, .62, 0));
    w.add(mesh(new THREE.BoxGeometry(.37, .04, .21), acc, 0, .62, 0));
    w.rotation.x = .5;
  } else {
    w.add(mesh(new THREE.CylinderGeometry(.025, .025, .2, 10), dark, 0, .02, 0));
    w.add(mesh(new THREE.BoxGeometry(.05, .85, .02), acc, 0, .55, 0));
    w.rotation.x = .6;
  }

  if (cfg.back === 'jetpack') {
    for (const s of [-1, 1]) {
      g.add(mesh(new THREE.CylinderGeometry(.08, .08, .42, 14), std(0x2a3150, {metalness: .8}), s * .1, 1.3, -torsoR * depth - .06));
      const fl = mesh(new THREE.ConeGeometry(.06, .22, 12), glow(0xffb547, 2.4), s * .1, .98, -torsoR * depth - .06); fl.rotation.x = Math.PI; g.add(fl);
      (parts.flames = parts.flames || []).push(fl);
    }
  } else if (cfg.back === 'cape') {
    const geo = new THREE.PlaneGeometry(.75, 1.15, 1, 8); const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) { const y = pos.getY(i); pos.setZ(i, -Math.pow((.575 - y) * .45, 2)); }
    geo.computeVertexNormals();
    const cape = mesh(geo, new THREE.MeshStandardMaterial({color: cfg.glow, emissive: cfg.glow, emissiveIntensity: .5, transparent: true, opacity: .8, side: THREE.DoubleSide}), 0, 1.0, -torsoR * depth - .05);
    g.add(cape); parts.cape = cape;
  }
  if (st >= 5) {
    for (const s of [-1, 1]) {
      const fin = mesh(new THREE.BoxGeometry(.04, .7, .12), acc, s * .3, 1.75, -torsoR * depth - .05);
      fin.rotation.z = -s * .5; g.add(fin);
    }
  }
  if (cfg.aura === 'ring' || cfg.aura === 'sparks') {
    const r = mesh(new THREE.TorusGeometry(.72, .02, 6, 60), glow(cfg.glow, 2.5), 0, .05, 0); r.rotation.x = Math.PI / 2; g.add(r); parts.ring = r;
  }
  if (cfg.aura === 'sparks') {
    const n = 60, arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, rr = .6 + (i % 5) * .08; arr[i * 3] = Math.cos(a) * rr; arr[i * 3 + 1] = .2 + (i * 37 % 100) / 50; arr[i * 3 + 2] = Math.sin(a) * rr; }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({color: cfg.glow, size: .06, transparent: true, opacity: .9}));
    g.add(pts); parts.sparks = pts;
  }
  g.userData.parts = parts;
  return g;
}

/* ---------- Enemies ---------- */
export function buildEnemy(def) {
  const c = def.color, g = new THREE.Group(), u = {};
  const skin = std(c, {metalness: .3, roughness: .35, emissive: c, emissiveIntensity: .25});
  const eyeW = glow(0xffffff, 1.2), pupil = std(0x05060a), red = glow(0xff2a4a, 2.5);
  const eyes = (y, z, sep, r) => { for (const s of [-1, 1]) { g.add(mesh(new THREE.SphereGeometry(r, 12, 10), eyeW, s * sep, y, z)); g.add(mesh(new THREE.SphereGeometry(r * .5, 10, 8), pupil, s * sep, y, z + r * .7)); } };
  const golem = sc => {
    for (const s of [-1, 1]) g.add(mesh(new THREE.BoxGeometry(.28 * sc, .55 * sc, .3 * sc), skin, s * .22 * sc, .28 * sc, 0));
    const t = mesh(new THREE.BoxGeometry(.95 * sc, .75 * sc, .6 * sc), skin, 0, .92 * sc, 0); g.add(t);
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(t.geometry), new THREE.LineBasicMaterial({color: 0xffffff})); e.position.copy(t.position); g.add(e);
    g.add(mesh(new THREE.BoxGeometry(.42 * sc, .38 * sc, .4 * sc), skin, 0, 1.5 * sc, 0));
    for (const s of [-1, 1]) g.add(mesh(new THREE.BoxGeometry(.24 * sc, .7 * sc, .26 * sc), skin, s * .62 * sc, .85 * sc, 0));
    for (const s of [-1, 1]) g.add(mesh(new THREE.BoxGeometry(.08 * sc, .05 * sc, .02), red, s * .1 * sc, 1.53 * sc, .21 * sc));
  };
  switch (def.type) {
    case 'slime': {
      const b = mesh(new THREE.SphereGeometry(.6, 26, 18), std(c, {transparent: true, opacity: .85, roughness: .12, metalness: .1, emissive: c, emissiveIntensity: .35}), 0, .43, 0);
      b.scale.set(1, .72, 1); g.add(b); u.squish = b; eyes(.56, .46, .17, .09); break;
    }
    case 'drone': {
      const core = mesh(new THREE.IcosahedronGeometry(.36, 0), skin, 0, 1.15, 0); g.add(core);
      const ring = mesh(new THREE.TorusGeometry(.6, .03, 6, 40), glow(c, 2), 0, 1.15, 0); ring.rotation.x = 1.2; g.add(ring); u.spin = ring;
      g.add(mesh(new THREE.SphereGeometry(.11, 14, 10), red, 0, 1.17, .3)); u.float = true; break;
    }
    case 'bot': {
      for (const s of [-1, 1]) g.add(mesh(new THREE.BoxGeometry(.16, .4, .2), skin, s * .2, .2, 0));
      g.add(mesh(new THREE.BoxGeometry(.75, .65, .5), skin, 0, .72, 0));
      g.add(mesh(new THREE.BoxGeometry(.48, .36, .4), skin, 0, 1.25, 0));
      g.add(mesh(new THREE.BoxGeometry(.36, .08, .02), red, 0, 1.27, .21));
      g.add(mesh(new THREE.CylinderGeometry(.015, .015, .25, 6), std(0x999999), 0, 1.55, 0));
      g.add(mesh(new THREE.SphereGeometry(.05, 10, 8), glow(c, 3), 0, 1.69, 0)); break;
    }
    case 'wraith': {
      const m = std(c, {transparent: true, opacity: .7, emissive: c, emissiveIntensity: .6, roughness: .2});
      const cone = mesh(new THREE.ConeGeometry(.45, 1.1, 20, 1, true), m, 0, .85, 0); cone.rotation.x = Math.PI; g.add(cone);
      g.add(mesh(new THREE.SphereGeometry(.3, 18, 14), m, 0, 1.55, 0));
      for (const s of [-1, 1]) g.add(mesh(new THREE.SphereGeometry(.05, 10, 8), red, s * .1, 1.58, .26));
      u.float = true; break;
    }
    case 'overlord': {
      golem(1.25);
      for (const s of [-1, 1]) { const h = mesh(new THREE.ConeGeometry(.08, .45, 10), glow(0xff3da8, 2), s * .22, 2.2, 0); h.rotation.z = -s * .35; g.add(h); }
      const orb = new THREE.Group(); orb.position.y = 1.2; g.add(orb); u.orbit = orb;
      for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2; orb.add(mesh(new THREE.SphereGeometry(.12, 12, 10), glow(0xff3d6e, 1.8), Math.cos(a) * 1.05, 0, Math.sin(a) * 1.05)); }
      break;
    }
    default: golem(1);
  }
  if (def.boss) {
    const box = new THREE.Box3().setFromObject(g), top = box.max.y;
    for (let i = 0; i < 5; i++) { const sp = mesh(new THREE.ConeGeometry(.06, .22, 8), glow(0xffd36b, 2.2), (i - 2) * .1, top + .1, 0); g.add(sp); }
  }
  const box = new THREE.Box3().setFromObject(g); const size = box.getSize(new THREE.Vector3());
  u.height = size.y; u.radius = Math.max(size.x, size.y, size.z) * .62;
  const shield = mesh(new THREE.SphereGeometry(u.radius, 24, 16), new THREE.MeshBasicMaterial({color: 0x2ee6f0, wireframe: true, transparent: true, opacity: .45}), 0, size.y / 2, 0);
  shield.visible = false; g.add(shield); u.shield = shield;
  g.userData = u;
  return g;
}

/* ---------- Arena ---------- */
export class Arena {
  constructor() {
    const r = this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    r.toneMapping = THREE.ACESFilmicToneMapping;
    this.canvas = r.domElement;
    const sc = this.scene = new THREE.Scene();
    sc.fog = new THREE.Fog(0x060a16, 9, 24);
    this.camera = new THREE.PerspectiveCamera(36, 1, .1, 100);
    sc.add(new THREE.HemisphereLight(0xaee4ff, 0x220c2e, 1.6));
    const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(3, 6, 5); sc.add(key);
    const c1 = new THREE.PointLight(0x2ee6f0, 30, 14); c1.position.set(-3.5, 3, -1.5); sc.add(c1);
    const c2 = new THREE.PointLight(0xff3da8, 26, 14); c2.position.set(4, 2.5, -1.5); sc.add(c2);
    this.hitLight = new THREE.PointLight(0xffffff, 0, 5); sc.add(this.hitLight);

    const grid = new THREE.GridHelper(40, 40, 0x2ee6f0, 0x1b2a4a);
    grid.material.transparent = true; grid.material.opacity = .32; sc.add(grid);
    const ring = (x, color) => { const m = mesh(new THREE.RingGeometry(.8, .88, 56), new THREE.MeshBasicMaterial({color, side: THREE.DoubleSide, transparent: true, opacity: .85}), x, .012, 0); m.rotation.x = -Math.PI / 2; sc.add(m); return m; };
    this.ringH = ring(HX, 0x2ee6f0); this.ringE = ring(EX, 0xff3da8);

    // Neon wireframe Chocolate Hills
    const hills = this.hills = new THREE.Group();
    const H = [[-11, 1.8, -9], [-8, 1.3, -7.5], [-5.2, 2.2, -10], [-2.4, 1.5, -8], [.6, 2.6, -11], [3.4, 1.4, -8.2], [6.2, 2.1, -9.5], [9, 1.6, -7.8], [11.5, 2.3, -10.5]];
    H.forEach(([x, rr, z], i) => {
      const m = mesh(new THREE.SphereGeometry(rr, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({color: i % 2 ? 0xff3da8 : 0x2ee6f0, wireframe: true, transparent: true, opacity: .25}), x, 0, z);
      m.scale.y = .78; hills.add(m);
    });
    sc.add(hills);

    // Floating dust
    const n = 140, arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { arr[i * 3] = ((i * 73) % 200) / 10 - 10; arr[i * 3 + 1] = ((i * 37) % 60) / 10; arr[i * 3 + 2] = -((i * 53) % 120) / 10 + 2; }
    const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    this.dust = new THREE.Points(dg, new THREE.PointsMaterial({color: 0x8fdcff, size: .035, transparent: true, opacity: .55})); sc.add(this.dust);

    this.hero = null; this.heroKey = ''; this.enemy = null; this.enemyKey = '';
    this.tweens = []; this.particles = []; this.az = .0; this.mounted = false; this.clock = new THREE.Clock();
    this.loop = this.loop.bind(this);

    let drag = null;
    this.canvas.style.touchAction = 'pan-y';
    this.canvas.addEventListener('pointerdown', e => { drag = {x: e.clientX, az: this.az}; });
    window.addEventListener('pointermove', e => { if (drag) { this.az = Math.max(-.9, Math.min(.9, drag.az - (e.clientX - drag.x) / 220)); } });
    window.addEventListener('pointerup', () => { drag = null; });
    this.ro = new ResizeObserver(() => this.resize());
  }
  mount(el) {
    if (!el) return;
    el.appendChild(this.canvas); this.el = el; this.ro.observe(el); this.resize();
    if (!this.mounted) { this.mounted = true; this.clock.getDelta(); requestAnimationFrame(this.loop); }
  }
  unmount() { this.mounted = false; if (this.el) this.ro.unobserve(this.el); this.canvas.remove(); }
  resize() {
    if (!this.el) return;
    const w = this.el.clientWidth, h = this.el.clientHeight; if (!w || !h) return;
    this.renderer.setSize(w, h, false); this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
  }
  setHero(cfg) {
    const k = JSON.stringify(cfg); if (k === this.heroKey) return; this.heroKey = k;
    if (this.hero) { this.scene.remove(this.hero); dispose(this.hero); }
    this.hero = buildAvatar(cfg); this.hero.position.set(HX, 0, 0); this.hero.rotation.y = .55; this.scene.add(this.hero);
  }
  setEnemy(def) {
    if (!def) { if (this.enemy) { this.scene.remove(this.enemy); dispose(this.enemy); this.enemy = null; this.enemyKey = ''; } return; }
    if (def.key === this.enemyKey && this.enemy) return; this.enemyKey = def.key;
    if (this.enemy) { this.scene.remove(this.enemy); dispose(this.enemy); }
    const e = this.enemy = buildEnemy(def); const s = def.final ? 1.45 : def.boss ? 1.3 : 1;
    e.userData.baseScale = s; e.position.set(EX, 0, 0); e.rotation.y = -.55; e.scale.setScalar(.01); this.scene.add(e);
    this.ringE.material.color.set(def.boss ? 0xffd36b : 0xff3da8);
    this.tween(.35, k => { e.scale.setScalar(s * (k < .8 ? k / .8 * 1.08 : 1.08 - (k - .8) / .2 * .08)); });
  }
  setShield(on) { if (this.enemy) this.enemy.userData.shield.visible = !!on; }
  tween(dur, fn) { this.tweens.push({t: 0, dur, fn}); }
  heroAttack() {
    const h = this.hero; if (!h) return; const p = h.userData.parts;
    this.tween(.32, k => {
      const s = Math.sin(k * Math.PI);
      h.position.x = HX + s * .55;
      if (p.armL) p.armL.rotation.x = -s * 1.6;
    });
  }
  enemyHit(crit) {
    const e = this.enemy; if (!e) return; const bs = e.userData.baseScale || 1;
    this.hitLight.position.set(EX - .3, 1.2, .8); this.hitLight.color.set(crit ? 0xffd36b : 0xffffff); this.hitLight.intensity = crit ? 60 : 30;
    this.tween(.18, k => { const s = Math.sin(k * Math.PI); e.position.x = EX + s * .12; e.scale.setScalar(bs * (1 - s * .06)); });
    this.burst(new THREE.Vector3(EX - .3, 1.1, .2), crit ? 0xffd36b : 0x2ee6f0, crit ? 22 : 10);
  }
  enemyAttack() {
    const e = this.enemy; if (!e) return;
    this.tween(.3, k => { e.position.x = EX - Math.sin(k * Math.PI) * .45; });
  }
  heroHit() {
    this.hitLight.position.set(HX + .1, 1.2, .8); this.hitLight.color.set(0xff3d5a); this.hitLight.intensity = 26;
    const h = this.hero; if (h) this.tween(.18, k => { h.position.x = HX - Math.sin(k * Math.PI) * .1; });
  }
  enemyDie() {
    const e = this.enemy; if (!e) return; const bs = e.userData.baseScale || 1;
    this.burst(new THREE.Vector3(EX, 1, 0), 0xff3da8, 40); this.burst(new THREE.Vector3(EX, 1, 0), 0xffd36b, 20);
    this.tween(.3, k => { e.scale.setScalar(bs * (1 - k)); e.rotation.y += .2; });
  }
  burst(pos, color, n) {
    const arr = new Float32Array(n * 3), vel = [];
    for (let i = 0; i < n; i++) { arr.set([pos.x, pos.y, pos.z], i * 3); vel.push(new THREE.Vector3((Math.random() - .5) * 4, Math.random() * 3.5, (Math.random() - .5) * 4)); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({color, size: .09, transparent: true, opacity: 1}));
    this.scene.add(pts); this.particles.push({pts, vel, t: 0});
  }
  screenPos(which) {
    const o = which === 'hero' ? this.hero : this.enemy; if (!o || !this.el) return null;
    const y = which === 'hero' ? 2.3 : (o.userData.height || 2) * (o.userData.baseScale || 1) + .15;
    const v = new THREE.Vector3(o.position.x, y, 0).project(this.camera);
    return {x: (v.x + 1) / 2 * this.el.clientWidth, y: (1 - v.y) / 2 * this.el.clientHeight};
  }
  loop() {
    if (!this.mounted) return;
    requestAnimationFrame(this.loop);
    if (document.hidden) return;
    const dt = Math.min(.05, this.clock.getDelta()), t = this.clock.elapsedTime;
    const aspect = this.camera.aspect, R = Math.min(12, Math.max(6, 2.25 / (Math.tan(THREE.MathUtils.degToRad(18)) * aspect)));
    this.camera.position.set(Math.sin(this.az) * R, 2.1, Math.cos(this.az) * R); this.camera.lookAt(0.1, 1.0, 0);

    this.tweens = this.tweens.filter(tw => { tw.t += dt; const k = Math.min(1, tw.t / tw.dur); tw.fn(k); return k < 1; });
    this.hitLight.intensity *= .86;
    if (this.hero) {
      const p = this.hero.userData.parts;
      p.torso.scale.y = 1 + Math.sin(t * 2.2) * .015; p.head.position.y = 1.93 + Math.sin(t * 2.2) * .008;
      if (p.ring) p.ring.rotation.z += dt * .8;
      if (p.sparks) p.sparks.rotation.y += dt * .6;
      if (p.halo) p.halo.rotation.z += dt;
      if (p.flames) p.flames.forEach((fl, i) => fl.scale.y = .8 + Math.sin(t * 20 + i) * .25);
      if (p.cape) p.cape.rotation.x = Math.sin(t * 1.6) * .06 - .05;
    }
    if (this.enemy) {
      const u = this.enemy.userData;
      if (u.float) this.enemy.position.y = .12 + Math.sin(t * 2.4) * .08;
      if (u.spin) u.spin.rotation.z += dt * 2.5;
      if (u.orbit) u.orbit.rotation.y += dt * 1.2;
      if (u.squish) u.squish.scale.y = .72 + Math.sin(t * 3) * .04;
      if (u.shield.visible) u.shield.rotation.y += dt * .5;
    }
    this.ringH.material.opacity = .65 + Math.sin(t * 2) * .2;
    this.dust.rotation.y += dt * .02;
    this.particles = this.particles.filter(p => {
      p.t += dt; const a = p.pts.geometry.attributes.position;
      for (let i = 0; i < p.vel.length; i++) { p.vel[i].y -= 6 * dt; a.setXYZ(i, a.getX(i) + p.vel[i].x * dt, Math.max(.02, a.getY(i) + p.vel[i].y * dt), a.getZ(i) + p.vel[i].z * dt); }
      a.needsUpdate = true; p.pts.material.opacity = 1 - p.t / .8;
      if (p.t > .8) { this.scene.remove(p.pts); dispose(p.pts); return false; }
      return true;
    });
    this.renderer.render(this.scene, this.camera);
  }
}
