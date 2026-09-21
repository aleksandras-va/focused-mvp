import 'server-only';
import { db } from '@/db';

export type CityRow = Awaited<ReturnType<typeof cityRepository.listAll>>[number];

export const cityRepository = {
  listAll() {
    return db
      .selectFrom('city')
      .select(['city.id', 'city.slug', 'city.name'])
      .orderBy('city.position')
      .execute();
  },
} as const;
