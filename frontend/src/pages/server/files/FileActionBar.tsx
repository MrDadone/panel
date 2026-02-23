import {
  faAnglesDown,
  faAnglesUp,
  faArchive,
  faBan,
  faClone,
  faCopy,
  faFileDownload,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { join } from 'pathe';
import { memo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { httpErrorToHuman } from '@/api/axios.ts';
import copyFiles from '@/api/server/files/copyFiles.ts';
import downloadFiles from '@/api/server/files/downloadFiles.ts';
import renameFiles from '@/api/server/files/renameFiles.ts';
import ActionBar from '@/elements/ActionBar.tsx';
import Button from '@/elements/Button.tsx';
import { ServerCan } from '@/elements/Can.tsx';
import Tooltip from '@/elements/Tooltip.tsx';
import { useFileManager } from '@/providers/contexts/fileManagerContext.ts';
import { useToast } from '@/providers/ToastProvider.tsx';
import { useServerStore } from '@/stores/server.ts';
import { useFileKeyboardActions } from './hooks/useFileKeyboardActions.ts';

function FileActionBar() {
  const [_searchParams, _] = useSearchParams();
  const { addToast } = useToast();
  const { server } = useServerStore();
  const {
    actingMode,
    actingFiles,
    selectedFiles,
    actingFilesSource,
    browsingDirectory,
    browsingWritableDirectory,
    doActFiles,
    doSelectFiles,
    clearActingFiles,
    doOpenModal,
    invalidateFilemanager,
  } = useFileManager();

  const [loading, setLoading] = useState(false);

  const doCopy = () => {
    setLoading(true);

    copyFiles({
      uuid: server.uuid,
      root: '/',
      files: [...actingFiles].map((f) => ({
        from: join(actingFilesSource!, f.name),
        to: join(browsingDirectory, f.name),
      })),
    })
      .then(() => {
        addToast(`${actingFiles.size} File${actingFiles.size === 1 ? ' has' : 's have'} started copying.`, 'success');
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
      files: [...actingFiles].map((f) => ({
        from: join(actingFilesSource!, f.name),
        to: join(browsingDirectory, f.name),
      })),
    })
      .then(({ renamed }) => {
        if (renamed < 1) {
          addToast('Files could not be moved.', 'error');
          return;
        }

        addToast(`${renamed} File${renamed === 1 ? ' has' : 's have'} moved.`, 'success');
        clearActingFiles();
        invalidateFilemanager();
      })
      .catch((msg) => {
        addToast(httpErrorToHuman(msg), 'error');
      })
      .finally(() => setLoading(false));
  };

  const doDownload = () => {
    setLoading(true);

    downloadFiles(
      server.uuid,
      browsingDirectory,
      [...selectedFiles].map((f) => f.name),
      selectedFiles.size === 1 ? [...selectedFiles][0].directory : false,
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
    onDelete: () => doOpenModal('delete', [...selectedFiles]),
    onPaste: () => (actingMode === 'copy' ? doCopy() : doMove()),
  });

  return (
    <>
      <ActionBar opened={actingFiles.size > 0 || selectedFiles.size > 0}>
        {actingFiles.size > 0 ? (
          <>
            {actingMode === 'copy' ? (
              <Tooltip label={`Copy ${actingFiles.size} file${actingFiles.size === 1 ? '' : 's'} here`}>
                <Button onClick={doCopy} loading={loading}>
                  <FontAwesomeIcon icon={faAnglesDown} />
                </Button>
              </Tooltip>
            ) : (
              <Tooltip label={`Move ${actingFiles.size} file${actingFiles.size === 1 ? '' : 's'} here`}>
                <Button onClick={doMove} loading={loading}>
                  <FontAwesomeIcon icon={faAnglesDown} />
                </Button>
              </Tooltip>
            )}
            <Tooltip label='Cancel'>
              <Button variant='default' onClick={clearActingFiles}>
                <FontAwesomeIcon icon={faBan} />
              </Button>
            </Tooltip>
          </>
        ) : (
          <>
            <ServerCan action='files.read-content'>
              <Tooltip label='Download'>
                <Button onClick={doDownload} loading={loading}>
                  <FontAwesomeIcon icon={faFileDownload} />
                </Button>
              </Tooltip>
            </ServerCan>
            <ServerCan action='files.read'>
              <Tooltip label='Remote Copy'>
                <Button onClick={() => doOpenModal('copy-remote', [...selectedFiles])}>
                  <FontAwesomeIcon icon={faClone} />
                </Button>
              </Tooltip>
            </ServerCan>
            <ServerCan action='files.create'>
              <Tooltip label='Copy'>
                <Button
                  onClick={() => {
                    doActFiles('copy', [...selectedFiles]);
                    doSelectFiles([]);
                  }}
                >
                  <FontAwesomeIcon icon={faCopy} />
                </Button>
              </Tooltip>
            </ServerCan>
            {browsingWritableDirectory && (
              <>
                <ServerCan action='files.archive'>
                  <Tooltip label='Archive'>
                    <Button onClick={() => doOpenModal('archive', [...selectedFiles])}>
                      <FontAwesomeIcon icon={faArchive} />
                    </Button>
                  </Tooltip>
                </ServerCan>
                <ServerCan action='files.update'>
                  <Tooltip label='Move'>
                    <Button
                      onClick={() => {
                        doActFiles('move', [...selectedFiles]);
                        doSelectFiles([]);
                      }}
                    >
                      <FontAwesomeIcon icon={faAnglesUp} />
                    </Button>
                  </Tooltip>
                </ServerCan>
                <ServerCan action='files.delete'>
                  <Tooltip label='Delete'>
                    <Button color='red' onClick={() => doOpenModal('delete', [...selectedFiles])}>
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </Tooltip>
                </ServerCan>
              </>
            )}
          </>
        )}
      </ActionBar>
    </>
  );
}

export default memo(FileActionBar);
