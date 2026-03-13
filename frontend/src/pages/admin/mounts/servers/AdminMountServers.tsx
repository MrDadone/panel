import { useState } from 'react';
import { z } from 'zod';
import getMountServers from '@/api/admin/mounts/servers/getMountServers.ts';
import { getEmptyPaginationSet } from '@/api/axios.ts';
import AdminSubContentContainer from '@/elements/containers/AdminSubContentContainer.tsx';
import Table from '@/elements/Table.tsx';
import { adminMountSchema } from '@/lib/schemas/admin/mounts.ts';
import { adminServerSchema } from '@/lib/schemas/admin/servers.ts';
import { serverTableColumns } from '@/lib/tableColumns.ts';
import { useSearchablePaginatedTable } from '@/plugins/useSearchablePageableTable.ts';
import ServerRow from '../../servers/ServerRow.tsx';

export default function AdminMountServers({ mount }: { mount: z.infer<typeof adminMountSchema> }) {
  const [mountServers, setMountServers] = useState<
    Pagination<AndCreated<{ server: z.infer<typeof adminServerSchema> }>>
  >(getEmptyPaginationSet());

  const { loading, search, setSearch, setPage } = useSearchablePaginatedTable({
    fetcher: (page, search) => getMountServers(mount.uuid, page, search),
    setStoreData: setMountServers,
  });

  return (
    <AdminSubContentContainer title='Mount Servers' titleOrder={2} search={search} setSearch={setSearch}>
      <Table columns={serverTableColumns} loading={loading} pagination={mountServers} onPageSelect={setPage}>
        {mountServers.data.map((serverMount) => (
          <ServerRow key={serverMount.server.uuid} server={serverMount.server} />
        ))}
      </Table>
    </AdminSubContentContainer>
  );
}
