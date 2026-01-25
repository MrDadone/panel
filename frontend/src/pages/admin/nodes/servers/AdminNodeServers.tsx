import { Group } from '@mantine/core';
import { Ref, useEffect, useState } from 'react';
import getNodeServers from '@/api/admin/nodes/servers/getNodeServers.ts';
import sendNodeServersPowerAction from '@/api/admin/nodes/servers/sendNodeServersPowerAction.ts';
import { getEmptyPaginationSet, httpErrorToHuman } from '@/api/axios.ts';
import ActionBar from '@/elements/ActionBar.tsx';
import Button from '@/elements/Button.tsx';
import AdminContentContainer from '@/elements/containers/AdminContentContainer.tsx';
import SelectionArea from '@/elements/SelectionArea.tsx';
import Table from '@/elements/Table.tsx';
import { serverTableColumns } from '@/lib/tableColumns.ts';
import ServerRow from '@/pages/admin/servers/ServerRow.tsx';
import { useKeyboardShortcuts } from '@/plugins/useKeyboardShortcuts.ts';
import { useSearchablePaginatedTable } from '@/plugins/useSearchablePageableTable.ts';
import { useToast } from '@/providers/ToastProvider.tsx';
import { useTranslations } from '@/providers/TranslationProvider.tsx';

