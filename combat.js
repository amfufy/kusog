// Kusog Fit Quest: RPG rules (pure functions, no DOM)

export const STATS = {
  str: {n: 'STR', full: 'Strength', d: 'Damage per hit'},
  vit: {n: 'VIT', full: 'Vitality', d: 'Max HP and damage reduction'},
  agi: {n: 'AGI', full: 'Agility', d: 'Armor class (dodging), striking first, double strikes'},
  dex: {n: 'DEX', full: 'Dexterity', d: 'Accuracy and critical hits'}
};
export const statCost = v => 3 + Math.floor(v * .8);

export const BASES = {
  w1: {slot: 'weapon', tier: 1, n: 'Training blade', model: 'blade', dmg: 5, hit: 0},
  w2: {slot: 'weapon', tier: 2, n: 'Energy blade', model: 'blade', dmg: 9, hit: 1},
  w3: {slot: 'weapon', tier: 3, n: 'Plasma kettlebell', model: 'kettlebell', dmg: 15, hit: 1},
  w4: {slot: 'weapon', tier: 4, n: 'Thunder hammer', model: 'hammer', dmg: 24, hit: 2},
  w5: {slot: 'weapon', tier: 5, n: 'Solar edge', model: 'solar', dmg: 36, hit: 3},
  a1: {slot: 'armor', tier: 1, n: 'Cloth suit', ac: 1, hp: 10, dr: 0},
  a2: {slot: 'armor', tier: 2, n: 'Neon plate', ac: 2, hp: 35, dr: 2},
  a3: {slot: 'armor', tier: 3, n: 'Fiber mail', ac: 3, hp: 70, dr: 4},
  a4: {slot: 'armor', tier: 4, n: 'Titan shell', ac: 4, hp: 120, dr: 7},
  a5: {slot: 'armor', tier: 5, n: 'Summit armor', ac: 6, hp: 190, dr: 11},
  h1: {slot: 'helm', tier: 1, n: 'Headband', model: 'none', ac: 0, hit: 1},
  h2: {slot: 'helm', tier: 2, n: 'Neon visor', model: 'visor', ac: 0, hit: 2},
  h3: {slot: 'helm', tier: 3, n: 'Battle helmet', model: 'helmet', ac: 1, hit: 2},
  h4: {slot: 'helm', tier: 4, n: 'Tactical helm', model: 'helmet', ac: 1, hit: 3},
  h5: {slot: 'helm', tier: 5, n: 'Champion halo', model: 'halo', ac: 2, hit: 4}
};
export const SLOTS = {weapon: 'Weapon', armor: 'Armor', helm: 'Helm'};
export const RARITY = {common: 'Common', magic: 'Magic', rare: 'Rare'};

export const REFINE_CHANCE = [100, 100, 100, 95, 85, 70, 55, 40, 25, 15]; // chance to go from +i to +(i+1)
export const refineCost = ref => 10 + 10 * ref;
export const SHOP = {
  stone: {n: 'Empower stone', d: 'Needed for every refine attempt', cost: 15},
  blessed: {n: 'Blessed stone', d: '+15% success on one refine', cost: 60},
  guard: {n: 'Guard scroll', d: 'Stops a failed refine from dropping a level', cost: 80}
};

export function itemStats(it) {
  const b = BASES[it.base], r = it.ref || 0, o = {dmg: 0, hit: 0, ac: 0, hp: 0, dr: 0};
  if (b.slot === 'weapon') { o.dmg = b.dmg * (1 + .15 * r); o.hit = b.hit + Math.floor(r / 3); }
  if (b.slot === 'armor') { o.hp = b.hp * (1 + .15 * r); o.dr = b.dr + r; o.ac = b.ac + Math.floor(r / 3); }
  if (b.slot === 'helm') { o.hit = b.hit + Math.floor(r / 2); o.ac = b.ac + Math.floor(r / 4); }
  return o;
}
export const itemName = it => `${BASES[it.base].n}${it.ref ? ` +${it.ref}` : ''}`;

