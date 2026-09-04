import 'server-only';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { deleteSession, findActiveSession, insertSession } from '@/repositories/session-repository';
import { findStoreByUserId, insertStore, storeSlugExists } from '@/repositories/store-repository';
import { findUserByEmail, findUserById, insertUser } from '@/repositories/user-repository';

const SESSION_COOKIE = 'focused_session';
const SESSION_DAYS = 30;
const BCRYPT_ROUNDS = 12;
const MIN_PASSWORD_LENGTH = 8;

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  phone: string | null;
  store: { name: string; slug: string } | null;
};

export type SignUpInput = {
  email: string;
  password: string;
  displayName: string;
  sellerType: 'private' | 'store';
  storeName?: string;
};

export type SignInInput = {
  email: string;
  password: string;
};

export class AuthError extends Error {}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function reserveStoreSlug(storeName: string) {
  const base = slugify(storeName);
  if (!base) throw new AuthError('Invalid store name.');

  let candidate = base;
  let suffix = 2;
  while (await storeSlugExists(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

async function toAuthUser(row: {
  id: string;
  email: string;
  display_name: string;
  phone: string | null;
}): Promise<AuthUser> {
  const store = await findStoreByUserId(row.id);

  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    phone: row.phone,
    store: store ? { name: store.name, slug: store.slug } : null,
  };
}

async function startSession(userId: string) {
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  const session = await insertSession(userId, expiresAt);

  (await cookies()).set(SESSION_COOKIE, session.id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt,
  });
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
  if (!user) throw new AuthError('Authentication required.');
  return user;
}

export async function signUp(input: SignUpInput): Promise<AuthUser> {
  const email = input.email.trim().toLowerCase();
  const displayName = input.displayName.trim();

  if (!email.includes('@')) throw new AuthError('Invalid email address.');
  if (!displayName) throw new AuthError('Enter your name.');
  if (input.password.length < MIN_PASSWORD_LENGTH) {
    throw new AuthError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }

  const storeName = input.sellerType === 'store' ? input.storeName?.trim() : null;
  if (input.sellerType === 'store' && !storeName) throw new AuthError('Enter a store name.');

  if (await findUserByEmail(email)) {
    throw new AuthError('This email is already registered — sign in instead.');
  }

  const user = await insertUser({
    email,
    display_name: displayName,
    password_hash: await bcrypt.hash(input.password, BCRYPT_ROUNDS),
  });

  if (storeName) {
    await insertStore({
      user_id: user.id,
      name: storeName,
      slug: await reserveStoreSlug(storeName),
    });
  }

  await startSession(user.id);
  return toAuthUser(user);
}

export async function signIn(input: SignInInput): Promise<AuthUser> {
  const email = input.email.trim().toLowerCase();
  const user = await findUserByEmail(email);
  const valid = user !== undefined && (await bcrypt.compare(input.password, user.password_hash));

  if (!valid || user === undefined) throw new AuthError('Invalid email or password.');

  await startSession(user.id);
  return toAuthUser(user);
}

export async function signOut(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

  if (sessionId) await deleteSession(sessionId);
  cookieStore.delete(SESSION_COOKIE);
}
