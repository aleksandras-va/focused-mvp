import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Inbox } from '@/components/features/messages';
import { NOT_INDEXED } from '@/lib/site';
import { authService } from '@/services/auth/auth.service';
import { conversationService } from '@/services/conversation/conversation.service';

export async function generateMetadata() {
  const t = await getTranslations('common');

  return { title: t('messages'), robots: NOT_INDEXED };
}

export default async function MessagesPage() {
  const user = await authService.getCurrentUserCached();

  if (!user) redirect('/login');

  const conversations = await conversationService.getInbox(user.id);

  return <Inbox conversations={conversations} />;
}
