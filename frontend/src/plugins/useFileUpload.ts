import { AxiosRequestConfig } from 'axios';
import { ChangeEvent, RefObject, useCallback, useMemo, useRef, useState } from 'react';
import { useToast } from '@/providers/ToastProvider.tsx';

type UploadStatus = 'pending' | 'uploading' | 'completed' | 'cancelled' | 'error';

interface FileUploadProgress {
  filePath: string;
  progress: number;
  size: number;
  uploaded: number;
  batchId: string;
  status: UploadStatus;
}

export interface AggregatedUploadProgress {
  totalSize: number;
  uploadedSize: number;
  fileCount: number;
  completedCount: number;
  pendingCount: number;
}

export interface FileUploader {
  uploadingFiles: Map<string, FileUploadProgress>;
  aggregatedUploadProgress: Map<string, AggregatedUploadProgress>;
  totalUploadProgress: number;
  uploadFiles: (files: File[]) => Promise<void>;
  cancelFileUpload: (fileKey: string) => void;
  cancelFolderUpload: (folderName: string) => void;
  handleFileSelect: (event: ChangeEvent<HTMLInputElement>, inputRef: RefObject<HTMLInputElement | null>) => void;
  handleFolderSelect: (event: ChangeEvent<HTMLInputElement>, inputRef: RefObject<HTMLInputElement | null>) => void;
}

const MAX_CONCURRENT_BATCHES = 4;
const BATCH_SIZE = 2;
const CLEANUP_DELAY_MS = 2000;

