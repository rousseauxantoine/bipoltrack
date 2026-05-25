// Pure business logic extracted from v1-argile.jsx and argile-extras.jsx.
// This module exists so the logic can be unit-tested without a browser.
// Any fix here must also be applied to the corresponding JSX file.

// ── Constants ─────────────────────────────────────────────────────────

export const MS_PER_DAY = 86400000;
export const BT_SCHEMA_VERSION = 2;
export const PHASE_DAYS_ARGILE = 21;

export const ARGILE_ZONES = [
  { id: 'sombre',  label: 'Sombre',   range: [0, 19],   color: '#6B5C84' },
  { id: 'bas',     label: 'Bas',      range: [20, 39],  color: '#A47A6C' },
  { id: 'stable',  label: 'Stable',   range: [40, 59],  color: '#C39265' },
  { id: 'haut',    label: 'Haut',     range: [60, 79],  color: '#D67A3C' },
  { id: 'brulant', label: 'Brûlant',  range: [80, 100], color: '#B85839' },
];

export const ARGILE_HUMEUR_OPTS = [
  { id: 'tristesse', label: 'Tristesse', moodVal: 25, color: '#9B7A7A' },
  { id: 'sérénité',  label: 'Sérénité',  moodVal: 50, color: '#AE9F8C' },
  { id: 'euphorie',  label: 'Euphorie',  moodVal: 82, color: '#B85839' },
];

export const ARGILE_PENSEES_OPTS = [
  { id: 'confusion', label: 'Confusion · Lenteur' },
  { id: 'clarté',    label: 'Esprit clair' },
  { id: 'profusion', label: 'Profusion · Obsession' },
];

export const ARGILE_ENERGIE_OPTS = [
  { id: 'épuisement', label: 'Épuisement' },
  { id: 'bien-être',  label: 'Bien-être' },
  { id: 'agitation',  label: 'Agitation' },
];

// ── Zone helpers ──────────────────────────────────────────────────────

export function argileZoneOf(v) {
  return ARGILE_ZONES.find(z => v >= z.range[0] && v <= z.range[1]) || ARGILE_ZONES[2];
}

export function normMoodTo100(entry) {
  const m = entry.mood;
  if (m == null) return null;
  return m <= 10 ? Math.round(m * 10) : m;
}

export function humeurZoneOf(entry) {
  if (!entry) return null;
  if (entry.humeur) {
    return ARGILE_HUMEUR_OPTS.find(z => z.id === entry.humeur) || ARGILE_HUMEUR_OPTS[1];
  }
  const m = normMoodTo100(entry);
  if (m == null) return null;
  if (m <= 35) return ARGILE_HUMEUR_OPTS[0]; // tristesse
  if (m <= 65) return ARGILE_HUMEUR_OPTS[1]; // sérénité
  return ARGILE_HUMEUR_OPTS[2];              // euphorie
}

// ── Date helpers ──────────────────────────────────────────────────────

export function utcDayStr(offsetDays = 0) {
  const todayUTC = new Date().toISOString().slice(0, 10);
  if (offsetDays === 0) return todayUTC;
  return new Date(new Date(todayUTC + 'T00:00:00Z').getTime() - offsetDays * MS_PER_DAY)
    .toISOString().slice(0, 10);
}

