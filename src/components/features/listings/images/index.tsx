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
      <div className="flex aspect-4/3 items-center justify-center rounded-2xl border bg-muted">
        <ImageIcon className="size-10 text-muted-foreground/50" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* biome-ignore lint/performance/noImgElement: photos come from R2, not the image optimizer */}
      <img
        src={photos[selectedIndex].largeUrl}
        alt={title}
        className="aspect-4/3 w-full rounded-2xl border bg-muted object-contain"
      />
      {photos.length > 1 ? (
        <Thumbnails photos={photos} selectedIndex={selectedIndex} title={title} onSelect={select} />
      ) : null}
    </div>
  );
}
