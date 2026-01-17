import { useCallback } from 'react';
import { DragEndEvent } from '@dnd-kit/core';
import { httpErrorToHuman } from '@/api/axios.ts';
import renameFiles from '@/api/server/files/renameFiles.ts';
import { useToast } from '@/providers/ToastProvider.tsx';
import { useServerStore } from '@/stores/server.ts';

export function useFileMoveHandler(onSuccess?: () => void) {
  const { addToast } = useToast();
  const { server, browsingDirectory, setSelectedFiles } = useServerStore();

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || !active) return;

      const activeData = active.data.current;
      const overData = over.data.current;

      // Ensure we're dropping on a folder
      if (overData?.type !== 'folder' || activeData?.type !== 'file') return;

      const targetFolder = overData.file as DirectoryEntry;
      const filesToMove: string[] = activeData.files || [activeData.file.name];

      // Don't allow dropping a folder onto itself
      if (filesToMove.includes(targetFolder.name)) return;

      try {
        await renameFiles({
          uuid: server.uuid,
          root: browsingDirectory!,
          files: filesToMove.map((fileName) => ({
            from: fileName,
            to: `${targetFolder.name}/${fileName}`,
          })),
        });

        addToast(
          `Moved ${filesToMove.length} ${filesToMove.length === 1 ? 'item' : 'items'} to ${targetFolder.name}`,
          'success',
        );
        setSelectedFiles([]);
        onSuccess?.();
      } catch (error) {
        addToast(httpErrorToHuman(error), 'error');
      }
    },
    [server.uuid, browsingDirectory, addToast, setSelectedFiles, onSuccess],
  );

  return { handleDragEnd };
}
