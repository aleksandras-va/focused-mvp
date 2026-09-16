import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { MIN_PASSWORD_LENGTH } from '@/services/auth/auth.constants';
import { authService } from '@/services/auth/auth.service';
import { signInAction, signUpAction } from './actions';

export default async function LoginPage({ searchParams }: PageProps<'/login'>) {
  const user = await authService.getCurrentUserCached();
  const { error, form } = await searchParams;

  if (user) redirect('/user');

  const errorMessage = typeof error === 'string' ? error : null;
  const errorForm = form === 'signup' ? 'signup' : 'signin';

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-8 py-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
        </CardHeader>
        <CardContent>
          {errorMessage && errorForm === 'signin' ? <ErrorNote message={errorMessage} /> : null}
          <form action={signInAction} className="flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="signin-email">Email</FieldLabel>
              <Input id="signin-email" name="email" type="email" required autoComplete="email" />
            </Field>
            <Field>
              <FieldLabel htmlFor="signin-password">Password</FieldLabel>
              <Input
                id="signin-password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
              />
            </Field>
            <Button type="submit" className="mt-2">
              Sign in
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
        </CardHeader>
        <CardContent>
          {errorMessage && errorForm === 'signup' ? <ErrorNote message={errorMessage} /> : null}
          <form action={signUpAction} className="flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="signup-email">Email</FieldLabel>
              <Input id="signup-email" name="email" type="email" required autoComplete="email" />
            </Field>
            <Field>
              <FieldLabel htmlFor="signup-password">Password</FieldLabel>
              <Input
                id="signup-password"
                name="password"
                type="password"
                required
                minLength={MIN_PASSWORD_LENGTH}
                autoComplete="new-password"
              />
              <FieldDescription>
                At least {MIN_PASSWORD_LENGTH} characters, not only numbers.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="signup-name">Name</FieldLabel>
              <Input id="signup-name" name="displayName" required />
            </Field>

            <Button type="submit" className="mt-2">
              Create account
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function ErrorNote({ message }: { message: string }) {
  return (
    <p className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
      {message}
    </p>
  );
}
