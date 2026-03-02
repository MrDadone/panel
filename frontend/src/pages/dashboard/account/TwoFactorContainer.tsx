import { faMobilePhone } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TitleCard from '@/elements/TitleCard.tsx';
import { formatTimestamp } from '@/lib/time.ts';
import { useAuth } from '@/providers/AuthProvider.tsx';
import { useTranslations } from '@/providers/TranslationProvider.tsx';
import TwoFactorDisableButton from './actions/TwoFactorDisableButton.tsx';
import TwoFactorSetupButton from './actions/TwoFactorSetupButton.tsx';

export default function TwoFactorContainer() {
  const { t } = useTranslations();
  const { user } = useAuth();

  return (
    <TitleCard
      title={t('pages.account.account.containers.twoFactor.title', {})}
      icon={<FontAwesomeIcon icon={faMobilePhone} />}
      className='h-full order-30'
    >
      <div>
        {user!.totpEnabled
          ? t('pages.account.account.containers.twoFactor.twoFactorEnabled', {}).md()
          : t('pages.account.account.containers.twoFactor.twoFactorDisabled', {}).md()}
        {user?.totpLastUsed && (
          <div className='mt-2 text-sm text-gray-400'>
            {t('pages.account.account.containers.twoFactor.twoFactorLastUsed', {
              date: formatTimestamp(user.totpLastUsed),
            }).md()}
          </div>
        )}
      </div>
      <div className='mt-4'>{user!.totpEnabled ? <TwoFactorDisableButton /> : <TwoFactorSetupButton />}</div>
    </TitleCard>
  );
}
