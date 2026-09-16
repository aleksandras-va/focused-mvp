import Image from 'next/image';

export type FeaturedPhoto = {
  imageUrl: string;
  width: number;
  height: number;
  place: string;
  takenOn: string;
  gear: string;
};

export function Hero({ photo }: { photo: FeaturedPhoto }) {
  return (
    <figure className="relative mb-10 overflow-hidden rounded-2xl bg-muted">
      <Image
        src={photo.imageUrl}
        alt={`Taken with ${photo.gear} in ${photo.place}`}
        width={photo.width}
        height={photo.height}
        preload
        sizes="(min-width: 1152px) 1104px, 100vw"
        className="h-auto w-full"
      />
      <figcaption className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-2 bg-linear-to-t from-black/70 to-transparent px-6 pt-16 pb-5 text-white">
        <span className="font-heading text-lg font-semibold">{photo.gear}</span>
        <span className="text-sm text-white/80">
          {photo.place}, {photo.takenOn}
        </span>
      </figcaption>
    </figure>
  );
}
