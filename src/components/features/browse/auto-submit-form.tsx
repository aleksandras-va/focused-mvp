'use client';

import Form from 'next/form';

export function AutoSubmitForm({ children }: { children: React.ReactNode }) {
  return (
    <Form action="/" scroll={false} onChange={(event) => event.currentTarget.requestSubmit()}>
      {children}
    </Form>
  );
}
