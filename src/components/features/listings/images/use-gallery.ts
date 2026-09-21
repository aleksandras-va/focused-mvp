'use client';

import { useState } from 'react';

export function useGallery(photoCount: number) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return {
    selectedIndex: selectedIndex < photoCount ? selectedIndex : 0,
    select: setSelectedIndex,
  };
}
