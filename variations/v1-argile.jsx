// ──────────────────────────────────────────────────────────────────────
// V1 — ARGILE
// Éditorial, doux, en 3 temps. Mood = orbe d'argile glissée sur une piste.
// ──────────────────────────────────────────────────────────────────────
const { useState: useStateA, useRef: useRefA, useEffect: useEffectA } = React;

const ARGILE = {
  sand:    '#EDDFC4',
  sand2:   '#E2D0AE',
  cream:   '#F8F0DC',
  paper:   '#FBF6EB',
  clay:    '#B85839',
  clayDk:  '#8B3E26',
  ink:     '#2B1810',
  ink2:    '#5C4733',
  olive:   '#5C6A3E',
  muted:   '#9B826A',
  border:  'rgba(43,24,16,0.10)',
};

const ARGILE_ZONES = [
  { id: 'sombre',  label: 'Sombre',   range: [0, 19],   color: '#6B5C84', desc: 'jour de plomb' },
  { id: 'bas',     label: 'Bas',      range: [20, 39],  color: '#A47A6C', desc: 'voilé, en retrait' },
  { id: 'stable',  label: 'Stable',   range: [40, 59],  color: '#C39265', desc: 'au sol, présent' },
  { id: 'haut',    label: 'Haut',     range: [60, 79],  color: '#D67A3C', desc: 'élan, accélération' },
  { id: 'brulant', label: 'Brûlant',  range: [80, 100], color: '#B85839', desc: 'feu, peu de frein' },
];

function argileZoneOf(v) {
  return ARGILE_ZONES.find(z => v >= z.range[0] && v <= z.range[1]) || ARGILE_ZONES[2];
}

