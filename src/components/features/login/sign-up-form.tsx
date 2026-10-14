import { FormError } from '@/components/features/login/form-error';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

interface SignUpFormProps {
  action: (formData: FormData) => Promise<void>;
  error: string | null;
  minPasswordLength: number;
}

export function SignUpForm({ action, error, minPasswordLength }: SignUpFormProps) {
  return (
    <form
      action={action}
      className="flex flex-col gap-5 rounded-[1.75rem] bg-primary-soft p-6 sm:p-9"
    >
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-2xl font-bold">Create an account</h2>
        <p className="text-sm text-foreground/75">Free. Just an email and a password.</p>
      </div>
      {error ? <FormError message={error} /> : null}
      <Field>
        <FieldLabel htmlFor="signup-email">Email</FieldLabel>
        <Input
          id="signup-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="h-12 rounded-xl bg-background text-base"
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="signup-password">Password</FieldLabel>
        <Input
          id="signup-password"
          name="password"
          type="password"
          required
          minLength={minPasswordLength}
          autoComplete="new-password"
          className="h-12 rounded-xl bg-background text-base"
        />
        <FieldDescription className="text-foreground/75">
          At least {minPasswordLength} characters, not only numbers.
        </FieldDescription>
      </Field>
      <div className="mt-auto flex flex-col gap-3">
        <Button type="submit" size="lg">
          Create account
        </Button>
        <p className="text-center text-[0.8125rem] text-foreground/75">
          Next you will add your name, phone and city.
        </p>
      </div>
    </form>
  );
}
