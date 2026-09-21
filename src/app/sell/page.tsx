import { redirect } from 'next/navigation';
import { SellListing } from '@/components/features/sell';
import { authService } from '@/services/auth/auth.service';
import { cityService } from '@/services/city/city.service';
import { createListingAction, createPhotoUploadAction, searchModelsAction } from './actions';

export default async function SellPage() {
  const user = await authService.getCurrentUserCached();

  if (!user) redirect('/login');

  const cities = await cityService.getAll();

  return (
    <SellListing
      createAction={createListingAction}
      searchAction={searchModelsAction}
      uploadAction={createPhotoUploadAction}
      cities={cities}
      defaults={{ email: user.email, phone: user.phone ?? '', cityId: user.cityId ?? '' }}
    />
  );
}
