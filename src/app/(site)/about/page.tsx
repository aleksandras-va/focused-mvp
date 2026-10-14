import type { Metadata } from 'next';
import { About } from '@/components/features/about';

export const metadata: Metadata = {
  title: 'Apie mus',
  description: 'Kodėl atsirado exposé ir kuo jis skiriasi nuo bendrų skelbimų portalų.',
};

export default function AboutPage() {
  return <About />;
}
