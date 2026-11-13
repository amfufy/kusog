'use strict';
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
  game: {coins: 0, xpBanked: null, idx: 0, best: 0, farm: false, retryAt: 0, victory: false, finalWins: 0, prestige: 0, kills: 0, lastTick: 0, beaten: {},
    up: {blade: 0, shield: 0, thrusters: 0, magnet: 0},
    owned: {suit_cyan: 1, head_none: 1, aura_none: 1, back_none: 1, weapon_blade: 1},
    eq: {suit: 'cyan', head: 'none', aura: 'none', back: 'none', weapon: 'blade'}}};
function merge(d) {
  const g = d.game || {};
  return Object.assign(clone(DEF), d, {
    settings: Object.assign(clone(DEF.settings), d.settings || {}),
    game: Object.assign(clone(DEF.game), g, {
      up: Object.assign(clone(DEF.game.up), g.up || {}),
      owned: Object.assign(clone(DEF.game.owned), g.owned || {}),
      eq: Object.assign(clone(DEF.game.eq), g.eq || {})})
  });
}
const clone = o => JSON.parse(JSON.stringify(o));
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const d = JSON.parse(raw);
      return merge(d);
    }
  } catch (e) {}
  return clone(DEF);
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
  const G = S.game, first = G.xpBanked === null;
  if (first) G.xpBanked = 0;
  if (a.xp > G.xpBanked) { const c = (a.xp - G.xpBanked) * COINS_PER_XP; G.coins += c; G.xpBanked = a.xp; if (first && c > 0) msgs.unshift(`${COIN} +${fmt(c)} coins for your hero from the XP you’ve earned`); }
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
      <div class="hero-pills"><div class="streak">${a.streak ? `🔥 ${a.streak}-day streak` : 'Start a streak today'}</div><button class="coinpill" data-tab="hero">${COIN} ${short(S.game.coins)}</button></div>
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
  <div class="panel small">Each meal you log: +10. Protein within 10 g of target: +30. Calories within 150 of target: +30. Walk: +20. Strength session: +20. 8 glasses of water: +10. Perfect day (all 4 meals, both targets, walk and water): +25 bonus. Weekly weigh-in: +25. Each exercise where you beat your best set: +10. Every XP point also gives your hero 10 coins. Your streak counts days where you hit both calories and protein. Eating far below target doesn’t earn calorie XP, because under-eating slows recovery.</div>`;
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
  if (tab === 'hero') mountArena(); else if (arena) arena.unmount();
  document.querySelectorAll('.tabs button').forEach(b => { if (b.dataset.tab === tab) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
}

/* ---------- Hero game ---------- */
const COIN = '◈', COINS_PER_XP = 10;
const short = n => {
  n = Math.max(0, n);
  if (n < 1000) return String(Math.round(n));
  const u = ['K', 'M', 'B', 'T', 'Qa', 'Qi']; let i = -1;
  while (n >= 1000 && i < u.length - 1) { n /= 1000; i++; }
  return (n < 10 ? n.toFixed(2) : n < 100 ? n.toFixed(1) : Math.round(n)) + u[i];
};
const ZONES = [
  {n: 'Soda Swamp', c: 0x35f0c0, m: [['Fizz Drone', 'drone'], ['Syrup Slime', 'slime']], boss: ['Sugar Sovereign', 'slime']},
  {n: 'Fryer Factory', c: 0xffb547, m: [['Grease Bot', 'bot'], ['Oil Spitter', 'drone']], boss: ['Deep-Fry Colossus', 'golem']},
  {n: 'Midnight Mall', c: 0xb07cff, m: [['Snack Wraith', 'wraith'], ['Cart Phantom', 'bot']], boss: ['Milk Tea Empress', 'wraith']},
  {n: 'Couch Citadel', c: 0x5aa8ff, m: [['Remote Drone', 'drone'], ['Scroll Specter', 'wraith']], boss: ['Couch Titan', 'golem']},
  {n: 'Craving Core', c: 0xff3d6e, m: [['Craving Shade', 'wraith'], ['Excuse Golem', 'golem']], boss: ['Lord Cravings', 'overlord']}
];
const UPS = [
  {id: 'blade', n: 'Plasma core', d: '+22% attack per level', base: 20},
  {id: 'shield', n: 'Shield cells', d: '+22% max HP per level', base: 20},
  {id: 'thrusters', n: 'Thrusters', d: '+8% attack speed per level', base: 40},
  {id: 'magnet', n: 'Coin magnet', d: '+12% coins from battles per level', base: 50}
];
const upCost = (u, lv) => Math.round(u.base * 1.42 ** lv);
const COSM = {
  suit: [
    {id: 'cyan', n: 'Cyan core', body: 0x2c4470, glow: 0x2ee6f0, cost: 0},
    {id: 'magenta', n: 'Magenta pulse', body: 0x4a2860, glow: 0xff3da8, cost: 1000},
    {id: 'mango', n: 'Mango flux', body: 0x4e3a1c, glow: 0xffb547, cost: 2500},
    {id: 'gold', n: 'Solar gold', body: 0x8a6a1a, glow: 0xfff1a0, cost: 6000},
    {id: 'shadow', n: 'Shadow ops', body: 0x1c2030, glow: 0x8a7dff, cost: 12000},
    {id: 'summit', n: 'Summit armor', body: 0xdfe8f2, glow: 0x2ee6f0, cost: 0, req: 'goal'}
  ],
  head: [
    {id: 'none', n: 'No headgear', cost: 0}, {id: 'visor', n: 'Neon visor', cost: 1500},
    {id: 'helmet', n: 'Battle helmet', cost: 5000}, {id: 'halo', n: 'Champion halo', cost: 0, req: 'final'}
  ],
  aura: [{id: 'none', n: 'No aura', cost: 0}, {id: 'ring', n: 'Neon ring', cost: 2000}, {id: 'sparks', n: 'Spark field', cost: 8000}],
  back: [{id: 'none', n: 'Nothing', cost: 0}, {id: 'jetpack', n: 'Jetpack', cost: 4000}, {id: 'cape', n: 'Energy cape', cost: 7000}],
  weapon: [{id: 'blade', n: 'Energy blade', cost: 0}, {id: 'kettlebell', n: 'Plasma kettlebell', cost: 3000}, {id: 'hammer', n: 'Thunder hammer', cost: 15000}]
};
const SLOTNAMES = {suit: 'Suit', head: 'Head', aura: 'Aura', back: 'Back', weapon: 'Weapon'};
const FORMS = ['Recruit', 'Runner', 'Fighter', 'Vanguard', 'Titan', 'Legend'];
const reqMet = (r, a) => r === 'goal' ? a.lost >= Math.max(.1, S.settings.start - S.settings.goal) : S.game.finalWins > 0;
const reqText = r => r === 'goal' ? 'Reach your goal weight to unlock' : 'Beat Lord Cravings to unlock';
let armSlot = 'suit', previewSt = null, previewUntil = 0;
let aggCache = null, aggAt = 0;
const aggC = () => { if (!aggCache || Date.now() - aggAt > 1500) { aggCache = agg(); aggAt = Date.now(); } return aggCache; };

function heroStats(a) {
  const up = S.game.up, pm = 2 ** S.game.prestige, disc = 1 + Math.min(1.5, a.streak * .1);
  return {
    atk: (10 + 3 * a.workouts + 8 * a.prs + a.proteinDays) * 1.22 ** up.blade * disc * pm,
    hp: (120 + 5 * a.proteinDays + 10 * a.perfect + 8 * a.lost + 4 * a.weighIns) * 1.22 ** up.shield * pm,
    spd: Math.min(6, Math.min(3, 1 + a.walks * .03) * 1.08 ** up.thrusters), disc, gold: 1.12 ** up.magnet
  };
}
function enemyDef(i) {
  const z = Math.floor(i / 10), w = i % 10 + 1, Z = ZONES[z], boss = w === 10, final = i === 49, pr = S.game.prestige;
  const [name, type] = boss ? Z.boss : Z.m[w % 2];
  let hp = 30 * 1.2 ** i, atk = 3 * 1.15 ** i, reward = 1.22 ** i;
  if (boss) { hp *= 4; atk *= 1.5; reward *= 10; }
  if (final) { hp *= 4; atk *= 1.4; reward *= 5; }
  hp *= 3 ** pr; atk *= 3 ** pr; reward *= 2.5 ** pr;
  return {i, z: z + 1, w, name, type, color: Z.c, boss, final, hp, atk, reward};
}
const shieldOn = (d, a) => d.final && !(a.streak >= 7 || a.lost >= 10);
function canWin(d, hs, a) { return d.hp / (hs.atk * hs.spd * (shieldOn(d, a) ? .1 : 1)) < hs.hp / (d.atk * .8); }
function heroCfg(a) {
  const st = S.settings, span = Math.max(.1, st.start - st.goal), pv = previewSt !== null && Date.now() < previewUntil;
  const p = pv ? previewSt / 5 : Math.min(1, Math.max(0, a.lost / span));
  const suit = COSM.suit.find(x => x.id === S.game.eq.suit) || COSM.suit[0];
  const mu = Math.min(1, a.workouts * .02 + a.prs * .04 + (pv ? p * .6 : 0));
  return {fat: Math.round((1 - p) * 50) / 50, muscle: Math.round(mu * 20) / 20, stage: Math.min(5, Math.floor(p * 5 + 1e-9)),
    body: suit.body, glow: suit.glow, head: S.game.eq.head, aura: S.game.eq.aura, back: S.game.eq.back, weapon: S.game.eq.weapon};
}

let B = {phase: 'spawn', timer: .5, ehp: 0, emax: 1, hhp: 1, hmax: 1, ta: 0, te: 0, def: null, key: 0};
let arena = null, arenaP = null, saveT = 0, tickN = 0;
const live = () => tab === 'hero' && arena && arena.mounted && !document.hidden;
const sceneDef = () => B.def ? {key: B.def.i + '-' + B.key, type: B.def.type, color: B.def.color, boss: B.def.boss, final: B.def.final} : null;
function mountArena() {
  const el = $('#stage3d'); if (!el) return;
  if (!arenaP) arenaP = import('./scene.js').then(m => (arena = new m.Arena()));
  arenaP.then(ar => {
    if (tab !== 'hero') return; const el2 = $('#stage3d'); if (!el2) return;
    ar.mount(el2); ar.setHero(heroCfg(aggC()));
    if (B.def && B.phase === 'fight') { ar.setEnemy(sceneDef()); ar.setShield(shieldOn(B.def, aggC())); }
  }).catch(() => { arenaP = null; el.innerHTML = '<p class="muted small" style="padding:16px">The 3D view isn’t available on this device. Your battle still runs and earns coins.</p>'; });
}
function floater(txt, cls, who) {
  if (!live()) return; const p = arena.screenPos(who), box = $('#floaters'); if (!p || !box) return;
  const el = document.createElement('span'); el.className = 'fl ' + cls; el.textContent = txt;
  el.style.left = (p.x + Math.random() * 30 - 15) + 'px'; el.style.top = p.y + 'px';
  box.appendChild(el); setTimeout(() => el.remove(), 950);
}
function offline(ms) {
  const sec = Math.min(8 * 3600, ms / 1000); if (sec < 15) return;
  const a = aggC(), hs = heroStats(a); let j = S.game.idx, d = null;
  while (j >= 0 && !canWin(d = enemyDef(j), hs, a)) j--;
  if (j < 0) return;
  const tKill = d.hp / (hs.atk * hs.spd * (shieldOn(d, a) ? .1 : 1));
  const earned = Math.floor(d.reward * hs.gold / (tKill + .8) * sec * .25);
  if (earned > 0) { S.game.coins += earned; setTimeout(() => toast(`While you were away, your hero earned ${COIN} ${short(earned)}`), 600); }
}
function kill(d, hs) {
  const G = S.game, c = Math.max(1, Math.round(d.reward * hs.gold));
  G.coins += c; G.kills++;
  if (live()) { arena.enemyDie(); floater(`+${short(c)} ${COIN}`, 'coin', 'enemy'); }
  if (d.boss) G.beaten[d.i] = (G.beaten[d.i] || 0) + 1;
  if (d.final && !G.victory) {
    G.finalWins++; G.victory = true; G.farm = true; G.retryAt = 9e15; G.idx = 48;
    toast('🏆 Lord Cravings defeated! You saved the island.'); if (tab === 'hero') setTimeout(rerender, 400);
  } else if (G.farm) {
    if (Date.now() >= G.retryAt && !G.victory) { G.farm = false; G.idx = Math.min(49, G.idx + 1); }
  } else {
    if (d.boss && live()) toast(`👑 ${d.name} defeated!`);
    G.idx = Math.min(49, G.idx + 1);
  }
  G.best = Math.max(G.best, G.idx);
  B.phase = 'spawn'; B.timer = .8;
}
function lose() {
  const G = S.game;
  if (live()) toast(G.idx > 0 ? 'Defeated. Falling back a wave to farm coins and power up.' : 'Defeated. Upgrade or log your habits to get stronger.');
  if (G.idx > 0) G.idx--;
  G.farm = true; G.retryAt = Date.now() + 45000; B.phase = 'spawn'; B.timer = 1.4; B.hhp = B.hmax;
  if (live()) arena.setEnemy(null);
}
function statusText() {
  const G = S.game;
  if (G.victory) return 'You beat the final boss! Start New Game+ for a tougher, richer run.';
  if (G.farm) { const s = Math.max(0, Math.ceil((G.retryAt - Date.now()) / 1000)); return `Farming coins on this wave. Next push in ${s}s.`; }
  return S.game.idx === 49 ? 'Final battle in progress.' : 'Pushing forward. Your hero fights on its own, even when the app is closed.';
}
function hud(a, hs) {
  const set = (id, v) => { const e = document.getElementById(id); if (e && e.textContent !== v) e.textContent = v; };
  const w = (id, p) => { const e = document.getElementById(id); if (e) e.style.width = Math.max(0, Math.min(100, p)).toFixed(1) + '%'; };
  const G = S.game, di = enemyDef(G.idx);
  set('hCoins', `${COIN} ${short(G.coins)}`);
  set('hZone', `Zone ${di.z}: ${ZONES[di.z - 1].n}`);
  set('hWave', di.final ? 'Final boss' : di.boss ? 'Wave 10/10, boss' : `Wave ${di.w}/10`);
  if (B.def && B.phase === 'fight') { set('eName', B.def.name); set('eHpTxt', short(B.ehp)); w('eHp', B.ehp / B.emax * 100); }
  else { set('eName', 'Next enemy incoming'); set('eHpTxt', ''); w('eHp', 0); }
  set('hHpTxt', `${short(B.hhp)} / ${short(B.hmax)}`); w('hHp', B.hhp / B.hmax * 100);
  set('aStatus', statusText());
  document.querySelectorAll('[data-cost]').forEach(b => { b.disabled = G.coins < +b.dataset.cost; });
}
function gameTick() {
  const G = S.game, now = Date.now();
  if (G.lastTick && now - G.lastTick > 15000) offline(now - G.lastTick);
  G.lastTick = now;
  const dt = .1, a = aggC(), hs = heroStats(a);
  if (B.phase === 'spawn') {
    B.timer -= dt;
    if (B.timer <= 0) {
      const d = B.def = enemyDef(G.idx); B.key++;
      B.ehp = B.emax = d.hp; B.hmax = B.hhp = hs.hp; B.ta = 0; B.te = -.6; B.phase = 'fight';
      if (live()) { arena.setEnemy(sceneDef()); arena.setShield(shieldOn(d, a)); }
    }
  } else {
    const d = B.def, sh = shieldOn(d, a);
    if (hs.hp > B.hmax) B.hhp += hs.hp - B.hmax;
    B.hmax = hs.hp; B.hhp = Math.min(B.hhp, B.hmax);
    B.ta += dt; const per = 1 / hs.spd;
    while (B.ta >= per && B.phase === 'fight') {
      B.ta -= per; const crit = Math.random() < .1, dmg = hs.atk * (crit ? 2 : 1) * (sh ? .1 : 1);
      B.ehp -= dmg;
      if (live()) { arena.heroAttack(); arena.enemyHit(crit); floater((crit ? 'CRIT ' : '') + short(dmg), crit ? 'crit' : 'dmg', 'enemy'); }
      if (B.ehp <= 0) kill(d, hs);
    }
    if (B.phase === 'fight') {
      B.te += dt;
      if (B.te >= 1.25) {
        B.te -= 1.25; B.hhp -= d.atk;
        if (live()) { arena.enemyAttack(); setTimeout(() => { if (live()) arena.heroHit(); }, 150); floater('-' + short(d.atk), 'hurt', 'hero'); }
        if (B.hhp <= 0) lose();
      }
    }
  }
  if (tab === 'hero') {
    hud(a, hs);
    if (++tickN % 10 === 0 && live()) arena.setHero(heroCfg(a));
  }
  if (now - saveT > 5000) { saveT = now; save(); }
}

function vHero() {
  const G = S.game, a = aggC(), hs = heroStats(a), st = S.settings, span = Math.max(.1, st.start - st.goal);
  const p = Math.min(1, Math.max(0, a.lost / span)), form = Math.min(5, Math.floor(p * 5 + 1e-9));
  const nextKg = form < 5 ? span * (form + 1) / 5 : null;
  const d = enemyDef(G.idx);
  const shieldNote = d.final && shieldOn(d, a) ? '<div class="tip">Lord Cravings has a craving shield that blocks 90% of your damage. Break it in real life: reach a 7-day streak or lose 10 kg.</div>' : '';
  const ups = UPS.map(u => {
    const lv = G.up[u.id], c = upCost(u, lv);
    return `<li class="shop-row"><div><b>${u.n} <span class="lv">Lv ${lv}</span></b><small>${u.d}</small></div>
      <button class="btn small" data-act="buyup" data-id="${u.id}" data-cost="${c}" ${G.coins < c ? 'disabled' : ''}>${COIN} ${short(c)}</button></li>`;
  }).join('');
  const items = COSM[armSlot].map(it => {
    const own = !!G.owned[armSlot + '_' + it.id], eq = G.eq[armSlot] === it.id, locked = it.req && !reqMet(it.req, a);
    let btn;
    if (eq) btn = '<span class="eqd">Equipped</span>';
    else if (own) btn = `<button class="btn ghost small" data-act="equip" data-slot="${armSlot}" data-id="${it.id}">Equip</button>`;
    else if (locked) btn = `<span class="muted small lockt">🔒 ${reqText(it.req)}</span>`;
    else btn = `<button class="btn small" data-act="buyc" data-slot="${armSlot}" data-id="${it.id}" data-cost="${it.cost}" ${G.coins < it.cost ? 'disabled' : ''}>${it.cost ? `${COIN} ${short(it.cost)}` : 'Claim'}</button>`;
    const sw = it.glow !== undefined ? `<span class="swatch" style="--sw:#${it.glow.toString(16).padStart(6, '0')};--sb:#${it.body.toString(16).padStart(6, '0')}"></span>` : '';
    return `<li class="shop-row"><div class="row">${sw}<b>${it.n}</b></div>${btn}</li>`;
  }).join('');
  return `<section class="arena">
    <div id="stage3d" class="stage3d"></div>
    <div class="hud">
      <div class="hud-top"><div><div class="zone" id="hZone"></div><div class="wave" id="hWave"></div></div><div class="coins" id="hCoins"></div></div>
      <div class="ebox"><div class="spread"><b id="eName"></b><span id="eHpTxt" class="num"></span></div><div class="hpbar enemy"><i id="eHp"></i></div></div>
      <div class="hbox"><div class="spread"><b>You</b><span id="hHpTxt" class="num"></span></div><div class="hpbar mine"><i id="hHp"></i></div></div>
    </div>
    <div id="floaters"></div>
  </section>
  <div class="arena-ctl"><p id="aStatus" class="muted small">${statusText()}</p>
    ${G.victory ? '<button class="btn small" data-act="ngplus">Start New Game+</button>' : G.farm ? '<button class="btn ghost small" data-act="push">Push now</button>' : ''}</div>
  ${shieldNote}
  ${G.prestige ? `<p class="muted small">New Game+ ${G.prestige}: enemies ×${fmt(3 ** G.prestige)}, your power ×${fmt(2 ** G.prestige)}.</p>` : ''}
  <h2>Your hero</h2>
  <div class="panel stack">
    <div><div class="form-name">${FORMS[form]} form</div>
    <div class="muted small">${nextKg !== null ? `Form ${form + 1} of 6. Next form at ${fmt(nextKg, 1)} kg lost (${fmt(Math.max(0, nextKg - a.lost), 1)} kg to go).` : 'Final form unlocked. You reached your goal.'}</div></div>
    <div class="forms">${FORMS.map((f, i) => `<button class="formchip ${i <= form ? 'got' : ''}" data-act="preview" data-st="${i}">${i <= form ? '' : '🔒 '}${f}</button>`).join('')}</div>
    <p class="muted small" style="margin:0">Your hero slims down as you lose weight in real life and bulks up as you log workouts and personal bests. Tap a form to preview it. Drag the 3D view to turn it.</p>
  </div>
  <div class="stats4">
    <div class="stat"><small>Attack</small><b class="num">${short(hs.atk)}</b><small>Workouts, personal bests, protein days</small></div>
    <div class="stat"><small>Max HP</small><b class="num">${short(hs.hp)}</b><small>Protein, perfect days, kg lost, weigh-ins</small></div>
    <div class="stat"><small>Speed</small><b class="num">${hs.spd.toFixed(2)}/s</b><small>Walks and thrusters</small></div>
    <div class="stat"><small>Discipline</small><b class="num">×${hs.disc.toFixed(1)}</b><small>Your real streak boosts attack</small></div>
  </div>
  <h2>Upgrades</h2>
  <ul class="shop">${ups}</ul>
  <h2>Armory</h2>
  <div class="seg" role="tablist">${Object.keys(COSM).map(k => `<button role="tab" aria-selected="${k === armSlot}" data-act="armslot" data-slot="${k}">${SLOTNAMES[k]}</button>`).join('')}</div>
  <ul class="shop">${items}</ul>
  <p class="muted small">Coins come from battles and from real life: every XP you earn on Today, Train and Progress gives your hero ${COINS_PER_XP} coins. Coins are in-game only and can’t be bought with real money.</p>`;
}
setInterval(gameTick, 100);

/* ---------- Actions ---------- */
const num = id => parseFloat(($('#' + id) || {}).value);
function act(a, ds) {
  const before = levelOf(agg().xp);
  const k = keyOf(addDays(today(), -off));
  let keepScroll = true;
  switch (a) {
    case 'prev': off = Math.min(off + 1, 60); break;
    case 'next': off = Math.max(off - 1, 0); break;
    case 'eat': { const d = day(k, true), m = d.meals[ds.slot] || (d.meals[ds.slot] = {done: false, v: 0}); m.done = !m.done; if (m.done) toast('+10 XP'); break; }
    case 'swap': { const d = day(k, true), m = d.meals[ds.slot] || (d.meals[ds.slot] = {done: false, v: 0}); m.v = ((m.v || 0) + 1) % opts(ds.slot, fromKey(k)).length; break; }
    case 'walk': { const d = day(k, true); d.walk = !d.walk; if (d.walk) toast('👟 +20 XP'); break; }
    case 'strength': { const d = day(k, true); d.strength = !d.strength; if (d.strength) toast('🏋️ +20 XP'); break; }
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
    case 'buyup': {
      const u = UPS.find(x => x.id === ds.id), G = S.game, lv = G.up[u.id], c = upCost(u, lv);
      if (G.coins < c) { toast('Not enough coins yet.'); return; }
      G.coins -= c; G.up[u.id]++; toast(`${u.n} upgraded to level ${G.up[u.id]}`); break;
    }
    case 'buyc': {
      const G = S.game, it = COSM[ds.slot].find(x => x.id === ds.id); if (!it) return;
      if (it.req && !reqMet(it.req, aggC())) { toast(reqText(it.req)); return; }
      if (G.coins < it.cost) { toast('Not enough coins yet.'); return; }
      G.coins -= it.cost; G.owned[ds.slot + '_' + it.id] = 1; G.eq[ds.slot] = it.id; toast(`${it.n} unlocked and equipped`); break;
    }
    case 'equip': S.game.eq[ds.slot] = ds.id; break;
    case 'armslot': armSlot = ds.slot; break;
    case 'preview': previewSt = +ds.st; previewUntil = Date.now() + 6000; toast(`Previewing your ${FORMS[previewSt]} form`); break;
    case 'push': { const G = S.game; if (G.victory) return; G.farm = false; G.idx = Math.min(49, G.idx + 1); B.phase = 'spawn'; B.timer = .3; if (arena) arena.setEnemy(null); break; }
    case 'ngplus': {
      if (!confirm('Start New Game+? Enemies get 3× stronger, but you hit 2× harder and earn more coins. You keep your upgrades and armory.')) return;
      const G = S.game; G.prestige++; G.idx = 0; G.best = 0; G.victory = false; G.farm = false; B.phase = 'spawn'; B.timer = .3; if (arena) arena.setEnemy(null);
      toast(`New Game+ ${G.prestige} started`); break;
    }
    case 'delx': day(k, true).extras.splice(+ds.i, 1); break;
    case 'weigh': {
      const kg = num('wKg');
      if (!(kg > 30 && kg < 400)) { toast('Enter your weight in kg, like 123.4'); return; }
      const tk = keyOf(today()); S.weights = S.weights.filter(w => w.d !== tk); S.weights.push({d: tk, kg: Math.round(kg * 10) / 10});
      toast('⚖️ Weigh-in logged, +25 XP'); break;
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
      S = clone(DEF); off = 0; save(); render(); toast('All data erased'); return;
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
