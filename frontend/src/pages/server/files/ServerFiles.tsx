import { Group, Title } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { join } from 'pathe';
import { type Ref, useCallback, useEffect, useRef } from 'react';
import { createSearchParams, useNavigate, useSearchParams } from 'react-router';
import { httpErrorToHuman } from '@/api/axios.ts';
import copyFile from '@/api/server/files/copyFile.ts';
import loadDirectory from '@/api/server/files/loadDirectory.ts';
import { ContextMenuProvider } from '@/elements/ContextMenu.tsx';
import ServerContentContainer from '@/elements/containers/ServerContentContainer.tsx';
import SelectionArea from '@/elements/SelectionArea.tsx';
import Spinner from '@/elements/Spinner.tsx';
import Table from '@/elements/Table.tsx';
import { isEditableFile, isViewableArchive, isViewableImage } from '@/lib/files.ts';
import FileActionBar from '@/pages/server/files/FileActionBar.tsx';
import FileBreadcrumbs from '@/pages/server/files/FileBreadcrumbs.tsx';
import FileModals from '@/pages/server/files/FileModals.tsx';
import FileOperationsProgress from '@/pages/server/files/FileOperationsProgress.tsx';
import FileRow from '@/pages/server/files/FileRow.tsx';
import FileSearchBanner from '@/pages/server/files/FileSearchBanner.tsx';
import FileSettings from '@/pages/server/files/FileSettings.tsx';
import FileToolbar from '@/pages/server/files/FileToolbar.tsx';
import FileUpload from '@/pages/server/files/FileUpload.tsx';
import { useKeyboardShortcuts } from '@/plugins/useKeyboardShortcuts.ts';
import { useServerCan } from '@/plugins/usePermissions.ts';
import { useFileManager } from '@/providers/contexts/fileManagerContext.ts';
import { FileManagerProvider } from '@/providers/FileManagerProvider.tsx';
import { useToast } from '@/providers/ToastProvider.tsx';
import { useGlobalStore } from '@/stores/global.ts';
import { useServerStore } from '@/stores/server.ts';

