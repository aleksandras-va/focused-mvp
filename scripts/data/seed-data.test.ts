import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

type SeedRow = { brand: string; name: string };

const names = readdirSync(import.meta.dirname)
  .filter((file) => file.endsWith('.json'))
  .flatMap(
    (file) => JSON.parse(readFileSync(path.join(import.meta.dirname, file), 'utf8')) as SeedRow[],
  )
  .map((row) => row.name);

describe('seed data names', () => {
  it.fails('write each word in one casing', () => {
    const spellingsByWord = new Map<string, Set<string>>();

    for (const word of names.flatMap((name) => name.split(' '))) {
      const letters = word.replace(/[^A-Za-z]/g, '');
      if (letters.length < 4) continue;

      const spellings = spellingsByWord.get(letters.toLowerCase()) ?? new Set();
      spellingsByWord.set(letters.toLowerCase(), spellings.add(letters));
    }

    const inconsistent = [...spellingsByWord.values()]
      .filter((spellings) => spellings.size > 1)
      .map((spellings) => [...spellings].join(' / '));

    expect(inconsistent).toEqual([]);
  });

  it.fails('write a whole-number aperture without a trailing zero', () => {
    expect(names.filter((name) => /f\/\d+\.0\b/.test(name))).toEqual([]);
  });
});
