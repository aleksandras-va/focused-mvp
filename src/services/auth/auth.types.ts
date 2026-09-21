import 'server-only';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  phone: string | null;
  location: string | null;
  store: { name: string; slug: string } | null;
}

export interface SignUpInput {
  email: string;
  password: string;
  displayName: string;
}

export interface SignInInput {
  email: string;
  password: string;
}
