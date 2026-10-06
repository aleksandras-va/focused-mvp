'use client';

import { ImageIcon } from 'lucide-react';
import { Thumbnails } from '@/components/features/listings/images/thumbnails';
import { useGallery } from '@/components/features/listings/images/use-gallery';
import type { ListingPhotoUrl } from '@/services/listing/listing.types';

interface GalleryProps {
  photos: ListingPhotoUrl[];
  title: string;
}

export function Gallery({ photos, title }: GalleryProps) {
  const { selectedIndex, select } = useGallery(photos.length);

  if (photos.length === 0) {
    return (
      <div className="flex aspect-4/3 items-center justify-center rounded-3xl bg-muted">
        <ImageIcon className="size-10 text-muted-foreground/50" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative overflow-hidden rounded-3xl bg-muted">
        {/* biome-ignore lint/performance/noImgElement: photos come from R2, not the image optimizer */}
        <img
          src={photos[selectedIndex].largeUrl}
          alt={title}
          className="aspect-4/3 w-full object-contain"
        />
        {photos.length > 1 ? (
          <span className="absolute right-3.5 bottom-3.5 rounded-full bg-foreground/70 px-2.5 py-1 text-xs font-medium text-white">
            {selectedIndex + 1} / {photos.length}
          </span>
        ) : null}
      </div>
      {photos.length > 1 ? (
        <Thumbnails photos={photos} selectedIndex={selectedIndex} title={title} onSelect={select} />
      ) : null}
    </div>
  );
}
