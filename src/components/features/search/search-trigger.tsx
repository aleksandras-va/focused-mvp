import { SearchIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchTriggerProps {
  onClick: () => void;
  className?: string;
}

export function SearchTrigger({ onClick, className }: SearchTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group/search relative flex h-10 w-full cursor-pointer items-center justify-center rounded-full bg-muted px-11 text-sm text-muted-foreground transition-[background-color,color,box-shadow] outline-none hover:bg-background hover:text-foreground hover:shadow-[0_0_0_1px_var(--color-input),0_6px_20px_-8px_rgb(0_0_0/0.25)] focus-visible:ring-3 focus-visible:ring-ring/50',
        className,
      )}
    >
      <SearchIcon className="absolute left-4 size-4 transition-colors group-hover/search:text-primary" />
      <span className="truncate">Search cameras, lenses and brands</span>
      <kbd className="absolute right-4 hidden rounded-md border border-current/20 px-1.5 font-sans text-xs lg:inline">
        ⌘K
      </kbd>
    </button>
  );
}
