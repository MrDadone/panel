import { Popover, Text, UnstyledButton } from '@mantine/core';
import { memo, useMemo } from 'react';
import { httpErrorToHuman } from '@/api/axios.ts';
import cancelOperation from '@/api/server/files/cancelOperation.ts';
import CloseButton from '@/elements/CloseButton.tsx';
import Code from '@/elements/Code.tsx';
import ConfirmationModal from '@/elements/modals/ConfirmationModal.tsx';
import Progress from '@/elements/Progress.tsx';
import RingProgress from '@/elements/RingProgress.tsx';
import Tooltip from '@/elements/Tooltip.tsx';
import { bytesToString } from '@/lib/size.ts';
import { useBlocker } from '@/plugins/useBlocker.ts';
import { useToast } from '@/providers/contexts/toastContext.ts';
import { useFileManager } from '@/providers/FileManagerProvider.tsx';
import { useServerStore } from '@/stores/server.ts';

function FileOperationsProgress() {
  const { addToast } = useToast();
  const { server, fileOperations, removeFileOperation } = useServerStore();
  const { fileUploader } = useFileManager();
  const { uploadingFiles, cancelFileUpload, cancelFolderUpload, aggregatedUploadProgress } = fileUploader;

  const blocker = useBlocker(uploadingFiles.size > 0, true);

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

  const hasOperations = fileOperations.size > 0 || uploadingFiles.size > 0;

  const averageOperationProgress = useMemo(() => {
    if (fileOperations.size === 0 && uploadingFiles.size === 0) {
      return 0;
    }

    let totalProgress = 0;
    let totalSize = 0;

    fileOperations.forEach((operation) => {
      if (operation.total === 0) return;
      totalProgress += operation.progress;
      totalSize += operation.total;
    });

    uploadingFiles.forEach((file) => {
      totalProgress += file.uploaded;
      totalSize += file.size;
    });

    return totalSize > 0 ? (totalProgress / totalSize) * 100 : 0;
  }, [fileOperations, uploadingFiles]);

  if (!hasOperations) return null;

  return (
    <>
      <ConfirmationModal
        title='Active Uploads'
        opened={blocker.state === 'blocked'}
        onClose={() => blocker.reset()}
        onConfirmed={() => blocker.proceed()}
        confirm='Leave'
      >
        Are you sure you want to leave this page? You have <Code>{fileOperations.size}</Code> active file uploads. If
        you leave this page, the file uploads will abort.
      </ConfirmationModal>

      <Popover position='bottom-start' shadow='md'>
        <Popover.Target>
          <UnstyledButton>
            <RingProgress
              size={50}
              sections={[
                {
                  value: averageOperationProgress,
                  color: uploadingFiles.size > 0 ? 'green' : 'blue',
                },
              ]}
              roundCaps
              thickness={4}
              label={
                <Text c={uploadingFiles.size > 0 ? 'green' : 'blue'} fw={700} ta='center' size='xs'>
                  {averageOperationProgress.toFixed(0)}%
                </Text>
              }
            />
          </UnstyledButton>
        </Popover.Target>
        <Popover.Dropdown className='md:min-w-xl max-w-screen max-h-96 overflow-y-auto'>
          {window.extensionContext.extensionRegistry.pages.server.files.fileOperationsProgress.prependedComponents.map(
            (Component, i) => (
              <Component key={`files-operationProgress-prepended-${i}`} />
            ),
          )}

          {Array.from(aggregatedUploadProgress).map(([folderName, info]) => {
            const progress = info.totalSize > 0 ? (info.uploadedSize / info.totalSize) * 100 : 0;
            const statusText =
              info.pendingCount > 0
                ? `Uploading folder: ${folderName} (${info.fileCount - info.pendingCount}/${info.fileCount} files)`
                : `Uploading folder: ${folderName} (${info.fileCount} files)`;

            return (
              <div key={folderName} className='flex flex-row items-center mb-3'>
                <div className='flex flex-col grow'>
                  <p className='break-all mb-1'>{statusText}</p>
                  <Tooltip
                    label={`${bytesToString(info.uploadedSize)} / ${bytesToString(info.totalSize)}`}
                    innerClassName='w-full'
                  >
                    <Progress value={progress} />
                  </Tooltip>
                </div>
                <CloseButton className='ml-3' onClick={() => cancelFolderUpload(folderName)} />
              </div>
            );
          })}

          {Array.from(uploadingFiles).map(([key, file]) => {
            if (aggregatedUploadProgress.size > 0 && file.filePath.includes('/')) {
              return null;
            }

            return (
              <div key={key} className='flex flex-row items-center mb-2'>
                <div className='flex flex-col grow'>
                  <p className='break-all mb-1 text-sm'>
                    {file.status === 'pending' ? 'Waiting: ' : 'Uploading: '}
                    {file.filePath}
                  </p>
                  <Tooltip
                    label={`${bytesToString(file.uploaded)} / ${bytesToString(file.size)}`}
                    innerClassName='w-full'
                  >
                    <Progress value={file.progress} />
                  </Tooltip>
                </div>
                <CloseButton className='ml-3' onClick={() => cancelFileUpload(key)} />
              </div>
            );
          })}

          {Array.from(fileOperations).map(([uuid, operation]) => {
            const progress = (operation.progress / operation.total) * 100;

            return (
              <div key={uuid} className='flex flex-row items-center mb-2'>
                <div className='flex flex-col grow'>
                  <p className='break-all mb-1'>
                    {operation.type === 'compress'
                      ? `Compressing ${operation.files.length} files from ${operation.path}`
                      : operation.type === 'decompress'
                        ? `Decompressing ${operation.path}`
                        : operation.type === 'pull'
                          ? `Pulling ${operation.path}`
                          : operation.type === 'copy'
                            ? `Copying ${operation.path} to ${operation.destinationPath}`
                            : operation.type === 'copy_many'
                              ? `Copying ${operation.files.length} files`
                              : operation.type === 'copy_remote'
                                ? operation.destinationServer === server.uuid
                                  ? `Receiving ${operation.files.length} files from remote server`
                                  : `Sending ${operation.files.length} files to remote server`
                                : null}
                  </p>
                  <Tooltip
                    label={`${bytesToString(operation.progress)} / ${bytesToString(operation.total)}`}
                    innerClassName='w-full'
                  >
                    <Progress value={progress} />
                  </Tooltip>
                </div>
                <CloseButton className='ml-3' onClick={() => doCancelOperation(uuid)} />
              </div>
            );
          })}

          {window.extensionContext.extensionRegistry.pages.server.files.fileOperationsProgress.appendedComponents.map(
            (Component, i) => (
              <Component key={`files-operationProgress-appended-${i}`} />
            ),
          )}
        </Popover.Dropdown>
      </Popover>
    </>
  );
}

export default memo(FileOperationsProgress);
