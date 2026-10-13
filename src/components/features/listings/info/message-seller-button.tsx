'use client';

import { MessageCircleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessageSellerButtonProps {
  className?: string;
  trackClickAction: () => Promise<void>;
}

export function MessageSellerButton({ className, trackClickAction }: MessageSellerButtonProps) {
  return (
    <Button size="lg" className={className} onClick={() => trackClickAction()}>
      <MessageCircleIcon />
      Message seller
    </Button>
  );
}
