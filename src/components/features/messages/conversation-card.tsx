import { ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { UnreadBadge } from '@/components/features/header/unread-badge';
import { formatMessageTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { ConversationSummary } from '@/services/conversation/conversation.types';

interface ConversationCardProps {
  conversation: ConversationSummary;
}

export function ConversationCard({ conversation }: ConversationCardProps) {
  const unread = conversation.unreadCount > 0;

  return (
    <Link
      href={`/messages/${conversation.id}`}
      className="flex items-center gap-4 px-4 py-3.5 transition-colors first:rounded-t-2xl last:rounded-b-2xl hover:bg-muted/60"
    >
      <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted text-muted-foreground">
        {conversation.listing?.coverUrl ? (
          <>
            {/* biome-ignore lint/performance/noImgElement: photos come from R2, not the image optimizer */}
            <img
              src={conversation.listing.coverUrl}
              alt=""
              width={56}
              height={56}
              className="size-full object-cover"
            />
          </>
        ) : (
          <ImageIcon className="size-5" />
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-baseline justify-between gap-3">
          <span className={cn('truncate', unread ? 'font-bold' : 'font-semibold')}>
            {conversation.counterpartName}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatMessageTime(conversation.lastMessageAt)}
          </span>
        </span>
        <span className="truncate text-sm text-muted-foreground">
          {conversation.listing?.title ?? 'Deleted ad'}
        </span>
        <span className="flex items-center justify-between gap-3">
          <span
            className={cn(
              'truncate text-sm',
              unread ? 'font-medium text-foreground' : 'text-muted-foreground',
            )}
          >
            {conversation.lastMessage}
          </span>
          <UnreadBadge count={conversation.unreadCount} />
        </span>
      </span>
    </Link>
  );
}
