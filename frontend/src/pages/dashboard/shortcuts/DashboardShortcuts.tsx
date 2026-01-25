import { faApple, faWindows } from '@fortawesome/free-brands-svg-icons';
import {
  faArrowDown,
  faArrowLeft,
  faArrowRight,
  faArrowUp,
  faFolder,
  faServer,
  faTable,
  faTerminal,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Card, Flex, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import AccountContentContainer from '@/elements/containers/AccountContentContainer.tsx';
import { useTranslations } from '@/providers/TranslationProvider.tsx';

interface KeyProps {
  children: React.ReactNode;
  icon?: IconDefinition;
}

function Key({ children, icon }: KeyProps) {
  return (
    <Box
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 42,
        height: 30,
        background: 'linear-gradient(180deg, var(--mantine-color-dark-5) 0%, var(--mantine-color-dark-6) 100%)',
        border: '1px solid var(--mantine-color-dark-4)',
        borderRadius: 6,
        boxShadow: '0 2px 0 var(--mantine-color-dark-7), inset 0 1px 0 rgba(255,255,255,0.05)',
        fontSize: 11,
        fontWeight: 600,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: 'var(--mantine-color-gray-3)',
        textTransform: 'uppercase',
        letterSpacing: '0.02em',
      }}
    >
      {icon ? <FontAwesomeIcon icon={icon} size='sm' /> : children}
    </Box>
  );
}

interface ShortcutItemProps {
  keys: (string | { icon: IconDefinition })[];
  description: string;
  hideBorder?: boolean;
}

function ShortcutItem({ keys, description, hideBorder }: ShortcutItemProps) {
  return (
    <Flex
      align='center'
      justify='space-between'
      py='sm'
      px='xs'
      style={{
        borderBottom: hideBorder ? 'none' : '1px solid var(--mantine-color-dark-5)',
      }}
    >
      <Text size='sm' c='gray.4'>
        {description}
      </Text>
      <Flex align='center' justify='flex-end' gap={6} style={{ minWidth: 120 }}>
        {keys.map((key, index) => (
          <Flex key={index} align='center' gap={6}>
            {index > 0 && (
              <Text size='xs' c='dark.3' fw={500}>
                +
              </Text>
            )}
            {typeof key === 'string' ? <Key>{key}</Key> : <Key icon={key.icon}>{null}</Key>}
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
}

interface ShortcutSectionProps {
  title: string;
  icon: IconDefinition;
  shortcuts: ShortcutItemProps[];
}

function ShortcutSection({ title, icon, shortcuts }: ShortcutSectionProps) {
  return (
    <Card withBorder radius='md' p={0} bg='dark.7'>
      <Box
        px='md'
        py='sm'
        style={{
          borderBottom: '1px solid var(--mantine-color-dark-5)',
          background: 'var(--mantine-color-dark-6)',
        }}
      >
        <Group gap='sm'>
          <Box
            style={{
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 6,
              background: 'var(--mantine-color-dark-5)',
            }}
          >
            <FontAwesomeIcon icon={icon} size='sm' style={{ color: 'var(--mantine-color-gray-5)' }} />
          </Box>
          <Title order={5} c='gray.2' fw={600}>
            {title}
          </Title>
        </Group>
      </Box>
      <Stack gap={0} px='sm'>
        {shortcuts.map((shortcut, index) => (
          <ShortcutItem key={index} {...shortcut} hideBorder={index === shortcuts.length - 1} />
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
    { keys: ['Del'], description: t('pages.account.shortcuts.fileManager.deleteFiles', {}) },
    { keys: ['D', 'Drag'], description: t('pages.account.shortcuts.fileManager.dragToMove', {}) },
  ];

  const tableShortcuts: ShortcutItemProps[] = [
    { keys: [{ icon: faArrowLeft }], description: t('pages.account.shortcuts.table.previousPage', {}) },
    { keys: [{ icon: faArrowRight }], description: t('pages.account.shortcuts.table.nextPage', {}) },
    { keys: ['Shift', { icon: faArrowLeft }], description: t('pages.account.shortcuts.table.firstPage', {}) },
    { keys: ['Shift', { icon: faArrowRight }], description: t('pages.account.shortcuts.table.lastPage', {}) },
  ];

  const consoleShortcuts: ShortcutItemProps[] = [
    { keys: [{ icon: faArrowUp }], description: t('pages.account.shortcuts.console.previousCommand', {}) },
    { keys: [{ icon: faArrowDown }], description: t('pages.account.shortcuts.console.nextCommand', {}) },
  ];

  const serverListShortcuts: ShortcutItemProps[] = [
    { keys: ['S', 'Click'], description: t('pages.account.shortcuts.serverList.selectServer', {}) },
  ];

  return (
    <AccountContentContainer title={t('pages.account.shortcuts.title', {})}>
      <Flex justify='space-between' align='center' mb='lg'>
        <Title order={2} c='gray.1'>
          {t('pages.account.shortcuts.title', {})}
        </Title>
        <Flex
          align='center'
          gap='xs'
          px='sm'
          py={6}
          style={{
            background: 'var(--mantine-color-dark-6)',
            borderRadius: 6,
            border: '1px solid var(--mantine-color-dark-5)',
          }}
        >
          <FontAwesomeIcon icon={isMac ? faApple : faWindows} style={{ color: 'var(--mantine-color-gray-5)' }} />
          <Text size='sm' c='gray.5'>
            {isMac ? t('pages.account.shortcuts.detectedMac', {}) : t('pages.account.shortcuts.detectedWindows', {})}
          </Text>
        </Flex>
      </Flex>

      <Text c='gray.5' mb='xl' size='sm'>
        {t('pages.account.shortcuts.description', {})}
      </Text>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
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
        <ShortcutSection
          title={t('pages.account.shortcuts.serverList.title', {})}
          icon={faServer}
          shortcuts={serverListShortcuts}
        />
      </SimpleGrid>
    </AccountContentContainer>
  );
}