// ── Helpers localStorage (disponibles avant argile-extras.jsx) ────────
const LS = {
  get:     (k, def = '')  => { try { const v = localStorage.getItem(k); return v !== null ? v : def; } catch { return def; } },
  set:     (k, v)         => { try { localStorage.setItem(k, String(v)); } catch {} },
  getJSON: (k, def = [])  => { try { return JSON.parse(localStorage.getItem(k)) || def; } catch { return def; } },
  setJSON: (k, v)         => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

function ArgileMoodOrb({ value, onChange, finish = 'lisse' }) {
  const ref = useRefA(null);
  const [grab, setGrab] = useStateA(false);
  const [pulse, setPulse] = useStateA(0);
  const setFrom = (clientX) => {
    const r = ref.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    onChange(Math.round(x * 100));
  };
  const onDown = (e) => {
    e.preventDefault();
    setGrab(true);
    setPulse(p => p + 1);
    setFrom(e.clientX);
    const move = (ev) => { setFrom(ev.clientX); };
    const up = () => {
      setGrab(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  const zone = argileZoneOf(value);
  const orbX = value;

  // Orb finishes — three textures
  let orbBg;
  if (finish === 'texture') {
    orbBg = `radial-gradient(circle at 25% 22%, #f9ecd5 0%, ${zone.color} 50%, ${ARGILE.clayDk} 100%),
             repeating-radial-gradient(circle at 50% 50%, rgba(43,24,16,0.08) 0 2px, transparent 2px 4px)`;
  } else if (finish === 'nacre') {
    orbBg = `radial-gradient(circle at 30% 25%, #FBF0DA 0%, transparent 35%),
             conic-gradient(from 200deg at 50% 50%, ${zone.color}, #E8B891, ${ARGILE.clayDk}, ${zone.color})`;
  } else {
    orbBg = `radial-gradient(circle at 35% 30%, #f8e9d0 0%, ${zone.color} 55%, ${ARGILE.clayDk} 100%)`;
  }

  return (
    <div style={{ padding: '8px 0' }}>
      <style>{`
        @keyframes argile-ripple { 0% { transform: scale(0.6); opacity: 0.7; } 100% { transform: scale(2.2); opacity: 0; } }
        @keyframes argile-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-1.5px); } }
      `}</style>
      <div ref={ref} onPointerDown={onDown} style={{
        position: 'relative', height: 72, borderRadius: 36,
        cursor: grab ? 'grabbing' : 'grab', touchAction: 'none',
        background: `linear-gradient(90deg, #5E5276 0%, #8B6B6F 22%, #B8956E 42%, #C39265 56%, #D67A3C 74%, #B85839 100%)`,
        boxShadow: grab
          ? 'inset 0 2px 8px rgba(43,24,16,0.25), inset 0 -1px 0 rgba(255,255,255,0.25), 0 0 0 6px rgba(184,88,57,0.12)'
          : 'inset 0 2px 6px rgba(43,24,16,0.15), inset 0 -1px 0 rgba(255,255,255,0.2)',
        overflow: 'hidden', transition: 'box-shadow 0.18s',
      }}>
        {[20, 40, 60, 80].map(t => (
          <div key={t} style={{ position: 'absolute', left: t + '%', top: 8, bottom: 8, width: 1, background: 'rgba(43,24,16,0.18)' }} />
        ))}
        {/* ripple on each tap (key forces remount) */}
        <div key={pulse} style={{
          position: 'absolute', left: `calc(${orbX}% - 28px)`, top: 8, width: 56, height: 56,
          borderRadius: '50%', border: `2px solid rgba(255,240,220,0.7)`,
          pointerEvents: 'none',
          animation: 'argile-ripple 0.55s cubic-bezier(0.2, 0.6, 0.2, 1) forwards',
        }} />
        {/* orb */}
        <div style={{
          position: 'absolute', left: `calc(${orbX}% - 28px)`, top: 8, width: 56, height: 56,
          borderRadius: '50%', background: orbBg, backgroundBlendMode: finish === 'texture' ? 'multiply' : 'normal',
          boxShadow: grab
            ? '0 10px 24px rgba(43,24,16,0.45), inset 0 -4px 8px rgba(43,24,16,0.3), 0 0 0 2px rgba(255,240,220,0.4)'
            : '0 6px 14px rgba(43,24,16,0.35), inset 0 -3px 6px rgba(43,24,16,0.25)',
          transform: grab ? 'scale(1.08)' : 'scale(1)',
          transition: 'transform 0.15s cubic-bezier(0.3,1.5,0.5,1), box-shadow 0.18s, background 0.25s',
          animation: !grab ? 'argile-bob 4s ease-in-out infinite' : 'none',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, padding: '0 4px' }}>
        {ARGILE_ZONES.map(z => (
          <span key={z.id} style={{
            fontFamily: 'Instrument Serif, serif', fontStyle: 'italic',
            fontSize: 13, color: zone.id === z.id ? ARGILE.clay : ARGILE.muted,
            fontWeight: zone.id === z.id ? 600 : 400, transition: 'color 0.2s',
          }}>{z.label}</span>
        ))}
      </div>
    </div>
  );
}

function ArgileShell({ children, active, onNav, hideHeader = false }) {
  const tabs = [
    { id: 'journal', label: 'Journal' },
    { id: 'stats',   label: 'Carnet' },
    { id: 'news',    label: 'News' },
    { id: 'meds',    label: 'Soins' },
    { id: 'settings',label: '…' },
  ];

  // Last sync badge — lit bt_last_synced, se met à jour via l'event 'bipoltrack:synced'
  const lsGet = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
  const [lastSynced, setLastSynced] = useStateA(() => lsGet('bt_last_synced'));
  useEffectA(() => {
    const handler = () => setLastSynced(lsGet('bt_last_synced'));
    window.addEventListener('bipoltrack:synced', handler);
    return () => window.removeEventListener('bipoltrack:synced', handler);
  }, []);

  const syncLabel = lastSynced
    ? '↻ ' + new Date(+lastSynced).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    : null;

  return (
    <div style={{
      width: '100%', height: '100%', background: ARGILE.sand,
      fontFamily: 'DM Sans, sans-serif', color: ARGILE.ink, position: 'relative', overflow: 'hidden',
    }}>
      {/* Badge last sync — affiché sur toutes les pages si une synchro a eu lieu */}
      {syncLabel && (
        <div style={{
          position: 'absolute', top: 10, right: 14, zIndex: 20,
          fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
          letterSpacing: '0.08em', color: ARGILE.muted,
          background: 'rgba(251,246,235,0.80)', backdropFilter: 'blur(6px)',
          padding: '3px 8px', borderRadius: 20,
          border: `1px solid ${ARGILE.border}`,
          pointerEvents: 'none',
        }}>
          {syncLabel}
        </div>
      )}
      <div style={{ height: '100%', overflowY: 'auto', paddingTop: 54, paddingBottom: 100 }}>
        {children}
      </div>
      {/* bottom nav */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, paddingBottom: 24,
        background: `linear-gradient(180deg, rgba(237,223,196,0) 0%, ${ARGILE.sand} 35%)`,
        display: 'flex', justifyContent: 'center', alignItems: 'flex-end', zIndex: 10,
      }}>
        <div style={{
          display: 'flex', gap: 2, padding: 5, background: ARGILE.paper,
          borderRadius: 30, border: `1px solid ${ARGILE.border}`,
          boxShadow: '0 8px 24px rgba(43,24,16,0.10)',
        }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => onNav && onNav(t.id)} style={{
              border: 'none', padding: '8px 12px', borderRadius: 22,
              background: active === t.id ? ARGILE.clay : 'transparent',
              color: active === t.id ? '#fff' : ARGILE.ink2,
              fontFamily: 'Instrument Serif, serif', fontStyle: 'italic',
              fontSize: 14, cursor: 'pointer', transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}>{t.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ArgilePhaseHeader({ phase, total = 3, date }) {
  const todayLabel = date || new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'long' });
  return (
    <div style={{ padding: '0 24px 18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 18 }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.18em', color: ARGILE.muted, textTransform: 'uppercase' }}>{todayLabel}</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {Array.from({ length: total }, (_, i) => (
            <div key={i} style={{ width: 24, height: 3, borderRadius: 2, background: i < phase ? ARGILE.clay : ARGILE.border }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ───── Journal · phase 1 — Humeur ─────
function ArgileJournalMood({ orbFinish = 'lisse', onNext }) {
  const [v, setV] = useStateA(58);
  const zone = argileZoneOf(v);
  return (
    <>
      <ArgilePhaseHeader phase={1} />
      <div style={{ padding: '0 24px' }}>
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.14em', color: ARGILE.clay, textTransform: 'uppercase', margin: 0 }}>01 — l'humeur</p>
        <h1 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 44, lineHeight: 1.0, margin: '8px 0 6px', color: ARGILE.ink, fontWeight: 400 }}>
          Où es-tu, <span style={{ fontStyle: 'italic' }}>aujourd'hui</span> ?
        </h1>
        <p style={{ fontSize: 14, color: ARGILE.ink2, lineHeight: 1.5, margin: '0 0 28px', maxWidth: 280 }}>
          Glisse l'orbe sans réfléchir. Pas une note. Juste un endroit.
        </p>

        <ArgileMoodOrb value={v} onChange={setV} finish={orbFinish} />

        <div style={{
          marginTop: 32, padding: 20, background: ARGILE.paper, borderRadius: 16,
          border: `1px solid ${ARGILE.border}`,
        }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.12em', color: ARGILE.muted, textTransform: 'uppercase', marginBottom: 6 }}>Aujourd'hui · {zone.label.toLowerCase()}</div>
          <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 26, fontStyle: 'italic', color: ARGILE.ink, lineHeight: 1.2 }}>
            « Un {zone.desc}. »
          </div>
        </div>

        <button onClick={() => onNext(v)} style={{
          width: '100%', marginTop: 28, padding: '16px 20px', border: 'none', borderRadius: 100,
          background: ARGILE.ink, color: ARGILE.paper, fontFamily: 'Instrument Serif, serif',
          fontStyle: 'italic', fontSize: 18, cursor: 'pointer',
        }}>
          Continuer — le corps  →
        </button>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: ARGILE.muted }}>
          Étape 1 sur 3
        </p>
      </div>
    </>
  );
}

// ───── Journal · phase 2 — Corps ─────
function ArgileSlider({ label, value, onChange, min = 0, max = 12, suffix = 'h', leftLabel, rightLabel }) {
  const pct = ((value - min) / (max - min)) * 100;
  const ref = useRefA(null);
  const onDown = (e) => {
    e.preventDefault();
    const setFrom = (cx) => {
      const r = ref.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (cx - r.left) / r.width));
      onChange(Math.round((min + x * (max - min)) * 2) / 2);
    };
    setFrom(e.clientX);
    const move = (ev) => setFrom(ev.clientX);
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <span style={{ fontFamily: 'Instrument Serif, serif', fontSize: 22, color: ARGILE.ink, fontStyle: 'italic' }}>{label}</span>
        <span style={{ fontFamily: 'Instrument Serif, serif', fontSize: 28, color: ARGILE.clay }}>
          {value}<span style={{ fontSize: 16, color: ARGILE.muted, marginLeft: 2 }}>{suffix}</span>
        </span>
      </div>
      <div ref={ref} onPointerDown={onDown} style={{
        position: 'relative', height: 8, background: ARGILE.sand2, borderRadius: 4,
        cursor: 'pointer', touchAction: 'none',
      }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: pct + '%', background: ARGILE.clay, borderRadius: 4 }} />
        <div style={{
          position: 'absolute', left: `calc(${pct}% - 12px)`, top: -8, width: 24, height: 24, borderRadius: '50%',
          background: ARGILE.paper, border: `3px solid ${ARGILE.clay}`,
          boxShadow: '0 2px 6px rgba(43,24,16,0.15)',
        }} />
      </div>
      {(leftLabel || rightLabel) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: ARGILE.muted }}>
          <span>{leftLabel}</span><span>{rightLabel}</span>
        </div>
      )}
    </div>
  );
}

