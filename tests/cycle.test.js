import { describe, it, expect } from 'vitest';
import {
  moodLevelFrom,
  computeCycleDay,
  phaseOf,
  cycleConfidence,
  buildMoodCycleCells,
  CYCLE_PHASES,
  MOOD_BAR_HEIGHTS,
} from '../lib/core.js';

// ── CYCLE_PHASES & MOOD_BAR_HEIGHTS ──────────────────────────────────

describe('CYCLE_PHASES', () => {
  it('defines 4 phases with id, label and color', () => {
    expect(CYCLE_PHASES).toHaveLength(4);
    const ids = CYCLE_PHASES.map(p => p.id);
    expect(ids).toContain('regles');
    expect(ids).toContain('follic');
    expect(ids).toContain('ovul');
    expect(ids).toContain('luteal');
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

// ── computeCycleDay ───────────────────────────────────────────────────

describe('computeCycleDay', () => {
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
    // 2 full 28-day cycles = 56 days → day 57 is day 1 of cycle 3
    expect(computeCycleDay('2026-02-26', '2026-01-01', 28)).toBe(1);
  });
  it('handles a custom 30-day cycle', () => {
    expect(computeCycleDay('2026-01-30', '2026-01-01', 30)).toBe(30);
    expect(computeCycleDay('2026-01-31', '2026-01-01', 30)).toBe(1);
  });
  it('handles dates before lastPeriodStart with correct wrap', () => {
    // 3 days before start → should map to day 26 of the previous 28-day cycle
    expect(computeCycleDay('2025-12-29', '2026-01-01', 28)).toBe(26);
  });
  it('returns correct value for 21-day cycle', () => {
    expect(computeCycleDay('2026-01-21', '2026-01-01', 21)).toBe(21);
    expect(computeCycleDay('2026-01-22', '2026-01-01', 21)).toBe(1);
  });
});

// ── phaseOf ───────────────────────────────────────────────────────────

// Default params: L=28, D=5 → ovulationDay=14, period=days1-5

describe('phaseOf', () => {
  it('returns regles for day 1', () => expect(phaseOf(1)).toBe('regles'));
  it('returns regles for day 3', () => expect(phaseOf(3)).toBe('regles'));
  it('returns regles for day 5 (last period day)', () => expect(phaseOf(5)).toBe('regles'));
  it('returns follic for day 6 (day after period ends)', () => expect(phaseOf(6)).toBe('follic'));
  it('returns follic for day 13', () => expect(phaseOf(13)).toBe('follic'));
  it('returns ovul for day 14 (L-14)', () => expect(phaseOf(14)).toBe('ovul'));
  it('returns luteal for day 15', () => expect(phaseOf(15)).toBe('luteal'));
  it('returns luteal for day 28', () => expect(phaseOf(28)).toBe('luteal'));

  it('handles period length of 7', () => {
    expect(phaseOf(7, 28, 7)).toBe('regles');
    expect(phaseOf(8, 28, 7)).toBe('follic');
  });

  it('handles 30-day cycle (ovulation at day 16)', () => {
    expect(phaseOf(15, 30, 5)).toBe('follic');
    expect(phaseOf(16, 30, 5)).toBe('ovul');
    expect(phaseOf(17, 30, 5)).toBe('luteal');
    expect(phaseOf(30, 30, 5)).toBe('luteal');
  });

  it('handles 21-day cycle (ovulation at day 7)', () => {
    expect(phaseOf(6, 21, 5)).toBe('follic');
    expect(phaseOf(7, 21, 5)).toBe('ovul');
    expect(phaseOf(8, 21, 5)).toBe('luteal');
  });
});

// ── cycleConfidence ───────────────────────────────────────────────────

describe('cycleConfidence', () => {
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
  it('returns low when 0 cycles logged (lastPeriodStart set → estimation possible)', () => {
    expect(cycleConfidence({
      isCycleTrackingEnabled: true, cyclesLogged: 0, lastPeriodStart: '2026-01-01',
    })).toBe('low');
  });
  it('returns low when 1 cycle logged', () => {
    expect(cycleConfidence({
      isCycleTrackingEnabled: true, cyclesLogged: 1, lastPeriodStart: '2026-01-01',
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
  it('returns high with large stdDev below threshold', () => {
    expect(cycleConfidence({
      isCycleTrackingEnabled: true, cyclesLogged: 4, lastPeriodStart: '2026-01-01',
      cycleLengthStdDev: 3.9,
    })).toBe('high');
  });
});

// ── buildMoodCycleCells ───────────────────────────────────────────────

const BASE_SETTINGS = {
  isCycleTrackingEnabled: true,
  lastPeriodStart: '2026-01-01',
  avgCycleLength: 28,
  avgPeriodLength: 5,
  cyclesLogged: 3,
};

describe('buildMoodCycleCells', () => {
  it('returns one cell per day in the range', () => {
    const cells = buildMoodCycleCells([], BASE_SETTINGS, '2026-01-01', '2026-01-07');
    expect(cells).toHaveLength(7);
  });

  it('assigns correct ISO dates to cells', () => {
    const cells = buildMoodCycleCells([], BASE_SETTINGS, '2026-01-01', '2026-01-03');
    expect(cells.map(c => c.date)).toEqual(['2026-01-01', '2026-01-02', '2026-01-03']);
  });

  it('returns a single cell for a one-day range', () => {
    const cells = buildMoodCycleCells([], BASE_SETTINGS, '2026-01-10', '2026-01-10');
    expect(cells).toHaveLength(1);
    expect(cells[0].date).toBe('2026-01-10');
  });

  describe('moodLevel', () => {
    it('fills moodLevel from entry humeur', () => {
      const entries = [
        { date: '2026-01-01', humeur: 'sérénité' },
        { date: '2026-01-02', humeur: 'tristesse' },
        { date: '2026-01-03', humeur: 'euphorie' },
      ];
      const cells = buildMoodCycleCells(entries, BASE_SETTINGS, '2026-01-01', '2026-01-03');
      expect(cells[0].moodLevel).toBe(2);
      expect(cells[1].moodLevel).toBe(1);
      expect(cells[2].moodLevel).toBe(3);
    });

    it('sets moodLevel to null for days with no entry', () => {
      const cells = buildMoodCycleCells([], BASE_SETTINGS, '2026-01-01', '2026-01-01');
      expect(cells[0].moodLevel).toBeNull();
    });
  });

  describe('phase and cycleDay', () => {
    it('assigns regles phase for day 1', () => {
      const cells = buildMoodCycleCells([], BASE_SETTINGS, '2026-01-01', '2026-01-01');
      expect(cells[0].cycleDay).toBe(1);
      expect(cells[0].phase).toBe('regles');
    });

    it('assigns follic phase starting from day 6', () => {
      const cells = buildMoodCycleCells([], BASE_SETTINGS, '2026-01-06', '2026-01-06');
      expect(cells[0].phase).toBe('follic');
    });

    it('assigns ovul phase for day L-14 (= 14)', () => {
      const cells = buildMoodCycleCells([], BASE_SETTINGS, '2026-01-14', '2026-01-14');
      expect(cells[0].cycleDay).toBe(14);
      expect(cells[0].phase).toBe('ovul');
    });

    it('assigns luteal phase for days 15+', () => {
      const cells = buildMoodCycleCells([], BASE_SETTINGS, '2026-01-15', '2026-01-15');
      expect(cells[0].phase).toBe('luteal');
    });

    it('wraps cycleDay back to 1 after L days', () => {
      const cells = buildMoodCycleCells([], BASE_SETTINGS, '2026-01-28', '2026-01-29');
      expect(cells[0].cycleDay).toBe(28);
      expect(cells[1].cycleDay).toBe(1);
      expect(cells[1].phase).toBe('regles');
    });

    it('sets phase and cycleDay to null when confidence is none', () => {
      const settings = { isCycleTrackingEnabled: false, lastPeriodStart: '2026-01-01' };
      const cells = buildMoodCycleCells([], settings, '2026-01-01', '2026-01-01');
      expect(cells[0].phase).toBeNull();
      expect(cells[0].cycleDay).toBeNull();
    });

    it('sets phase and cycleDay to null when no lastPeriodStart', () => {
      const settings = { isCycleTrackingEnabled: true, cyclesLogged: 3 };
      const cells = buildMoodCycleCells([], settings, '2026-01-01', '2026-01-01');
      expect(cells[0].phase).toBeNull();
      expect(cells[0].cycleDay).toBeNull();
    });
  });

  describe('confidence and isPredicted', () => {
    it('marks all cells as isPredicted = true', () => {
      const cells = buildMoodCycleCells([], BASE_SETTINGS, '2026-01-01', '2026-01-05');
      expect(cells.every(c => c.isPredicted)).toBe(true);
    });

    it('propagates high confidence to all cells', () => {
      const cells = buildMoodCycleCells([], BASE_SETTINGS, '2026-01-01', '2026-01-03');
      expect(cells.every(c => c.confidence === 'high')).toBe(true);
    });

    it('propagates low confidence to all cells', () => {
      const settings = { ...BASE_SETTINGS, cyclesLogged: 1 };
      const cells = buildMoodCycleCells([], settings, '2026-01-01', '2026-01-03');
      expect(cells.every(c => c.confidence === 'low')).toBe(true);
    });

    it('propagates none confidence to all cells', () => {
      const settings = { isCycleTrackingEnabled: false, lastPeriodStart: '2026-01-01' };
      const cells = buildMoodCycleCells([], settings, '2026-01-01', '2026-01-03');
      expect(cells.every(c => c.confidence === 'none')).toBe(true);
    });
  });

  it('handles 30-day cycle correctly', () => {
    const settings = { ...BASE_SETTINGS, avgCycleLength: 30 };
    const cells = buildMoodCycleCells([], settings, '2026-01-01', '2026-01-31');
    expect(cells[29].cycleDay).toBe(30);
    expect(cells[30].cycleDay).toBe(1); // wraps on day 31
  });

  it('ignores entries outside the date range', () => {
    const entries = [
      { date: '2025-12-31', humeur: 'euphorie' },
      { date: '2026-01-15', humeur: 'tristesse' },
    ];
    const cells = buildMoodCycleCells(entries, BASE_SETTINGS, '2026-01-01', '2026-01-07');
    expect(cells.every(c => c.moodLevel === null)).toBe(true);
  });
});
