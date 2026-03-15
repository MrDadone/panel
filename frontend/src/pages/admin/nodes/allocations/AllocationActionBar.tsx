import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { z } from 'zod';
import deleteNodeAllocations from '@/api/admin/nodes/allocations/deleteNodeAllocations.ts';
import { httpErrorToHuman } from '@/api/axios.ts';
import ActionBar from '@/elements/ActionBar.tsx';
import Button from '@/elements/Button.tsx';
import Code from '@/elements/Code.tsx';
import ConfirmationModal from '@/elements/modals/ConfirmationModal.tsx';
import { adminNodeSchema } from '@/lib/schemas/admin/nodes.ts';
import { useKeyboardShortcuts } from '@/plugins/useKeyboardShortcuts.ts';
import { useToast } from '@/providers/ToastProvider.tsx';
import { useAdminStore } from '@/stores/admin.tsx';
import NodeAllocationsUpdateModal from './modals/NodeAllocationsUpdateModal.tsx';

export default function AllocationActionBar({
  node,
  loadAllocations,
}: {
  node: z.infer<typeof adminNodeSchema>;
  loadAllocations: () => void;
}) {
  const { addToast } = useToast();
  const { removeNodeAllocations, selectedNodeAllocations, setSelectedNodeAllocations } = useAdminStore();

  const [openModal, setOpenModal] = useState<'update' | 'delete' | null>(null);

  const doDelete = async () => {
    await deleteNodeAllocations(node.uuid, selectedNodeAllocations.keys())
      .then(({ deleted }) => {
        removeNodeAllocations(selectedNodeAllocations.values());

        addToast(`${deleted} Node Allocation${deleted === 1 ? '' : 's'} deleted.`, 'success');
        setSelectedNodeAllocations([]);
        setOpenModal(null);
      })
      .catch((msg) => {
        addToast(httpErrorToHuman(msg), 'error');
      });
  };

  useKeyboardShortcuts({
    shortcuts: [
      {
        key: 'Delete',
        callback: () => setOpenModal('delete'),
      },
    ],
    deps: [],
  });

  return (
    <>
      <NodeAllocationsUpdateModal
        node={node}
        loadAllocations={loadAllocations}
        opened={openModal === 'update'}
        onClose={() => setOpenModal(null)}
      />
      <ConfirmationModal
        opened={openModal === 'delete'}
        onClose={() => setOpenModal(null)}
        title='Confirm Node Allocations Deletion'
        confirm='Delete'
        onConfirmed={doDelete}
      >
        Are you sure you want to delete
        <Code>{selectedNodeAllocations.size}</Code>
        allocations from <Code>{node.name}</Code>?
      </ConfirmationModal>

      <ActionBar opened={selectedNodeAllocations.size > 0}>
        <Button onClick={() => setOpenModal('update')}>
          <FontAwesomeIcon icon={faPen} className='mr-2' /> Update
        </Button>
        <Button color='red' onClick={() => setOpenModal('delete')}>
          <FontAwesomeIcon icon={faTrash} className='mr-2' /> Delete
        </Button>
      </ActionBar>
    </>
  );
}
