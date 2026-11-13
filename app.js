'use strict';
import * as C from './combat.js';
/* ---------- Helpers ---------- */
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = (n, d = 0) => Number(n).toLocaleString('en-US', {minimumFractionDigits: d, maximumFractionDigits: d});
const pad = n => String(n).padStart(2, '0');
const keyOf = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const niceDate = d => `${DOW[d.getDay()]}, ${MON[d.getMonth()]} ${d.getDate()}`;

/* ---------- Food plan ---------- */
const BREAKFAST = [
  {t: '3 boiled eggs, sautéed greens, ½ cup rice', k: 385, p: 20},
  {t: '40 g oats, 1 scoop whey, 1 boiled egg', k: 345, p: 35}
];
const SNACK = [
  {t: '1 cup monggo, 2 eggs, banana or papaya', k: 500, p: 27},
  {t: '1 cup monggo, 1 scoop whey, banana or papaya', k: 475, p: 38}
];
const ROT = {
  0: {l: {t: '2 cans tuna in water, vegetables, 1 cup rice', k: 470, p: 54}, d: {t: 'Fish sinigang (tilapia or galunggong), 1 cup rice', k: 430, p: 40}},
  1: {l: {t: 'Chicken adobo (simmered, no oil), 1 cup rice, vegetables', k: 490, p: 50}, d: {t: 'Tilapia sinigang, 1 cup rice', k: 420, p: 40}},
  2: {l: {t: 'Grilled bangus, 1 cup rice, vegetables', k: 540, p: 44}, d: {t: 'Chicken tinola, 1 cup rice', k: 420, p: 40}},
  3: {l: {t: 'Garlic-calamansi chicken, 1 cup rice, vegetables', k: 490, p: 50}, d: {t: 'Galunggong paksiw, 1 cup rice, vegetables', k: 440, p: 40}},
  4: {l: {t: 'Grilled or steamed tilapia, 1 cup rice, vegetables', k: 470, p: 48}, d: {t: 'Chicken tinola with malunggay, 1 cup rice', k: 420, p: 40}},
  5: {l: {t: 'Chicken adobo (simmered, no oil), 1 cup rice, vegetables', k: 490, p: 50}, d: {t: '1 can tuna in water, 1 boiled egg, sautéed vegetables, 1 cup rice', k: 470, p: 40}},
  6: {l: {t: 'Grilled bangus, 1 cup rice, vegetables', k: 540, p: 44}, d: {t: 'Chicken soup with sayote, 1 cup rice', k: 420, p: 40}}
};
const SLOTS = [['breakfast', 'Breakfast'], ['lunch', 'Lunch'], ['snack', 'Post-workout snack'], ['dinner', 'Dinner']];
const opts = (slot, date) => {
  const P = S.plan, r = P.rot[date.getDay()];
  return slot === 'breakfast' ? P.breakfast : slot === 'snack' ? P.snack : slot === 'lunch' ? [r.l] : [r.d];
};
const EX_DEF = [
  {id: 'goblet', n: 'Goblet squat', note: 'Hold the weight at your chest. Only if holding it with both hands is pain-free; otherwise do bodyweight squats.'},
  {id: 'suitcase', n: 'Suitcase deadlift (left hand)', note: 'Weight at your left side. Hinge at the hips and stand tall without leaning.'},
  {id: 'stepup', n: 'Step-ups (weight in left hand)', note: 'Use a sturdy step at knee height or lower. Do both legs.'},
  {id: 'rowL', n: 'One-arm row (left)', note: 'Hinge forward. Rest your right hand on your knee only if that’s pain-free.'},
  {id: 'bridge', n: 'Glute bridge', note: 'Squeeze at the top for a second. Rest a dumbbell on your hips with your left hand to make it harder.'},
  {id: 'deadbug', n: 'Dead bug', note: 'Slow and controlled, lower back on the floor. Move the right arm only if it’s pain-free.'},
  {id: 'lunge', n: 'Reverse lunge (weight in left hand)', note: 'Step back, lower gently, drive up through the front heel. Do both legs.'},
  {id: 'kbrdl', n: 'One-arm kettlebell RDL (left)', note: 'Soft knees, push your hips back, keep your back flat.'},
  {id: 'pressL', n: 'One-arm floor press (left)', note: 'Lie on the floor and press up with the left arm. The floor protects your shoulder.'},
  {id: 'carry', n: 'Suitcase carry (left)', note: 'Walk tall for 20–30 m without leaning. Log seconds as reps.'},
  {id: 'wallsit', n: 'Wall sit', note: 'Go only as low as is comfortable. Log seconds as reps.'},
  {id: 'calf', n: 'Calf raises', note: 'Hold a weight in your left hand once bodyweight gets easy.'}
];
const ROUT_DEF = {A: {name: 'Workout A', ids: ['goblet', 'suitcase', 'stepup', 'rowL', 'bridge', 'deadbug']}, B: {name: 'Workout B', ids: ['lunge', 'kbrdl', 'pressL', 'carry', 'wallsit', 'calf']}};
const QUICK = [
  {t: 'Boiled egg', k: 72, p: 6}, {t: 'Scoop of whey', k: 120, p: 24}, {t: 'Lakatan banana', k: 90, p: 1},
  {t: '½ cup rice', k: 100, p: 2}, {t: 'Can of tuna in water', k: 140, p: 28}, {t: 'Papaya slice', k: 60, p: 1},
  {t: '1 tsp oil', k: 40, p: 0}
];
const GROC = [
  ['Skinless chicken breast', '~1.1 kg', 320], ['Tilapia', '~1.2 kg', 200], ['Bangus', '2 medium (~0.8 kg)', 180],
  ['Galunggong', '~0.5 kg', 120], ['Tuna in water', '3 cans', 120], ['Eggs', '36 pcs', 340],
  ['Monggo (dry)', '400 g', 55], ['Rice', '~1.1 kg', 60], ['Pechay, kangkong, malunggay', 'assorted', 70],
  ['Cabbage, carrots, sayote', 'assorted', 100], ['Sinigang vegetables + sampalok mix', 'assorted', 90],
  ['Talong, ampalaya', 'assorted', 40], ['Ginger, garlic, onion', 'assorted', 50], ['Bananas + 1 papaya', '7 + 1', 100],
  ['Calamansi, vinegar, soy, salt, oil', 'top-ups', 40], ['Purified water', '~2 refills', 105]
];

/* ---------- State ---------- */
const KEY = 'kusog_v1';
const DEF = {settings: {kcal: 1800, protein: 140, start: 125, goal: 100, budget: 9200}, days: {}, weights: [], grocery: {week: '', checked: {}}, spend: [], badges: {}, lastLevel: null,
  plan: {breakfast: BREAKFAST, snack: SNACK, rot: ROT}, foods: [], exercises: EX_DEF, routines: ROUT_DEF, workouts: [], session: null,
  groc: GROC.map((g, i) => ({id: 'g' + i, n: g[0], a: g[1], c: g[2]})),
  rpg: null};
const clone = o => JSON.parse(JSON.stringify(o));
function newRpg() {
  const w = C.makeItem('w1', Math.random, 'common'), a = C.makeItem('a1', Math.random, 'common'), h = C.makeItem('h1', Math.random, 'common');
  return {pp: 0, xpBanked: null, stats: {str: 5, vit: 5, agi: 5, dex: 5}, stage: 1, wounded: false, victory: false, ng: 0, finalWins: 0, wins: 0, losses: 0,
    mats: {stone: 2, blessed: 0, guard: 0}, inv: [w, a, h], eq: {weapon: w.uid, armor: a.uid, helm: h.uid},
    ward: {owned: {suit_cyan: 1, aura_none: 1, back_none: 1}, eq: {suit: 'cyan', aura: 'none', back: 'none'}}};
}
function merge(d) {
  const base = newRpg(), r = d.rpg;
  const rpg = r ? Object.assign(base, r, {
    stats: Object.assign(base.stats, r.stats || {}), mats: Object.assign(base.mats, r.mats || {}),
    ward: {owned: Object.assign(base.ward.owned, (r.ward || {}).owned || {}), eq: Object.assign(base.ward.eq, (r.ward || {}).eq || {})}
  }) : base;
  return Object.assign(clone(DEF), d, {settings: Object.assign(clone(DEF.settings), d.settings || {}), rpg});
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const d = JSON.parse(raw);
      return merge(d);
    }
  } catch (e) {}
  return merge({});
}
let S = load();
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); }
  catch (e) { toast('Couldn’t save. Free up storage on your phone and try again.'); }
}
let tab = 'today';
let off = 0; // days back from today on the Today tab

const day = (k, create) => {
  if (!S.days[k] && create) S.days[k] = {meals: {}, extras: [], walk: false, strength: false, water: 0};
  return S.days[k];
};

/* ---------- Scoring ---------- */
function stat(k) {
  const d = S.days[k], date = fromKey(k), st = S.settings;
  let kcal = 0, p = 0, meals = 0;
  if (d) {
    for (const [slot] of SLOTS) {
      const m = d.meals[slot];
      if (m && m.done) {
        const o = opts(slot, date); const f = o[m.v || 0] || o[0];
        kcal += f.k; p += f.p; meals++;
      }
    }
    for (const x of d.extras) { kcal += x.k; p += x.p; }
  }
  const walk = !!(d && d.walk), strength = !!(d && d.strength), water = d ? d.water : 0;
  const pOK = p >= st.protein - 10;
  const kOK = meals > 0 && kcal >= st.kcal - 150 && kcal <= st.kcal + 150;
  const perfect = meals === 4 && pOK && kOK && walk && water >= 8;
  const xp = meals * 10 + (pOK ? 30 : 0) + (kOK ? 30 : 0) + (walk ? 20 : 0) + (strength ? 20 : 0) + (water >= 8 ? 10 : 0) + (perfect ? 25 : 0);
  return {kcal, p, meals, walk, strength, water, pOK, kOK, goal: pOK && kOK, perfect, xp};
}
const sortedWeights = () => [...S.weights].sort((a, b) => a.d < b.d ? -1 : 1);
const currentWeight = () => { const w = sortedWeights(); return w.length ? w[w.length - 1].kg : S.settings.start; };

function agg() {
  const keys = Object.keys(S.days).sort();
  const a = {xp: 0, meals: 0, perfect: 0, proteinDays: 0, walks: 0, strength: 0, waterDays: 0, best: 0, streak: 0};
  let run = 0, prev = null;
  for (const k of keys) {
    const s = stat(k);
    a.xp += s.xp; a.meals += s.meals; a.perfect += s.perfect ? 1 : 0; a.proteinDays += s.pOK && s.meals ? 1 : 0;
    a.walks += s.walk ? 1 : 0; a.strength += s.strength ? 1 : 0; a.waterDays += s.water >= 8 ? 1 : 0;
    if (s.goal) { run = (prev && keyOf(addDays(fromKey(k), -1)) === prev) ? run + 1 : 1; a.best = Math.max(a.best, run); prev = k; }
    else { run = 0; prev = null; }
  }
  let d = today();
  if (!stat(keyOf(d)).goal) d = addDays(d, -1);
  while (stat(keyOf(d)).goal) { a.streak++; d = addDays(d, -1); }
  a.weighIns = S.weights.length;
  a.workouts = S.workouts.length;
  a.prs = S.workouts.reduce((t, w) => t + (w.prs || 0), 0);
  a.xp += a.prs * 10;
  a.xp += a.weighIns * 25;
  a.lost = Math.max(0, S.settings.start - currentWeight());
  return a;
}
const levelOf = xp => { let L = 1; while (xp >= 50 * L * (L + 1)) L++; return L; };
const RANKS = [[1, 'Rookie'], [3, 'Steady stepper'], [5, 'Hill climber'], [8, 'Trailblazer'], [12, 'Island strong'], [16, 'Chocolate Hills legend']];
const rankOf = L => RANKS.filter(r => L >= r[0]).pop()[1];

