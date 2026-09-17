import 'server-only';

import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { after } from 'next/server';
import { cache } from 'react';
import { sessionRepository } from '@/repositories/session.repository';
import { userRepository } from '@/repositories/user.repository';
import { emailService } from '../email/email.service';
import { BCRYPT_ROUNDS, SESSION_COOKIE, SESSION_DAYS } from './auth.constants';
import { AuthError } from './auth.error';
import type { AuthUser, SignInInput, SignUpInput } from './auth.types';
import { assertStrongPassword, toAuthUser } from './auth.utils';

export const authService = {
  getCurrentUserCached: cache(async (): Promise<AuthUser | null> => {
    const sessionId = (await cookies()).get(SESSION_COOKIE)?.value;

    if (!sessionId) return null;

    const session = await sessionRepository.findActive(sessionId);

    if (!session) return null;

    const user = await userRepository.findById(session.user_id);

    return user ? toAuthUser(user) : null;
  }),

  async requireUser(): Promise<AuthUser> {
    const user = await this.getCurrentUserCached();

    if (!user) throw new AuthError('Authentication required.');

    return user;
  },

  async signUp(input: SignUpInput): Promise<AuthUser> {
    const email = input.email.trim().toLowerCase();
    const displayName = input.displayName.trim();

    if (!email.includes('@')) throw new AuthError('Invalid email address.');
    if (!displayName) throw new AuthError('Enter your name.');

    assertStrongPassword(input.password, email);

    if (await userRepository.findByEmail(email)) {
      throw new AuthError('This email is already registered — sign in instead.');
    }

    const user = await userRepository.insert({
      email,
      display_name: displayName,
      password_hash: await bcrypt.hash(input.password, BCRYPT_ROUNDS),
    });

    await this.startSession(user.id);

    after(() =>
      emailService.sendWelcome(user.email, user.display_name).catch((error) => {
        console.error('Welcome email failed', error);
      }),
    );

    return toAuthUser(user);
  },

  async signIn(input: SignInInput): Promise<AuthUser> {
    const email = input.email.trim().toLowerCase();
    const user = await userRepository.findByEmail(email);
    const valid = user !== undefined && (await bcrypt.compare(input.password, user.password_hash));

    if (!valid || user === undefined) throw new AuthError('Invalid email or password.');

    await this.startSession(user.id);

    return toAuthUser(user);
  },

  async signOut(): Promise<void> {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

    if (sessionId) await sessionRepository.delete(sessionId);

    cookieStore.delete(SESSION_COOKIE);
  },

  async startSession(userId: string) {
    const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
    const session = await sessionRepository.insert(userId, expiresAt);

    (await cookies()).set(SESSION_COOKIE, session.id, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      expires: expiresAt,
    });
  },
} as const;
