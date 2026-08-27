import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createType("seller_type")
    .asEnum(["private", "store"])
    .execute();

  await db.schema
    .createTable("users")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn("email", "text", (col) => col.notNull().unique())
    .addColumn("display_name", "text", (col) => col.notNull())
    .addColumn("seller_type", sql`seller_type`, (col) =>
      col.notNull().defaultTo("private"),
    )
    .addColumn("store_name", "text")
    .addColumn("store_slug", "text", (col) => col.unique())
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addCheckConstraint(
      "users_store_fields_check",
      sql`(seller_type = 'store' and store_name is not null and store_slug is not null)
        or (seller_type = 'private' and store_name is null and store_slug is null)`,
    )
    .execute();

  await db.schema
    .createTable("sessions")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn("user_id", "uuid", (col) =>
      col.notNull().references("users.id").onDelete("cascade"),
    )
    .addColumn("expires_at", "timestamptz", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  await db.schema
    .createIndex("sessions_user_id_idx")
    .on("sessions")
    .column("user_id")
    .execute();

  await db.schema
    .createIndex("sessions_expires_at_idx")
    .on("sessions")
    .column("expires_at")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("sessions").execute();
  await db.schema.dropTable("users").execute();
  await db.schema.dropType("seller_type").execute();
}
