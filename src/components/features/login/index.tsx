import { useTranslations } from 'next-intl';
import { FormSwitch } from '@/components/features/login/form-switch';
import { SignInForm } from '@/components/features/login/sign-in-form';
import { SignUpForm } from '@/components/features/login/sign-up-form';
import { cn } from '@/lib/utils';

interface LoginProps {
  activeForm: 'signin' | 'signup';
  error: { form: 'signin' | 'signup'; message: string } | null;
  minPasswordLength: number;
  signInAction: (formData: FormData) => Promise<void>;
  signUpAction: (formData: FormData) => Promise<void>;
}

export function Login({
  activeForm,
  error,
  minPasswordLength,
  signInAction,
  signUpAction,
}: LoginProps) {
  const t = useTranslations('login');

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 py-4 sm:py-10">
      <div className="flex flex-col items-center gap-2.5 text-center">
        <h1 className="font-heading text-[2rem] leading-tight font-extrabold sm:text-[2.75rem]">
          {t('title')}
        </h1>
        <p className="max-w-md text-muted-foreground max-md:hidden sm:text-lg">{t('subtitle')}</p>
      </div>

      <FormSwitch activeForm={activeForm} className="-mt-4 md:hidden" />

      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-x-10">
        <SignInForm
          action={signInAction}
          error={error?.form === 'signin' ? error.message : null}
          className={cn(activeForm !== 'signin' && 'max-md:hidden')}
        />
        <div aria-hidden className="hidden flex-col items-center gap-3 md:flex">
          <span className="w-px flex-1 bg-border" />
          <span className="text-[0.8125rem] font-medium text-muted-foreground">{t('or')}</span>
          <span className="w-px flex-1 bg-border" />
        </div>
        <SignUpForm
          action={signUpAction}
          error={error?.form === 'signup' ? error.message : null}
          minPasswordLength={minPasswordLength}
          className={cn(activeForm !== 'signup' && 'max-md:hidden')}
        />
      </div>
    </div>
  );
}
