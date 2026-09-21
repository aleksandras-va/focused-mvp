import { Badge } from '@/components/ui/badge';

interface DetailRowProps {
  label: string;
  value: string;
  badge?: string | null;
}

export function DetailRow({ label, value, badge }: DetailRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2 text-right font-medium">
        {value}
        {badge ? <Badge variant="secondary">{badge}</Badge> : null}
      </span>
    </div>
  );
}
