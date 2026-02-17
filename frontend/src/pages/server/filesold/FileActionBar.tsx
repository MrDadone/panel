import {
  faAnglesDown,
  faAnglesUp,
  faArchive,
  faCopy,
  faFileDownload,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { join } from 'pathe';
import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { httpErrorToHuman } from '@/api/axios.ts';
import copyFiles from '@/api/server/files/copyFiles.ts';
import downloadFiles from '@/api/server/files/downloadFiles.ts';
import renameFiles from '@/api/server/files/renameFiles.ts';
import ActionBar from '@/elements/ActionBar.tsx';
import Button from '@/elements/Button.tsx';
import { ServerCan } from '@/elements/Can.tsx';
import { useToast } from '@/providers/ToastProvider.tsx';
import { useServerStore } from '@/stores/server.ts';
import { useFileKeyboardActions } from './hooks/useFileKeyboardActions.ts';
import ArchiveCreateModal from './modals/ArchiveCreateModal.tsx';
import CopyFileRemoteModal from './modals/FileCopyRemoteModal.tsx';
import FileDeleteModal from './modals/FileDeleteModal.tsx';

export default function FileActionBar() {
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();
  const {
    server,
    browsingDirectory,
    browsingWritableDirectory,
    selectedFileNames,
    setSelectedFiles,
    actingFileMode,
    actingFileNames,
    actingFilesDirectory,
    setActingFiles,
    clearActingFiles,
    getSelectedFiles,
    refreshFiles,
  } = useServerStore();

  const [openModal, setOpenModal] = useState<'copy-remote' | 'archive' | 'delete' | null>(null);
  const [loading, setLoading] = useState(false);

  const doCopy = () => {
    setLoading(true);

    copyFiles({
      uuid: server.uuid,
      root: '/',
      files: [...actingFileNames].map((f) => ({
        from: join(actingFilesDirectory!, f),
        to: join(browsingDirectory!, f),
      })),
    })
      .then(() => {
        addToast(
          `${actingFileNames.size} File${actingFileNames.size === 1 ? ' has' : 's have'} started copying.`,
          'success',
        );
        clearActingFiles();
      })
      .catch((msg) => {
        addToast(httpErrorToHuman(msg), 'error');
      })
      .finally(() => setLoading(false));
  };

  const doMove = () => {
    setLoading(true);

    renameFiles({
      uuid: server.uuid,
      root: '/',
      files: [...actingFileNames].map((f) => ({
        from: join(actingFilesDirectory!, f),
        to: join(browsingDirectory!, f),
      })),
    })
      .then(({ renamed }) => {
        if (renamed < 1) {
          addToast('Files could not be moved.', 'error');
          return;
        }

        addToast(`${renamed} File${renamed === 1 ? ' has' : 's have'} moved.`, 'success');
        clearActingFiles();
        refreshFiles(Number(searchParams.get('page')) || 1);
      })
      .catch((msg) => {
        addToast(httpErrorToHuman(msg), 'error');
      })
      .finally(() => setLoading(false));
  };

  const doDownload = () => {
    setLoading(true);

    const selectedFiles = getSelectedFiles();
    downloadFiles(
      server.uuid,
      browsingDirectory!,
      selectedFiles.map((f) => f.name),
      selectedFiles.length === 1 ? selectedFiles[0].directory : false,
      'zip',
    )
      .then(({ url }) => {
        addToast('Download started.', 'success');
        window.open(url);
      })
      .catch((msg) => {
        addToast(httpErrorToHuman(msg), 'error');
      })
      .finally(() => setLoading(false));
  };

  useFileKeyboardActions({
    onDelete: () => setOpenModal('delete'),
    onPaste: () => (actingFileMode === 'copy' ? doCopy() : doMove()),
  });

  const selectedFiles = getSelectedFiles();

  return (
    <>
      <CopyFileRemoteModal
        key='CopyFileRemoteModal'
        files={[...selectedFiles]}
        opened={openModal === 'copy-remote'}
        onClose={() => setOpenModal(null)}
      />
      <ArchiveCreateModal
        key='ArchiveCreateModal'
        files={[...selectedFiles]}
        opened={openModal === 'archive'}
        onClose={() => setOpenModal(null)}
      />
      <FileDeleteModal
        key='FileDeleteModal'
        files={[...selectedFiles]}
        opened={openModal === 'delete'}
        onClose={() => setOpenModal(null)}
      />
      <ActionBar opened={actingFileNames.size > 0 || selectedFileNames.size > 0}>
        {actingFileNames.size > 0 ? (
          <>
            {actingFileMode === 'copy' ? (
              <Button onClick={doCopy} loading={loading}>
                <FontAwesomeIcon icon={faAnglesDown} className='mr-2' /> Copy {actingFileNames.size} File
                {actingFileNames.size === 1 ? '' : 's'} Here
              </Button>
            ) : (
              <Button onClick={doMove} loading={loading}>
                <FontAwesomeIcon icon={faAnglesDown} className='mr-2' /> Move {actingFileNames.size} File
                {actingFileNames.size === 1 ? '' : 's'} Here
              </Button>
            )}
            <Button variant='default' onClick={clearActingFiles}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <ServerCan action='files.read-content'>
              <Button onClick={doDownload} loading={loading}>
                <FontAwesomeIcon icon={faFileDownload} className='mr-2' /> Download
              </Button>
            </ServerCan>
            <ServerCan action='files.read'>
              <Button onClick={() => setOpenModal('copy-remote')}>
                <FontAwesomeIcon icon={faCopy} className='mr-2' /> Remote Copy
              </Button>
            </ServerCan>
            <ServerCan action='files.create'>
              <Button
                onClick={() => {
                  setActingFiles('copy', selectedFiles);
                  setSelectedFiles([]);
                }}
              >
                <FontAwesomeIcon icon={faCopy} className='mr-2' /> Copy
              </Button>
            </ServerCan>
            {browsingWritableDirectory && (
              <>
                <ServerCan action='files.archive'>
                  <Button onClick={() => setOpenModal('archive')}>
                    <FontAwesomeIcon icon={faArchive} className='mr-2' /> Archive
                  </Button>
                </ServerCan>
                <ServerCan action='files.update'>
                  <Button
                    onClick={() => {
                      setActingFiles('move', selectedFiles);
                      setSelectedFiles([]);
                    }}
                  >
                    <FontAwesomeIcon icon={faAnglesUp} className='mr-2' /> Move
                  </Button>
                </ServerCan>
                <ServerCan action='files.delete'>
                  <Button color='red' onClick={() => setOpenModal('delete')}>
                    <FontAwesomeIcon icon={faTrash} className='mr-2' />
                    Delete
                  </Button>
                </ServerCan>
              </>
            )}
          </>
        )}
      </ActionBar>
    </>
  );
}
