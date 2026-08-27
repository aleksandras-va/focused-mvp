import "server-only";
import { db } from "@/db";

export function listMounts() {
  return db
    .selectFrom("mounts")
    .leftJoin("brands", "brands.id", "mounts.brand_id")
    .select([
      "mounts.id",
      "mounts.slug",
      "mounts.name",
      "brands.name as brand_name",
    ])
    .orderBy("mounts.name")
    .execute();
}
