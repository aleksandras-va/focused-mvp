import { ShieldCheckIcon } from 'lucide-react';

export function SafetyNote() {
  return (
    <p className="flex items-start gap-3 rounded-2xl bg-primary-soft p-4 text-sm leading-relaxed text-foreground/80">
      <ShieldCheckIcon className="size-5 shrink-0 text-primary" />
      Meet somewhere public and check the gear before you pay. Never send money in advance.
    </p>
  );
}
