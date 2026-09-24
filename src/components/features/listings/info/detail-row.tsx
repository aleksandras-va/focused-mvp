import { ChevronRightIcon } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface DetailRowProps {
  label: string;
  value: string;
  badge?: string | null;
  href?: string;
}

export function DetailRow({ label, value, badge, href }: DetailRowProps) {
  const content = (
    <>
      <span className={href ? 'underline-offset-4 group-hover:underline' : undefined}>{value}</span>
      {badge ? <Badge variant="secondary">{badge}</Badge> : null}
      {href ? (
        <ChevronRightIcon className="size-4 text-muted-foreground transition-colors group-hover:text-foreground" />
      ) : null}
    </>
  );

  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      {href ? (
        <Link href={href} className="group flex items-center gap-2 text-right font-medium">
          {content}
        </Link>
      ) : (
        <span className="flex items-center gap-2 text-right font-medium">{content}</span>
      )}
    </div>
  );
}
