import 'server-only';

export function welcomeEmail(displayName: string) {
  const name = escapeHtml(displayName);

  return {
    subject: 'Welcome to Focused',
    text: [
      `Hi ${displayName},`,
      '',
      'Your Focused account is ready. You can now list your cameras, lenses and accessories.',
      '',
      'Pick the exact model when you sell, so buyers searching for it find your ad.',
      '',
      'Focused',
    ].join('\n'),
    html: [
      `<p>Hi ${name},</p>`,
      '<p>Your Focused account is ready. You can now list your cameras, lenses and accessories.</p>',
      '<p>Pick the exact model when you sell, so buyers searching for it find your ad.</p>',
      '<p>Focused</p>',
    ].join(''),
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
