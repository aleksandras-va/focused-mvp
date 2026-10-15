import { notFound, redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Thread } from '@/components/features/messages/thread';
import { authService } from '@/services/auth/auth.service';
import { MESSAGE_MAX_LENGTH } from '@/services/conversation/conversation.constants';
import { conversationService } from '@/services/conversation/conversation.service';
import type { ConversationErrorCode } from '@/services/conversation/conversation.types';
import { sendMessageAction } from '../actions';

export async function generateMetadata() {
  const t = await getTranslations('common');

  return { title: t('messages') };
}

export default async function ConversationPage({
  params,
  searchParams,
}: PageProps<'/messages/[id]'>) {
  const user = await authService.getCurrentUserCached();

  if (!user) redirect('/login');

  const { id } = await params;
  const { error } = await searchParams;
  const conversation = await conversationService.get(id, user.id);

  if (!conversation) notFound();

  const t = await getTranslations('conversationErrors');
  const errorCode =
    typeof error === 'string' && t.has(error as ConversationErrorCode)
      ? (error as ConversationErrorCode)
      : null;

  return (
    <Thread
      conversation={conversation}
      error={errorCode ? t(errorCode, { max: MESSAGE_MAX_LENGTH }) : null}
      sendAction={sendMessageAction.bind(null, conversation.id)}
    />
  );
}
