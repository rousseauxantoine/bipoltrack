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

// ── Streak v2 — saisie complète + joker ──────────────────────────────

export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 90];

export const STREAK_MILESTONE_MESSAGES = {
  3:  "3 jours d'affilée, c'est un bon départ.",
  7:  "Une semaine complète. Tu construis quelque chose.",
  14: "2 semaines. Ta régularité commence à parler.",
  30: "Un mois. Tu te connais mieux qu'avant.",
  60: "60 jours. C'est une vraie discipline.",
  90: "3 mois. Tes données racontent maintenant une histoire.",
};

// Une saisie complète = humeur (ou mood legacy) ET meds présent (tableau)
export function isEntryComplete(entry) {
  return !!(
    entry &&
    (entry.humeur || entry.mood != null) &&
    Array.isArray(entry.meds)
  );
}

// Calcule le streak courant et le meilleur streak, en tenant compte du joker.
// jokerUsedDate : ISO date de la journée couverte par le joker (ou null)
export function computeStreakFull(entries, jokerUsedDate = null) {
  const completeSet = new Set(entries.filter(isEntryComplete).map(e => e.date));
  const isCovered = (d) => completeSet.has(d) || (jokerUsedDate != null && d === jokerUsedDate);

  let current = 0;
  let offset  = 0;
  while (isCovered(utcDayStr(offset))) { current++; offset++; }

  const allDates = new Set(completeSet);
  if (jokerUsedDate) allDates.add(jokerUsedDate);
  const sorted = [...allDates].sort();

  let best = current;
  let run  = 0;
  let prevMs = null;
  for (const d of sorted) {
    const ms = new Date(d + 'T00:00:00Z').getTime();
    run = prevMs === null ? 1 : ms - prevMs === MS_PER_DAY ? run + 1 : 1;
    if (run > best) best = run;
    prevMs = ms;
  }

  return { current, best };
}

// Retourne un tableau de 30 jours (du plus ancien au plus récent).
// status : 'complete' | 'joker' | 'missed' | 'future'
export function getCalendar30(entries, jokerUsedDate = null) {
  const completeSet = new Set(entries.filter(isEntryComplete).map(e => e.date));
  const today = utcDayStr(0);

  return Array.from({ length: 30 }, (_, i) => {
    const date = utcDayStr(29 - i);
    if (date > today)                                    return { date, status: 'future' };
    if (jokerUsedDate != null && date === jokerUsedDate) return { date, status: 'joker' };
    if (completeSet.has(date))                           return { date, status: 'complete' };
    return { date, status: 'missed' };
  });
}

// Message de rappel selon le streak actuel de l'utilisateur
export function getNotificationMessage(streak) {
  if (streak === 0)  return "Un nouveau départ commence aujourd'hui.";
  if (streak <= 6)   return `Jour ${streak} — continue sur ta lancée.`;
  if (streak <= 29)  return `Ta série est à ${streak} jours. Ne la laisse pas s'arrêter.`;
  return `${streak} jours consécutifs. Tu es en mode régulier.`;
}

// Détermine si l'utilisateur peut activer le joker maintenant.
// Conditions : joker disponible, hier non saisi, avant-hier couvert (pas 2 jours consécutifs manqués)
export function canActivateJoker(entries, jokerUsedDate, jokerRemaining) {
  if (!jokerRemaining) return false;
  const yesterday = utcDayStr(1);
  const dayBefore = utcDayStr(2);
  if (jokerUsedDate === yesterday) return false;
  const completeSet = new Set(entries.filter(isEntryComplete).map(e => e.date));
  if (completeSet.has(yesterday)) return false;
  return completeSet.has(dayBefore) || jokerUsedDate === dayBefore;
}

// Retourne le palier nouvellement atteint, ou null si aucun
export function checkNewMilestone(currentStreak, milestonesReached) {
  return STREAK_MILESTONES.find(
    m => m === currentStreak && !milestonesReached.includes(m)
  ) ?? null;
}

// ── Badges ────────────────────────────────────────────────────────────

export const BADGE_CATALOG = [
  { id: 'B-R01', name: 'Premier pas',                 family: 'regularite', criterion: 'streak', threshold: 3,   icon: '🌱',  message: "3 jours. C'est comme ça que ça commence." },
  { id: 'B-R02', name: 'Première semaine',            family: 'regularite', criterion: 'streak', threshold: 7,   icon: '🔥',  message: "Une semaine complète. Tu construis quelque chose." },
  { id: 'B-R03', name: 'Deux semaines',               family: 'regularite', criterion: 'streak', threshold: 14,  icon: '🔥🔥', message: "14 jours. Ta régularité commence à parler." },
  { id: 'B-R04', name: 'Un mois',                     family: 'regularite', criterion: 'streak', threshold: 30,  icon: '🏅',  message: "Un mois de données. Tu te connais mieux qu'avant." },
  { id: 'B-R05', name: 'Deux mois',                   family: 'regularite', criterion: 'streak', threshold: 60,  icon: '🏅🏅', message: "60 jours. C'est une vraie discipline." },
  { id: 'B-R06', name: 'Trois mois',                  family: 'regularite', criterion: 'streak', threshold: 90,  icon: '🏆',  message: "3 mois. Tes données racontent maintenant une histoire." },
  { id: 'B-A01', name: 'Première saisie',             family: 'assiduite',  criterion: 'volume', threshold: 1,   icon: '✨',  message: "C'est parti. La première saisie est toujours la plus importante." },
  { id: 'B-A02', name: 'Dix saisies',                 family: 'assiduite',  criterion: 'volume', threshold: 10,  icon: '📋',  message: "10 saisies enregistrées. Chacune compte." },
  { id: 'B-A03', name: 'Cinquante saisies',           family: 'assiduite',  criterion: 'volume', threshold: 50,  icon: '📊',  message: "50 saisies. Tu as construit une vraie base de connaissance sur toi." },
  { id: 'B-A04', name: 'Cent saisies',                family: 'assiduite',  criterion: 'volume', threshold: 100, icon: '💯',  message: "100 saisies. C'est remarquable." },
  { id: 'B-A05', name: 'Deux cent cinquante saisies', family: 'assiduite',  criterion: 'volume', threshold: 250, icon: '⭐',  message: "250 saisies. Une discipline rare." },
  { id: 'B-A06', name: 'Cinq cents saisies',          family: 'assiduite',  criterion: 'volume', threshold: 500, icon: '🌟',  message: "500 saisies. Tes données sont une ressource précieuse." },
];

