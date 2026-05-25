import { describe, it, expect } from 'vitest';
import {
  argileZoneOf,
  normMoodTo100,
  humeurZoneOf,
  ARGILE_ZONES,
  ARGILE_HUMEUR_OPTS,
} from '../lib/core.js';

// ── argileZoneOf ─────────────────────────────────────────────────────

describe('argileZoneOf', () => {
  it('maps 0 to sombre', () => {
    expect(argileZoneOf(0).id).toBe('sombre');
  });

  it('maps 19 to sombre (upper boundary)', () => {
    expect(argileZoneOf(19).id).toBe('sombre');
  });

  it('maps 20 to bas (lower boundary)', () => {
    expect(argileZoneOf(20).id).toBe('bas');
  });

  it('maps 39 to bas (upper boundary)', () => {
    expect(argileZoneOf(39).id).toBe('bas');
  });

  it('maps 40 to stable (lower boundary)', () => {
    expect(argileZoneOf(40).id).toBe('stable');
  });

  it('maps 50 to stable (midpoint)', () => {
    expect(argileZoneOf(50).id).toBe('stable');
  });

  it('maps 59 to stable (upper boundary)', () => {
    expect(argileZoneOf(59).id).toBe('stable');
  });

  it('maps 60 to haut (lower boundary)', () => {
    expect(argileZoneOf(60).id).toBe('haut');
  });

  it('maps 79 to haut (upper boundary)', () => {
    expect(argileZoneOf(79).id).toBe('haut');
  });

  it('maps 80 to brulant (lower boundary)', () => {
    expect(argileZoneOf(80).id).toBe('brulant');
  });

  it('maps 100 to brulant (maximum)', () => {
    expect(argileZoneOf(100).id).toBe('brulant');
  });

  it('returns stable as fallback for out-of-range values', () => {
    // No range covers 101+, fallback is ARGILE_ZONES[2] = stable
    expect(argileZoneOf(200).id).toBe('stable');
  });

  it('returns zone objects with id, label, range, color', () => {
    const zone = argileZoneOf(50);
    expect(zone).toHaveProperty('id');
    expect(zone).toHaveProperty('label');
    expect(zone).toHaveProperty('range');
    expect(zone).toHaveProperty('color');
  });
});

// ── normMoodTo100 ─────────────────────────────────────────────────────

describe('normMoodTo100', () => {
  it('returns null when mood is missing', () => {
    expect(normMoodTo100({})).toBeNull();
    expect(normMoodTo100({ mood: null })).toBeNull();
    expect(normMoodTo100({ mood: undefined })).toBeNull();
  });

  it('multiplies by 10 for legacy scale values (1-10)', () => {
    expect(normMoodTo100({ mood: 1 })).toBe(10);
    expect(normMoodTo100({ mood: 5 })).toBe(50);
    expect(normMoodTo100({ mood: 10 })).toBe(100);
  });

  it('passes through values already on 0-100 scale (> 10)', () => {
    expect(normMoodTo100({ mood: 11 })).toBe(11);
    expect(normMoodTo100({ mood: 50 })).toBe(50);
    expect(normMoodTo100({ mood: 100 })).toBe(100);
  });

  it('rounds when multiplying legacy values with decimals', () => {
    expect(normMoodTo100({ mood: 3.5 })).toBe(35);
    expect(normMoodTo100({ mood: 7.5 })).toBe(75);
  });

  // mood=10 is the exact boundary: 10 * 10 = 100 (legacy) not passed through
  it('treats mood=10 as legacy (boundary is <= 10)', () => {
    expect(normMoodTo100({ mood: 10 })).toBe(100);
  });
});

// ── humeurZoneOf ──────────────────────────────────────────────────────

describe('humeurZoneOf', () => {
  it('returns null for null or undefined entry', () => {
    expect(humeurZoneOf(null)).toBeNull();
    expect(humeurZoneOf(undefined)).toBeNull();
  });

  it('resolves tristesse when entry.humeur matches', () => {
    const zone = humeurZoneOf({ humeur: 'tristesse' });
    expect(zone.id).toBe('tristesse');
  });

  it('resolves sérénité when entry.humeur matches', () => {
    const zone = humeurZoneOf({ humeur: 'sérénité' });
    expect(zone.id).toBe('sérénité');
  });

  it('resolves euphorie when entry.humeur matches', () => {
    const zone = humeurZoneOf({ humeur: 'euphorie' });
    expect(zone.id).toBe('euphorie');
  });

  it('falls back to sérénité for unknown humeur id', () => {
    const zone = humeurZoneOf({ humeur: 'inconnu' });
    expect(zone.id).toBe('sérénité'); // ARGILE_HUMEUR_OPTS[1]
  });

  it('uses mood fallback when no humeur field — value 25 → tristesse', () => {
    expect(humeurZoneOf({ mood: 25 }).id).toBe('tristesse');
  });

  it('uses mood fallback — value 35 → tristesse (boundary)', () => {
    expect(humeurZoneOf({ mood: 35 }).id).toBe('tristesse');
  });

  it('uses mood fallback — value 36 → sérénité', () => {
    expect(humeurZoneOf({ mood: 36 }).id).toBe('sérénité');
  });

  it('uses mood fallback — value 65 → sérénité (boundary)', () => {
    expect(humeurZoneOf({ mood: 65 }).id).toBe('sérénité');
  });

  it('uses mood fallback — value 66 → euphorie', () => {
    expect(humeurZoneOf({ mood: 66 }).id).toBe('euphorie');
  });

  it('uses mood fallback — value 100 → euphorie', () => {
    expect(humeurZoneOf({ mood: 100 }).id).toBe('euphorie');
  });

  it('returns null when no humeur and no mood', () => {
    expect(humeurZoneOf({})).toBeNull();
    expect(humeurZoneOf({ mood: null })).toBeNull();
  });

  it('normalises legacy mood (1-10) before zone lookup', () => {
    // mood=3 (legacy) → 30 → tristesse
    expect(humeurZoneOf({ mood: 3 }).id).toBe('tristesse');
    // mood=7 (legacy) → 70 → euphorie
    expect(humeurZoneOf({ mood: 7 }).id).toBe('euphorie');
  });

  it('humeur field takes priority over mood field', () => {
    // mood would map to euphorie, but humeur wins
    const zone = humeurZoneOf({ humeur: 'tristesse', mood: 90 });
    expect(zone.id).toBe('tristesse');
  });
});
