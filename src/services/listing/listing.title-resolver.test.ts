import { createTranslator } from 'next-intl';
import { describe, expect, it } from 'vitest';
import type { ModelCategory } from '@/db/types';
import { formatListingTitle } from '@/lib/listing-title';
import messages from '../../../messages/lt.json';
import { listingTitleResolver } from './listing.title-resolver';

type TitleCase = [items: [name: string, category: ModelCategory][], title: string];

const camera = 'Sony a6000';
const kitLens = 'Sony E 16-50mm f/3.5-5.6';
const zoom = 'Tamron 28-75mm f/2.8 Di III VXD G2';
const prime = 'Sigma 30mm f/1.4 DC DN';
const strap = 'Peak Design Slide';

const t = createTranslator({ locale: 'lt', messages, namespace: 'listingTitle' });

const cases: TitleCase[] = [
  [[], 'Juodraštis be pavadinimo'],
  [[[camera, 'camera']], camera],
  [
    [
      [camera, 'camera'],
      [kitLens, 'lens'],
    ],
    `${camera} + ${kitLens}`,
  ],
  [
    [
      [camera, 'camera'],
      [kitLens, 'lens'],
      [zoom, 'lens'],
    ],
    `${camera} + 2 objektyvai`,
  ],
  [
    [
      [kitLens, 'lens'],
      [camera, 'camera'],
      [strap, 'accessory'],
    ],
    `${camera} + 1 objektyvas + 1 priedas`,
  ],
  [
    [
      [zoom, 'lens'],
      [kitLens, 'lens'],
      [prime, 'lens'],
    ],
    `${zoom} + 2 objektyvai`,
  ],
  [
    [
      [camera, 'camera'],
      [camera, 'camera'],
      [strap, 'accessory'],
      [strap, 'accessory'],
    ],
    `${camera} + 1 fotoaparatas + 2 priedai`,
  ],
];

describe('listingTitleResolver', () => {
  for (const [items, title] of cases) {
    it(`${items.length} items → ${title}`, () => {
      const resolved = listingTitleResolver.resolve(
        items.map(([name, category]) => ({ name, category })),
      );

      expect(formatListingTitle(resolved, t)).toBe(title);
    });
  }
});
