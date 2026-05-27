import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const html = readFileSync(
  fileURLToPath(new URL('../index.html', import.meta.url)),
  'utf8',
);

// Non-régression : la nav du bas (Journal / Carnet / News / Soins / Settings)
// est positionnée en bottom:0 d'un bloc plein écran. Si #root utilise une
// hauteur 100vh seule, la barre d'adresse de Chrome mobile réduit la zone
// visible sans réduire 100vh, et la nav passe sous la barre → invisible.
// 100dvh suit la hauteur visible réelle et corrige le bug tout en restant
// compatible Safari. Ce test verrouille la présence du dvh.
describe('index.html — hauteur du conteneur racine', () => {
  const rootRule = html.match(/#root\s*\{([^}]*)\}/);

  it('définit une règle #root', () => {
    expect(rootRule).not.toBeNull();
  });

  it('utilise 100dvh pour que la nav du bas reste visible sous Chrome mobile', () => {
    expect(rootRule[1]).toMatch(/height:\s*100dvh/);
  });

  it('conserve 100vh en repli pour la compatibilité (Safari/anciens navigateurs)', () => {
    expect(rootRule[1]).toMatch(/height:\s*100vh/);
    // le repli 100vh doit précéder le 100dvh
    expect(rootRule[1].indexOf('100vh')).toBeLessThan(rootRule[1].indexOf('100dvh'));
  });
});
