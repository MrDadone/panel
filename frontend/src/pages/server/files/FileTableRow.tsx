import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { forwardRef, type MouseEventHandler, memo, type ReactNode, useCallback, useMemo } from 'react';
import { createSearchParams, useNavigate, useSearchParams } from 'react-router';
import { TableRow } from '@/elements/Table.tsx';
import { isEditableFile, isViewableArchive } from '@/lib/files.ts';
import { useServerCan } from '@/plugins/usePermissions.ts';
import { useGlobalStore } from '@/stores/global.ts';
import { useServerStore } from '@/stores/server.ts';

interface FileTableRowProps {
  file: DirectoryEntry;
  onContextMenu: MouseEventHandler<HTMLTableRowElement>;
  onClick: MouseEventHandler<HTMLTableRowElement>;
  children: ReactNode;
  dndEnabled?: boolean;
}

export const FileTableRow = memo(
  forwardRef<HTMLTableRowElement, FileTableRowProps>(function FileTableRow(
    { file, onContextMenu, onClick, children, dndEnabled = false },
    ref,
  ) {
    const navigate = useNavigate();
    const [_, setSearchParams] = useSearchParams();
    const server = useServerStore((state) => state.server);
    const { browsingDirectory, browsingFastDirectory, movingFileNames, movingFilesDirectory, isFileSelected, selectedFileNames } =
      useServerStore();
    const { settings } = useGlobalStore();
    const canOpenFile = useServerCan('files.read-content');

    const isSelected =
      isFileSelected(file) || (movingFilesDirectory === browsingDirectory && movingFileNames.has(file.name));
    const isFileCurrentlySelected = selectedFileNames.has(file.name);

    // Draggable setup
    const {
      attributes: dragAttributes,
      listeners: dragListeners,
      setNodeRef: setDragRef,
      isDragging,
      transform,
    } = useDraggable({
      id: `file-${file.name}`,
      data: {
        type: 'file',
        file,
        files: isFileCurrentlySelected ? Array.from(selectedFileNames) : [file.name],
      },
      disabled: !dndEnabled,
    });

    // Droppable setup (only for directories)
    const {
      setNodeRef: setDropRef,
      isOver,
      active,
    } = useDroppable({
      id: `folder-${file.name}`,
      data: {
        type: 'folder',
        file,
      },
      disabled: !dndEnabled || !file.directory,
    });

    // Check if this is a valid drop target
    const activeData = active?.data.current;
    const isValidDropTarget = file.directory && activeData?.type === 'file' && !activeData.files?.includes(file.name);

    // Combine refs
    const combinedRef = useCallback(
      (node: HTMLTableRowElement | null) => {
        setDragRef(node);
        if (file.directory) {
          setDropRef(node);
        }
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [setDragRef, setDropRef, ref, file.directory],
    );

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLTableRowElement>) => {
        if (
          (isEditableFile(file.mime) && file.size <= settings.server.maxFileManagerViewSize) ||
          file.directory ||
          (isViewableArchive(file) && browsingFastDirectory)
        ) {
          if (file.directory || (isViewableArchive(file) && browsingFastDirectory)) {
            setSearchParams({
              directory: `${browsingDirectory}/${file.name}`.replace('//', '/'),
            });
          } else {
            if (!canOpenFile) return;

            navigate(
              `/server/${server.uuidShort}/files/edit?${createSearchParams({
                directory: browsingDirectory,
                file: file.name,
              })}`,
            );
          }
        } else {
          onClick(e);
        }
      },
      [file, browsingDirectory, settings, server, navigate, setSearchParams, onClick, canOpenFile],
    );

    const style = useMemo(
      () =>
        dndEnabled
          ? {
              transform: CSS.Translate.toString(transform),
              opacity: isDragging ? 0.5 : 1,
            }
          : undefined,
      [transform, isDragging, dndEnabled],
    );

    // Determine background color based on state
    const getBgColor = () => {
      if (isOver && isValidDropTarget) {
        return 'var(--mantine-color-green-light)';
      }
      if (isSelected) {
        return 'var(--mantine-color-blue-light)';
      }
      return undefined;
    };

    return (
      <TableRow
        ref={combinedRef}
        className={
          canOpenFile &&
          ((isEditableFile(file.mime) && file.size <= settings.server.maxFileManagerViewSize) ||
            file.directory ||
            (isViewableArchive(file) && browsingFastDirectory))
            ? 'cursor-pointer select-none'
            : 'select-none'
        }
        style={style}
        bg={getBgColor()}
        onContextMenu={onContextMenu}
        onClick={handleClick}
        {...(dndEnabled ? { ...dragAttributes, ...dragListeners } : {})}
      >
        {children}
      </TableRow>
    );
  }),
);
