import Image from 'next/image';
import { formatMonth } from '@/lib/format';

export type FeaturedPhoto = {
  imageUrl: string;
  place: string;
  takenOn: string;
  gear: string;
};

export function FeaturedBreak({ photo }: { photo: FeaturedPhoto }) {
  return (
    <figure className="relative h-72 overflow-hidden rounded-3xl bg-foreground text-white sm:h-96">
      <Image
        src={photo.imageUrl}
        alt={`Taken with ${photo.gear} in ${photo.place}`}
        fill
        sizes="(min-width: 1160px) 1112px, 100vw"
        className="object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-black/70 to-transparent" />

      <figcaption className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-x-6 gap-y-1 p-6 text-sm text-white/70 sm:p-8">
        <span className="flex flex-col gap-1">
          <span className="font-heading text-xl font-bold text-white sm:text-2xl">
            Featured photo
          </span>
          <span>
            Shot on <span className="text-white">{photo.gear}</span>
          </span>
        </span>
        <span>
          {photo.place}, {formatMonth(new Date(photo.takenOn))}
        </span>
      </figcaption>
    </figure>
  );
}
