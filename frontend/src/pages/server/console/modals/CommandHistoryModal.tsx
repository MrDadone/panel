import { faClipboard } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Group, ModalProps, ScrollArea, Stack } from '@mantine/core';
import { useCallback, useEffect, useRef, useState } from 'react';
import { httpErrorToHuman } from '@/api/axios.ts';
import getServerActivity from '@/api/server/getServerActivity.ts';
import Button from '@/elements/Button.tsx';
import Code from '@/elements/Code.tsx';
import TextInput from '@/elements/input/TextInput.tsx';
import Modal from '@/elements/modals/Modal.tsx';
import Table, { TableData, TableRow } from '@/elements/Table.tsx';
import Tooltip from '@/elements/Tooltip.tsx';
import { formatDateTime, formatTimestamp } from '@/lib/time.ts';
import { useToast } from '@/providers/ToastProvider.tsx';
import { useTranslations } from '@/providers/TranslationProvider.tsx';
import { useServerStore } from '@/stores/server.ts';

type Props = ModalProps & {
  onSelectCommand: (command: string) => void;
};

interface CommandDetail {
  command: string;
  user?: string;
  avatar?: string;
  created: Date;
}

export default function CommandHistoryModal({ opened, onClose, onSelectCommand }: Props) {
  const { t } = useTranslations();
  const { addToast } = useToast();
  const server = useServerStore((state) => state.server);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [activities, setActivities] = useState<ResponseMeta<ServerActivity>>({
    data: [],
    page: 1,
    perPage: 20,
    total: 0,
  });
  const [selectedCommand, setSelectedCommand] = useState<CommandDetail | null>(null);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const initialFetchDone = useRef(false);

  const fetchCommands = useCallback(
    (p: number, s: string) => {
      setLoading(true);
      const searchQuery = s ? `server:console.command ${s}` : 'server:console.command';
      getServerActivity(server.uuid, p, searchQuery)
        .then((res) => setActivities(res))
        .catch((err) => addToast(httpErrorToHuman(err), 'error'))
        .finally(() => setLoading(false));
    },
    [server.uuid, addToast],
  );

  useEffect(() => {
    if (opened && !initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchCommands(1, '');
    }
    if (!opened) {
      initialFetchDone.current = false;
      setSearch('');
      setPage(1);
      setSelectedCommand(null);
    }
  }, [opened, fetchCommands]);

  useEffect(() => {
    if (opened && initialFetchDone.current) {
      fetchCommands(page, search);
    }
  }, [page]);

  const handleSearchChange = (value: string) => {
    setSearch(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchCommands(1, value);
    }, 200);
  };

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

  const truncate = (cmd: string) => {
    if (cmd.length <= 50) return cmd;
    return cmd.slice(0, 50) + '...';
  };

  return (
    <>
      <Modal
        title={t('pages.server.console.modal.commandHistory.title', {})}
        onClose={onClose}
        opened={opened}
        size='xl'
      >
        <Stack gap='sm'>
          <TextInput
            placeholder={t('pages.server.console.modal.commandHistory.searchPlaceholder', {})}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />

          <ScrollArea h={400} offsetScrollbars>
            <Table
              columns={[
                '',
                t('common.table.columns.command', {}),
                t('common.table.columns.actor', {}),
                t('common.table.columns.when', {}),
              ]}
              loading={loading}
              pagination={activities}
              onPageSelect={setPage}
            >
              {activities.data.map((activity, index) => {
                const data = activity.data as { command?: string } | null;
                if (!data?.command) return null;

                return (
                  <TableRow
                    key={`${activity.created}-${index}`}
                    className='cursor-pointer'
                    onClick={() => handleRowClick(activity)}
                  >
                    <TableData>
                      <img
                        src={activity.user?.avatar ?? '/icon.svg'}
                        alt={activity.user?.username}
                        className='size-5 rounded-full'
                      />
                    </TableData>

                    <TableData>
                      <Code>{truncate(data.command)}</Code>
                    </TableData>

                    <TableData>
                      {activity.user?.username ?? t('common.system', {})}
                    </TableData>

                    <TableData>
                      <Tooltip label={formatDateTime(activity.created)}>
                        {formatTimestamp(activity.created)}
                      </Tooltip>
                    </TableData>
                  </TableRow>
                );
              })}
            </Table>
          </ScrollArea>
        </Stack>
      </Modal>

      <Modal
        title={t('pages.server.console.modal.commandHistory.detailTitle', {})}
        onClose={() => setSelectedCommand(null)}
        opened={selectedCommand !== null}
        size='lg'
      >
        {selectedCommand && (
          <Stack>
            <Group gap='xs' className='text-sm text-gray-400'>
              <img
                src={selectedCommand.avatar ?? '/icon.svg'}
                className='size-5 rounded-full'
              />
              <span>{selectedCommand.user ?? t('common.system', {})}</span>
              <span>-</span>
              <Tooltip label={formatDateTime(selectedCommand.created)}>
                {formatTimestamp(selectedCommand.created)}
              </Tooltip>
            </Group>

            <Code block className='whitespace-pre-wrap break-all max-h-64 overflow-auto'>
              {selectedCommand.command}
            </Code>

            <Group>
              <Button onClick={handleCopy} leftSection={<FontAwesomeIcon icon={faClipboard} />}>
                {t('pages.server.console.modal.commandHistory.copyButton', {})}
              </Button>
              <Button variant='default' onClick={() => setSelectedCommand(null)}>
                {t('common.button.close', {})}
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </>
  );
}
