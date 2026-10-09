import { describe, expect, it } from 'vitest';
import { modelCatalogService } from './model-catalog.service';
import type { CatalogModel } from './model-catalog.types';

const GAP = 'known gap';
const RESULT_COUNT = 5;

type Expected = string | RegExp;
type Case = [term: string, expected: Expected, gap?: typeof GAP];
type MountCase = [
  lens: string,
  expected: RegExp,
  mountByWording: Record<string, string>,
  gap?: typeof GAP,
];
type BrandCase = [term: string, brand: string, gap?: typeof GAP];

function search(term: string): Promise<CatalogModel[]> {
  return modelCatalogService.searchModel(term, { limit: RESULT_COUNT });
}

function expectMatch(model: CatalogModel | undefined, expected: Expected) {
  if (typeof expected === 'string') expect(model?.displayName).toBe(expected);
  else expect(model?.displayName ?? '').toMatch(expected);
}

function describeFirstResult(title: string, cases: Case[]) {
  describe(title, () => {
    for (const [term, expected, gap] of cases) {
      (gap ? it.fails : it)(`${term} → ${expected}`, async () => {
        expectMatch((await search(term))[0], expected);
      });
    }
  });
}

function describeEveryResult(title: string, cases: Case[]) {
  describe(title, () => {
    for (const [term, expected, gap] of cases) {
      (gap ? it.fails : it)(`${term} → only ${expected}`, async () => {
        const models = await search(term);

        expect(models).toHaveLength(RESULT_COUNT);
        for (const model of models) expectMatch(model, expected);
      });
    }
  });
}

function describeFirstResultMount(title: string, cases: MountCase[]) {
  describe(title, () => {
    for (const [lens, expected, mountByWording, gap] of cases) {
      const wordings = Object.keys(mountByWording).join(', ');

      (gap ? it.fails : it)(`${lens} + ${wordings}`, async () => {
        for (const [wording, mount] of Object.entries(mountByWording)) {
          const [first] = await search(`${lens} ${wording}`);

          expectMatch(first, expected);
          expect(first?.mount?.slug).toBe(mount);
        }
      });
    }
  });
}

function describeDistinctResults(title: string, cases: [term: string, gap?: typeof GAP][]) {
  describe(title, () => {
    for (const [term, gap] of cases) {
      (gap ? it.fails : it)(term, async () => {
        const names = (await search(term)).map((model) => model.displayName);

        expect(names.length).toBeGreaterThan(1);
        expect(new Set(names).size).toBe(names.length);
      });
    }
  });
}

function describeBrandResult(title: string, cases: BrandCase[]) {
  describe(title, () => {
    for (const [term, brand, gap] of cases) {
      (gap ? it.fails : it)(`${term} → ${brand}`, async () => {
        const { brands } = await modelCatalogService.searchBrandAndModel(term);

        expect(brands.map(({ name }) => name)).toContain(brand);
      });
    }
  });
}

