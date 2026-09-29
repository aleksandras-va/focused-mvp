import { ArrowRightIcon } from 'lucide-react';
import Link from 'next/link';
import { PillLink } from '@/components/ui/pill-link';
import type { ModelCategory } from '@/db/tables';
import { CATEGORY_PLURAL_LABELS } from '@/lib/listing-options';

const categories: ModelCategory[] = ['camera', 'lens', 'accessory'];

export function CategoryPills({ active }: { active: ModelCategory | null }) {
  const seeAllHref = active ? `/items?category=${active}` : '/items';

  return (
    <div className="flex items-center justify-between gap-4">
      <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <PillLink href="/" isActive={active === null}>
          All
        </PillLink>
        {categories.map((category) => (
          <PillLink key={category} href={`/?category=${category}`} isActive={active === category}>
            {CATEGORY_PLURAL_LABELS[category]}
          </PillLink>
        ))}
      </nav>

      <Link
        href={seeAllHref}
        className="group flex shrink-0 items-center gap-1 text-base font-medium text-primary"
      >
        See all items
        <ArrowRightIcon className="size-5 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
