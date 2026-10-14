import 'server-only';

export type AuthErrorCode =
  | 'unauthenticated'
  | 'invalid_email'
  | 'email_taken'
  | 'invalid_credentials'
  | 'password_too_short'
  | 'password_only_numbers'
  | 'password_repetitive'
  | 'password_contains_email';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  phone: string | null;
  cityId: string | null;
  store: { name: string; slug: string } | null;
}

export interface SignUpInput {
  email: string;
  password: string;
  displayName?: string;
}

export interface SignInInput {
  email: string;
  password: string;
}
