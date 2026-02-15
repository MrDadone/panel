import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import deleteAssets from '@/api/admin/assets/deleteAssets.ts';
import { httpErrorToHuman } from '@/api/axios.ts';
import ActionBar from '@/elements/ActionBar.tsx';
import Button from '@/elements/Button.tsx';
import Code from '@/elements/Code.tsx';
import ConfirmationModal from '@/elements/modals/ConfirmationModal.tsx';
import { useToast } from '@/providers/ToastProvider.tsx';
import { useAdminStore } from '@/stores/admin.tsx';

export default function AssetActionBar() {
  const { addToast } = useToast();
  const { removeAssets, selectedAssets, setSelectedAssets } = useAdminStore();

  const [openModal, setOpenModal] = useState<'delete' | null>(null);

  const doDelete = async () => {
    await deleteAssets(selectedAssets)
      .then(({ deleted }) => {
        removeAssets(selectedAssets);

        addToast(`${deleted} Asset${deleted === 1 ? '' : 's'} deleted.`, 'success');
        setSelectedAssets([]);
        setOpenModal(null);
      })
      .catch((msg) => {
        addToast(httpErrorToHuman(msg), 'error');
      });
  };

  return (
    <>
      <ConfirmationModal
        opened={openModal === 'delete'}
        onClose={() => setOpenModal(null)}
        title='Confirm Asset Deletion'
        confirm='Delete'
        onConfirmed={doDelete}
      >
        Are you sure you want to delete <Code>{selectedAssets.length}</Code> assets?
      </ConfirmationModal>

      <ActionBar opened={selectedAssets.length > 0}>
        <Button color='red' onClick={() => setOpenModal('delete')} className='col-span-2'>
          <FontAwesomeIcon icon={faTrash} className='mr-2' /> Delete
        </Button>
      </ActionBar>
    </>
  );
}
