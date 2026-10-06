import { cn } from '@/lib/utils';

interface FormSectionProps {
  step?: number;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function FormSection({
  step,
  title,
  description,
  action,
  className,
  children,
}: FormSectionProps) {
  return (
    <section className={cn('flex flex-col gap-6 rounded-3xl border p-5 sm:p-7', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-baseline gap-3.5">
          {step ? (
            <span className="font-heading text-[1.625rem] leading-none font-extrabold text-primary">
              {step}
            </span>
          ) : null}
          <div className="flex flex-col gap-1">
            <h2 className="font-heading text-[1.375rem] leading-tight font-bold">{title}</h2>
            {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
