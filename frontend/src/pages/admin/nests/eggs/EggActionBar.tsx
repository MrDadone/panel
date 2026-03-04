import { faArrowTurnUp, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import deleteEggs from '@/api/admin/nests/eggs/deleteEggs.ts';
import { httpErrorToHuman } from '@/api/axios.ts';
import ActionBar from '@/elements/ActionBar.tsx';
import Button from '@/elements/Button.tsx';
import { AdminCan } from '@/elements/Can.tsx';
import Code from '@/elements/Code.tsx';
import ConfirmationModal from '@/elements/modals/ConfirmationModal.tsx';
import { ObjectSet } from '@/lib/objectSet.ts';
import { useKeyboardShortcuts } from '@/plugins/useKeyboardShortcuts.ts';
import { useToast } from '@/providers/ToastProvider.tsx';
import EggsMoveModal from './modals/EggsMoveModal.tsx';

export default function EggActionBar({
  nest,
  selectedEggs,
  invalidateEggs,
}: {
  nest: AdminNest;
  selectedEggs: ObjectSet<AdminNestEgg, 'uuid'>;
  invalidateEggs: () => void;
}) {
  const { addToast } = useToast();

  const [openModal, setOpenModal] = useState<'move' | 'delete' | null>(null);

  const doDelete = async () => {
    await deleteEggs(nest.uuid, selectedEggs.keys())
      .then(({ deleted }) => {
        invalidateEggs();

        addToast(`${deleted} Egg${deleted === 1 ? '' : 's'} deleted.`, 'success');
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
      <EggsMoveModal
        nest={nest}
        selectedEggs={selectedEggs}
        invalidateEggs={invalidateEggs}
        opened={openModal === 'move'}
        onClose={() => setOpenModal(null)}
      />
      <ConfirmationModal
        opened={openModal === 'delete'}
        onClose={() => setOpenModal(null)}
        title='Confirm Egg Deletion'
        confirm='Delete'
        onConfirmed={doDelete}
      >
        Are you sure you want to delete <Code>{selectedEggs.size}</Code> eggs?
      </ConfirmationModal>

      <ActionBar opened={selectedEggs.size > 0}>
        <AdminCan action='eggs.update'>
          <Button onClick={() => setOpenModal('move')} className='col-span-2'>
            <FontAwesomeIcon icon={faArrowTurnUp} className='mr-2' /> Move
          </Button>
        </AdminCan>
        <AdminCan action='eggs.delete'>
          <Button color='red' onClick={() => setOpenModal('delete')} className='col-span-2'>
            <FontAwesomeIcon icon={faTrash} className='mr-2' /> Delete
          </Button>
        </AdminCan>
      </ActionBar>
    </>
  );
}
