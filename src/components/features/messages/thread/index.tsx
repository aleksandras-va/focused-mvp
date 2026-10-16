import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ListingBanner } from '@/components/features/messages/thread/listing-banner';
import { MessageList } from '@/components/features/messages/thread/message-list';
import { ReplyForm } from '@/components/features/messages/thread/reply-form';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ConversationDetail } from '@/services/conversation/conversation.types';

interface ThreadProps {
  conversation: ConversationDetail;
  error: string | null;
  sendAction: (formData: FormData) => Promise<void>;
}

export function Thread({ conversation, error, sendAction }: ThreadProps) {
  const t = useTranslations('messages');

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <div className="flex items-center gap-2">
        <Link
          href="/messages"
          aria-label={t('backToMessages')}
          className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), '-ml-2')}
        >
          <ArrowLeftIcon />
        </Link>
        <h1 className="truncate font-heading text-2xl leading-tight font-semibold sm:text-3xl">
          {conversation.counterpartName}
        </h1>
      </div>

      <ListingBanner listing={conversation.listing} />

      <div className="flex flex-col gap-4 rounded-2xl border p-4">
        <MessageList messages={conversation.messages} />
        <ReplyForm action={sendAction} error={error} />
      </div>
    </div>
  );
}
