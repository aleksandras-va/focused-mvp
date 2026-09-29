export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-content px-4 pt-[calc(var(--spacing-header)+1.5rem)] pb-16 sm:px-6">
      {children}
    </div>
  );
}
