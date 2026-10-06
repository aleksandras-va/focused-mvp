import { cn } from '@/lib/utils';

interface SettingsCardProps {
  title: string;
  description: string;
  className?: string;
  children: React.ReactNode;
}

export function SettingsCard({ title, description, className, children }: SettingsCardProps) {
  return (
    <section className={cn('flex min-w-0 flex-col gap-5 rounded-3xl border p-5 sm:p-7', className)}>
      <div className="flex flex-col gap-1">
        <h3 className="font-heading text-xl font-bold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}
