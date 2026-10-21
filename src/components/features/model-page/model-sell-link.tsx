import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ModelSellLinkProps {
  modelName: string;
  className?: string;
}

export function ModelSellLink({ modelName, className }: ModelSellLinkProps) {
  const t = useTranslations('modelPage');

  return (
    <Link href="/sell" className={cn(buttonVariants({ variant: 'outline' }), className)}>
      {t('sellYours', { name: modelName })}
    </Link>
  );
}
