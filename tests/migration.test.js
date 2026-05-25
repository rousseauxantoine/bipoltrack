import { describe, it, expect } from 'vitest';
import { _migrateEntry, migrateData, BT_SCHEMA_VERSION } from '../lib/core.js';

// ── _migrateEntry ─────────────────────────────────────────────────────

describe('_migrateEntry', () => {
  describe('already-migrated entries (have humeur field)', () => {
    it('returns the entry unchanged', () => {
      const entry = { humeur: 'sérénité', mood: 50, date: '2026-01-01' };
      expect(_migrateEntry(entry, 1)).toBe(entry); // same reference
    });

    it('does not add _migrated_v2 flag to already-migrated entries', () => {
      const entry = { humeur: 'tristesse' };
      expect(_migrateEntry(entry, 1)).not.toHaveProperty('_migrated_v2');
    });
  });

  describe('legacy scale (moodScale = 1: multiply × 10)', () => {
    it('maps low mood (×10 ≤ 35) to tristesse', () => {
      // mood=3 → 30 → tristesse
      expect(_migrateEntry({ mood: 3 }, 1).humeur).toBe('tristesse');
    });

    it('maps mood=3.5 (×10 = 35) to tristesse (boundary)', () => {
      expect(_migrateEntry({ mood: 3.5 }, 1).humeur).toBe('tristesse');
    });

    it('maps mood=4 (×10 = 40) to sérénité', () => {
      expect(_migrateEntry({ mood: 4 }, 1).humeur).toBe('sérénité');
    });

    it('maps mid mood (×10 36–65) to sérénité', () => {
      expect(_migrateEntry({ mood: 5 }, 1).humeur).toBe('sérénité');
    });

    it('maps mood=6.5 (×10 = 65) to sérénité (boundary)', () => {
      expect(_migrateEntry({ mood: 6.5 }, 1).humeur).toBe('sérénité');
    });

    it('maps mood=7 (×10 = 70) to euphorie', () => {
      expect(_migrateEntry({ mood: 7 }, 1).humeur).toBe('euphorie');
    });

    it('maps high mood (×10 > 65) to euphorie', () => {
      expect(_migrateEntry({ mood: 9 }, 1).humeur).toBe('euphorie');
    });

    it('defaults missing mood to 5 (×10 = 50 → sérénité)', () => {
      expect(_migrateEntry({}, 1).humeur).toBe('sérénité');
    });
  });

  describe('current scale (moodScale = 10: values already 0-100)', () => {
    it('maps mood=25 to tristesse', () => {
      expect(_migrateEntry({ mood: 25 }, 10).humeur).toBe('tristesse');
    });

    it('maps mood=50 to sérénité', () => {
      expect(_migrateEntry({ mood: 50 }, 10).humeur).toBe('sérénité');
    });

    it('maps mood=80 to euphorie', () => {
      expect(_migrateEntry({ mood: 80 }, 10).humeur).toBe('euphorie');
    });

    it('defaults missing mood to 50 (sérénité)', () => {
      expect(_migrateEntry({}, 10).humeur).toBe('sérénité');
    });
  });

  describe('pensees inference from anxiety', () => {
    it('anxiety ≤ 4 → clarté', () => {
      expect(_migrateEntry({ mood: 5, anxiety: 0 }, 1).pensees).toBe('clarté');
      expect(_migrateEntry({ mood: 5, anxiety: 4 }, 1).pensees).toBe('clarté');
    });

    it('anxiety 5–7 → confusion', () => {
      expect(_migrateEntry({ mood: 5, anxiety: 5 }, 1).pensees).toBe('confusion');
      expect(_migrateEntry({ mood: 5, anxiety: 7 }, 1).pensees).toBe('confusion');
    });

    it('anxiety > 7 → profusion', () => {
      expect(_migrateEntry({ mood: 5, anxiety: 8 }, 1).pensees).toBe('profusion');
      expect(_migrateEntry({ mood: 5, anxiety: 10 }, 1).pensees).toBe('profusion');
    });

    it('defaults anxiety to 0 (clarté) when missing', () => {
      expect(_migrateEntry({ mood: 5 }, 1).pensees).toBe('clarté');
    });
  });

  describe('energie inference from humeur + sleep', () => {
    it('euphorie + sleep ≤ 5 → agitation (manic pattern)', () => {
      expect(_migrateEntry({ mood: 7, sleep: 4 }, 1).energie).toBe('agitation');
      expect(_migrateEntry({ mood: 7, sleep: 5 }, 1).energie).toBe('agitation');
    });

    it('euphorie + sleep = 6 → épuisement (not agitation, sleep < 7)', () => {
      // mood=7 → 70 → euphorie; sleep=6 → not ≤5, so falls to second condition
      expect(_migrateEntry({ mood: 7, sleep: 6 }, 1).energie).toBe('épuisement');
    });

    it('non-euphorie + sleep < 7 → épuisement', () => {
      expect(_migrateEntry({ mood: 5, sleep: 5 }, 1).energie).toBe('épuisement');
      expect(_migrateEntry({ mood: 3, sleep: 6 }, 1).energie).toBe('épuisement');
    });

    it('any humeur + sleep ≥ 7 → bien-être', () => {
      expect(_migrateEntry({ mood: 5, sleep: 7 }, 1).energie).toBe('bien-être');
      expect(_migrateEntry({ mood: 7, sleep: 8 }, 1).energie).toBe('bien-être');
    });

    it('sleep = null → bien-être (no data, assume fine)', () => {
      expect(_migrateEntry({ mood: 5, sleep: null }, 1).energie).toBe('bien-être');
    });

    it('sleep missing → bien-être', () => {
      expect(_migrateEntry({ mood: 5 }, 1).energie).toBe('bien-être');
    });
  });

  describe('output shape', () => {
    it('preserves all original fields', () => {
      const entry = { mood: 5, date: '2025-01-01', sleep: 7, anxiety: 2, custom: 'x' };
      const result = _migrateEntry(entry, 1);
      expect(result.date).toBe('2025-01-01');
      expect(result.sleep).toBe(7);
      expect(result.custom).toBe('x');
    });

    it('sets _migrated_v2 flag', () => {
      expect(_migrateEntry({ mood: 5 }, 1)._migrated_v2).toBe(true);
    });
  });
});

