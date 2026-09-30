import Link from 'next/link';
import { cn } from '@/lib/utils';

interface PillLinkProps {
  href: string;
  isActive: boolean;
  className?: string;
  children: React.ReactNode;
}

export function PillLink({ href, isActive, className, children }: PillLinkProps) {
  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'inline-flex h-10 shrink-0 items-center rounded-full px-4 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'bg-secondary text-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_6%)]',
        className,
      )}
    >
      {children}
    </Link>
  );
}
