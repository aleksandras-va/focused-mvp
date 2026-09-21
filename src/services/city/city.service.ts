import 'server-only';

import { cityRepository } from '@/repositories/city.repository';
import type { City } from './city.types';

export const cityService = {
  getAll(): Promise<City[]> {
    return cityRepository.listAll();
  },
} as const;
