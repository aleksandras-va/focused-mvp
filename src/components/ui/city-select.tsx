'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { City } from '@/services/city/city.types';

interface CitySelectProps {
  cities: City[];
  id?: string;
  name?: string;
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (cityId: string) => void;
}

export function CitySelect({
  cities,
  id,
  name,
  value,
  defaultValue,
  onValueChange,
}: CitySelectProps) {
  return (
    <Select
      id={id}
      name={name}
      value={value}
      defaultValue={defaultValue}
      onValueChange={(next) => onValueChange?.(next ?? '')}
    >
      <SelectTrigger className="w-full">
        <SelectValue>
          {(selected: string | null) =>
            cities.find((city) => city.id === selected)?.name ?? 'Pick a city'
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false} className="max-h-72">
        {cities.map((city) => (
          <SelectItem key={city.id} value={city.id}>
            {city.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
