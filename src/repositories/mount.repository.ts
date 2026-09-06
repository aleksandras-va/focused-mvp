import 'server-only';
import { db } from '@/db';

export const mountRepository = {
  list() {
    return db
      .selectFrom('mount')
      .leftJoin('brand', 'brand.id', 'mount.brand_id')
      .select(['mount.id', 'mount.slug', 'mount.name', 'brand.name as brand_name'])
      .orderBy('mount.name')
      .execute();
  },
} as const;
