import { redirect } from 'next/navigation';
import { SellListing } from '@/components/features/sell';
import { getCurrentUser } from '@/services/auth-service';
import { createListingAction, searchModelsAction } from './actions';

export default async function SellPage({ searchParams }: PageProps<'/sell'>) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const { error } = await searchParams;

  return (
    <SellListing
      createAction={createListingAction}
      searchAction={searchModelsAction}
      error={typeof error === 'string' ? error : undefined}
    />
  );
}
