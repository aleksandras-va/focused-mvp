import { redirect } from 'next/navigation';
import { SellListing } from '@/components/features/sell';
import { authService } from '@/services/auth/auth.service';
import { createListingAction, createPhotoUploadAction, searchModelsAction } from './actions';

export default async function SellPage() {
  const user = await authService.getCurrentUserCached();

  if (!user) redirect('/login');

  return (
    <SellListing
      createAction={createListingAction}
      searchAction={searchModelsAction}
      uploadAction={createPhotoUploadAction}
      defaults={{ email: user.email, phone: user.phone ?? '', location: user.location ?? '' }}
    />
  );
}
