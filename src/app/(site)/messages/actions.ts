'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import type { StartConversationResult } from '@/components/features/listings/info/message-seller-dialog';
import { analyticsService } from '@/services/analytics/analytics.service';
import { AuthError } from '@/services/auth/auth.error';
import { authService } from '@/services/auth/auth.service';
import { MESSAGE_MAX_LENGTH } from '@/services/conversation/conversation.constants';
import { ConversationError } from '@/services/conversation/conversation.error';
import { conversationService } from '@/services/conversation/conversation.service';

export async function startConversationAction(
  listingId: string,
  body: string,
): Promise<StartConversationResult> {
  try {
    const user = await authService.requireUser();
    const sent = await conversationService.start(listingId, user.id, body);

    await analyticsService.track(user.id, 'Message Sent', sent);
    revalidatePath('/messages');

    return { conversationId: sent.conversationId, error: null };
  } catch (error) {
    if (error instanceof AuthError) {
      const t = await getTranslations('authErrors');

      return { error: t(error.code) };
    }
    if (error instanceof ConversationError) {
      const t = await getTranslations('conversationErrors');

      return { error: t(error.code, { max: MESSAGE_MAX_LENGTH }) };
    }

    throw error;
  }
}

export async function sendMessageAction(conversationId: string, formData: FormData) {
  const user = await authService.getCurrentUserCached();

  if (!user) redirect('/login');

  try {
    const sent = await conversationService.send(
      conversationId,
      user.id,
      String(formData.get('body') ?? ''),
    );

    await analyticsService.track(user.id, 'Message Sent', sent);
  } catch (error) {
    if (error instanceof ConversationError) {
      redirect(`/messages/${conversationId}?error=${error.code}`);
    }

    throw error;
  }

  revalidatePath('/messages');
  redirect(`/messages/${conversationId}`);
}
