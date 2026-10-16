import { getTranslations } from 'next-intl/server';
import { About } from '@/components/features/about';

export async function generateMetadata() {
  const t = await getTranslations('about');

  return { title: t('eyebrow'), description: t('metaDescription') };
}

export default function AboutPage() {
  return <About />;
}
