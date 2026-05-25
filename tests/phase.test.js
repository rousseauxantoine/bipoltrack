import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest';
import {
  moodPhaseArgile,
  computePhaseProjectionsArgile,
  computeAvgPhaseDurationArgile,
  PHASE_DAYS_ARGILE,
} from '../lib/core.js';

const TODAY = '2026-05-25';
const fakeNow = new Date(TODAY + 'T12:00:00Z').getTime();

function dayStr(offsetDays) {
  return new Date(fakeNow - offsetDays * 86400000).toISOString().slice(0, 10);
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(fakeNow);
});

afterEach(() => {
  vi.useRealTimers();
});

// ── moodPhaseArgile ───────────────────────────────────────────────────

describe('moodPhaseArgile', () => {
  it('returns null for null mood', () => {
    expect(moodPhaseArgile(null)).toBeNull();
    expect(moodPhaseArgile(undefined)).toBeNull();
  });

  it('returns "down" for mood < 40', () => {
    expect(moodPhaseArgile(0)).toBe('down');
    expect(moodPhaseArgile(20)).toBe('down');
    expect(moodPhaseArgile(39)).toBe('down');
  });

  it('returns null for stable zone 40–59 (not a phase trigger)', () => {
    expect(moodPhaseArgile(40)).toBeNull();
    expect(moodPhaseArgile(50)).toBeNull();
    expect(moodPhaseArgile(59)).toBeNull();
  });

  it('returns "up" for mood ≥ 60', () => {
    expect(moodPhaseArgile(60)).toBe('up');
    expect(moodPhaseArgile(80)).toBe('up');
    expect(moodPhaseArgile(100)).toBe('up');
  });
});

// ── computePhaseProjectionsArgile ────────────────────────────────────

describe('computePhaseProjectionsArgile', () => {
  it('returns empty result for empty entries', () => {
    const result = computePhaseProjectionsArgile([]);
    expect(result.map).toEqual({});
    expect(result.fromDate).toBeNull();
    expect(result.phase).toBeNull();
  });

  it('returns empty result when all entries are in stable zone (no phase trigger)', () => {
    const entries = [
      { date: dayStr(5), mood: 50 },
      { date: dayStr(3), mood: 45 },
    ];
    const result = computePhaseProjectionsArgile(entries);
    expect(result.map).toEqual({});
    expect(result.fromDate).toBeNull();
  });

  describe('single phase entry', () => {
    it('fills historical map from entry date to today (exclusive)', () => {
      const entryDate = dayStr(5);
      const entries = [{ date: entryDate, mood: 25 }]; // down
      const result = computePhaseProjectionsArgile(entries);

      // Days from entryDate up to (but not including) today should be 'down'
      expect(result.map[entryDate]).toBe('down');
      expect(result.map[dayStr(4)]).toBe('down');
      expect(result.map[dayStr(1)]).toBe('down');
      // Today itself is NOT in the historical fill (end = todayStr, loop is < end)
      // But today IS covered by the future projection (i=0 is skipped, i=1 starts)
    });

    it('projects future with alternating cycles from today', () => {
      // Entry placed exactly PHASE_DAYS_ARGILE days ago → cycle starts fresh
      const entryDate = dayStr(PHASE_DAYS_ARGILE);
      const entries = [{ date: entryDate, mood: 25 }]; // down
      const result = computePhaseProjectionsArgile(entries);

      expect(result.phase).toBe('down');
      expect(result.fromDate).toBe(entryDate);

      // daysSinceChange = 21; next 21 days continue the current cycle
      // totalDays = 21 + i; cycle = floor(22/21) % 2 = 1 % 2 = 1 → opposite
      // So day+1 should be the flipped phase
      const tomorrow = dayStr(-1);
      expect(result.map[tomorrow]).toBe('up'); // flipped after 21 days
    });

    it('phase cycle flips at PHASE_DAYS_ARGILE boundary', () => {
      // Entry is today — daysSinceChange = 0
      const entries = [{ date: TODAY, mood: 90 }]; // up
      const result = computePhaseProjectionsArgile(entries);

      // i=1: totalDays=1, cycle=floor(1/21)%2=0 → same as current (up)
      // i=21: totalDays=21, cycle=floor(21/21)%2=1 → flipped (down)
      const day21 = dayStr(-21);
      const day20 = dayStr(-20);
      expect(result.map[day20]).toBe('up');  // still in first cycle
      expect(result.map[day21]).toBe('down'); // crossed into second cycle
    });
  });

  describe('phase transitions', () => {
    it('detects last phase change and anchors projection from there', () => {
      const entries = [
        { date: dayStr(10), mood: 25 }, // down
        { date: dayStr(5),  mood: 80 }, // up — this is the last change
      ];
      const result = computePhaseProjectionsArgile(entries);
      expect(result.phase).toBe('up');
      expect(result.fromDate).toBe(dayStr(5));
    });

    it('fills historical map correctly across a phase boundary', () => {
      const downDate = dayStr(10);
      const upDate   = dayStr(5);
      const entries = [
        { date: downDate, mood: 25 }, // down
        { date: upDate,   mood: 80 }, // up
      ];
      const result = computePhaseProjectionsArgile(entries);

      // Between downDate and upDate → 'down'
      expect(result.map[downDate]).toBe('down');
      expect(result.map[dayStr(8)]).toBe('down');
      expect(result.map[dayStr(6)]).toBe('down');

      // From upDate onwards (up to todayStr exclusive) → 'up'
      expect(result.map[upDate]).toBe('up');
      expect(result.map[dayStr(4)]).toBe('up');
      expect(result.map[dayStr(1)]).toBe('up');
    });

    it('handles no phase change (same phase throughout)', () => {
      const entries = [
        { date: dayStr(10), mood: 25 }, // down
        { date: dayStr(5),  mood: 30 }, // still down — no change
      ];
      const result = computePhaseProjectionsArgile(entries);
      expect(result.phase).toBe('down');
      // fromDate should remain the first entry (no change detected)
      expect(result.fromDate).toBe(dayStr(10));
    });
  });

  describe('future projection extent', () => {
    it('projects exactly PHASE_DAYS_ARGILE × 8 days into the future', () => {
      const entries = [{ date: TODAY, mood: 90 }]; // up, today
      const result = computePhaseProjectionsArgile(entries);

      const maxFuture = dayStr(-(PHASE_DAYS_ARGILE * 8));
      const beyondMax = dayStr(-(PHASE_DAYS_ARGILE * 8 + 1));

      expect(result.map[maxFuture]).toBeDefined();
      expect(result.map[beyondMax]).toBeUndefined();
    });
  });

  describe('entry ordering', () => {
    it('sorts entries by date regardless of input order', () => {
      const entries = [
        { date: dayStr(5),  mood: 80 }, // up (later)
        { date: dayStr(10), mood: 25 }, // down (earlier)
      ];
      const result = computePhaseProjectionsArgile(entries);
      // Historical fill between the two: down phase then up phase
      expect(result.map[dayStr(8)]).toBe('down');
      expect(result.map[dayStr(4)]).toBe('up');
    });
  });
});

