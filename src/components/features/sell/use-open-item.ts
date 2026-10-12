'use client';

import { useEffect, useRef, useState } from 'react';
import type { SellItem } from '@/components/features/sell/use-sell-listing';

export function useOpenItem(items: SellItem[]) {
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const scrollTargetRef = useRef<HTMLDivElement | null>(null);

  const lastItemId = items[items.length - 1]?.id ?? null;
  const activeItemId =
    openItemId && items.some((item) => item.id === openItemId) ? openItemId : lastItemId;
  const activeIndex = items.findIndex((item) => item.id === activeItemId);
  const scrollTargetId = items[Math.max(activeIndex - 1, 0)]?.id ?? null;
  const itemCount = items.length;
  const previousItemCount = useRef(itemCount);

  useEffect(() => {
    const wasItemAdded = itemCount > previousItemCount.current;

    previousItemCount.current = itemCount;

    if (wasItemAdded) {
      scrollTargetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [itemCount]);

  return {
    activeItemId,
    scrollTargetId,
    scrollTargetRef,
    openItem: setOpenItemId,
    openLastItem: () => setOpenItemId(null),
  };
}
