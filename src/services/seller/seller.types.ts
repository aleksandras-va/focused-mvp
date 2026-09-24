import 'server-only';

export interface SellerProfile {
  id: string;
  name: string;
  isStore: boolean;
  city: string | null;
  memberSince: Date;
}
