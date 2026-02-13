import { faDoorOpen, faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Breadcrumbs } from '@mantine/core';
import { ReactNode } from 'react';
import { createSearchParams, NavLink } from 'react-router';
import Button from '@/elements/Button.tsx';
import Checkbox from '@/elements/input/Checkbox.tsx';
import { useFileManager } from '@/providers/contexts/fileManagerContext.ts';
import { useServerStore } from '@/stores/server.ts';

export default function FileBreadcrumbs({
  path,
  browsingBackup,
  onSearchClick,
}: {
  path: string;
  browsingBackup?: ServerBackup | null;
  onSearchClick?: () => void;
}) {
  const { server, setBrowsingDirectory, actingFileNames } = useServerStore();

  const { selectedFileNames, browsingEntries, setSelectedFiles } = useFileManager();

  const splittedPath = path.split('/').filter(Boolean);
  const pathItems = splittedPath.map((item, index) => {
    return {
      name: item,
      path: splittedPath.slice(0, index + 1).join('/'),
    };
  });

  const items: ReactNode[] = [
    browsingBackup ? 'backups' : 'home',
    <NavLink
      key='first-segment'
      to={
        browsingBackup
          ? `/server/${server?.uuidShort}/files-new?${createSearchParams({
              directory: `/.backups/${browsingBackup.uuid}`,
            })}`
          : `/server/${server?.uuidShort}/files-new`
      }
      className=' text-blue-300 hover:text-blue-200'
    >
      {browsingBackup ? browsingBackup.name : 'container'}
    </NavLink>,
    ...pathItems.slice(browsingBackup ? 2 : 0).map((item, index) => (
      <NavLink
        key={item.path}
        to={`/server/${server?.uuidShort}/files-new?${createSearchParams({ directory: item.path })}`}
        className=' text-blue-300 hover:text-blue-200'
        onClick={() => setBrowsingDirectory(item.path)}
      >
        {item.name}
      </NavLink>
    )),
  ];

  return (
    <div className='flex flex-row items-center justify-between'>
      <Breadcrumbs separatorMargin='xs'>
        <Checkbox
          disabled={actingFileNames.size > 0}
          checked={selectedFileNames.size > 0 && selectedFileNames.size >= browsingEntries.length}
          indeterminate={selectedFileNames.size > 0 && selectedFileNames.size < browsingEntries.length}
          className='mr-2'
          classNames={{ input: 'cursor-pointer!' }}
          onChange={() => {
            if (selectedFileNames.size >= browsingEntries.length) {
              setSelectedFiles([]);
            } else {
              setSelectedFiles(browsingEntries.map((entry) => entry.name));
            }
          }}
        />
        {items}
      </Breadcrumbs>

      <NavLink to={`/server/${server?.uuidShort}/files-new`} hidden={!browsingBackup}>
        <Button variant='light' leftSection={<FontAwesomeIcon icon={faDoorOpen} />}>
          Exit Backup
        </Button>
      </NavLink>
      <span hidden={!!browsingBackup}>
        <Button variant='light' leftSection={<FontAwesomeIcon icon={faSearch} />} onClick={onSearchClick}>
          Search
        </Button>
      </span>
    </div>
  );
}
