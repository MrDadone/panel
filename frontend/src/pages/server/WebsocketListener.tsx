import { useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { transformKeysToCamelCase } from '@/lib/transformers.ts';
import useWebsocketEvent, { SocketEvent, SocketRequest } from '@/plugins/useWebsocketEvent.ts';
import { useToast } from '@/providers/ToastProvider.tsx';
import { useServerStore } from '@/stores/server.ts';
import { useUserStore } from '@/stores/user.ts';

export default function WebsocketListener() {
  const [searchParams, _] = useSearchParams();
  const { addToast } = useToast();
  const { addServerResourceUsage } = useUserStore();
  const {
    server,
    socketConnected,
    socketInstance,
    schedule,
    scheduleSteps,
    updateServer,
    setImagePull,
    removeImagePull,
    setStats,
    setBackupProgress,
    setBackupRestoreProgress,
    updateBackup,
    setRunningScheduleStep,
    setScheduleSteps,
    fileOperations,
    setFileOperation,
    removeFileOperation,
    refreshFiles,
  } = useServerStore();

  useEffect(() => {
    if (!socketConnected || !socketInstance) {
      return;
    }

    socketInstance.send(SocketRequest.SEND_STATS);
  }, [socketInstance, socketConnected]);

  useWebsocketEvent(SocketEvent.STATS, (data) => {
    let wsStats: object;
    try {
      wsStats = transformKeysToCamelCase(JSON.parse(data));
    } catch {
      return;
    }

    const resourceUsage = transformKeysToCamelCase(wsStats) as ResourceUsage;
    setStats(resourceUsage);
    addServerResourceUsage(server.uuid, resourceUsage);
  });

  useWebsocketEvent(SocketEvent.IMAGE_PULL_PROGRESS, (id, data) => {
    let wsData: ImagePullProgress;
    try {
      wsData = JSON.parse(data);
    } catch {
      return;
    }

    setImagePull(id, wsData);
  });

  useWebsocketEvent(SocketEvent.IMAGE_PULL_COMPLETED, (id) => {
    removeImagePull(id);
  });

  useWebsocketEvent(SocketEvent.BACKUP_PROGRESS, (uuid, data) => {
    let wsData: { progress: number; total: number };
    try {
      wsData = JSON.parse(data);
    } catch {
      return;
    }

    setBackupProgress(uuid, wsData.progress, wsData.total);
  });

  useWebsocketEvent(SocketEvent.BACKUP_COMPLETED, (uuid, data) => {
    let wsData: {
      isSuccessful: boolean;
      checksum_type: string;
      checksum: string;
      size: number;
      files: number;
      browsable: boolean;
      streaming: boolean;
    };
    try {
      wsData = JSON.parse(data);
    } catch {
      return;
    }

    updateBackup(uuid, {
      isSuccessful: wsData.isSuccessful,
      checksum: `${wsData.checksum_type}:${wsData.checksum}`,
      bytes: wsData.size,
      files: wsData.files,
      isBrowsable: wsData.browsable,
      isStreaming: wsData.streaming,
      completed: new Date(),
    });
  });

  useWebsocketEvent(SocketEvent.BACKUP_RESTORE_STARTED, () => {
    updateServer({ status: 'restoring_backup' });
  });

  useWebsocketEvent(SocketEvent.BACKUP_RESTORE_PROGRESS, (data) => {
    let wsData: { progress: number; total: number };
    try {
      wsData = JSON.parse(data);
    } catch {
      return;
    }

    setBackupRestoreProgress((wsData.progress / wsData.total) * 100);
  });

  useWebsocketEvent(SocketEvent.BACKUP_RESTORE_COMPLETED, () => {
    updateServer({ status: null });
  });

  useWebsocketEvent(SocketEvent.INSTALL_STARTED, () => {
    updateServer({ status: 'installing' });
  });

  useWebsocketEvent(SocketEvent.INSTALL_COMPLETED, (successful) => {
    updateServer({ status: successful === 'true' ? null : 'install_failed' });
  });

  useWebsocketEvent(SocketEvent.SCHEDULE_STARTED, (uuid) => {
    if (schedule?.uuid === uuid) {
      setScheduleSteps(scheduleSteps.map((s) => ({ ...s, error: null })));
    }
  });

  useWebsocketEvent(SocketEvent.SCHEDULE_STEP_STATUS, (uuid, stepUuid) => {
    setRunningScheduleStep(uuid, stepUuid);
  });

  useWebsocketEvent(SocketEvent.SCHEDULE_STEP_ERROR, (uuid, error) => {
    if (schedule?.uuid === uuid) {
      setScheduleSteps(scheduleSteps.map((s) => (s.uuid === uuid ? { ...s, error } : s)));
    }
  });

  useWebsocketEvent(SocketEvent.SCHEDULE_COMPLETED, (uuid) => {
    setRunningScheduleStep(uuid, null);
  });

  useWebsocketEvent(SocketEvent.OPERATION_PROGRESS, (uuid, data) => {
    let wsData: FileOperation;
    try {
      wsData = transformKeysToCamelCase(JSON.parse(data)) as FileOperation;
    } catch {
      return;
    }

    setFileOperation(uuid, wsData);
  });

  useWebsocketEvent(SocketEvent.OPERATION_COMPLETED, (uuid) => {
    const fileOperation = fileOperations.get(uuid);
    if (!fileOperation) return;

    switch (fileOperation.type) {
      case 'compress':
        addToast(`Compressed files to ${fileOperation.path} successfully.`, 'success');
        break;
      case 'decompress':
        addToast(
          `Decompressed ${fileOperation.path} to ${fileOperation.destinationPath || '/'} successfully.`,
          'success',
        );
        break;
      case 'pull':
        addToast(`Pulled ${fileOperation.path} successfully.`, 'success');
        break;
      case 'copy':
        addToast(`Copied ${fileOperation.path} to ${fileOperation.destinationPath} successfully.`, 'success');
        break;
      case 'copy_many':
        addToast(`Copied files from ${fileOperation.path} successfully.`, 'success');
        break;
      case 'copy_remote':
        if (fileOperation.destinationServer === server.uuid) {
          addToast(`Received files from remote server successfully.`, 'success');
        } else {
          addToast(`Sent files to remote server successfully.`, 'success');
        }
        break;
      default:
        break;
    }

    refreshFiles(Number(searchParams.get('page')) || 1);
    removeFileOperation(uuid);
  });

  useWebsocketEvent(SocketEvent.OPERATION_ERROR, (uuid, error) => {
    const fileOperation = fileOperations.get(uuid);
    if (!fileOperation) return;

    switch (fileOperation.type) {
      case 'compress':
        addToast(`Failed to compress files to ${fileOperation.path}:\n${error}`, 'error');
        break;
      case 'decompress':
        addToast(
          `Failed to decompress ${fileOperation.path} to ${fileOperation.destinationPath || '/'}:\n${error}`,
          'error',
        );
        break;
      case 'pull':
        addToast(`Failed to pull ${fileOperation.path}:\n${error}`, 'error');
        break;
      case 'copy':
        addToast(`Failed to copy ${fileOperation.path} to ${fileOperation.destinationPath}:\n${error}`, 'error');
        break;
      case 'copy_many':
        addToast(`Failed to copy files from ${fileOperation.path}:\n${error}`, 'error');
        break;
      case 'copy_remote':
        if (fileOperation.destinationServer === server.uuid) {
          addToast(`Failed to receive files from remote server:\n${error}`, 'error');
        } else {
          addToast(`Failed to send files to remote server:\n${error}`, 'error');
        }
        break;
      default:
        break;
    }

    removeFileOperation(uuid);
  });

  return null;
}
