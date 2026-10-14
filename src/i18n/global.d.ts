import type messages from '../../messages/lt.json';
import type { LOCALE } from './request';

declare module 'next-intl' {
  interface AppConfig {
    Locale: typeof LOCALE;
    Messages: typeof messages;
  }
}
