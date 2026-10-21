import { DialogContent } from '@/components/ui/dialog';

export function ProfileDialogContent({ children }: { children: React.ReactNode }) {
  return (
    <DialogContent
      showCloseButton={false}
      className="gap-0 rounded-[1.75rem] p-6 sm:max-w-[30rem] sm:p-9 max-sm:inset-0 max-sm:max-w-none max-sm:translate-0 max-sm:content-start max-sm:overflow-y-auto max-sm:overscroll-contain max-sm:rounded-none max-sm:pt-10 max-sm:ring-0"
    >
      {children}
    </DialogContent>
  );
}
