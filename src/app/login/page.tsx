import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { getCurrentUser } from '@/services/auth-service';
import { signInAction, signOutAction, signUpAction } from './actions';

export default async function LoginPage({ searchParams }: PageProps<'/login'>) {
  const user = await getCurrentUser();
  const { error, form } = await searchParams;

  if (user) {
    return (
      <div className="mx-auto w-full max-w-md py-8">
        <h1 className="font-heading text-2xl font-semibold">Account</h1>
        <p className="mt-4">
          Signed in as <strong>{user.displayName}</strong> ({user.email})
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {user.store ? `Store: ${user.store.name}` : 'Private seller'}
        </p>
        <form action={signOutAction} className="mt-8">
          <Button type="submit">Sign out</Button>
        </form>
      </div>
    );
  }

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
                minLength={8}
                autoComplete="new-password"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="signup-name">Name</FieldLabel>
              <Input id="signup-name" name="displayName" required />
            </Field>

            <fieldset className="flex flex-col gap-2">
              <legend className="text-sm font-medium">Selling as</legend>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="sellerType" value="private" defaultChecked />
                Private person
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="sellerType" value="store" />
                Store
              </label>
            </fieldset>

            <Field>
              <FieldLabel htmlFor="signup-store-name">
                Store name <span className="text-muted-foreground">(stores only)</span>
              </FieldLabel>
              <Input id="signup-store-name" name="storeName" />
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
