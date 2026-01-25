import { faArrowLeft, faClipboard, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Divider, DrawerProps, Group, ScrollArea, Stack, Title } from '@mantine/core';
import { useCallback, useEffect, useRef, useState } from 'react';
import { httpErrorToHuman } from '@/api/axios.ts';
import getServerActivity from '@/api/server/getServerActivity.ts';
import Button from '@/elements/Button.tsx';
import Code from '@/elements/Code.tsx';
import Drawer from '@/elements/Drawer.tsx';
import Tooltip from '@/elements/Tooltip.tsx';
import { formatDateTime, formatTimestamp } from '@/lib/time.ts';
import { useToast } from '@/providers/ToastProvider.tsx';
import { useTranslations } from '@/providers/TranslationProvider.tsx';
import { useServerStore } from '@/stores/server.ts';

type Props = DrawerProps & {
  onSelectCommand: (command: string) => void;
};

interface CommandDetail {
  command: string;
  user?: string;
  avatar?: string;
  created: Date;
}

export default function CommandHistoryDrawer({ opened, onClose, onSelectCommand }: Props) {
  const { t } = useTranslations();
  const { addToast } = useToast();
  const server = useServerStore((state) => state.server);
  const state = useServerStore((state) => state.state);
  const socketInstance = useServerStore((state) => state.socketInstance);

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [activities, setActivities] = useState<ResponseMeta<ServerActivity>>({
    data: [],
    page: 1,
    perPage: 20,
    total: 0,
  });
  const [selectedCommand, setSelectedCommand] = useState<CommandDetail | null>(null);

  const initialFetchDone = useRef(false);

  const fetchCommands = useCallback(
    (p: number) => {
      setLoading(true);
      getServerActivity(server.uuid, p, 'server:console.command')
        .then((res) => setActivities(res))
        .catch((err) => addToast(httpErrorToHuman(err), 'error'))
        .finally(() => setLoading(false));
    },
    [server.uuid, addToast],
  );

  useEffect(() => {
    if (opened && !initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchCommands(1);
    }
    if (!opened) {
      initialFetchDone.current = false;
      setPage(1);
      setSelectedCommand(null);
    }
  }, [opened, fetchCommands]);

  useEffect(() => {
    if (opened && initialFetchDone.current) {
      fetchCommands(page);
    }
  }, [page, opened, fetchCommands]);

  const handleRowClick = (activity: ServerActivity) => {
    const data = activity.data as { command?: string } | null;
    if (data?.command) {
      setSelectedCommand({
        command: data.command,
        user: activity.user?.username,
        avatar: activity.user?.avatar,
        created: activity.created,
      });
    }
  };

  const handleCopy = () => {
    if (selectedCommand) {
      navigator.clipboard.writeText(selectedCommand.command);
      addToast(t('pages.server.console.modal.commandHistory.copied', {}), 'success');
    }
  };

  const handleSendCommand = () => {
    if (selectedCommand && socketInstance && state === 'running') {
      socketInstance.send('send command', selectedCommand.command);
      addToast(t('pages.server.console.modal.commandHistory.commandSent', {}), 'success');
      setSelectedCommand(null);
    }
  };

  const isServerOnline = state === 'running';

  return (
    <>
      <Drawer
        position='right'
        offset={8}
        radius='md'
        opened={opened}
        onClose={onClose}
        title={t('pages.server.console.modal.commandHistory.title', {})}
        size='sm'
        overlayProps={{
          backgroundOpacity: 0,
          blur: 0,
        }}
        styles={{
          body: {
            height: 'calc(100% - 60px)',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Stack gap='md' className='h-full'>
          {selectedCommand ? (
            <Stack gap='md' className='flex-1 overflow-hidden'>
              <div className='flex items-center justify-between'>
                <Title order={4} className='text-white'>
                  {t('pages.server.console.modal.commandHistory.detailTitle', {})}
                </Title>
                <Button
                  variant='subtle'
                  size='xs'
                  onClick={() => setSelectedCommand(null)}
                  leftSection={<FontAwesomeIcon icon={faArrowLeft} />}
                >
                  Back
                </Button>
              </div>

              <Group gap='xs' className='text-sm text-gray-400'>
                <img
                  src={selectedCommand.avatar ?? '/icon.svg'}
                  alt={selectedCommand.user ?? 'System'}
                  className='size-5 rounded-full'
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/icon.svg';
                  }}
                />
                <span>{selectedCommand.user ?? t('common.system', {})}</span>
                <span>•</span>
                <Tooltip label={formatDateTime(selectedCommand.created)}>
                  <span className='cursor-help'>{formatTimestamp(selectedCommand.created)}</span>
                </Tooltip>
              </Group>

              <ScrollArea className='flex-1' offsetScrollbars>
                <Code block className='whitespace-pre-wrap break-all p-4 text-sm'>
                  {selectedCommand.command}
                </Code>
              </ScrollArea>

              <Group gap='sm'>
                <Button
                  onClick={handleSendCommand}
                  disabled={!isServerOnline || !socketInstance}
                  leftSection={<FontAwesomeIcon icon={faPaperPlane} />}
                  className='flex-1'
                >
                  {t('pages.server.console.modal.commandHistory.sendButton', {})}
                </Button>
                <Button
                  onClick={handleCopy}
                  leftSection={<FontAwesomeIcon icon={faClipboard} />}
                  variant='outline'
                  className='flex-1'
                >
                  {t('pages.server.console.modal.commandHistory.copyButton', {})}
                </Button>
              </Group>
            </Stack>
          ) : (
            <ScrollArea className='flex-1' offsetScrollbars>
              {loading && activities.data.length === 0 ? (
                <div className='flex items-center justify-center py-12 text-gray-400'>Loading commands...</div>
              ) : activities.data.length === 0 ? (
                <div className='flex items-center justify-center py-12 text-gray-400'>
                  {t('pages.server.console.modal.commandHistory.noCommands', {})}
                </div>
              ) : (
                <Stack gap='xs'>
                  {activities.data.map((activity, index) => {
                    const data = activity.data as { command?: string } | null;
                    if (!data?.command) return null;

                    const isSelected =
                      selectedCommand?.command === data.command &&
                      selectedCommand?.created.getTime() === activity.created.getTime();

                    return (
                      <div
                        key={`${activity.created}-${index}`}
                        onClick={() => handleRowClick(activity)}
                        className={`
                          p-3 rounded-md border cursor-pointer transition-all
                          ${isSelected ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/50'}
                        `}
                      >
                        <div className='flex items-start gap-3'>
                          <img
                            src={activity.user?.avatar ?? '/icon.svg'}
                            alt={activity.user?.username ?? 'System'}
                            className='size-6 rounded-full flex-shrink-0 mt-0.5'
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/icon.svg';
                            }}
                          />
                          <div className='flex-1 min-w-0'>
                            <Code className='block mb-1.5 text-xs break-words'>{data.command}</Code>
                            <div className='flex items-center gap-2 text-xs text-gray-400'>
                              <span>{activity.user?.username ?? t('common.system', {})}</span>
                              <span>•</span>
                              <Tooltip label={formatDateTime(activity.created)}>
                                <span className='cursor-help'>{formatTimestamp(activity.created)}</span>
                              </Tooltip>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </Stack>
              )}

              {activities.total > activities.perPage && (
                <>
                  <Divider my='md' />
                  <Group justify='center' gap='xs'>
                    <Button
                      variant='subtle'
                      size='xs'
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1 || loading}
                    >
                      Previous
                    </Button>
                    <span className='text-sm text-gray-400'>
                      Page {page} of {Math.ceil(activities.total / activities.perPage)}
                    </span>
                    <Button
                      variant='subtle'
                      size='xs'
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page >= Math.ceil(activities.total / activities.perPage) || loading}
                    >
                      Next
                    </Button>
                  </Group>
                </>
              )}
            </ScrollArea>
          )}
        </Stack>
      </Drawer>
    </>
  );
}
