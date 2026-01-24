import {
  faAnglesUp,
  faCopy,
  faEnvelopesBulk,
  faFile,
  faFileArrowDown,
  faFilePen,
  faFileShield,
  faFileZipper,
  faFolder,
  faTrash,
  faWindowRestore,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { forwardRef, memo, useEffect, useState } from 'react';
import { createSearchParams, MemoryRouter } from 'react-router';
import { httpErrorToHuman } from '@/api/axios.ts';
import decompressFile from '@/api/server/files/decompressFile.ts';
import downloadFiles from '@/api/server/files/downloadFiles.ts';
import ContextMenu, { ContextMenuToggle } from '@/elements/ContextMenu.tsx';
import Checkbox from '@/elements/input/Checkbox.tsx';
import { TableData } from '@/elements/Table.tsx';
import Tooltip from '@/elements/Tooltip.tsx';
import { streamingArchiveFormatLabelMapping } from '@/lib/enums.ts';
import { isArchiveType, isEditableFile, isViewableArchive } from '@/lib/files.ts';
import { bytesToString } from '@/lib/size.ts';
import { formatDateTime, formatTimestamp } from '@/lib/time.ts';
import { useServerCan } from '@/plugins/usePermissions.ts';
import { useToast } from '@/providers/ToastProvider.tsx';
import { useWindows } from '@/providers/WindowProvider.tsx';
import RouterRoutes from '@/RouterRoutes.tsx';
import { useGlobalStore } from '@/stores/global.ts';
import { useServerStore } from '@/stores/server.ts';
import { FileTableRow } from './FileTableRow.tsx';
import ArchiveCreateModal from './modals/ArchiveCreateModal.tsx';
import FileCopyModal from './modals/FileCopyModal.tsx';
import FileDeleteModal from './modals/FileDeleteModal.tsx';
import FilePermissionsModal from './modals/FilePermissionsModal.tsx';
import FileRenameModal from './modals/FileRenameModal.tsx';

interface FileRowProps {
  file: DirectoryEntry;
  setChildOpenModal: (open: boolean) => void;
  dndEnabled?: boolean;
}

const FileRow = memo(
  forwardRef<HTMLTableRowElement, FileRowProps>(function FileRow({ file, setChildOpenModal, dndEnabled = false }, ref) {
    const { addToast } = useToast();
    const { addWindow } = useWindows();
    const { settings } = useGlobalStore();
    const {
      server,
      browsingDirectory,
      browsingBackup,
      browsingWritableDirectory,
      browsingFastDirectory,
      movingFileNames,
      setMovingFiles,
      isFileSelected,
      addSelectedFile,
      removeSelectedFile,
    } = useServerStore();
    const canOpenActionBar = useServerCan(
      ['files.read-content', 'files.archive', 'files.update', 'files.delete'],
      true,
    );
    const canCreate = useServerCan('files.create');
    const canArchive = useServerCan('files.archive');

    const [openModal, setOpenModal] = useState<'rename' | 'copy' | 'permissions' | 'archive' | 'delete' | null>(null);

    useEffect(() => {
      setChildOpenModal(openModal !== null);
    }, [openModal, setChildOpenModal]);

    const doUnarchive = () => {
      decompressFile(server.uuid, browsingDirectory!, file.name).catch((msg) => {
        addToast(httpErrorToHuman(msg), 'error');
      });
    };

    const doDownload = (archiveFormat: StreamingArchiveFormat) => {
      downloadFiles(server.uuid, browsingDirectory!, [file.name], file.directory, archiveFormat)
        .then(({ url }) => {
          addToast('Download started.', 'success');
          window.open(url);
        })
        .catch((msg) => {
          addToast(httpErrorToHuman(msg), 'error');
        });
    };

    return (
      <>
        <FileCopyModal file={file} opened={openModal === 'copy'} onClose={() => setOpenModal(null)} />
        <FileRenameModal file={file} opened={openModal === 'rename'} onClose={() => setOpenModal(null)} />
        <FilePermissionsModal file={file} opened={openModal === 'permissions'} onClose={() => setOpenModal(null)} />
        <ArchiveCreateModal files={[file]} opened={openModal === 'archive'} onClose={() => setOpenModal(null)} />
        <FileDeleteModal files={[file]} opened={openModal === 'delete'} onClose={() => setOpenModal(null)} />

        <ContextMenu
          items={[
            {
              icon: faWindowRestore,
              label: 'Open in new Window',
              hidden:
                !matchMedia('(pointer: fine)').matches ||
                !((isEditableFile(file.mime) && file.size <= settings.server.maxFileManagerViewSize) || file.directory),
              onClick: () =>
                addWindow(
                  file.file ? faFile : faFolder,
                  file.name,
                  <MemoryRouter
                    initialEntries={[
                      file.directory || (isViewableArchive(file) && browsingFastDirectory)
                        ? `/server/${server.uuidShort}/files?${createSearchParams({
                            directory: `${browsingDirectory}/${file.name}`.replace('//', '/'),
                          })}`
                        : `/server/${server.uuidShort}/files/edit?${createSearchParams({
                            directory: browsingDirectory,
                            file: file.name,
                          })}`,
                    ]}
                  >
                    <RouterRoutes isNormal={false} />
                  </MemoryRouter>,
                ),
              canAccess: useServerCan('files.read-content'),
            },
            {
              icon: faFilePen,
              label: 'Rename',
              hidden: !!browsingBackup || !browsingWritableDirectory,
              onClick: () => setOpenModal('rename'),
              canAccess: useServerCan('files.update'),
            },
            {
              icon: faCopy,
              label: 'Copy',
              hidden: !!browsingBackup || !browsingWritableDirectory || (!file.file && !file.directory),
              onClick: () => setOpenModal('copy'),
              color: 'gray',
              canAccess: canCreate,
            },
            {
              icon: faAnglesUp,
              label: 'Move',
              hidden: !!browsingBackup || !browsingWritableDirectory,
              onClick: () => setMovingFiles([file]),
              color: 'gray',
              canAccess: useServerCan('files.update'),
            },
            {
              icon: faFileShield,
              label: 'Permissions',
              onClick: () => setOpenModal('permissions'),
              color: 'gray',
              canAccess: useServerCan('files.update'),
            },
            isArchiveType(file.mime) && !browsingBackup
              ? {
                  icon: faEnvelopesBulk,
                  label: 'Unarchive',
                  hidden: !!browsingBackup || !browsingWritableDirectory,
                  onClick: doUnarchive,
                  color: 'gray',
                  canAccess: canCreate,
                }
              : {
                  icon: faFileZipper,
                  label: 'Archive',
                  hidden: !!browsingBackup || !browsingWritableDirectory,
                  onClick: () => setOpenModal('archive'),
                  color: 'gray',
                  canAccess: canArchive,
                },
            {
              icon: faFileArrowDown,
              label: 'Download',
              onClick: file.file ? () => doDownload('tar_gz') : () => null,
              color: 'gray',
              items: file.directory
                ? Object.entries(streamingArchiveFormatLabelMapping).map(([mime, label]) => ({
                    icon: faFileArrowDown,
                    label: `Download as ${label}`,
                    onClick: () => doDownload(mime as StreamingArchiveFormat),
                    color: 'gray',
                  }))
                : [],
              canAccess: useServerCan('files.read-content'),
            },
            {
              icon: faTrash,
              label: 'Delete',
              hidden: !!browsingBackup || !browsingWritableDirectory,
              onClick: () => setOpenModal('delete'),
              color: 'red',
              canAccess: useServerCan('files.delete'),
            },
          ]}
        >
          {({ items, openMenu }) => (
            <FileTableRow
              file={file}
              ref={ref}
              dndEnabled={dndEnabled}
              onContextMenu={(e) => {
                e.preventDefault();
                openMenu(e.clientX, e.clientY);
              }}
              onClick={(e) => {
                if ((e.ctrlKey || e.metaKey) && movingFileNames.size === 0) {
                  e.stopPropagation();
                  addSelectedFile(file);
                }
              }}
            >
              {canOpenActionBar ? (
                <td className='pl-4 relative cursor-pointer w-10 text-center py-2'>
                  <Checkbox
                    id={file.name}
                    disabled={movingFileNames.size > 0}
                    checked={isFileSelected(file)}
                    classNames={{ input: 'cursor-pointer!' }}
                    onChange={() => {
                      if (isFileSelected(file)) {
                        removeSelectedFile(file);
                      } else {
                        addSelectedFile(file);
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
              ) : (
                <td className='w-0'></td>
              )}

              <TableData>
                <span className='flex items-center gap-4 leading-[100%]'>
                  <FontAwesomeIcon className='text-gray-400' icon={file.file ? faFile : faFolder} />
                  {file.name}
                </span>
              </TableData>

              <TableData>
                <span className='flex items-center gap-4 leading-[100%]'>{bytesToString(file.size)}</span>
              </TableData>

              <TableData>
                <Tooltip label={formatDateTime(file.modified)}>
                  <span className='flex items-center gap-4 leading-[100%]'>{formatTimestamp(file.modified)}</span>
                </Tooltip>
              </TableData>

              <ContextMenuToggle items={items} openMenu={openMenu} />
            </FileTableRow>
          )}
        </ContextMenu>
      </>
    );
  }),
);

export default FileRow;
