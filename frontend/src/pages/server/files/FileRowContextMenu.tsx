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
  faInfoCircle,
  faTrash,
  faWindowRestore,
} from '@fortawesome/free-solid-svg-icons';
import { createSearchParams, MemoryRouter } from 'react-router';
import { z } from 'zod';
import { httpErrorToHuman } from '@/api/axios.ts';
import decompressFile from '@/api/server/files/decompressFile.ts';
import downloadFiles from '@/api/server/files/downloadFiles.ts';
import ContextMenu, { ContextMenuItem } from '@/elements/ContextMenu.tsx';
import { streamingArchiveFormatLabelMapping } from '@/lib/enums.ts';
import { isArchiveType, isEditableFile, isViewableArchive, isViewableImage } from '@/lib/files.ts';
import { streamingArchiveFormat } from '@/lib/schemas/generic.ts';
import { serverDirectoryEntrySchema } from '@/lib/schemas/server/files.ts';
import { useServerCan } from '@/plugins/usePermissions.ts';
import { useToast } from '@/providers/contexts/toastContext.ts';
import { useWindows } from '@/providers/contexts/windowContext.ts';
import { useFileManager } from '@/providers/FileManagerProvider.tsx';
import { useTranslations } from '@/providers/TranslationProvider.tsx';
import RouterRoutes from '@/RouterRoutes.tsx';
import { useGlobalStore } from '@/stores/global.ts';
import { useServerStore } from '@/stores/server.ts';

interface FileRowContextMenuProps {
  file: z.infer<typeof serverDirectoryEntrySchema>;
  children: (props: { items: ContextMenuItem[]; openMenu: (x: number, y: number) => void }) => React.ReactNode;
}

export default function FileRowContextMenu({ file, children }: FileRowContextMenuProps) {
  const { t } = useTranslations();
  const { addToast } = useToast();
  const { addWindow } = useWindows();
  const { settings } = useGlobalStore();
  const { server } = useServerStore();
  const {
    browsingBackup,
    browsingDirectory,
    browsingWritableDirectory,
    browsingFastDirectory,
    doOpenModal,
    doActFiles,
  } = useFileManager();
  const canCreate = useServerCan('files.create');
  const canArchive = useServerCan('files.archive');

  const doUnarchive = () => {
    decompressFile(server.uuid, browsingDirectory, file.name).catch((msg) => {
      addToast(httpErrorToHuman(msg), 'error');
    });
  };

  const doDownload = (archiveFormat: z.infer<typeof streamingArchiveFormat>) => {
    downloadFiles(server.uuid, browsingDirectory, [file.name], file.directory, archiveFormat)
      .then(({ url }) => {
        addToast(t('pages.server.files.toast.downloadStarted', {}), 'success');
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
          label: t('pages.server.files.button.openInNewWindow', {}),
          hidden:
            !matchMedia('(pointer: fine)').matches ||
            !(
              ((isEditableFile(file) || isViewableImage(file)) &&
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
                    : `/server/${server.uuidShort}/files/${isViewableImage(file) ? 'image' : 'edit'}?${createSearchParams(
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
          icon: faInfoCircle,
          label: t('pages.server.files.button.details', {}),
          onClick: () => doOpenModal('details', [file]),
          color: 'gray',
        },
        {
          icon: faFilePen,
          label: t('pages.server.files.button.rename', {}),
          hidden: !!browsingBackup || !browsingWritableDirectory,
          onClick: () => doOpenModal('rename', [file]),
          canAccess: useServerCan('files.update'),
        },
        {
          icon: faCopy,
          label: t('pages.server.files.button.copy', {}),
          hidden: !!browsingBackup || !browsingWritableDirectory || (!file.file && !file.directory),
          onClick: () => doOpenModal('copy', [file]),
          color: 'gray',
          canAccess: canCreate,
        },
        {
          icon: faAnglesUp,
          label: t('pages.server.files.button.move', {}),
          hidden: !!browsingBackup || !browsingWritableDirectory,
          onClick: () => doActFiles('move', [file]),
          color: 'gray',
          canAccess: useServerCan('files.update'),
        },
        {
          icon: faFileShield,
          label: t('pages.server.files.button.permissions', {}),
          onClick: () => doOpenModal('permissions', [file]),
          color: 'gray',
          canAccess: useServerCan('files.update'),
        },
        isArchiveType(file) && !browsingBackup
          ? {
              icon: faEnvelopesBulk,
              label: t('pages.server.files.button.unarchive', {}),
              hidden: !!browsingBackup || !browsingWritableDirectory,
              onClick: doUnarchive,
              color: 'gray',
              canAccess: canCreate,
            }
          : {
              icon: faFileZipper,
              label: t('pages.server.files.button.archive', {}),
              hidden: !!browsingBackup || !browsingWritableDirectory,
              onClick: () => doOpenModal('archive', [file]),
              color: 'gray',
              canAccess: canArchive,
            },
        {
          icon: faFileArrowDown,
          label: t('common.button.download', {}),
          onClick: file.file ? () => doDownload('tar_gz') : () => null,
          color: 'gray',
          items: file.directory
            ? Object.entries(streamingArchiveFormatLabelMapping).map(([mime, label]) => ({
                icon: faFileArrowDown,
                label: t('common.button.downloadAs', { format: label }),
                onClick: () => doDownload(mime as z.infer<typeof streamingArchiveFormat>),
                color: 'gray',
              }))
            : [],
          canAccess: useServerCan('files.read-content'),
        },
        {
          icon: faTrash,
          label: t('common.button.delete', {}),
          hidden: !!browsingBackup || !browsingWritableDirectory,
          onClick: () => doOpenModal('delete', [file]),
          color: 'red',
          canAccess: useServerCan('files.delete'),
        },
      ]}
      registry={window.extensionContext.extensionRegistry.pages.server.files.fileContextMenu}
      registryProps={{ file }}
    >
      {children}
    </ContextMenu>
  );
}
