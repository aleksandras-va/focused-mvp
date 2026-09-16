'use server';

import { redirect } from 'next/navigation';
import { AccountError } from '@/services/account/account.error';
import { accountService } from '@/services/account/account.service';
import { authService } from '@/services/auth/auth.service';

export async function updateProfileAction(formData: FormData) {
  const user = await authService.getCurrentUserCached();

  if (!user) redirect('/login');

  try {
    await accountService.updateProfile(user.id, {
      displayName: String(formData.get('displayName') ?? ''),
      phone: String(formData.get('phone') ?? ''),
    });
  } catch (error) {
    if (error instanceof AccountError) {
      redirect(`/user?error=${encodeURIComponent(error.message)}`);
    }

    throw error;
  }

  redirect('/user?saved=profile');
}

export async function openStoreAction(formData: FormData) {
  const user = await authService.getCurrentUserCached();

  if (!user) redirect('/login');

  try {
    await accountService.openStore(user.id, String(formData.get('storeName') ?? ''));
  } catch (error) {
    if (error instanceof AccountError) {
      redirect(`/user?error=${encodeURIComponent(error.message)}`);
    }

    throw error;
  }

  redirect('/user?saved=store');
}

export async function signOutAction() {
  await authService.signOut();

  redirect('/login');
}
