import { MessageCircleIcon } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ConversationCard } from '@/components/features/messages/conversation-card';
import { buttonVariants } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import type { ConversationSummary } from '@/services/conversation/conversation.types';

interface InboxProps {
  conversations: ConversationSummary[];
}

export function Inbox({ conversations }: InboxProps) {
  const t = useTranslations('messages');

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <h1 className="font-heading text-3xl leading-tight font-semibold sm:text-4xl">
        {t('title')}
      </h1>

      {conversations.length === 0 ? (
        <EmptyState icon={<MessageCircleIcon />} title={t('empty')} description={t('emptyHint')}>
          <Link href="/" className={buttonVariants({ variant: 'outline' })}>
            {t('browseAds')}
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
