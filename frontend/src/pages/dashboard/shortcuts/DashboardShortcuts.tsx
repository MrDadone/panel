import { faApple, faWindows } from '@fortawesome/free-brands-svg-icons';
import { faFolder, faKeyboard, faTerminal, faTable } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Badge, Card, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import AccountContentContainer from '@/elements/containers/AccountContentContainer.tsx';
import { useTranslations } from '@/providers/TranslationProvider.tsx';

interface ShortcutItemProps {
  keys: string[];
  description: string;
  modifierNote?: string;
}

function ShortcutItem({ keys, description, modifierNote }: ShortcutItemProps) {
  return (
    <Group justify='space-between' py='xs' style={{ borderBottom: '1px solid var(--mantine-color-dark-4)' }}>
      <Text size='sm' c='dimmed'>
        {description}
      </Text>
      <Group gap='xs'>
        {keys.map((key, index) => (
          <span key={index}>
            {index > 0 && (
              <Text component='span' size='xs' c='dimmed' mx={4}>
                +
              </Text>
            )}
            <Badge variant='light' color='gray' size='lg' radius='sm'>
              {key}
            </Badge>
          </span>
        ))}
        {modifierNote && (
          <Text size='xs' c='dimmed'>
            {modifierNote}
          </Text>
        )}
      </Group>
    </Group>
  );
}

interface ShortcutSectionProps {
  title: string;
  icon: typeof faKeyboard;
  shortcuts: ShortcutItemProps[];
}

function ShortcutSection({ title, icon, shortcuts }: ShortcutSectionProps) {
  return (
    <Card withBorder radius='md' p='lg'>
      <Group gap='sm' mb='md'>
        <FontAwesomeIcon icon={icon} className='text-gray-400' />
        <Title order={4} c='white'>
          {title}
        </Title>
      </Group>
      <Stack gap={0}>
        {shortcuts.map((shortcut, index) => (
          <ShortcutItem key={index} {...shortcut} />
        ))}
      </Stack>
    </Card>
  );
}

export default function DashboardShortcuts() {
  const { t } = useTranslations();

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modKey = isMac ? 'Cmd' : 'Ctrl';

  const fileManagerShortcuts: ShortcutItemProps[] = [
    { keys: [modKey, 'K'], description: t('pages.account.shortcuts.fileManager.search', {}) },
    { keys: [modKey, 'A'], description: t('pages.account.shortcuts.fileManager.selectAll', {}) },
    { keys: [modKey, 'Esc'], description: t('pages.account.shortcuts.fileManager.deselectAll', {}) },
    { keys: [modKey, 'X'], description: t('pages.account.shortcuts.fileManager.cutFiles', {}) },
    { keys: [modKey, 'V'], description: t('pages.account.shortcuts.fileManager.pasteFiles', {}) },
    { keys: ['Delete'], description: t('pages.account.shortcuts.fileManager.deleteFiles', {}) },
    { keys: ['D', 'Drag'], description: t('pages.account.shortcuts.fileManager.dragToMove', {}) },
  ];

  const tableShortcuts: ShortcutItemProps[] = [
    { keys: ['\u2190'], description: t('pages.account.shortcuts.table.previousPage', {}) },
    { keys: ['\u2192'], description: t('pages.account.shortcuts.table.nextPage', {}) },
    { keys: ['Shift', '\u2190'], description: t('pages.account.shortcuts.table.firstPage', {}) },
    { keys: ['Shift', '\u2192'], description: t('pages.account.shortcuts.table.lastPage', {}) },
  ];

  const consoleShortcuts: ShortcutItemProps[] = [
    { keys: ['\u2191'], description: t('pages.account.shortcuts.console.previousCommand', {}) },
    { keys: ['\u2193'], description: t('pages.account.shortcuts.console.nextCommand', {}) },
  ];

  return (
    <AccountContentContainer title={t('pages.account.shortcuts.title', {})}>
      <Group justify='space-between' mb='md'>
        <Title order={1} c='white'>
          {t('pages.account.shortcuts.title', {})}
        </Title>
        <Group gap='xs'>
          <FontAwesomeIcon icon={isMac ? faApple : faWindows} className='text-gray-400' />
          <Text size='sm' c='dimmed'>
            {isMac
              ? t('pages.account.shortcuts.detectedMac', {})
              : t('pages.account.shortcuts.detectedWindows', {})}
          </Text>
        </Group>
      </Group>

      <Text c='dimmed' mb='lg'>
        {t('pages.account.shortcuts.description', {})}
      </Text>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing='lg'>
        <ShortcutSection
          title={t('pages.account.shortcuts.fileManager.title', {})}
          icon={faFolder}
          shortcuts={fileManagerShortcuts}
        />
        <ShortcutSection
          title={t('pages.account.shortcuts.table.title', {})}
          icon={faTable}
          shortcuts={tableShortcuts}
        />
        <ShortcutSection
          title={t('pages.account.shortcuts.console.title', {})}
          icon={faTerminal}
          shortcuts={consoleShortcuts}
        />
      </SimpleGrid>
    </AccountContentContainer>
  );
}
