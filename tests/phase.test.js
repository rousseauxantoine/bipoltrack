import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest';
import {
  moodPhaseArgile,
  computePhaseProjectionsArgile,
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
