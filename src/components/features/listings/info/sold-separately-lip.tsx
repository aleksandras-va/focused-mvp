import { TagIcon } from 'lucide-react';

export function SoldSeparatelyLip({ price }: { price: string }) {
  return (
    <div className="flex items-center gap-2 bg-success/12 px-4 py-2.5 text-[0.8125rem] font-semibold text-success sm:px-5">
      <TagIcon className="size-3.5 shrink-0" />
      Also sold on its own · {price}
    </div>
  );
}
