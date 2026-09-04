import { redirect } from 'next/navigation';
import { SellListing } from '@/components/features/sell';
import { getCurrentUser } from '@/services/auth-service';
import { createListingAction, createPhotoUploadAction, searchModelsAction } from './actions';

export default async function SellPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  return (
    <SellListing
      createAction={createListingAction}
      searchAction={searchModelsAction}
      uploadAction={createPhotoUploadAction}
      defaultContact={{ email: user.email, phone: user.phone ?? '' }}
    />
  );
}