// ── migrateData ───────────────────────────────────────────────────────

describe('migrateData', () => {
  it('returns raw data unchanged when already at schema v2', () => {
    const raw = { schemaVersion: 2, entries: [] };
    expect(migrateData(raw)).toBe(raw);
  });

  it('returns raw data unchanged when schemaVersion > BT_SCHEMA_VERSION', () => {
    const raw = { schemaVersion: 99, entries: [] };
    expect(migrateData(raw)).toBe(raw);
  });

  it('detects v1 by explicit version=1 and uses legacy scale', () => {
    const raw = {
      version: 1,
      entries: [{ mood: 7, anxiety: 2, sleep: 8 }],
    };
    const result = migrateData(raw);
    // mood=7 legacy → 70 → euphorie
    expect(result.entries[0].humeur).toBe('euphorie');
  });

  it('detects v1 by all moods ≤ 10 and uses legacy scale', () => {
    const raw = {
      entries: [{ mood: 3 }, { mood: 7 }, { mood: 10 }],
    };
    const result = migrateData(raw);
    expect(result.entries[0].humeur).toBe('tristesse'); // 3×10=30
    expect(result.entries[1].humeur).toBe('euphorie');  // 7×10=70
  });

  it('detects non-v1 when any mood > 10 and uses 0-100 scale', () => {
    const raw = {
      entries: [{ mood: 30 }, { mood: 75 }],
    };
    const result = migrateData(raw);
    expect(result.entries[0].humeur).toBe('tristesse'); // 30 → tristesse
    expect(result.entries[1].humeur).toBe('euphorie');  // 75 → euphorie
  });

  it('sets schemaVersion to BT_SCHEMA_VERSION on migrated data', () => {
    const raw = { entries: [{ mood: 5 }] };
    expect(migrateData(raw).schemaVersion).toBe(BT_SCHEMA_VERSION);
  });

  it('preserves existing fields outside entries', () => {
    const raw = {
      entries: [{ mood: 5 }],
      patientName: 'Léa',
      exportedAt: '2025-01-01',
    };
    const result = migrateData(raw);
    expect(result.patientName).toBe('Léa');
    expect(result.exportedAt).toBe('2025-01-01');
  });

  it('handles empty entries array gracefully', () => {
    const raw = { entries: [] };
    const result = migrateData(raw);
    expect(result.entries).toEqual([]);
    expect(result.schemaVersion).toBe(BT_SCHEMA_VERSION);
  });

  it('handles missing entries field gracefully', () => {
    const raw = {};
    const result = migrateData(raw);
    expect(result.entries).toEqual([]);
  });

  it('skips already-migrated entries inside a v1 dataset', () => {
    const migrated = { humeur: 'sérénité', mood: 50 };
    const raw = { version: 1, entries: [migrated] };
    const result = migrateData(raw);
    // _migrateEntry returns the same object reference for already-migrated
    expect(result.entries[0]).toBe(migrated);
  });
});