export function useFileUpload(
  uploadFunction: (form: FormData, config: AxiosRequestConfig) => unknown,
  onUploadComplete: () => void,
): FileUploader {
  const { addToast } = useToast();

  const [uploadingFiles, setUploadingFiles] = useState<Map<string, FileUploadProgress>>(new Map());

  const fileIndexCounter = useRef(0);
  const activeBatchCount = useRef(0);
  const uploadQueue = useRef<Array<{ files: File[]; indices: number[]; batchId: string }>>([]);
  const isProcessingQueue = useRef(false);
  const controllers = useRef<Map<string, AbortController>>(new Map());
  const cleanupTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const scheduleCleanup = useCallback((fileKey: string) => {
    const timer = setTimeout(() => {
      setUploadingFiles((prev) => {
        const next = new Map(prev);
        next.delete(fileKey);
        return next;
      });
      cleanupTimers.current.delete(fileKey);
    }, CLEANUP_DELAY_MS);
    cleanupTimers.current.set(fileKey, timer);
  }, []);

  const cancelCleanup = useCallback((fileKey: string) => {
    const timer = cleanupTimers.current.get(fileKey);
    if (timer !== undefined) {
      clearTimeout(timer);
      cleanupTimers.current.delete(fileKey);
    }
  }, []);

  const updateFileStatuses = useCallback(
    (indices: number[], updater: (prev: FileUploadProgress) => FileUploadProgress) => {
      setUploadingFiles((prev) => {
        const next = new Map(prev);
        indices.forEach((idx) => {
          const key = `file-${idx}`;
          const entry = next.get(key);
          if (entry) next.set(key, updater(entry));
        });
        return next;
      });
    },
    [],
  );

  const processBatch = useCallback(
    async (batchId: string, files: File[], indices: number[]) => {
      const controller = controllers.current.get(batchId);
      if (!controller) return;

      activeBatchCount.current++;

      try {
        updateFileStatuses(indices, (f) => (f.status === 'pending' ? { ...f, status: 'uploading' } : f));

        const formData = new FormData();
        files.forEach((file) => {
          formData.append('files', file, file.webkitRelativePath || file.name);
        });

        const batchTotalSize = files.reduce((sum, f) => sum + f.size, 0);
        let lastLoaded = 0;

        const config: AxiosRequestConfig = {
          signal: controller.signal,
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (event) => {
            const loaded = event.loaded ?? 0;
            const delta = loaded - lastLoaded;
            lastLoaded = loaded;
            if (delta <= 0) return;

            setUploadingFiles((prev) => {
              const next = new Map(prev);
              indices.forEach((idx, i) => {
                const key = `file-${idx}`;
                const entry = next.get(key);
                if (!entry || entry.status !== 'uploading') return;

                const ratio = files[i].size / batchTotalSize;
                const newUploaded = Math.min(entry.uploaded + delta * ratio, files[i].size);
                next.set(key, {
                  ...entry,
                  uploaded: newUploaded,
                  progress: (newUploaded / files[i].size) * 100,
                });
              });
              return next;
            });
          },
        };

        await uploadFunction(formData, config);

        setUploadingFiles((prev) => {
          const next = new Map(prev);
          indices.forEach((idx) => {
            const key = `file-${idx}`;
            const entry = next.get(key);
            if (entry?.status === 'uploading') {
              next.set(key, { ...entry, progress: 100, uploaded: entry.size, status: 'completed' });
              scheduleCleanup(key);
            }
          });
          return next;
        });
      } catch (error: unknown) {
        const isCancelled =
          error != null &&
          typeof error === 'object' &&
          'code' in error &&
          (error.code === 'CanceledError' || error.code === 'ERR_CANCELED');

        if (!isCancelled) {
          console.error('Upload error:', error);
          updateFileStatuses(indices, (f) => (f.status !== 'completed' ? { ...f, status: 'error' } : f));
          const message =
            error != null && typeof error === 'object' && 'message' in error ? String(error.message) : 'Unknown error';
          addToast(`Upload failed: ${message}`, 'error');
        }
      } finally {
        activeBatchCount.current--;
        controllers.current.delete(batchId);

        if (uploadQueue.current.length === 0 && activeBatchCount.current === 0) {
          setTimeout(() => {
            setUploadingFiles((prev) => {
              const hasActive = [...prev.values()].some((f) => f.status === 'uploading' || f.status === 'pending');
              if (!hasActive) onUploadComplete();
              return prev;
            });
          }, 100);
        }
      }
    },
    [uploadFunction, onUploadComplete, updateFileStatuses, scheduleCleanup],
  );

  const processQueue = useCallback(async () => {
    if (isProcessingQueue.current) return;
    isProcessingQueue.current = true;

    while (uploadQueue.current.length > 0) {
      while (activeBatchCount.current >= MAX_CONCURRENT_BATCHES) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const batch = uploadQueue.current.shift();
      if (!batch) break;

      const controller = controllers.current.get(batch.batchId);
      if (!controller || controller.signal.aborted) continue;

      processBatch(batch.batchId, batch.files, batch.indices).catch(console.error);
    }

    isProcessingQueue.current = false;
  }, [processBatch]);

  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      const startIndex = fileIndexCounter.current;
      fileIndexCounter.current += files.length;

      const batches: Array<{ files: File[]; indices: number[]; batchId: string }> = [];
      for (let i = 0; i < files.length; i += BATCH_SIZE) {
        const batchFiles = files.slice(i, i + BATCH_SIZE);
        const indices = batchFiles.map((_, j) => startIndex + i + j);
        const batchId = `batch-${Date.now()}-${Math.random().toString(36).slice(2, 9)}-${i}`;
        controllers.current.set(batchId, new AbortController());
        batches.push({ files: batchFiles, indices, batchId });
      }

      setUploadingFiles((prev) => {
        const next = new Map(prev);
        batches.forEach(({ files: batchFiles, indices, batchId }) => {
          batchFiles.forEach((file, j) => {
            next.set(`file-${indices[j]}`, {
              filePath: file.webkitRelativePath || file.name,
              progress: 0,
              size: file.size,
              uploaded: 0,
              batchId,
              status: 'pending',
            });
          });
        });
        return next;
      });

      uploadQueue.current.push(...batches);
      processQueue();

      addToast(`Uploading ${files.length} file${files.length !== 1 ? 's' : ''}…`, 'info');
    },
    [processQueue, addToast],
  );

  const cancelFileUpload = useCallback(
    (fileKey: string) => {
      setUploadingFiles((prev) => {
        const entry = prev.get(fileKey);
        if (!entry) return prev;

        const { batchId } = entry;

        const controller = controllers.current.get(batchId);
        controller?.abort();

        uploadQueue.current = uploadQueue.current.filter((b) => b.batchId !== batchId);

        const next = new Map(prev);
        prev.forEach((f, k) => {
          if (f.batchId === batchId) {
            next.delete(k);
            cancelCleanup(k);
          }
        });
        return next;
      });
    },
    [cancelCleanup],
  );

  const cancelFolderUpload = useCallback(
    (folderName: string) => {
      setUploadingFiles((prev) => {
        const batchesToAbort = new Set<string>();
        const keysToRemove: string[] = [];

        prev.forEach((file, key) => {
          const topFolder = file.filePath.split('/')[0];
          if (topFolder === folderName) {
            keysToRemove.push(key);
            batchesToAbort.add(file.batchId);
          }
        });

        if (keysToRemove.length === 0) return prev;

        batchesToAbort.forEach((batchId) => {
          controllers.current.get(batchId)?.abort();
          uploadQueue.current = uploadQueue.current.filter((b) => b.batchId !== batchId);
        });

        const next = new Map(prev);
        keysToRemove.forEach((key) => {
          next.delete(key);
          cancelCleanup(key);
        });

        addToast(`Cancelled ${keysToRemove.length} file(s) from "${folderName}"`, 'info');
        return next;
      });
    },
    [cancelCleanup, addToast],
  );

  const aggregatedUploadProgress = useMemo(() => {
    const map = new Map<string, AggregatedUploadProgress>();

    uploadingFiles.forEach((file) => {
      const parts = file.filePath.split('/');
      if (parts.length < 2) return;

      const folder = parts[0];
      const prev = map.get(folder) ?? {
        totalSize: 0,
        uploadedSize: 0,
        fileCount: 0,
        completedCount: 0,
        pendingCount: 0,
      };

      map.set(folder, {
        totalSize: prev.totalSize + file.size,
        uploadedSize: prev.uploadedSize + file.uploaded,
        fileCount: prev.fileCount + 1,
        completedCount: prev.completedCount + (file.status === 'completed' ? 1 : 0),
        pendingCount: prev.pendingCount + (file.status === 'pending' ? 1 : 0),
      });
    });

    return map;
  }, [uploadingFiles]);

  const totalUploadProgress = useMemo(() => {
    if (uploadingFiles.size === 0) return 0;

    let totalSize = 0;
    let totalUploaded = 0;

    uploadingFiles.forEach((file) => {
      totalSize += file.size;
      totalUploaded += file.uploaded;
    });

    return totalSize === 0 ? 0 : (totalUploaded / totalSize) * 100;
  }, [uploadingFiles]);

  const handleFileSelect = useCallback(
    (event: ChangeEvent<HTMLInputElement>, inputRef: RefObject<HTMLInputElement | null>) => {
      const files = Array.from(event.target.files ?? []);
      if (files.length > 0) uploadFiles(files);
      if (inputRef.current) inputRef.current.value = '';
    },
    [uploadFiles],
  );

  const handleFolderSelect = useCallback(
    (event: ChangeEvent<HTMLInputElement>, inputRef: RefObject<HTMLInputElement | null>) => {
      const files = Array.from(event.target.files ?? []);
      if (files.length > 0) uploadFiles(files);
      if (inputRef.current) inputRef.current.value = '';
    },
    [uploadFiles],
  );

  return {
    uploadingFiles,
    aggregatedUploadProgress,
    totalUploadProgress,
    uploadFiles,
    cancelFileUpload,
    cancelFolderUpload,
    handleFileSelect,
    handleFolderSelect,
  };
}