// ── computeAvgPhaseDurationArgile ─────────────────────────────────────

describe('computeAvgPhaseDurationArgile', () => {
  it('returns PHASE_DAYS_ARGILE when no entries', () => {
    expect(computeAvgPhaseDurationArgile([])).toBe(PHASE_DAYS_ARGILE);
  });

  it('returns PHASE_DAYS_ARGILE when only one phase entry (no transition)', () => {
    const entries = [{ date: dayStr(10), mood: 25 }];
    expect(computeAvgPhaseDurationArgile(entries)).toBe(PHASE_DAYS_ARGILE);
  });

  it('returns PHASE_DAYS_ARGILE when all entries are same phase', () => {
    const entries = [
      { date: dayStr(20), mood: 25 },
      { date: dayStr(10), mood: 30 },
      { date: dayStr(5),  mood: 20 },
    ];
    expect(computeAvgPhaseDurationArgile(entries)).toBe(PHASE_DAYS_ARGILE);
  });

  it('calculates average duration from one transition', () => {
    // down for 10 days, then up — single segment of 10 days
    const entries = [
      { date: dayStr(10), mood: 25 }, // down starts
      { date: dayStr(0),  mood: 80 }, // up starts (transition)
    ];
    const result = computeAvgPhaseDurationArgile(entries);
    expect(result).toBe(10);
  });

  it('averages multiple phase segments', () => {
    // down 10 days → up 5 days → down (ignored, no end transition in window)
    const entries = [
      { date: dayStr(15), mood: 25 }, // down
      { date: dayStr(5),  mood: 80 }, // up (transition after 10 days)
      { date: dayStr(0),  mood: 20 }, // down (transition after 5 days)
    ];
    // durations: [10, 5] → avg = 7 (Math.round(7.5) = 8, actually 15/2=7.5 → 8)
    const result = computeAvgPhaseDurationArgile(entries);
    expect(result).toBe(8);
  });

  it('ignores entries outside the 90-day window', () => {
    const entries = [
      { date: dayStr(100), mood: 25 }, // outside window
      { date: dayStr(95),  mood: 80 }, // outside window
      { date: dayStr(10),  mood: 25 }, // inside window — single entry, no transition
    ];
    expect(computeAvgPhaseDurationArgile(entries)).toBe(PHASE_DAYS_ARGILE);
  });

  it('clamps result to minimum 7 days', () => {
    // 3-day segment only
    const entries = [
      { date: dayStr(3), mood: 25 },
      { date: dayStr(0), mood: 80 },
    ];
    const result = computeAvgPhaseDurationArgile(entries);
    expect(result).toBe(7); // clamped from 3 to 7
  });

  it('clamps result to maximum 90 days', () => {
    // 85-day segment — within window of 90
    const entries = [
      { date: dayStr(85), mood: 25 },
      { date: dayStr(0),  mood: 80 },
    ];
    const result = computeAvgPhaseDurationArgile(entries);
    expect(result).toBe(85); // 85 < 90, no clamp needed
  });
});

// ── computePhaseProjectionsArgile — algo regression90 ─────────────────

describe('computePhaseProjectionsArgile with regression90 algo', () => {
  it('uses calculated cycle length instead of 21 days', () => {
    // down 10 days → up: computed cycleDays = 10
    const entries = [
      { date: dayStr(10), mood: 25 },
      { date: dayStr(0),  mood: 80 },
    ];
    const result = computePhaseProjectionsArgile(entries, 'regression90');
    expect(result.cycleDays).toBe(10);
  });

  it('returns cycleDays = PHASE_DAYS_ARGILE for default algo', () => {
    const entries = [{ date: TODAY, mood: 25 }];
    const result = computePhaseProjectionsArgile(entries);
    expect(result.cycleDays).toBe(PHASE_DAYS_ARGILE);
  });

  it('projects 8 cycles forward with calculated duration', () => {
    // cycle = 10 days; project 80 days total
    const entries = [
      { date: dayStr(10), mood: 25 },
      { date: dayStr(0),  mood: 80 },
    ];
    const result = computePhaseProjectionsArgile(entries, 'regression90');
    const cycleDays = result.cycleDays; // 10
    const maxFuture = dayStr(-(cycleDays * 8));
    const beyondMax = dayStr(-(cycleDays * 8 + 1));
    expect(result.map[maxFuture]).toBeDefined();
    expect(result.map[beyondMax]).toBeUndefined();
  });
});
