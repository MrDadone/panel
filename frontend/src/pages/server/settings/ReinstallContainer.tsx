import { faCog } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Grid, Group, Stack } from '@mantine/core';
import { useState } from 'react';
import Button from '@/elements/Button.tsx';
import TitleCard from '@/elements/TitleCard.tsx';
import { useTranslations } from '@/providers/TranslationProvider.tsx';
import SettingsReinstallModal from './modals/SettingsReinstallModal.tsx';

export default function ReinstallContainer() {
  const { t } = useTranslations();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
      <TitleCard
        title={t('pages.server.settings.reinstall.title', {})}
        icon={<FontAwesomeIcon icon={faCog} />}
        className='h-full'
      >
        <SettingsReinstallModal opened={modalOpen} onClose={() => setModalOpen(false)} />

        <Stack>
          {t('pages.server.settings.reinstall.content', {}).md()}

          <Group mt='auto'>
            <Button color='red' onClick={() => setModalOpen(true)}>
              {t('pages.server.settings.reinstall.button', {})}
            </Button>
          </Group>
        </Stack>
      </TitleCard>
    </Grid.Col>
  );
}
