import { useEffect, useState } from 'react';
import { Group } from '@mantine/core';
import getNodeServers from '@/api/admin/nodes/servers/getNodeServers.ts';
import sendPowerAction from '@/api/server/sendPowerAction.ts';
import { getEmptyPaginationSet } from '@/api/axios.ts';
import ActionBar from '@/elements/ActionBar.tsx';
import Button from '@/elements/Button.tsx';
import AdminContentContainer from '@/elements/containers/AdminContentContainer.tsx';
import Table from '@/elements/Table.tsx';
import { serverTableColumns } from '@/lib/tableColumns.ts';
import { useTranslations } from '@/providers/TranslationProvider.tsx';
import { useToast } from '@/providers/ToastProvider.tsx';
import ServerRow from '@/pages/admin/servers/ServerRow.tsx';
import { useSearchablePaginatedTable } from '@/plugins/useSearchablePageableTable.ts';

export default function AdminNodeServers({ node }: { node: Node }) {
  const { t } = useTranslations();
  const { addToast } = useToast();
  const [nodeServers, setNodeServers] = useState<ResponseMeta<AdminServer>>(getEmptyPaginationSet());
  const [selectedServers, setSelectedServers] = useState<Set<string>>(new Set());
  const [sKeyPressed, setSKeyPressed] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState<ServerPowerAction | null>(null);
  const [allActionLoading, setAllActionLoading] = useState<ServerPowerAction | null>(null);

  const { loading, search, setSearch, setPage } = useSearchablePaginatedTable({
    fetcher: (page, search) => getNodeServers(node.uuid, page, search),
    setStoreData: setNodeServers,
  });

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
    if (sKeyPressed) {
      event.preventDefault();
      event.stopPropagation();
      handleServerSelectionChange(serverUuid, !selectedServers.has(serverUuid));
    }
  };

  const handleBulkPowerAction = async (action: ServerPowerAction) => {
    if (selectedServers.size === 0) {
      addToast(t('pages.account.home.bulkActions.noServersSelected', {}), 'error');
      return;
    }

    setBulkActionLoading(action);

    const serverUuids = Array.from(selectedServers);
    const results = await Promise.allSettled(
      serverUuids.map((uuid) => sendPowerAction(uuid, action)),
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    if (failed === 0) {
      addToast(
        t('pages.account.home.bulkActions.success', {
          count: successful,
          action: t(`pages.server.console.power.${action}`, {}),
        }),
        'success',
      );
    } else {
      addToast(
        t('pages.account.home.bulkActions.partial', {
          successful,
          failed,
          action: t(`pages.server.console.power.${action}`, {}),
        }),
        'warning',
      );
    }

    setBulkActionLoading(null);
    setSelectedServers(new Set());
  };

  const handleAllPowerAction = async (action: ServerPowerAction) => {
    if (nodeServers.total === 0) {
      addToast(t('pages.account.home.bulkActions.noServersSelected', {}), 'error');
      return;
    }

    setAllActionLoading(action);

    // Fetch all servers across all pages
    const allServerUuids: string[] = [];
    const totalPages = Math.ceil(nodeServers.total / (nodeServers.perPage || 26));
    
    try {
      for (let page = 1; page <= totalPages; page++) {
        const response = await getNodeServers(node.uuid, page, search || undefined);
        allServerUuids.push(...response.data.map((s) => s.uuid));
      }

      const results = await Promise.allSettled(
        allServerUuids.map((uuid) => sendPowerAction(uuid, action)),
      );

      const successful = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      if (failed === 0) {
        addToast(
          t('pages.account.home.bulkActions.success', {
            count: successful,
            action: t(`pages.server.console.power.${action}`, {}),
          }),
          'success',
        );
      } else {
        addToast(
          t('pages.account.home.bulkActions.partial', {
            successful,
            failed,
            action: t(`pages.server.console.power.${action}`, {}),
          }),
          'warning',
        );
      }
    } catch (error) {
      addToast(t('pages.account.home.bulkActions.error', {}), 'error');
    }

    setAllActionLoading(null);
  };

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
              disabled={allActionLoading !== null && allActionLoading !== 'start' || nodeServers.total === 0}
            >
              {t('pages.server.console.power.start', {})} All ({nodeServers.total})
            </Button>
            <Button
              color='gray'
              onClick={() => handleAllPowerAction('restart')}
              loading={allActionLoading === 'restart'}
              disabled={allActionLoading !== null && allActionLoading !== 'restart' || nodeServers.total === 0}
            >
              {t('pages.server.console.power.restart', {})} All ({nodeServers.total})
            </Button>
            <Button
              color='red'
              onClick={() => handleAllPowerAction('stop')}
              loading={allActionLoading === 'stop'}
              disabled={allActionLoading !== null && allActionLoading !== 'stop' || nodeServers.total === 0}
            >
              {t('pages.server.console.power.stop', {})} All ({nodeServers.total})
            </Button>
          </Group>
        }
      >
        <Table columns={columns} loading={loading} pagination={nodeServers} onPageSelect={setPage}>
          {nodeServers.data.map((server) => (
            <ServerRow
              key={server.uuid}
              server={server}
              showSelection={true}
              isSelected={selectedServers.has(server.uuid)}
              onSelectionChange={(selected) => handleServerSelectionChange(server.uuid, selected)}
              onClick={(e) => handleServerClick(server.uuid, e)}
              sKeyPressed={sKeyPressed}
            />
          ))}
        </Table>
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
