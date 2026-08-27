/**
 * Readable aliases over the generated table types in `./types`.
 *
 * `types.ts` is regenerated from the live database by `pnpm db:codegen`, so
 * anything hand-written lives here instead. These are row shapes, not domain
 * objects — repositories return them, and services map them to DTOs.
 */
import type { Insertable, Selectable, Updateable } from "kysely";
import type {
  Brands,
  CameraSpecs,
  LensSpecs,
  ModelAliases,
  Models,
  Mounts,
  Sessions,
  Users,
} from "./types";

export type {
  CameraBodyType,
  ModelCategory,
  SellerType,
  SensorFormat,
} from "./types";

export type Brand = Selectable<Brands>;
export type Mount = Selectable<Mounts>;

/** A canonical catalog entry: "Fujifilm X-T3", not whatever the seller typed. */
export type GearModel = Selectable<Models>;
export type NewGearModel = Insertable<Models>;
export type GearModelUpdate = Updateable<Models>;

export type CameraSpec = Selectable<CameraSpecs>;
export type LensSpec = Selectable<LensSpecs>;

/** One spelling of a model. `normalized` is computed by the database. */
export type ModelAlias = Selectable<ModelAliases>;
export type NewModelAlias = Insertable<ModelAliases>;

export type User = Selectable<Users>;
export type NewUser = Insertable<Users>;
export type UserUpdate = Updateable<Users>;

export type Session = Selectable<Sessions>;
export type NewSession = Insertable<Sessions>;
