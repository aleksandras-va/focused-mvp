'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { StartConversationResult } from '@/components/features/listings/info/message-seller-dialog';
import { analyticsService } from '@/services/analytics/analytics.service';
import { AuthError } from '@/services/auth/auth.error';
import { authService } from '@/services/auth/auth.service';
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
    if (error instanceof AuthError) return { error: 'Sign in to message the seller.' };
    if (error instanceof ConversationError) return { error: error.message };

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
      redirect(`/messages/${conversationId}?error=${encodeURIComponent(error.message)}`);
    }

    throw error;
  }

  revalidatePath('/messages');
  redirect(`/messages/${conversationId}`);
}
