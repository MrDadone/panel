import getSubusers from '@/api/server/subusers/getSubusers';
import Spinner from '@/elements/Spinner';
import { useServerStore } from '@/stores/server';
import { useEffect, useState } from 'react';
import SubuserRow from './SubuserRow';
import createSubuser from '@/api/server/subusers/createSubuser';
import { httpErrorToHuman } from '@/api/axios';
import { useToast } from '@/providers/ToastProvider';
import { ContextMenuProvider } from '@/elements/ContextMenu';
import getPermissions from '@/api/getPermissions';
import SubuserCreateOrUpdateModal from './modals/SubuserCreateOrUpdateModal';
import { Group, Title } from '@mantine/core';
import TextInput from '@/elements/input/TextInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Button from '@/elements/Button';
import Table from '@/elements/Table';
import { useSearchablePaginatedTable } from '@/plugins/useSearchablePageableTable';

export default () => {
  const { addToast } = useToast();
  const { server, subusers, setSubusers, addSubuser, setAvailablePermissions } = useServerStore();

  const [openModal, setOpenModal] = useState<'create'>(null);

  useEffect(() => {
    getPermissions().then((res) => {
      setAvailablePermissions(res.serverPermissions);
    });
  }, []);

  const { loading, search, setSearch, setPage } = useSearchablePaginatedTable({
    fetcher: (page, search) => getSubusers(server.uuid, page, search),
    setStoreData: setSubusers,
  });

  const doCreate = (email: string, permissions: string[], ignoredFiles: string[], captcha: string) => {
    createSubuser(server.uuid, { email, permissions, ignoredFiles, captcha })
      .then((subuser) => {
        addSubuser(subuser);
        addToast('Subuser created.', 'success');
        setOpenModal(null);
      })
      .catch((msg) => {
        addToast(httpErrorToHuman(msg), 'error');
      });
  };

  return (
    <>
      <SubuserCreateOrUpdateModal
        onCreate={doCreate}
        opened={openModal === 'create'}
        onClose={() => setOpenModal(null)}
      />

      <Group justify={'space-between'} mb={'md'}>
        <Title order={1} c={'white'}>
          Users
        </Title>
        <Group>
          <TextInput placeholder={'Search...'} value={search} onChange={(e) => setSearch(e.target.value)} w={250} />
          <Button onClick={() => setOpenModal('create')} color={'blue'} leftSection={<FontAwesomeIcon icon={faPlus} />}>
            Create
          </Button>
        </Group>
      </Group>

      {loading ? (
        <Spinner.Centered />
      ) : (
        <ContextMenuProvider>
          <Table
            columns={['Username', '2FA Enabled', 'Permissions', 'Ignored Files', '']}
            pagination={subusers}
            onPageSelect={setPage}
          >
            {subusers.data.map((su) => (
              <SubuserRow subuser={su} key={su.user.uuid} />
            ))}
          </Table>
        </ContextMenuProvider>
      )}
    </>
  );
};
