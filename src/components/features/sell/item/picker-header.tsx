import { ArrowLeftIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface PickerHeaderProps {
  title: string;
  onBack: () => void;
  backLabel?: string;
}

export function PickerHeader({ title, onBack, backLabel }: PickerHeaderProps) {
  const tCommon = useTranslations('common');

  return (
    <div className="flex h-14 shrink-0 items-center px-2">
      <button
        type="button"
        onClick={onBack}
        aria-label={backLabel ?? tCommon('back')}
        className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <ArrowLeftIcon className="size-5.5" />
      </button>
      <span className="ml-1 font-heading text-xl font-semibold text-primary-ink">{title}</span>
    </div>
  );
}
