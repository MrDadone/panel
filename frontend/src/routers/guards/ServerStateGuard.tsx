import { Outlet, useLocation } from 'react-router';
import ServerContentContainer from '@/elements/containers/ServerContentContainer.tsx';
import ScreenBlock from '@/elements/ScreenBlock.tsx';
import { isAdmin } from '@/lib/permissions.ts';
import { useAuth } from '@/providers/AuthProvider.tsx';
import { useTranslations } from '@/providers/TranslationProvider.tsx';
import { useServerStore } from '@/stores/server.ts';

export default function ServerStateGuard() {
  const { t } = useTranslations();
  const { user } = useAuth();
  const { server } = useServerStore();
  const location = useLocation();

  if (
    (((server.suspended && !isAdmin(user)) || server.status !== null) &&
      location.pathname !== `/server/${server.uuid}` &&
      location.pathname !== `/server/${server.uuid}/` &&
      location.pathname !== `/server/${server.uuidShort}` &&
      location.pathname !== `/server/${server.uuidShort}/`) ||
    server.nodeMaintenanceEnabled
  ) {
    return (
      <ServerContentContainer title={t('elements.screenBlock.serverConflict.title', {})} hideTitleComponent>
        <ScreenBlock
          title={t('elements.screenBlock.serverConflict.title', {})}
          content={
            server.suspended
              ? t('elements.screenBlock.serverConflict.contentSuspended', {})
              : server.nodeMaintenanceEnabled
                ? t('elements.screenBlock.serverConflict.contentNodeMaintenance', {})
                : server.status === 'install_failed'
                  ? t('elements.screenBlock.serverConflict.contentInstallFailed', {})
                  : server.status === 'installing'
                    ? t('elements.screenBlock.serverConflict.contentInstalling', {})
                    : t('elements.screenBlock.serverConflict.contentRestoringBackup', {})
          }
        />
      </ServerContentContainer>
    );
  }

  return <Outlet />;
}