function ServerFilesComponent() {
  const { settings } = useGlobalStore();
  const { server } = useServerStore();
  const {
    selectedFiles,
    browsingDirectory,
    browsingEntries,
    page,
    openModal,
    browsingFastDirectory,
    setSelectedFiles,
    setBrowsingEntries,
    setBrowsingWritableDirectory,
    setBrowsingFastDirectory,
    doOpenModal,
  } = useFileManager();
  const { addToast } = useToast();
  const [_, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const canOpenFile = useServerCan('files.read-content');

  const { data, isLoading } = useQuery({
    queryKey: ['server', server.uuid, 'files', { browsingDirectory, page }],
    queryFn: () => loadDirectory(server.uuid, browsingDirectory, page),
  });

  useEffect(() => {
    if (!data) return;

    setBrowsingEntries(data.entries);
    setBrowsingWritableDirectory(data.isFilesystemWritable);
    setBrowsingFastDirectory(data.isFilesystemFast);
  }, [data]);

  const resetEntries = () => {
    if (!data) return;

    setBrowsingEntries(data.entries);
  };

  const previousSelected = useRef<DirectoryEntry[]>([]);

  const onSelectedStart = (event: React.MouseEvent | MouseEvent) => {
    previousSelected.current = event.shiftKey ? [...selectedFiles] : [];
  };

  const onSelected = (selected: DirectoryEntry[]) => {
    setSelectedFiles(new Set([...previousSelected.current, ...selected]));
  };

  const onPageSelect = (page: number) => setSearchParams({ directory: browsingDirectory, page: page.toString() });

  const handleOpen = useCallback(
    (file: DirectoryEntry) => {
      if (
        ((isEditableFile(file) || isViewableImage(file)) && file.size <= settings.server.maxFileManagerViewSize) ||
        file.directory ||
        (isViewableArchive(file) && browsingFastDirectory)
      ) {
        if (file.directory || (isViewableArchive(file) && browsingFastDirectory)) {
          setSearchParams({
            directory: join(browsingDirectory, file.name),
          });
        } else {
          if (!canOpenFile) return;

          navigate(
            `/server/${server.uuidShort}/files/${isViewableImage(file) ? 'image' : 'edit'}?${createSearchParams({
              directory: browsingDirectory,
              file: file.name,
            })}`,
          );
        }
      }
    },
    [server.uuidShort, settings, browsingDirectory, browsingFastDirectory, canOpenFile],
  );

  useKeyboardShortcuts({
    shortcuts: [
      {
        key: 'a',
        modifiers: ['ctrlOrMeta'],
        callback: () => setSelectedFiles(new Set(browsingEntries.data)),
      },
      {
        key: 'f',
        modifiers: ['ctrlOrMeta'],
        callback: () => doOpenModal('search'),
      },
      {
        key: 'ArrowUp',
        callback: () => {
          if (selectedFiles.size === 0) return;

          const selectedIndices = [...selectedFiles.keys()]
            .map((file) => browsingEntries.data.findIndex((value) => value.name === file.name))
            .filter((index) => index !== -1);

          if (selectedIndices.length === 0) return;

          const minIndex = Math.min(...selectedIndices);
          if (minIndex <= 0) return;

          const nextFiles = selectedIndices.map((index) => browsingEntries.data[index - 1]);

          setSelectedFiles(new Set(nextFiles));
        },
      },
      {
        key: 'ArrowDown',
        callback: () => {
          if (selectedFiles.size === 0) return;

          const selectedIndices = [...selectedFiles.keys()]
            .map((file) => browsingEntries.data.findIndex((value) => value.name === file.name))
            .filter((index) => index !== -1);

          if (selectedIndices.length === 0) return;

          const maxIndex = Math.max(...selectedIndices);
          if (maxIndex >= browsingEntries.data.length - 1) return;

          const nextFiles = selectedIndices.map((index) => browsingEntries.data[index + 1]);

          setSelectedFiles(new Set(nextFiles));
        },
      },
      {
        key: 'ArrowUp',
        modifiers: ['alt'],
        callback: () =>
          setSearchParams({
            directory: join(browsingDirectory, '..'),
          }),
      },
      {
        key: 'd',
        callback: () => {
          if (selectedFiles.size === 1) {
            const file = [...selectedFiles.keys()][0];

            copyFile(server.uuid, join(browsingDirectory, file.name), null)
              .then(() => {
                addToast('File copying has started.', 'success');
              })
              .catch((msg) => {
                addToast(httpErrorToHuman(msg), 'error');
              });
          }
        },
      },
      {
        key: 'f2',
        callback: () => {
          if (selectedFiles.size === 1) {
            doOpenModal('rename', [[...selectedFiles.keys()][0]]);
          }
        },
      },
      {
        key: 'Enter',
        callback: () => {
          if (selectedFiles.size === 1 && openModal === null) {
            handleOpen([...selectedFiles.keys()][0]);
          }
        },
      },
    ],
    deps: [browsingEntries.data, selectedFiles, handleOpen],
  });

  return (
    <div className='h-fit relative'>
      <FileModals />
      <FileUpload />
      <FileActionBar />

      <Group justify='space-between' align='center' mb='md'>
        <Group>
          <Title order={1} c='white'>
            Files
          </Title>

          <FileSettings />
        </Group>
        <Group>
          <FileOperationsProgress />
          <FileToolbar />
        </Group>
      </Group>

      <div className='bg-[#282828] border border-[#424242] rounded-lg mb-2 p-4'>
        <FileBreadcrumbs path={decodeURIComponent(browsingDirectory)} />
      </div>

      <FileSearchBanner resetEntries={resetEntries} />

      {!data || isLoading ? (
        <Spinner.Centered />
      ) : (
        <SelectionArea onSelectedStart={onSelectedStart} onSelected={onSelected} fireEvents={false} className='h-full'>
          <ContextMenuProvider>
            <Table
              columns={['', 'Name', 'Size', 'Modified', '']}
              pagination={browsingEntries}
              onPageSelect={onPageSelect}
              allowSelect={false}
            >
              {browsingEntries.data.map((entry) => (
                <SelectionArea.Selectable key={entry.name} item={entry}>
                  {(innerRef: Ref<HTMLElement>) => (
                    <FileRow
                      ref={innerRef as Ref<HTMLTableRowElement>}
                      file={entry}
                      handleOpen={() => handleOpen(entry)}
                      isSelected={selectedFiles.has(entry)}
                      multipleSelected={selectedFiles.size > 1}
                    />
                  )}
                </SelectionArea.Selectable>
              ))}
            </Table>
          </ContextMenuProvider>
        </SelectionArea>
      )}
    </div>
  );
}

export default function ServerFiles() {
  return (
    <ServerContentContainer title='Files' hideTitleComponent>
      <FileManagerProvider>
        <ServerFilesComponent />
      </FileManagerProvider>
    </ServerContentContainer>
  );
}
