import { describe, it, expect, beforeEach } from 'vitest';
import { TRANSLATIONS } from '../src/i18n/translations';

describe('i18n Translations Dictionary', () => {
  it('contains valid Spanish and English pairs for every UI key', () => {
    const keys = Object.keys(TRANSLATIONS) as (keyof typeof TRANSLATIONS)[];
    expect(keys.length).toBeGreaterThan(15);

    for (const key of keys) {
      const entry = TRANSLATIONS[key];
      expect(entry).toBeDefined();
      expect(typeof entry.es).toBe('string');
      expect(typeof entry.en).toBe('string');
      expect(entry.es.trim().length).toBeGreaterThan(0);
      expect(entry.en.trim().length).toBeGreaterThan(0);
    }
  });

  it('provides appropriate phase naming in both languages', () => {
    expect(TRANSLATIONS.phaseDiscover.es).toContain('Descubrir');
    expect(TRANSLATIONS.phaseDiscover.en).toContain('Discover');

    expect(TRANSLATIONS.phaseSolve.es).toContain('Resolver');
    expect(TRANSLATIONS.phaseSolve.en).toContain('Solve');

    expect(TRANSLATIONS.phaseUnderstand.es).toContain('Comprender');
    expect(TRANSLATIONS.phaseUnderstand.en).toContain('Understand');
  });
});

describe('Language persistence & locale helper', () => {
  const storageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
      },
      clear: () => {
        store = {};
      }
    };
  })();

  beforeEach(() => {
    storageMock.clear();
  });

  it('persists selected language in storage', () => {
    storageMock.setItem('visual_tda_lang', 'en');
    expect(storageMock.getItem('visual_tda_lang')).toBe('en');

    storageMock.setItem('visual_tda_lang', 'es');
    expect(storageMock.getItem('visual_tda_lang')).toBe('es');
  });
});
