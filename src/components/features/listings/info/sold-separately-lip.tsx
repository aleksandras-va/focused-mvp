import { TagIcon } from 'lucide-react';

export function SoldSeparatelyLip() {
  return (
    <div className="flex items-center gap-2 rounded-t-2xl border-b bg-success/15 px-(--card-spacing) py-2.5 text-xs font-medium">
      <TagIcon className="size-3.5 shrink-0" />
      Also sold separately
    </div>
  );
}
