import { Group, Title } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { type Ref, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router';
import loadDirectory from '@/api/server/files/loadDirectory.ts';
import { ContextMenuProvider } from '@/elements/ContextMenu.tsx';
import ServerContentContainer from '@/elements/containers/ServerContentContainer.tsx';
import SelectionArea from '@/elements/SelectionArea.tsx';
import Spinner from '@/elements/Spinner.tsx';
import Table from '@/elements/Table.tsx';
import FileBreadcrumbs from '@/pages/server/filesnew/FileBreadcrumbs.tsx';
import FileModals from '@/pages/server/filesnew/FileModals.tsx';
import FileOperationsProgress from '@/pages/server/filesnew/FileOperationsProgress.tsx';
import FileRow from '@/pages/server/filesnew/FileRow.tsx';
import FileToolbar from '@/pages/server/filesnew/FileToolbar.tsx';
import FileUpload from '@/pages/server/filesnew/FileUpload.tsx';
import { useFileManager } from '@/providers/contexts/fileManagerContext.ts';
import { FileManagerProvider } from '@/providers/FileManagerProvider.tsx';
import { useServerStore } from '@/stores/server.ts';

function ServerFilesComponent() {
  const { server } = useServerStore();
  const {
    selectedFileNames,
    browsingDirectory,
    page,
    setSelectedFiles,
    setBrowsingEntries,
    setBrowsingWritableDirectory,
    setBrowsingFastDirectory,
  } = useFileManager();
  const [_, setSearchParams] = useSearchParams();

  const { data, isLoading } = useQuery({
    queryKey: ['server', server.uuid, 'files', 'directory', browsingDirectory, page],
    queryFn: () => loadDirectory(server.uuid, browsingDirectory, page),
  });

  useEffect(() => {
    if (!data) return;

    setBrowsingEntries(data.entries.data);
    setBrowsingWritableDirectory(data.isFilesystemWritable);
    setBrowsingFastDirectory(data.isFilesystemFast);
  }, [data]);

  const previousSelected = useRef<string[]>([]);

  const onSelectedStart = (event: React.MouseEvent | MouseEvent) => {
    previousSelected.current = event.shiftKey ? [...selectedFileNames] : [];
  };

  const onSelected = (selected: DirectoryEntry[]) => {
    setSelectedFiles([...previousSelected.current, ...selected.map((entry) => entry.name)]);
  };

  const onPageSelect = (page: number) => setSearchParams({ directory: browsingDirectory, page: page.toString() });

  return (
    <div className='h-fit relative'>
      <FileModals />
      <FileUpload />

      <Group justify='space-between' align='center' mb='md'>
        <Title order={1} c='white'>
          Files
        </Title>
        <Group>
          <FileOperationsProgress />
          <FileToolbar />
        </Group>
      </Group>

      <div className='bg-[#282828] border border-[#424242] rounded-lg mb-2 p-4'>
        <FileBreadcrumbs browsingBackup={null} path={decodeURIComponent(browsingDirectory)} />
      </div>

      {!data || isLoading ? (
        <Spinner.Centered />
      ) : (
        <SelectionArea onSelectedStart={onSelectedStart} onSelected={onSelected} fireEvents={false} className='h-full'>
          <ContextMenuProvider>
            <Table
              columns={['', 'Name', 'Size', 'Modified', '']}
              pagination={data.entries}
              onPageSelect={onPageSelect}
              allowSelect={false}
            >
              {data.entries.data.map((entry) => (
                <SelectionArea.Selectable key={entry.name} item={entry}>
                  {(innerRef: Ref<HTMLElement>) => (
                    <FileRow
                      ref={innerRef as Ref<HTMLTableRowElement>}
                      file={entry}
                      isSelected={selectedFileNames.has(entry.name)}
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