export function countCompleteEntries(entries) {
  return new Set(entries.filter(isEntryComplete).map(e => e.date)).size;
}

// Returns array of newly unlocked badge IDs
export function checkNewBadges(entries, streakBest, alreadyUnlockedIds) {
  const total = countCompleteEntries(entries);
  return BADGE_CATALOG
    .filter(b => !alreadyUnlockedIds.includes(b.id))
    .filter(b => b.criterion === 'streak' ? streakBest >= b.threshold : total >= b.threshold)
    .map(b => b.id);
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

// ── Cycle × humeur helpers ────────────────────────────────────────────

export const CYCLE_PHASES = [
  { id: 'regles', label: 'Règles',       color: '#C0473F' },
  { id: 'follic', label: 'Folliculaire', color: '#4F8A6B' },
  { id: 'ovul',   label: 'Ovulation',    color: '#D4A23A' },
  { id: 'luteal', label: 'Lutéale',      color: '#6F77B3' },
];

export const MOOD_BAR_HEIGHTS = { 1: 26, 2: 46, 3: 68 };

// Maps an entry to mood level 1 (tristesse) / 2 (sérénité) / 3 (euphorie)
export function moodLevelFrom(entry) {
  const zone = humeurZoneOf(entry);
  if (!zone) return null;
  return ARGILE_HUMEUR_OPTS.indexOf(zone) + 1;
}

// Returns the 1-based day number within the menstrual cycle.
export function computeCycleDay(dateStr, lastPeriodStartStr, avgCycleLength = 28) {
  const dateMs  = new Date(dateStr            + 'T00:00:00Z').getTime();
  const startMs = new Date(lastPeriodStartStr + 'T00:00:00Z').getTime();
  const days    = Math.floor((dateMs - startMs) / MS_PER_DAY);
  return ((days % avgCycleLength) + avgCycleLength) % avgCycleLength + 1;
}

// Returns the phase id for the given cycle day.
// Ovulation is estimated at avgCycleLength − 14 (luteal phase ≈ constant 14 days).
export function phaseOf(cycleDay, avgCycleLength = 28, avgPeriodLength = 5) {
  const ovulationDay = avgCycleLength - 14;
  if (cycleDay <= avgPeriodLength) return 'regles';
  if (cycleDay < ovulationDay)    return 'follic';
  if (cycleDay === ovulationDay)  return 'ovul';
  return 'luteal';
}

// Returns confidence level ('high'|'low'|'none') based on cycle history reliability.
// cycleLengthStdDev > 4 days triggers 'low' even with many cycles logged.
export function cycleConfidence(cycleSettings) {
  if (!cycleSettings?.isCycleTrackingEnabled || !cycleSettings?.lastPeriodStart) return 'none';
  const logged = cycleSettings.cyclesLogged ?? 0;
  if (logged === 0) return 'none';
  if (logged <= 2)  return 'low';
  if ((cycleSettings.cycleLengthStdDev ?? 0) > 4) return 'low';
  return 'high';
}

// Builds a DayCell[] for every day in [startDate, endDate] (ISO strings, inclusive).
export function buildMoodCycleCells(entries, cycleSettings, startDate, endDate) {
  const entryMap   = Object.fromEntries(entries.map(e => [e.date, e]));
  const confidence = cycleConfidence(cycleSettings);
  const L  = cycleSettings?.avgCycleLength  ?? 28;
  const D  = cycleSettings?.avgPeriodLength ?? 5;
  const lp = cycleSettings?.lastPeriodStart ?? null;

  const cells   = [];
  const startMs = new Date(startDate + 'T00:00:00Z').getTime();
  const endMs   = new Date(endDate   + 'T00:00:00Z').getTime();

  for (let ms = startMs; ms <= endMs; ms += MS_PER_DAY) {
    const date      = new Date(ms).toISOString().slice(0, 10);
    const entry     = entryMap[date] ?? null;
    const moodLevel = entry ? moodLevelFrom(entry) : null;

    let cycleDay = null;
    let phase    = null;
    if (confidence !== 'none' && lp) {
      cycleDay = computeCycleDay(date, lp, L);
      phase    = phaseOf(cycleDay, L, D);
    }

    cells.push({ date, moodLevel, cycleDay, phase, isPredicted: true, confidence });
  }

  return cells;
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

export function newsIsValidFeedUrl(url) {
  return typeof url === 'string' && /^https?:\/\/\S+$/i.test(url.trim());
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
      .filter(l => l && !l.startsWith('#') && newsIsValidFeedUrl(l));
  } catch {
    return [];
  }
}
