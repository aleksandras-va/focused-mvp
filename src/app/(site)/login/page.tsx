import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Login } from '@/components/features/login';
import { MIN_PASSWORD_LENGTH } from '@/services/auth/auth.constants';
import { authService } from '@/services/auth/auth.service';
import { signInAction, signUpAction } from './actions';

export const metadata: Metadata = { title: 'Log in' };

export default async function LoginPage({ searchParams }: PageProps<'/login'>) {
  const user = await authService.getCurrentUserCached();
  const { error, form } = await searchParams;

  if (user) redirect('/user');

  const activeForm = form === 'signup' ? 'signup' : 'signin';

  return (
    <Login
      activeForm={activeForm}
      error={typeof error === 'string' ? { form: activeForm, message: error } : null}
      minPasswordLength={MIN_PASSWORD_LENGTH}
      signInAction={signInAction}
      signUpAction={signUpAction}
    />
  );
}
