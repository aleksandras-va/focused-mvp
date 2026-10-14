import { ProfilePrompt } from '@/components/features/account/profile-prompt';
import { accountService } from '@/services/account/account.service';
import { authService } from '@/services/auth/auth.service';
import { cityService } from '@/services/city/city.service';
import { completeProfileAction, skipProfilePromptAction } from '../actions';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const user = await authService.getCurrentUserCached();
  const showProfilePrompt = user ? await accountService.shouldPromptProfile(user) : false;

  return (
    <div className="mx-auto w-full max-w-content px-4 pt-[calc(var(--spacing-header)+1.5rem)] pb-16 sm:px-6">
      {children}
      {user && showProfilePrompt ? (
        <ProfilePrompt
          user={{ displayName: user.displayName, phone: user.phone, cityId: user.cityId }}
          cities={await cityService.getAll()}
          completeAction={completeProfileAction}
          skipAction={skipProfilePromptAction}
        />
      ) : null}
    </div>
  );
}
