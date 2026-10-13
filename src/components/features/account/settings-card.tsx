import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SettingsCardProps {
  title: string;
  description: string;
  className?: string;
  comingSoon?: boolean;
  children: React.ReactNode;
}

export function SettingsCard({
  title,
  description,
  className,
  comingSoon = false,
  children,
}: SettingsCardProps) {
  return (
    <section className={cn('relative min-w-0 rounded-3xl border p-5 sm:p-7', className)}>
      {comingSoon ? (
        <Badge
          variant="secondary"
          className="absolute top-5 right-5 bg-success/10 text-success sm:top-7 sm:right-7"
        >
          Coming soon
        </Badge>
      ) : null}
      <div
        inert={comingSoon}
        className={cn('flex flex-col gap-5', comingSoon && 'opacity-50 grayscale select-none')}
      >
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-xl font-bold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {children}
      </div>
    </section>
  );
}
