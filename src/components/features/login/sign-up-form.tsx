import { useTranslations } from 'next-intl';
import { FormError } from '@/components/features/login/form-error';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/ui/submit-button';
import { cn } from '@/lib/utils';

interface SignUpFormProps {
  action: (formData: FormData) => Promise<void>;
  error: string | null;
  className?: string;
  minPasswordLength: number;
}

export function SignUpForm({ action, error, minPasswordLength, className }: SignUpFormProps) {
  const t = useTranslations('login');

  return (
    <form
      action={action}
      className={cn('flex flex-col gap-5 rounded-[1.75rem] bg-primary-soft p-6 sm:p-9', className)}
    >
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-2xl font-semibold">{t('signUp.title')}</h2>
      </div>
      {error ? <FormError message={error} /> : null}
      <Field>
        <FieldLabel htmlFor="signup-email">{t('email')}</FieldLabel>
        <Input
          id="signup-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={t('emailPlaceholder')}
          className="h-12 rounded-xl bg-background text-base"
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="signup-password">{t('password')}</FieldLabel>
        <Input
          id="signup-password"
          name="password"
          type="password"
          required
          minLength={minPasswordLength}
          autoComplete="new-password"
          className="h-12 rounded-xl bg-background text-base"
        />
        <FieldDescription className="text-foreground/75">
          {t('signUp.passwordHint', { min: minPasswordLength })}
        </FieldDescription>
      </Field>
      <div className="mt-auto flex flex-col gap-3">
        <SubmitButton size="lg">{t('signUp.submit')}</SubmitButton>
      </div>
    </form>
  );
}
