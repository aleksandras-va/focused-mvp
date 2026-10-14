import { useTranslations } from 'next-intl';
import { FormError } from '@/components/features/login/form-error';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SignInFormProps {
  action: (formData: FormData) => Promise<void>;
  error: string | null;
  className?: string;
}

export function SignInForm({ action, error, className }: SignInFormProps) {
  const t = useTranslations('login');

  return (
    <form
      action={action}
      className={cn('flex flex-col gap-5 rounded-[1.75rem] border p-6 sm:p-9', className)}
    >
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-2xl font-bold">{t('signIn.title')}</h2>
        <p className="text-sm text-muted-foreground">{t('signIn.subtitle')}</p>
      </div>
      {error ? <FormError message={error} /> : null}
      <Field>
        <FieldLabel htmlFor="signin-email">{t('email')}</FieldLabel>
        <Input
          id="signin-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={t('emailPlaceholder')}
          className="h-12 rounded-xl text-base"
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="signin-password">{t('password')}</FieldLabel>
        <Input
          id="signin-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="h-12 rounded-xl text-base"
        />
      </Field>
      <Button type="submit" size="lg" className="mt-auto">
        {t('signIn.submit')}
      </Button>
    </form>
  );
}
