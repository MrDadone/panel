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
import { httpErrorToHuman } from '@/api/axios.ts';
import copyFiles from '@/api/server/files/copyFiles.ts';
import downloadFiles from '@/api/server/files/downloadFiles.ts';
import renameFiles from '@/api/server/files/renameFiles.ts';
import ActionBar from '@/elements/ActionBar.tsx';
import Button from '@/elements/Button.tsx';
import { ServerCan } from '@/elements/Can.tsx';
import Tooltip from '@/elements/Tooltip.tsx';
import { useKeyboardShortcuts } from '@/plugins/useKeyboardShortcuts.ts';
import { useFileManager } from '@/providers/contexts/fileManagerContext.ts';
import { useToast } from '@/providers/ToastProvider.tsx';
import { useServerStore } from '@/stores/server.ts';

function FileActionBar() {
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
      files: actingFiles.values().map((f) => ({
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
      files: actingFiles.values().map((f) => ({
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
      selectedFiles.keys(),
      selectedFiles.size === 1 ? selectedFiles.values()[0].directory : false,
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

  useKeyboardShortcuts({
    shortcuts: [
      {
        key: 'Escape',
        callback: () => {
          clearActingFiles();
          doSelectFiles([]);
        },
      },
      {
        key: 'x',
        modifiers: ['ctrlOrMeta'],
        callback: () => {
          if (actingFiles.size === 0 && selectedFiles.size > 0 && browsingWritableDirectory) {
            doActFiles('move', selectedFiles.values());
            doSelectFiles([]);
          }
        },
      },
      {
        key: 'c',
        modifiers: ['ctrlOrMeta'],
        callback: () => {
          if (actingFiles.size === 0 && selectedFiles.size > 0) {
            doActFiles('copy', selectedFiles.values());
            doSelectFiles([]);
          }
        },
      },
      {
        key: 'v',
        modifiers: ['ctrlOrMeta'],
        callback: () => {
          if (actingFiles.size > 0 && !loading) {
            if (actingMode === 'copy') {
              doCopy();
            } else {
              doMove();
            }
          }
        },
      },
      {
        key: 'Delete',
        callback: () => {
          if (actingFiles.size === 0 && selectedFiles.size > 0 && browsingWritableDirectory) {
            doOpenModal('delete', selectedFiles.values());
          }
        },
      },
    ],
    deps: [actingMode, actingFiles, selectedFiles, loading, browsingWritableDirectory],
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
                <Button onClick={() => doOpenModal('copy-remote', selectedFiles.values())}>
                  <FontAwesomeIcon icon={faClone} />
                </Button>
              </Tooltip>
            </ServerCan>
            <ServerCan action='files.create'>
              <Tooltip label='Copy'>
                <Button
                  onClick={() => {
                    doActFiles('copy', selectedFiles.values());
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
                    <Button onClick={() => doOpenModal('archive', selectedFiles.values())}>
                      <FontAwesomeIcon icon={faArchive} />
                    </Button>
                  </Tooltip>
                </ServerCan>
                <ServerCan action='files.update'>
                  <Tooltip label='Move'>
                    <Button
                      onClick={() => {
                        doActFiles('move', selectedFiles.values());
                        doSelectFiles([]);
                      }}
                    >
                      <FontAwesomeIcon icon={faAnglesUp} />
                    </Button>
                  </Tooltip>
                </ServerCan>
                <ServerCan action='files.delete'>
                  <Tooltip label='Delete'>
                    <Button color='red' onClick={() => doOpenModal('delete', selectedFiles.values())}>
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
