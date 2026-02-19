import { faFile, faFolder } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { forwardRef, memo, useRef } from 'react';
import { createSearchParams, useNavigate, useSearchParams } from 'react-router';
import { ContextMenuToggle } from '@/elements/ContextMenu.tsx';
import Checkbox from '@/elements/input/Checkbox.tsx';
import { TableData, TableRow } from '@/elements/Table.tsx';
import FormattedTimestamp from '@/elements/time/FormattedTimestamp.tsx';
import { isEditableFile, isViewableArchive } from '@/lib/files.ts';
import { bytesToString } from '@/lib/size.ts';
import FileRowContextMenu from '@/pages/server/files/FileRowContextMenu.tsx';
import { useServerCan } from '@/plugins/usePermissions.ts';
import { useFileManager } from '@/providers/FileManagerProvider.tsx';
import { useGlobalStore } from '@/stores/global.ts';
import { useServerStore } from '@/stores/server.ts';

interface FileRowProps {
  file: DirectoryEntry;
  isSelected: boolean;
  multipleSelected: boolean;
}

const FileRow = forwardRef<HTMLTableRowElement, FileRowProps>(function FileRow(
  { file, isSelected, multipleSelected },
  ref,
) {
  const navigate = useNavigate();
  const [_, setSearchParams] = useSearchParams();
  const canOpenActionBar = useServerCan(['files.read-content', 'files.archive', 'files.update', 'files.delete'], true);
  const { server } = useServerStore();
  const {
    browsingDirectory,
    browsingFastDirectory,
    setSelectedFiles,
    addSelectedFile,
    removeSelectedFile,
    doClickOnce,
  } = useFileManager();
  const { settings } = useGlobalStore();
  const canOpenFile = useServerCan('files.read-content');

  const toggleSelected = () => (isSelected ? removeSelectedFile(file) : addSelectedFile(file));

  const handleOpen = () => {
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
    }
  };

  const clickCount = useRef(0);
  const clickTimer = useRef<NodeJS.Timeout | null>(null);

  const handleClick = () => {
    clickCount.current += 1;

    if (clickTimer.current) return;

    if (isSelected) {
      if (multipleSelected) {
        setSelectedFiles([file.name]);
      } else {
        removeSelectedFile(file);
      }
    } else {
      setSelectedFiles([file.name]);
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
            doClickOnce.current &&
            canOpenFile &&
            ((isEditableFile(file.mime) && file.size <= settings.server.maxFileManagerViewSize) ||
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
            if (doClickOnce.current) {
              handleOpen();
            } else {
              handleClick();
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
              <FontAwesomeIcon className='text-gray-400' icon={file.file ? faFile : faFolder} />
              {file.name}
            </span>
          </TableData>

          <TableData>
            <span className='flex items-center gap-4 leading-[100%]'>{bytesToString(file.size)}</span>
          </TableData>

          <TableData>
            <FormattedTimestamp timestamp={file.modified} />
          </TableData>

          <ContextMenuToggle items={items} openMenu={openMenu} />
        </TableRow>
      )}
    </FileRowContextMenu>
  );
});

export default memo(FileRow);