export default function AdminNodeServers({ node }: { node: Node }) {
  const { t, tItem } = useTranslations();
  const { addToast } = useToast();
  const [nodeServers, setNodeServers] = useState<ResponseMeta<AdminServer>>(getEmptyPaginationSet());
  const [selectedServers, setSelectedServers] = useState<Set<string>>(new Set());
  const [selectedServersPrevious, setSelectedServersPrevious] = useState<Set<string>>(new Set());
  const [sKeyPressed, setSKeyPressed] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState<ServerPowerAction | null>(null);
  const [allActionLoading, setAllActionLoading] = useState<ServerPowerAction | null>(null);

  const { loading, search, setSearch, setPage } = useSearchablePaginatedTable({
    fetcher: (page, search) => getNodeServers(node.uuid, page, search),
    setStoreData: setNodeServers,
  });

  const onSelectedStart = (event: React.MouseEvent | MouseEvent) => {
    setSelectedServersPrevious(event.shiftKey ? selectedServers : new Set());
  };

  const onSelected = (selected: string[]) => {
    setSelectedServers(new Set([...selectedServersPrevious, ...selected]));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 's' || e.key === 'S') {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !target.isContentEditable) {
          setSKeyPressed(true);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 's' || e.key === 'S') {
        setSKeyPressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleServerSelectionChange = (serverUuid: string, selected: boolean) => {
    setSelectedServers((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(serverUuid);
      } else {
        newSet.delete(serverUuid);
      }
      return newSet;
    });
  };

  const handleServerClick = (serverUuid: string, event: React.MouseEvent) => {
    if (sKeyPressed || event.ctrlKey || event.metaKey) {
      event.preventDefault();
      event.stopPropagation();
      handleServerSelectionChange(serverUuid, !selectedServers.has(serverUuid));
    }
  };

  const handleBulkPowerAction = async (action: ServerPowerAction) => {
    setBulkActionLoading(action);
    sendNodeServersPowerAction(node.uuid, Array.from(selectedServers), action)
      .then((successful) => {
        const failed = selectedServers.size - successful;

        const actionPastTenseMap: Record<ServerPowerAction, 'started' | 'stopped' | 'restarted' | 'killed'> = {
          start: 'started',
          stop: 'stopped',
          restart: 'restarted',
          kill: 'killed',
        };
        const actionPastTense = actionPastTenseMap[action];

        if (failed === 0) {
          addToast(
            t('pages.account.home.bulkActions.success', {
              item: tItem('server', successful),
              action: t(`common.enum.bulkActionServerAction.${actionPastTense}`, {}),
            }),
            'success',
          );
        } else {
          addToast(
            t('pages.account.home.bulkActions.partial', {
              successfulItem: tItem('server', successful),
              failedItem: tItem('server', failed),
              action: t(`common.enum.bulkActionServerAction.${actionPastTense}`, {}),
            }),
            'warning',
          );
        }
      })
      .catch((err) => {
        addToast(httpErrorToHuman(err), 'error');
      })
      .finally(() => {
        setBulkActionLoading(null);
        setSelectedServers(new Set());
      });
  };

  const handleAllPowerAction = async (action: ServerPowerAction) => {
    setAllActionLoading(action);
    sendNodeServersPowerAction(node.uuid, [], action)
      .then((successful) => {
        const failed = nodeServers.total - successful;

        const actionPastTenseMap: Record<ServerPowerAction, 'started' | 'stopped' | 'restarted' | 'killed'> = {
          start: 'started',
          stop: 'stopped',
          restart: 'restarted',
          kill: 'killed',
        };
        const actionPastTense = actionPastTenseMap[action];

        if (failed === 0) {
          addToast(
            t('pages.account.home.bulkActions.success', {
              item: tItem('server', successful),
              action: t(`common.enum.bulkActionServerAction.${actionPastTense}`, {}),
            }),
            'success',
          );
        } else {
          addToast(
            t('pages.account.home.bulkActions.partial', {
              successfulItem: tItem('server', successful),
              failedItem: tItem('server', failed),
              action: t(`common.enum.bulkActionServerAction.${actionPastTense}`, {}),
            }),
            'warning',
          );
        }
      })
      .catch((err) => {
        addToast(httpErrorToHuman(err), 'error');
      })
      .finally(() => {
        setAllActionLoading(null);
      });
  };

  useKeyboardShortcuts({
    shortcuts: [
      {
        key: 'a',
        modifiers: ['ctrlOrMeta'],
        callback: () => setSelectedServers(new Set(nodeServers.data.map((server) => server.uuid))),
      },
      {
        key: 'Escape',
        modifiers: ['ctrlOrMeta'],
        callback: () => setSelectedServers(new Set()),
      },
    ],
    deps: [nodeServers.data],
  });

  const columns = ['', ...serverTableColumns];

  return (
    <>
      <AdminContentContainer
        title='Node Servers'
        titleOrder={2}
        search={search}
        setSearch={setSearch}
        contentRight={
          <Group gap='sm'>
            <Button
              color='green'
              onClick={() => handleAllPowerAction('start')}
              loading={allActionLoading === 'start'}
              disabled={(allActionLoading !== null && allActionLoading !== 'start') || nodeServers.total === 0}
            >
              {t('pages.server.console.power.start', {})} ({nodeServers.total})
            </Button>
            <Button
              color='gray'
              onClick={() => handleAllPowerAction('restart')}
              loading={allActionLoading === 'restart'}
              disabled={(allActionLoading !== null && allActionLoading !== 'restart') || nodeServers.total === 0}
            >
              {t('pages.server.console.power.restart', {})} ({nodeServers.total})
            </Button>
            <Button
              color='red'
              onClick={() => handleAllPowerAction('stop')}
              loading={allActionLoading === 'stop'}
              disabled={(allActionLoading !== null && allActionLoading !== 'stop') || nodeServers.total === 0}
            >
              {t('pages.server.console.power.stop', {})} ({nodeServers.total})
            </Button>
          </Group>
        }
      >
        <SelectionArea onSelectedStart={onSelectedStart} onSelected={onSelected}>
          <Table
            columns={columns}
            loading={loading}
            pagination={nodeServers}
            onPageSelect={setPage}
            allowSelect={false}
          >
            {nodeServers.data.map((server) => (
              <SelectionArea.Selectable key={server.uuid} item={server.uuid}>
                {(innerRef: Ref<HTMLElement>) => (
                  <ServerRow
                    key={server.uuid}
                    server={server}
                    ref={innerRef as Ref<HTMLTableRowElement>}
                    showSelection={true}
                    isSelected={selectedServers.has(server.uuid)}
                    onSelectionChange={(selected) => handleServerSelectionChange(server.uuid, selected)}
                    onClick={(e) => handleServerClick(server.uuid, e)}
                  />
                )}
              </SelectionArea.Selectable>
            ))}
          </Table>
        </SelectionArea>
      </AdminContentContainer>

      <ActionBar opened={selectedServers.size > 0}>
        <Button
          color='green'
          onClick={() => handleBulkPowerAction('start')}
          loading={bulkActionLoading === 'start'}
          disabled={bulkActionLoading !== null && bulkActionLoading !== 'start'}
        >
          {t('pages.server.console.power.start', {})} ({selectedServers.size})
        </Button>
        <Button
          color='gray'
          onClick={() => handleBulkPowerAction('restart')}
          loading={bulkActionLoading === 'restart'}
          disabled={bulkActionLoading !== null && bulkActionLoading !== 'restart'}
        >
          {t('pages.server.console.power.restart', {})} ({selectedServers.size})
        </Button>
        <Button
          color='red'
          onClick={() => handleBulkPowerAction('stop')}
          loading={bulkActionLoading === 'stop'}
          disabled={bulkActionLoading !== null && bulkActionLoading !== 'stop'}
        >
          {t('pages.server.console.power.stop', {})} ({selectedServers.size})
        </Button>
        <Button variant='default' onClick={() => setSelectedServers(new Set())}>
          {t('common.button.cancel', {})}
        </Button>
      </ActionBar>
    </>
  );
}
