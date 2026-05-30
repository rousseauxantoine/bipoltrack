import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest';
import {
  BADGE_CATALOG,
  countCompleteEntries,
  checkNewBadges,
  isEntryComplete,
} from '../lib/core.js';

const TODAY = '2026-05-25';
const fakeNow = new Date(TODAY + 'T12:00:00Z').getTime();

function dayStr(offsetDays) {
  return new Date(fakeNow - offsetDays * 86400000).toISOString().slice(0, 10);
}

function makeCompleteEntry(offsetDays, overrides = {}) {
  return { date: dayStr(offsetDays), humeur: 'sérénité', meds: [], ...overrides };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(fakeNow);
});

afterEach(() => {
  vi.useRealTimers();
});

// ── BADGE_CATALOG ─────────────────────────────────────────────────────

describe('BADGE_CATALOG', () => {
  it('has 12 badges total', () => {
    expect(BADGE_CATALOG).toHaveLength(12);
  });

  it('has 6 regularite badges', () => {
    expect(BADGE_CATALOG.filter(b => b.family === 'regularite')).toHaveLength(6);
  });

  it('has 6 assiduite badges', () => {
    expect(BADGE_CATALOG.filter(b => b.family === 'assiduite')).toHaveLength(6);
  });

  it('regularite badges use streak criterion', () => {
    BADGE_CATALOG.filter(b => b.family === 'regularite').forEach(b => {
      expect(b.criterion).toBe('streak');
    });
  });

  it('assiduite badges use volume criterion', () => {
    BADGE_CATALOG.filter(b => b.family === 'assiduite').forEach(b => {
      expect(b.criterion).toBe('volume');
    });
  });

  it('regularite thresholds are 3, 7, 14, 30, 60, 90', () => {
    const thresholds = BADGE_CATALOG
      .filter(b => b.family === 'regularite')
      .map(b => b.threshold);
    expect(thresholds).toEqual([3, 7, 14, 30, 60, 90]);
  });

  it('assiduite thresholds are 1, 10, 50, 100, 250, 500', () => {
    const thresholds = BADGE_CATALOG
      .filter(b => b.family === 'assiduite')
      .map(b => b.threshold);
    expect(thresholds).toEqual([1, 10, 50, 100, 250, 500]);
  });

  it('each badge has id, name, icon, message', () => {
    BADGE_CATALOG.forEach(b => {
      expect(b.id).toBeTruthy();
      expect(b.name).toBeTruthy();
      expect(b.icon).toBeTruthy();
      expect(b.message).toBeTruthy();
    });
  });
});

// ── countCompleteEntries ──────────────────────────────────────────────

describe('countCompleteEntries', () => {
  it('returns 0 for empty entries', () => {
    expect(countCompleteEntries([])).toBe(0);
  });

  it('returns 0 for entries without meds', () => {
    expect(countCompleteEntries([{ date: TODAY, humeur: 'sérénité' }])).toBe(0);
  });

  it('counts one complete entry', () => {
    expect(countCompleteEntries([makeCompleteEntry(0)])).toBe(1);
  });

  it('counts multiple complete entries on different days', () => {
    const entries = [makeCompleteEntry(0), makeCompleteEntry(1), makeCompleteEntry(2)];
    expect(countCompleteEntries(entries)).toBe(3);
  });

  it('does not double-count same day', () => {
    const entries = [
      makeCompleteEntry(0),
      makeCompleteEntry(0, { ts: 2 }),
    ];
    expect(countCompleteEntries(entries)).toBe(1);
  });

  it('ignores incomplete entries', () => {
    const entries = [
      makeCompleteEntry(0),
      { date: dayStr(1), humeur: 'sérénité' }, // no meds
    ];
    expect(countCompleteEntries(entries)).toBe(1);
  });
});

// ── checkNewBadges ────────────────────────────────────────────────────

describe('checkNewBadges', () => {
  it('returns empty when no criteria met', () => {
    expect(checkNewBadges([], 0, [])).toEqual([]);
  });

  it('unlocks B-A01 on first complete entry', () => {
    const entries = [makeCompleteEntry(0)];
    const result = checkNewBadges(entries, 1, []);
    expect(result).toContain('B-A01');
  });

  it('does not re-unlock already-unlocked badge', () => {
    const entries = [makeCompleteEntry(0)];
    expect(checkNewBadges(entries, 1, ['B-A01'])).not.toContain('B-A01');
  });

  it('unlocks B-R01 when streakBest >= 3', () => {
    const entries = Array.from({ length: 3 }, (_, i) => makeCompleteEntry(i));
    expect(checkNewBadges(entries, 3, [])).toContain('B-R01');
  });

  it('does not unlock B-R01 when streakBest < 3', () => {
    const entries = Array.from({ length: 2 }, (_, i) => makeCompleteEntry(i));
    expect(checkNewBadges(entries, 2, [])).not.toContain('B-R01');
  });

  it('unlocks multiple badges at once', () => {
    const entries = Array.from({ length: 10 }, (_, i) => makeCompleteEntry(i));
    const result = checkNewBadges(entries, 7, []);
    // 10 complete entries → B-A01 + B-A02; 7-day streak → B-R01 + B-R02
    expect(result).toContain('B-A01');
    expect(result).toContain('B-A02');
    expect(result).toContain('B-R01');
    expect(result).toContain('B-R02');
  });

  it('uses streakBest for regularite badges (not current streak)', () => {
    // Only 1 entry today (current streak = 1), but best was 7
    const entries = [makeCompleteEntry(0)];
    const result = checkNewBadges(entries, 7, []);
    expect(result).toContain('B-R01');
    expect(result).toContain('B-R02');
    expect(result).not.toContain('B-R03'); // threshold 14
  });

  it('unlocks assiduite badges based on volume only', () => {
    const entries = Array.from({ length: 50 }, (_, i) => makeCompleteEntry(i));
    const result = checkNewBadges(entries, 0, []);
    expect(result).toContain('B-A01');
    expect(result).toContain('B-A02');
    expect(result).toContain('B-A03');
    expect(result).not.toContain('B-A04'); // threshold 100
  });

  it('respects already-unlocked list', () => {
    const entries = Array.from({ length: 10 }, (_, i) => makeCompleteEntry(i));
    const alreadyUnlocked = ['B-A01', 'B-A02', 'B-R01'];
    const result = checkNewBadges(entries, 7, alreadyUnlocked);
    expect(result).not.toContain('B-A01');
    expect(result).not.toContain('B-A02');
    expect(result).not.toContain('B-R01');
    expect(result).toContain('B-R02');
  });
});
