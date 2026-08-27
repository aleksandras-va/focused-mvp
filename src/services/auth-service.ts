import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import type { SellerType } from "@/db/tables";
import {
  deleteSession,
  findActiveSession,
  insertSession,
} from "@/repositories/session-repository";
import {
  findUserByEmail,
  findUserById,
  insertUser,
  storeSlugExists,
} from "@/repositories/user-repository";

const SESSION_COOKIE = "focused_session";
const SESSION_DAYS = 30;

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  sellerType: SellerType;
  store: { name: string; slug: string } | null;
};

export type SignInInput = {
  email: string;
  displayName: string;
  sellerType: SellerType;
  storeName?: string;
};

export class SignInError extends Error {}

function toAuthUser(row: {
  id: string;
  email: string;
  display_name: string;
  seller_type: SellerType;
  store_name: string | null;
  store_slug: string | null;
}): AuthUser {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    sellerType: row.seller_type,
    store:
      row.store_name && row.store_slug
        ? { name: row.store_name, slug: row.store_slug }
        : null,
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function reserveStoreSlug(storeName: string) {
  const base = slugify(storeName);
  if (!base) throw new SignInError("Invalid store name.");

  let candidate = base;
  let suffix = 2;
  while (await storeSlugExists(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const sessionId = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const session = await findActiveSession(sessionId);
  if (!session) return null;

  const user = await findUserById(session.user_id);
  return user ? toAuthUser(user) : null;
});

export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) throw new SignInError("Authentication required.");
  return user;
}

export async function signIn(input: SignInInput): Promise<AuthUser> {
  const email = input.email.trim().toLowerCase();
  const displayName = input.displayName.trim();

  if (!email.includes("@")) throw new SignInError("Invalid email address.");
  if (!displayName) throw new SignInError("Enter your name.");

  const existing = await findUserByEmail(email);

  const user =
    existing ??
    (await insertUser({
      email,
      display_name: displayName,
      seller_type: input.sellerType,
      store_name: input.sellerType === "store" ? storeName(input) : null,
      store_slug:
        input.sellerType === "store"
          ? await reserveStoreSlug(storeName(input))
          : null,
    }));

  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  const session = await insertSession(user.id, expiresAt);

  (await cookies()).set(SESSION_COOKIE, session.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });

  return toAuthUser(user);
}

function storeName(input: SignInInput) {
  const name = input.storeName?.trim();
  if (!name) throw new SignInError("Enter a store name.");
  return name;
}

export async function signOut(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

  if (sessionId) await deleteSession(sessionId);
  cookieStore.delete(SESSION_COOKIE);
}
