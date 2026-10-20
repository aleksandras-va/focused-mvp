const APPLE_PLATFORM = /mac|iphone|ipad|ipod/i;

function isApplePlatform(): boolean {
  const platform =
    (navigator as Navigator & { userAgentData?: { platform: string } }).userAgentData?.platform ??
    navigator.platform;

  return APPLE_PLATFORM.test(platform);
}

export function searchShortcutLabel(): string {
  return isApplePlatform() ? '⌘K' : 'Ctrl K';
}
