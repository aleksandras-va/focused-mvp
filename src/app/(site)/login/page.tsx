import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Login } from '@/components/features/login';
import { NOT_INDEXED } from '@/lib/site';
import { MIN_PASSWORD_LENGTH } from '@/services/auth/auth.constants';
import { authService } from '@/services/auth/auth.service';
import type { AuthErrorCode } from '@/services/auth/auth.types';
import { signInAction, signUpAction } from './actions';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('login');

  return { title: t('metaTitle'), robots: NOT_INDEXED };
}

export default async function LoginPage({ searchParams }: PageProps<'/login'>) {
  const user = await authService.getCurrentUserCached();
  const { error, form } = await searchParams;

  if (user) redirect('/user');

  const t = await getTranslations('authErrors');
  const activeForm = form === 'signup' ? 'signup' : 'signin';
  const errorCode =
    typeof error === 'string' && t.has(error as AuthErrorCode) ? (error as AuthErrorCode) : null;

  return (
    <Login
      activeForm={activeForm}
      error={
        errorCode ? { form: activeForm, message: t(errorCode, { min: MIN_PASSWORD_LENGTH }) } : null
      }
      minPasswordLength={MIN_PASSWORD_LENGTH}
      signInAction={signInAction}
      signUpAction={signUpAction}
    />
  );
}
