import { describe, expect, it } from 'vitest';
import { mentionsLensSpec, toSearchText, toSearchWords } from './search-text';

function tokens(term: string): string[] {
  return toSearchWords(term).flatMap((word) => word.tokens);
}

describe('toSearchText', () => {
  it.each([
    ['Fujifilm X-T3', 'fujifilm x t 3'],
    ['Sony A7R III', 'sony a 7 r 3'],
    ['Canon EOS 5D Mark IV', 'canon eos 5 d 4'],
    ['Fujifilm X100VI', 'fujifilm x 100 6'],
    ['Olympus OM-D E-M10 Mark IV', 'olympus om d e m 10 4'],
    ['Canon EF 50mm f/1.8 STM', 'canon ef 50 1.8 stm'],
    ['Canon EF 24-70mm f/2.8L II USM', 'canon ef 24 70 2.8 l 2 usm 2470'],
    ['Fujifilm XF 18-55mm f/2.8-4 R LM OIS', 'fujifilm xf 18 55 2.8 4 r lm ois 1855'],
    ['Samyang 12mm f/2.0 NCS CS', 'samyang 12 2 ncs cs'],
    ['Nikon AF NIKKOR 50mm f/1.8D', 'nikon af nikkor 50 1.8 d'],
    ['Voigtlander NOKTON 40mm f/1.2 Aspherical VM', 'voigtlander nokton 40 1.2 aspherical vm'],
  ])('%s → %s', (displayName, expected) => {
    expect(toSearchText(displayName)).toBe(expected);
  });
});

describe('mentionsLensSpec', () => {
  it.each(['nikon z 50mm', '50 mm', 'f/1.8', 'f2', '35 1.4'])('%s → true', (term) => {
    expect(mentionsLensSpec(term)).toBe(true);
  });

  it.each(['nikon z50', 'a7 3', 'xf 35', 'x100f', 'fuji'])('%s → false', (term) => {
    expect(mentionsLensSpec(term)).toBe(false);
  });
});

describe('toSearchWords', () => {
  it('returns nothing for a term with no letters or digits', () => {
    expect(toSearchWords(' - / ')).toEqual([]);
  });

  it('keeps each typed word together', () => {
    expect(toSearchWords('fuji xt3')).toEqual([
      { tokens: ['fuji'], compact: 'fuji', isNumeric: false },
      { tokens: ['xt', '3'], compact: 'xt3', isNumeric: false },
    ]);
  });

  it('marks a word made only of numbers', () => {
    expect(toSearchWords('24-70 2.8')).toEqual([
      { tokens: ['24', '70'], compact: '2470', isNumeric: true },
      { tokens: ['2.8'], compact: '2.8', isNumeric: true },
    ]);
  });

  it.each([
    ['a7iii', ['a', '7', '3']],
    ['a7riii', ['a', '7', 'r', '3']],
    ['a7r3', ['a', '7', 'r', '3']],
    ['a7m3', ['a', '7', '3']],
    ['a7rm3', ['a', '7', 'r', '3']],
    ['rx100m7', ['rx', '100', '7']],
    ['rx100vii', ['rx', '100', '7']],
    ['griii', ['gr', '3']],
    ['z6ii', ['z', '6', '2']],
    ['5d mark iv', ['5', 'd', '4']],
    ['5d mk4', ['5', 'd', '4']],
    ['5dmkiv', ['5', 'd', '4']],
    ['5d mark', ['5', 'd']],
    ['x100v', ['x', '100', '5']],
    ['em10', ['em', '10']],
    ['e-m10', ['e', 'm', '10']],
    ['m50', ['m', '50']],
  ])('reads %s as %j', (term, expected) => {
    expect(tokens(term)).toEqual(expected);
  });

  it.each([
    ['50mm f/1.8', ['50', '1.8']],
    ['50mm f1.8', ['50', '1.8']],
    ['50 mm f 1.8', ['50', '1.8']],
    ['50 1.8', ['50', '1.8']],
    ['35mm f2', ['35', '2']],
    ['35mm f/2.0', ['35', '2']],
    ['xf35', ['xf', '35']],
    ['rf 50', ['rf', '50']],
    ['voigtländer', ['voigtlander']],
    ['e mount', ['e']],
    ['L-Mount', ['l']],
    ['m4/3', ['m', '4', '3']],
  ])('reads %s as %j', (term, expected) => {
    expect(tokens(term)).toEqual(expected);
  });
});
