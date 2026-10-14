import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { Thread } from '@/components/features/messages/thread';
import { authService } from '@/services/auth/auth.service';
import { conversationService } from '@/services/conversation/conversation.service';
import { sendMessageAction } from '../actions';

export const metadata: Metadata = { title: 'Messages' };

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

  return (
    <Thread
      conversation={conversation}
      error={typeof error === 'string' ? error : null}
      sendAction={sendMessageAction.bind(null, conversation.id)}
    />
  );
}
