'use server';

import { redirect } from 'next/navigation';
import { AuthError } from '@/services/auth/auth.error';
import { authService } from '@/services/auth/auth.service';

export async function signInAction(formData: FormData) {
  try {
    await authService.signIn({
      email: String(formData.get('email') ?? ''),
      password: String(formData.get('password') ?? ''),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/login?form=signin&error=${encodeURIComponent(error.message)}`);
    }

    throw error;
  }

  redirect('/');
}

export async function signUpAction(formData: FormData) {
  try {
    await authService.signUp({
      email: String(formData.get('email') ?? ''),
      password: String(formData.get('password') ?? ''),
      displayName: String(formData.get('displayName') ?? ''),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/login?form=signup&error=${encodeURIComponent(error.message)}`);
    }

    throw error;
  }

  redirect('/user');
}
