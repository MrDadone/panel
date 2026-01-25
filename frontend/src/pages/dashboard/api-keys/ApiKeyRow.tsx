import { faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { httpErrorToHuman } from '@/api/axios.ts';
import deleteApiKey from '@/api/me/api-keys/deleteApiKey.ts';
import Code from '@/elements/Code.tsx';
import ContextMenu, { ContextMenuToggle } from '@/elements/ContextMenu.tsx';
import CopyOnClick from '@/elements/CopyOnClick.tsx';
import ConfirmationModal from '@/elements/modals/ConfirmationModal.tsx';
import { TableData, TableRow } from '@/elements/Table.tsx';
import FormattedTimestamp from '@/elements/time/FormattedTimestamp.tsx';
import ApiKeyCreateOrUpdateModal from '@/pages/dashboard/api-keys/modals/ApiKeyCreateOrUpdateModal.tsx';
import { useToast } from '@/providers/ToastProvider.tsx';
import { useTranslations } from '@/providers/TranslationProvider.tsx';
import { useUserStore } from '@/stores/user.ts';

export default function ApiKeyRow({ apiKey }: { apiKey: UserApiKey }) {
  const { t } = useTranslations();
  const { addToast } = useToast();
  const { removeApiKey } = useUserStore();

  const [openModal, setOpenModal] = useState<'edit' | 'delete' | null>(null);

  const doDelete = async () => {
    await deleteApiKey(apiKey.uuid)
      .then(() => {
        removeApiKey(apiKey);
        addToast(t('pages.account.apiKeys.modal.deleteApiKey.toast.removed', {}), 'success');
      })
      .catch((msg) => {
        addToast(httpErrorToHuman(msg), 'error');
      });
  };

  return (
    <>
      <ApiKeyCreateOrUpdateModal
        contextApiKey={apiKey}
        opened={openModal === 'edit'}
        onClose={() => setOpenModal(null)}
      />
      <ConfirmationModal
        opened={openModal === 'delete'}
        onClose={() => setOpenModal(null)}
        title={t('pages.account.apiKeys.modal.deleteApiKey.title', {})}
        confirm={t('common.button.delete', {})}
        onConfirmed={doDelete}
      >
        {t('pages.account.apiKeys.modal.deleteApiKey.content', { name: apiKey.name }).md()}
      </ConfirmationModal>

      <ContextMenu
        items={[
          { icon: faPencil, label: t('common.button.edit', {}), onClick: () => setOpenModal('edit'), color: 'gray' },
          { icon: faTrash, label: t('common.button.remove', {}), onClick: () => setOpenModal('delete'), color: 'red' },
        ]}
      >
        {({ items, openMenu }) => (
          <TableRow
            onContextMenu={(e) => {
              e.preventDefault();
              openMenu(e.pageX, e.pageY);
            }}
          >
            <TableData>{apiKey.name}</TableData>

            <TableData>
              <CopyOnClick content={apiKey.keyStart}>
                <Code>{apiKey.keyStart}</Code>
              </CopyOnClick>
            </TableData>

            <TableData>
              {apiKey.userPermissions.length} / {apiKey.serverPermissions.length} / {apiKey.adminPermissions.length}
            </TableData>

            <TableData>
              {!apiKey.lastUsed ? t('common.na', {}) : <FormattedTimestamp timestamp={apiKey.lastUsed} />}
            </TableData>

            <TableData>
              {!apiKey.expires ? t('common.na', {}) : <FormattedTimestamp timestamp={apiKey.expires} />}
            </TableData>

            <TableData>
              <FormattedTimestamp timestamp={apiKey.created} />
            </TableData>

            <ContextMenuToggle items={items} openMenu={openMenu} />
          </TableRow>
        )}
      </ContextMenu>
    </>
  );
}
