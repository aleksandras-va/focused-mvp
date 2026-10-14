import { MessageCircleIcon } from 'lucide-react';
import Link from 'next/link';
import { ConversationCard } from '@/components/features/messages/conversation-card';
import { buttonVariants } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import type { ConversationSummary } from '@/services/conversation/conversation.types';

interface InboxProps {
  conversations: ConversationSummary[];
}

export function Inbox({ conversations }: InboxProps) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <h1 className="font-heading text-3xl leading-tight font-extrabold sm:text-4xl">Messages</h1>

      {conversations.length === 0 ? (
        <EmptyState
          icon={<MessageCircleIcon />}
          title="No messages yet"
          description="Message a seller from an ad and the conversation shows up here."
        >
          <Link href="/" className={buttonVariants({ variant: 'outline' })}>
            Browse ads
          </Link>
        </EmptyState>
      ) : (
        <ul className="flex flex-col divide-y rounded-2xl border">
          {conversations.map((conversation) => (
            <li key={conversation.id}>
              <ConversationCard conversation={conversation} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
