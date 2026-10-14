'use client';

import { MessageCircleIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export type StartConversationResult = { conversationId: string; error: null } | { error: string };

export interface MessageSellerProps {
  isSignedIn: boolean;
  startAction: (body: string) => Promise<StartConversationResult>;
  trackClickAction: () => Promise<void>;
}

interface MessageSellerDialogProps extends MessageSellerProps {
  className?: string;
}

export function MessageSellerDialog({
  className,
  isSignedIn,
  startAction,
  trackClickAction,
}: MessageSellerDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!isSignedIn) {
    return (
      <Link
        href="/login"
        onClick={() => trackClickAction()}
        className={cn(buttonVariants({ size: 'lg' }), className)}
      >
        <MessageCircleIcon />
        Message seller
      </Link>
    );
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError(null);

    const result = await startAction(body);

    if (result.error !== null) {
      setError(result.error);
      setPending(false);
      return;
    }

    router.push(`/messages/${result.conversationId}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button size="lg" className={className} onClick={() => trackClickAction()} />}
      >
        <MessageCircleIcon />
        Message seller
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Message the seller</DialogTitle>
            <DialogDescription>
              Ask about the item or arrange a meeting. The seller gets an email and can reply here.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            name="body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Hi, is this still available?"
            rows={5}
            maxLength={2000}
            autoFocus
            required
          />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button type="submit" disabled={pending || body.trim() === ''}>
              {pending ? 'Sending…' : 'Send'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
