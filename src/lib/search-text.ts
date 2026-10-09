export type SearchWord = {
  tokens: string[];
  compact: string;
  isNumeric: boolean;
};

const ROMAN_NUMERALS: Record<string, string> = {
  ii: '2',
  iii: '3',
  iv: '4',
  v: '5',
  vi: '6',
  vii: '7',
  viii: '8',
  ix: '9',
};

const IGNORED_TOKENS = new Set(['mark', 'mk', 'mount']);

const TOKEN = /\d+(?:\.\d+)?|[a-z]+/g;
const TRAILING_ROMAN_NUMERAL = /^([a-z]{1,3}?)(iii|ii|iv)$/;
const ZOOM_RANGE = /(\d+)-(\d+)\s*mm/g;
const LENS_SPEC = /\d\s*mm\b|\bf\s*\/?\s*\d|\d\.\d/i;

function canonicalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/(\d)\s*mm\b/g, '$1 ')
    .replace(/\bf\s*\/?\s*(?=\d)/g, ' ')
    .replace(/(\d)\.0\b/g, '$1')
    .replace(/(mark|mk)\s*(?=\d|[ivx]+\b)/g, ' ')
    .replace(/(\d[a-z]?)m(\d)\b/g, '$1 $2');
}

function tokenize(word: string): string[] {
  return (word.match(TOKEN) ?? []).flatMap((token) => {
    if (IGNORED_TOKENS.has(token)) return [];
    if (ROMAN_NUMERALS[token]) return [ROMAN_NUMERALS[token]];

    const [, stem, numeral] = token.match(TRAILING_ROMAN_NUMERAL) ?? [];
    if (!stem) return [token];

    return IGNORED_TOKENS.has(stem) ? [ROMAN_NUMERALS[numeral]] : [stem, ROMAN_NUMERALS[numeral]];
  });
}

export function toSearchText(displayName: string): string {
  const zoomRanges = [...displayName.toLowerCase().matchAll(ZOOM_RANGE)].map(
    ([, wide, tele]) => `${wide}${tele}`,
  );

  return [...canonicalize(displayName).split(/\s+/).flatMap(tokenize), ...zoomRanges].join(' ');
}

export function toSearchTokens(terms: string[]): string[] {
  return terms.flatMap((term) => canonicalize(term).split(/\s+/).flatMap(tokenize));
}

export function mentionsLensSpec(term: string): boolean {
  return LENS_SPEC.test(term);
}

export function toSearchWords(term: string): SearchWord[] {
  return canonicalize(term)
    .split(/\s+/)
    .map(tokenize)
    .filter((tokens) => tokens.length > 0)
    .map((tokens) => ({
      tokens,
      compact: tokens.join(''),
      isNumeric: tokens.every((token) => /^\d/.test(token)),
    }));
}
