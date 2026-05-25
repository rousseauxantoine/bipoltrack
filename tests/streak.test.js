import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest';
import { computeStreak, computeStats30, ARGILE_HUMEUR_OPTS } from '../lib/core.js';

// Pin "today" to a fixed UTC date for all streak/stats tests
const TODAY = '2026-05-25';
const fakeNow = new Date(TODAY + 'T12:00:00Z').getTime();

function dayStr(offsetDays) {
  return new Date(fakeNow - offsetDays * 86400000).toISOString().slice(0, 10);
}

function makeEntry(offsetDays, overrides = {}) {
  return { date: dayStr(offsetDays), humeur: 'sérénité', ...overrides };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(fakeNow);
});

afterEach(() => {
  vi.useRealTimers();
});

// ── computeStreak ─────────────────────────────────────────────────────

describe('computeStreak', () => {
  it('returns 0 for empty entries', () => {
    expect(computeStreak([])).toBe(0);
  });

  it('returns 0 when today has no entry', () => {
    // Only has yesterday
    expect(computeStreak([makeEntry(1)])).toBe(0);
  });

  it('returns 1 when only today has an entry', () => {
    expect(computeStreak([makeEntry(0)])).toBe(1);
  });

  it('returns 2 for today and yesterday', () => {
    expect(computeStreak([makeEntry(0), makeEntry(1)])).toBe(2);
  });

  it('returns 3 for three consecutive days including today', () => {
    expect(computeStreak([makeEntry(0), makeEntry(1), makeEntry(2)])).toBe(3);
  });

  it('stops at the first gap even if older entries exist', () => {
    // today + yesterday + gap + 3 days ago
    expect(computeStreak([makeEntry(0), makeEntry(1), makeEntry(3)])).toBe(2);
  });

  it('ignores duplicate dates (Set deduplication)', () => {
    const entries = [makeEntry(0), makeEntry(0), makeEntry(1)];
    expect(computeStreak(entries)).toBe(2);
  });

  it('does not count future-dated entries', () => {
    // A date string for tomorrow (negative offset)
    const tomorrow = dayStr(-1);
    const entries = [{ date: tomorrow, humeur: 'sérénité' }, makeEntry(0)];
    // streak starts from today, future entry doesn't extend it backwards
    expect(computeStreak(entries)).toBe(1);
  });

  it('is not affected by entry order in the array', () => {
    const entries = [makeEntry(2), makeEntry(0), makeEntry(1)];
    expect(computeStreak(entries)).toBe(3);
  });
});

// ── computeStats30 ────────────────────────────────────────────────────

describe('computeStats30', () => {
  it('returns null medianZone and sleepAvg when no entries', () => {
    const result = computeStats30([]);
    expect(result.medianZone).toBeNull();
    expect(result.sleepAvg).toBeNull();
    expect(result.recordedDays).toBe(0);
  });

  it('has 30 sparkline slots regardless of entry count', () => {
    expect(computeStats30([]).sparkline).toHaveLength(30);
    expect(computeStats30([makeEntry(0)]).sparkline).toHaveLength(30);
  });

  it('fills null into sparkline for days with no entry', () => {
    const result = computeStats30([makeEntry(0)]);
    // Only today (index 29) should be non-null
    const nonNull = result.sparkline.filter(Boolean);
    expect(nonNull).toHaveLength(1);
  });

  it('computes medianZone correctly for a single entry', () => {
    const result = computeStats30([makeEntry(0, { humeur: 'tristesse' })]);
    expect(result.medianZone.id).toBe('tristesse');
  });

  it('picks the median zone correctly for odd count', () => {
    // 3 entries: tristesse(0), sérénité(1), euphorie(2) — sorted median is sérénité
    const entries = [
      makeEntry(0, { humeur: 'tristesse' }),
      makeEntry(1, { humeur: 'sérénité' }),
      makeEntry(2, { humeur: 'euphorie' }),
    ];
    expect(computeStats30(entries).medianZone.id).toBe('sérénité');
  });

  it('picks the upper value for even count (floor(n/2) selects upper middle)', () => {
    // 2 entries: tristesse(0), sérénité(1)
    // sorted ordinals = [0, 1], Math.floor(2/2) = 1 → sérénité (upper)
    const entries = [
      makeEntry(0, { humeur: 'tristesse' }),
      makeEntry(1, { humeur: 'sérénité' }),
    ];
    expect(computeStats30(entries).medianZone.id).toBe('sérénité');
  });

  it('ignores entries older than 30 days', () => {
    const old = makeEntry(31, { humeur: 'euphorie' });
    const result = computeStats30([old]);
    expect(result.recordedDays).toBe(0);
    expect(result.medianZone).toBeNull();
  });

  it('includes entries at exactly 29 days ago (boundary)', () => {
    const result = computeStats30([makeEntry(29, { humeur: 'euphorie' })]);
    expect(result.recordedDays).toBe(1);
    expect(result.medianZone.id).toBe('euphorie');
  });

  it('calculates sleepAvg correctly', () => {
    const entries = [
      makeEntry(0, { humeur: 'sérénité', sleep: 8 }),
      makeEntry(1, { humeur: 'sérénité', sleep: 6 }),
    ];
    const result = computeStats30(entries);
    expect(result.sleepAvg).toBe('7,0'); // (8+6)/2 = 7.0, comma-formatted
  });

  it('returns null sleepAvg when all entries lack sleep data', () => {
    const result = computeStats30([makeEntry(0)]);
    expect(result.sleepAvg).toBeNull();
  });

  it('excludes null sleep values from the average', () => {
    const entries = [
      makeEntry(0, { humeur: 'sérénité', sleep: 9 }),
      makeEntry(1, { humeur: 'sérénité', sleep: null }),
    ];
    const result = computeStats30(entries);
    expect(result.sleepAvg).toBe('9,0');
  });

  it('produces correct zoneCounts for all humeur types', () => {
    const entries = [
      makeEntry(0, { humeur: 'tristesse' }),
      makeEntry(1, { humeur: 'tristesse' }),
      makeEntry(2, { humeur: 'euphorie' }),
    ];
    const result = computeStats30(entries);
    const tristesse = result.zoneCounts.find(z => z.zone === 'Tristesse');
    const euphorie  = result.zoneCounts.find(z => z.zone === 'Euphorie');
    const serenite  = result.zoneCounts.find(z => z.zone === 'Sérénité');
    expect(tristesse.days).toBe(2);
    expect(euphorie.days).toBe(1);
    expect(serenite.days).toBe(0);
  });

  it('uses moodVal from zone when normMoodTo100 returns null', () => {
    // Entry has humeur but no mood — sparkline should use zone.moodVal
    const entry = makeEntry(0, { humeur: 'euphorie', mood: undefined });
    const result = computeStats30([entry]);
    const lastPoint = result.sparkline[29]; // today is slot 29
    expect(lastPoint).not.toBeNull();
    expect(lastPoint.v).toBe(ARGILE_HUMEUR_OPTS[2].moodVal); // 82
  });
});
