import { type Kysely, sql } from "kysely";

/**
 * The gear catalog: canonical models plus the aliases that map whatever a
 * seller types ("Fuji XT3") onto the real thing ("Fujifilm X-T3").
 */
export async function up(db: Kysely<unknown>): Promise<void> {
  // Trigram index support, for fuzzy matching on genuine typos.
  await sql`create extension if not exists pg_trgm`.execute(db);

  await db.schema
    .createType("model_category")
    .asEnum(["camera", "lens"])
    .execute();

  await db.schema
    .createType("camera_body_type")
    .asEnum(["mirrorless", "dslr", "compact"])
    .execute();

  await db.schema
    .createType("sensor_format")
    .asEnum([
      "medium_format",
      "full_frame",
      "aps_c",
      "micro_four_thirds",
      "one_inch",
    ])
    .execute();

  await db.schema
    .createTable("brands")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn("slug", "text", (col) => col.notNull().unique())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  await db.schema
    .createTable("mounts")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn("slug", "text", (col) => col.notNull().unique())
    .addColumn("name", "text", (col) => col.notNull())
    // Null for mounts no single brand owns, e.g. Micro Four Thirds and L-Mount.
    .addColumn("brand_id", "uuid", (col) =>
      col.references("brands.id").onDelete("restrict"),
    )
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  await db.schema
    .createTable("models")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn("category", sql`model_category`, (col) => col.notNull())
    .addColumn("brand_id", "uuid", (col) =>
      col.notNull().references("brands.id").onDelete("restrict"),
    )
    // Null for fixed-lens cameras (X100V, GR III, RX100) — nothing to mount.
    .addColumn("mount_id", "uuid", (col) =>
      col.references("mounts.id").onDelete("restrict"),
    )
    /** Model name without the brand, exactly as the maker writes it: "X-T3". */
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("slug", "text", (col) => col.notNull().unique())
    .addColumn("release_year", "smallint")
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    // Sigma and Tamron ship identically-named lenses per mount, so the mount
    // is part of what makes a model unique. NULLS NOT DISTINCT keeps that
    // true for fixed-lens cameras, which have no mount at all.
    .addUniqueConstraint(
      "models_brand_id_name_mount_id_key",
      ["brand_id", "name", "mount_id"],
      (cb) => cb.nullsNotDistinct(),
    )
    .execute();

  await db.schema
    .createIndex("models_category_idx")
    .on("models")
    .column("category")
    .execute();

  await db.schema
    .createIndex("models_brand_id_idx")
    .on("models")
    .column("brand_id")
    .execute();

  await db.schema
    .createIndex("models_mount_id_idx")
    .on("models")
    .column("mount_id")
    .execute();

  await db.schema
    .createTable("camera_specs")
    .addColumn("model_id", "uuid", (col) =>
      col.primaryKey().references("models.id").onDelete("cascade"),
    )
    .addColumn("body_type", sql`camera_body_type`, (col) => col.notNull())
    .addColumn("sensor_format", sql`sensor_format`, (col) => col.notNull())
    .addColumn("megapixels", "real")
    /** Drives whether the ad form asks for a shutter count. */
    .addColumn("has_mechanical_shutter", "boolean", (col) =>
      col.notNull().defaultTo(true),
    )
    .execute();

  await db.schema
    .createTable("lens_specs")
    .addColumn("model_id", "uuid", (col) =>
      col.primaryKey().references("models.id").onDelete("cascade"),
    )
    /** Primes store the same value in both focal columns. */
    .addColumn("focal_min_mm", "real", (col) => col.notNull())
    .addColumn("focal_max_mm", "real", (col) => col.notNull())
    /** Widest aperture, as a number: f/1.4 is 1.4. */
    .addColumn("max_aperture", "real", (col) => col.notNull())
    .addColumn("has_stabilization", "boolean", (col) =>
      col.notNull().defaultTo(false),
    )
    .addColumn("filter_thread_mm", "smallint")
    .addCheckConstraint(
      "lens_specs_focal_range_check",
      sql`focal_max_mm >= focal_min_mm`,
    )
    .execute();

  await db.schema
    .createTable("model_aliases")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn("model_id", "uuid", (col) =>
      col.notNull().references("models.id").onDelete("cascade"),
    )
    /** How someone might actually write it: "Fuji XT3", "fujifilm x t3". */
    .addColumn("alias", "text", (col) => col.notNull())
    // Computed in the database so seeds, imports, and the app can never
    // disagree about what normalisation means.
    .addColumn("normalized", "text", (col) =>
      col
        .notNull()
        .generatedAlwaysAs(
          sql`lower(regexp_replace(alias, '[^a-zA-Z0-9]+', '', 'g'))`,
        )
        .stored(),
    )
    /** The one alias that is the model's display name. */
    .addColumn("is_canonical", "boolean", (col) =>
      col.notNull().defaultTo(false),
    )
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addUniqueConstraint("model_aliases_model_id_normalized_key", [
      "model_id",
      "normalized",
    ])
    .execute();

  // Exact-match lookup: the fast path for "Fuji XT3" -> X-T3.
  await db.schema
    .createIndex("model_aliases_normalized_idx")
    .on("model_aliases")
    .column("normalized")
    .execute();

  // Fuzzy fallback for typos that normalisation alone will not fix.
  await db.schema
    .createIndex("model_aliases_normalized_trgm_idx")
    .on("model_aliases")
    .using("gin")
    .expression(sql`normalized gin_trgm_ops`)
    .execute();

  await sql`
    create unique index model_aliases_one_canonical_idx
      on model_aliases (model_id)
      where is_canonical
  `.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("model_aliases").execute();
  await db.schema.dropTable("lens_specs").execute();
  await db.schema.dropTable("camera_specs").execute();
  await db.schema.dropTable("models").execute();
  await db.schema.dropTable("mounts").execute();
  await db.schema.dropTable("brands").execute();
  await db.schema.dropType("sensor_format").execute();
  await db.schema.dropType("camera_body_type").execute();
  await db.schema.dropType("model_category").execute();
}
