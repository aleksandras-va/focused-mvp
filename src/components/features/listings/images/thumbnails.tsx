'use client';

import { cn } from '@/lib/utils';
import type { ListingPhotoUrl } from '@/services/listing/listing.types';

interface ThumbnailsProps {
  photos: ListingPhotoUrl[];
  selectedIndex: number;
  title: string;
  onSelect: (index: number) => void;
}

export function Thumbnails({ photos, selectedIndex, title, onSelect }: ThumbnailsProps) {
  return (
    <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
      {photos.map((photo, index) => (
        <button
          key={photo.largeUrl}
          type="button"
          onClick={() => onSelect(index)}
          className={cn(
            'overflow-hidden rounded-xl ring-2 ring-offset-2 ring-offset-background transition',
            index === selectedIndex ? 'ring-foreground' : 'ring-transparent hover:ring-border',
          )}
        >
          {/* biome-ignore lint/performance/noImgElement: photos come from R2, not the image optimizer */}
          <img
            src={photo.cardUrl}
            alt={title}
            className="aspect-4/3 w-full bg-muted object-cover"
          />
        </button>
      ))}
    </div>
  );
}