const BADGES = [
  {id: 'first', ic: '🍳', n: 'First bite', d: 'Log your first meal', key: 'meals', need: 1},
  {id: 'perfect1', ic: '⭐', n: 'Perfect day', d: 'Hit every daily goal in one day', key: 'perfect', need: 1},
  {id: 'perfect10', ic: '🌟', n: 'Ten perfect days', d: 'Have 10 perfect days', key: 'perfect', need: 10},
  {id: 'streak3', ic: '🔥', n: '3-day streak', d: 'Hit calories and protein 3 days in a row', key: 'best', need: 3},
  {id: 'streak7', ic: '🔥', n: 'Full week', d: '7-day streak', key: 'best', need: 7},
  {id: 'streak14', ic: '🔥', n: 'Two weeks strong', d: '14-day streak', key: 'best', need: 14},
  {id: 'streak30', ic: '🌋', n: 'Unstoppable', d: '30-day streak', key: 'best', need: 30},
  {id: 'protein7', ic: '🍗', n: 'Protein pro', d: 'Hit your protein on 7 days', key: 'proteinDays', need: 7},
  {id: 'protein30', ic: '🐟', n: 'Protein machine', d: 'Hit your protein on 30 days', key: 'proteinDays', need: 30},
  {id: 'walk10', ic: '👟', n: 'Trail regular', d: 'Finish 10 walks', key: 'walks', need: 10},
  {id: 'walk50', ic: '🏝️', n: 'Island walker', d: 'Finish 50 walks', key: 'walks', need: 50},
  {id: 'str10', ic: '🏋️', n: 'Strength habit', d: 'Finish 10 strength sessions', key: 'strength', need: 10},
  {id: 'water14', ic: '💧', n: 'Well watered', d: 'Drink 8 glasses on 14 days', key: 'waterDays', need: 14},
  {id: 'weigh4', ic: '⚖️', n: 'Weekly check-in', d: 'Log 4 weigh-ins', key: 'weighIns', need: 4},
  {id: 'kg1', ic: '⛰️', n: 'First kilo', d: 'Lose 1 kg', key: 'lost', need: 1},
  {id: 'kg5', ic: '🏔️', n: 'Five down', d: 'Lose 5 kg', key: 'lost', need: 5},
  {id: 'kg10', ic: '🏔️', n: 'Ten down', d: 'Lose 10 kg', key: 'lost', need: 10},
  {id: 'kg20', ic: '🚩', n: 'Twenty down', d: 'Lose 20 kg', key: 'lost', need: 20},
  {id: 'pr1', ic: '💪', n: 'Personal best', d: 'Beat your best set on any exercise', key: 'prs', need: 1},
  {id: 'pr10', ic: '💪', n: 'Getting stronger', d: 'Set 10 personal bests', key: 'prs', need: 10},
  {id: 'wo20', ic: '🏋️', n: 'Twenty workouts', d: 'Finish 20 logged workouts', key: 'workouts', need: 20},
  {id: 'goal', ic: '🏆', n: 'Summit', d: 'Reach your goal weight', key: 'lost', need: null}
];
const needOf = b => b.need === null ? Math.max(0.1, S.settings.start - S.settings.goal) : b.need;

function rewards(beforeLevel) {
  const a = agg(); const L = levelOf(a.xp); const msgs = [];
  if (beforeLevel !== null && L > beforeLevel) msgs.push(`Level up! You’re level ${L}, ${rankOf(L)}`);
  for (const b of BADGES) {
    if (!S.badges[b.id] && a[b.key] >= needOf(b)) { S.badges[b.id] = keyOf(today()); msgs.push(`${b.ic} Badge unlocked: ${b.n}`); }
  }
  const R = S.rpg, first = R.xpBanked === null;
  if (first) R.xpBanked = 0;
  if (a.xp > R.xpBanked) {
    const gain = (a.xp - R.xpBanked) * PP_PER_XP;
    R.pp += gain; R.xpBanked = a.xp;
    if (R.wounded) { R.wounded = false; if (!first) msgs.push('💚 Your hero is healed and ready to engage again'); }
    if (first && gain > 0) msgs.unshift(`✦ ${fmt(gain)} progress points for your hero from the XP you’ve earned`);
  }
  S.lastLevel = L;
  save();
  msgs.forEach((m, i) => setTimeout(() => toast(m), 900 + i * 2600));
}

/* ---------- Toast ---------- */
let tt;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 2400);
}

/* ---------- Hero ---------- */
function hillY(x) {
  const B = [[30, 34], [95, 28], [160, 44], [228, 30], [300, 40]]; let y = 112;
  for (const [c, h] of B) y -= h * Math.exp(-(((x - c) / 30) ** 2));
  return y;
}
function hillsSVG(p) {
  let top = '';
  for (let x = 0; x <= 360; x += 6) top += `${x === 0 ? 'M' : 'L'}${x} ${hillY(x).toFixed(1)} `;
  const mx = 14 + p * 328, my = hillY(mx) - 10, fx = 344, fy = hillY(fx);
  return `<svg class="hills" viewBox="0 0 360 120" aria-hidden="true">
    <defs><linearGradient id="hg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF3DA8" stop-opacity=".38"/><stop offset="1" stop-color="#FF3DA8" stop-opacity="0"/></linearGradient></defs>
    <path d="${top}L360 120 L0 120Z" fill="url(#hg)"/>
    <path class="ridge" d="${top}" fill="none" stroke="var(--cyan)" stroke-width="2.5" stroke-linejoin="round"/>
    <line x1="${fx}" y1="${fy - 2}" x2="${fx}" y2="${fy - 30}" stroke="var(--hero-ink)" stroke-width="2"/>
    <path d="M${fx} ${fy - 30} L${fx + 14} ${fy - 25} L${fx} ${fy - 20}Z" fill="var(--mango)"/>
    <circle class="me" cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="7" fill="var(--mango)" stroke="#fff" stroke-width="2"/>
  </svg>`;
}
function hero() {
  const a = agg(), L = levelOf(a.xp), lo = 50 * (L - 1) * L, hi = 50 * L * (L + 1);
  const st = S.settings, cur = currentWeight(), span = st.start - st.goal;
  const p = span > 0 ? Math.min(1, Math.max(0, (st.start - cur) / span)) : 0;
  const left = Math.max(0, cur - st.goal);
  return `<header class="hero">
    <div class="hero-top">
      <div><h1>Level ${L}</h1><div class="rank">${rankOf(L)}</div></div>
      <div class="hero-pills"><div class="streak">${a.streak ? `🔥 ${a.streak}-day streak` : 'Start a streak today'}</div><button class="coinpill" data-tab="hero">✦ ${short(S.rpg.pp)} PP <span class="sep"></span> Stage ${S.rpg.stage}</button></div>
    </div>
    <div class="xp"><div class="xp-bar"><i style="width:${((a.xp - lo) / (hi - lo) * 100).toFixed(1)}%"></i></div>
      <small><span>${fmt(a.xp)} XP</span><span>${fmt(hi - a.xp)} XP to level ${L + 1}</span></small></div>
    ${hillsSVG(p)}
    <p class="climb">${left > 0 ? `${fmt(cur, 1)} kg now, ${fmt(left, 1)} kg to your ${fmt(st.goal, 1)} kg summit` : `You reached your ${fmt(st.goal, 1)} kg summit! Set a new goal in Settings.`}</p>
  </header>`;
}

/* ---------- Views ---------- */
function meter(label, val, target, unit, cls) {
  const pct = target > 0 ? Math.min(100, val / target * 100) : 0;
  return `<div class="meter"><div class="mrow"><span>${label}</span><span class="num"><b>${fmt(val)}</b> / ${fmt(target)} ${unit}</span></div>
    <div class="bar"><i class="${cls}" style="width:${pct}%"></i></div></div>`;
}
function vToday() {
  const date = addDays(today(), -off), k = keyOf(date), d = day(k) || {meals: {}, extras: [], walk: false, strength: false, water: 0};
  const s = stat(k), st = S.settings;
  const kc = s.kcal > st.kcal + 150 ? 'over' : s.kOK ? 'ok' : 'under';
  let note = '';
  if (s.meals === 4 && s.kcal < st.kcal - 150) note = 'You’re under your calorie target. Add a little food to fuel training and healing.';
  else if (s.kcal > st.kcal + 150) note = `Over by ${fmt(s.kcal - st.kcal)} kcal. No stress, tomorrow is a fresh start.`;
  else if (s.goal) note = 'Calories and protein on target. Nice work.';
  else if (!s.meals) note = 'Tap a meal after you eat it to earn XP.';

  const meals = SLOTS.map(([slot, name]) => {
    const o = opts(slot, date), m = d.meals[slot] || {}, f = o[m.v || 0] || o[0];
    return `<li class="meal">
      <button class="check ${m.done ? 'on' : ''}" data-act="eat" data-slot="${slot}" aria-pressed="${!!m.done}" aria-label="Mark ${name} as eaten">${m.done ? '✓' : ''}</button>
      <div><h3>${name}</h3><p>${esc(f.t)}</p><div class="macro num">${f.k} kcal, ${f.p} g protein</div></div>
      ${o.length > 1 ? `<button class="swap" data-act="swap" data-slot="${slot}">Swap</button>` : '<span></span>'}
    </li>`;
  }).join('');

  const drops = Array.from({length: 8}, (_, i) => `<button class="drop ${i < d.water ? 'on' : ''}" data-act="water" data-n="${i + 1}" aria-label="${i + 1} glasses">💧</button>`).join('');
  const extras = d.extras.map((x, i) => `<li><span>${esc(x.t)} <span class="muted small num">${x.k} kcal, ${x.p} g</span></span><button class="x" data-act="delx" data-i="${i}" aria-label="Remove ${esc(x.t)}">×</button></li>`).join('');
  const parts = [
    [`Meals ${s.meals}/4`, s.meals * 10, s.meals > 0], ['Protein', 30, s.pOK], ['Calories', 30, s.kOK],
    ['Walk', 20, s.walk], ['Strength', 20, s.strength], ['Water', 10, s.water >= 8], ['Perfect day', 25, s.perfect]
  ].map(([n, x, got]) => `<span class="${got ? 'got' : ''}">${n} +${n.startsWith('Meals') ? s.meals * 10 : x}</span>`).join('');

  return `${hero()}
  <div class="daynav">
    <button class="navbtn" data-act="prev" aria-label="Previous day">‹</button>
    <div style="text-align:center"><strong>${off === 0 ? 'Today' : off === 1 ? 'Yesterday' : niceDate(date)}</strong><div class="muted small">${niceDate(date)}</div></div>
    <button class="navbtn" data-act="next" aria-label="Next day" ${off === 0 ? 'disabled' : ''}>›</button>
  </div>
  <section class="panel">
    ${meter('Calories', s.kcal, st.kcal, 'kcal', kc)}
    ${meter('Protein', s.p, st.protein, 'g', s.pOK ? 'ok' : 'under')}
    ${note ? `<div class="note">${note}</div>` : ''}
    <div class="xpline">${parts}</div>
    <div class="note"><b class="num">${s.xp} XP</b> earned this day</div>
  </section>
  <h2>Meals</h2>
  <ul class="meals">${meals}</ul>
  <h2>Habits</h2>
  <div class="habits">
    <button class="habit ${d.walk ? 'on' : ''}" data-act="walk" aria-pressed="${!!d.walk}"><span>👟</span><b>30-min walk</b><small>+20 XP</small></button>
    <button class="habit ${d.strength ? 'on' : ''}" data-act="strength" aria-pressed="${!!d.strength}"><span>🏋️</span><b>Strength session</b><small>+20 XP, rest days are fine</small></button>
    <div class="water"><div class="spread"><b>Water</b><span class="muted small num">${d.water}/8 glasses, +10 XP at 8</span></div><div class="drops">${drops}</div></div>
  </div>
  <h2>Extra food</h2>
  <div class="chips">${quickChips()}</div>
  ${extras ? `<ul class="xlist">${extras}</ul>` : ''}
  <div class="custom">
    <input type="text" id="cName" placeholder="Other food" aria-label="Food name">
    <input type="number" id="cK" placeholder="kcal" inputmode="numeric" aria-label="Calories">
    <input type="number" id="cP" placeholder="protein g" inputmode="numeric" aria-label="Protein in grams">
    <label class="chk"><input type="checkbox" id="cSave"> Save to My foods for next time</label>
    <button class="btn ghost" data-act="addc">Add food</button>
  </div>`;
}
function quickChips() {
  return QUICK.map((q, i) => `<button class="chip" data-act="addq" data-src="q" data-i="${i}">+ ${esc(q.t)}</button>`).join('') +
    S.foods.map((q, i) => `<button class="chip mine" data-act="addq" data-src="f" data-i="${i}">★ ${esc(q.t)}</button>`).join('');
}

