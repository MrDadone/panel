import { useKeyboardShortcuts } from '@/plugins/useKeyboardShortcuts.ts';
import { useServerStore } from '@/stores/server.ts';

interface UseFileKeyboardActionsOptions {
  onDelete?: () => void;
  onPaste?: () => void;
  enabled?: boolean;
}

export function useFileKeyboardActions({ onDelete, onPaste, enabled = true }: UseFileKeyboardActionsOptions = {}) {
  const {
    browsingEntries,
    browsingWritableDirectory,
    selectedFileNames,
    actingFileNames,
    setSelectedFiles,
    setActingFiles,
    getSelectedFiles,
  } = useServerStore();

  useKeyboardShortcuts({
    shortcuts: [
      {
        key: 'a',
        modifiers: ['ctrlOrMeta'],
        callback: () => setSelectedFiles(browsingEntries.data),
      },
      {
        key: 'Escape',
        modifiers: ['ctrlOrMeta'],
        callback: () => setSelectedFiles([]),
      },
      {
        key: 'x',
        modifiers: ['ctrlOrMeta'],
        callback: () => {
          if (actingFileNames.size === 0 && browsingWritableDirectory) {
            const selectedFiles = getSelectedFiles();
            if (selectedFiles.length > 0) {
              setActingFiles('move', selectedFiles);
              setSelectedFiles([]);
            }
          }
        },
      },
      {
        key: 'c',
        modifiers: ['ctrlOrMeta'],
        callback: () => {
          if (actingFileNames.size === 0) {
            const selectedFiles = getSelectedFiles();
            if (selectedFiles.length > 0) {
              setActingFiles('copy', selectedFiles);
              setSelectedFiles([]);
            }
          }
        },
      },
      {
        key: 'v',
        modifiers: ['ctrlOrMeta'],
        callback: () => {
          if (actingFileNames.size > 0 && onPaste) {
            onPaste();
          }
        },
      },
      {
        key: 'Delete',
        callback: () => {
          if (actingFileNames.size === 0 && selectedFileNames.size > 0 && browsingWritableDirectory && onDelete) {
            onDelete();
          }
        },
      },
    ],
    enabled,
    deps: [
      browsingEntries.data,
      selectedFileNames.size,
      actingFileNames.size,
      onDelete,
      onPaste,
      browsingWritableDirectory,
    ],
  });
}
