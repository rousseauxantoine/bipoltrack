import { describe, it, expect } from 'vitest';
import {
  // New engine (issue #60)
  segmentCycles,
  computeCyclePhi,
  buildMoodCycleCells,
  GAP_MIN,
  MIN_CYCLE,
  PERIOD_MAX,
  // Deprecated helpers (kept for backward-compat, still exported)
  moodLevelFrom,
  computeCycleDay,
  phaseOf,
  cycleConfidence,
  CYCLE_PHASES,
  MOOD_BAR_HEIGHTS,
} from '../lib/core.js';

// ── Constants ─────────────────────────────────────────────────────────

describe('cycle segmentation constants', () => {
  it('GAP_MIN is 2', ()    => expect(GAP_MIN).toBe(2));
  it('MIN_CYCLE is 21', () => expect(MIN_CYCLE).toBe(21));
  it('PERIOD_MAX is 10', () => expect(PERIOD_MAX).toBe(10));
});

describe('CYCLE_PHASES', () => {
  it('defines 4 phases with id, label and color', () => {
    expect(CYCLE_PHASES).toHaveLength(4);
    const ids = CYCLE_PHASES.map(p => p.id);
    expect(ids).toContain('regles');
    expect(ids).toContain('folliculaire');
    expect(ids).toContain('ovul');
    expect(ids).toContain('lutéale');
    CYCLE_PHASES.forEach(p => {
      expect(p.label).toBeTruthy();
      expect(p.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });
});

describe('MOOD_BAR_HEIGHTS', () => {
  it('has heights for levels 1, 2, 3', () => {
    expect(MOOD_BAR_HEIGHTS[1]).toBe(26);
    expect(MOOD_BAR_HEIGHTS[2]).toBe(46);
    expect(MOOD_BAR_HEIGHTS[3]).toBe(68);
  });
});

// ── moodLevelFrom ─────────────────────────────────────────────────────

describe('moodLevelFrom', () => {
  it('returns 1 for tristesse', () => {
    expect(moodLevelFrom({ humeur: 'tristesse' })).toBe(1);
  });
  it('returns 2 for sérénité', () => {
    expect(moodLevelFrom({ humeur: 'sérénité' })).toBe(2);
  });
  it('returns 3 for euphorie', () => {
    expect(moodLevelFrom({ humeur: 'euphorie' })).toBe(3);
  });
  it('returns null for null entry', () => {
    expect(moodLevelFrom(null)).toBeNull();
  });
  it('returns null for entry with no mood field', () => {
    expect(moodLevelFrom({})).toBeNull();
  });
  it('maps legacy mood ≤35 to level 1 (tristesse)', () => {
    expect(moodLevelFrom({ mood: 20 })).toBe(1);
    expect(moodLevelFrom({ mood: 35 })).toBe(1);
  });
  it('maps legacy mood 36-65 to level 2 (sérénité)', () => {
    expect(moodLevelFrom({ mood: 50 })).toBe(2);
    expect(moodLevelFrom({ mood: 65 })).toBe(2);
  });
  it('maps legacy mood >65 to level 3 (euphorie)', () => {
    expect(moodLevelFrom({ mood: 80 })).toBe(3);
    expect(moodLevelFrom({ mood: 100 })).toBe(3);
  });
  it('humeur field takes priority over mood field', () => {
    expect(moodLevelFrom({ humeur: 'euphorie', mood: 10 })).toBe(3);
  });
});

// ── segmentCycles ─────────────────────────────────────────────────────

function regles(...dates) {
  return dates.map(d => ({ date: d, menstruation: ['regles'] }));
}
function ovulation(...dates) {
  return dates.map(d => ({ date: d, menstruation: ['ovulation'] }));
}

describe('segmentCycles — empty / no data', () => {
  it('returns [] for empty entries', () => {
    expect(segmentCycles([])).toEqual([]);
  });
  it('returns [] when no menstruation field on any entry', () => {
    expect(segmentCycles([{ date: '2026-01-01', humeur: 'tristesse' }])).toEqual([]);
  });
  it('returns [] when menstruation exists but never regles', () => {
    expect(segmentCycles([{ date: '2026-01-01', menstruation: ['ovulation'] }])).toEqual([]);
  });
});

describe('segmentCycles — single period, open cycle', () => {
  it('returns one en_cours cycle with no end', () => {
    const entries = regles('2026-01-01', '2026-01-02', '2026-01-03');
    const [c] = segmentCycles(entries);
    expect(c.start).toBe('2026-01-01');
    expect(c.end).toBeNull();
    expect(c.status).toBe('en_cours');
    expect(c.ovulation).toBeNull();
    expect(c.length).toBeNull();
    expect(c.atypical).toBe(false);
    expect(c.ambiguousBleedings).toEqual([]);
  });

  it('detects atypical bleeding when duration > PERIOD_MAX (10)', () => {
    const dates = Array.from({ length: 11 }, (_, i) => `2026-01-${String(i + 1).padStart(2, '0')}`);
    const [c] = segmentCycles(dates.map(d => ({ date: d, menstruation: ['regles'] })));
    expect(c.atypical).toBe(true);
  });

  it('non-atypical at exactly PERIOD_MAX days', () => {
    const dates = Array.from({ length: 10 }, (_, i) => `2026-01-${String(i + 1).padStart(2, '0')}`);
    const [c] = segmentCycles(dates.map(d => ({ date: d, menstruation: ['regles'] })));
    expect(c.atypical).toBe(false);
  });
});

describe('segmentCycles — bleeding fusion (GAP_MIN)', () => {
  it('fuses two regles days separated by exactly 1 day (spotting lull)', () => {
    // Jan 1, 3 — gap = 1 day → same period
    const entries = [
      ...regles('2026-01-01', '2026-01-03'),
    ];
    const cycles = segmentCycles(entries);
    expect(cycles).toHaveLength(1);
    expect(cycles[0].start).toBe('2026-01-01');
  });

  it('does NOT fuse two regles days separated by 2 days (≥ GAP_MIN)', () => {
    // Jan 1, 4 — gap = 3 days → two separate periods, but only 1 accepted cycle (2nd is < MIN_CYCLE)
    // Actually wait: gap between Jan 1 and Jan 4 = 3 days > 1, so two separate runs.
    // But then MIN_CYCLE check: Jan 4 - Jan 1 = 3 days < 21 → ambigu
    const entries = regles('2026-01-01', '2026-01-04');
    const cycles = segmentCycles(entries);
    // Only 1 cycle (the second run is ambigu - too close to cycle start Jan 1)
    expect(cycles).toHaveLength(1);
    expect(cycles[0].ambiguousBleedings).toHaveLength(1);
    expect(cycles[0].ambiguousBleedings[0].start).toBe('2026-01-04');
  });
});

describe('segmentCycles — MIN_CYCLE guard (anti-spotting)', () => {
  it('marks bleeding < MIN_CYCLE days after cycle start as ambigu', () => {
    // Cycle starts Jan 1; new bleeding Jan 15 (= 14 days, < MIN_CYCLE=21)
    const entries = [...regles('2026-01-01'), ...regles('2026-01-15')];
    const cycles = segmentCycles(entries);
    expect(cycles).toHaveLength(1);
    expect(cycles[0].ambiguousBleedings).toHaveLength(1);
    expect(cycles[0].ambiguousBleedings[0].start).toBe('2026-01-15');
  });

  it('accepts a new cycle exactly at MIN_CYCLE days', () => {
    // Jan 1 + 21 days = Jan 22 → valid new cycle start
    const entries = [...regles('2026-01-01'), ...regles('2026-01-22')];
    const cycles = segmentCycles(entries);
    expect(cycles).toHaveLength(2);
    expect(cycles[0].end).toBe('2026-01-22');
    expect(cycles[0].length).toBe(21);
    expect(cycles[1].start).toBe('2026-01-22');
  });

  it('opens a new cycle when dist > MIN_CYCLE', () => {
    // Jan 1 → Feb 1 (31 days) → valid
    const entries = [...regles('2026-01-01'), ...regles('2026-02-01')];
    const cycles = segmentCycles(entries);
    expect(cycles).toHaveLength(2);
  });
});

describe('segmentCycles — two closed cycles, ovulation assignment', () => {
  // Cycle 1: Jan 1 – Jan 29 (28 days), ovulation Jan 15
  // Cycle 2: Jan 29 – open
  const entries = [
    ...regles('2026-01-01', '2026-01-02', '2026-01-03', '2026-01-04', '2026-01-05'),
    ...ovulation('2026-01-15'),
    ...regles('2026-01-29', '2026-01-30', '2026-01-31'),
  ];

  it('produces two cycles', () => {
    const cycles = segmentCycles(entries);
    expect(cycles).toHaveLength(2);
  });

  it('first cycle has status phase with correct ovulation', () => {
    const [c1] = segmentCycles(entries);
    expect(c1.status).toBe('phase');
    expect(c1.ovulation).toBe('2026-01-15');
    expect(c1.end).toBe('2026-01-29');
    expect(c1.length).toBe(28);
    expect(c1.follicularLength).toBe(14); // Jan 1 → Jan 15
  });

  it('second cycle is en_cours with no ovulation', () => {
    const [, c2] = segmentCycles(entries);
    expect(c2.status).toBe('en_cours');
    expect(c2.end).toBeNull();
    expect(c2.ovulation).toBeNull();
  });
});

describe('segmentCycles — indetermine cycle (no ovulation tagged)', () => {
  it('marks cycle as indetermine when no ovulation', () => {
    const entries = [
      ...regles('2026-01-01'),
      ...regles('2026-02-01'),
    ];
    const [c1] = segmentCycles(entries);
    expect(c1.status).toBe('indetermine');
    expect(c1.ovulation).toBeNull();
  });
});

describe('segmentCycles — ambigu cycle (multiple ovulations)', () => {
  it('marks cycle as ambigu when multiple ovulations exist', () => {
    const entries = [
      ...regles('2026-01-01'),
      ...ovulation('2026-01-10', '2026-01-18'),
      ...regles('2026-02-01'),
    ];
    const [c1] = segmentCycles(entries);
    expect(c1.status).toBe('ambigu');
    expect(c1.ovulation).toBeNull(); // multiple → not assigned
  });
});

describe('segmentCycles — en_cours cycle with ovulation', () => {
  it('records ovulation in open cycle when exactly one ovulation is after cycle start', () => {
    const entries = [
      ...regles('2026-01-01'),
      ...ovulation('2026-01-18'),
    ];
    const [c] = segmentCycles(entries);
    expect(c.status).toBe('en_cours');
    expect(c.ovulation).toBe('2026-01-18');
  });

  it('does not assign ovulation if multiple ovulations after start', () => {
    const entries = [
      ...regles('2026-01-01'),
      ...ovulation('2026-01-10', '2026-01-20'),
    ];
    const [c] = segmentCycles(entries);
    expect(c.ovulation).toBeNull();
  });
});

describe('segmentCycles — multiple cycles sequence', () => {
  // 3 cycles: Jan→Feb→Mar, all with ovulation
  const entries = [
    ...regles('2026-01-01'),
    ...ovulation('2026-01-15'),
    ...regles('2026-01-29'),
    ...ovulation('2026-02-12'),
    ...regles('2026-02-26'),
  ];

  it('returns 3 cycles', () => {
    expect(segmentCycles(entries)).toHaveLength(3);
  });

  it('cycle 1 is phaseable (phase) with correct follicular length', () => {
    const [c1] = segmentCycles(entries);
    expect(c1.status).toBe('phase');
    expect(c1.follicularLength).toBe(14);
  });

  it('cycle 2 is phaseable', () => {
    const [, c2] = segmentCycles(entries);
    expect(c2.status).toBe('phase');
    expect(c2.ovulation).toBe('2026-02-12');
  });

  it('cycle 3 is en_cours', () => {
    const [,, c3] = segmentCycles(entries);
    expect(c3.status).toBe('en_cours');
    expect(c3.end).toBeNull();
  });
});

describe('segmentCycles — input order', () => {
  it('sorts entries by date regardless of input order', () => {
    const entries = [
      { date: '2026-02-01', menstruation: ['regles'] },
      { date: '2026-01-01', menstruation: ['regles'] },
    ];
    const cycles = segmentCycles(entries);
    expect(cycles[0].start).toBe('2026-01-01');
  });
});

describe('segmentCycles — entries without menstruation field', () => {
  it('ignores entries missing a menstruation array', () => {
    const entries = [
      { date: '2026-01-01', humeur: 'tristesse' },           // no menstruation
      { date: '2026-01-02', menstruation: ['regles'] },      // valid
    ];
    const [c] = segmentCycles(entries);
    expect(c.start).toBe('2026-01-02');
  });
});

// ── computeCyclePhi ───────────────────────────────────────────────────

const PHASE_CYCLE = {
  start: '2026-01-01', end: '2026-01-29',
  status: 'phase', ovulation: '2026-01-15',
  follicularLength: 14, length: 28,
};

describe('computeCyclePhi', () => {
  it('returns null for non-phase cycle', () => {
    const indetermCycle = { ...PHASE_CYCLE, status: 'indetermine', ovulation: null };
    expect(computeCyclePhi('2026-01-10', indetermCycle)).toBeNull();
  });

  it('returns null when date is before cycle start', () => {
    expect(computeCyclePhi('2025-12-31', PHASE_CYCLE)).toBeNull();
  });

  it('returns null when date is on cycle end (not in cycle)', () => {
    expect(computeCyclePhi('2026-01-29', PHASE_CYCLE)).toBeNull();
  });

  it('returns 0 on cycle start day (follicular day 0)', () => {
    expect(computeCyclePhi('2026-01-01', PHASE_CYCLE)).toBe(0);
  });

  it('returns 1 on ovulation day', () => {
    expect(computeCyclePhi('2026-01-15', PHASE_CYCLE)).toBe(1);
  });

  it('returns φ ∈ (0, 1) for mid-follicular day', () => {
    // Jan 8 → 7 days after start, follLength=14 → φ = 7/14 = 0.5
    const phi = computeCyclePhi('2026-01-08', PHASE_CYCLE);
    expect(phi).toBeCloseTo(0.5);
    expect(phi).toBeGreaterThan(0);
    expect(phi).toBeLessThan(1);
  });

  it('returns φ ∈ (1, 2) for mid-luteal day', () => {
    // Jan 22 → 7 days after ovulation (Jan 15), lutLength=14 → φ = 1 + 7/14 = 1.5
    const phi = computeCyclePhi('2026-01-22', PHASE_CYCLE);
    expect(phi).toBeCloseTo(1.5);
    expect(phi).toBeGreaterThan(1);
    expect(phi).toBeLessThan(2);
  });

  it('returns φ just below 1 for the day before ovulation', () => {
    // Jan 14 → 13 days after start, follLength=14 → φ = 13/14
    const phi = computeCyclePhi('2026-01-14', PHASE_CYCLE);
    expect(phi).toBeCloseTo(13 / 14);
    expect(phi).toBeLessThan(1);
  });

  it('returns φ close to 2 for the last luteal day', () => {
    // Jan 28 → 13 days after ovulation (Jan 15), lutLength=14 → φ = 1 + 13/14
    const phi = computeCyclePhi('2026-01-28', PHASE_CYCLE);
    expect(phi).toBeCloseTo(1 + 13 / 14);
    expect(phi).toBeLessThan(2);
  });

  it('returns null when cycle has no ovulation', () => {
    expect(computeCyclePhi('2026-01-10', { ...PHASE_CYCLE, ovulation: null })).toBeNull();
  });
});

// ── buildMoodCycleCells ───────────────────────────────────────────────

describe('buildMoodCycleCells — basic structure', () => {
  it('returns one cell per day in the range', () => {
    const cells = buildMoodCycleCells([], '2026-01-01', '2026-01-07');
    expect(cells).toHaveLength(7);
  });

  it('assigns correct ISO dates to cells', () => {
    const cells = buildMoodCycleCells([], '2026-01-01', '2026-01-03');
    expect(cells.map(c => c.date)).toEqual(['2026-01-01', '2026-01-02', '2026-01-03']);
  });

  it('returns a single cell for a one-day range', () => {
    const cells = buildMoodCycleCells([], '2026-01-10', '2026-01-10');
    expect(cells).toHaveLength(1);
    expect(cells[0].date).toBe('2026-01-10');
  });

  it('cells include all required fields', () => {
    const cells = buildMoodCycleCells([], '2026-01-01', '2026-01-01');
    const c = cells[0];
    expect(c).toHaveProperty('date');
    expect(c).toHaveProperty('moodLevel');
    expect(c).toHaveProperty('menstruation');
    expect(c).toHaveProperty('cycleStatus');
    expect(c).toHaveProperty('phase');
    expect(c).toHaveProperty('phi');
    expect(c).toHaveProperty('cycleDay');   // deprecated — always null
    expect(c).toHaveProperty('isPredicted');
    expect(c).toHaveProperty('confidence');
  });

  it('cycleDay is always null (deprecated)', () => {
    const entries = [{ date: '2026-01-01', menstruation: ['regles'] }];
    const cells = buildMoodCycleCells(entries, '2026-01-01', '2026-01-05');
    expect(cells.every(c => c.cycleDay === null)).toBe(true);
  });
});

describe('buildMoodCycleCells — moodLevel', () => {
  it('fills moodLevel from entry humeur', () => {
    const entries = [
      { date: '2026-01-01', humeur: 'sérénité' },
      { date: '2026-01-02', humeur: 'tristesse' },
      { date: '2026-01-03', humeur: 'euphorie' },
    ];
    const cells = buildMoodCycleCells(entries, '2026-01-01', '2026-01-03');
    expect(cells[0].moodLevel).toBe(2);
    expect(cells[1].moodLevel).toBe(1);
    expect(cells[2].moodLevel).toBe(3);
  });

  it('sets moodLevel to null for days with no entry', () => {
    const cells = buildMoodCycleCells([], '2026-01-01', '2026-01-01');
    expect(cells[0].moodLevel).toBeNull();
  });
});

describe('buildMoodCycleCells — menstruation field', () => {
  it('copies entry.menstruation into the cell', () => {
    const entries = [{ date: '2026-01-03', humeur: 'tristesse', menstruation: ['regles'] }];
    const cells = buildMoodCycleCells(entries, '2026-01-01', '2026-01-05');
    expect(cells[2].menstruation).toEqual(['regles']);
  });

  it('defaults to empty array when no menstruation field', () => {
    const entries = [{ date: '2026-01-01', humeur: 'sérénité' }];
    const cells = buildMoodCycleCells(entries, '2026-01-01', '2026-01-01');
    expect(cells[0].menstruation).toEqual([]);
  });

  it('defaults to empty array for days with no entry', () => {
    const cells = buildMoodCycleCells([], '2026-01-01', '2026-01-01');
    expect(cells[0].menstruation).toEqual([]);
  });
});

describe('buildMoodCycleCells — cycleStatus and confidence before first period', () => {
  it('cycleStatus is null before the first known period', () => {
    const cells = buildMoodCycleCells([], '2026-01-01', '2026-01-07');
    expect(cells.every(c => c.cycleStatus === null)).toBe(true);
  });

  it('confidence is none before the first known period', () => {
    const cells = buildMoodCycleCells([], '2026-01-01', '2026-01-07');
    expect(cells.every(c => c.confidence === 'none')).toBe(true);
  });

  it('phase is null before first period', () => {
    const cells = buildMoodCycleCells([], '2026-01-01', '2026-01-07');
    expect(cells.every(c => c.phase === null)).toBe(true);
  });

  it('isPredicted is false before first period', () => {
    const cells = buildMoodCycleCells([], '2026-01-01', '2026-01-07');
    expect(cells.every(c => c.isPredicted === false)).toBe(true);
  });
});

describe('buildMoodCycleCells — en_cours cycle (open)', () => {
  const entries = [
    { date: '2026-01-01', menstruation: ['regles'] },
    { date: '2026-01-02', menstruation: ['regles'] },
  ];

  it('cells in open cycle have cycleStatus en_cours', () => {
    const cells = buildMoodCycleCells(entries, '2026-01-01', '2026-01-10');
    expect(cells.every(c => c.cycleStatus === 'en_cours')).toBe(true);
  });

  it('confidence is low for en_cours cycle', () => {
    const cells = buildMoodCycleCells(entries, '2026-01-01', '2026-01-10');
    expect(cells.every(c => c.confidence === 'low')).toBe(true);
  });

  it('isPredicted is true for en_cours cycle', () => {
    const cells = buildMoodCycleCells(entries, '2026-01-01', '2026-01-10');
    expect(cells.every(c => c.isPredicted)).toBe(true);
  });

  it('phase is folliculaire présumée when no ovulation tagged', () => {
    const cells = buildMoodCycleCells(entries, '2026-01-05', '2026-01-10');
    expect(cells.every(c => c.phase === 'folliculaire')).toBe(true);
  });

  it('phi is null for en_cours cycle (provisional, no confirmed end)', () => {
    const cells = buildMoodCycleCells(entries, '2026-01-05', '2026-01-10');
    expect(cells.every(c => c.phi === null)).toBe(true);
  });
});

describe('buildMoodCycleCells — phaseable (phase) cycle', () => {
  // Cycle: Jan 1 → Jan 29 (28d), ovulation Jan 15
  const entries = [
    ...Array.from({ length: 5 }, (_, i) => ({
      date: `2026-01-${String(i + 1).padStart(2, '0')}`,
      menstruation: ['regles'],
    })),
    { date: '2026-01-15', menstruation: ['ovulation'] },
    ...Array.from({ length: 3 }, (_, i) => ({
      date: `2026-01-${String(i + 29).padStart(2, '0')}`,
      menstruation: ['regles'],
    })),
  ];

  it('cells in cycle 1 have cycleStatus phase and confidence high', () => {
    const cells = buildMoodCycleCells(entries, '2026-01-01', '2026-01-28');
    expect(cells.every(c => c.cycleStatus === 'phase')).toBe(true);
    expect(cells.every(c => c.confidence === 'high')).toBe(true);
  });

  it('isPredicted is false for a confirmed closed cycle', () => {
    const cells = buildMoodCycleCells(entries, '2026-01-01', '2026-01-28');
    expect(cells.every(c => !c.isPredicted)).toBe(true);
  });

  it('follicular days have phase folliculaire', () => {
    const cells = buildMoodCycleCells(entries, '2026-01-01', '2026-01-14');
    expect(cells.every(c => c.phase === 'folliculaire')).toBe(true);
  });

  it('ovulation day has phase lutéale (date === ovulation date is lutéale)', () => {
    const cells = buildMoodCycleCells(entries, '2026-01-15', '2026-01-15');
    expect(cells[0].phase).toBe('lutéale');
  });

  it('luteal days have phase lutéale', () => {
    const cells = buildMoodCycleCells(entries, '2026-01-16', '2026-01-28');
    expect(cells.every(c => c.phase === 'lutéale')).toBe(true);
  });

  it('phi is 0 on cycle start', () => {
    const cells = buildMoodCycleCells(entries, '2026-01-01', '2026-01-01');
    expect(cells[0].phi).toBe(0);
  });

  it('phi is 1 on ovulation day', () => {
    const cells = buildMoodCycleCells(entries, '2026-01-15', '2026-01-15');
    expect(cells[0].phi).toBe(1);
  });

  it('phi is ~0.5 on mid-follicular day (Jan 8, 7/14)', () => {
    const cells = buildMoodCycleCells(entries, '2026-01-08', '2026-01-08');
    expect(cells[0].phi).toBeCloseTo(0.5);
  });

  it('phi ∈ (1, 2) for luteal days', () => {
    const cells = buildMoodCycleCells(entries, '2026-01-16', '2026-01-28');
    cells.forEach(c => {
      expect(c.phi).toBeGreaterThan(1);
      expect(c.phi).toBeLessThan(2);
    });
  });
});

describe('buildMoodCycleCells — indeterminate cycle', () => {
  // Two valid cycle starts but no ovulation tagged → first cycle is indetermine
  const entries = [
    { date: '2026-01-01', menstruation: ['regles'] },
    { date: '2026-02-01', menstruation: ['regles'] },
  ];

  it('cycleStatus is indetermine for closed cycle without ovulation', () => {
    const cells = buildMoodCycleCells(entries, '2026-01-05', '2026-01-20');
    expect(cells.every(c => c.cycleStatus === 'indetermine')).toBe(true);
  });

  it('confidence is low for indeterminate cycle', () => {
    const cells = buildMoodCycleCells(entries, '2026-01-05', '2026-01-20');
    expect(cells.every(c => c.confidence === 'low')).toBe(true);
  });

  it('phase is null for indeterminate cycle', () => {
    const cells = buildMoodCycleCells(entries, '2026-01-05', '2026-01-20');
    expect(cells.every(c => c.phase === null)).toBe(true);
  });

  it('phi is null for indeterminate cycle', () => {
    const cells = buildMoodCycleCells(entries, '2026-01-05', '2026-01-20');
    expect(cells.every(c => c.phi === null)).toBe(true);
  });

  it('isPredicted is false for a closed indeterminate cycle', () => {
    const cells = buildMoodCycleCells(entries, '2026-01-05', '2026-01-20');
    expect(cells.every(c => !c.isPredicted)).toBe(true);
  });
});

describe('buildMoodCycleCells — date range spanning multiple cycles', () => {
  // Cycle 1: Jan 1 → Jan 29, phaseable; Cycle 2: Jan 29 → open
  const entries = [
    { date: '2026-01-01', menstruation: ['regles'] },
    { date: '2026-01-15', menstruation: ['ovulation'] },
    { date: '2026-01-29', menstruation: ['regles'] },
  ];

  it('applies correct cycleStatus per cycle', () => {
    const cells = buildMoodCycleCells(entries, '2026-01-10', '2026-02-05');
    const c1 = cells.filter(c => c.date < '2026-01-29');
    const c2 = cells.filter(c => c.date >= '2026-01-29');
    expect(c1.every(c => c.cycleStatus === 'phase')).toBe(true);
    expect(c2.every(c => c.cycleStatus === 'en_cours')).toBe(true);
  });
});

describe('buildMoodCycleCells — ignores entries outside date range', () => {
  it('moodLevel stays null when entry date is outside range', () => {
    const entries = [
      { date: '2025-12-31', humeur: 'euphorie' },
      { date: '2026-01-15', humeur: 'tristesse' },
    ];
    const cells = buildMoodCycleCells(entries, '2026-01-01', '2026-01-07');
    expect(cells.every(c => c.moodLevel === null)).toBe(true);
  });
});

// ── Deprecated helpers (still exported for backward compat) ───────────

describe('computeCycleDay (deprecated)', () => {
  it('returns 1 on the first day of the period', () => {
    expect(computeCycleDay('2026-01-01', '2026-01-01')).toBe(1);
  });
  it('returns 14 for the 14th day', () => {
    expect(computeCycleDay('2026-01-14', '2026-01-01')).toBe(14);
  });
  it('returns 28 on the last day of a 28-day cycle', () => {
    expect(computeCycleDay('2026-01-28', '2026-01-01', 28)).toBe(28);
  });
  it('wraps to 1 on the first day of the next cycle', () => {
    expect(computeCycleDay('2026-01-29', '2026-01-01', 28)).toBe(1);
  });
  it('wraps correctly across multiple cycles', () => {
    expect(computeCycleDay('2026-02-26', '2026-01-01', 28)).toBe(1);
  });
  it('handles a custom 30-day cycle', () => {
    expect(computeCycleDay('2026-01-30', '2026-01-01', 30)).toBe(30);
    expect(computeCycleDay('2026-01-31', '2026-01-01', 30)).toBe(1);
  });
  it('handles dates before lastPeriodStart with correct wrap', () => {
    expect(computeCycleDay('2025-12-29', '2026-01-01', 28)).toBe(26);
  });
  it('returns correct value for 21-day cycle', () => {
    expect(computeCycleDay('2026-01-21', '2026-01-01', 21)).toBe(21);
    expect(computeCycleDay('2026-01-22', '2026-01-01', 21)).toBe(1);
  });
});

describe('phaseOf (deprecated)', () => {
  it('returns regles for day 1', () => expect(phaseOf(1)).toBe('regles'));
  it('returns regles for day 5 (last period day)', () => expect(phaseOf(5)).toBe('regles'));
  it('returns follic for day 6', () => expect(phaseOf(6)).toBe('follic'));
  it('returns ovul for day 14 (L-14)', () => expect(phaseOf(14)).toBe('ovul'));
  it('returns luteal for day 15', () => expect(phaseOf(15)).toBe('luteal'));
  it('handles 21-day cycle (ovulation at day 7)', () => {
    expect(phaseOf(6, 21, 5)).toBe('follic');
    expect(phaseOf(7, 21, 5)).toBe('ovul');
    expect(phaseOf(8, 21, 5)).toBe('luteal');
  });
});

describe('cycleConfidence (deprecated)', () => {
  it('returns none when cycleSettings is null', () => {
    expect(cycleConfidence(null)).toBe('none');
  });
  it('returns none when isCycleTrackingEnabled is false', () => {
    expect(cycleConfidence({
      isCycleTrackingEnabled: false, cyclesLogged: 5, lastPeriodStart: '2026-01-01',
    })).toBe('none');
  });
  it('returns none when lastPeriodStart is missing', () => {
    expect(cycleConfidence({ isCycleTrackingEnabled: true, cyclesLogged: 3 })).toBe('none');
  });
  it('returns low when 0 cycles logged', () => {
    expect(cycleConfidence({
      isCycleTrackingEnabled: true, cyclesLogged: 0, lastPeriodStart: '2026-01-01',
    })).toBe('low');
  });
  it('returns low when 2 cycles logged', () => {
    expect(cycleConfidence({
      isCycleTrackingEnabled: true, cyclesLogged: 2, lastPeriodStart: '2026-01-01',
    })).toBe('low');
  });
  it('returns high when 3+ cycles with low variability', () => {
    expect(cycleConfidence({
      isCycleTrackingEnabled: true, cyclesLogged: 3, lastPeriodStart: '2026-01-01',
    })).toBe('high');
  });
  it('returns high when stdDev is exactly 4', () => {
    expect(cycleConfidence({
      isCycleTrackingEnabled: true, cyclesLogged: 5, lastPeriodStart: '2026-01-01',
      cycleLengthStdDev: 4,
    })).toBe('high');
  });
  it('returns low when stdDev > 4 even with many cycles', () => {
    expect(cycleConfidence({
      isCycleTrackingEnabled: true, cyclesLogged: 10, lastPeriodStart: '2026-01-01',
      cycleLengthStdDev: 4.1,
    })).toBe('low');
  });
});
