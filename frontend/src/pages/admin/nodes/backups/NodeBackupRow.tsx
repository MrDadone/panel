import { faFileArrowDown, faRotateLeft, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { NavLink } from 'react-router';
import downloadNodeBackup from '@/api/admin/nodes/backups/downloadNodeBackup.ts';
import { httpErrorToHuman } from '@/api/axios.ts';
import Code from '@/elements/Code.tsx';
import ContextMenu, { ContextMenuToggle } from '@/elements/ContextMenu.tsx';
import Spinner from '@/elements/Spinner.tsx';
import { TableData, TableRow } from '@/elements/Table.tsx';
import FormattedTimestamp from '@/elements/time/FormattedTimestamp.tsx';
import { streamingArchiveFormatLabelMapping } from '@/lib/enums.ts';
import { bytesToString } from '@/lib/size.ts';
import { useToast } from '@/providers/ToastProvider.tsx';
import NodeBackupsDeleteModal from './modals/NodeBackupsDeleteModal.tsx';
import NodeBackupsRestoreModal from './modals/NodeBackupsRestoreModal.tsx';

export default function NodeBackupRow({ node, backup }: { node: Node; backup: AdminServerBackup }) {
  const { addToast } = useToast();

  const [openModal, setOpenModal] = useState<'restore' | 'delete' | null>(null);

  const doDownload = (archiveFormat: StreamingArchiveFormat) => {
    downloadNodeBackup(node.uuid, backup.uuid, archiveFormat)
      .then(({ url }) => {
        addToast('Download started.', 'success');
        window.open(url, '_blank');
      })
      .catch((msg) => {
        addToast(httpErrorToHuman(msg), 'error');
      });
  };

  return (
    <>
      <NodeBackupsRestoreModal
        node={node}
        backup={backup}
        opened={openModal === 'restore'}
        onClose={() => setOpenModal(null)}
      />
      <NodeBackupsDeleteModal
        node={node}
        backup={backup}
        opened={openModal === 'delete'}
        onClose={() => setOpenModal(null)}
      />

      <ContextMenu
        items={[
          {
            icon: faFileArrowDown,
            label: 'Download',
            onClick: !backup.isStreaming ? () => doDownload('tar_gz') : () => null,
            color: 'gray',
            items: backup.isStreaming
              ? Object.entries(streamingArchiveFormatLabelMapping).map(([mime, label]) => ({
                  icon: faFileArrowDown,
                  label: `Download as ${label}`,
                  onClick: () => doDownload(mime as StreamingArchiveFormat),
                  color: 'gray',
                }))
              : [],
          },
          {
            icon: faRotateLeft,
            label: 'Restore',
            onClick: () => setOpenModal('restore'),
            color: 'gray',
          },
          {
            icon: faTrash,
            label: 'Delete',
            onClick: () => setOpenModal('delete'),
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
            <TableData>{backup.name}</TableData>

            <TableData>
              <Code>
                {backup.server ? (
                  <NavLink
                    to={`/admin/servers/${backup.server.uuid}`}
                    className='text-blue-400 hover:text-blue-200 hover:underline'
                  >
                    {backup.server.name}
                  </NavLink>
                ) : (
                  '-'
                )}
              </Code>
            </TableData>

            <TableData>{backup.checksum && <Code>{backup.checksum}</Code>}</TableData>

            {backup.completed ? (
              <TableData>{bytesToString(backup.bytes)}</TableData>
            ) : (
              <TableData colSpan={2}>
                <Spinner />
              </TableData>
            )}

            <TableData>{backup.completed ? backup.files : null}</TableData>

            <TableData>
              <FormattedTimestamp timestamp={backup.created} />
            </TableData>

            <ContextMenuToggle items={items} openMenu={openMenu} />
          </TableRow>
        )}
      </ContextMenu>
    </>
  );
}
