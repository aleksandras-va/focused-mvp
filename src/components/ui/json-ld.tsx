export function JsonLd({ entries }: { entries: object[] }) {
  return entries.map((entry, index) => (
    <script
      // biome-ignore lint/suspicious/noArrayIndexKey: entries are a fixed list rebuilt on every render
      key={index}
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be inlined as script text, with < escaped
      dangerouslySetInnerHTML={{ __html: JSON.stringify(entry).replace(/</g, '\\u003c') }}
    />
  ));
}
