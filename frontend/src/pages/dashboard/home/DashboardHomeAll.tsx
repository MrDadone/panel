import { Group } from '@mantine/core';
import { useEffect, useState } from 'react';
import { httpErrorToHuman } from '@/api/axios.ts';
import getServerGroups from '@/api/me/servers/groups/getServerGroups.ts';
import getServers from '@/api/server/getServers.ts';
import { AdminCan } from '@/elements/Can.tsx';
import AccountContentContainer from '@/elements/containers/AccountContentContainer.tsx';
import Divider from '@/elements/Divider.tsx';
import Switch from '@/elements/input/Switch.tsx';
import TextInput from '@/elements/input/TextInput.tsx';
import Spinner from '@/elements/Spinner.tsx';
import { Pagination } from '@/elements/Table.tsx';
import { useBulkPowerActions } from '@/plugins/useBulkPowerActions.ts';
import { useSearchablePaginatedTable } from '@/plugins/useSearchablePageableTable.ts';
import { useServerStats } from '@/plugins/useServerStats.ts';
import { useToast } from '@/providers/ToastProvider.tsx';
import { useTranslations } from '@/providers/TranslationProvider.tsx';
import { useGlobalStore } from '@/stores/global.ts';
import { useUserStore } from '@/stores/user.ts';
import BulkActionBar from './BulkActionBar.tsx';
import DashboardHomeTitle from './DashboardHomeTitle.tsx';
import ServerItem from './ServerItem.tsx';

export default function DashboardHomeAll() {
  const { t } = useTranslations();
  const { servers, setServers, setServerGroups } = useUserStore();
  const { serverListShowOthers, setServerListShowOthers } = useGlobalStore();
  const { addToast } = useToast();

  const [selectedServers, setSelectedServers] = useState<Set<string>>(new Set());
  const [sKeyPressed, setSKeyPressed] = useState(false);

  const { handleBulkPowerAction, bulkActionLoading } = useBulkPowerActions();
  const loadingStats = useServerStats(servers.data);

  useEffect(() => {
    getServerGroups()
      .then((response) => {
        setServerGroups(response);
      })
      .catch((msg) => {
        addToast(httpErrorToHuman(msg), 'error');
      });
  }, [addToast, setServerGroups]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only track 'S' key if not typing in an input field
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

  const { loading, search, setSearch, setPage } = useSearchablePaginatedTable({
    fetcher: (page, search) => getServers(page, search, serverListShowOthers),
    setStoreData: setServers,
    deps: [serverListShowOthers],
  });

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

  const onBulkAction = async (action: ServerPowerAction) => {
    const serverUuids = Array.from(selectedServers);
    await handleBulkPowerAction(serverUuids, action);
    setSelectedServers(new Set());
  };

  return (
    <AccountContentContainer title={t('pages.account.home.title', {})}>
      <DashboardHomeTitle />

      <Group mb='md' justify='space-between'>
        <TextInput
          placeholder={t('common.input.search', {})}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          w={250}
        />
        <AdminCan action='servers.read'>
          <Switch
            label={t('pages.account.home.tabs.allServers.page.input.showOtherUsersServers', {})}
            checked={serverListShowOthers}
            onChange={(e) => setServerListShowOthers(e.currentTarget.checked)}
          />
        </AdminCan>
      </Group>
      {servers.total > servers.perPage && (
        <>
          <Pagination data={servers} onPageSelect={setPage} />
          <Divider my='md' />
        </>
      )}
      {loading || loadingStats ? (
        <Spinner.Centered />
      ) : servers.total === 0 ? (
        <p className='text-gray-400'>{t('pages.account.home.noServers', {})}</p>
      ) : (
        <div className='gap-4 grid md:grid-cols-2'>
          {servers.data.map((server) => (
            <ServerItem
              key={server.uuid}
              server={server}
              showGroupAddButton={!serverListShowOthers}
              isSelected={selectedServers.has(server.uuid)}
              onSelectionChange={(selected) => handleServerSelectionChange(server.uuid, selected)}
              onClick={(e) => handleServerClick(server.uuid, e)}
              sKeyPressed={sKeyPressed}
            />
          ))}
        </div>
      )}
      <BulkActionBar
        selectedCount={selectedServers.size}
        onClear={() => setSelectedServers(new Set())}
        onAction={onBulkAction}
        loading={bulkActionLoading}
      />
      {servers.total > servers.perPage && (
        <>
          <Divider my='md' />
          <Pagination data={servers} onPageSelect={setPage} />
        </>
      )}
    </AccountContentContainer>
  );
}
