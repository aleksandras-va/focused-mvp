/**
 * Readable aliases over the generated table types in `./types`.
 *
 * `types.ts` is regenerated from the live database by `pnpm db:codegen`, so
 * anything hand-written lives here instead. These are row shapes, not domain
 * objects — repositories return them, and services map them to DTOs.
 */
import type { Insertable, Selectable, Updateable } from 'kysely';
import type {
  Brand as BrandTable,
  CameraSpec as CameraSpecTable,
  LensSpec as LensSpecTable,
  ListingInclusion as ListingInclusionTable,
  Listing as ListingTable,
  Model as ModelTable,
  Mount as MountTable,
  Session as SessionTable,
  User as UserTable,
} from './types';

export type {
  CameraBodyType,
  CosmeticCondition,
  FunctionalCondition,
  Inclusion,
  ListingStatus,
  ModelCategory,
  SellerType,
  SensorFormat,
} from './types';

export type Brand = Selectable<BrandTable>;
export type Mount = Selectable<MountTable>;

/** A curated catalog entry: "Fujifilm X-T3", not whatever the seller typed. */
export type GearModel = Selectable<ModelTable>;
export type NewGearModel = Insertable<ModelTable>;
export type GearModelUpdate = Updateable<ModelTable>;

export type CameraSpec = Selectable<CameraSpecTable>;
export type LensSpec = Selectable<LensSpecTable>;

export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type UserUpdate = Updateable<UserTable>;

export type Session = Selectable<SessionTable>;
export type NewSession = Insertable<SessionTable>;

export type Listing = Selectable<ListingTable>;
export type NewListing = Insertable<ListingTable>;
export type ListingUpdate = Updateable<ListingTable>;

export type ListingInclusionRow = Selectable<ListingInclusionTable>;
