import Image from 'next/image';
import { formatMonth } from '@/lib/format';

export type FeaturedPhoto = {
  imageUrl: string;
  place: string;
  takenOn: string;
  gear: string;
};

export function Hero({ photo }: { photo: FeaturedPhoto }) {
  return (
    <section className="relative h-115 w-full overflow-hidden bg-foreground text-white sm:h-125 2xl:h-145">
      <Image
        src={photo.imageUrl}
        alt={`Taken with ${photo.gear} in ${photo.place}`}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-x-0 top-0 h-44 bg-linear-to-b from-black/55 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-72 bg-linear-to-t from-black/70 via-black/30 to-transparent" />

      <div className="relative mx-auto flex h-full max-w-content flex-col justify-end px-4 pt-header pb-6 sm:px-6">
        <h1 className="font-heading text-3xl font-bold text-balance sm:text-4xl">
          Second-hand camera gear
        </h1>
        <p className="mt-2 max-w-md text-base text-white/80">
          From people who actually shot with it.
        </p>

        <p className="mt-6 flex flex-wrap justify-between gap-x-6 gap-y-1 text-sm text-white/70">
          <span>
            Shot on <span className="text-white">{photo.gear}</span>
          </span>
          <span>
            {photo.place}, {formatMonth(new Date(photo.takenOn))}
          </span>
        </p>
      </div>
    </section>
  );
}