describe('modelCatalogService.searchModel', () => {
  it('returns nothing for a blank term', async () => {
    expect(await modelCatalogService.searchModel('')).toEqual([]);
    expect(await modelCatalogService.searchModel('   ')).toEqual([]);
  });

  it('ignores surrounding whitespace', async () => {
    expect(await search('  xt3  ')).toEqual(await search('xt3'));
  });

  it('maps rows to catalog models', async () => {
    const [model] = await modelCatalogService.searchModel('xt3', { limit: 1 });

    expect(model).toMatchObject({
      slug: 'fujifilm-x-t3',
      category: 'camera',
      name: 'X-T3',
      displayName: 'Fujifilm X-T3',
      brand: { slug: 'fujifilm', name: 'Fujifilm' },
      mount: { slug: 'fujifilm-x', name: 'Fujifilm X' },
      releaseYear: 2018,
      isFilm: false,
    });
  });

  it('returns at most the requested number of models', async () => {
    expect(await modelCatalogService.searchModel('canon', { limit: 3 })).toHaveLength(3);
  });

  it('returns at most 20 models by default', async () => {
    expect(await modelCatalogService.searchModel('canon')).toHaveLength(20);
  });

  it('keeps to the requested category', async () => {
    const lenses = await modelCatalogService.searchModel('canon', { category: 'lens' });

    expect(lenses.length).toBeGreaterThan(0);
    expect(lenses.every((model) => model.category === 'lens')).toBe(true);
  });

  describeFirstResult('finds a model by its name', [
    ['xt3', 'Fujifilm X-T3'],
    ['x-t3', 'Fujifilm X-T3'],
    ['fuji xt3', 'Fujifilm X-T3'],
    ['a7iii', 'Sony A7 III'],
    ['sony a7 iii', 'Sony A7 III'],
    ['canon 5d', 'Canon EOS 5D'],
    ['5d mark iv', 'Canon EOS 5D Mark IV'],
    ['d750', 'Nikon D750'],
    ['gh5', 'Panasonic Lumix GH5'],
    ['panasonic gh5', 'Panasonic Lumix GH5', GAP],
    ['em10', 'Olympus OM-D E-M10'],
    ['x100v', 'Fujifilm X100V'],
    ['x100vi', 'Fujifilm X100VI'],
    ['rx100', 'Sony RX100'],
    ['m50', 'Canon EOS M50'],
    ['90d', 'Canon EOS 90D'],
    ['r6', 'Canon EOS R6'],
    ['r6 mark ii', 'Canon EOS R6 Mark II'],
    ['leica q2', 'Leica Q2'],
    ['leica m10', 'Leica M10'],
    ['helios 44', 'Helios 44-2 58mm f/2'],
    ['nokton 40', /Voigtlander Nokton 40mm/i],
    ['sigma 35 art', /Sigma 35mm .* Art/],
    ['summicron 35', /Summicron.* 35mm/i],
  ]);

  describeFirstResult('reads a digit as a roman numeral or mark', [
    ['a7r3', 'Sony A7R III', GAP],
    ['a7 3', 'Sony A7 III', GAP],
    ['a73', 'Sony A7 III', GAP],
    ['a7iv', 'Sony A7 IV', GAP],
    ['a7 4', 'Sony A7 IV', GAP],
    ['a7c2', 'Sony A7C II', GAP],
    ['5d4', 'Canon EOS 5D Mark IV', GAP],
    ['5d iv', 'Canon EOS 5D Mark IV'],
    ['5d mk4', 'Canon EOS 5D Mark IV', GAP],
    ['5d mark 4', 'Canon EOS 5D Mark IV', GAP],
    ['5dmkiv', 'Canon EOS 5D Mark IV', GAP],
    ['6d2', 'Canon EOS 6D Mark II', GAP],
    ['7d mark 2', 'Canon EOS 7D Mark II'],
    ['r6 2', 'Canon EOS R6 Mark II', GAP],
    ['r6ii', 'Canon EOS R6 Mark II', GAP],
    ['r6 mk2', 'Canon EOS R6 Mark II'],
    ['m50 2', 'Canon EOS M50 Mark II', GAP],
    ['rx100 7', 'Sony RX100 VII', GAP],
    ['rx100vii', 'Sony RX100 VII'],
    ['z6ii', 'Nikon Z6 II', GAP],
    ['z6 2', 'Nikon Z6 II', GAP],
    ['gr3', 'Ricoh GR III', GAP],
    ['gr 3', 'Ricoh GR III', GAP],
    ['griii', 'Ricoh GR III', GAP],
    ['em10 4', 'Olympus OM-D E-M10 Mark IV', GAP],
    ['e-m10 iv', 'Olympus OM-D E-M10 Mark IV', GAP],
    ['em10 mark iv', 'Olympus OM-D E-M10 Mark IV'],
    ['gh5 2', 'Panasonic Lumix GH5 II', GAP],
    ['gh5ii', 'Panasonic Lumix GH5 II', GAP],
    ['s5ii', 'Panasonic Lumix S5 II', GAP],
    ['s5 2', 'Panasonic Lumix S5 II', GAP],
    ['x100 6', 'Fujifilm X100VI', GAP],
  ]);

  describeFirstResult('ignores how the term is spaced and punctuated', [
    ['x t3', 'Fujifilm X-T3', GAP],
    ['xt 3', 'Fujifilm X-T3', GAP],
    ['x-t 3', 'Fujifilm X-T3', GAP],
    ['em 10', 'Olympus OM-D E-M10', GAP],
    ['e m10', 'Olympus OM-D E-M10', GAP],
    ['d 750', 'Nikon D750', GAP],
    ['nikon d 750', 'Nikon D750'],
    ['eosr6', 'Canon EOS R6', GAP],
    ['a 7 iii', 'Sony A7 III', GAP],
    ['rx 100', 'Sony RX100', GAP],
    ['gh 5', 'Panasonic Lumix GH5', GAP],
    ['z 6', 'Nikon Z6', GAP],
    ['x100 v', 'Fujifilm X100V', GAP],
    ['xf35', /Fujifilm XF 35mm/, GAP],
    ['xf 35', /Fujifilm XF 35mm/],
    ['rf50', /Canon RF 50mm/, GAP],
    ['24 70 2.8', /24-70mm f\/2\.8/, GAP],
    ['2470 2.8', /24-70mm f\/2\.8/],
    ['70 200', /70-200mm/, GAP],
    ['18 55', /18-55mm/, GAP],
    ['35 mm f 1.4', /35mm f\/1\.4/],
    ['50mm f/1.8', /50mm f\/1\.8/],
    ['50mm f1.8', /50mm f\/1\.8/],
  ]);

  describeFirstResult('matches focal length and aperture exactly', [
    ['viltrox 35', /Viltrox .*35mm/, GAP],
    ['viltrox 56', /Viltrox .*56mm/, GAP],
    ['sigma 35 1.4', /Sigma 35mm f\/1\.4/, GAP],
    ['50mm 1.8', /50mm f\/1\.8/, GAP],
    ['50 1.8', /50mm f\/1\.8/, GAP],
    ['canon 50 1.8', /Canon .*50mm f\/1\.8/],
    ['canon 85 1.8', /Canon .*85mm f\/1\.8/],
    ['sony 85 1.8', /Sony .*85mm f\/1\.8/, GAP],
    ['nikon 35 1.8', /Nikon .*35mm f\/1\.8/, GAP],
    ['tamron 28-75 2.8', /Tamron 28-75mm f\/2\.8/],
    ['voigtlander 40 1.2', /Voigtlander .*40mm f\/1\.2/, GAP],
    ['70-200 2.8', /70-200mm f\/2\.8/, GAP],
    ['85 1.4', /85mm f\/1\.4/, GAP],
    ['35mm f2', /35mm f\/2(\.0)?(?![.\d])/],
    ['xf 23 f2', /XF 23mm f\/2(?![.\d])/],
    ['samyang 12 f2', /Samyang .*12mm f\/2(\.0)?(?![.\d])/],
    ['z 50 1.8', /NIKKOR Z 50mm f\/1\.8/i, GAP],
    ['rf 50 1.8', /RF 50mm f\/1\.8/],
    ['laowa 15', /Laowa .*15mm/],
    ['7artisans 35 1.4', /7Artisans .*35mm f\/1\.4/, GAP],
    ['sigma 18-35', /Sigma 18-35mm/],
  ]);

  describeEveryResult('keeps other focal lengths and apertures out of the top results', [
    ['viltrox 35', /Viltrox .*35mm/, GAP],
    ['sigma 35 1.4', /Sigma 35mm f\/1\.4/, GAP],
    ['50mm 1.8', /50mm f\/1\.8/, GAP],
    ['85 1.8', /85mm f\/1\.8/, GAP],
    ['70-200 2.8', /70-200mm f\/2\.8/, GAP],
    ['24-70 2.8', /24-70mm f\/2\.8/, GAP],
    ['35 1.4', /35mm f\/1\.4/, GAP],
  ]);

  describeFirstResult('knows other names for a brand, line or model', [
    ['fujinon 35 1.4', /Fujifilm XF 35mm f\/1\.4/, GAP],
    ['fujinon xf 23', /Fujifilm XF 23mm/],
    ['fuji 35 1.4', /Fujifilm XF 35mm f\/1\.4/, GAP],
    ['nikkor z 50', /NIKKOR Z 50mm/i],
    ['nikon z 50mm', /NIKKOR Z 50mm/i],
    ['zuiko 45 1.8', /Zuiko Digital 45mm f\/1\.8/, GAP],
    ['lumix gh5', 'Panasonic Lumix GH5'],
    ['alpha 7 iii', 'Sony A7 III', GAP],
    ['a7m3', 'Sony A7 III', GAP],
    ['ilce-7m3', 'Sony A7 III', GAP],
    ['a7m4', 'Sony A7 IV', GAP],
    ['rx100m7', 'Sony RX100 VII', GAP],
    ['olympus om-1', 'OM System OM-1', GAP],
    ['olympus om5', 'OM System OM-5', GAP],
    ['rokinon 12mm', /Samyang .*12mm/, GAP],
    ['voigtländer nokton 40', /Voigtlander Nokton 40mm/i],
    ['gm 24-70', /FE 24-70mm f\/2\.8 GM/, GAP],
    ['art 35', /Sigma 35mm .* Art/, GAP],
    ['tamron 28-75 g2', /28-75mm f\/2\.8 Di III VXD G2/, GAP],
  ]);

  describeFirstResultMount('prefers the mount named in the term', [
    [
      'viltrox 56 1.4',
      /Viltrox .*56mm f\/1\.4/,
      { sony: 'sony-e', fuji: 'fujifilm-x', 'nikon z': 'nikon-z' },
      GAP,
    ],
    ['viltrox 35', /Viltrox .*35mm/, { fuji: 'fujifilm-x', sony: 'sony-e' }, GAP],
    ['sigma 35 art', /Sigma 35mm .* Art/, { sony: 'sony-e', 'canon ef': 'canon-ef' }, GAP],
    ['sigma 35 1.4', /Sigma 35mm f\/1\.4/, { 'canon ef': 'canon-ef', 'nikon f': 'nikon-f' }, GAP],
    ['sigma 30 1.4', /Sigma 30mm f\/1\.4/, { m43: 'micro-four-thirds', sony: 'sony-e' }, GAP],
    ['sigma 56 1.4', /Sigma 56mm f\/1\.4/, { 'x mount': 'fujifilm-x', 'e mount': 'sony-e' }, GAP],
    ['samyang 12 f2', /Samyang .*12mm/, { 'fuji x': 'fujifilm-x', 'sony e': 'sony-e' }, GAP],
    [
      'ttartisan 35 1.4',
      /TTArtisan .*35mm f\/1\.4/,
      { 'e mount': 'sony-e', fuji: 'fujifilm-x' },
      GAP,
    ],
    ['7artisans 35', /7Artisans .*35mm/, { 'leica m': 'leica-m', sony: 'sony-e' }, GAP],
  ]);

  describeDistinctResults('does not repeat one lens once per mount', [
    ['sigma 35 art', GAP],
    ['viltrox 28', GAP],
    ['samyang 85 1.4'],
    ['tamron 17-70', GAP],
  ]);

  describeFirstResult('forgives a typo', [
    ['cannon 5d', 'Canon EOS 5D'],
    ['nikkon d750', 'Nikon D750'],
    ['fujifilm xt-3', 'Fujifilm X-T3'],
    ['sonny a7 iii', 'Sony A7 III'],
    ['olimpus em10', 'Olympus OM-D E-M10'],
    ['panasonik gh5', 'Panasonic Lumix GH5', GAP],
    ['tamrom 28-75', /Tamron 28-75mm/],
    ['viltorx 35', /Viltrox .*35mm/, GAP],
    ['voigtlender nokton 40', /Voigtlander Nokton 40mm/i],
  ]);

  describeFirstResult('answers while the seller is still typing', [
    ['a7r', 'Sony A7R'],
    ['eos r', 'Canon EOS R'],
    ['x-t', /Fujifilm X-T\d/, GAP],
    ['gh', /Lumix GH\d/],
    ['rx1', /Sony RX1/],
    ['nikon d8', /Nikon D8\d\d/, GAP],
    ['viltr', /Viltrox/],
    ['sigma 3', /Sigma 3\d/],
    ['canon rf 2', /Canon RF 2/],
  ]);

  it('only expects cameras that are in the catalog', async () => {
    const expectedCameras = [
      'Fujifilm X-T3',
      'Fujifilm X100V',
      'Fujifilm X100VI',
      'Sony A7 III',
      'Sony A7 IV',
      'Sony A7R',
      'Sony A7R III',
      'Sony A7C II',
      'Sony RX100',
      'Sony RX100 VII',
      'Canon EOS R',
      'Canon EOS R6',
      'Canon EOS R6 Mark II',
      'Canon EOS 5D',
      'Canon EOS 5D Mark IV',
      'Canon EOS 6D Mark II',
      'Canon EOS 7D Mark II',
      'Canon EOS 90D',
      'Canon EOS M50',
      'Canon EOS M50 Mark II',
      'Nikon D750',
      'Nikon Z6',
      'Nikon Z6 II',
      'Ricoh GR III',
      'Olympus OM-D E-M10',
      'Olympus OM-D E-M10 Mark IV',
      'OM System OM-1',
      'OM System OM-5',
      'Panasonic Lumix GH5',
      'Panasonic Lumix GH5 II',
      'Panasonic Lumix S5 II',
      'Leica Q2',
      'Leica M10',
    ];

    for (const displayName of expectedCameras) {
      const slug = displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      expect((await modelCatalogService.getModel(slug))?.displayName).toBe(displayName);
    }
  });
});

