import Link from 'next/link';

interface BundleNoticeProps {
  bundleId: string;
  bundleTitle: string;
  soldSeparately: boolean;
}

export function BundleNotice({ bundleId, bundleTitle, soldSeparately }: BundleNoticeProps) {
  return (
    <p className="rounded-lg border bg-muted/50 px-3 py-2 text-sm">
      {soldSeparately ? 'Also sold as part of a bundle: ' : 'Only sold as part of a bundle: '}
      <Link href={`/bundles/${bundleId}`} className="font-medium underline">
        {bundleTitle}
      </Link>
    </p>
  );
}