export function heroDerived(stats, items) {
  const s = {...stats};
  const g = {dmg: 0, hit: 0, ac: 0, hp: 0, dr: 0};
  for (const it of items) {
    if (!it) continue;
    const o = itemStats(it); for (const k in g) g[k] += o[k];
    for (const k in (it.bonus || {})) s[k] += it.bonus[k];
  }
  return {
    stats: s,
    dmg: g.dmg + s.str * 1.5,
    hp: Math.round(50 + s.vit * 10 + g.hp),
    ac: 10 + Math.floor(s.agi / 4) + g.ac,
    hit: Math.floor(s.dex / 4) + g.hit,
    crit: Math.max(15, 20 - Math.floor(s.dex / 12)),
    dr: g.dr + Math.floor(s.vit / 10),
    init: s.agi + s.dex / 2,
    dbl: Math.min(.4, s.agi * .006)
  };
}

export const ZONES = [
  {n: 'Soda Swamp', c: 0x35f0c0, m: [['Fizz Drone', 'drone', 'agile'], ['Syrup Slime', 'slime', 'brute']], boss: ['Sugar Sovereign', 'slime', 'brute']},
  {n: 'Fryer Factory', c: 0xffb547, m: [['Grease Bot', 'bot', 'armored'], ['Oil Spitter', 'drone', 'agile']], boss: ['Deep-Fry Colossus', 'golem', 'armored']},
  {n: 'Midnight Mall', c: 0xb07cff, m: [['Snack Wraith', 'wraith', 'agile'], ['Cart Phantom', 'bot', 'armored']], boss: ['Milk Tea Empress', 'wraith', 'agile']},
  {n: 'Couch Citadel', c: 0x5aa8ff, m: [['Remote Drone', 'drone', 'agile'], ['Scroll Specter', 'wraith', 'brute']], boss: ['Couch Titan', 'golem', 'brute']},
  {n: 'Craving Core', c: 0xff3d6e, m: [['Craving Shade', 'wraith', 'agile'], ['Excuse Golem', 'golem', 'armored']], boss: ['Lord Cravings', 'overlord', 'brute']}
];
export const TRAITS = {
  agile: {n: 'Evasive', d: 'Hard to hit. Raise DEX or your helm for accuracy.'},
  armored: {n: 'Armored', d: 'Shrugs off weak hits. Raise STR or refine your weapon.'},
  brute: {n: 'Brutal', d: 'Hits very hard. Raise VIT, refine your armor, or raise AGI to dodge.'}
};

export function enemyFor(stage, ng = 0) {
  const L = stage, z = Math.ceil(L / 10), w = (L - 1) % 10 + 1, Z = ZONES[z - 1];
  const boss = w === 10, final = L === 50;
  const [name, type, trait] = boss ? Z.boss : Z.m[w % 2];
  let hp = 40 + 14 * L + .9 * L * L, ac = 10 + Math.floor(L / 3), hit = 1 + Math.floor(L / 3);
  let dmg = 4 + 1.1 * L + .03 * L * L, dr = Math.floor(L / 5), init = 5 + L * .6;
  if (trait === 'agile') { ac += 3; init += 5; dmg *= .9; }
  if (trait === 'armored') { dr = dr * 2 + 3; hp *= 1.2; ac -= 1; }
  if (trait === 'brute') { dmg *= 1.35; hp *= 1.1; ac -= 2; }
  if (boss) { hp *= 2.2; dmg *= 1.3; ac += 1; hit += 1; }
  if (final) { hp *= 1.4; dmg *= 1.25; ac += 2; hit += 1; }
  const m = 1.6 ** ng; hp *= m; dmg *= m; ac += 2 * ng; hit += 2 * ng; dr += 3 * ng;
  return {stage: L, z, w, name, type, trait, color: Z.c, boss, final, hp: Math.round(hp), ac, hit, dmg, dr, init};
}

