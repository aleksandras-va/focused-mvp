import { PackageIcon } from 'lucide-react';
import Link from 'next/link';

interface BundleNoticeProps {
  bundleId: string;
  bundleTitle: string;
  soldSeparately: boolean;
}

export function BundleNotice({ bundleId, bundleTitle, soldSeparately }: BundleNoticeProps) {
  return (
    <p className="flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm">
      <PackageIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <span>
        {soldSeparately ? 'Also sold as part of a bundle: ' : 'Only sold as part of a bundle: '}
        <Link href={`/bundles/${bundleId}`} className="font-medium underline underline-offset-4">
          {bundleTitle}
        </Link>
      </span>
    </p>
  );
}
