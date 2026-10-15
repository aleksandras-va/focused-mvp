import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface FormSwitchProps {
  activeForm: 'signin' | 'signup';
  className?: string;
}

const OPTIONS = [
  { form: 'signin', label: 'signIn.submit' },
  { form: 'signup', label: 'signUp.submit' },
] as const;

export function FormSwitch({ activeForm, className }: FormSwitchProps) {
  const t = useTranslations('login');

  return (
    <nav aria-label={t('switchLabel')} className={cn('flex rounded-full bg-muted p-1', className)}>
      {OPTIONS.map(({ form, label }) => (
        <Link
          key={form}
          href={`/login?form=${form}`}
          replace
          scroll={false}
          aria-current={form === activeForm ? 'page' : undefined}
          className={cn(
            'flex h-10 flex-1 items-center justify-center rounded-full text-sm font-medium text-muted-foreground transition-colors',
            form === activeForm && 'bg-background text-foreground shadow-sm',
          )}
        >
          {t(label)}
        </Link>
      ))}
    </nav>
  );
}
