import { forwardRef, memo, useRef } from 'react';
import { z } from 'zod';
import { ContextMenuToggle } from '@/elements/ContextMenu.tsx';
import Checkbox from '@/elements/input/Checkbox.tsx';
import { TableData, TableRow } from '@/elements/Table.tsx';
import FormattedTimestamp from '@/elements/time/FormattedTimestamp.tsx';
import { isEditableFile, isViewableArchive, isViewableImage } from '@/lib/files.ts';
import { serverDirectoryEntrySchema } from '@/lib/schemas/server/files.ts';
import { bytesToString } from '@/lib/size.ts';
import FileRowContextMenu from '@/pages/server/files/FileRowContextMenu.tsx';
import { useServerCan } from '@/plugins/usePermissions.ts';
import { useFileManager } from '@/providers/FileManagerProvider.tsx';
import { useGlobalStore } from '@/stores/global.ts';
import FileRowIcon from './FileRowIcon.tsx';

interface FileRowProps {
  file: z.infer<typeof serverDirectoryEntrySchema>;
  handleOpen: () => void;
  isSelected: boolean;
  isActing: boolean;
  multipleSelected: boolean;
}

const FileRow = forwardRef<HTMLTableRowElement, FileRowProps>(function FileRow(
  { file, handleOpen, isSelected, isActing, multipleSelected },
  ref,
) {
  const canOpenActionBar = useServerCan(['files.read-content', 'files.archive', 'files.update', 'files.delete'], true);
  const { browsingFastDirectory, doSelectFiles, addSelectedFile, removeSelectedFile, clickOnce, preferPhysicalSize } =
    useFileManager();
  const { settings } = useGlobalStore();
  const canOpenFile = useServerCan('files.read-content');

  const toggleSelected = () => (isSelected ? removeSelectedFile(file) : addSelectedFile(file));

  const clickCount = useRef(0);
  const clickTimer = useRef<number | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
    clickCount.current += 1;

    if (clickTimer.current) return;

    if (e.shiftKey) {
      addSelectedFile(file);
    } else if (isSelected) {
      if (multipleSelected) {
        doSelectFiles([file]);
      } else {
        removeSelectedFile(file);
      }
    } else {
      doSelectFiles([file]);
    }

    clickTimer.current = setTimeout(() => {
      if (clickCount.current >= 2) {
        handleOpen();
      }

      clickCount.current = 0;
      clickTimer.current = null;
    }, 250);
  };

  // Determine background color based on state
  const getBgColor = () => {
    // if (isOver && isValidDropTarget) {
    //   return 'var(--mantine-color-green-light)';
    // }
    if (isActing) {
      return 'var(--mantine-color-orange-light)';
    }
    if (isSelected) {
      return 'var(--mantine-color-blue-light)';
    }
    return undefined;
  };

  return (
    <FileRowContextMenu file={file}>
      {({ items, openMenu }) => (
        <TableRow
          ref={ref}
          className={
            clickOnce &&
            canOpenFile &&
            (((isEditableFile(file) || isViewableImage(file)) && file.size <= settings.server.maxFileManagerViewSize) ||
              file.directory ||
              (isViewableArchive(file) && browsingFastDirectory))
              ? 'cursor-pointer select-none'
              : 'select-none'
          }
          bg={getBgColor()}
          onContextMenu={(e) => {
            e.preventDefault();
            openMenu(e.clientX, e.clientY);
          }}
          onClick={(e) => {
            e.preventDefault();
            if (clickOnce) {
              handleOpen();
            } else {
              handleClick(e);
            }
          }}
        >
          {canOpenActionBar ? (
            <td className='pl-4 relative cursor-pointer w-10 text-center py-2'>
              <Checkbox
                id={file.name}
                checked={isSelected}
                classNames={{ input: 'cursor-pointer!' }}
                onChange={toggleSelected}
                onClick={(e) => e.stopPropagation()}
              />
            </td>
          ) : (
            <td className='w-0'></td>
          )}

          <TableData>
            <span className='flex items-center gap-4 leading-[100%]'>
              <FileRowIcon className='text-gray-400' file={file} />
              {file.name}
            </span>
          </TableData>

          <TableData>
            <span className='flex items-center gap-4 leading-[100%]'>
              {bytesToString(preferPhysicalSize ? file.sizePhysical : file.size)}
            </span>
          </TableData>

          <TableData className='hidden md:table-cell'>
            <FormattedTimestamp timestamp={file.modified} />
          </TableData>

          <ContextMenuToggle items={items} openMenu={openMenu} />
        </TableRow>
      )}
    </FileRowContextMenu>
  );
});

export default memo(FileRow);
