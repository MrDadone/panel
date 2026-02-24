import { ModalProps, Stack } from '@mantine/core';
import { useState } from 'react';
import deleteNodeBackup from '@/api/admin/nodes/backups/deleteNodeBackup.ts';
import { httpErrorToHuman } from '@/api/axios.ts';
import Button from '@/elements/Button.tsx';
import Switch from '@/elements/input/Switch.tsx';
import { Modal, ModalFooter } from '@/elements/modals/Modal.tsx';
import { useToast } from '@/providers/ToastProvider.tsx';
import { useAdminStore } from '@/stores/admin.tsx';

type Props = ModalProps & {
  node: Node;
  backup: AdminServerBackup;
};

export default function NodeBackupsDeleteModal({ node, backup, opened, onClose }: Props) {
  const { addToast } = useToast();
  const { removeNodeBackup } = useAdminStore();

  const [loading, setLoading] = useState(false);
  const [deleteDoForce, setDeleteDoForce] = useState(false);

  const doDelete = () => {
    setLoading(true);
    deleteNodeBackup(node.uuid, backup.uuid, {
      force: deleteDoForce,
    })
      .then(() => {
        addToast('Node backup deleted.', 'success');
        onClose();
        removeNodeBackup(backup);
      })
      .catch((msg) => {
        addToast(httpErrorToHuman(msg), 'error');
      })
      .finally(() => setLoading(false));
  };

  return (
    <>
      <Modal title='Confirm Node Backup Deletion' onClose={onClose} opened={opened}>
        <Stack>
          <Switch
            label='Do you want to forcefully delete this node backup?'
            name='force'
            defaultChecked={deleteDoForce}
            onChange={(e) => setDeleteDoForce(e.target.checked)}
          />
        </Stack>

        <ModalFooter>
          <Button color='red' loading={loading} onClick={doDelete}>
            Okay
          </Button>
          <Button variant='default' onClick={() => onClose()}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
