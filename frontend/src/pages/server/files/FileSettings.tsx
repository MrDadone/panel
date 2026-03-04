import { faCog } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Popover } from '@mantine/core';
import { useEffect } from 'react';
import Button from '@/elements/Button.tsx';
import Checkbox from '@/elements/input/Checkbox.tsx';
import { useFileManager } from '@/providers/FileManagerProvider.tsx';
import { useTranslations } from '@/providers/TranslationProvider.tsx';

export default function FileSettings() {
  const { t } = useTranslations();
  const { clickOnce, setClickOnce } = useFileManager();

  useEffect(() => {
    localStorage.setItem('file_click_once', String(clickOnce));
  }, [clickOnce]);

  return (
    <Popover position='bottom' withArrow shadow='md'>
      <Popover.Target>
        <Button variant='transparent' size='compact-xs'>
          <FontAwesomeIcon size='lg' icon={faCog} />
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        <Checkbox
          label={t('pages.server.files.settings.clickOnce', {})}
          checked={clickOnce}
          onChange={(e) => setClickOnce(e.target.checked)}
        />
      </Popover.Dropdown>
    </Popover>
  );
}
