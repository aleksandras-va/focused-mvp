import Link from 'next/link';
import { cn } from '@/lib/utils';

interface FormSwitchProps {
  activeForm: 'signin' | 'signup';
  className?: string;
}

const OPTIONS = [
  { form: 'signin', label: 'Log in' },
  { form: 'signup', label: 'Create account' },
] as const;

export function FormSwitch({ activeForm, className }: FormSwitchProps) {
  return (
    <nav aria-label="Log in or sign up" className={cn('flex rounded-full bg-muted p-1', className)}>
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
          {label}
        </Link>
      ))}
    </nav>
  );
}
