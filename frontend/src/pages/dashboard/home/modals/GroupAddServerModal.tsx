import { Group, ModalProps, Stack } from '@mantine/core';
import { useEffect, useState } from 'react';
import { httpErrorToHuman } from '@/api/axios.ts';
import updateServerGroup from '@/api/me/servers/groups/updateServerGroup.ts';
import getServers from '@/api/server/getServers.ts';
import Button from '@/elements/Button.tsx';
import Select from '@/elements/input/Select.tsx';
import Modal from '@/elements/modals/Modal.tsx';
import Spinner from '@/elements/Spinner.tsx';
import { useToast } from '@/providers/ToastProvider.tsx';
import { useTranslations } from '@/providers/TranslationProvider.tsx';
import { useUserStore } from '@/stores/user.ts';

type Props = ModalProps & {
  serverGroup: UserServerGroup;
  onServerAdded?: () => void;
};

export default function GroupAddServerModal({ serverGroup, opened, onClose, onServerAdded }: Props) {
  const { t } = useTranslations();
  const { addToast } = useToast();
  const { updateServerGroup: updateStateServerGroup } = useUserStore();

  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (opened) {
      setFetching(true);
      setSelectedServer(null);

      // Fetch all servers (we'll load all pages to get complete list)
      const fetchAllServers = async () => {
        const allServers: Server[] = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
          const response = await getServers(page);
          allServers.push(...response.data);
          hasMore = response.page < response.lastPage;
          page++;
        }

        setServers(allServers);
        setFetching(false);
      };

      fetchAllServers().catch((err) => {
        addToast(httpErrorToHuman(err), 'error');
        setFetching(false);
      });
    }
  }, [opened, addToast]);

  const availableServers = servers.filter((s) => !serverGroup.serverOrder.includes(s.uuid));

  const doAdd = () => {
    if (!selectedServer) {
      return;
    }

    setLoading(true);

    updateServerGroup(serverGroup.uuid, { serverOrder: [...serverGroup.serverOrder, selectedServer.uuid] })
      .then(() => {
        updateStateServerGroup(serverGroup.uuid, {
          serverOrder: [...serverGroup.serverOrder, selectedServer.uuid],
        });

        onServerAdded?.();
        onClose();
        addToast(t('pages.account.home.tabs.groupedServers.page.modal.addServerToGroup.toast.added', {}), 'success');
      })
      .catch((msg) => {
        addToast(httpErrorToHuman(msg), 'error');
      })
      .finally(() => setLoading(false));
  };

  return (
    <Modal
      title={t('pages.account.home.tabs.groupedServers.page.modal.addServerToGroup.title', { group: serverGroup.name })}
      onClose={onClose}
      opened={opened}
    >
      {fetching ? (
        <Spinner.Centered />
      ) : availableServers.length === 0 ? (
        <p className='text-gray-400 text-sm'>
          {t('pages.account.home.tabs.groupedServers.page.modal.addServerToGroup.noServers', {})}
        </p>
      ) : (
        <Stack>
          <Select
            label={t('pages.account.home.tabs.groupedServers.page.modal.addServerToGroup.form.server', {})}
            placeholder={t('pages.account.home.tabs.groupedServers.page.modal.addServerToGroup.form.server', {})}
            value={selectedServer?.uuid || ''}
            className='w-full'
            searchable
            onChange={(value) => setSelectedServer(availableServers.find((s) => s.uuid === value) ?? null)}
            data={availableServers.map((s) => ({
              label: s.name,
              value: s.uuid,
            }))}
          />

          <Group>
            <Button onClick={doAdd} loading={loading} disabled={!selectedServer}>
              {t('common.button.add', {})}
            </Button>
            <Button variant='default' onClick={onClose}>
              {t('common.button.close', {})}
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}