export function fmtDateFR(iso) {
  const d = new Date(iso + 'T00:00:00');
  const mois = ['janv', 'févr', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc'];
  return `${d.getDate()} ${mois[d.getMonth()]}`;
}

// ── Stats helpers ─────────────────────────────────────────────────────

export function computeStreak(entries) {
  const dateSet = new Set(entries.map(e => e.date));
  let streak = 0;
  let offset = 0;
  while (dateSet.has(utcDayStr(offset))) {
    streak++;
    offset++;
  }
  return streak;
}

export function computeStats30(entries) {
  const days30 = [];
  for (let i = 29; i >= 0; i--) {
    const key = utcDayStr(i);
    days30.push({ key, entry: entries.find(e => e.date === key) || null });
  }
  const sleeps = days30.filter(d => d.entry && d.entry.sleep != null).map(d => d.entry.sleep);
  const withHumeur = days30.filter(d => d.entry && humeurZoneOf(d.entry) != null);
  const humeurs = withHumeur.map(d => humeurZoneOf(d.entry));

  const ordinals = humeurs.map(h => ARGILE_HUMEUR_OPTS.indexOf(h));
  const sortedOrd = [...ordinals].sort((a, b) => a - b);
  const medianIdx = sortedOrd.length ? sortedOrd[Math.floor(sortedOrd.length / 2)] : null;
  const medianZone = medianIdx != null ? ARGILE_HUMEUR_OPTS[medianIdx] : null;

  const sleepAvg = sleeps.length
    ? (sleeps.reduce((a, b) => a + b, 0) / sleeps.length).toFixed(1).replace('.', ',')
    : null;

  const sparkline = days30.map(d => {
    if (!d.entry) return null;
    const zone = humeurZoneOf(d.entry);
    if (!zone) return null;
    const v = normMoodTo100(d.entry) ?? zone.moodVal;
    return { v, color: zone.color };
  });

  const total = withHumeur.length || 1;
  const zoneCounts = ARGILE_HUMEUR_OPTS.map(z => ({
    zone: z.label, color: z.color,
    days: humeurs.filter(h => h.id === z.id).length,
    total,
  }));

  return { sparkline, medianZone, sleepAvg, zoneCounts, recordedDays: withHumeur.length };
}

// ── Phase projection ──────────────────────────────────────────────────

export function moodPhaseArgile(mood) {
  if (mood == null) return null;
  if (mood < 40) return 'down';
  if (mood >= 60) return 'up';
  return null; // stable zone, not counted
}

// Estimates average phase duration from transitions observed in the last
// windowDays days. Falls back to PHASE_DAYS_ARGILE when data is insufficient.
export function computeAvgPhaseDurationArgile(entries, windowDays = 90) {
  const todayStr   = new Date().toISOString().slice(0, 10);
  const cutoffDate = new Date(todayStr + 'T00:00:00');
  cutoffDate.setDate(cutoffDate.getDate() - windowDays);
  const cutoffStr = cutoffDate.toISOString().slice(0, 10);

  const relevant = [...entries]
    .filter(e => e.date >= cutoffStr && moodPhaseArgile(e.mood) !== null)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (relevant.length < 2) return PHASE_DAYS_ARGILE;

  const durations = [];
  let segStart = relevant[0].date;
  let segPhase = moodPhaseArgile(relevant[0].mood);

  for (let i = 1; i < relevant.length; i++) {
    const p = moodPhaseArgile(relevant[i].mood);
    if (p !== segPhase) {
      const start = new Date(segStart + 'T00:00:00');
      const end   = new Date(relevant[i].date + 'T00:00:00');
      durations.push(Math.round((end - start) / MS_PER_DAY));
      segStart = relevant[i].date;
      segPhase = p;
    }
  }

  if (!durations.length) return PHASE_DAYS_ARGILE;

  const avg = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
  return Math.max(7, Math.min(90, avg));
}

// algo: '21j' (fixed 21-day cycle, default) | 'regression90' (data-driven)
export function computePhaseProjectionsArgile(entries, algo = '21j') {
  if (!entries.length) return { map: {}, fromDate: null, phase: null, cycleDays: PHASE_DAYS_ARGILE };

  const sorted = [...entries]
    .filter(e => moodPhaseArgile(e.mood) !== null)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (!sorted.length) return { map: {}, fromDate: null, phase: null, cycleDays: PHASE_DAYS_ARGILE };

  const simMap   = {};
  const todayStr = new Date().toISOString().slice(0, 10);

  // Fill historical gaps: each phase extends to the next recorded entry
  for (let i = 0; i < sorted.length; i++) {
    const phase       = moodPhaseArgile(sorted[i].mood);
    const start       = new Date(sorted[i].date + 'T00:00:00');
    const nextDateStr = i < sorted.length - 1 ? sorted[i + 1].date : todayStr;
    const end         = new Date(nextDateStr + 'T00:00:00');
    const d = new Date(start);
    while (d < end) {
      simMap[d.toISOString().slice(0, 10)] = phase;
      d.setDate(d.getDate() + 1);
    }
  }

  // Find the most recent phase transition (anchor for future projection)
  let lastChangeDate = sorted[0].date;
  let currentPhase   = moodPhaseArgile(sorted[0].mood);
  for (let i = 1; i < sorted.length; i++) {
    const p = moodPhaseArgile(sorted[i].mood);
    if (p !== currentPhase) { lastChangeDate = sorted[i].date; currentPhase = p; }
  }

  const cycleDays = algo === 'regression90'
    ? computeAvgPhaseDurationArgile(entries)
    : PHASE_DAYS_ARGILE;

  // Project 8 cycles into the future
  const todayDate       = new Date(todayStr + 'T00:00:00');
  const changeDate      = new Date(lastChangeDate + 'T00:00:00');
  const daysSinceChange = Math.round((todayDate - changeDate) / MS_PER_DAY);

  for (let i = 1; i <= cycleDays * 8; i++) {
    const totalDays = daysSinceChange + i;
    const cycle     = Math.floor(totalDays / cycleDays) % 2;
    const phase     = cycle === 0 ? currentPhase : (currentPhase === 'down' ? 'up' : 'down');
    const d = new Date(todayDate);
    d.setDate(d.getDate() + i);
    simMap[d.toISOString().slice(0, 10)] = phase;
  }

  return { map: simMap, fromDate: lastChangeDate, phase: currentPhase, cycleDays };
}

// ── Data migration ────────────────────────────────────────────────────

export function _migrateEntry(e, moodScale) {
  if (e.humeur) return e;
  const moodNorm = moodScale === 1 ? (e.mood ?? 5) * 10 : (e.mood ?? 50);
  const humeur   = moodNorm <= 35 ? 'tristesse' : moodNorm <= 65 ? 'sérénité' : 'euphorie';
  const anxiety  = e.anxiety ?? 0;
  const pensees  = anxiety <= 4 ? 'clarté' : anxiety <= 7 ? 'confusion' : 'profusion';
  const sleep    = e.sleep;
  const energie  =
    humeur === 'euphorie' && sleep != null && sleep <= 5 ? 'agitation' :
    sleep != null && sleep < 7                           ? 'épuisement' : 'bien-être';
  return { ...e, humeur, pensees, energie, _migrated_v2: true };
}

export function migrateData(raw) {
  const sv = raw.schemaVersion ?? 0;
  if (sv >= BT_SCHEMA_VERSION) return raw;
  const isV1 = raw.version === 1 ||
    (raw.entries || []).every(e => (e.mood ?? 0) <= 10);
  const moodScale = isV1 ? 1 : 10;
  return {
    ...raw,
    schemaVersion: BT_SCHEMA_VERSION,
    entries: (raw.entries || []).map(e => _migrateEntry(e, moodScale)),
  };
}

// ── RSS helpers ───────────────────────────────────────────────────────

export function newsStripHtml(html) {
  // Requires a DOM environment (jsdom or browser)
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || '').replace(/\s+/g, ' ').trim();
}

export async function newsLoadRssUrls(fetchFn = globalThis.fetch, filePath = 'base-rss.md') {
  try {
    const resp = await fetchFn(filePath, { cache: 'no-store' });
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const text = await resp.text();
    if (/<!doctype html|<html[\s>]/i.test(text)) return [];
    return text
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('#') && /^https?:\/\/\S+$/i.test(l));
  } catch {
    return [];
  }
}
