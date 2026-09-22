import { notFound, redirect } from 'next/navigation';
import { SellListing } from '@/components/features/sell';
import { authService } from '@/services/auth/auth.service';
import { cityService } from '@/services/city/city.service';
import { ListingError } from '@/services/listing/listing.error';
import { listingService } from '@/services/listing/listing.service';
import type { EditableListing } from '@/services/listing/listing.types';
import { createPhotoUploadAction, searchModelsAction, updateListingAction } from '../actions';

export default async function EditListingPage({ params }: PageProps<'/sell/[id]'>) {
  const { id } = await params;
  const user = await authService.getCurrentUserCached();

  if (!user) redirect('/login');

  let listing: EditableListing;

  try {
    listing = await listingService.getForEdit(id, user.id);
  } catch (error) {
    if (error instanceof ListingError) notFound();

    throw error;
  }

  const cities = await cityService.getAll();

  return (
    <SellListing
      submitAction={updateListingAction.bind(null, listing.id)}
      searchAction={searchModelsAction}
      uploadAction={createPhotoUploadAction}
      cities={cities}
      defaults={{ email: user.email, phone: user.phone ?? '', cityId: user.cityId ?? '' }}
      listing={listing}
    />
  );
}
