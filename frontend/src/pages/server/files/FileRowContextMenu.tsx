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
import { createSearchParams, MemoryRouter } from 'react-router';
import { httpErrorToHuman } from '@/api/axios.ts';
import decompressFile from '@/api/server/files/decompressFile.ts';
import downloadFiles from '@/api/server/files/downloadFiles.ts';
import ContextMenu, { ContextMenuItem } from '@/elements/ContextMenu.tsx';
import { streamingArchiveFormatLabelMapping } from '@/lib/enums.ts';
import { isArchiveType, isEditableFile, isViewableArchive, isViewableImage } from '@/lib/files.ts';
import { useServerCan } from '@/plugins/usePermissions.ts';
import { useToast } from '@/providers/contexts/toastContext.ts';
import { useWindows } from '@/providers/contexts/windowContext.ts';
import { useFileManager } from '@/providers/FileManagerProvider.tsx';
import RouterRoutes from '@/RouterRoutes.tsx';
import { useGlobalStore } from '@/stores/global.ts';
import { useServerStore } from '@/stores/server.ts';

interface FileRowContextMenuProps {
  file: DirectoryEntry;
  children: (props: { items: ContextMenuItem[]; openMenu: (x: number, y: number) => void }) => React.ReactNode;
}

export default function FileRowContextMenu({ file, children }: FileRowContextMenuProps) {
  const { addToast } = useToast();
  const { addWindow } = useWindows();
  const { settings } = useGlobalStore();
  const { server, browsingBackup, browsingWritableDirectory, setActingFiles } = useServerStore();
  const { browsingDirectory, browsingFastDirectory, doOpenModal } = useFileManager();
  const canCreate = useServerCan('files.create');
  const canArchive = useServerCan('files.archive');

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
    <ContextMenu
      items={[
        {
          icon: faWindowRestore,
          label: 'Open in new Window',
          hidden:
            !matchMedia('(pointer: fine)').matches ||
            !(
              ((isEditableFile(file.mime) || isViewableImage(file.mime)) &&
                file.size <= settings.server.maxFileManagerViewSize) ||
              file.directory
            ),
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
                    : `/server/${server.uuidShort}/files/${isViewableImage(file.mime) ? 'image' : 'edit'}?${createSearchParams(
                        {
                          directory: browsingDirectory,
                          file: file.name,
                        },
                      )}`,
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
          onClick: () => doOpenModal('rename', file),
          canAccess: useServerCan('files.update'),
        },
        {
          icon: faCopy,
          label: 'Copy',
          hidden: !!browsingBackup || !browsingWritableDirectory || (!file.file && !file.directory),
          onClick: () => doOpenModal('copy', file),
          color: 'gray',
          canAccess: canCreate,
        },
        {
          icon: faAnglesUp,
          label: 'Move',
          hidden: !!browsingBackup || !browsingWritableDirectory,
          onClick: () => setActingFiles('move', [file]),
          color: 'gray',
          canAccess: useServerCan('files.update'),
        },
        {
          icon: faFileShield,
          label: 'Permissions',
          onClick: () => doOpenModal('permissions', file),
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
              onClick: () => doOpenModal('archive', file),
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
          onClick: () => doOpenModal('delete', file),
          color: 'red',
          canAccess: useServerCan('files.delete'),
        },
      ]}
    >
      {children}
    </ContextMenu>
  );
}
