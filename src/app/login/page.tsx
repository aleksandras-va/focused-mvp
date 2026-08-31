import { getCurrentUser } from '@/services/auth-service';
import { signInAction, signOutAction } from './actions';

const fieldClass =
  'w-full rounded border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent';

export default async function LoginPage({ searchParams }: PageProps<'/login'>) {
  const user = await getCurrentUser();
  const { error } = await searchParams;

  if (user) {
    return (
      <main className="mx-auto w-full max-w-md px-6 py-16">
        <h1 className="text-2xl font-semibold">Account</h1>
        <p className="mt-4">
          Signed in as <strong>{user.displayName}</strong> ({user.email})
        </p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {user.store ? `Store: ${user.store.name}` : 'Private seller'}
        </p>
        <form action={signOutAction} className="mt-8">
          <button type="submit" className="rounded bg-foreground px-4 py-2 text-background">
            Sign out
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-md px-6 py-16">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Placeholder sign-in without a password. An unknown email creates a new account.
      </p>

      {error ? (
        <p className="mt-4 rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      ) : null}

      <form action={signInAction} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm">Email</span>
          <input type="email" name="email" required autoComplete="email" className={fieldClass} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm">Name</span>
          <input type="text" name="displayName" required className={fieldClass} />
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm">Selling as</legend>
          <label className="flex items-center gap-2">
            <input type="radio" name="sellerType" value="private" defaultChecked />
            <span>Private person</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="sellerType" value="store" />
            <span>Store</span>
          </label>
        </fieldset>

        <label className="flex flex-col gap-1">
          <span className="text-sm">
            Store name
            <span className="text-zinc-500"> (stores only)</span>
          </span>
          <input type="text" name="storeName" className={fieldClass} />
        </label>

        <button type="submit" className="mt-2 rounded bg-foreground px-4 py-2 text-background">
          Sign in
        </button>
      </form>
    </main>
  );
}
