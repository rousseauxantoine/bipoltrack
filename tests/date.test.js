import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { utcDayStr, fmtDateFR, MS_PER_DAY } from '../lib/core.js';

// "Aujourd'hui" est figé à une date UTC fixe pour rendre utcDayStr déterministe.
const TODAY = '2026-05-25';
const fakeNow = new Date(TODAY + 'T12:00:00Z').getTime();

// ── utcDayStr ─────────────────────────────────────────────────────────

describe('utcDayStr', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fakeNow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renvoie la date UTC du jour sans argument', () => {
    expect(utcDayStr()).toBe(TODAY);
  });

  it('renvoie la date UTC du jour pour un offset de 0', () => {
    expect(utcDayStr(0)).toBe(TODAY);
  });

  it('renvoie la veille pour un offset de 1', () => {
    expect(utcDayStr(1)).toBe('2026-05-24');
  });

  it('remonte plusieurs jours en arrière', () => {
    expect(utcDayStr(7)).toBe('2026-05-18');
  });

  it('traverse correctement une frontière de mois', () => {
    expect(utcDayStr(25)).toBe('2026-04-30');
  });

  it('renvoie un futur pour un offset négatif', () => {
    expect(utcDayStr(-1)).toBe('2026-05-26');
  });

  it('renvoie toujours un format ISO YYYY-MM-DD', () => {
    expect(utcDayStr(3)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("reste indépendant de l'heure de la journée (midi figé)", () => {
    vi.setSystemTime(new Date(TODAY + 'T23:59:59Z').getTime());
    expect(utcDayStr(0)).toBe(TODAY);
  });
});

// ── fmtDateFR ─────────────────────────────────────────────────────────

describe('fmtDateFR', () => {
  it('formate une date avec un jour à un chiffre sans zéro initial', () => {
    expect(fmtDateFR('2026-08-03')).toBe('3 août');
  });

  it('formate une date avec un jour à deux chiffres', () => {
    expect(fmtDateFR('2026-01-15')).toBe('15 janv');
  });

  it('utilise les abréviations françaises pour chaque mois', () => {
    const expected = [
      '1 janv', '1 févr', '1 mars', '1 avr', '1 mai', '1 juin',
      '1 juil', '1 août', '1 sept', '1 oct', '1 nov', '1 déc',
    ];
    for (let m = 0; m < 12; m++) {
      const iso = `2026-${String(m + 1).padStart(2, '0')}-01`;
      expect(fmtDateFR(iso)).toBe(expected[m]);
    }
  });

  it('gère le premier jour du mois', () => {
    expect(fmtDateFR('2026-12-01')).toBe('1 déc');
  });

  it('gère le dernier jour du mois', () => {
    expect(fmtDateFR('2026-12-31')).toBe('31 déc');
  });

  it("interprète la date en heure locale (T00:00:00) sans décalage de jour", () => {
    // Parsée comme minuit local, getDate() doit rendre le jour tel quel.
    expect(fmtDateFR('2026-03-09')).toBe('9 mars');
  });
});

// ── MS_PER_DAY (constante de référence) ───────────────────────────────

describe('MS_PER_DAY', () => {
  it('vaut le nombre de millisecondes dans une journée', () => {
    expect(MS_PER_DAY).toBe(24 * 60 * 60 * 1000);
  });
});
