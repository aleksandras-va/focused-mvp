export function FormError({ message }: { message: string }) {
  return (
    <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
      {message}
    </p>
  );
}
