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
        'inline-flex h-10 shrink-0 items-center rounded-full px-6 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary text-secondary-foreground'
          : 'bg-muted text-foreground hover:bg-primary/55',
        className,
      )}
    >
      {children}
    </Link>
  );
}
