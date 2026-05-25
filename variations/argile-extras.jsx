// ──────────────────────────────────────────────────────────────────────
// ARGILE — extras : Empty, News, Stats annuel, Meds, Report, Settings, History
// ──────────────────────────────────────────────────────────────────────
const { useState: useStateAx, useRef: useRefAx, useMemo: useMemoAx } = React;

// ══════════════════════════════════════════════════════════════════════
// MIGRATIONS — versioning du schéma de données
// v1 : mood 1-10 (format legacy original)
// v1.5 : mood 0-100, _migrated:true (migration intermédiaire)
// v2 : humeur/pensees/energie qualitatifs + mood numérique pour rétrocompat
// ══════════════════════════════════════════════════════════════════════
const BT_SCHEMA_VERSION = 2;

function _migrateEntry(e, moodScale) {
  if (e.humeur) return e; // déjà migré
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

function migrateData(raw) {
  const sv = raw.schemaVersion ?? 0;
  if (sv >= BT_SCHEMA_VERSION) return raw;
  // v1 : version:1 explicite ou toutes les valeurs mood ≤ 10
  const isV1 = raw.version === 1 ||
    (raw.entries || []).every(e => (e.mood ?? 0) <= 10);
  const moodScale = isV1 ? 1 : 10; // ×10 pour normaliser vers 0-100
  return {
    ...raw,
    schemaVersion: BT_SCHEMA_VERSION,
    entries: (raw.entries || []).map(e => _migrateEntry(e, moodScale)),
  };
}

// ══════════════════════════════════════════════════════════════════════
// ÉTAT VIDE — Premier jour
// ══════════════════════════════════════════════════════════════════════
function ArgileEmpty({ onStart }) {
  return (
    <div style={{
      width: '100%', height: '100%', background: `radial-gradient(ellipse at 50% 100%, ${ARGILE.cream} 0%, ${ARGILE.sand} 100%)`,
      position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @keyframes argile-bloom { 0% { transform: scale(0.85); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .argile-bloom-1 { animation: argile-bloom 0.7s cubic-bezier(0.2,1.4,0.4,1) 0.1s both; }
        .argile-bloom-2 { animation: argile-bloom 0.7s cubic-bezier(0.2,0.8,0.4,1) 0.5s both; }
        .argile-bloom-3 { animation: argile-bloom 0.6s ease-out 0.9s both; }
      `}</style>

      {/* large pottery seal at top */}
      <div className="argile-bloom-1" style={{
        position: 'absolute', top: 70, left: '50%', transform: 'translateX(-50%)',
        width: 120, height: 120,
      }}>
        <svg viewBox="0 0 120 120" width="120" height="120">
          <defs>
            <radialGradient id="seal-g" cx="0.35" cy="0.3">
              <stop offset="0" stopColor="#F5C593" />
              <stop offset="1" stopColor={ARGILE.clayDk} />
            </radialGradient>
          </defs>
          <circle cx="60" cy="60" r="56" fill="none" stroke={ARGILE.clay} strokeWidth="1.5" strokeDasharray="3 4" opacity="0.5" />
          <circle cx="60" cy="60" r="42" fill="url(#seal-g)" />
          {/* fingerprint-style swirl */}
          <g fill="none" stroke="rgba(255,240,220,0.55)" strokeWidth="1.2" strokeLinecap="round">
            <path d="M60 38 Q72 38 78 50 Q84 64 76 75 Q66 84 54 80 Q44 76 44 64 Q44 56 52 54 Q60 54 60 60" />
            <path d="M60 46 Q70 48 72 56" />
          </g>
        </svg>
      </div>

      {/* content */}
      <div style={{
        position: 'absolute', bottom: 130, left: 0, right: 0, padding: '0 32px', textAlign: 'center',
      }}>
        <div className="argile-bloom-2">
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.2em', color: ARGILE.clay, textTransform: 'uppercase', margin: '0 0 14px' }}>
            Premier jour
          </p>
          <h1 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 52, lineHeight: 0.95, margin: '0 0 16px', color: ARGILE.ink, fontWeight: 400 }}>
            On <span style={{ fontStyle: 'italic' }}>commence</span><br/>doucement.
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: ARGILE.ink2, margin: '0 auto 28px', maxWidth: 300 }}>
            BipolTrack note ton humeur, ton sommeil, tes traitements. Sans jugement, sans note.<br/>
            <span style={{ fontStyle: 'italic', fontFamily: 'Instrument Serif, serif', fontSize: 17, color: ARGILE.clay }}>Une journée à la fois.</span>
          </p>
        </div>

        <div className="argile-bloom-3">
          <button onClick={onStart} style={{
            width: '100%', padding: '18px 20px', border: 'none', borderRadius: 100,
            background: ARGILE.clay, color: ARGILE.paper, fontFamily: 'Instrument Serif, serif',
            fontStyle: 'italic', fontSize: 20, cursor: 'pointer', fontWeight: 400,
            boxShadow: '0 8px 22px rgba(184,88,57,0.30)',
          }}>
            Noter ma première journée
          </button>
          <p style={{ fontSize: 12, color: ARGILE.muted, marginTop: 16, lineHeight: 1.5 }}>
            Tes données restent sur ton appareil. Une sauvegarde Google Drive est possible plus tard.
          </p>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// NEWS — synthèse IA + RSS
// ══════════════════════════════════════════════════════════════════════
function ArgileNews() {
  const cache = LS.getJSON('bt_news_cache', null);
  const articles = (cache && cache.articles) || [];
  const cacheDate = cache && cache.date
    ? new Date(cache.date).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })
    : null;

  const formatPubDate = (d) => {
    if (!d) return '';
    const dt = new Date(d);
    if (isNaN(dt)) return '';
    return dt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  };

  return (
    <div style={{ padding: '20px 24px 0', overflowY: 'auto', height: 'calc(100% - 20px)', paddingBottom: 80 }}>
      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.14em', color: ARGILE.clay, textTransform: 'uppercase', margin: 0 }}>L'actu, en bref</p>
      <h1 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 38, lineHeight: 1.0, margin: '8px 0 4px', color: ARGILE.ink, fontWeight: 400 }}>
        <span style={{ fontStyle: 'italic' }}>Aujourd'hui</span>, en somme.
      </h1>
      <p style={{ fontSize: 13, color: ARGILE.muted, margin: '0 0 24px' }}>
        {cacheDate
          ? `${cacheDate} · ${articles.length} article${articles.length > 1 ? 's' : ''}`
          : 'Aucun article chargé.'}
      </p>

      {articles.length === 0 ? (
        <div style={{
          padding: '32px 24px', textAlign: 'center', borderRadius: 16,
          border: `1.5px dashed ${ARGILE.border}`, background: ARGILE.paper, marginBottom: 24,
        }}>
          <div style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: 22, color: ARGILE.muted, marginBottom: 8 }}>
            Aucun article
          </div>
          <div style={{ fontSize: 13, color: ARGILE.muted, lineHeight: 1.5 }}>
            Les flux RSS sont configurés dans <code style={{ fontSize: 12 }}>base-rss.md</code>.<br />
            Rafraîchis la page pour charger les derniers articles.
          </div>
        </div>
      ) : (
        <>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.18em', color: ARGILE.muted, textTransform: 'uppercase', marginBottom: 12 }}>
            ─ articles ─
          </div>
          {articles.map((a, i) => (
            <a key={i} href={a.link} target="_blank" rel="noopener" style={{
              display: 'block', padding: '16px 0',
              borderBottom: i < articles.length - 1 ? `1px solid ${ARGILE.border}` : 'none',
              textDecoration: 'none', cursor: 'pointer',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.12em',
                  color: ARGILE.clay, textTransform: 'uppercase', padding: '2px 8px',
                  background: 'rgba(184,88,57,0.10)', borderRadius: 100,
                }}>{a.source}</span>
                {a.pubDate && (
                  <span style={{ fontSize: 11, color: ARGILE.muted, fontFamily: 'JetBrains Mono, monospace' }}>
                    {formatPubDate(a.pubDate)}
                  </span>
                )}
              </div>
              <h3 style={{
                fontFamily: 'Instrument Serif, serif', fontSize: 18, lineHeight: 1.25,
                margin: '6px 0 6px', color: ARGILE.ink, fontWeight: 400,
              }}>{a.title}</h3>
              {a.description && (
                <p style={{ fontSize: 13, color: ARGILE.ink2, lineHeight: 1.5, margin: 0 }}>{a.description}</p>
              )}
            </a>
          ))}
        </>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// SIMULATION DES PHASES — algorithme V1 adapté à l'échelle 0-100
// ══════════════════════════════════════════════════════════════════════
const PHASE_DAYS_ARGILE = 21;

function moodPhaseArgile(mood) {
  if (mood == null) return null;
  if (mood < 40)  return 'down';
  if (mood >= 60) return 'up';
  return null;
}

function computePhaseProjectionsArgile(entries) {
  if (!entries.length) return { map: {}, fromDate: null, phase: null };

  const sorted = [...entries]
    .filter(e => moodPhaseArgile(e.mood) !== null)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (!sorted.length) return { map: {}, fromDate: null, phase: null };

  const simMap    = {};
  const todayStr  = new Date().toISOString().slice(0, 10);

  // Comblement du passé : prolonge chaque phase jusqu'à la prochaine entrée connue
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

  // Dernier basculement de phase (ancre temporelle)
  let lastChangeDate = sorted[0].date;
  let currentPhase   = moodPhaseArgile(sorted[0].mood);
  for (let i = 1; i < sorted.length; i++) {
    const p = moodPhaseArgile(sorted[i].mood);
    if (p !== currentPhase) { lastChangeDate = sorted[i].date; currentPhase = p; }
  }

  // Projection future — 168 jours (8 cycles de 21 j)
  const todayDate       = new Date(todayStr + 'T00:00:00');
  const changeDate      = new Date(lastChangeDate + 'T00:00:00');
  const daysSinceChange = Math.round((todayDate - changeDate) / 86400000);

  for (let i = 1; i <= PHASE_DAYS_ARGILE * 8; i++) {
    const totalDays = daysSinceChange + i;
    const cycle     = Math.floor(totalDays / PHASE_DAYS_ARGILE) % 2;
    const phase     = cycle === 0 ? currentPhase : (currentPhase === 'down' ? 'up' : 'down');
    const d = new Date(todayDate);
    d.setDate(d.getDate() + i);
    simMap[d.toISOString().slice(0, 10)] = phase;
  }

  return { map: simMap, fromDate: lastChangeDate, phase: currentPhase };
}

function fmtDateFR(iso) {
  const d = new Date(iso + 'T00:00:00');
  const mois = ['janv','févr','mars','avr','mai','juin','juil','août','sept','oct','nov','déc'];
  return `${d.getDate()} ${mois[d.getMonth()]}`;
}

// ══════════════════════════════════════════════════════════════════════
// STATS DEEP — calendrier annuel + graphes (données réelles)
// ══════════════════════════════════════════════════════════════════════
function ArgileStatsDeep() {
  const [year,       setYear]       = useStateAx(new Date().getFullYear());
  const [refreshKey, setRefreshKey] = useStateAx(0);
  const [editDate,   setEditDate]   = useStateAx(null);

  // ── Données réelles depuis bt_entries ────────────────────────────
  const allEntries = useMemoAx(() =>
    LS.getJSON('bt_entries', [])
      .filter(e => e.date)
      .sort((a, b) => a.date < b.date ? -1 : 1),
  [refreshKey]);

  const yearEntries = useMemoAx(
    () => allEntries.filter(e => e.date.startsWith(String(year))),
    [allEntries, year]
  );

  const entryByDate = useMemoAx(() => {
    const m = {};
    yearEntries.forEach(e => { m[e.date] = e; });
    return m;
  }, [yearEntries]);

  // ── Helpers ───────────────────────────────────────────────────────
  const median = arr => {
    if (!arr.length) return null;
    const s = [...arr].sort((a, b) => a - b);
    const m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  };

  const zoneOf = v => {
    if (v == null) return null;
    if (v < 20) return { label: 'Sombre', color: '#6B5C84' };
    if (v < 40) return { label: 'Bas',     color: '#A47A6C' };
    if (v < 60) return { label: 'Stable',  color: '#C39265' };
    if (v < 80) return { label: 'Haut',    color: '#D67A3C' };
    return               { label: 'Brûlant',color: '#B85839' };
  };

  const dateStr = (y, mi, d) =>
    `${y}-${String(mi + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  // ── Calculs statistiques ──────────────────────────────────────────
  const moods  = yearEntries.map(e => e.mood).filter(v => v != null);
  const sleeps = yearEntries.map(e => e.sleep).filter(v => v != null);

  const moodMed  = median(moods);
  const sleepMed = median(sleeps);
  const moodZone = zoneOf(moodMed);

  // Série : jours consécutifs à partir de la dernière entrée
  const streak = useMemoAx(() => {
    if (!allEntries.length) return 0;
    const dates = new Set(allEntries.map(e => e.date));
    const sorted = [...dates].sort().reverse();
    let count = 1;
    let prev = new Date(sorted[0] + 'T12:00:00');
    for (let i = 1; i < sorted.length; i++) {
      const cur = new Date(sorted[i] + 'T12:00:00');
      if (Math.round((prev - cur) / 86400000) === 1) { count++; prev = cur; }
      else break;
    }
    return count;
  }, [allEntries]);

  // Distribution par zone
  const zoneDist = useMemoAx(() => [
    { label: 'Brûlant', color: '#B85839', count: yearEntries.filter(e => e.mood >= 80).length },
    { label: 'Haut',    color: '#D67A3C', count: yearEntries.filter(e => e.mood >= 60 && e.mood < 80).length },
    { label: 'Stable',  color: '#C39265', count: yearEntries.filter(e => e.mood >= 40 && e.mood < 60).length },
    { label: 'Bas',     color: '#A47A6C', count: yearEntries.filter(e => e.mood >= 20 && e.mood < 40).length },
    { label: 'Sombre',  color: '#6B5C84', count: yearEntries.filter(e => e.mood < 20).length },
  ], [yearEntries]);

  // 30 dernières entrées pour sparkline
  const last30 = useMemoAx(() => allEntries.slice(-30), [allEntries]);

  // Simulation des phases (V1 adaptée échelle 0-100)
  const { map: projMap, fromDate: projFromDate, phase: projPhase } = useMemoAx(
    () => computePhaseProjectionsArgile(allEntries),
    [allEntries]
  );

  // Distribution heures de sommeil
  const sleepDist = useMemoAx(() => {
    const buckets = {};
    for (let h = 3; h <= 12; h++) buckets[h] = 0;
    yearEntries.forEach(e => {
      if (e.sleep != null) { const h = Math.round(e.sleep); if (h >= 3 && h <= 12) buckets[h]++; }
    });
    return Object.entries(buckets).map(([h, c]) => ({ h: +h, c }));
  }, [yearEntries]);

  const months    = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Août','Sept','Oct','Nov','Déc'];
  const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const todayStr  = new Date().toISOString().slice(0, 10);
  const maxSleep  = Math.max(...sleepDist.map(b => b.c), 1);

  // ── État vide ─────────────────────────────────────────────────────
  if (allEntries.length === 0) {
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.14em', color: ARGILE.clay, textTransform: 'uppercase', margin: '0 0 14px' }}>Le carnet</p>
        <div style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: 32, color: ARGILE.muted, marginBottom: 12 }}>Rien encore.</div>
        <p style={{ fontSize: 14, color: ARGILE.muted, lineHeight: 1.6 }}>
          Note ta première journée<br/>pour voir ton carnet prendre forme.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 20px 120px' }}>
      {editDate && (
        <ArgileEditEntry
          date={editDate}
          entry={allEntries.find(e => e.date === editDate) || null}
          onSave={() => { setRefreshKey(k => k + 1); setEditDate(null); }}
          onClose={() => setEditDate(null)}
        />
      )}

      {/* ── Header + navigation année ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 4 }}>
        <div>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.14em', color: ARGILE.clay, textTransform: 'uppercase', margin: 0 }}>Le carnet</p>
          <h1 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 38, lineHeight: 1.0, margin: '8px 0 0', color: ARGILE.ink, fontWeight: 400 }}>
            <span style={{ fontStyle: 'italic' }}>L'année</span> {year}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setYear(y => y - 1)} style={{ width: 32, height: 32, borderRadius: '50%', border: `1px solid ${ARGILE.border}`, background: ARGILE.paper, color: ARGILE.ink2, cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>‹</button>
          <button onClick={() => setYear(y => y + 1)} style={{ width: 32, height: 32, borderRadius: '50%', border: `1px solid ${ARGILE.border}`, background: ARGILE.paper, color: ARGILE.ink2, cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>›</button>
        </div>
      </div>
      <p style={{ fontSize: 13, color: ARGILE.muted, margin: '4px 0 20px' }}>
        {yearEntries.length} jour{yearEntries.length > 1 ? 's' : ''} noté{yearEntries.length > 1 ? 's' : ''}
        {streak > 1 ? ` · ${streak} j d'affilée` : ''}
      </p>

      {/* ── 4 tuiles métriques réelles ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
        {[
          {
            l: 'Médiane',
            v: moodZone ? moodZone.label : '—',
            c: moodZone ? moodZone.color : ARGILE.muted,
            sub: moodMed != null ? `score ${Math.round(moodMed)}/100` : 'aucune donnée',
          },
          {
            l: 'Sommeil',
            v: sleepMed != null ? sleepMed.toFixed(1).replace('.', ',') + 'h' : '—',
            c: ARGILE.olive,
            sub: sleeps.length ? `médiane sur ${sleeps.length} nuit${sleeps.length > 1 ? 's' : ''}` : 'aucune donnée',
          },
          {
            l: 'Journées notées',
            v: yearEntries.length,
            c: '#7A6F2F',
            sub: `en ${year}`,
          },
          {
            l: 'Série',
            v: streak + ' j',
            c: ARGILE.clay,
            sub: streak > 1 ? 'consécutifs' : 'aucune série',
          },
        ].map((t, i) => (
          <div key={i} style={{ padding: '14px 16px', background: ARGILE.paper, borderRadius: 14, border: `1px solid ${ARGILE.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: t.c }} />
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.12em', color: ARGILE.muted, textTransform: 'uppercase' }}>{t.l}</span>
            </div>
            <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 26, color: ARGILE.ink, lineHeight: 1, fontStyle: 'italic' }}>{t.v}</div>
            <div style={{ fontSize: 11, color: ARGILE.muted, marginTop: 4 }}>{t.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Sparkline — dernières entrées ── */}
      <div style={{ background: ARGILE.paper, padding: '18px 18px 14px', borderRadius: 18, border: `1px solid ${ARGILE.border}`, marginBottom: 20 }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.14em', color: ARGILE.muted, textTransform: 'uppercase', marginBottom: 4 }}>
          {last30.length} dernière{last30.length > 1 ? 's' : ''} entrée{last30.length > 1 ? 's' : ''}
        </div>
        <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 22, color: ARGILE.ink, fontStyle: 'italic', marginBottom: 12 }}>
          {moodZone ? `Tendance : ${moodZone.label.toLowerCase()}.` : 'Ton évolution.'}
        </div>
        {last30.length >= 2 ? (
          <>
            <svg viewBox="0 0 320 100" style={{ width: '100%', height: 100 }}>
              <rect x="0" y="0"  width="320" height="20" fill="#B85839" opacity="0.06" />
              <rect x="0" y="20" width="320" height="20" fill="#D67A3C" opacity="0.06" />
              <rect x="0" y="40" width="320" height="20" fill="#C39265" opacity="0.09" />
              <rect x="0" y="60" width="320" height="20" fill="#A47A6C" opacity="0.06" />
              <rect x="0" y="80" width="320" height="20" fill="#6B5C84" opacity="0.06" />
              <path
                d={last30.map((e, i) => {
                  const x = (i / (last30.length - 1)) * 316 + 2;
                  const y = 95 - ((e.mood ?? 50) / 100) * 88;
                  return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ')}
                fill="none" stroke={ARGILE.clay} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"
              />
              {last30.map((e, i) => {
                const x = (i / (last30.length - 1)) * 316 + 2;
                const y = 95 - ((e.mood ?? 50) / 100) * 88;
                return <circle key={i} cx={x} cy={y} r={i === last30.length - 1 ? 4 : 2} fill={ARGILE.clay} opacity={0.45 + (i / last30.length) * 0.55} />;
              })}
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 9, fontFamily: 'JetBrains Mono, monospace', color: ARGILE.muted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              <span>Brûlant</span><span>Haut</span><span>Stable</span><span>Bas</span><span>Sombre</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: ARGILE.muted }}>
              <span>{last30[0].date}</span>
              <span>{last30[last30.length - 1].date}</span>
            </div>
          </>
        ) : (
          <p style={{ fontSize: 13, color: ARGILE.muted, fontStyle: 'italic', fontFamily: 'Instrument Serif, serif' }}>
            Pas encore assez d'entrées pour tracer une courbe.
          </p>
        )}
      </div>

      {/* ── Distribution par zone ── */}
      <div style={{ background: ARGILE.paper, padding: '18px 18px', borderRadius: 18, border: `1px solid ${ARGILE.border}`, marginBottom: 20 }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.14em', color: ARGILE.muted, textTransform: 'uppercase', marginBottom: 4 }}>
          Distribution par zone · {year}
        </div>
        <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 22, color: ARGILE.ink, fontStyle: 'italic', marginBottom: 14 }}>
          {yearEntries.length} journée{yearEntries.length > 1 ? 's' : ''} mesurée{yearEntries.length > 1 ? 's' : ''}.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {zoneDist.map(z => (
            <div key={z.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: 13, color: ARGILE.ink, width: 54, flexShrink: 0 }}>{z.label}</span>
              <div style={{ flex: 1, height: 8, background: ARGILE.sand2, borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: yearEntries.length ? (z.count / yearEntries.length * 100) + '%' : '0%', height: '100%', background: z.color, borderRadius: 4 }} />
              </div>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: ARGILE.muted, width: 28, textAlign: 'right', flexShrink: 0 }}>{z.count}j</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Calendrier annuel (données réelles + simulation) ── */}
      <div style={{ background: ARGILE.paper, padding: '20px 16px 16px', borderRadius: 18, border: `1px solid ${ARGILE.border}`, marginBottom: 20 }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.14em', color: ARGILE.muted, textTransform: 'uppercase', marginBottom: 4 }}>
          Calendrier annuel · {year}
        </div>
        <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 22, color: ARGILE.ink, fontStyle: 'italic', marginBottom: 16 }}>
          Le passé en couleur.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {months.map((mname, mi) => (
            <div key={mname} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.08em', color: ARGILE.muted, textTransform: 'uppercase', width: 24, flexShrink: 0 }}>{mname}</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(31, 1fr)', gap: 2, flex: 1 }}>
                {Array.from({ length: 31 }, (_, di) => {
                  if (di >= monthDays[mi]) return <div key={di} />;
                  const ds      = dateStr(year, mi, di + 1);
                  const entry   = entryByDate[ds];
                  const isFut   = ds > todayStr;
                  const isToday = ds === todayStr;
                  const proj    = projMap[ds];
                  const todayOutline = isToday ? { outline: `1.5px solid ${ARGILE.clay}`, outlineOffset: '-0.5px' } : {};

                  if (entry) {
                    const z = zoneOf(entry.mood);
                    return (
                      <div key={di}
                        onClick={() => setEditDate(ds)}
                        title={`${ds} · ${z ? z.label : '?'}`}
                        style={{
                          height: 10, borderRadius: 2, cursor: 'pointer',
                          background: z ? z.color : ARGILE.sand2,
                          boxShadow: 'inset 0 -1px 0 rgba(43,24,16,0.10)',
                          ...todayOutline,
                        }} />
                    );
                  }

                  if (proj) {
                    const isUp  = proj === 'up';
                    const alpha = isFut ? 0.50 : 0.75;
                    const hatch = isUp
                      ? `repeating-linear-gradient(45deg, rgba(214,122,60,${alpha}) 0 1.5px, ${ARGILE.sand2} 1.5px 3.5px)`
                      : `repeating-linear-gradient(45deg, rgba(107,92,132,${alpha}) 0 1.5px, ${ARGILE.sand2} 1.5px 3.5px)`;
                    const hatchBorder = isUp ? 'rgba(214,122,60,0.7)' : 'rgba(107,92,132,0.7)';
                    return (
                      <div key={di}
                        onClick={() => setEditDate(ds)}
                        title={`${ds} · ${isUp ? 'Phase Haute (simulée)' : 'Phase Basse (simulée)'}`}
                        style={{
                          height: 10, borderRadius: 2, cursor: 'pointer',
                          background: hatch,
                          outline: isToday ? `1.5px solid ${ARGILE.clay}` : `0.8px solid ${hatchBorder}`,
                          outlineOffset: '-0.5px',
                        }} />
                    );
                  }

                  return (
                    <div key={di}
                      onClick={() => !isFut ? setEditDate(ds) : null}
                      style={{
                        height: 10, borderRadius: 2,
                        background: ARGILE.sand2,
                        opacity: isFut ? 0.18 : 0.42,
                        cursor: isFut ? 'default' : 'pointer',
                        ...todayOutline,
                      }} />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 10, color: ARGILE.ink2 }}>
          {[
            { l: 'Sombre', c: '#6B5C84' }, { l: 'Bas', c: '#A47A6C' },
            { l: 'Stable', c: '#C39265' }, { l: 'Haut', c: '#D67A3C' },
            { l: 'Brûlant', c: '#B85839' },
          ].map(z => (
            <span key={z.l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 12, height: 10, background: z.c, borderRadius: 2, display: 'inline-block' }} />
              <span style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: 12 }}>{z.l}</span>
            </span>
          ))}
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 12, height: 10, borderRadius: 2, display: 'inline-block',
              background: `repeating-linear-gradient(45deg, rgba(214,122,60,0.6) 0 1.5px, ${ARGILE.sand2} 1.5px 3.5px)`,
              outline: '0.8px solid rgba(214,122,60,0.7)', outlineOffset: '-0.5px' }} />
            <span style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: 12 }}>Phase Haute ↗</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 12, height: 10, borderRadius: 2, display: 'inline-block',
              background: `repeating-linear-gradient(45deg, rgba(107,92,132,0.6) 0 1.5px, ${ARGILE.sand2} 1.5px 3.5px)`,
              outline: '0.8px solid rgba(107,92,132,0.7)', outlineOffset: '-0.5px' }} />
            <span style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: 12 }}>Phase Basse ↘</span>
          </span>
        </div>
        {/* Bandeau info simulation */}
        <div style={{ marginTop: 12, padding: '8px 12px', background: ARGILE.sand2, borderRadius: 8 }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.10em', color: ARGILE.muted, textTransform: 'uppercase', lineHeight: 1.6 }}>
            {projFromDate
              ? `Simulation depuis le ${fmtDateFR(projFromDate)} · phase ${projPhase === 'up' ? 'haute' : 'basse'} · cycles de 21 jours`
              : 'Pas assez de données pour simuler les phases.'}
          </span>
        </div>
      </div>

      {/* ── Distribution sommeil ── */}
      {sleepDist.some(b => b.c > 0) && (
        <div style={{ background: ARGILE.paper, padding: '18px 18px', borderRadius: 18, border: `1px solid ${ARGILE.border}`, marginBottom: 28 }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.14em', color: ARGILE.muted, textTransform: 'uppercase', marginBottom: 4 }}>
            Sommeil · distribution
          </div>
          <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 22, color: ARGILE.ink, fontStyle: 'italic', marginBottom: 18 }}>
            {sleepMed != null ? `${sleepMed.toFixed(1).replace('.', ',')} heures, en médiane.` : 'Tes nuits.'}
          </div>
          <svg viewBox={`0 0 ${sleepDist.length * 28 + 10} 80`} style={{ width: '100%', height: 80 }}>
            {sleepDist.map((b, i) => {
              const x    = i * 28 + 6;
              const barH = Math.max(b.c > 0 ? 3 : 0, (b.c / maxSleep) * 54);
              const isMed = sleepMed != null && Math.round(sleepMed) === b.h;
              return (
                <g key={i}>
                  <rect x={x} y={66 - barH} width="18" height={barH} fill={isMed ? ARGILE.clay : ARGILE.sand2} rx="2" />
                  <text x={x + 9} y={78} textAnchor="middle" fontSize="9" fill={ARGILE.muted} fontFamily="JetBrains Mono">{b.h}h</text>
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// SOINS (Traitements) — gestion des médicaments
// ══════════════════════════════════════════════════════════════════════
const MED_COLORS = [ARGILE.clay, ARGILE.olive, '#7A6F2F', '#5C6A9E', '#8B5C5C'];

function ArgileMeds() {
  const [meds, setMeds] = useStateAx(() => LS.getJSON('bt_meds', []).filter(m => m.active !== false));
  const [showModal, setShowModal] = useStateAx(false);
  const [form, setForm] = useStateAx({ name: '', dose: '', qty: '', freq: '1x/jour', notes: '', start: new Date().toISOString().slice(0, 10) });

  const formatStart = (s) => {
    if (!s) return '';
    const d = new Date(s);
    if (isNaN(d)) return s;
    return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  const saveMed = () => {
    if (!form.name.trim()) return;
    const newMed = { id: Date.now().toString(), name: form.name.trim(), dose: form.dose.trim(), qty: form.qty.trim(), freq: form.freq, notes: form.notes.trim(), start: form.start, active: true };
    const all = [...LS.getJSON('bt_meds', []), newMed];
    LS.set('bt_meds', JSON.stringify(all));
    setMeds(all.filter(m => m.active !== false));
    setShowModal(false);
    setForm({ name: '', dose: '', qty: '', freq: '1x/jour', notes: '', start: new Date().toISOString().slice(0, 10) });
  };

  const inputStyle = { width: '100%', padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${ARGILE.border}`, background: ARGILE.paper, fontSize: 15, fontFamily: 'inherit', color: ARGILE.ink, boxSizing: 'border-box', outline: 'none' };
  const labelStyle = { display: 'block', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase', color: ARGILE.muted, marginBottom: 6 };

  return (
    <div style={{ padding: '20px 24px 0' }}>
      {showModal && (
        <div onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(43,24,16,0.45)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', background: ARGILE.sand, borderRadius: '20px 20px 0 0', padding: '24px 20px 36px', boxSizing: 'border-box' }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: ARGILE.border, margin: '0 auto 20px' }} />
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.14em', color: ARGILE.clay, textTransform: 'uppercase', margin: '0 0 4px' }}>Nouveau remède</p>
            <h2 style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: 26, color: ARGILE.ink, fontWeight: 400, margin: '0 0 20px' }}>Ajouter un traitement</h2>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Nom du médicament *</label>
              <input style={inputStyle} placeholder="ex : Lithium, Dépakine…" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Dosage</label>
                <input style={inputStyle} placeholder="500 mg" value={form.dose} onChange={e => setForm(f => ({ ...f, dose: e.target.value }))} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Quantité</label>
                <input style={inputStyle} placeholder="2 cp" value={form.qty} onChange={e => setForm(f => ({ ...f, qty: e.target.value }))} />
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Fréquence</label>
              <select style={inputStyle} value={form.freq} onChange={e => setForm(f => ({ ...f, freq: e.target.value }))}>
                {['1x/jour','2x/jour','3x/jour','au coucher','matin','matin+soir'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Date de début</label>
              <input type="date" style={inputStyle} value={form.start} onChange={e => setForm(f => ({ ...f, start: e.target.value }))} />
            </div>
            <div style={{ marginBottom: 22 }}>
              <label style={labelStyle}>Notes (optionnel)</label>
              <textarea style={{ ...inputStyle, height: 64, resize: 'none' }} placeholder="ex : à prendre avec de la nourriture…" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>

            <button onClick={saveMed} style={{ width: '100%', padding: '16px', border: 'none', borderRadius: 14, background: ARGILE.ink, color: ARGILE.paper, fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: 18, cursor: 'pointer', marginBottom: 10 }}>
              Enregistrer
            </button>
            <button onClick={() => setShowModal(false)} style={{ width: '100%', padding: '12px', border: `1.5px solid ${ARGILE.border}`, borderRadius: 14, background: 'transparent', color: ARGILE.ink2, fontSize: 15, cursor: 'pointer' }}>
              Annuler
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 4 }}>
        <div>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.14em', color: ARGILE.clay, textTransform: 'uppercase', margin: 0 }}>Les remèdes</p>
          <h1 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 38, lineHeight: 1.0, margin: '8px 0 0', color: ARGILE.ink, fontWeight: 400 }}>
            <span style={{ fontStyle: 'italic' }}>Soins</span> & doses
          </h1>
        </div>
      </div>
      <p style={{ fontSize: 13, color: ARGILE.muted, margin: '4px 0 20px' }}>
        {meds.length === 0 ? 'Aucun traitement enregistré.' : `${meds.length} traitement${meds.length > 1 ? 's' : ''} en cours.`}
      </p>

      <button onClick={() => setShowModal(true)} style={{
        marginBottom: 16, width: '100%', padding: '14px 18px', borderRadius: 14,
        border: `1.5px dashed ${ARGILE.muted}`, background: 'transparent',
        color: ARGILE.ink2, fontFamily: 'Instrument Serif, serif', fontStyle: 'italic',
        fontSize: 16, cursor: 'pointer',
      }}>
        + ajouter un traitement
      </button>

      {meds.length === 0 ? (
        <div style={{
          padding: '32px 24px', textAlign: 'center', borderRadius: 16,
          border: `1.5px dashed ${ARGILE.border}`, background: ARGILE.paper, marginBottom: 24,
        }}>
          <div style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: 22, color: ARGILE.muted, marginBottom: 8 }}>
            Aucun traitement
          </div>
          <div style={{ fontSize: 13, color: ARGILE.muted }}>
            Utilise le bouton ci-dessus pour ajouter tes médicaments.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {meds.map((m, i) => {
            const color = MED_COLORS[i % MED_COLORS.length];
            const startLabel = formatStart(m.start);
            const detail = [m.dose, m.freq].filter(Boolean).join(' · ');
            return (
              <div key={m.id || i} style={{
                background: ARGILE.paper, borderRadius: 16, padding: '18px 20px',
                border: `1px solid ${ARGILE.border}`, position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: color }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
                    <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 26, color: ARGILE.ink, fontWeight: 400, lineHeight: 1 }}>{m.name}</div>
                    {detail && (
                      <div style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: 15, color: ARGILE.ink2, marginTop: 4 }}>
                        {detail}
                      </div>
                    )}
                  </div>
                </div>
                {(startLabel || m.qty) && (
                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${ARGILE.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {startLabel && (
                      <div>
                        <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: ARGILE.muted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Depuis</div>
                        <div style={{ fontSize: 13, color: ARGILE.ink, marginTop: 2 }}>{startLabel}</div>
                      </div>
                    )}
                    {m.qty && (
                      <div>
                        <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: ARGILE.muted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Quantité</div>
                        <div style={{ fontSize: 13, color: ARGILE.ink, marginTop: 2 }}>{m.qty}</div>
                      </div>
                    )}
                  </div>
                )}
                {m.notes && (
                  <p style={{ fontSize: 12, color: ARGILE.ink2, margin: '10px 0 0', lineHeight: 1.45, fontStyle: 'italic', fontFamily: 'Instrument Serif, serif' }}>
                    « {m.notes} »
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <button style={{
        width: '100%', padding: '16px 20px', border: 'none', borderRadius: 100,
        background: ARGILE.ink, color: ARGILE.paper, fontFamily: 'Instrument Serif, serif',
        fontStyle: 'italic', fontSize: 18, cursor: 'pointer',
      }}>
        Préparer un rapport pour le médecin →
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// RAPPORT — mix imprimé + métriques cliniques
// ══════════════════════════════════════════════════════════════════════
function ArgileReport() {
  return (
    <div style={{ padding: '20px 18px 0' }}>
      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.14em', color: ARGILE.clay, textTransform: 'uppercase', margin: '0 6px' }}>À l'attention du médecin</p>
      <h1 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 36, lineHeight: 1.0, margin: '8px 6px 4px', color: ARGILE.ink, fontWeight: 400 }}>
        <span style={{ fontStyle: 'italic' }}>Rapport</span> de 30 jours
      </h1>
      <p style={{ fontSize: 13, color: ARGILE.muted, margin: '4px 6px 20px' }}>Du 24 avril au 24 mai 2026.</p>

      {/* Printed paper card */}
      <div style={{
        background: '#FBF8F1', borderRadius: 6, padding: '28px 24px',
        border: `1px solid ${ARGILE.border}`, marginBottom: 20,
        boxShadow: '0 10px 30px rgba(43,24,16,0.10), 0 2px 6px rgba(43,24,16,0.06)',
        backgroundImage: `repeating-linear-gradient(180deg, transparent 0px, transparent 27px, rgba(43,24,16,0.04) 27px, rgba(43,24,16,0.04) 28px)`,
      }}>
        {/* paper header */}
        <div style={{ textAlign: 'center', borderBottom: `1.5px solid ${ARGILE.ink}`, paddingBottom: 12, marginBottom: 14 }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.2em', color: ARGILE.muted, textTransform: 'uppercase' }}>
            Patient · Léa Moreau · née le 14.03.1994
          </div>
          <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 26, fontStyle: 'italic', color: ARGILE.ink, lineHeight: 1, marginTop: 6 }}>
            Suivi humeur — Mai 2026
          </div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.16em', color: ARGILE.muted, textTransform: 'uppercase', marginTop: 6 }}>
            Dr. Mercier · CH Bichat · 24.05.2026
          </div>
        </div>

        {/* Clinical metrics — newspaper-style grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 18px', marginBottom: 16 }}>
          {[
            { l: 'Jours notés', v: '30 / 30', detail: '100%' },
            { l: 'Humeur médiane', v: 'Stable', detail: 'éch. 5/10' },
            { l: 'Variabilité', v: '±1,8', detail: 'écart-type' },
            { l: 'Sommeil médian', v: '7,2 h', detail: 'σ 0,9 h' },
            { l: 'Adhérence', v: '93 %', detail: 'tous trt.' },
            { l: 'Anxiété moy.', v: '3,1/10', detail: 'pic à 7' },
          ].map((m, i) => (
            <div key={i} style={{ borderBottom: `1px solid ${ARGILE.border}`, paddingBottom: 6 }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: '0.16em', color: ARGILE.muted, textTransform: 'uppercase', marginBottom: 2 }}>{m.l}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontFamily: 'Instrument Serif, serif', fontSize: 22, color: ARGILE.ink, lineHeight: 1, fontStyle: 'italic' }}>{m.v}</span>
                <span style={{ fontSize: 10, color: ARGILE.muted }}>{m.detail}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Zone breakdown */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.16em', color: ARGILE.muted, textTransform: 'uppercase', marginBottom: 8 }}>
            Distribution par zone (30 j)
          </div>
          <div style={{ display: 'flex', height: 12, borderRadius: 2, overflow: 'hidden', border: `1px solid ${ARGILE.border}` }}>
            <div style={{ width: '10%', background: '#6B5C84' }} title="Sombre 3j" />
            <div style={{ width: '20%', background: '#A47A6C' }} title="Bas 6j" />
            <div style={{ width: '47%', background: '#C39265' }} title="Stable 14j" />
            <div style={{ width: '17%', background: '#D67A3C' }} title="Haut 5j" />
            <div style={{ width: '6%',  background: '#B85839' }} title="Brûlant 2j" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 9, color: ARGILE.muted, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            <span>Sombre 3j</span><span>Bas 6j</span><span>Stable 14j</span><span>Haut 5j</span><span>Brûlant 2j</span>
          </div>
        </div>

        {/* Treatment block */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.16em', color: ARGILE.muted, textTransform: 'uppercase', marginBottom: 6 }}>
            Traitements en cours
          </div>
          {(() => {
            const meds = LS.getJSON('bt_meds', []).filter(m => m.active !== false);
            if (meds.length === 0) return (
              <p style={{ fontSize: 13, color: ARGILE.muted, fontStyle: 'italic', fontFamily: 'Instrument Serif, serif', margin: 0 }}>
                Aucun traitement configuré.
              </p>
            );
            return meds.map((m, i) => {
              const detail = [m.dose, m.freq].filter(Boolean).join(' · ');
              return (
                <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: i < meds.length - 1 ? `1px dotted ${ARGILE.border}` : 'none', fontSize: 13 }}>
                  <span style={{ fontFamily: 'Instrument Serif, serif', fontWeight: 500, color: ARGILE.ink }}>{m.name}{detail && <span style={{ fontStyle: 'italic', color: ARGILE.muted, fontWeight: 400, marginLeft: 6, fontSize: 12 }}>— {detail}</span>}</span>
                </div>
              );
            });
          })()}
        </div>

        {/* Notes synthesis */}
        <div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.16em', color: ARGILE.muted, textTransform: 'uppercase', marginBottom: 6 }}>
            Observations cliniques pertinentes
          </div>
          <p style={{ fontFamily: 'Instrument Serif, serif', fontSize: 14, lineHeight: 1.55, color: ARGILE.ink, margin: 0, fontStyle: 'italic' }}>
            « Période globalement stable. Deux jours en zone "Brûlant" (12 & 13 mai) précédés d'une nuit courte (5 h). Pleurs et retrait notés autour du 18 mai, résolus en 48 h. Cycle menstruel régulier. »
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 6px 8px' }}>
        <button style={{
          padding: '16px 20px', border: 'none', borderRadius: 100,
          background: ARGILE.clay, color: ARGILE.paper, fontFamily: 'Instrument Serif, serif',
          fontStyle: 'italic', fontSize: 18, cursor: 'pointer', boxShadow: '0 6px 16px rgba(184,88,57,0.25)',
        }}>
          Envoyer en PDF →
        </button>
        <button style={{
          padding: '14px 20px', border: `1px solid ${ARGILE.border}`, borderRadius: 100,
          background: ARGILE.paper, color: ARGILE.ink, fontFamily: 'Instrument Serif, serif',
          fontStyle: 'italic', fontSize: 16, cursor: 'pointer',
        }}>
          Imprimer
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// EDIT ENTRY — bottom sheet d'édition d'une journée (par date)
// ══════════════════════════════════════════════════════════════════════
const ARGILE_SYMPTOMS = [
  { id: 'agit',    label: 'Agitation' },
  { id: 'fatigue', label: 'Fatigue' },
  { id: 'irrit',   label: 'Irritabilité' },
  { id: 'rapide',  label: 'Idées rapides' },
  { id: 'concentr',label: 'Concentration' },
  { id: 'isol',    label: 'Retrait social' },
  { id: 'impuls',  label: 'Impulsivité' },
  { id: 'pleurs',  label: 'Pleurs' },
];
const ARGILE_MENSTRUATION = [
  { id: 'regles',   label: '🩸 Règles' },
  { id: 'ovulation',label: '🌸 Ovulation' },
];

function ArgileEditEntry({ date, entry, onSave, onClose }) {
  const [mood,         setMood]         = useStateAx(entry?.mood         ?? 50);
  const [sleep,        setSleep]        = useStateAx(entry?.sleep        ?? 7);
  const [anxiety,      setAnxiety]      = useStateAx(entry?.anxiety      ?? 0);
  const [symptoms,     setSymptoms]     = useStateAx(entry?.symptoms     || []);
  const [checkedMeds,  setCheckedMeds]  = useStateAx(entry?.meds         || []);
  const [menstruation, setMenstruation] = useStateAx(entry?.menstruation || []);
  const [note,         setNote]         = useStateAx(entry?.note         || '');

  const allMeds = LS.getJSON('bt_meds', []).filter(m => m.active !== false);

  const tog = (setter) => (id) =>
    setter(arr => arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id]);

  const dateLabel = (() => {
    try {
      return new Date(date + 'T12:00:00').toLocaleDateString('fr-FR', {
        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
      });
    } catch { return date; }
  })();

  const handleSave = () => {
    const all = LS.getJSON('bt_entries', []);
    const updated = {
      date, mood, sleep, anxiety, symptoms, meds: checkedMeds, note,
      effects: entry?.effects || [], menstruation, ts: entry?.ts || Date.now(),
    };
    const idx = all.findIndex(e => e.date === date);
    if (idx >= 0) all[idx] = updated; else all.unshift(updated);
    LS.setJSON('bt_entries', all);
    onSave(updated);
  };

  const handleDelete = () => {
    if (!entry) { onClose(); return; }
    LS.setJSON('bt_entries', LS.getJSON('bt_entries', []).filter(e => e.date !== date));
    onSave(null);
  };

  const zone = ARGILE_ZONES.find(z => mood >= z.range[0] && mood <= z.range[1]) || ARGILE_ZONES[2];
  const inputSt = { width: '100%', accentColor: ARGILE.clay };
  const chipSt  = (on) => ({
    padding: '6px 12px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
    border: `1.5px solid ${on ? ARGILE.clay : ARGILE.border}`,
    background: on ? 'rgba(184,88,57,0.10)' : 'transparent',
    color: on ? ARGILE.clay : ARGILE.ink2,
  });

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(43,24,16,0.5)',
      zIndex: 300, display: 'flex', alignItems: 'flex-end',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxHeight: '88vh', overflowY: 'auto',
        background: ARGILE.sand, borderRadius: '20px 20px 0 0',
        padding: '16px 20px 40px', boxSizing: 'border-box',
      }}>
        {/* handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: ARGILE.border, margin: '0 auto 16px' }} />

        {/* en-tête */}
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.14em', color: ARGILE.clay, textTransform: 'uppercase', margin: '0 0 4px' }}>Édition</p>
        <h2 style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: 22, fontWeight: 400, color: ARGILE.ink, margin: '0 0 20px' }}>{dateLabel}</h2>

        {/* Humeur */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.14em', color: ARGILE.muted, textTransform: 'uppercase', margin: '0 0 8px' }}>
            Humeur · <span style={{ color: zone.color }}>{zone.label}</span>
          </p>
          <ArgileMoodOrb value={mood} onChange={setMood} />
        </div>

        {/* Sommeil */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.14em', color: ARGILE.muted, textTransform: 'uppercase', margin: '0 0 6px' }}>
            Sommeil · {sleep}h
          </p>
          <input type="range" min="0" max="12" step="0.5" value={sleep}
            onChange={e => setSleep(+e.target.value)} style={inputSt} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: ARGILE.muted, fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>
            <span>0h</span><span>6h</span><span>12h</span>
          </div>
        </div>

        {/* Anxiété */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.14em', color: ARGILE.muted, textTransform: 'uppercase', margin: '0 0 6px' }}>
            Anxiété · {anxiety}/10
          </p>
          <input type="range" min="0" max="10" step="1" value={anxiety}
            onChange={e => setAnxiety(+e.target.value)} style={inputSt} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: ARGILE.muted, fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>
            <span>Aucune</span><span>Intense</span>
          </div>
        </div>

        {/* Symptômes */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.14em', color: ARGILE.muted, textTransform: 'uppercase', margin: '0 0 10px' }}>Symptômes</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {ARGILE_SYMPTOMS.map(s => (
              <button key={s.id} onClick={() => tog(setSymptoms)(s.id)} style={chipSt(symptoms.includes(s.id))}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Traitements */}
        {allMeds.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.14em', color: ARGILE.muted, textTransform: 'uppercase', margin: '0 0 10px' }}>Traitements pris</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {allMeds.map(m => {
                const on = checkedMeds.includes(m.id);
                return (
                  <button key={m.id} onClick={() => tog(setCheckedMeds)(m.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                    borderRadius: 12, border: `1.5px solid ${on ? ARGILE.clay : ARGILE.border}`,
                    background: on ? 'rgba(184,88,57,0.08)' : 'transparent', cursor: 'pointer', textAlign: 'left',
                  }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                      border: `2px solid ${on ? ARGILE.clay : ARGILE.muted}`,
                      background: on ? ARGILE.clay : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {on && <svg width="9" height="7" viewBox="0 0 9 7"><path d="M1 3.5L3.5 6L8 1" stroke="#FBF6EB" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <span style={{ fontSize: 14, color: ARGILE.ink }}>{m.name}{m.dose ? ` · ${m.dose}` : ''}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Menstruation */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.14em', color: ARGILE.muted, textTransform: 'uppercase', margin: '0 0 10px' }}>Cycle</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {ARGILE_MENSTRUATION.map(m => (
              <button key={m.id} onClick={() => tog(setMenstruation)(m.id)} style={chipSt(menstruation.includes(m.id))}>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.14em', color: ARGILE.muted, textTransform: 'uppercase', margin: '0 0 8px' }}>Note</p>
          <textarea value={note} onChange={e => setNote(e.target.value)}
            placeholder="Observations, ressenti…"
            style={{ width: '100%', height: 80, padding: '10px 12px', borderRadius: 10, fontSize: 14,
              border: `1.5px solid ${ARGILE.border}`, background: ARGILE.paper, color: ARGILE.ink,
              fontFamily: 'inherit', resize: 'none', boxSizing: 'border-box', outline: 'none' }} />
        </div>

        {/* Actions */}
        <button onClick={handleSave} style={{
          width: '100%', padding: 16, border: 'none', borderRadius: 14,
          background: ARGILE.ink, color: ARGILE.paper,
          fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: 18, cursor: 'pointer', marginBottom: 10,
        }}>Enregistrer</button>
        {entry && (
          <button onClick={handleDelete} style={{
            width: '100%', padding: 12, borderRadius: 14, fontSize: 13, cursor: 'pointer', marginBottom: 8,
            border: `1.5px solid rgba(184,88,57,0.3)`, background: 'transparent', color: ARGILE.clay,
          }}>Supprimer cette journée</button>
        )}
        <button onClick={onClose} style={{
          width: '100%', padding: 12, borderRadius: 14, fontSize: 14, cursor: 'pointer',
          border: `1.5px solid ${ARGILE.border}`, background: 'transparent', color: ARGILE.ink2,
        }}>Annuler</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// HISTORIQUE — liste chronologique des entrées réelles
// ══════════════════════════════════════════════════════════════════════
function ArgileHistory() {
  const [refreshKey, setRefreshKey] = useStateAx(0);
  const [editDate,   setEditDate]   = useStateAx(null);

  const entries = useMemoAx(() =>
    LS.getJSON('bt_entries', [])
      .filter(e => e.date)
      .sort((a, b) => b.date.localeCompare(a.date)),
  [refreshKey]);

  const entryByDate = useMemoAx(() => {
    const m = {};
    entries.forEach(e => { m[e.date] = e; });
    return m;
  }, [entries]);

  const zoneOf = v => ARGILE_ZONES.find(z => v >= z.range[0] && v <= z.range[1]) || ARGILE_ZONES[2];

  const fmtDate = ds => {
    try {
      return new Date(ds + 'T12:00:00').toLocaleDateString('fr-FR', {
        weekday: 'short', day: '2-digit', month: 'long',
      });
    } catch { return ds; }
  };

  const fmtSleep = h => {
    if (h == null) return '';
    const hh = Math.floor(h), mm = Math.round((h - hh) * 60);
    return mm > 0 ? `${hh}h${String(mm).padStart(2,'0')}` : `${hh}h`;
  };

  const SYMP_LABEL = { agit:'Agitation', fatigue:'Fatigue', irrit:'Irritabilité',
    rapide:'Idées rapides', concentr:'Concentration', isol:'Retrait',
    impuls:'Impulsivité', pleurs:'Pleurs' };

  return (
    <div style={{ padding: '20px 24px 0', overflowY: 'auto', height: 'calc(100% - 20px)', paddingBottom: 100 }}>
      {editDate && (
        <ArgileEditEntry
          date={editDate}
          entry={entryByDate[editDate] || null}
          onSave={() => { setRefreshKey(k => k + 1); setEditDate(null); }}
          onClose={() => setEditDate(null)}
        />
      )}

      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.14em', color: ARGILE.clay, textTransform: 'uppercase', margin: 0 }}>Toutes les journées</p>
      <h1 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 38, lineHeight: 1.0, margin: '8px 0 0', color: ARGILE.ink, fontWeight: 400 }}>
        <span style={{ fontStyle: 'italic' }}>Historique</span>
      </h1>
      <p style={{ fontSize: 13, color: ARGILE.muted, margin: '4px 0 20px' }}>
        {entries.length} entrée{entries.length !== 1 ? 's' : ''} · tape pour éditer.
      </p>

      {entries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: 26, color: ARGILE.muted }}>Rien encore.</div>
          <p style={{ fontSize: 13, color: ARGILE.muted, marginTop: 8 }}>Note ta première journée dans l'onglet Journal.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {entries.map(e => {
            const zone  = zoneOf(e.mood);
            const symbs = (e.symptoms || []).map(s => SYMP_LABEL[s] || s).filter(Boolean);
            return (
              <div key={e.date} onClick={() => setEditDate(e.date)} style={{
                background: ARGILE.paper, borderRadius: 14, padding: '14px 16px',
                border: `1px solid ${ARGILE.border}`, display: 'flex', gap: 14, cursor: 'pointer',
              }}>
                {/* orbe humeur */}
                <div style={{
                  width: 38, height: 38, borderRadius: '50%', flexShrink: 0, alignSelf: 'flex-start', marginTop: 2,
                  background: `radial-gradient(circle at 35% 30%, #f8e9d0 0%, ${zone.color} 55%, ${ARGILE.clayDk} 100%)`,
                  boxShadow: '0 2px 6px rgba(43,24,16,0.18)',
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.1em', color: ARGILE.muted, textTransform: 'uppercase' }}>
                      {fmtDate(e.date)}
                    </span>
                    <span style={{ fontFamily: 'Instrument Serif, serif', fontSize: 14, fontStyle: 'italic', color: zone.color }}>
                      {zone.label}
                    </span>
                  </div>
                  {e.note ? (
                    <p style={{
                      fontFamily: 'Instrument Serif, serif', fontSize: 15, fontStyle: 'italic',
                      lineHeight: 1.4, color: ARGILE.ink, margin: '4px 0 6px',
                      overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    }}>« {e.note} »</p>
                  ) : (
                    <p style={{ fontSize: 13, color: ARGILE.border, fontStyle: 'italic', margin: '4px 0 6px' }}>—</p>
                  )}
                  <div style={{ display: 'flex', gap: 8, fontSize: 11, color: ARGILE.muted, alignItems: 'center', flexWrap: 'wrap' }}>
                    {e.sleep != null && <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{fmtSleep(e.sleep)}</span>}
                    {e.anxiety > 0 && <><span style={{ color: ARGILE.border }}>·</span><span>anxiété {e.anxiety}/10</span></>}
                    {symbs.length > 0 && <><span style={{ color: ARGILE.border }}>·</span><span>{symbs.join(' · ')}</span></>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// RÉGLAGES
// ══════════════════════════════════════════════════════════════════════
// LS est défini dans v1-argile.jsx (chargé avant ce fichier)

function ArgileSettings() {
  const [patientName,   setPatientName]   = useStateAx(LS.get('bt_patient_name'));
  const [patientDob,    setPatientDob]    = useStateAx(LS.get('bt_patient_dob'));
  const [patientDoctor, setPatientDoctor] = useStateAx(LS.get('bt_patient_doctor'));
  const [driveId,       setDriveId]       = useStateAx(LS.get('bt_drive_client_id'));
  const [syncAuto,      setSyncAuto]      = useStateAx(LS.get('bt_auto_backup') === 'true');
  const [exportFeedback,  setExportFeedback]  = useStateAx('');
  const [syncMessage,     setSyncMessage]    = useStateAx('');
  const [backupFeedback,  setBackupFeedback] = useStateAx('');
  const [syncFeedback,    setSyncFeedback]   = useStateAx('');

  const saveField = (key, val, setter) => { LS.set(key, val); setter(val); };

  const saveDriveId = (v) => {
    saveField('bt_drive_client_id', v, setDriveId);
    LS.set('bt_last_synced', String(Date.now()));
    window.dispatchEvent(new CustomEvent('bipoltrack:synced'));
    setSyncMessage('Synchronisation configurée ✓');
    setTimeout(() => setSyncMessage(''), 3000);
  };

  const toggleSync = () => {
    const next = !syncAuto;
    setSyncAuto(next);
    LS.set('bt_auto_backup', String(next));
  };

  const exportJSON = () => {
    const data = {
      schemaVersion: BT_SCHEMA_VERSION,
      app: 'BipolTrack',
      entries: LS.getJSON('bt_entries'),
      meds:    LS.getJSON('bt_meds'),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `bipoltrack-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    setExportFeedback('json');
    setTimeout(() => setExportFeedback(''), 2000);
  };

  const exportCSV = () => {
    const entries = LS.getJSON('bt_entries');
    const rows = [['date','humeur','energie','anxiete','sommeil','note']];
    entries.forEach(e => rows.push([
      e.date || '', e.mood ?? '', e.energy ?? '', e.anxiety ?? '', e.sleep ?? '',
      (e.note || '').replace(/[\r\n,]/g, ' '),
    ]));
    const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `bipoltrack-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    setExportFeedback('csv');
    setTimeout(() => setExportFeedback(''), 2000);
  };

  // ── Google Drive — OAuth token (flux implicite, popup + postMessage) ─
  // redirect_uri : même dossier que index.html + oauth.html
  // → fonctionne en local (localhost:8080) ET sur GitHub Pages (/bipoltrack/)
  const redirectUri = window.location.href.replace(/[^/]*(\?.*)?$/, 'oauth.html');

  const getGoogleToken = () => new Promise((resolve, reject) => {
    const cached = sessionStorage.getItem('bt_google_token');
    const expiry  = sessionStorage.getItem('bt_google_token_expiry');
    if (cached && expiry && Date.now() < +expiry) { resolve(cached); return; }
    if (!driveId) { reject(new Error('Client ID manquant')); return; }
    const scope    = 'https://www.googleapis.com/auth/drive.file';
    const authUrl  = 'https://accounts.google.com/o/oauth2/v2/auth'
      + '?client_id='     + encodeURIComponent(driveId)
      + '&redirect_uri='  + encodeURIComponent(redirectUri)
      + '&response_type=token'
      + '&scope='         + encodeURIComponent(scope);

    const popup = window.open(authUrl, 'bt-gauth', 'width=520,height=640,left=200,top=80');
    if (!popup) { reject(new Error('Popup bloqué — autorise les popups pour ce site')); return; }

    // Le token est transmis par oauth.html via postMessage
    const onMsg = (event) => {
      if (event.origin !== window.location.origin) return;
      const d = event.data;
      if (!d || !d.type || !d.type.startsWith('bt-oauth')) return;
      window.removeEventListener('message', onMsg);
      clearInterval(watchClose);
      if (d.type === 'bt-oauth-token') {
        const exp = +(d.expiresIn || 3600);
        sessionStorage.setItem('bt_google_token', d.token);
        sessionStorage.setItem('bt_google_token_expiry', String(Date.now() + (exp - 60) * 1000));
        resolve(d.token);
      } else {
        reject(new Error(d.error || 'auth échouée'));
      }
    };
    window.addEventListener('message', onMsg);

    // Fallback si la fenêtre est fermée sans postMessage
    const watchClose = setInterval(() => {
      if (popup.closed) {
        clearInterval(watchClose);
        window.removeEventListener('message', onMsg);
        reject(new Error('Fenêtre fermée sans authentification'));
      }
    }, 600);
  });

  // ── Sauvegarder vers Drive ─────────────────────────────────────────
  const saveNow = async () => {
    setBackupFeedback('en cours…');
    try {
      const token   = await getGoogleToken();
      const payload = JSON.stringify({
        app: 'BipolTrack', version: 2, exportedAt: new Date().toISOString(),
        entries:       LS.getJSON('bt_entries', []),
        meds:          LS.getJSON('bt_meds',    []),
        patientName:   LS.get('bt_patient_name'),
        patientDob:    LS.get('bt_patient_dob'),
        patientDoctor: LS.get('bt_patient_doctor'),
      }, null, 2);

      const filename = 'bipoltrack-backup.json';
      const search   = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${filename}'+and+trashed=false`,
        { headers: { Authorization: `Bearer ${token}` } }
      ).then(r => r.json());
      const fileId = search.files?.[0]?.id;

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify({ name: filename, mimeType: 'application/json' })], { type: 'application/json' }));
      form.append('file',     new Blob([payload], { type: 'application/json' }));

      const res = await fetch(
        fileId
          ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`
          : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`,
        { method: fileId ? 'PATCH' : 'POST', headers: { Authorization: `Bearer ${token}` }, body: form }
      );
      if (!res.ok) throw new Error(`Drive ${res.status}`);

      LS.set('bt_last_synced', String(Date.now()));
      window.dispatchEvent(new CustomEvent('bipoltrack:synced'));
      setBackupFeedback('sauvegardé ✓');
    } catch (e) {
      setBackupFeedback('erreur : ' + e.message);
    }
    setTimeout(() => setBackupFeedback(''), 4000);
  };

  // ── Synchroniser depuis Drive ──────────────────────────────────────
  const syncFromDrive = async () => {
    setSyncFeedback('chargement…');
    try {
      const token  = await getGoogleToken();
      const search = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='bipoltrack-backup.json'+and+trashed=false`,
        { headers: { Authorization: `Bearer ${token}` } }
      ).then(r => r.json());
      const fileId = search.files?.[0]?.id;
      if (!fileId) { setSyncFeedback('aucune sauvegarde trouvée'); setTimeout(() => setSyncFeedback(''), 4000); return; }

      const file = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        { headers: { Authorization: `Bearer ${token}` } }
      ).then(r => r.json());

      if (file.entries)       LS.setJSON('bt_entries', file.entries);
      if (file.meds)          LS.setJSON('bt_meds',    file.meds);
      if (file.patientName)   LS.set('bt_patient_name',   file.patientName);
      if (file.patientDob)    LS.set('bt_patient_dob',    file.patientDob);
      if (file.patientDoctor) LS.set('bt_patient_doctor', file.patientDoctor);

      LS.set('bt_last_synced', String(Date.now()));
      window.dispatchEvent(new CustomEvent('bipoltrack:synced'));
      setSyncFeedback('synchronisé ✓');
    } catch (e) {
      setSyncFeedback('erreur : ' + e.message);
    }
    setTimeout(() => setSyncFeedback(''), 4000);
  };

  const lastSynced = LS.get('bt_last_synced');
  const driveSyncLabel = lastSynced
    ? (() => {
        const d = new Date(+lastSynced);
        return 'synchro ' + d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
          + ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      })()
    : 'jamais synchronisé';
  const driveStatus = driveId ? `ID configuré · ${driveSyncLabel}` : 'Non configuré';

  return (
    <div style={{ padding: '20px 24px 0', overflowY: 'auto', height: 'calc(100% - 20px)', paddingBottom: 80 }}>
      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.14em', color: ARGILE.clay, textTransform: 'uppercase', margin: 0 }}>Maison & maintenance</p>
      <h1 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 38, lineHeight: 1.0, margin: '8px 0 24px', color: ARGILE.ink, fontWeight: 400 }}>
        <span style={{ fontStyle: 'italic' }}>Réglages</span>
      </h1>

      {/* Message temporaire après configuration Google Drive */}
      {syncMessage && (
        <div style={{
          marginBottom: 16, padding: '10px 16px', borderRadius: 12,
          background: ARGILE.olive + '22', border: `1px solid ${ARGILE.olive}44`,
          fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: ARGILE.olive,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 16 }}>✓</span> {syncMessage}
        </div>
      )}

      <ArgileSettingsGroup label="Sauvegardes">
        <ArgileEditRow icon="↥" title="Google Drive" value={driveStatus}
          placeholder="Client ID Google OAuth"
          onSave={saveDriveId} />
        {driveId && (
          <ArgileSettingsRow icon="☁" title="Sauvegarder maintenant"
            value={backupFeedback || 'Envoie les données vers Drive'}
            trailing={backupFeedback ? undefined : 'sauvegarder →'}
            onTrailing={backupFeedback ? undefined : saveNow} />
        )}
        <ArgileSettingsRow icon="↻" title="Synchronisation auto"
          value={syncFeedback || (syncAuto ? 'Active' : 'Inactive')}
          toggle toggleValue={syncAuto} onToggle={toggleSync}
          trailing={driveId && !syncFeedback ? 'syncer →' : undefined}
          onTrailing={driveId && !syncFeedback ? syncFromDrive : undefined} />
        <ArgileSettingsRow icon="⤓" title="Exporter en JSON" value="Sauvegarde complète"
          trailing={exportFeedback === 'json' ? 'exporté ✓' : 'exporter →'}
          onTrailing={exportJSON} />
        <ArgileSettingsRow icon="⤓" title="Exporter en CSV" value="Pour tableur"
          trailing={exportFeedback === 'csv' ? 'exporté ✓' : 'exporter →'}
          onTrailing={exportCSV} last />
      </ArgileSettingsGroup>

      <ArgileSettingsGroup label="Sources d'information">
        <ArgileSettingsRow icon="◍" title="Flux RSS" value="Configurés dans base-rss.md" last />
      </ArgileSettingsGroup>

      <ArgileSettingsGroup label="Cabinet médical">
        <ArgileEditRow icon="✎" title="Mon nom"
          value={patientName} placeholder="Prénom Nom"
          onSave={v => saveField('bt_patient_name', v, setPatientName)} />
        <ArgileEditRow icon="◐" title="Date de naissance"
          value={patientDob} placeholder="JJ/MM/AAAA"
          onSave={v => saveField('bt_patient_dob', v, setPatientDob)} />
        <ArgileEditRow icon="✚" title="Médecin référent"
          value={patientDoctor} placeholder="Dr. Nom · Établissement"
          onSave={v => saveField('bt_patient_doctor', v, setPatientDoctor)} last />
      </ArgileSettingsGroup>

      <ArgileSettingsGroup label="À propos">
        <ArgileSettingsRow icon="❀" title="Version" value="1.0.0" />
        <ArgileSettingsRow icon="?" title="Dépôt GitHub" trailing="ouvrir →"
          onTrailing={() => window.open('https://github.com/rousseauxantoine/bipoltrack', '_blank')} last />
      </ArgileSettingsGroup>

      <p style={{ fontSize: 12, color: ARGILE.muted, textAlign: 'center', marginTop: 8, lineHeight: 1.5, fontStyle: 'italic', fontFamily: 'Instrument Serif, serif' }}>
        « Tes données restent ici, sur ton appareil. »
      </p>
    </div>
  );
}

function ArgileSettingsGroup({ label, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.14em', color: ARGILE.muted, textTransform: 'uppercase', marginBottom: 8, paddingLeft: 4 }}>
        ─ {label} ─
      </div>
      <div style={{ background: ARGILE.paper, borderRadius: 14, border: `1px solid ${ARGILE.border}`, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}

// Ligne avec icône à gauche, affichage d'une valeur statique / toggle / bouton trailing
function ArgileSettingsRow({ icon, title, value, valueColor, trailing, toggle, toggleValue, onToggle, onTrailing, last }) {
  const vColor = valueColor || (value && value.startsWith('erreur') ? ARGILE.clay : value && value.endsWith('✓') ? ARGILE.olive : ARGILE.muted);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderBottom: last ? 'none' : `1px solid ${ARGILE.border}` }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, background: ARGILE.sand2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Instrument Serif, serif', fontSize: 16, color: ARGILE.ink, fontStyle: 'italic', flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, color: ARGILE.ink, fontWeight: 500 }}>{title}</div>
        {value && <div style={{ fontSize: 11, color: vColor, marginTop: 2 }}>{value}</div>}
      </div>
      {toggle && (
        <button onClick={onToggle} style={{ width: 40, height: 24, borderRadius: 12, background: toggleValue ? ARGILE.clay : ARGILE.sand2, border: 'none', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
          <div style={{ position: 'absolute', top: 2, left: toggleValue ? 18 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
        </button>
      )}
      {trailing && (
        onTrailing
          ? <button onClick={onTrailing} style={{ background: 'none', border: 'none', fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: 13, color: ARGILE.clay, cursor: 'pointer', padding: 0, whiteSpace: 'nowrap', flexShrink: 0 }}>{trailing}</button>
          : <span style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: 13, color: ARGILE.muted, whiteSpace: 'nowrap', flexShrink: 0 }}>{trailing}</span>
      )}
    </div>
  );
}

// Ligne avec champ éditable inline (modifier / enregistrer / annuler)
function ArgileEditRow({ icon, title, value, placeholder, onSave, last }) {
  const [editing, setEditing] = useStateAx(false);
  const [input,   setInput]   = useStateAx(value || '');

  // Sync si la valeur parente change (ex: chargement initial)
  const { useEffect: useEffectAx2 } = React;
  useEffectAx2(() => { if (!editing) setInput(value || ''); }, [value]);

  const handleSave = () => { onSave(input.trim()); setEditing(false); };
  const handleCancel = () => { setInput(value || ''); setEditing(false); };

  return (
    <div style={{ display: 'flex', alignItems: editing ? 'flex-start' : 'center', gap: 14, padding: '14px 16px', borderBottom: last ? 'none' : `1px solid ${ARGILE.border}` }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, background: ARGILE.sand2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Instrument Serif, serif', fontSize: 16, color: ARGILE.ink, fontStyle: 'italic', flexShrink: 0, marginTop: editing ? 2 : 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, color: ARGILE.ink, fontWeight: 500 }}>{title}</div>
        {editing ? (
          <div style={{ marginTop: 8 }}>
            <input
              autoFocus
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={placeholder}
              onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel(); }}
              style={{ width: '100%', border: `1.5px solid ${ARGILE.clay}`, borderRadius: 8, padding: '7px 10px', fontSize: 13, fontFamily: 'DM Sans, sans-serif', background: ARGILE.cream, color: ARGILE.ink, outline: 'none', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <button onClick={handleSave} style={{ flex: 1, padding: '6px 0', background: ARGILE.clay, color: ARGILE.paper, border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>Enregistrer</button>
              <button onClick={handleCancel} style={{ flex: 1, padding: '6px 0', background: ARGILE.sand2, color: ARGILE.ink2, border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Annuler</button>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 11, color: value ? ARGILE.muted : ARGILE.border, marginTop: 2, fontStyle: value ? 'normal' : 'italic' }}>
            {value || placeholder || '—'}
          </div>
        )}
      </div>
      {!editing && (
        <button onClick={() => setEditing(true)} style={{ background: 'none', border: 'none', fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: 13, color: ARGILE.clay, cursor: 'pointer', padding: 0, whiteSpace: 'nowrap', flexShrink: 0 }}>
          modifier →
        </button>
      )}
    </div>
  );
}

Object.assign(window, {
  ArgileEmpty, ArgileNews, ArgileStatsDeep, ArgileMeds, ArgileReport, ArgileHistory, ArgileSettings,
  ArgileEditEntry,
});