const d20 = rnd => 1 + Math.floor(rnd() * 20);
// Simulate one fight. Returns {win, events, rounds}.
export function simulate(h, e, rnd = Math.random, log = true) {
  let hhp = h.hp, ehp = e.hp; const ev = []; let rounds = 0;
  const heroFirst = d20(rnd) + h.init / 2 >= d20(rnd) + e.init / 2;
  const heroSwing = () => {
    const roll = d20(rnd), need = e.ac - h.hit;
    const crit = roll >= h.crit, hitOk = roll !== 1 && (roll === 20 || crit || roll + h.hit >= e.ac);
    if (!hitOk) { if (log) ev.push({t: 'h', res: 'miss', roll, need, ehp}); return; }
    let dmg = Math.max(1, h.dmg * (.85 + rnd() * .3) * (crit ? 2 : 1) - e.dr);
    dmg = Math.round(dmg); ehp -= dmg;
    if (log) ev.push({t: 'h', res: crit ? 'crit' : 'hit', roll, need, dmg, ehp: Math.max(0, ehp)});
  };
  const heroTurn = () => { heroSwing(); if (ehp > 0 && rnd() < h.dbl) { if (log) ev.push({t: 'dbl'}); heroSwing(); } };
  const enemyTurn = () => {
    const roll = d20(rnd), hitOk = roll !== 1 && (roll === 20 || roll + e.hit >= h.ac);
    if (!hitOk) { if (log) ev.push({t: 'e', res: 'dodge', roll, hhp}); return; }
    const dmg = Math.round(Math.max(1, e.dmg * (.85 + rnd() * .3) * (roll === 20 ? 1.5 : 1) - h.dr));
    hhp -= dmg; if (log) ev.push({t: 'e', res: roll === 20 ? 'crit' : 'hit', roll, dmg, hhp: Math.max(0, hhp)});
  };
  while (hhp > 0 && ehp > 0 && rounds < 40) {
    rounds++;
    if (heroFirst) { heroTurn(); if (ehp > 0) enemyTurn(); }
    else { enemyTurn(); if (hhp > 0) heroTurn(); }
  }
  const win = ehp <= 0 && hhp > 0;
  return {win, events: ev, rounds, timeout: hhp > 0 && ehp > 0};
}
export function winChance(h, e, n = 300) {
  let w = 0; for (let i = 0; i < n; i++) if (simulate(h, e, Math.random, false).win) w++;
  return w / n;
}
export function threat(p) {
  if (p >= .8) return {n: 'Favorable', c: 'ok'};
  if (p >= .5) return {n: 'Even fight', c: 'even'};
  if (p >= .2) return {n: 'Risky', c: 'risky'};
  return {n: 'Deadly', c: 'deadly'};
}
// Which stat would help most against this enemy
export function advice(h, e) {
  const tips = [];
  const hitP = Math.min(.95, Math.max(.05, (21 - (e.ac - h.hit)) / 20));
  const dodgeP = Math.min(.95, Math.max(.05, 1 - (21 - (h.ac - e.hit)) / 20));
  if (hitP < .55) tips.push(`You only land about ${Math.round(hitP * 100)}% of your swings. More DEX or a better helm would help.`);
  if (h.dmg * .85 - e.dr < h.dmg * .6) tips.push('Its armor soaks up much of your damage. More STR or a refined weapon would help.');
  const eDmg = Math.max(1, e.dmg - h.dr), roundsToDie = h.hp / (eDmg * (1 - dodgeP) + .01);
  if (roundsToDie < 8) tips.push('It can take you down fast. More VIT, a refined armor, or AGI to dodge would help.');
  return tips;
}

export function rollRefine(ref, opts, rnd = Math.random) {
  let p = REFINE_CHANCE[ref] / 100; if (opts.blessed) p = Math.min(1, p + .15);
  if (rnd() < p) return {ok: true, ref: ref + 1, p};
  const drop = ref >= 5 && !opts.guard;
  return {ok: false, ref: drop ? ref - 1 : ref, dropped: drop, p};
}

let uidN = 0;
export function makeItem(base, rnd = Math.random, forceRarity) {
  const r = forceRarity || (rnd() < .15 ? 'rare' : rnd() < .45 ? 'magic' : 'common');
  const keys = Object.keys(STATS), bonus = {};
  const tier = BASES[base].tier;
  if (r !== 'common') {
    const n = r === 'rare' ? 2 : 1;
    const pool = [...keys].sort(() => rnd() - .5).slice(0, n);
    for (const k of pool) bonus[k] = (r === 'rare' ? 2 : 1) * tier + Math.floor(rnd() * (tier + 2));
  }
  return {uid: 'i' + Date.now().toString(36) + (uidN++), base, rarity: r, bonus, ref: 0};
}
// Loot for the first clear of a stage
export function lootFor(stage, rnd = Math.random) {
  const z = Math.ceil(stage / 10), w = (stage - 1) % 10 + 1;
  const out = {stones: w === 10 ? 3 : 1, items: []};
  const slotKeys = ['w', 'a', 'h'];
  if (w === 5) out.items.push(makeItem(slotKeys[Math.floor(rnd() * 3)] + Math.min(5, z), rnd));
  if (w === 10) out.items.push(makeItem(slotKeys[Math.floor(rnd() * 3)] + Math.min(5, z + 1), rnd, rnd() < .4 ? 'rare' : 'magic'));
  return out;
}