function chartSVG(ws, goal) {
  if (ws.length < 2) return '<p class="muted small">Log at least two weigh-ins to see your chart.</p>';
  const W = 320, H = 150, P = 26;
  const t0 = fromKey(ws[0].d).getTime(), t1 = fromKey(ws[ws.length - 1].d).getTime() || t0 + 1;
  const vals = ws.map(w => w.kg).concat([goal]);
  let lo = Math.min(...vals) - 1, hi = Math.max(...vals) + 1;
  const X = t => P + (t1 === t0 ? 0 : (t - t0) / (t1 - t0)) * (W - P - 8);
  const Y = v => 8 + (hi - v) / (hi - lo) * (H - 30);
  const pts = ws.map(w => `${X(fromKey(w.d).getTime()).toFixed(1)},${Y(w.kg).toFixed(1)}`).join(' ');
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Weight chart">
    <line x1="${P}" x2="${W - 8}" y1="${Y(goal)}" y2="${Y(goal)}" stroke="var(--mango)" stroke-dasharray="5 5" stroke-width="2"/>
    <text x="${W - 8}" y="${Y(goal) - 5}" text-anchor="end" font-size="11" fill="var(--muted)">goal ${fmt(goal, 1)}</text>
    <text x="0" y="${Y(hi - 1) + 4}" font-size="11" fill="var(--muted)">${fmt(hi - 1)}</text>
    <text x="0" y="${Y(lo + 1) + 4}" font-size="11" fill="var(--muted)">${fmt(lo + 1)}</text>
    <polyline points="${pts}" fill="none" stroke="var(--sea)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
    ${ws.map(w => `<circle cx="${X(fromKey(w.d).getTime()).toFixed(1)}" cy="${Y(w.kg).toFixed(1)}" r="3.5" fill="var(--sea)"/>`).join('')}
  </svg>`;
}
function vProgress() {
  const st = S.settings, ws = sortedWeights(), cur = currentWeight(), a = agg();
  let tip = '';
  const recent = ws.filter(w => (today() - fromKey(w.d)) / 864e5 <= 21);
  if (recent.length >= 3) {
    const spanDays = (fromKey(recent[recent.length - 1].d) - fromKey(recent[0].d)) / 864e5;
    const kgs = recent.map(w => w.kg);
    if (spanDays >= 14 && Math.max(...kgs) - Math.min(...kgs) < 0.3)
      tip = '<div class="tip">Your weight hasn’t moved in 2–3 weeks. Try dropping about 100–150 kcal a day, for example the ½ cup of rice at breakfast. If you feel weak on walks, keep calories where they are instead.</div>';
  }
  const rows = Array.from({length: 7}, (_, i) => {
    const d = addDays(today(), -i), s = stat(keyOf(d));
    return `<tr><td>${i === 0 ? 'Today' : niceDate(d)}</td><td class="num">${s.meals ? fmt(s.kcal) : '–'}</td><td class="num">${s.meals ? s.p + ' g' : '–'}</td><td>${s.goal ? '✅' : s.meals ? '·' : ''}</td></tr>`;
  }).join('');
  const list = [...ws].reverse().slice(0, 12).map(w => `<li><span>${niceDate(fromKey(w.d))}</span><span class="row"><b class="num">${fmt(w.kg, 1)} kg</b><button class="x" data-act="delw" data-d="${w.d}" aria-label="Delete weigh-in">×</button></span></li>`).join('');
  return `<h2 style="margin-top:20px">Progress</h2>
  <div class="stats">
    <div class="stat"><b class="num">${fmt(cur, 1)}</b><small>kg now</small></div>
    <div class="stat"><b class="num">${fmt(a.lost, 1)}</b><small>kg lost</small></div>
    <div class="stat"><b class="num">${fmt(Math.max(0, cur - st.goal), 1)}</b><small>kg to goal</small></div>
  </div>
  <h2>Weekly weigh-in</h2>
  <div class="panel stack">
    <p class="muted small" style="margin:0">Weigh yourself once a week, same day and time, before eating. Each weigh-in earns 25 XP.</p>
    <div class="row"><input type="number" id="wKg" step="0.1" inputmode="decimal" placeholder="Weight in kg" aria-label="Weight in kg"><button class="btn" data-act="weigh">Log weight</button></div>
    ${chartSVG(ws, st.goal)}
    ${list ? `<ul class="xlist">${list}</ul>` : ''}
  </div>
  ${tip}
  <h2>Last 7 days</h2>
  <div class="panel"><table><tr><th>Day</th><th>kcal</th><th>Protein</th><th>Goal</th></tr>${rows}</table>
  <p class="muted small" style="margin-bottom:0">Best streak: ${a.best} ${a.best === 1 ? 'day' : 'days'}. Perfect days: ${a.perfect}. Walks: ${a.walks}. Strength sessions: ${a.strength}.</p></div>
  ${vBadges()}`;
}

let groEdit = false;
const weekKey = () => { const d = today(); const dow = (d.getDay() + 6) % 7; return keyOf(addDays(d, -dow)); };
function vGroceries() {
  if (S.grocery.week !== weekKey()) { S.grocery = {week: weekKey(), checked: {}}; save(); }
  const ch = S.grocery.checked, G = S.groc;
  const total = G.reduce((t, g) => t + g.c, 0), got = G.reduce((t, g) => t + (ch[g.id] ? g.c : 0), 0);
  const items = groEdit
    ? G.map((g, i) => `<li class="gedrow">
        <input type="text" class="ged" data-i="${i}" data-f="n" value="${esc(g.n)}" aria-label="Item name">
        <input type="text" class="ged" data-i="${i}" data-f="a" value="${esc(g.a)}" aria-label="Amount">
        <div class="edn"><span>₱</span><input type="number" class="ged" data-i="${i}" data-f="c" value="${g.c}" inputmode="decimal" aria-label="Price of ${esc(g.n)} in pesos"></div>
        <button class="x" data-act="delgro" data-i="${i}" aria-label="Delete ${esc(g.n)}">×</button>
      </li>`).join('')
    : G.map(g => `<li><button class="gitem ${ch[g.id] ? 'on' : ''}" data-act="gro" data-id="${g.id}" aria-pressed="${!!ch[g.id]}">
    <span class="box">${ch[g.id] ? '✓' : ''}</span><span><span class="gname">${esc(g.n)}</span><small>${esc(g.a)}</small></span><span class="num">₱${fmt(g.c)}</span></button></li>`).join('');
  const now = today(), mk = keyOf(now).slice(0, 7);
  const monthSpend = S.spend.filter(s => s.d.slice(0, 7) === mk);
  const spent = monthSpend.reduce((t, s) => t + s.amt, 0);
  const daysLeft = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate() + 1;
  const left = S.settings.budget - spent;
  const sp = [...monthSpend].map((s, i) => ({...s, i: S.spend.indexOf(s)})).reverse().map(s => `<li><span>${niceDate(fromKey(s.d))}</span><span class="row"><b class="num">₱${fmt(s.amt)}</b><button class="x" data-act="delsp" data-i="${s.i}" aria-label="Delete entry">×</button></span></li>`).join('');
  return `<h2 style="margin-top:20px">Market list this week</h2>
  <div class="spread" style="margin-bottom:10px"><p class="muted small" style="margin:0">${groEdit ? 'Change any name, amount or price. Changes save as soon as you leave a field.' : 'Tap items as you buy them. Checks reset every Monday.'}</p>
    <button class="btn ${groEdit ? '' : 'ghost'} small" data-act="groedit">${groEdit ? 'Done' : 'Edit prices'}</button></div>
  <ul class="glist">${items || '<li class="muted small" style="padding:14px 16px">Your list is empty. Tap Edit prices to add items.</li>'}</ul>
  ${groEdit ? `<div class="panel" style="margin-top:10px"><div class="custom">
      <input type="text" id="gName" placeholder="New item" aria-label="New item name">
      <input type="text" id="gAmt" placeholder="Amount" aria-label="Amount">
      <input type="number" id="gCost" placeholder="₱" inputmode="decimal" aria-label="Price in pesos">
      <button class="btn ghost" data-act="addgro">Add item</button>
    </div>
    <button class="btn ghost small" data-act="resetgro" style="margin-top:10px">Reset list to the original</button></div>` : ''}
  <div class="panel spread" style="margin-top:10px"><span>Bought so far</span><b class="num">₱${fmt(got)} of ~₱${fmt(total)}</b></div>
  <p class="muted small">On the bigger budget, add a tub of unflavored whey and a bag of rolled oats once a month.</p>
  <h2>Monthly food budget</h2>
  <div class="panel stack">
    <div class="spread"><span>Spent in ${MON[now.getMonth()]}</span><b class="num">₱${fmt(spent)} / ₱${fmt(S.settings.budget)}</b></div>
    <div class="bar"><i class="${spent > S.settings.budget ? 'over' : 'ok'}" style="width:${Math.min(100, spent / Math.max(1, S.settings.budget) * 100)}%"></i></div>
    <p class="muted small" style="margin:0">${left >= 0 ? `₱${fmt(left)} left, about ₱${fmt(left / daysLeft)} a day for the rest of the month.` : `Over budget by ₱${fmt(-left)} this month.`}</p>
    <div class="row"><input type="number" id="spAmt" inputmode="decimal" placeholder="Amount spent (₱)" aria-label="Amount spent in pesos"><button class="btn" data-act="spend">Add</button></div>
    ${sp ? `<ul class="xlist">${sp}</ul>` : ''}
  </div>`;
}

function vBadges() {
  const a = agg(), have = BADGES.filter(b => S.badges[b.id]).length;
  return `<h2 style="margin-top:20px">Badges</h2>
  <p class="muted">${have} of ${BADGES.length} unlocked</p>
  <div class="badges">${BADGES.map(b => {
    const need = needOf(b), on = !!S.badges[b.id], cur = Math.min(a[b.key], need);
    return `<div class="badge ${on ? '' : 'locked'}"><span class="ic">${b.ic}</span><b>${esc(b.n)}</b><small>${esc(b.d)}</small>
      ${on ? `<small>Unlocked ${niceDate(fromKey(S.badges[b.id]))}</small>` : `<div class="pbar"><i style="width:${(cur / need * 100).toFixed(0)}%"></i></div><small class="num">${fmt(cur, b.key === 'lost' ? 1 : 0)} / ${fmt(need, b.key === 'lost' ? 1 : 0)}</small>`}</div>`;
  }).join('')}</div>
  <h2>How XP works</h2>
  <div class="panel small">Each meal you log: +10. Protein within 10 g of target: +30. Calories within 150 of target: +30. Walk: +20. Strength session: +20. 8 glasses of water: +10. Perfect day (all 4 meals, both targets, walk and water): +25 bonus. Weekly weigh-in: +25. Each exercise where you beat your best set: +10. Every XP point also gives your hero 1 progress point (PP). Your streak counts days where you hit both calories and protein. Eating far below target doesn’t earn calorie XP, because under-eating slows recovery.</div>`;
}

/* ---------- Train ---------- */
const exById = id => S.exercises.find(e => e.id === id);
const kgTxt = kg => fmt(kg, kg % 1 ? 1 : 0);
function fmtSets(sets) {
  if (!sets || !sets.length) return '';
  const one = s => `${s.r}${s.kg ? ` @ ${kgTxt(s.kg)} kg` : ''}`;
  const same = sets.every(x => x.r === sets[0].r && x.kg === sets[0].kg);
  return same ? `${sets.length} × ${one(sets[0])}${sets[0].kg ? '' : ' (bodyweight)'}` : sets.map(one).join(', ');
}
function lastSets(id) {
  for (let i = S.workouts.length - 1; i >= 0; i--) { const w = S.workouts[i]; if (w.sets[id] && w.sets[id].length) return {d: w.d, sets: w.sets[id]}; }
  return null;
}
function bestOf(id) {
  let b = null;
  for (const w of S.workouts) for (const x of (w.sets[id] || [])) if (!b || x.kg > b.kg || (x.kg === b.kg && x.r > b.r)) b = x;
  return b;
}
function painTip() {
  const P = S.workouts.filter(w => w.pain != null).map(w => w.pain);
  if (!P.length) return '';
  const l = P[P.length - 1];
  if (l >= 6) return `<div class="tip">Your right arm pain was ${l}/10 last session. Skip anything that aggravates it, and get it checked by a doctor or physio before pushing harder.</div>`;
  if (P.length >= 3 && P[P.length - 3] < P[P.length - 2] && P[P.length - 2] < l) return '<div class="tip">Your right arm pain has gone up three sessions in a row. Ease off whatever bothers it and get it checked.</div>';
  return '';
}
function sessionView() {
  const se = S.session, R = S.routines[se.r] || {name: 'Workout'};
  const cards = se.ids.map(id => {
    const e = exById(id); if (!e) return '';
    const sets = se.sets[id] || [], L = lastSets(id);
    const pre = sets[sets.length - 1] || (L && L.sets[0]) || {r: '', kg: ''};
    return `<div class="ex"><b>${esc(e.n)}</b><small class="muted">${esc(e.note || '')}</small>
      <div class="last small">${L ? `Last time (${niceDate(fromKey(L.d))}): ${fmtSets(L.sets)}` : 'First time: start light and focus on form.'}</div>
      ${sets.length ? `<ol class="sets">${sets.map((x, i) => `<li><span>Set ${i + 1}: ${x.r} reps${x.kg ? ` × ${kgTxt(x.kg)} kg` : ''}</span><button class="x" data-act="delset" data-ex="${id}" data-i="${i}" aria-label="Remove set">×</button></li>`).join('')}</ol>` : ''}
      <div class="setrow"><input type="number" id="r-${id}" inputmode="numeric" placeholder="Reps" value="${pre.r}" aria-label="Reps for ${esc(e.n)}"><input type="number" id="w-${id}" inputmode="decimal" step="0.5" placeholder="kg" value="${pre.kg ? pre.kg : ''}" aria-label="Weight in kg for ${esc(e.n)}"><button class="btn small" data-act="addset" data-ex="${id}">Add set</button></div>
    </div>`;
  }).join('');
  const pain = se.pain == null ? 0 : se.pain;
  return `<h2>${esc(R.name)}</h2><div class="stack">${cards}</div>
  <div class="panel stack" style="margin-top:14px">
    <label class="f" for="painIn">Right arm pain right now: <b id="painVal">${pain}</b>/10</label>
    <input type="range" id="painIn" min="0" max="10" value="${pain}">
    <div class="row"><button class="btn" data-act="finish">Finish workout</button><button class="btn ghost" data-act="cancelwo">Discard</button></div>
  </div>`;
}
function vTrain() {
  const W = S.workouts, last = W[W.length - 1], next = last && last.r === 'A' ? 'B' : 'A';
  let h = `<h2 style="margin-top:20px">Train</h2>
  <div class="tip" style="margin-top:0">These workouts keep weight off your right arm. Stop any movement that causes sharp or increasing pain, and get a doctor’s or physio’s OK when you can.</div>${painTip()}`;
  if (S.session) h += sessionView();
  else h += `<h2>Start a workout</h2><div class="picks">${['A', 'B'].map(r => {
    const R = S.routines[r];
    return `<button class="pick ${r === next ? 'next' : ''}" data-act="start" data-r="${r}"><b>${esc(R.name)}${r === next ? '<span class="tag">Up next</span>' : ''}</b><small>${R.ids.map(id => esc((exById(id) || {}).n || '')).filter(Boolean).join(', ') || 'No exercises yet. Add some under Edit workouts.'}</small></button>`;
  }).join('')}</div>`;
  const pains = W.filter(w => w.pain != null).slice(-5).map(w => w.pain);
  const hist = W.map((w, i) => ({...w, i})).reverse().slice(0, 10).map(w => {
    const n = Object.values(w.sets).reduce((t, x) => t + x.length, 0);
    return `<li><span>${niceDate(fromKey(w.d))}, ${esc((S.routines[w.r] || {name: 'Workout'}).name)}<br><span class="muted small">${n} sets${w.pain != null ? `, arm pain ${w.pain}/10` : ''}${w.prs ? `, ${w.prs} personal best${w.prs > 1 ? 's' : ''}` : ''}</span></span><button class="x" data-act="delwo" data-i="${w.i}" aria-label="Delete workout">×</button></li>`;
  }).join('');
  h += `<h2>History</h2><div class="panel">${hist ? `${pains.length ? `<p class="muted small" style="margin:0 0 6px">Arm pain, last ${pains.length} sessions: ${pains.join(', ')}</p>` : ''}<ul class="xlist" style="margin:0">${hist}</ul>` : '<p class="muted small" style="margin:0">Finished workouts show up here.</p>'}</div>`;
  h += `<details class="panel" id="d-routines"><summary>Edit workouts</summary>
    <table class="rt"><tr><th>Exercise</th><th>A</th><th>B</th><th></th></tr>
    ${S.exercises.map(e => `<tr><td>${esc(e.n)}</td>${['A', 'B'].map(r => `<td><input type="checkbox" data-rt="${r}" data-ex="${e.id}" ${S.routines[r].ids.includes(e.id) ? 'checked' : ''} aria-label="${esc(e.n)} in workout ${r}"></td>`).join('')}<td>${e.id.startsWith('c') ? `<button class="x" data-act="delex" data-ex="${e.id}" aria-label="Delete ${esc(e.n)}">×</button>` : ''}</td></tr>`).join('')}
    </table>
    <div class="stack" style="margin-top:12px">
      <input type="text" id="exName" placeholder="New exercise name" aria-label="New exercise name">
      <input type="text" id="exNote" placeholder="How to do it (optional)" aria-label="How to do it">
      <button class="btn ghost" data-act="addex">Add exercise</button>
    </div>
  </details>`;
  return h;
}

/* ---------- More: plan, foods, settings ---------- */
const FULLDAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
function edRow(path, f, extra) {
  return `<div class="edrow">
    <input type="text" class="ed" data-path="${path}.t" value="${esc(f.t)}" aria-label="Food">
    <div class="edn"><input type="number" class="ed" data-path="${path}.k" value="${f.k}" inputmode="numeric" aria-label="Calories"><span>kcal</span></div>
    <div class="edn"><input type="number" class="ed" data-path="${path}.p" value="${f.p}" inputmode="numeric" aria-label="Protein"><span>g</span></div>
    ${extra || '<span></span>'}
  </div>`;
}
function dayTotal(dw) {
  const P = S.plan, r = P.rot[dw];
  return {k: P.breakfast[0].k + P.snack[0].k + r.l.k + r.d.k, p: P.breakfast[0].p + P.snack[0].p + r.l.p + r.d.p};
}
function vSettings() {
  const st = S.settings, P = S.plan;
  const f = (id, label, v, step) => `<div><label class="f" for="${id}">${label}</label><input type="number" id="${id}" value="${v}" step="${step || 1}" inputmode="decimal"></div>`;
  const sel = path => S.foods.length ? `<select data-fill="${path}" aria-label="Fill from My foods"><option value="">Fill from My foods…</option>${S.foods.map((x, i) => `<option value="${i}">${esc(x.t)}</option>`).join('')}</select>` : '';
  const days = [1, 2, 3, 4, 5, 6, 0].map(dw => {
    const t = dayTotal(dw), ok = Math.abs(t.k - st.kcal) <= 150 && t.p >= st.protein - 10;
    return `<div class="dayed"><div class="spread"><b>${FULLDAY[dw]}</b><span class="small num ${ok ? 'muted' : 'warn'}">${fmt(t.k)} kcal, ${t.p} g</span></div>
      <div class="lbl">Lunch</div>${edRow(`plan.rot.${dw}.l`, P.rot[dw].l)}${sel(dw + '.l')}
      <div class="lbl">Dinner</div>${edRow(`plan.rot.${dw}.d`, P.rot[dw].d)}${sel(dw + '.d')}</div>`;
  }).join('');
  const optList = (list, label) => P[list].map((x, i) => edRow(`plan.${list}.${i}`, x, P[list].length > 1 ? `<button class="x" data-act="delopt" data-list="${list}" data-i="${i}" aria-label="Remove option">×</button>` : '')).join('') +
    `<button class="btn ghost small" data-act="addopt" data-list="${list}" style="margin-top:8px">Add ${label} option</button>`;
  return `<h2 style="margin-top:20px">Meal plan</h2>
  <p class="muted small">Changes save as soon as you leave a field. The first option for breakfast and snack is the default; the Swap button on Today cycles through the rest.</p>
  <details class="panel" id="d-week"><summary>Weekly lunch and dinner</summary>
    <p class="muted small" style="margin:0">Day totals use your first breakfast and snack option. Aim for ${fmt(st.kcal)} kcal (±150) and at least ${st.protein - 10} g protein; totals outside that show in red.</p>
    ${days}
  </details>
  <details class="panel" id="d-bfast"><summary>Breakfast options</summary>${optList('breakfast', 'breakfast')}</details>
  <details class="panel" id="d-snack"><summary>Post-workout snack options</summary>${optList('snack', 'snack')}</details>
  <div style="margin-top:10px"><button class="btn ghost small" data-act="resetplan">Reset meal plan to the original</button></div>
  <h2>My foods</h2>
  <details class="panel" id="d-foods" ${S.foods.length ? '' : 'open'}><summary>Saved foods (${S.foods.length})</summary>
    <p class="muted small" style="margin:0">Foods you save here become ★ quick-add buttons on Today and can fill any lunch or dinner in your plan.</p>
    ${S.foods.map((x, i) => edRow(`foods.${i}`, x, `<button class="x" data-act="delfood" data-i="${i}" aria-label="Delete ${esc(x.t)}">×</button>`)).join('')}
    <div class="custom">
      <input type="text" id="fName" placeholder="Food, e.g. carinderia pinakbet + rice" aria-label="Food name">
      <input type="number" id="fK" placeholder="kcal" inputmode="numeric" aria-label="Calories">
      <input type="number" id="fP" placeholder="protein g" inputmode="numeric" aria-label="Protein in grams">
      <button class="btn ghost" data-act="addfood">Save food</button>
    </div>
  </details>
  <h2>Your targets</h2>
  <div class="panel stack">
    <div class="grid2">
      ${f('sK', 'Daily calories', st.kcal)}${f('sP', 'Daily protein (g)', st.protein)}
      ${f('sS', 'Starting weight (kg)', st.start, 0.1)}${f('sG', 'Goal weight (kg)', st.goal, 0.1)}
      ${f('sB', 'Monthly food budget (₱)', st.budget)}
    </div>
    <button class="btn" data-act="saveset">Save settings</button>
  </div>
  <h2>Backup</h2>
  <div class="panel stack">
    <p class="muted small" style="margin:0">Your data stays on this phone only. Download a backup now and then, so you don’t lose your progress if you clear your browser or switch phones.</p>
    <div class="row"><button class="btn ghost" data-act="export">Download backup</button><button class="btn ghost" data-act="import">Restore backup</button></div>
  </div>
  <h2>Reset</h2>
  <div class="panel stack"><p class="muted small" style="margin:0">Erase all meals, weigh-ins, badges and settings from this phone.</p><button class="btn danger" data-act="wipe">Erase all data</button></div>`;
}

const VIEWS = {today: vToday, hero: vHero, train: vTrain, progress: vProgress, groceries: vGroceries, settings: vSettings};
function render() {
  const open = [...document.querySelectorAll('details[open]')].map(d => d.id);
  $('#app').innerHTML = VIEWS[tab]();
  open.forEach(id => { const el = document.getElementById(id); if (el) el.open = true; });
  if (tab === 'hero') mountArena(); else { if (fight) skipFight(); if (arena) arena.unmount(); }
  document.querySelectorAll('.tabs button').forEach(b => { if (b.dataset.tab === tab) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
}

/* ---------- Hero RPG ---------- */
const PP_PER_XP = 1;
const short = n => {
  n = Math.max(0, n);
  if (n < 10000) return fmt(Math.round(n));
  const u = ['K', 'M', 'B', 'T']; let i = -1;
  while (n >= 1000 && i < u.length - 1) { n /= 1000; i++; }
  return (n < 10 ? n.toFixed(2) : n < 100 ? n.toFixed(1) : Math.round(n)) + u[i];
};
const WARD = {
  suit: [
    {id: 'cyan', n: 'Cyan core', body: 0x2c4470, glow: 0x2ee6f0, cost: 0},
    {id: 'magenta', n: 'Magenta pulse', body: 0x4a2860, glow: 0xff3da8, cost: 150},
    {id: 'mango', n: 'Mango flux', body: 0x4e3a1c, glow: 0xffb547, cost: 250},
    {id: 'gold', n: 'Solar gold', body: 0x8a6a1a, glow: 0xfff1a0, cost: 400},
    {id: 'shadow', n: 'Shadow ops', body: 0x1c2030, glow: 0x8a7dff, cost: 600},
    {id: 'summit', n: 'Summit white', body: 0xdfe8f2, glow: 0x2ee6f0, cost: 0, req: 'goal'}
  ],
  aura: [{id: 'none', n: 'No aura', cost: 0}, {id: 'ring', n: 'Neon ring', cost: 200}, {id: 'sparks', n: 'Spark field', cost: 500}, {id: 'champ', n: 'Champion sparks', cost: 0, req: 'final'}],
  back: [{id: 'none', n: 'Nothing', cost: 0}, {id: 'jetpack', n: 'Jetpack', cost: 300}, {id: 'cape', n: 'Energy cape', cost: 450}]
};
const WARD_NAMES = {suit: 'Suit color', aura: 'Aura', back: 'Back'};
const FORMS = ['Recruit', 'Runner', 'Fighter', 'Vanguard', 'Titan', 'Legend'];
const reqMet = (r, a) => r === 'goal' ? a.lost >= Math.max(.1, S.settings.start - S.settings.goal) : S.rpg.finalWins > 0;
const reqText = r => r === 'goal' ? 'Reach your goal weight to unlock' : 'Beat Lord Cravings to unlock';
let wardSlot = 'suit', previewSt = null, previewUntil = 0, refineSlot = null, refineOpts = {blessed: false, guard: false}, lastRefine = '';
let aggCache = null, aggAt = 0;
const aggC = () => { if (!aggCache || Date.now() - aggAt > 1500) { aggCache = agg(); aggAt = Date.now(); } return aggCache; };

const itemBy = uid => S.rpg.inv.find(i => i.uid === uid);
const equipped = () => Object.keys(C.SLOTS).map(sl => itemBy(S.rpg.eq[sl])).filter(Boolean);
const heroNow = () => C.heroDerived(S.rpg.stats, equipped());
const enemyNow = () => C.enemyFor(S.rpg.stage, S.rpg.ng);

function heroCfg(a) {
  const st = S.settings, span = Math.max(.1, st.start - st.goal), pv = previewSt !== null && Date.now() < previewUntil;
  const p = pv ? previewSt / 5 : Math.min(1, Math.max(0, a.lost / span));
  const R = S.rpg, suit = WARD.suit.find(x => x.id === R.ward.eq.suit) || WARD.suit[0];
  const trained = (R.stats.str + R.stats.vit + R.stats.agi + R.stats.dex - 20) / 160;
  const mu = Math.min(1, a.workouts * .015 + a.prs * .03 + trained * .5 + (pv ? p * .5 : 0));
  const w = itemBy(R.eq.weapon), h = itemBy(R.eq.helm);
  return {fat: Math.round((1 - p) * 50) / 50, muscle: Math.round(mu * 20) / 20, stage: Math.min(5, Math.floor(p * 5 + 1e-9)),
    body: suit.body, glow: suit.glow, head: h ? C.BASES[h.base].model : 'none', aura: R.ward.eq.aura === 'champ' ? 'sparks' : R.ward.eq.aura,
    back: R.ward.eq.back, weapon: w ? C.BASES[w.base].model : 'blade'};
}

let arena = null, arenaP = null, fight = null, fightLog = [];
const live = () => tab === 'hero' && arena && arena.mounted && !document.hidden;
const sceneEnemy = e => ({key: `${e.stage}-${S.rpg.ng}`, type: e.type, color: e.color, boss: e.boss, final: e.final});
function mountArena() {
  const el = $('#stage3d'); if (!el) return;
  if (!arenaP) arenaP = import('./scene.js').then(m => (arena = new m.Arena()));
  arenaP.then(ar => {
    if (tab !== 'hero') return; const el2 = $('#stage3d'); if (!el2) return;
    ar.mount(el2); ar.setHero(heroCfg(aggC()));
    if (!fight) { ar.setEnemy(S.rpg.victory ? null : sceneEnemy(enemyNow())); ar.resetPose(); if (S.rpg.wounded) ar.heroFall(); }
    hud();
  }).catch(() => { arenaP = null; el.innerHTML = '<p class="muted small" style="padding:16px">The 3D view isn’t available on this device. Battles still work.</p>'; });
}
function floater(txt, cls, who) {
  if (!live()) return; const p = arena.screenPos(who), box = $('#floaters'); if (!p || !box) return;
  const el = document.createElement('span'); el.className = 'fl ' + cls; el.textContent = txt;
  el.style.left = (p.x + Math.random() * 30 - 15) + 'px'; el.style.top = p.y + 'px';
  box.appendChild(el); setTimeout(() => el.remove(), 950);
}
function hud() {
  const set = (id, v) => { const e = document.getElementById(id); if (e && e.textContent !== v) e.textContent = v; };
  const w = (id, p) => { const e = document.getElementById(id); if (e) e.style.width = Math.max(0, Math.min(100, p)).toFixed(1) + '%'; };
  const R = S.rpg, e = fight ? fight.e : enemyNow(), h = fight ? fight.h : heroNow();
  set('hPP', `✦ ${short(R.pp)} PP`);
  set('hZone', R.victory ? 'Island saved' : `Zone ${e.z}: ${C.ZONES[e.z - 1].n}`);
  set('hWave', R.victory ? 'Final boss defeated' : e.final ? 'Stage 50, final boss' : `Stage ${e.stage}${e.boss ? ', zone boss' : ''}`);
  const ehp = fight ? fight.ehp : e.hp, hhp = fight ? fight.hhp : (R.wounded ? 0 : h.hp);
  set('eName', R.victory ? '' : e.name); set('eHpTxt', R.victory ? '' : short(ehp)); w('eHp', R.victory ? 0 : ehp / e.hp * 100);
  set('hHpTxt', `${short(hhp)} / ${short(h.hp)}`); w('hHp', hhp / h.hp * 100);
  const lg = document.getElementById('fightLog');
  if (lg) lg.innerHTML = fightLog.slice(-5).map(l => `<li class="${l.c || ''}">${l.t}</li>`).join('');
}

/* ----- Fight playback ----- */
function engage() {
  const R = S.rpg;
  if (fight) return;
  if (R.victory) { toast('You already beat Lord Cravings. Start New Game+ for a new run.'); return; }
  if (R.wounded) { toast('Your hero is wounded. Log any part of your routine to heal.'); return; }
  if (!arena || !arena.mounted) { toast('Open the Hero tab to fight.'); return; }
  const h = heroNow(), e = enemyNow(), res = C.simulate(h, e);
  fight = {h, e, res, i: 0, hhp: h.hp, ehp: e.hp};
  const n = res.events.length;
  fight.dur = n <= 14 ? 1.05 : Math.max(.45, 14.7 / n);
  fightLog = [{t: `⚔️ Stage ${e.stage}: you engage ${e.name}.`, c: 'sys'}];
  arena.setHero(heroCfg(aggC())); arena.resetPose(); arena.setEnemy(sceneEnemy(e));
  rerender();
  setTimeout(nextEvent, 500);
}
function nextEvent() {
  const f = fight; if (!f) return;
  if (!live()) { finishFight(); return; }
  if (f.i >= f.res.events.length) { setTimeout(finishFight, 300); return; }
  const ev = f.res.events[f.i++], e = f.e, h = f.h, ms = f.dur * 1000;
  if (ev.t === 'dbl') { fightLog.push({t: '⚡ Double strike!', c: 'good'}); hud(); setTimeout(nextEvent, 120); return; }
  if (ev.t === 'h') {
    arena.heroSlash(ev.res, f.dur * .9, () => {
      if (ev.res === 'miss') { floater('MISS', 'miss', 'enemy'); fightLog.push({t: `🎲 ${ev.roll} + ${h.hit} vs AC ${e.ac}: ${e.name} evades your slash`}); }
      else {
        f.ehp = ev.ehp; floater((ev.res === 'crit' ? 'CRIT ' : '') + short(ev.dmg), ev.res === 'crit' ? 'crit' : 'dmg', 'enemy');
        fightLog.push({t: ev.res === 'crit' ? `🎲 ${ev.roll}: critical slash for ${short(ev.dmg)}!` : `🎲 ${ev.roll} + ${h.hit} vs AC ${e.ac}: you slash for ${short(ev.dmg)}`, c: ev.res === 'crit' ? 'crit' : 'good'});
      }
      hud();
    });
  } else {
    arena.enemyStrike(ev.res, f.dur * .9, () => {
      if (ev.res === 'dodge') { floater('DODGE', 'dodge', 'hero'); fightLog.push({t: `🎲 ${e.name} rolls ${ev.roll} + ${e.hit} vs your AC ${h.ac}: you dodge`}); }
      else {
        f.hhp = ev.hhp; floater('-' + short(ev.dmg), 'hurt', 'hero');
        fightLog.push({t: `🎲 ${e.name} rolls ${ev.roll} + ${e.hit} vs your AC ${h.ac}: ${ev.res === 'crit' ? 'crushing blow, ' : ''}you take ${short(ev.dmg)}`, c: 'bad'});
      }
      hud();
    });
  }
  setTimeout(nextEvent, ms);
}
function finishFight(skipped) {
  const f = fight; if (!f) return; fight = null;
  const R = S.rpg, e = f.e, win = f.res.win;
  if (win) {
    const loot = C.lootFor(e.stage);
    R.mats.stone += loot.stones; R.inv.push(...loot.items); R.wins++;
    const lootTxt = [`${loot.stones} empower stone${loot.stones > 1 ? 's' : ''}`, ...loot.items.map(it => `${C.RARITY[it.rarity]} ${C.BASES[it.base].n}`)].join(', ');
    fightLog.push({t: `🏆 Victory over ${e.name}! Loot: ${lootTxt}.`, c: 'win'});
    if (live()) { arena.enemyDie(); setTimeout(() => live() && arena.heroVictory(), 350); }
    if (e.final) { R.victory = true; R.finalWins++; toast('🏆 Lord Cravings is defeated! The island is saved.'); }
    else { R.stage++; toast(`🏆 Stage ${e.stage} cleared. Loot: ${lootTxt}`); }
  } else {
    R.wounded = true; R.losses++;
    fightLog.push({t: f.res.timeout ? `😮‍💨 Out of stamina. ${e.name} outlasted you.` : `💀 ${e.name} defeated you.`, c: 'bad'});
    fightLog.push({t: 'Your hero is wounded. Log any part of your routine to heal, then try again.', c: 'sys'});
    if (live()) arena.heroFall();
    toast(`Defeated by ${e.name}. Train up and heal with your routine.`);
  }
  aggCache = null; save();
  setTimeout(() => { if (tab === 'hero') { rerender(); if (win && arena && !R.victory) setTimeout(() => { if (!fight && live()) { arena.setEnemy(sceneEnemy(enemyNow())); arena.resetPose(); } }, 1900); } }, skipped ? 0 : 400);
}
function skipFight() {
  const f = fight; if (!f) return;
  for (; f.i < f.res.events.length; f.i++) { const ev = f.res.events[f.i]; if (ev.t === 'h' && ev.ehp !== undefined) f.ehp = ev.ehp; if (ev.t === 'e' && ev.hhp !== undefined) f.hhp = ev.hhp; }
  fightLog.push({t: '⏩ Skipped to the end.', c: 'sys'});
  finishFight(true);
}

/* ----- Hero tab ----- */
function itemCard(it, slot) {
  if (!it) return `<div class="gear empty"><small>${C.SLOTS[slot]}</small><b>Empty</b></div>`;
  const b = C.BASES[it.base], o = C.itemStats(it);
  const parts = [];
  if (o.dmg) parts.push(`${fmt(o.dmg, o.dmg % 1 ? 1 : 0)} dmg`);
  if (o.hp) parts.push(`+${fmt(o.hp)} HP`);
  if (o.ac) parts.push(`+${o.ac} AC`);
  if (o.dr) parts.push(`${o.dr} DR`);
  if (o.hit) parts.push(`+${o.hit} hit`);
  const bon = Object.entries(it.bonus || {}).map(([k, v]) => `+${v} ${C.STATS[k].n}`).join(', ');
  return `<div class="gear r-${it.rarity}"><small>${C.SLOTS[slot]}, tier ${b.tier}</small><b>${esc(C.itemName(it))}</b>
    <span class="gstats">${parts.join(', ')}</span>${bon ? `<span class="gbonus">${C.RARITY[it.rarity]}: ${bon}</span>` : ''}
    <button class="btn ghost small" data-act="refsel" data-slot="${slot}" ${it.ref >= 10 ? 'disabled' : ''}>${it.ref >= 10 ? 'Max +10' : 'Refine'}</button></div>`;
}
function refinePanel() {
  if (!refineSlot) return '';
  const R = S.rpg, it = itemBy(R.eq[refineSlot]); if (!it || it.ref >= 10) return '';
  const base = C.REFINE_CHANCE[it.ref], p = Math.min(100, base + (refineOpts.blessed ? 15 : 0)), cost = C.refineCost(it.ref);
  const canDrop = it.ref >= 5;
  return `<div class="panel refine">
    <div class="spread"><b>Refine ${esc(C.itemName(it))} to +${it.ref + 1}</b><button class="x" data-act="refclose" aria-label="Close">×</button></div>
    <div class="chance"><span class="num">${p}%</span><small>success chance</small></div>
    <p class="muted small" style="margin:0">Costs ${cost} PP and 1 empower stone (you have ${R.mats.stone}). ${canDrop ? 'If it fails, the item drops to +' + (it.ref - 1) + ' unless you use a guard scroll.' : 'If it fails, you keep the current level.'}</p>
    <label class="chk"><input type="checkbox" data-ropt="blessed" ${refineOpts.blessed ? 'checked' : ''} ${R.mats.blessed ? '' : 'disabled'}> Use a blessed stone, +15% (you have ${R.mats.blessed})</label>
    ${canDrop ? `<label class="chk"><input type="checkbox" data-ropt="guard" ${refineOpts.guard ? 'checked' : ''} ${R.mats.guard ? '' : 'disabled'}> Use a guard scroll, no level loss (you have ${R.mats.guard})</label>` : ''}
    <button class="btn" data-act="refine" ${R.pp < cost || R.mats.stone < 1 ? 'disabled' : ''}>Refine for ${cost} PP</button>
    ${lastRefine ? `<p class="refres">${lastRefine}</p>` : ''}
  </div>`;
}
function vHero() {
  const R = S.rpg, a = aggC(), st = S.settings, span = Math.max(.1, st.start - st.goal);
  const p = Math.min(1, Math.max(0, a.lost / span)), form = Math.min(5, Math.floor(p * 5 + 1e-9));
  const nextKg = form < 5 ? span * (form + 1) / 5 : null;
  const h = heroNow(), e = enemyNow();
  const chance = R.victory ? 1 : C.winChance(h, e, 400), th = C.threat(chance), tips = R.victory ? [] : C.advice(h, e);
  const tr = C.TRAITS[e.trait];
  const statRows = Object.entries(C.STATS).map(([k, m]) => {
    const v = R.stats[k], gear = h.stats[k] - v, c = C.statCost(v);
    return `<li class="srow"><div><b>${m.n} <span class="num">${v}</span>${gear ? `<span class="gearb"> +${gear}</span>` : ''}</b><small>${m.d}</small></div>
      <button class="btn small" data-act="stat" data-k="${k}" data-cost="${c}" ${R.pp < c ? 'disabled' : ''}>+1 for ${c} PP</button></li>`;
  }).join('');
  const bag = R.inv.filter(it => !Object.values(R.eq).includes(it.uid));
  const bagRows = bag.map(it => {
    const b = C.BASES[it.base], bon = Object.entries(it.bonus || {}).map(([k, v]) => `+${v} ${C.STATS[k].n}`).join(', ');
    return `<li class="shop-row r-${it.rarity}"><div><b>${esc(C.itemName(it))}</b><small>${C.SLOTS[b.slot]}, tier ${b.tier}, ${C.RARITY[it.rarity]}${bon ? `: ${bon}` : ''}</small></div>
      <div class="row"><button class="btn small" data-act="equipi" data-uid="${it.uid}">Equip</button><button class="btn ghost small" data-act="salvage" data-uid="${it.uid}">Salvage</button></div></li>`;
  }).join('');
  const shop = Object.entries(C.SHOP).map(([k, it]) => `<li class="shop-row"><div><b>${it.n} <span class="lv">×${R.mats[k]}</span></b><small>${it.d}</small></div>
    <button class="btn small" data-act="buymat" data-k="${k}" data-cost="${it.cost}" ${R.pp < it.cost ? 'disabled' : ''}>${it.cost} PP</button></li>`).join('');
  const ward = WARD[wardSlot].map(it => {
    const own = !!R.ward.owned[wardSlot + '_' + it.id], eq = R.ward.eq[wardSlot] === it.id, locked = it.req && !reqMet(it.req, a);
    let btn;
    if (eq) btn = '<span class="eqd">Equipped</span>';
    else if (own) btn = `<button class="btn ghost small" data-act="wear" data-slot="${wardSlot}" data-id="${it.id}">Wear</button>`;
    else if (locked) btn = `<span class="muted small lockt">🔒 ${reqText(it.req)}</span>`;
    else btn = `<button class="btn small" data-act="buyw" data-slot="${wardSlot}" data-id="${it.id}" data-cost="${it.cost}" ${R.pp < it.cost ? 'disabled' : ''}>${it.cost ? `${it.cost} PP` : 'Claim'}</button>`;
    const sw = it.glow !== undefined ? `<span class="swatch" style="--sw:#${it.glow.toString(16).padStart(6, '0')};--sb:#${it.body.toString(16).padStart(6, '0')}"></span>` : '';
    return `<li class="shop-row"><div class="row">${sw}<b>${it.n}</b></div>${btn}</li>`;
  }).join('');
  const eDmg = Math.max(1, Math.round(e.dmg - h.dr));
  return `<section class="arena">
    <div id="stage3d" class="stage3d"></div>
    <div class="hud">
      <div class="hud-top"><div><div class="zone" id="hZone"></div><div class="wave" id="hWave"></div></div><div class="pills"><div class="energy" id="hPP"></div></div></div>
      <div class="ebox"><div class="spread"><b id="eName"></b><span id="eHpTxt" class="num"></span></div><div class="hpbar enemy"><i id="eHp"></i></div></div>
      <div class="hbox"><div class="spread"><b>You</b><span id="hHpTxt" class="num"></span></div><div class="hpbar mine"><i id="hHp"></i></div></div>
    </div>
    <div id="floaters"></div>
  </section>
  ${R.victory ? `<div class="panel opp win"><b>🏆 You defeated Lord Cravings.</b><p class="muted small">Start New Game+ to replay all 50 stages with stronger enemies. You keep your stats and gear.</p><button class="btn engage" data-act="ngplus">Start New Game+</button></div>` : `
  <div class="panel opp">
    <div class="spread"><div><b class="oname">${esc(e.name)}</b><small class="muted">Stage ${e.stage} of 50${e.boss ? ', zone boss' : ''}${R.ng ? `, New Game+ ${R.ng}` : ''}</small></div><span class="threat ${th.c}">${th.n}</span></div>
    <div class="ostats"><span>HP <b class="num">${short(e.hp)}</b></span><span>AC <b class="num">${e.ac}</b></span><span>Hits you for <b class="num">~${short(eDmg)}</b></span><span>Armor <b class="num">${e.dr}</b></span></div>
    <p class="trait"><b>${tr.n}.</b> ${tr.d}</p>
    ${tips.length ? `<ul class="tips">${tips.map(t => `<li>${t}</li>`).join('')}</ul>` : '<p class="muted small" style="margin:0">Your build looks suited for this fight.</p>'}
    ${fight ? '<button class="btn ghost engage" data-act="skipfight">Skip to result</button>'
      : R.wounded ? '<button class="btn engage" disabled>Wounded</button><p class="muted small" style="margin:8px 0 0">Your hero needs to heal. Log a meal, walk, water, workout or weigh-in, and you can engage again.</p>'
      : '<button class="btn engage" data-act="engage">Engage</button>'}
  </div>`}
  <ul class="flog" id="fightLog"></ul>

  <h2>Your hero</h2>
  <div class="panel stack">
    <div class="spread"><div><div class="form-name">${FORMS[form]} form</div>
    <div class="muted small">${nextKg !== null ? `Next form at ${fmt(nextKg, 1)} kg lost (${fmt(Math.max(0, nextKg - a.lost), 1)} kg to go).` : 'Final form unlocked.'}</div></div>
    <div class="ppbig"><span class="num">${short(R.pp)}</span><small>PP</small></div></div>
    <div class="forms">${FORMS.map((f, i) => `<button class="formchip ${i <= form ? 'got' : ''}" data-act="preview" data-st="${i}">${i <= form ? '' : '🔒 '}${f}</button>`).join('')}</div>
    <p class="muted small" style="margin:0">Your hero’s body follows your real weight loss and training. Tap a form to preview it. Drag the 3D view to turn it.</p>
  </div>
  <div class="derived">
    <div><small>Damage</small><b class="num">${fmt(h.dmg, 0)}</b></div><div><small>HP</small><b class="num">${fmt(h.hp)}</b></div>
    <div><small>Armor class</small><b class="num">${h.ac}</b></div><div><small>Accuracy</small><b class="num">+${h.hit}</b></div>
    <div><small>Crit on</small><b class="num">${h.crit === 20 ? '20' : `${h.crit}–20`}</b></div><div><small>Damage reduction</small><b class="num">${h.dr}</b></div>
    <div><small>Double strike</small><b class="num">${Math.round(h.dbl * 100)}%</b></div><div><small>Win record</small><b class="num">${R.wins}–${R.losses}</b></div>
  </div>
  <h2>Attributes</h2>
  <ul class="shop">${statRows}</ul>
  <h2>Equipment</h2>
  <div class="gearrow">${Object.keys(C.SLOTS).map(sl => itemCard(itemBy(R.eq[sl]), sl)).join('')}</div>
  ${refinePanel()}
  <h2>Bag</h2>
  ${bagRows ? `<ul class="shop">${bagRows}</ul>` : '<p class="muted small">Gear you win drops here. Stage 5 of each zone drops an item, and zone bosses drop a better tier.</p>'}
  <h2>Shop</h2>
  <ul class="shop">${shop}</ul>
  <h2>Wardrobe</h2>
  <div class="seg" role="tablist">${Object.keys(WARD).map(k => `<button role="tab" aria-selected="${k === wardSlot}" data-act="wardslot" data-slot="${k}">${WARD_NAMES[k]}</button>`).join('')}</div>
  <ul class="shop">${ward}</ul>
  <p class="muted small">Progress points (PP) come only from your real routine: every XP you earn on Today, Train and Progress gives 1 PP. A full day is about 150 PP. Battles don’t give PP, they give stones and gear.</p>`;
}

/* ---------- Actions ---------- */
const num = id => parseFloat(($('#' + id) || {}).value);
function act(a, ds) {
  const before = levelOf(agg().xp);
  const k = keyOf(addDays(today(), -off));
  let keepScroll = true;
  switch (a) {
    case 'prev': off = Math.min(off + 1, 60); break;
    case 'next': off = Math.max(off - 1, 0); break;
    case 'eat': { const d = day(k, true), m = d.meals[ds.slot] || (d.meals[ds.slot] = {done: false, v: 0}); m.done = !m.done; if (m.done) toast('+10 XP, +10 PP'); break; }
    case 'swap': { const d = day(k, true), m = d.meals[ds.slot] || (d.meals[ds.slot] = {done: false, v: 0}); m.v = ((m.v || 0) + 1) % opts(ds.slot, fromKey(k)).length; break; }
    case 'walk': { const d = day(k, true); d.walk = !d.walk; if (d.walk) toast('👟 +20 XP, +20 PP'); break; }
    case 'strength': { const d = day(k, true); d.strength = !d.strength; if (d.strength) toast('🏋️ +20 XP, +20 PP'); break; }
    case 'water': { const d = day(k, true), n = +ds.n; d.water = d.water === n ? n - 1 : n; if (d.water === 8) toast('💧 Water goal hit, +10 XP'); break; }
    case 'addq': { const f = (ds.src === 'f' ? S.foods : QUICK)[+ds.i]; if (!f) return; day(k, true).extras.push({t: f.t, k: f.k, p: f.p}); break; }
    case 'addc': {
      const t = ($('#cName').value || '').trim(), kc = num('cK'), p = num('cP') || 0;
      if (!t || !(kc >= 0)) { toast('Enter a food name and its calories.'); return; }
      const item = {t: t.slice(0, 60), k: Math.round(kc), p: Math.round(p)};
      day(k, true).extras.push(item);
      if ($('#cSave') && $('#cSave').checked && !S.foods.some(x => x.t.toLowerCase() === item.t.toLowerCase())) { S.foods.push({...item}); toast('Saved to My foods'); }
      break;
    }
    case 'addopt': S.plan[ds.list].push({t: 'New option', k: 0, p: 0}); break;
    case 'delopt': if (S.plan[ds.list].length > 1) S.plan[ds.list].splice(+ds.i, 1); break;
    case 'resetplan':
      if (!confirm('Reset your meal plan to the original? Your saved foods stay.')) return;
      S.plan = clone(DEF.plan); toast('Meal plan reset'); break;
    case 'addfood': {
      const t = ($('#fName').value || '').trim(), kc = num('fK'), p = num('fP') || 0;
      if (!t || !(kc >= 0)) { toast('Enter a food name and its calories.'); return; }
      S.foods.push({t: t.slice(0, 60), k: Math.round(kc), p: Math.round(p)}); toast('Saved to My foods'); break;
    }
    case 'delfood': S.foods.splice(+ds.i, 1); break;
    case 'start': {
      const R = S.routines[ds.r];
      if (!R || !R.ids.length) { toast('Add exercises to this workout first.'); return; }
      S.session = {r: ds.r, d: keyOf(today()), ids: [...R.ids], sets: {}, pain: null}; keepScroll = false; break;
    }
    case 'addset': {
      const r = num('r-' + ds.ex), kg = num('w-' + ds.ex) || 0;
      if (!(r > 0)) { toast('Enter how many reps (or seconds) you did.'); return; }
      if (kg < 0 || kg > 300) { toast('Enter the weight in kg, or leave it blank.'); return; }
      (S.session.sets[ds.ex] = S.session.sets[ds.ex] || []).push({r: Math.round(r), kg: Math.round(kg * 2) / 2}); break;
    }
    case 'delset': S.session.sets[ds.ex].splice(+ds.i, 1); break;
    case 'finish': {
      const se = S.session;
      for (const id of Object.keys(se.sets)) if (!se.sets[id].length) delete se.sets[id];
      if (!Object.keys(se.sets).length) { toast('Add at least one set first.'); return; }
      const pin = $('#painIn'); se.pain = pin ? +pin.value : (se.pain || 0);
      let prs = 0;
      for (const [id, sets] of Object.entries(se.sets)) {
        const b = bestOf(id);
        if (b && sets.some(x => x.kg > b.kg || (x.kg === b.kg && x.r > b.r))) prs++;
      }
      S.workouts.push({d: se.d, r: se.r, sets: se.sets, pain: se.pain, prs});
      day(se.d, true).strength = true; S.session = null; keepScroll = false;
      toast(prs ? `💪 Workout saved. ${prs} personal best${prs > 1 ? 's' : ''}!` : '🏋️ Workout saved, strength session checked');
      break;
    }
    case 'cancelwo': if (!confirm('Discard this workout? Sets you logged will be lost.')) return; S.session = null; break;
    case 'delwo': if (!confirm('Delete this workout from your history?')) return; S.workouts.splice(+ds.i, 1); break;
    case 'addex': {
      const n = ($('#exName').value || '').trim();
      if (!n) { toast('Enter an exercise name.'); return; }
      S.exercises.push({id: 'c' + Date.now(), n: n.slice(0, 60), note: ($('#exNote').value || '').trim().slice(0, 140)}); break;
    }
    case 'delex':
      if (!confirm('Delete this exercise? Past workouts keep their sets.')) return;
      S.exercises = S.exercises.filter(e => e.id !== ds.ex);
      for (const r of Object.keys(S.routines)) S.routines[r].ids = S.routines[r].ids.filter(id => id !== ds.ex);
      break;
    case 'engage': engage(); return;
    case 'skipfight': skipFight(); return;
    case 'stat': {
      const R = S.rpg, c = C.statCost(R.stats[ds.k]);
      if (R.pp < c) { toast('Not enough PP yet. Log your routine to earn more.'); return; }
      R.pp -= c; R.stats[ds.k]++; toast(`${C.STATS[ds.k].full} raised to ${R.stats[ds.k]}`); break;
    }
    case 'refsel': refineSlot = ds.slot; refineOpts = {blessed: false, guard: false}; lastRefine = ''; break;
    case 'refclose': refineSlot = null; lastRefine = ''; break;
    case 'refine': {
      const R = S.rpg, it = itemBy(R.eq[refineSlot]); if (!it || it.ref >= 10) return;
      const cost = C.refineCost(it.ref);
      if (R.pp < cost || R.mats.stone < 1) { toast('You need more PP or empower stones.'); return; }
      const opts = {blessed: refineOpts.blessed && R.mats.blessed > 0, guard: refineOpts.guard && R.mats.guard > 0 && it.ref >= 5};
      R.pp -= cost; R.mats.stone--; if (opts.blessed) R.mats.blessed--; if (opts.guard) R.mats.guard--;
      const before = it.ref, r = C.rollRefine(it.ref, opts); it.ref = r.ref;
      lastRefine = r.ok ? `✨ Success! ${esc(C.BASES[it.base].n)} is now +${it.ref}.` : r.dropped ? `💥 Failed. ${esc(C.BASES[it.base].n)} dropped from +${before} to +${it.ref}.` : `💥 Failed. ${esc(C.BASES[it.base].n)} stays at +${it.ref}.${opts.guard ? ' Your guard scroll protected it.' : ''}`;
      if (live()) arena.refineFx(r.ok);
      toast(r.ok ? `✨ Refine succeeded: +${it.ref}` : '💥 Refine failed');
      refineOpts = {blessed: false, guard: false};
      break;
    }
    case 'buymat': {
      const R = S.rpg, it = C.SHOP[ds.k];
      if (R.pp < it.cost) { toast('Not enough PP yet.'); return; }
      R.pp -= it.cost; R.mats[ds.k]++; toast(`Bought 1 ${it.n.toLowerCase()}`); break;
    }
    case 'equipi': {
      const R = S.rpg, it = itemBy(ds.uid); if (!it) return;
      R.eq[C.BASES[it.base].slot] = it.uid; refineSlot = null; toast(`Equipped ${C.itemName(it)}`); break;
    }
    case 'salvage': {
      const R = S.rpg, it = itemBy(ds.uid); if (!it) return;
      const gain = C.BASES[it.base].tier + (it.rarity === 'rare' ? 2 : it.rarity === 'magic' ? 1 : 0) + Math.floor(it.ref / 2);
      if (!confirm(`Salvage ${C.itemName(it)} for ${gain} empower stone${gain > 1 ? 's' : ''}?`)) return;
      R.inv = R.inv.filter(x => x.uid !== it.uid); R.mats.stone += gain; toast(`Salvaged for ${gain} empower stone${gain > 1 ? 's' : ''}`); break;
    }
    case 'buyw': {
      const R = S.rpg, it = WARD[ds.slot].find(x => x.id === ds.id); if (!it) return;
      if (it.req && !reqMet(it.req, aggC())) { toast(reqText(it.req)); return; }
      if (R.pp < it.cost) { toast('Not enough PP yet.'); return; }
      R.pp -= it.cost; R.ward.owned[ds.slot + '_' + it.id] = 1; R.ward.eq[ds.slot] = it.id; toast(`${it.n} unlocked`); break;
    }
    case 'wear': S.rpg.ward.eq[ds.slot] = ds.id; break;
    case 'wardslot': wardSlot = ds.slot; break;
    case 'preview': previewSt = +ds.st; previewUntil = Date.now() + 6000; toast(`Previewing your ${FORMS[previewSt]} form`); setTimeout(() => { if (live() && !fight) arena.setHero(heroCfg(aggC())); }, 6100); break;
    case 'ngplus': {
      if (!confirm('Start New Game+? All 50 stages return with much stronger enemies. You keep your stats and gear.')) return;
      const R = S.rpg; R.ng++; R.stage = 1; R.victory = false; R.wounded = false; toast(`New Game+ ${R.ng} started`); break;
    }
    case 'delx': day(k, true).extras.splice(+ds.i, 1); break;
    case 'weigh': {
      const kg = num('wKg');
      if (!(kg > 30 && kg < 400)) { toast('Enter your weight in kg, like 123.4'); return; }
      const tk = keyOf(today()); S.weights = S.weights.filter(w => w.d !== tk); S.weights.push({d: tk, kg: Math.round(kg * 10) / 10});
      toast('⚖️ Weigh-in logged, +25 XP, +25 PP'); break;
    }
    case 'delw': S.weights = S.weights.filter(w => w.d !== ds.d); break;
    case 'gro': S.grocery.checked[ds.id] = !S.grocery.checked[ds.id]; break;
    case 'groedit': groEdit = !groEdit; if (!groEdit) toast('Market list saved'); break;
    case 'delgro': if (!confirm(`Remove ${S.groc[+ds.i].n} from your list?`)) return; S.groc.splice(+ds.i, 1); break;
    case 'addgro': {
      const n = ($('#gName').value || '').trim(), c = num('gCost');
      if (!n || !(c >= 0)) { toast('Enter the item name and its price.'); return; }
      S.groc.push({id: 'g' + Date.now(), n: n.slice(0, 60), a: ($('#gAmt').value || '').trim().slice(0, 40), c: Math.round(c * 100) / 100}); break;
    }
    case 'resetgro':
      if (!confirm('Reset the market list to the original items and prices?')) return;
      S.groc = clone(DEF.groc); S.grocery.checked = {}; toast('Market list reset'); break;
    case 'spend': {
      const amt = num('spAmt');
      if (!(amt > 0)) { toast('Enter how much you spent.'); return; }
      S.spend.push({d: keyOf(today()), amt: Math.round(amt * 100) / 100}); toast('Spending added'); break;
    }
    case 'delsp': S.spend.splice(+ds.i, 1); break;
    case 'saveset': {
      const v = {kcal: num('sK'), protein: num('sP'), start: num('sS'), goal: num('sG'), budget: num('sB')};
      if (!(v.kcal >= 1200 && v.kcal <= 4000)) { toast('Set daily calories between 1,200 and 4,000.'); return; }
      if (!(v.protein >= 40 && v.protein <= 300)) { toast('Set protein between 40 and 300 g.'); return; }
      if (!(v.start > 30 && v.goal > 30)) { toast('Enter your starting and goal weight in kg.'); return; }
      if (!(v.budget >= 0)) { toast('Enter your monthly budget in pesos.'); return; }
      S.settings = v; toast('Settings saved'); break;
    }
    case 'export': {
      const blob = new Blob([JSON.stringify(S, null, 1)], {type: 'application/json'});
      const u = URL.createObjectURL(blob), el = document.createElement('a');
      el.href = u; el.download = `kusog-backup-${keyOf(today())}.json`; document.body.appendChild(el); el.click(); el.remove();
      setTimeout(() => URL.revokeObjectURL(u), 1000); return;
    }
    case 'import': $('#importFile').click(); return;
    case 'wipe':
      if (!confirm('Erase all your Kusog data on this phone? This can’t be undone.')) return;
      S = merge({}); off = 0; save(); render(); toast('All data erased'); return;
    default: return;
  }
  if (a === 'prev' || a === 'next') keepScroll = false;
  const y = window.scrollY;
  aggCache = null;
  save(); rewards(before); render();
  if (keepScroll) window.scrollTo(0, y);
}

document.addEventListener('click', e => {
  const t = e.target.closest('[data-tab]');
  if (t) { tab = t.dataset.tab; if (tab === 'today') off = 0; render(); window.scrollTo(0, 0); return; }
  const b = e.target.closest('[data-act]');
  if (b) act(b.dataset.act, b.dataset);
});
$('#importFile').addEventListener('change', async e => {
  const file = e.target.files[0]; e.target.value = '';
  if (!file) return;
  try {
    const d = JSON.parse(await file.text());
    if (!d || typeof d !== 'object' || !d.settings || !d.days) throw new Error('bad');
    S = merge(d); aggCache = null;
    save(); render(); toast('Backup restored');
  } catch (err) { toast('That file isn’t a Kusog backup. Pick the .json file you downloaded.'); }
});
function rerender() { const y = window.scrollY; render(); window.scrollTo(0, y); }
document.addEventListener('change', e => {
  const t = e.target;
  if (t.classList.contains('ed')) {
    const parts = t.dataset.path.split('.'), key = parts.pop();
    let o = S; for (const q of parts) { o = o[q]; if (o == null) return; }
    if (key === 't') { const v = t.value.trim(); if (!v) { t.value = o.t; toast('Name can’t be empty.'); return; } o.t = v.slice(0, 80); }
    else { const v = Math.round(parseFloat(t.value)); if (!(v >= 0 && v <= 5000)) { t.value = o[key]; toast('Enter a number from 0 to 5,000.'); return; } o[key] = v; }
    save(); rerender(); return;
  }
  if (t.classList.contains('ged')) {
    const g = S.groc[+t.dataset.i], f = t.dataset.f; if (!g) return;
    if (f === 'c') { const v = parseFloat(t.value); if (!(v >= 0 && v <= 100000)) { t.value = g.c; toast('Enter a price in pesos.'); return; } g.c = Math.round(v * 100) / 100; }
    else if (f === 'n') { const v = t.value.trim(); if (!v) { t.value = g.n; toast('Name can’t be empty.'); return; } g.n = v.slice(0, 60); }
    else g.a = t.value.trim().slice(0, 40);
    save(); rerender(); return;
  }
  if (t.dataset.fill) {
    const f = S.foods[+t.value]; if (!f) return;
    const [dw, sl] = t.dataset.fill.split('.');
    S.plan.rot[dw][sl] = {t: f.t, k: f.k, p: f.p}; save(); rerender(); toast('Plan updated'); return;
  }
  if (t.dataset.rt) {
    const R = S.routines[t.dataset.rt], set = new Set(R.ids);
    if (t.checked) set.add(t.dataset.ex); else set.delete(t.dataset.ex);
    R.ids = S.exercises.map(x => x.id).filter(id => set.has(id)); save(); rerender(); return;
  }
  if (t.id === 'painIn' && S.session) { S.session.pain = +t.value; save(); }
  if (t.dataset.ropt) { refineOpts[t.dataset.ropt] = t.checked; rerender(); }
});
document.addEventListener('input', e => {
  if (e.target.id === 'painIn') { const v = $('#painVal'); if (v) v.textContent = e.target.value; }
});
document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });

/* ---------- Start ---------- */
if (S.lastLevel === null) { S.lastLevel = levelOf(agg().xp); save(); }
rewards(S.lastLevel);
render();
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
