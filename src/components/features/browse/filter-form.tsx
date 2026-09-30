'use client';

export function FilterForm({ children }: { children: React.ReactNode }) {
  return (
    <form
      method="get"
      action="/items"
      onChange={(event) => event.currentTarget.requestSubmit()}
      className="flex flex-wrap items-center gap-2"
    >
      {children}
    </form>
  );
}