describe('modelCatalogService.searchBrandAndModel', () => {
  it('returns nothing for a blank term', async () => {
    expect(await modelCatalogService.searchBrandAndModel('  ')).toEqual({ brands: [], models: [] });
  });

  it('returns at most 4 brands and 8 models', async () => {
    const { brands, models } = await modelCatalogService.searchBrandAndModel('s');

    expect(brands).toHaveLength(4);
    expect(brands.every((brand) => brand.name.toLowerCase().startsWith('s'))).toBe(true);
    expect(models.length).toBeLessThanOrEqual(8);
  });

  it('returns models alongside the brand', async () => {
    const { brands, models } = await modelCatalogService.searchBrandAndModel('canon');

    expect(brands).toEqual([{ slug: 'canon', name: 'Canon' }]);
    expect(models).toHaveLength(8);
    expect(models.every((model) => model.brand.slug === 'canon')).toBe(true);
  });

  it('returns only models when no brand matches the term', async () => {
    const { brands, models } = await modelCatalogService.searchBrandAndModel('xt3');

    expect(brands).toEqual([]);
    expect(models[0].displayName).toBe('Fujifilm X-T3');
  });

  describeBrandResult('finds a brand by the start of its name', [
    ['fuji', 'Fujifilm'],
    ['FUJI', 'Fujifilm'],
    ['voigt', 'Voigtlander'],
    ['om', 'OM System'],
    ['7art', '7Artisans'],
    ['laowa', 'Laowa'],
  ]);

  describeBrandResult('finds a brand by another name, a typo or inside a longer term', [
    ['fujinon', 'Fujifilm', GAP],
    ['nikkor', 'Nikon', GAP],
    ['lumix', 'Panasonic', GAP],
    ['zuiko', 'Olympus', GAP],
    ['rokinon', 'Samyang', GAP],
    ['voigtländer', 'Voigtlander', GAP],
    ['cannon', 'Canon', GAP],
    ['nikkon', 'Nikon', GAP],
    ['sony a7', 'Sony', GAP],
    ['canon 50 1.8', 'Canon', GAP],
  ]);
});