function ArgileChips({ items, selected, onToggle }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {items.map(it => {
        const sel = selected.includes(it.id);
        return (
          <button key={it.id} onClick={() => onToggle(it.id)} style={{
            padding: '8px 14px', borderRadius: 100, cursor: 'pointer',
            border: `1.5px solid ${sel ? ARGILE.clay : ARGILE.border}`,
            background: sel ? ARGILE.clay : 'transparent',
            color: sel ? ARGILE.paper : ARGILE.ink2,
            fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500,
          }}>{it.label}</button>
        );
      })}
    </div>
  );
}

function ArgileJournalCorps({ onNext }) {
  const [sleep, setSleep] = useStateA(7);
  const [anx, setAnx] = useStateA(3);
  const [sym, setSym] = useStateA([]);
  const toggle = (id) => setSym(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  return (
    <>
      <ArgilePhaseHeader phase={2} />
      <div style={{ padding: '0 24px' }}>
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.14em', color: ARGILE.clay, textTransform: 'uppercase', margin: 0 }}>02 — le corps</p>
        <h1 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 40, lineHeight: 1.0, margin: '8px 0 28px', color: ARGILE.ink, fontWeight: 400 }}>
          Ton corps, <span style={{ fontStyle: 'italic' }}>en bref</span>.
        </h1>

        <ArgileSlider label="Sommeil" value={sleep} onChange={setSleep} suffix="h" leftLabel="0h" rightLabel="12h" />
        <ArgileSlider label="Anxiété" value={anx} onChange={setAnx} min={0} max={10} suffix="/10" leftLabel="Calme" rightLabel="Intense" />

        <div style={{ marginTop: 8, marginBottom: 8 }}>
          <span style={{ fontFamily: 'Instrument Serif, serif', fontSize: 22, color: ARGILE.ink, fontStyle: 'italic' }}>Symptômes</span>
          <p style={{ fontSize: 12, color: ARGILE.muted, margin: '4px 0 14px' }}>Sans jugement. Cocher ce qui se présente.</p>
          <ArgileChips
            items={[
              { id: 'agit',  label: 'Agitation' },
              { id: 'fatigue', label: 'Fatigue' },
              { id: 'irrit',  label: 'Irritabilité' },
              { id: 'rapide', label: 'Idées rapides' },
              { id: 'concentr', label: 'Concentration' },
              { id: 'isol',  label: 'Retrait' },
              { id: 'impuls', label: 'Impulsivité' },
              { id: 'pleurs', label: 'Pleurs' },
            ]}
            selected={sym} onToggle={toggle}
          />
        </div>

        <button onClick={() => onNext(sleep, anx, sym)} style={{
          width: '100%', marginTop: 32, padding: '16px 20px', border: 'none', borderRadius: 100,
          background: ARGILE.ink, color: ARGILE.paper, fontFamily: 'Instrument Serif, serif',
          fontStyle: 'italic', fontSize: 18, cursor: 'pointer',
        }}>
          Continuer — le mot  →
        </button>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: ARGILE.muted }}>
          Étape 2 sur 3
        </p>
      </div>
    </>
  );
}

