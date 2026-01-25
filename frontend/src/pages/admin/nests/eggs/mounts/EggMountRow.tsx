import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { NavLink } from 'react-router';
import deleteEggMount from '@/api/admin/nests/eggs/mounts/deleteEggMount.ts';
import { httpErrorToHuman } from '@/api/axios.ts';
import Code from '@/elements/Code.tsx';
import ContextMenu, { ContextMenuToggle } from '@/elements/ContextMenu.tsx';
import ConfirmationModal from '@/elements/modals/ConfirmationModal.tsx';
import { TableData, TableRow } from '@/elements/Table.tsx';
import FormattedTimestamp from '@/elements/time/FormattedTimestamp.tsx';
import { useToast } from '@/providers/ToastProvider.tsx';
import { useAdminStore } from '@/stores/admin.tsx';

export default function EggMountRow({ nest, egg, mount }: { nest: AdminNest; egg: AdminNestEgg; mount: NodeMount }) {
  const { addToast } = useToast();
  const { removeEggMount } = useAdminStore();

  const [openModal, setOpenModal] = useState<'remove' | null>(null);

  const doRemove = async () => {
    await deleteEggMount(nest.uuid, egg.uuid, mount.mount.uuid)
      .then(() => {
        removeEggMount(mount);
        addToast('Egg Mount deleted.', 'success');
      })
      .catch((msg) => {
        addToast(httpErrorToHuman(msg), 'error');
      });
  };

  return (
    <>
      <ConfirmationModal
        opened={openModal === 'remove'}
        onClose={() => setOpenModal(null)}
        title='Confirm Egg Mount Removal'
        confirm='Delete'
        onConfirmed={doRemove}
      >
        Are you sure you want to remove the mount
        <Code>{mount.mount.name}</Code>
        from <Code>{egg.name}</Code>?
      </ConfirmationModal>

      <ContextMenu
        items={[
          {
            icon: faTrash,
            label: 'Remove',
            onClick: () => setOpenModal('remove'),
            color: 'red',
          },
        ]}
      >
        {({ items, openMenu }) => (
          <TableRow
            onContextMenu={(e) => {
              e.preventDefault();
              openMenu(e.pageX, e.pageY);
            }}
          >
            <TableData>
              <NavLink
                to={`/admin/mounts/${mount.mount.uuid}`}
                className='text-blue-400 hover:text-blue-200 hover:underline'
              >
                <Code>{mount.mount.uuid}</Code>
              </NavLink>
            </TableData>
            <TableData>{mount.mount.name}</TableData>
            <TableData>
              <Code>{mount.mount.source}</Code>
            </TableData>
            <TableData>
              <Code>{mount.mount.target}</Code>
            </TableData>
            <TableData>
              <FormattedTimestamp timestamp={mount.created} />
            </TableData>

            <ContextMenuToggle items={items} openMenu={openMenu} />
          </TableRow>
        )}
      </ContextMenu>
    </>
  );
}
