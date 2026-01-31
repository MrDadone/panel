import { Group } from '@mantine/core';
import { useEffect, useState } from 'react';
import { httpErrorToHuman } from '@/api/axios.ts';
import getServerGroups from '@/api/me/servers/groups/getServerGroups.ts';
import getServers from '@/api/server/getServers.ts';
import sendPowerAction from '@/api/server/sendPowerAction.ts';
import ActionBar from '@/elements/ActionBar.tsx';
import Button from '@/elements/Button.tsx';
import AccountContentContainer from '@/elements/containers/AccountContentContainer.tsx';
import Divider from '@/elements/Divider.tsx';
import Switch from '@/elements/input/Switch.tsx';
import TextInput from '@/elements/input/TextInput.tsx';
import Spinner from '@/elements/Spinner.tsx';
import { Pagination } from '@/elements/Table.tsx';
import { useSearchablePaginatedTable } from '@/plugins/useSearchablePageableTable.ts';
import { useAuth } from '@/providers/AuthProvider.tsx';
import { useToast } from '@/providers/ToastProvider.tsx';
import { useTranslations } from '@/providers/TranslationProvider.tsx';
import { useGlobalStore } from '@/stores/global.ts';
import { useUserStore } from '@/stores/user.ts';
import DashboardHomeTitle from './DashboardHomeTitle.tsx';
import ServerItem from './ServerItem.tsx';

export default function DashboardHomeAll() {
  const { t, tItem } = useTranslations();
  const { servers, setServers, setServerGroups } = useUserStore();
  const { serverListShowOthers, setServerListShowOthers } = useGlobalStore();
  const { addToast } = useToast();
  const { user } = useAuth();

  const [selectedServers, setSelectedServers] = useState<Set<string>>(new Set());
  const [sKeyPressed, setSKeyPressed] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState<ServerPowerAction | null>(null);

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

  const handleBulkPowerAction = async (action: ServerPowerAction) => {
    setBulkActionLoading(action);

    const serverUuids = Array.from(selectedServers);
    const results = await Promise.allSettled(serverUuids.map((uuid) => sendPowerAction(uuid, action)));

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

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
          servers: tItem('server', successful),
          action: t(`common.enum.bulkActionServerAction.${actionPastTense}`, {}),
        }),
        'success',
      );
    } else {
      addToast(
        t('pages.account.home.bulkActions.partial', {
          successfulServers: tItem('server', successful),
          failedServers: tItem('server', failed),
          action: t(`common.enum.bulkActionServerAction.${actionPastTense}`, {}),
        }),
        'warning',
      );
    }

    setBulkActionLoading(null);
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
        {user!.admin && (
          <Switch
            label={t('pages.account.home.tabs.allServers.page.input.showOtherUsersServers', {})}
            checked={serverListShowOthers}
            onChange={(e) => setServerListShowOthers(e.currentTarget.checked)}
          />
        )}
      </Group>
      {servers.total > servers.perPage && (
        <>
          <Pagination data={servers} onPageSelect={setPage} />
          <Divider my='md' />
        </>
      )}
      {loading ? (
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
      {servers.total > servers.perPage && (
        <>
          <Divider my='md' />
          <Pagination data={servers} onPageSelect={setPage} />
        </>
      )}
    </AccountContentContainer>
  );
}
