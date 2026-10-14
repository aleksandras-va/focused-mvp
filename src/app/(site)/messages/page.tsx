import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Inbox } from '@/components/features/messages';
import { authService } from '@/services/auth/auth.service';
import { conversationService } from '@/services/conversation/conversation.service';

export const metadata: Metadata = { title: 'Messages' };

export default async function MessagesPage() {
  const user = await authService.getCurrentUserCached();

  if (!user) redirect('/login');

  const conversations = await conversationService.getInbox(user.id);

  return <Inbox conversations={conversations} />;
}
