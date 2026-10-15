'use server';

import { redirect } from 'next/navigation';
import { analyticsService } from '@/services/analytics/analytics.service';
import { AuthError } from '@/services/auth/auth.error';
import { authService } from '@/services/auth/auth.service';

export async function signInAction(formData: FormData) {
  try {
    const user = await authService.signIn({
      email: String(formData.get('email') ?? ''),
      password: String(formData.get('password') ?? ''),
    });

    analyticsService.identify(user);
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/login?form=signin&error=${error.code}`);
    }

    throw error;
  }

  redirect('/');
}

export async function signUpAction(formData: FormData) {
  try {
    const user = await authService.signUp({
      email: String(formData.get('email') ?? ''),
      password: String(formData.get('password') ?? ''),
    });

    analyticsService.identify(user);
    await analyticsService.track(user.id, 'Signed Up', {});
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/login?form=signup&error=${error.code}`);
    }

    throw error;
  }

  redirect('/user');
}
