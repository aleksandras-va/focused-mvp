'use client';

import { SendIcon } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ReplyFormProps {
  action: (formData: FormData) => Promise<void>;
  error: string | null;
}

export function ReplyForm({ action, error }: ReplyFormProps) {
  return (
    <form action={action} className="flex flex-col gap-2 border-t pt-4">
      <Textarea
        name="body"
        placeholder="Write a reply…"
        rows={3}
        maxLength={2000}
        required
        onKeyDown={(event) => {
          if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
            event.currentTarget.form?.requestSubmit();
          }
        }}
      />
      <div className="flex items-center justify-between gap-3">
        <p className={cn('text-xs', error ? 'text-destructive' : 'text-muted-foreground')}>
          {error ?? 'The other side gets an email if they have not read your earlier messages.'}
        </p>
        <SendButton />
      </div>
    </form>
  );
}

function SendButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      <SendIcon />
      {pending ? 'Sending…' : 'Send'}
    </Button>
  );
}
