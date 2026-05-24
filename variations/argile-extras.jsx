// ──────────────────────────────────────────────────────────────────────
// ARGILE — extras : Empty, News, Stats annuel, Meds, Report, Settings, History
// ──────────────────────────────────────────────────────────────────────
const { useState: useStateAx, useRef: useRefAx, useMemo: useMemoAx } = React;

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
  const articles = [
    { src: 'Le Monde · Santé', date: 'Il y a 3h', title: 'Trouble bipolaire : une étude française relance le débat sur le lithium chez les jeunes adultes', desc: 'Une cohorte de 1 200 patients suivis sur 8 ans montre une réduction de 38% des hospitalisations…' },
    { src: 'Cerveau & Psycho',  date: 'Hier',     title: 'Sommeil et bipolarité : les chronotypes seraient plus prédictifs que l\'humeur', desc: 'Les chercheurs de l\'Inserm proposent un nouveau marqueur basé sur la régularité du coucher…' },
    { src: 'Slate',             date: 'Hier',     title: 'Pourquoi le suivi quotidien change la donne — témoignages', desc: 'Six patients racontent comment tenir un journal d\'humeur a transformé leurs consultations…' },
    { src: 'The Lancet Psych.', date: 'Avant-hier', title: 'Lamotrigine vs. lithium en monothérapie : nouveau méta-analyse', desc: '14 essais analysés, 4 800 patients. La supériorité du lithium se confirme sur la prévention…' },
  ];

  return (
    <div style={{ padding: '20px 24px 0' }}>
      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.14em', color: ARGILE.clay, textTransform: 'uppercase', margin: 0 }}>L'actu, en bref</p>
      <h1 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 38, lineHeight: 1.0, margin: '8px 0 4px', color: ARGILE.ink, fontWeight: 400 }}>
        <span style={{ fontStyle: 'italic' }}>Aujourd'hui</span>, en somme.
      </h1>
      <p style={{ fontSize: 13, color: ARGILE.muted, margin: '0 0 24px' }}>Sam. 24 mai · synthèse de 12 sources.</p>

      {/* AI synthesis card */}
      <div style={{
        background: ARGILE.paper, borderRadius: 18, padding: '22px 22px',
        border: `1px solid ${ARGILE.border}`, marginBottom: 24, position: 'relative',
        boxShadow: '0 4px 14px rgba(43,24,16,0.06)',
      }}>
        <div style={{
          position: 'absolute', top: -10, left: 22, padding: '3px 10px',
          background: ARGILE.clay, borderRadius: 100,
          fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.14em',
          color: '#fff', textTransform: 'uppercase',
        }}>Synthèse · IA</div>
        <p style={{
          fontFamily: 'Instrument Serif, serif', fontSize: 19, lineHeight: 1.45,
          color: ARGILE.ink, margin: '6px 0 0', fontStyle: 'italic',
        }}>
          « Cette semaine, deux études convergent sur la valeur du <strong style={{ color: ARGILE.clay, fontWeight: 500 }}>lithium</strong> comme stabilisateur de fond, particulièrement chez l'adulte jeune. Côté pratique, la <strong style={{ color: ARGILE.clay, fontWeight: 500 }}>régularité du sommeil</strong> émerge comme un meilleur prédicteur de rechute que l'humeur elle-même — une raison de plus de tenir ton carnet. »
        </p>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16,
          paddingTop: 14, borderTop: `1px solid ${ARGILE.border}`,
        }}>
          <span style={{ fontSize: 11, color: ARGILE.muted, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em' }}>
            12 articles · 4 mis en avant
          </span>
          <button style={{
            border: 'none', background: 'transparent', color: ARGILE.clay,
            fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: 14, cursor: 'pointer',
          }}>↻ Rafraîchir</button>
        </div>
      </div>

      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.18em', color: ARGILE.muted, textTransform: 'uppercase', marginBottom: 12 }}>
        ─ articles ─
      </div>

      {articles.map((a, i) => (
        <div key={i} style={{
          padding: '16px 0', borderBottom: i < articles.length - 1 ? `1px solid ${ARGILE.border}` : 'none',
          cursor: 'pointer',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.12em',
              color: ARGILE.clay, textTransform: 'uppercase', padding: '2px 8px',
              background: 'rgba(184,88,57,0.10)', borderRadius: 100,
            }}>{a.src}</span>
            <span style={{ fontSize: 11, color: ARGILE.muted, fontFamily: 'JetBrains Mono, monospace' }}>{a.date}</span>
          </div>
          <h3 style={{
            fontFamily: 'Instrument Serif, serif', fontSize: 18, lineHeight: 1.25,
            margin: '6px 0 6px', color: ARGILE.ink, fontWeight: 400,
          }}>{a.title}</h3>
          <p style={{ fontSize: 13, color: ARGILE.ink2, lineHeight: 1.5, margin: 0 }}>{a.desc}</p>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// STATS DEEP — calendrier annuel + graphes
// ══════════════════════════════════════════════════════════════════════
function ArgileStatsDeep() {
  const [year, setYear] = useStateAx(2026);

  // Generate pseudo-random data for the year
  const months = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Août','Sept','Oct','Nov','Déc'];
  const monthDays = [31,28,31,30,31,30,31,31,30,31,30,31];
  const zoneColor = (v) => {
    if (v < 20) return '#6B5C84';
    if (v < 40) return '#A47A6C';
    if (v < 60) return '#C39265';
    if (v < 80) return '#D67A3C';
    return '#B85839';
  };
  const seed = (m, d) => {
    const n = Math.sin((m * 31 + d * 7 + 13) * 0.7) * 30
            + Math.cos((m + d) * 0.3) * 20
            + 50 + (m === 4 && d > 10 ? 10 : 0);
    return Math.max(5, Math.min(95, Math.round(n)));
  };
  // current entries: only up to May 24
  const today = { m: 4, d: 24 };
  const filled = (m, d) => (m < today.m) || (m === today.m && d <= today.d);
  const isFuture = (m, d) => !filled(m, d);

  // ── PROJECTION DES PHASES À VENIR ─────────────────────────────────────
  // Simulation : à partir des 30 derniers jours, l'algo projette 2 fenêtres
  // de risque sur 8 semaines à venir.
  //   - "up"   = risque de phase haute / hypomanie / manie
  //   - "down" = risque de phase basse / dépressive
  // Intensité 0–1 = niveau de confiance.
  const projWindows = [
    { m: 5, dStart: 3,  dEnd: 12, kind: 'up',   peak: 7,  confidence: 0.72 }, // 3–12 juin : haute
    { m: 5, dStart: 24, dEnd: 30, kind: 'down', peak: 27, confidence: 0.48 }, // 24–30 juin : bas léger
    { m: 6, dStart: 1,  dEnd: 9,  kind: 'down', peak: 4,  confidence: 0.55 }, // début juillet : creux modéré
  ];
  const projAt = (m, d) => {
    if (!isFuture(m, d)) return null;
    for (const w of projWindows) {
      if (w.m === m && d >= w.dStart && d <= w.dEnd) {
        const dist = Math.abs(d - w.peak);
        const span = (w.dEnd - w.dStart) / 2;
        const intensity = Math.max(0.25, 1 - dist / (span + 1)) * w.confidence;
        return { kind: w.kind, intensity };
      }
    }
    return null;
  };

  // Patterns for hatched projected days
  const projBg = (kind, intensity) => {
    const op = 0.35 + intensity * 0.5;
    const color = kind === 'up' ? `rgba(214, 122, 60, ${op})` : `rgba(107, 92, 132, ${op})`;
    return `repeating-linear-gradient(45deg, ${color} 0 1.5px, ${ARGILE.sand2} 1.5px 3.5px)`;
  };
  const projBorder = (kind) => kind === 'up' ? 'rgba(214,122,60,0.7)' : 'rgba(107,92,132,0.7)';

  // 30-day mood line + 14 days projection
  const recent = Array.from({ length: 30 }, (_, i) => seed(4, i - 5 + 24));
  // simple projection curve: blend recent median (~55) toward projected window peak
  const futureProj = Array.from({ length: 14 }, (_, i) => {
    const d = today.d + 1 + i; // days into May then June
    let mm = today.m, dd = d;
    if (dd > 31) { mm = 5; dd = dd - 31; }
    const p = projAt(mm, dd);
    if (!p) return 55;
    return p.kind === 'up' ? 55 + p.intensity * 30 : 55 - p.intensity * 30;
  });

  return (
    <div style={{ padding: '20px 20px 0' }}>
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
      <p style={{ fontSize: 13, color: ARGILE.muted, margin: '4px 0 20px' }}>142 jours notés. 14 d'affilée.</p>

      {/* Key metrics — 4 tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
        {[
          { l: 'Médiane',     v: 'Stable', sub: '5 mois durs en 2025', c: ARGILE.clay },
          { l: 'Sommeil',     v: '7,2h',   sub: '↑ 0,4h vs an passé',  c: ARGILE.olive },
          { l: 'Adhérence',   v: '94%',    sub: 'Lithium régulier',     c: '#7A6F2F' },
          { l: 'Série',       v: '14 j',   sub: 'Record : 38',         c: ARGILE.clay },
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

      {/* 30-day editorial chart with 14-day projection */}
      <div style={{ background: ARGILE.paper, padding: '18px 18px 14px', borderRadius: 18, border: `1px solid ${ARGILE.border}`, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.14em', color: ARGILE.muted, textTransform: 'uppercase' }}>
            30 j passés <span style={{ color: ARGILE.border }}>·</span> 14 j projetés
          </div>
        </div>
        <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 22, color: ARGILE.ink, fontStyle: 'italic', marginBottom: 12 }}>
          Une courbe qui se pose.
        </div>
        <svg viewBox="0 0 320 110" style={{ width: '100%', height: 110 }}>
          {/* zone bands */}
          <rect x="0" y="0"  width="320" height="20" fill="#B85839" opacity="0.07" />
          <rect x="0" y="20" width="320" height="20" fill="#D67A3C" opacity="0.07" />
          <rect x="0" y="40" width="320" height="20" fill="#C39265" opacity="0.10" />
          <rect x="0" y="60" width="320" height="20" fill="#A47A6C" opacity="0.07" />
          <rect x="0" y="80" width="320" height="20" fill="#6B5C84" opacity="0.07" />

          {/* today divider */}
          {(() => {
            const totalDays = 30 + 14;
            const todayX = (29 / (totalDays - 1)) * 320;
            return (
              <>
                <line x1={todayX} y1="0" x2={todayX} y2="100" stroke={ARGILE.muted} strokeWidth="0.8" strokeDasharray="2 3" />
                <text x={todayX + 3} y="108" fontSize="8" fill={ARGILE.muted} fontFamily="JetBrains Mono">aujourd'hui</text>
              </>
            );
          })()}

          {/* past line (solid) */}
          <path
            d={recent.map((d, i) => `${i === 0 ? 'M' : 'L'} ${(i / 43) * 320} ${100 - (d / 100) * 95 - 2.5}`).join(' ')}
            fill="none" stroke={ARGILE.clay} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"
          />

          {/* projection — dashed, with confidence band */}
          {(() => {
            const allProj = [recent[29], ...futureProj];
            const pts = allProj.map((d, i) => `${((29 + i) / 43) * 320},${100 - (d / 100) * 95 - 2.5}`);
            // confidence band upper/lower
            const band = allProj.map((d, i) => {
              const margin = i === 0 ? 0 : Math.min(14, i * 1.2);
              return { x: ((29 + i) / 43) * 320, y: 100 - (d / 100) * 95 - 2.5, m: margin };
            });
            const upper = band.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y - p.m * 0.95}`).join(' ');
            const lower = band.slice().reverse().map((p) => `L ${p.x} ${p.y + p.m * 0.95}`).join(' ');
            return (
              <>
                <path d={`${upper} ${lower} Z`} fill={ARGILE.clay} opacity="0.10" />
                <path d={`M ${pts.join(' L ')}`} fill="none" stroke={ARGILE.clay} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />
              </>
            );
          })()}

          {/* points */}
          {recent.map((d, i) => (
            <circle key={'p'+i} cx={(i / 43) * 320} cy={100 - (d / 100) * 95 - 2.5} r={i === 29 ? 4 : 1.8} fill={ARGILE.clay} />
          ))}
        </svg>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 9, fontFamily: 'JetBrains Mono, monospace', color: ARGILE.muted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          <span>Brûlant</span><span>Haut</span><span>Stable</span><span>Bas</span><span>Sombre</span>
        </div>
      </div>

      {/* PROJECTION CARD — phases à venir */}
      <div style={{
        background: ARGILE.paper, padding: '20px 20px 18px', borderRadius: 18,
        border: `1px solid ${ARGILE.border}`, marginBottom: 16, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, ${ARGILE.clay} 0%, #D67A3C 30%, ${ARGILE.sand2} 50%, #6B5C84 100%)`,
        }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.14em', color: ARGILE.muted, textTransform: 'uppercase' }}>
            Projection · 8 semaines
          </div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.08em', color: ARGILE.muted }}>
            modèle v2.1
          </div>
        </div>
        <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 22, color: ARGILE.ink, fontStyle: 'italic', marginBottom: 14, lineHeight: 1.2 }}>
          Deux fenêtres à surveiller.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { kind: 'up',   label: 'Phase Haute', window: '3 → 12 juin', conf: 72, hint: 'sommeil plus court depuis 5 j · vigilance', color: '#D67A3C' },
            { kind: 'down', label: 'Phase Basse', window: '1 → 9 juillet', conf: 55, hint: 'cycle post-règles · anniversaire difficile', color: '#6B5C84' },
          ].map((w, i) => (
            <div key={i} style={{
              display: 'flex', gap: 14, padding: '12px 14px', alignItems: 'center',
              borderRadius: 12, background: ARGILE.sand,
              border: `1px solid ${w.kind === 'up' ? 'rgba(214,122,60,0.35)' : 'rgba(107,92,132,0.35)'}`,
            }}>
              {/* hatched preview */}
              <div style={{
                width: 38, height: 38, borderRadius: 8, flexShrink: 0,
                background: w.kind === 'up'
                  ? 'repeating-linear-gradient(45deg, rgba(214,122,60,0.7) 0 3px, rgba(214,122,60,0.15) 3px 6px)'
                  : 'repeating-linear-gradient(45deg, rgba(107,92,132,0.7) 0 3px, rgba(107,92,132,0.15) 3px 6px)',
                border: `1.5px solid ${w.color}`,
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontFamily: 'Instrument Serif, serif', fontSize: 19, color: ARGILE.ink, fontStyle: 'italic' }}>{w.label}</span>
                  <span style={{ fontSize: 11, color: ARGILE.muted, fontFamily: 'JetBrains Mono, monospace' }}>{w.window}</span>
                </div>
                <div style={{ fontSize: 12, color: ARGILE.ink2, marginTop: 2, lineHeight: 1.4 }}>
                  {w.hint}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 22, color: w.color, fontStyle: 'italic', lineHeight: 1 }}>{w.conf}<span style={{ fontSize: 12 }}>%</span></div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: '0.10em', color: ARGILE.muted, textTransform: 'uppercase', marginTop: 2 }}>confiance</div>
              </div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 11, color: ARGILE.muted, margin: '14px 0 0', lineHeight: 1.5, fontStyle: 'italic', fontFamily: 'Instrument Serif, serif' }}>
          « Projection basée sur les 60 derniers jours, le sommeil, le cycle et l'historique. Indicative — pas un diagnostic. »
        </p>
      </div>

      {/* Annual calendar grid */}
      <div style={{ background: ARGILE.paper, padding: '20px 16px 16px', borderRadius: 18, border: `1px solid ${ARGILE.border}`, marginBottom: 20 }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.14em', color: ARGILE.muted, textTransform: 'uppercase', marginBottom: 4 }}>
          Calendrier annuel · noté + projeté
        </div>
        <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 22, color: ARGILE.ink, fontStyle: 'italic', marginBottom: 16 }}>
          Le passé en couleur, l'avenir en hachures.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {months.map((mname, mi) => (
            <div key={mname} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.08em',
                color: ARGILE.muted, textTransform: 'uppercase', width: 24, flexShrink: 0,
              }}>{mname}</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(31, 1fr)', gap: 2, flex: 1 }}>
                {Array.from({ length: 31 }, (_, di) => {
                  if (di >= monthDays[mi]) return <div key={di} />;
                  const d = di + 1;
                  if (filled(mi, d)) {
                    const v = seed(mi, d);
                    return (
                      <div key={di} style={{
                        height: 10, borderRadius: 2, background: zoneColor(v),
                        boxShadow: 'inset 0 -1px 0 rgba(43,24,16,0.1)',
                      }} />
                    );
                  }
                  // future cell — projected?
                  const p = projAt(mi, d);
                  if (p) {
                    return (
                      <div key={di} title={`Projection ${p.kind === 'up' ? 'Haute' : 'Basse'} · ${Math.round(p.intensity*100)}%`} style={{
                        height: 10, borderRadius: 2,
                        background: projBg(p.kind, p.intensity),
                        outline: `0.8px solid ${projBorder(p.kind)}`,
                        outlineOffset: '-0.5px',
                      }} />
                    );
                  }
                  return <div key={di} style={{ height: 10, borderRadius: 2, background: ARGILE.sand2, opacity: 0.35 }} />;
                })}
              </div>
            </div>
          ))}
        </div>

        {/* legend */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.12em', color: ARGILE.muted, textTransform: 'uppercase', marginBottom: 8 }}>
            ─ noté ─
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 10, color: ARGILE.ink2, marginBottom: 12 }}>
            {[
              { l: 'Sombre', c: '#6B5C84' },
              { l: 'Bas', c: '#A47A6C' },
              { l: 'Stable', c: '#C39265' },
              { l: 'Haut', c: '#D67A3C' },
              { l: 'Brûlant', c: '#B85839' },
            ].map(z => (
              <span key={z.l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 12, height: 10, background: z.c, borderRadius: 2 }} />
                <span style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: 12 }}>{z.l}</span>
              </span>
            ))}
          </div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.12em', color: ARGILE.muted, textTransform: 'uppercase', marginBottom: 8 }}>
            ─ projeté ─
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 10, color: ARGILE.ink2 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{
                width: 12, height: 10, borderRadius: 2,
                background: 'repeating-linear-gradient(45deg, rgba(214,122,60,0.7) 0 1.5px, rgba(214,122,60,0.15) 1.5px 3.5px)',
                border: '1px solid rgba(214,122,60,0.7)',
              }} />
              <span style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: 12 }}>Phase Haute (à venir)</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{
                width: 12, height: 10, borderRadius: 2,
                background: 'repeating-linear-gradient(45deg, rgba(107,92,132,0.7) 0 1.5px, rgba(107,92,132,0.15) 1.5px 3.5px)',
                border: '1px solid rgba(107,92,132,0.7)',
              }} />
              <span style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: 12 }}>Phase Basse (à venir)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Sleep distribution */}
      <div style={{ background: ARGILE.paper, padding: '18px 18px', borderRadius: 18, border: `1px solid ${ARGILE.border}`, marginBottom: 28 }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.14em', color: ARGILE.muted, textTransform: 'uppercase', marginBottom: 4 }}>
          Sommeil · distribution
        </div>
        <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 22, color: ARGILE.ink, fontStyle: 'italic', marginBottom: 18 }}>
          7,2 heures, en médiane.
        </div>
        <svg viewBox="0 0 280 80" style={{ width: '100%', height: 80 }}>
          {[
            { h: 4, c: 8 },  { h: 5, c: 12 }, { h: 6, c: 22 },
            { h: 7, c: 40 }, { h: 8, c: 38 }, { h: 9, c: 18 },
            { h: 10, c: 6 }, { h: 11, c: 2 },
          ].map((b, i) => {
            const x = i * 35 + 6;
            const h = b.c * 1.6;
            return (
              <g key={i}>
                <rect x={x} y={80 - h - 14} width="24" height={h} fill={b.h === 7 ? ARGILE.clay : ARGILE.sand2} rx="2" />
                <text x={x + 12} y={78} textAnchor="middle" fontSize="9" fill={ARGILE.muted} fontFamily="JetBrains Mono">{b.h}h</text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// SOINS (Traitements) — gestion des médicaments
// ══════════════════════════════════════════════════════════════════════
function ArgileMeds() {
  const meds = [
    { name: 'Lithium',    dose: '800 mg', when: 'au coucher',    adh: 96, started: 'Mars 2023', notes: '0,6 mmol/L à la dernière prise de sang.', color: ARGILE.clay },
    { name: 'Dépakine',   dose: '500 mg', when: 'matin + soir',  adh: 92, started: 'Juin 2024',  notes: 'À prendre avec un repas.', color: ARGILE.olive },
    { name: 'Lamictal',   dose: '100 mg', when: 'le matin',      adh: 88, started: 'Jan. 2025',  notes: 'Augmentation prévue le 1er juin.', color: '#7A6F2F' },
  ];
  return (
    <div style={{ padding: '20px 24px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 4 }}>
        <div>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.14em', color: ARGILE.clay, textTransform: 'uppercase', margin: 0 }}>Les remèdes</p>
          <h1 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 38, lineHeight: 1.0, margin: '8px 0 0', color: ARGILE.ink, fontWeight: 400 }}>
            <span style={{ fontStyle: 'italic' }}>Soins</span> & doses
          </h1>
        </div>
      </div>
      <p style={{ fontSize: 13, color: ARGILE.muted, margin: '4px 0 20px' }}>3 traitements en cours.</p>

      <button style={{
        marginBottom: 16, width: '100%', padding: '14px 18px', borderRadius: 14,
        border: `1.5px dashed ${ARGILE.muted}`, background: 'transparent',
        color: ARGILE.ink2, fontFamily: 'Instrument Serif, serif', fontStyle: 'italic',
        fontSize: 16, cursor: 'pointer',
      }}>
        + ajouter un traitement
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        {meds.map((m, i) => (
          <div key={i} style={{
            background: ARGILE.paper, borderRadius: 16, padding: '18px 20px',
            border: `1px solid ${ARGILE.border}`, position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: m.color }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 26, color: ARGILE.ink, fontWeight: 400, lineHeight: 1 }}>{m.name}</div>
                <div style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: 15, color: ARGILE.ink2, marginTop: 4 }}>
                  {m.dose} · {m.when}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 28, color: m.color, lineHeight: 1, fontStyle: 'italic' }}>{m.adh}<span style={{ fontSize: 14 }}>%</span></div>
                <div style={{ fontSize: 9, color: ARGILE.muted, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', textTransform: 'uppercase' }}>adhérence</div>
              </div>
            </div>
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${ARGILE.border}`, display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: ARGILE.muted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Depuis</div>
                <div style={{ fontSize: 13, color: ARGILE.ink, marginTop: 2 }}>{m.started}</div>
              </div>
              <button style={{
                background: 'transparent', border: 'none', color: ARGILE.clay,
                fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: 14, cursor: 'pointer',
              }}>modifier →</button>
            </div>
            {m.notes && (
              <p style={{ fontSize: 12, color: ARGILE.ink2, margin: '10px 0 0', lineHeight: 1.45, fontStyle: 'italic', fontFamily: 'Instrument Serif, serif' }}>
                « {m.notes} »
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Side effects in last 30 days */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.14em', color: ARGILE.muted, textTransform: 'uppercase', marginBottom: 12 }}>
          ─ effets ressentis · 30 j ─
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {[
            { l: 'Bouche sèche', n: 12 },
            { l: 'Fatigue', n: 8 },
            { l: 'Tremblements', n: 4 },
          ].map((e, i) => (
            <span key={i} style={{
              padding: '6px 12px', borderRadius: 100, border: `1.5px solid ${ARGILE.border}`,
              background: ARGILE.paper, fontSize: 13, color: ARGILE.ink2, fontFamily: 'DM Sans',
            }}>{e.l} <span style={{ color: ARGILE.muted, marginLeft: 4 }}>× {e.n}</span></span>
          ))}
        </div>
      </div>

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
          {[
            ['Lithium', '800 mg · coucher', '96%'],
            ['Dépakine', '500 mg · M + S', '92%'],
            ['Lamictal', '100 mg · matin', '88%'],
          ].map(([n, d, a], i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: i < 2 ? `1px dotted ${ARGILE.border}` : 'none', fontSize: 13 }}>
              <span style={{ fontFamily: 'Instrument Serif, serif', fontWeight: 500, color: ARGILE.ink }}>{n}<span style={{ fontStyle: 'italic', color: ARGILE.muted, fontWeight: 400, marginLeft: 6, fontSize: 12 }}>— {d}</span></span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: ARGILE.clay }}>{a}</span>
            </div>
          ))}
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
// HISTORIQUE — liste des entrées
// ══════════════════════════════════════════════════════════════════════
function ArgileHistory() {
  const entries = [
    { d: 'Sam. 23 mai', zone: 'Stable', v: 58, sleep: '7h30', symp: ['Fatigue'], note: 'J\'ai marché 30min avec Léa. Ça m\'a sortie de ma tête.' },
    { d: 'Ven. 22 mai', zone: 'Stable', v: 54, sleep: '7h00', symp: [], note: 'Journée tranquille. RDV avec Dr. Mercier.' },
    { d: 'Jeu. 21 mai', zone: 'Haut',   v: 72, sleep: '5h30', symp: ['Idées rapides', 'Agitation'], note: 'Beaucoup d\'envie de faire. Ai commencé deux projets. Vigilance.' },
    { d: 'Mer. 20 mai', zone: 'Haut',   v: 68, sleep: '6h00', symp: ['Idées rapides'], note: 'Réveil 5h, énergie.' },
    { d: 'Mar. 19 mai', zone: 'Stable', v: 52, sleep: '7h30', symp: [], note: 'Léa est venue dîner. Du bien.' },
    { d: 'Lun. 18 mai', zone: 'Bas',    v: 28, sleep: '9h00', symp: ['Fatigue', 'Concentration', 'Pleurs'], note: 'Brouillard ce matin.' },
  ];

  return (
    <div style={{ padding: '20px 24px 0' }}>
      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.14em', color: ARGILE.clay, textTransform: 'uppercase', margin: 0 }}>Toutes les journées</p>
      <h1 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 38, lineHeight: 1.0, margin: '8px 0 0', color: ARGILE.ink, fontWeight: 400 }}>
        <span style={{ fontStyle: 'italic' }}>Historique</span>
      </h1>
      <p style={{ fontSize: 13, color: ARGILE.muted, margin: '4px 0 20px' }}>142 entrées · feuilleter.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {entries.map((e, i) => {
          const zone = e.v >= 80 ? ARGILE_ZONES[4] : e.v >= 60 ? ARGILE_ZONES[3] : e.v >= 40 ? ARGILE_ZONES[2] : e.v >= 20 ? ARGILE_ZONES[1] : ARGILE_ZONES[0];
          return (
            <div key={i} style={{
              background: ARGILE.paper, borderRadius: 14, padding: '14px 16px',
              border: `1px solid ${ARGILE.border}`, display: 'flex', gap: 14, cursor: 'pointer',
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                background: `radial-gradient(circle at 35% 30%, #f8e9d0 0%, ${zone.color} 55%, ${ARGILE.clayDk} 100%)`,
                boxShadow: '0 2px 6px rgba(43,24,16,0.18)', alignSelf: 'flex-start', marginTop: 2,
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.1em', color: ARGILE.muted, textTransform: 'uppercase' }}>{e.d}</span>
                  <span style={{ fontFamily: 'Instrument Serif, serif', fontSize: 14, fontStyle: 'italic', color: zone.color }}>{e.zone}</span>
                </div>
                <p style={{
                  fontFamily: 'Instrument Serif, serif', fontSize: 15, fontStyle: 'italic',
                  lineHeight: 1.4, color: ARGILE.ink, margin: '4px 0 6px',
                  overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                }}>
                  « {e.note} »
                </p>
                <div style={{ display: 'flex', gap: 8, fontSize: 11, color: ARGILE.muted, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.06em' }}>{e.sleep}</span>
                  {e.symp.length > 0 && <>
                    <span style={{ color: ARGILE.border }}>·</span>
                    <span>{e.symp.join(' · ')}</span>
                  </>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// RÉGLAGES
// ══════════════════════════════════════════════════════════════════════
// ── Helpers localStorage ──────────────────────────────────────────
const LS = {
  get: (k, def = '') => { try { const v = localStorage.getItem(k); return v !== null ? v : def; } catch { return def; } },
  set: (k, v) => { try { localStorage.setItem(k, String(v)); } catch {} },
  getJSON: (k, def = []) => { try { return JSON.parse(localStorage.getItem(k)) || def; } catch { return def; } },
};

function ArgileSettings() {
  const [patientName,   setPatientName]   = useStateAx(LS.get('bt_patient_name'));
  const [patientDob,    setPatientDob]    = useStateAx(LS.get('bt_patient_dob'));
  const [patientDoctor, setPatientDoctor] = useStateAx(LS.get('bt_patient_doctor'));
  const [driveId,       setDriveId]       = useStateAx(LS.get('bt_drive_client_id'));
  const [syncAuto,      setSyncAuto]      = useStateAx(LS.get('bt_auto_backup') === 'true');
  const [exportFeedback, setExportFeedback] = useStateAx('');

  const saveField = (key, val, setter) => { LS.set(key, val); setter(val); };

  const toggleSync = () => {
    const next = !syncAuto;
    setSyncAuto(next);
    LS.set('bt_auto_backup', String(next));
  };

  const exportJSON = () => {
    const data = {
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

  const lastSynced = LS.get('bt_last_synced');
  const driveStatus = driveId
    ? `ID configuré · ${lastSynced ? 'synchro ' + new Date(+lastSynced).toLocaleDateString('fr-FR') : 'jamais synchronisé'}`
    : 'Non configuré';

  return (
    <div style={{ padding: '20px 24px 0', overflowY: 'auto', height: 'calc(100% - 20px)', paddingBottom: 80 }}>
      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.14em', color: ARGILE.clay, textTransform: 'uppercase', margin: 0 }}>Maison & maintenance</p>
      <h1 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 38, lineHeight: 1.0, margin: '8px 0 24px', color: ARGILE.ink, fontWeight: 400 }}>
        <span style={{ fontStyle: 'italic' }}>Réglages</span>
      </h1>

      <ArgileSettingsGroup label="Sauvegardes">
        <ArgileEditRow icon="↥" title="Google Drive" value={driveStatus}
          placeholder="Client ID Google OAuth"
          onSave={v => saveField('bt_drive_client_id', v, setDriveId)} />
        <ArgileSettingsRow icon="↻" title="Synchronisation auto"
          value={syncAuto ? 'Active' : 'Inactive'}
          toggle toggleValue={syncAuto} onToggle={toggleSync} />
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
function ArgileSettingsRow({ icon, title, value, trailing, toggle, toggleValue, onToggle, onTrailing, last }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderBottom: last ? 'none' : `1px solid ${ARGILE.border}` }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, background: ARGILE.sand2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Instrument Serif, serif', fontSize: 16, color: ARGILE.ink, fontStyle: 'italic', flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, color: ARGILE.ink, fontWeight: 500 }}>{title}</div>
        {value && <div style={{ fontSize: 11, color: ARGILE.muted, marginTop: 2 }}>{value}</div>}
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
});
