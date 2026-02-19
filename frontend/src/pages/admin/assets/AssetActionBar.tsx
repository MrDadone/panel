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

export default function AssetActionBar({
  selectedAssets,
  invalidateAssets,
}: {
  selectedAssets: Set<string>;
  invalidateAssets: () => void;
}) {
  const { addToast } = useToast();

  const [openModal, setOpenModal] = useState<'delete' | null>(null);

  const doDelete = async () => {
    await deleteAssets([...selectedAssets])
      .then(({ deleted }) => {
        invalidateAssets();

        addToast(`${deleted} Asset${deleted === 1 ? '' : 's'} deleted.`, 'success');
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
        Are you sure you want to delete <Code>{selectedAssets.size}</Code> assets?
      </ConfirmationModal>

      <ActionBar opened={selectedAssets.size > 0}>
        <Button color='red' onClick={() => setOpenModal('delete')} className='col-span-2'>
          <FontAwesomeIcon icon={faTrash} className='mr-2' /> Delete
        </Button>
      </ActionBar>
    </>
  );
}
