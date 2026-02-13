import { useQuery } from '@tanstack/react-query';
import { type Ref, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import loadDirectory from '@/api/server/files/loadDirectory.ts';
import { ContextMenuProvider } from '@/elements/ContextMenu.tsx';
import ServerContentContainer from '@/elements/containers/ServerContentContainer.tsx';
import SelectionArea from '@/elements/SelectionArea.tsx';
import Spinner from '@/elements/Spinner.tsx';
import Table from '@/elements/Table.tsx';
import FileBreadcrumbs from '@/pages/server/filesnew/FileBreadcrumbs.tsx';
import FileModals from '@/pages/server/filesnew/FileModals.tsx';
import FileRow from '@/pages/server/filesnew/FileRow.tsx';
import { useFileManager } from '@/providers/contexts/fileManagerContext.ts';
import { FileManagerProvider } from '@/providers/FileManagerProvider.tsx';
import { useServerStore } from '@/stores/server.ts';

function ServerFilesComponent() {
  const { server } = useServerStore();
  const { selectedFileNames, browsingDirectory, page, setSelectedFiles, setBrowsingEntries } = useFileManager();
  const [_, setSearchParams] = useSearchParams();

  const { data, isLoading } = useQuery({
    queryKey: ['server', server.uuid, 'files', 'directory', browsingDirectory, page],
    queryFn: () => loadDirectory(server.uuid, browsingDirectory, page),
  });

  useEffect(() => {
    if (!data) return;

    setBrowsingEntries(data.entries.data);
  }, [data]);

  const onPageSelect = (page: number) => setSearchParams({ directory: browsingDirectory, page: page.toString() });

  const onSelected = (selected: DirectoryEntry[]) => setSelectedFiles(selected.map((entry) => entry.name));

  return (
    <div className='h-fit relative'>
      <FileModals />

      <div className='bg-[#282828] border border-[#424242] rounded-lg mb-2 p-4'>
        <FileBreadcrumbs browsingBackup={false} path={decodeURIComponent(browsingDirectory)} />
      </div>

      {!data || isLoading ? (
        <Spinner.Centered />
      ) : (
        <SelectionArea onSelected={onSelected} className='h-full'>
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
