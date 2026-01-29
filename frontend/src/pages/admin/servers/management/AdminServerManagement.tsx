import { Stack, Text, Title } from '@mantine/core';
import { useState } from 'react';
import Button from '@/elements/Button.tsx';
import Card from '@/elements/Card.tsx';
import AdminContentContainer from '@/elements/containers/AdminContentContainer.tsx';
import ServerDeleteModal from '@/pages/admin/servers/management/modals/ServerDeleteModal.tsx';
import ServerSuspendModal from '@/pages/admin/servers/management/modals/ServerSuspendModal.tsx';
import ServerTransferModal from '@/pages/admin/servers/management/modals/ServerTransferModal.tsx';
import ServerUnsuspendModal from '@/pages/admin/servers/management/modals/ServerUnsuspendModal.tsx';
import { useAdminCan } from '@/plugins/usePermissions.ts';
import ServerClearStateModal from './modals/ServerClearStateModal.tsx';

export default function AdminServerManagement({ server }: { server: AdminServer }) {
  const canTransfer = useAdminCan(['server.transfer', 'nodes.read'], false);

  const [openModal, setOpenModal] = useState<'transfer' | 'suspend' | 'unsuspend' | 'clear-state' | 'delete' | null>(
    null,
  );

  return (
    <AdminContentContainer title='Server Management' hideTitleComponent>
      {canTransfer && (
        <ServerTransferModal server={server} opened={openModal === 'transfer'} onClose={() => setOpenModal(null)} />
      )}
      <ServerSuspendModal server={server} opened={openModal === 'suspend'} onClose={() => setOpenModal(null)} />
      <ServerUnsuspendModal server={server} opened={openModal === 'unsuspend'} onClose={() => setOpenModal(null)} />
      <ServerClearStateModal server={server} opened={openModal === 'clear-state'} onClose={() => setOpenModal(null)} />
      <ServerDeleteModal server={server} opened={openModal === 'delete'} onClose={() => setOpenModal(null)} />

      <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
        <Card className='h-fit!'>
          <Stack gap='xs'>
            <Title order={2}>Transfer</Title>
            <Text size='sm'>Move this server to another node within this system.</Text>
            {canTransfer ? (
              <Button onClick={() => setOpenModal('transfer')} variant='outline' size='xs'>
                Transfer
              </Button>
            ) : (
              <Text size='sm'>You do not have permission to transfer this server.</Text>
            )}
          </Stack>
        </Card>
        <Card className='h-fit!'>
          <Stack gap='xs'>
            {server.suspended ? (
              <>
                <Title order={2}>Unsuspend</Title>
                <Text size='sm'>
                  This will unsuspend the server, allowing it to start again. The user will be able to access their
                  files and otherwise manage the server through the panel or API.
                </Text>
                <Button onClick={() => setOpenModal('unsuspend')} variant='outline' size='xs' color='green'>
                  Unsuspend
                </Button>
              </>
            ) : (
              <>
                <Title order={2}>Suspend</Title>
                <Text size='sm'>
                  This will suspend the server, stop any running processes, and immediately block the user from being
                  able to access their files or otherwise manage the server through the panel or API.
                </Text>
                <Button onClick={() => setOpenModal('suspend')} variant='outline' size='xs' color='orange'>
                  Suspend
                </Button>
              </>
            )}
          </Stack>
        </Card>
        <Card className='h-fit!'>
          <Stack gap='xs'>
            <Title order={2}>Clear State</Title>
            <Text size='sm'>This will clear the server state known by the panel.</Text>
            <Button onClick={() => setOpenModal('clear-state')} variant='outline' size='xs' color='red'>
              Clear State
            </Button>
          </Stack>
        </Card>
        <Card className='h-fit!'>
          <Stack gap='xs'>
            <Title order={2}>Delete</Title>
            <Text size='sm'>This will delete the server and all of its data. This action cannot be undone.</Text>
            <Button onClick={() => setOpenModal('delete')} variant='outline' size='xs' color='red'>
              Delete
            </Button>
          </Stack>
        </Card>
      </div>
    </AdminContentContainer>
  );
}