// ───── Journal · phase 3 — Mot ─────
function ArgileJournalMot({ onSave }) {
  const lsMeds = LS.getJSON('bt_meds', []).filter(m => m.active !== false);
  const [checkedMeds, setCheckedMeds] = useStateA(() => lsMeds.map(m => m.id));
  const toggleMed = (id) => setCheckedMeds(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const [note, setNote] = useStateA('');
  return (
    <>
      <ArgilePhaseHeader phase={3} />
      <div style={{ padding: '0 24px' }}>
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.14em', color: ARGILE.clay, textTransform: 'uppercase', margin: 0 }}>03 — le mot</p>
        <h1 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 40, lineHeight: 1.0, margin: '8px 0 28px', color: ARGILE.ink, fontWeight: 400 }}>
          Un dernier <span style={{ fontStyle: 'italic' }}>geste</span>.
        </h1>

        <div style={{ marginBottom: 24 }}>
          <span style={{ fontFamily: 'Instrument Serif, serif', fontSize: 22, color: ARGILE.ink, fontStyle: 'italic' }}>Traitements pris</span>
          <p style={{ fontSize: 12, color: ARGILE.muted, margin: '4px 0 12px' }}>Tap pour cocher.</p>
          {lsMeds.length === 0 ? (
            <p style={{ fontSize: 13, color: ARGILE.muted, fontStyle: 'italic', fontFamily: 'Instrument Serif, serif', lineHeight: 1.5 }}>
              Aucun traitement configuré — rends-toi dans <em>Soins</em> pour en ajouter.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {lsMeds.map(m => {
                const sel = checkedMeds.includes(m.id);
                const detail = [m.dose, m.freq].filter(Boolean).join(' · ');
                return (
                  <button key={m.id} onClick={() => toggleMed(m.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                    borderRadius: 14, border: `1.5px solid ${sel ? ARGILE.clay : ARGILE.border}`,
                    background: sel ? 'rgba(184,88,57,0.08)' : ARGILE.paper, cursor: 'pointer',
                    textAlign: 'left',
                  }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%',
                      border: `2px solid ${sel ? ARGILE.clay : ARGILE.muted}`,
                      background: sel ? ARGILE.clay : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {sel && <svg width="11" height="9" viewBox="0 0 11 9"><path d="M1 4.5 L4 7.5 L10 1" stroke="#FBF6EB" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 20, color: ARGILE.ink, lineHeight: 1.1 }}>{m.name}</div>
                      {detail && <div style={{ fontSize: 12, color: ARGILE.muted, marginTop: 2 }}>{detail}</div>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ marginBottom: 8 }}>
          <span style={{ fontFamily: 'Instrument Serif, serif', fontSize: 22, color: ARGILE.ink, fontStyle: 'italic' }}>Une note ?</span>
          <p style={{ fontSize: 12, color: ARGILE.muted, margin: '4px 0 10px' }}>Optionnel. Ce qui te traverse.</p>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} style={{
            width: '100%', minHeight: 110, padding: '14px 16px', borderRadius: 14,
            border: `1.5px solid ${ARGILE.border}`, background: ARGILE.paper, resize: 'none',
            fontFamily: 'Instrument Serif, serif', fontSize: 18, lineHeight: 1.5, color: ARGILE.ink,
            fontStyle: 'italic', outline: 'none', boxSizing: 'border-box',
          }} />
        </div>

        <button onClick={() => onSave(checkedMeds, note)} style={{
          width: '100%', marginTop: 18, padding: '18px 20px', border: 'none', borderRadius: 100,
          background: ARGILE.clay, color: ARGILE.paper, fontFamily: 'Instrument Serif, serif',
          fontStyle: 'italic', fontSize: 20, cursor: 'pointer',
          boxShadow: '0 6px 16px rgba(184,88,57,0.25)',
        }}>
          Fermer la journée
        </button>
      </div>
    </>
  );
}

// ───── Done · le retour récompense ─────
function ArgileDone() {
  return (
    <div style={{
      width: '100%', height: '100%', background: `radial-gradient(ellipse at 50% 30%, ${ARGILE.cream} 0%, ${ARGILE.sand} 70%)`,
      position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @keyframes argile-sun-core { 0% { transform: scale(0); opacity: 0; } 60% { transform: scale(1.15); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes argile-sun-ray { from { stroke-dashoffset: 100; opacity: 0; } to { stroke-dashoffset: 0; opacity: 0.7; } }
        @keyframes argile-fade-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes argile-rotate-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .argile-sun-ray { stroke-dasharray: 100; animation: argile-sun-ray 0.7s cubic-bezier(0.2,0.7,0.2,1) forwards; }
        .argile-sun-core { animation: argile-sun-core 0.7s cubic-bezier(0.2,1.4,0.4,1) 0.15s both; transform-origin: center; }
        .argile-rays-wrap { animation: argile-rotate-slow 80s linear infinite; transform-origin: center; }
        .argile-fade-1 { opacity: 0; animation: argile-fade-up 0.6s ease-out 0.8s forwards; }
        .argile-fade-2 { opacity: 0; animation: argile-fade-up 0.6s ease-out 1.0s forwards; }
        .argile-fade-3 { opacity: 0; animation: argile-fade-up 0.6s ease-out 1.2s forwards; }
        .argile-fade-4 { opacity: 0; animation: argile-fade-up 0.6s ease-out 1.5s forwards; }
      `}</style>
      {/* sun motif */}
      <div style={{
        position: 'absolute', top: '14%', left: '50%', transform: 'translateX(-50%)',
        width: 220, height: 220,
      }}>
        <svg viewBox="0 0 200 200" width="220" height="220">
          <defs>
            <radialGradient id="g1" cx="0.4" cy="0.35">
              <stop offset="0" stopColor="#F5C593" />
              <stop offset="1" stopColor={ARGILE.clay} />
            </radialGradient>
            <radialGradient id="ghalo" cx="0.5" cy="0.5">
              <stop offset="0.3" stopColor={ARGILE.clay} stopOpacity="0.2" />
              <stop offset="1" stopColor={ARGILE.clay} stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="92" fill="url(#ghalo)" className="argile-fade-1" />
          {/* rayons rotating wrap */}
          <g className="argile-rays-wrap">
            {Array.from({ length: 16 }, (_, i) => {
              const a = (i * 360) / 16;
              const len = i % 2 === 0 ? 92 : 78;
              const innerR = 48;
              const x1 = 100 + Math.cos(a * Math.PI / 180) * innerR;
              const y1 = 100 + Math.sin(a * Math.PI / 180) * innerR;
              const x2 = 100 + Math.cos(a * Math.PI / 180) * len;
              const y2 = 100 + Math.sin(a * Math.PI / 180) * len;
              return (
                <line key={i}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={ARGILE.clay} strokeWidth={i % 2 === 0 ? 2 : 1.2} strokeLinecap="round"
                  className="argile-sun-ray"
                  style={{ animationDelay: `${0.3 + i * 0.04}s` }}
                />
              );
            })}
          </g>
          <g className="argile-sun-core">
            <circle cx="100" cy="100" r="42" fill={ARGILE.clay} />
            <circle cx="100" cy="100" r="42" fill="url(#g1)" />
          </g>
        </svg>
      </div>

      <div style={{ position: 'absolute', bottom: 100, left: 0, right: 0, padding: '0 32px', textAlign: 'center' }}>
        <p className="argile-fade-2" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.18em', color: ARGILE.clay, textTransform: 'uppercase', margin: 0 }}>
          Sam. 23 mai · 23h12
        </p>
        <h1 className="argile-fade-2" style={{ fontFamily: 'Instrument Serif, serif', fontSize: 56, lineHeight: 1.0, margin: '14px 0 18px', color: ARGILE.ink, fontWeight: 400 }}>
          <span style={{ fontStyle: 'italic' }}>Pris.</span>
        </h1>
        <p className="argile-fade-3" style={{ fontSize: 15, lineHeight: 1.55, color: ARGILE.ink2, margin: '0 auto 28px', maxWidth: 280 }}>
          14 jours d'affilée. Ta courbe se dessine. Tu peux refermer le téléphone.
        </p>
        <div className="argile-fade-4" style={{
          display: 'inline-flex', gap: 8, padding: '8px 16px', borderRadius: 100,
          background: ARGILE.paper, border: `1px solid ${ARGILE.border}`, alignItems: 'center',
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: ARGILE.olive }} />
          <span style={{ fontSize: 12, color: ARGILE.ink2, fontWeight: 500 }}>14 jours · série en cours</span>
        </div>
      </div>
    </div>
  );
}

// ───── Carnet (stats simplifié) ─────
function ArgileStats() {
  // Build small 30-day strip
  const days = Array.from({ length: 30 }, (_, i) => {
    const r = Math.sin(i * 0.4) * 30 + Math.cos(i * 0.27) * 15 + 50 + (i > 22 ? 8 : 0);
    return Math.max(5, Math.min(95, Math.round(r)));
  });
  return (
    <div style={{ padding: '20px 24px 0' }}>
      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.14em', color: ARGILE.clay, textTransform: 'uppercase', margin: 0 }}>Le carnet</p>
      <h1 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 38, lineHeight: 1.0, margin: '8px 0 4px', color: ARGILE.ink, fontWeight: 400 }}>
        <span style={{ fontStyle: 'italic' }}>Mai</span> 2026
      </h1>
      <p style={{ fontSize: 13, color: ARGILE.muted, margin: '0 0 24px' }}>30 dernières journées.</p>

      {/* sparkline éditoriale */}
      <div style={{
        background: ARGILE.paper, borderRadius: 18, padding: '24px 20px',
        border: `1px solid ${ARGILE.border}`, marginBottom: 20,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.12em', color: ARGILE.muted, textTransform: 'uppercase' }}>Médiane 30j</div>
            <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 32, color: ARGILE.clay, lineHeight: 1, marginTop: 4, fontStyle: 'italic' }}>Stable</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.12em', color: ARGILE.muted, textTransform: 'uppercase' }}>Sommeil moy.</div>
            <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 32, color: ARGILE.ink, lineHeight: 1, marginTop: 4 }}>7,2<span style={{ fontSize: 16, color: ARGILE.muted }}>h</span></div>
          </div>
        </div>

        <svg viewBox="0 0 300 90" style={{ width: '100%', height: 90 }}>
          <line x1="0" y1="45" x2="300" y2="45" stroke={ARGILE.border} strokeDasharray="2 4" />
          {days.map((d, i) => {
            const x = (i / (days.length - 1)) * 300;
            const y = 90 - (d / 100) * 80 - 5;
            return <circle key={i} cx={x} cy={y} r={i === days.length - 1 ? 4 : 2.4} fill={ARGILE.clay} opacity={0.5 + (i / days.length) * 0.5} />;
          })}
          <polyline
            points={days.map((d, i) => `${(i / (days.length - 1)) * 300},${90 - (d / 100) * 80 - 5}`).join(' ')}
            fill="none" stroke={ARGILE.clay} strokeWidth="1.5" opacity="0.4"
          />
        </svg>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: ARGILE.muted, fontFamily: 'JetBrains Mono, monospace' }}>
          <span>23 avr</span><span>9 mai</span><span>23 mai</span>
        </div>
      </div>

      {/* zones du mois */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { zone: 'Sombre', days: 3, color: '#6B5C84' },
          { zone: 'Bas', days: 6, color: '#A47A6C' },
          { zone: 'Stable', days: 14, color: '#C39265' },
          { zone: 'Haut', days: 5, color: '#D67A3C' },
          { zone: 'Brûlant', days: 2, color: '#B85839' },
        ].map(r => (
          <div key={r.zone} style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
            background: ARGILE.paper, borderRadius: 14, border: `1px solid ${ARGILE.border}`,
          }}>
            <div style={{ width: 8, height: 32, borderRadius: 4, background: r.color }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 19, color: ARGILE.ink, fontStyle: 'italic' }}>{r.zone}</div>
              <div style={{ fontSize: 11, color: ARGILE.muted, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.06em' }}>{r.days} JOURS</div>
            </div>
            <div style={{
              width: 80, height: 6, background: ARGILE.sand2, borderRadius: 3, overflow: 'hidden',
            }}>
              <div style={{ width: (r.days / 30 * 100) + '%', height: '100%', background: r.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ───── Master ─────
function ArgileApp({ initialScreen = 'journal', tweaks = {} }) {
  const [screen, setScreen] = useStateA(initialScreen);
  // Brouillon du journal : accumulé à travers les 3 étapes
  const [journalDraft, setJournalDraft] = useStateA({ mood: 58, sleep: 7, anxiety: 3, symptoms: [] });
  const [restoreData, setRestoreData] = useStateA(null);

  // Écouter les demandes de restauration (conflit de données Drive détecté)
  useEffectA(() => {
    const handleRestoreReq = (e) => {
      setRestoreData(e.detail);
    };
    window.addEventListener('bipoltrack:restore-required', handleRestoreReq);
    return () => window.removeEventListener('bipoltrack:restore-required', handleRestoreReq);
  }, []);

  // Apply tweaks override to palette/density (mutates window.ARGILE_LIVE for screens to read)
  const pal = tweaks.palette || 'argile';
  const dens = tweaks.density || 'aere';
  const finish = tweaks.finish || 'lisse';

  // Sauvegarde de l'entrée dans bt_entries (même clé que la version legacy)
  const saveEntry = ({ mood, sleep, anxiety, symptoms, meds, note }) => {
    const today = new Date().toISOString().slice(0, 10);
    const entry = {
      date: today,
      mood,        // 0–100, échelle Argile (≠ legacy 1–10)
      sleep,
      anxiety,
      symptoms,    // IDs des chips sélectionnées
      meds,        // IDs des médicaments cochés
      note,
      effects: [],
      menstruation: [],
      ts: Date.now(),
    };
    const entries = LS.getJSON('bt_entries', []);
    const idx = entries.findIndex(e => e.date === today);
    if (idx >= 0) entries[idx] = entry;   // remplace si déjà noté aujourd'hui
    else entries.unshift(entry);
    LS.setJSON('bt_entries', entries);

    // Mettre à jour le timestamp de modification locale
    LS.set('bt_last_modified', String(Date.now()));
    LS.set('bt_pending_sync', 'true');

    // Signaler la modification pour la synchronisation asynchrone Google Drive
    window.dispatchEvent(new CustomEvent('bipoltrack:datachanged'));
    window.dispatchEvent(new CustomEvent('bipoltrack:synced'));
  };

  let body;
  if (screen === 'journal')      body = <ArgileJournalMood orbFinish={finish} onNext={(mood) => { setJournalDraft(d => ({...d, mood})); setScreen('corps'); }} />;
  else if (screen === 'corps')   body = <ArgileJournalCorps onNext={(sleep, anx, sym) => { setJournalDraft(d => ({...d, sleep, anxiety: anx, symptoms: sym})); setScreen('mot'); }} />;
  else if (screen === 'mot')     body = <ArgileJournalMot onSave={(medsChecked, note) => { saveEntry({...journalDraft, meds: medsChecked, note}); setScreen('done'); }} />;
  else if (screen === 'done')    body = <ArgileDone />;
  else if (screen === 'stats')   body = <ArgileStats />;
  else if (screen === 'empty'   && window.ArgileEmpty)   body = <ArgileEmpty onStart={() => setScreen('journal')} />;
  else if (screen === 'news'    && window.ArgileNews)    body = <ArgileNews />;
  else if (screen === 'history' && window.ArgileHistory) body = <ArgileHistory />;
  else if (screen === 'meds'    && window.ArgileMeds)    body = <ArgileMeds />;
  else if (screen === 'report'  && window.ArgileReport)  body = <ArgileReport />;
  else if (screen === 'settings' && window.ArgileSettings) body = <ArgileSettings />;
  else if (screen === 'stats-deep' && window.ArgileStatsDeep) body = <ArgileStatsDeep />;
  else body = <ArgileJournalMood orbFinish={finish} />;

  // Group journal sub-screens under "journal" tab; report/history/settings under their nearest tab
  let active;
  if (['corps','mot','done','journal','empty'].includes(screen)) active = 'journal';
  else if (screen === 'history' || screen === 'stats' || screen === 'stats-deep') active = 'stats';
  else if (screen === 'meds' || screen === 'report') active = 'meds';
  else if (screen === 'news') active = 'news';
  else if (screen === 'settings') active = 'settings';
  else active = 'journal';

  return (
    <IOSDevice width={390} height={844}>
      <ArgileShell active={active} onNav={(t) => {
        if (t === 'journal') setScreen('journal');
        else if (t === 'stats') setScreen('stats-deep');
        else if (t === 'news') setScreen('news');
        else if (t === 'meds') setScreen('meds');
        else if (t === 'settings') setScreen('settings');
      }}>
        {body}
      </ArgileShell>

      {/* Modal de résolution de conflits Google Drive (affiché à l'intérieur du simulateur iPhone) */}
      {restoreData && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(43, 24, 16, 0.45)', backdropFilter: 'blur(8px)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20, boxSizing: 'border-box'
        }}>
          <div style={{
            background: ARGILE.paper, borderRadius: 24, padding: '28px 20px',
            border: `1.5px solid ${ARGILE.border}`, width: '100%', maxWidth: 330,
            boxShadow: '0 16px 36px rgba(43,24,16,0.25)', boxSizing: 'border-box',
          }}>
            <div style={{ textAlign: 'center', marginBottom: 18 }}>
              <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.14em', color: ARGILE.clay, textTransform: 'uppercase' }}>Synchronisation</span>
              <h2 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 30, fontStyle: 'italic', color: ARGILE.ink, margin: '6px 0 0', fontWeight: 400 }}>Conflit détecté</h2>
            </div>

            <p style={{ fontSize: 13, lineHeight: 1.45, color: ARGILE.ink2, textAlign: 'center', margin: '0 0 20px' }}>
              Une sauvegarde plus récente a été trouvée sur votre Google Drive. Que souhaitez-vous faire ?
            </p>

            {/* Fichier Drive */}
            <div style={{
              background: 'rgba(184,88,57,0.06)', border: `1.5px solid ${ARGILE.clay}`,
              borderRadius: 14, padding: '14px 16px', marginBottom: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: ARGILE.clay }} />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.1em', color: ARGILE.clay, textTransform: 'uppercase' }}>Sur Google Drive (plus récent)</span>
              </div>
              <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 20, color: ARGILE.ink, fontStyle: 'italic', lineHeight: 1 }}>
                {(restoreData.entries || []).length} entrée{((restoreData.entries || []).length > 1) ? 's' : ''} · {(restoreData.meds || []).length} soin{((restoreData.meds || []).length > 1) ? 's' : ''}
              </div>
              <div style={{ fontSize: 10, color: ARGILE.muted, marginTop: 6, fontFamily: 'JetBrains Mono, monospace' }}>
                Sauvegardé le {new Date(restoreData.lastModified || restoreData.ts).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {/* Fichier local */}
            <div style={{
              background: ARGILE.sand, border: `1.5px solid ${ARGILE.border}`,
              borderRadius: 14, padding: '14px 16px', marginBottom: 24,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: ARGILE.muted }} />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.15em', color: ARGILE.muted, textTransform: 'uppercase' }}>Sur cet appareil (local)</span>
              </div>
              <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 20, color: ARGILE.ink, fontStyle: 'italic', lineHeight: 1 }}>
                {LS.getJSON('bt_entries', []).length} entrée{LS.getJSON('bt_entries', []).length > 1 ? 's' : ''} · {LS.getJSON('bt_meds', []).length} soin{LS.getJSON('bt_meds', []).length > 1 ? 's' : ''}
              </div>
              <div style={{ fontSize: 10, color: ARGILE.muted, marginTop: 6, fontFamily: 'JetBrains Mono, monospace' }}>
                Modifié le {new Date(+(LS.get('bt_last_modified') || Date.now())).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                onClick={() => {
                  if (window.ArgileDrive) window.ArgileDrive.doRestoreFromDrive(restoreData);
                  setRestoreData(null);
                }}
                style={{
                  width: '100%', padding: '13px 16px', border: 'none', borderRadius: 100,
                  background: ARGILE.clay, color: ARGILE.paper, fontFamily: 'Instrument Serif, serif',
                  fontStyle: 'italic', fontSize: 16, cursor: 'pointer', fontWeight: 500,
                  boxShadow: '0 4px 12px rgba(184,88,57,0.18)', transition: 'all 0.15s',
                }}
              >
                Télécharger la version Drive
              </button>
              <button
                onClick={() => {
                  if (window.ArgileDrive) window.ArgileDrive.keepLocalAndOverwrite();
                  setRestoreData(null);
                }}
                style={{
                  width: '100%', padding: '11px 16px', border: `1px solid ${ARGILE.border}`, borderRadius: 100,
                  background: 'transparent', color: ARGILE.ink2, fontFamily: 'Instrument Serif, serif',
                  fontStyle: 'italic', fontSize: 15, cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                Garder ma version locale (écrase Drive)
              </button>
            </div>
          </div>
        </div>
      )}
    </IOSDevice>
  );
}

Object.assign(window, { ArgileApp, ArgileShell, ArgileMoodOrb, ARGILE, ARGILE_ZONES, argileZoneOf, LS });
