import { Grid } from '@mantine/core';
import { ServerCan } from '@/elements/Can.tsx';
import ServerContentContainer from '@/elements/containers/ServerContentContainer.tsx';
import { useTranslations } from '@/providers/TranslationProvider.tsx';
import AutokillContainer from './AutokillContainer.tsx';
import AutostartContainer from './AutostartContainer.tsx';
import ReinstallContainer from './ReinstallContainer.tsx';
import RenameContainer from './RenameContainer.tsx';
import TimezoneContainer from './TimezoneContainer.tsx';

export default function ServerSettings() {
  const { t } = useTranslations();

  return (
    <ServerContentContainer title={t('pages.server.settings.title', {})}>
      <Grid grow mt='xs'>
        <ServerCan action='settings.rename'>
          <RenameContainer />
        </ServerCan>
        <ServerCan action='settings.auto-kill'>
          <AutokillContainer />
        </ServerCan>
        <ServerCan action='settings.auto-start'>
          <AutostartContainer />
        </ServerCan>
        <ServerCan action='settings.timezone'>
          <TimezoneContainer />
        </ServerCan>
        <ServerCan action='settings.reinstall'>
          <ReinstallContainer />
        </ServerCan>
      </Grid>
    </ServerContentContainer>
  );
}
