import {
  faChevronDown,
  faDownload,
  faFileCirclePlus,
  faFileUpload,
  faFolderOpen,
  faFolderPlus,
  faServer,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Group } from '@mantine/core';
import { createSearchParams, useNavigate } from 'react-router';
import Button from '@/elements/Button.tsx';
import { ServerCan } from '@/elements/Can.tsx';
import ContextMenu, { ContextMenuProvider } from '@/elements/ContextMenu.tsx';
import { useFileManager } from '@/providers/FileManagerProvider.tsx';
import { useServerStore } from '@/stores/server.ts';

export default function FileToolbar() {
  const navigate = useNavigate();
  const { server } = useServerStore();
  const { fileInputRef, folderInputRef, browsingDirectory, browsingWritableDirectory, doOpenModal } = useFileManager();

  return (
    <Group>
      <ServerCan action='files.sftp'>
        <Button
          variant='outline'
          leftSection={<FontAwesomeIcon icon={faServer} />}
          onClick={() => doOpenModal('sftpDetails')}
        >
          SFTP Details
        </Button>
      </ServerCan>
      {browsingWritableDirectory && (
        <ServerCan action='files.create'>
          <ContextMenuProvider>
            <ContextMenu
              items={[
                {
                  icon: faFileCirclePlus,
                  label: 'File from Editor',
                  onClick: () =>
                    navigate(
                      `/server/${server.uuidShort}/files/new?${createSearchParams({ directory: browsingDirectory })}`,
                    ),
                  color: 'gray',
                },
                {
                  icon: faFolderPlus,
                  label: 'Directory',
                  onClick: () => doOpenModal('nameDirectory'),
                  color: 'gray',
                },
                {
                  icon: faDownload,
                  label: 'File from Pull',
                  onClick: () => doOpenModal('pullFile'),
                  color: 'gray',
                },
                {
                  icon: faFileUpload,
                  label: 'File from Upload',
                  onClick: () => fileInputRef.current?.click(),
                  color: 'gray',
                },
                {
                  icon: faFolderOpen,
                  label: 'Directory from Upload',
                  onClick: () => folderInputRef.current?.click(),
                  color: 'gray',
                },
              ]}
            >
              {({ openMenu }) => (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    openMenu(rect.left, rect.bottom);
                  }}
                  color='blue'
                  rightSection={<FontAwesomeIcon icon={faChevronDown} />}
                >
                  New
                </Button>
              )}
            </ContextMenu>
          </ContextMenuProvider>
        </ServerCan>
      )}
    </Group>
  );
}
