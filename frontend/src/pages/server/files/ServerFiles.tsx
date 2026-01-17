import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Group, Title } from '@mantine/core';
import { MouseEvent as ReactMouseEvent, type Ref, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { httpErrorToHuman } from '@/api/axios.ts';
import getBackup from '@/api/server/backups/getBackup.ts';
import cancelOperation from '@/api/server/files/cancelOperation.ts';
import loadDirectory from '@/api/server/files/loadDirectory.ts';
import { ContextMenuProvider } from '@/elements/ContextMenu.tsx';
import ServerContentContainer from '@/elements/containers/ServerContentContainer.tsx';
import SelectionArea from '@/elements/SelectionArea.tsx';
import Spinner from '@/elements/Spinner.tsx';
import Table from '@/elements/Table.tsx';
import { useFileUpload } from '@/plugins/useFileUpload.ts';
import { useToast } from '@/providers/ToastProvider.tsx';
import { useServerStore } from '@/stores/server.ts';
import FileActionBar from './FileActionBar.tsx';
import FileBreadcrumbs from './FileBreadcrumbs.tsx';
import FileDragOverlay from './FileDragOverlay.tsx';
import FileOperationsProgress from './FileOperationsProgress.tsx';
import FileRow from './FileRow.tsx';
import FileToolbar from './FileToolbar.tsx';
import FileUploadOverlay from './FileUploadOverlay.tsx';
import { useFileDragAndDrop } from './hooks/useFileDragAndDrop.ts';
import { useFileMoveHandler } from './hooks/useFileMoveDropzone.ts';
import DirectoryNameModal from './modals/DirectoryNameModal.tsx';
import PullFileModal from './modals/PullFileModal.tsx';
import SftpDetailsModal from './modals/SftpDetailsModal.tsx';

export default function ServerFiles() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast } = useToast();
  const {
    server,
    browsingDirectory,
    setBrowsingDirectory,
    browsingBackup,
    setBrowsingBackup,
    browsingWritableDirectory,
    setBrowsingWritableDirectory,
    setBrowsingFastDirectory,
    browsingEntries,
    setBrowsingEntries,
    selectedFileNames,
    setSelectedFiles,
    movingFileNames,
    fileOperations,
    removeFileOperation,
  } = useServerStore();

  const [openModal, setOpenModal] = useState<'sftpDetails' | 'nameDirectory' | 'pullFile' | null>(null);
  const [childOpenModal, setChildOpenModal] = useState(false);
  const [loading, setLoading] = useState(browsingEntries.data.length === 0);
  const [page, setPage] = useState(1);
  const [selectedFilesPrevious, setSelectedFilesPrevious] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Define loadDirectoryData early so it can be used by hooks
  const loadDirectoryData = useCallback(() => {
    setLoading(true);

    loadDirectory(server.uuid, browsingDirectory!, page)
      .then((data) => {
        setBrowsingWritableDirectory(data.isFilesystemWritable);
        setBrowsingFastDirectory(data.isFilesystemFast);
        setBrowsingEntries(data.entries);
      })
      .catch((msg) => {
        addToast(httpErrorToHuman(msg), 'error');
      })
      .finally(() => setLoading(false));
  }, [server.uuid, browsingDirectory, page, setBrowsingWritableDirectory, setBrowsingFastDirectory, setBrowsingEntries, addToast]);

  const {
    uploadingFiles,
    uploadFiles,
    cancelFileUpload,
    cancelFolderUpload,
    aggregatedUploadProgress,
    handleFileSelect,
    handleFolderSelect,
  } = useFileUpload(server.uuid, browsingDirectory!, loadDirectoryData);

  const { isDragging } = useFileDragAndDrop({
    onDrop: uploadFiles,
    enabled: !browsingBackup,
  });

  // Drag-and-drop for moving files into folders (requires holding "D" key)
  const { handleDragEnd } = useFileMoveHandler(loadDirectoryData);
  const [activeDragFile, setActiveDragFile] = useState<DirectoryEntry | null>(null);
  const [activeDragCount, setActiveDragCount] = useState(0);
  const [isDKeyHeld, setIsDKeyHeld] = useState(false);

  // Track "D" key state for drag-to-move functionality
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'd' || e.key === 'D') {
        setIsDKeyHeld(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'd' || e.key === 'D') {
        setIsDKeyHeld(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  useEffect(() => {
    setBrowsingDirectory(searchParams.get('directory') || '/');
    setPage(Number(searchParams.get('page')) || 1);
  }, [searchParams, setBrowsingDirectory]);

  const onPageSelect = (page: number) => {
    setSearchParams({ directory: browsingDirectory!, page: page.toString() });
  };

  const doCancelOperation = (uuid: string) => {
    removeFileOperation(uuid);

    cancelOperation(server.uuid, uuid)
      .then(() => {
        addToast('Operation cancelled', 'success');
      })
      .catch((msg) => {
        addToast(httpErrorToHuman(msg), 'error');
      });
  };

  const onSelectedStart = (event: ReactMouseEvent | MouseEvent) => {
    setSelectedFilesPrevious(event.shiftKey ? selectedFileNames : new Set<string>());
  };

  const onSelected = (selected: DirectoryEntry[]) => {
    const previousFiles = browsingEntries.data.filter((entry) => selectedFilesPrevious.has(entry.name));
    setSelectedFiles([...previousFiles, ...selected]);
  };

  useEffect(() => {
    if (!browsingDirectory) return;

    loadDirectoryData();
  }, [browsingDirectory, page, loadDirectoryData]);

  useEffect(() => {
    setSelectedFiles([]);
  }, [browsingDirectory]);

  useEffect(() => {
    if (browsingDirectory?.startsWith('/.backups/') && !browsingBackup && !loading) {
      setLoading(true);

      let backupUuid = browsingDirectory.slice('/.backups/'.length);
      if (backupUuid.includes('/')) {
        backupUuid = backupUuid.slice(0, backupUuid.indexOf('/'));
      }

      getBackup(server.uuid, backupUuid)
        .then((data) => {
          setBrowsingBackup(data);
        })
        .catch((msg) => {
          addToast(httpErrorToHuman(msg), 'error');
        })
        .finally(() => setLoading(false));
    } else if (!browsingDirectory?.startsWith('/.backups/') && browsingBackup) {
      setBrowsingBackup(null);
    }
  }, [browsingDirectory, browsingBackup, loading]);

  return (
    <ServerContentContainer title='Files' hideTitleComponent>
      <div className='h-fit relative'>
        <input
          ref={fileInputRef}
          type='file'
          multiple
          style={{ display: 'none' }}
          onChange={(e) => handleFileSelect(e, fileInputRef)}
        />
        <input
          ref={folderInputRef}
          type='file'
          multiple
          style={{ display: 'none' }}
          onChange={(e) => handleFolderSelect(e, folderInputRef)}
          {...{ webkitdirectory: '', directory: '' }}
        />

        <SftpDetailsModal opened={openModal === 'sftpDetails'} onClose={() => setOpenModal(null)} />
        <DirectoryNameModal opened={openModal === 'nameDirectory'} onClose={() => setOpenModal(null)} />
        <PullFileModal opened={openModal === 'pullFile'} onClose={() => setOpenModal(null)} />

        <FileActionBar />

        <Group justify='space-between' align='center' mb='md'>
          <Title order={1} c='white'>
            Files
          </Title>
          <Group>
            <FileOperationsProgress
              serverUuid={server.uuid}
              uploadingFiles={uploadingFiles}
              fileOperations={fileOperations}
              aggregatedUploadProgress={aggregatedUploadProgress}
              onCancelFileUpload={cancelFileUpload}
              onCancelFolderUpload={cancelFolderUpload}
              onCancelOperation={doCancelOperation}
            />
            <FileToolbar
              serverUuidShort={server.uuidShort}
              browsingDirectory={browsingDirectory}
              browsingWritableDirectory={browsingWritableDirectory}
              onSftpDetailsClick={() => setOpenModal('sftpDetails')}
              onNewDirectoryClick={() => setOpenModal('nameDirectory')}
              onPullFileClick={() => setOpenModal('pullFile')}
              onFileUploadClick={() => fileInputRef.current?.click()}
              onFolderUploadClick={() => folderInputRef.current?.click()}
            />
          </Group>
        </Group>

        {loading ? (
          <Spinner.Centered />
        ) : (
          <>
            <FileUploadOverlay visible={isDragging && !browsingBackup} />

            <div className='bg-[#282828] border border-[#424242] rounded-lg mb-2 p-4'>
              <FileBreadcrumbs path={decodeURIComponent(browsingDirectory)} browsingBackup={browsingBackup} />
            </div>
            <DndContext
              sensors={sensors}
              onDragStart={(event) => {
                const data = event.active.data.current;
                if (data?.type === 'file') {
                  setActiveDragFile(data.file);
                  setActiveDragCount(data.files?.length || 1);
                }
              }}
              onDragEnd={(event) => {
                handleDragEnd(event);
                setActiveDragFile(null);
                setActiveDragCount(0);
              }}
              onDragCancel={() => {
                setActiveDragFile(null);
                setActiveDragCount(0);
              }}
            >
              <SelectionArea
                onSelectedStart={onSelectedStart}
                onSelected={onSelected}
                className='h-full'
                disabled={movingFileNames.size > 0 || !!openModal || childOpenModal || !!activeDragFile || isDKeyHeld}
              >
                <ContextMenuProvider>
                  <div style={isDKeyHeld && browsingWritableDirectory ? { cursor: 'grab' } : undefined}>
                    <Table
                      columns={['', 'Name', 'Size', 'Modified', '']}
                      pagination={browsingEntries}
                      onPageSelect={onPageSelect}
                      allowSelect={false}
                    >
                      {browsingEntries.data.map((file) => (
                        <SelectionArea.Selectable key={file.name} item={file}>
                          {(innerRef: Ref<HTMLElement>) => (
                            <FileRow
                              key={file.name}
                              file={file}
                              ref={innerRef as Ref<HTMLTableRowElement>}
                              setChildOpenModal={setChildOpenModal}
                              dndEnabled={browsingWritableDirectory && !browsingBackup && movingFileNames.size === 0 && isDKeyHeld}
                            />
                          )}
                        </SelectionArea.Selectable>
                      ))}
                    </Table>
                  </div>
                </ContextMenuProvider>
              </SelectionArea>
              <DragOverlay>
                {activeDragFile && <FileDragOverlay file={activeDragFile} count={activeDragCount} />}
              </DragOverlay>
            </DndContext>
          </>
        )}
      </div>
    </ServerContentContainer>
  );
}
