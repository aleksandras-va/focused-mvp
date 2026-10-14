'use client';

import { useEffect, useRef } from 'react';
import { formatMessageTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { ConversationMessage } from '@/services/conversation/conversation.types';

interface MessageListProps {
  messages: ConversationMessage[];
}

export function MessageList({ messages }: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0) endRef.current?.scrollIntoView({ block: 'nearest' });
  }, [messages.length]);

  return (
    <ol className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto">
      {messages.map((message) => (
        <li
          key={message.id}
          className={cn('flex flex-col gap-0.5', message.isMine ? 'items-end' : 'items-start')}
        >
          <p
            className={cn(
              'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap break-words',
              message.isMine ? 'bg-primary text-white' : 'bg-muted',
            )}
          >
            {message.body}
          </p>
          <time
            dateTime={message.sentAt.toISOString()}
            className="px-1 text-xs text-muted-foreground"
          >
            {formatMessageTime(message.sentAt)}
          </time>
        </li>
      ))}
      <div ref={endRef} />
    </ol>
  );
}
