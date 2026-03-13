import { Ref, useEffect, useState } from 'react';
import { z } from 'zod';
import getNodeTransferringServers from '@/api/admin/nodes/servers/getNodeTransferringServers.ts';
import { getEmptyPaginationSet } from '@/api/axios.ts';
import AdminSubContentContainer from '@/elements/containers/AdminSubContentContainer.tsx';
import SelectionArea from '@/elements/SelectionArea.tsx';
import Table from '@/elements/Table.tsx';
import { adminNodeSchema, adminNodeTransferProgressSchema } from '@/lib/schemas/admin/nodes.ts';
import { adminServerSchema } from '@/lib/schemas/admin/servers.ts';
import { useSearchablePaginatedTable } from '@/plugins/useSearchablePageableTable.ts';
import ServerRow from './ServerRow.tsx';

export default function AdminNodeTransfers({ node }: { node: z.infer<typeof adminNodeSchema> }) {
  const [nodeTransferringServers, setNodeTransferringServers] = useState<{
    servers: Pagination<z.infer<typeof adminServerSchema>>;
    transfers: Record<string, z.infer<typeof adminNodeTransferProgressSchema>>;
  }>({
    servers: getEmptyPaginationSet(),
    transfers: {},
  });

  const { loading, search, setSearch, setPage, refetch } = useSearchablePaginatedTable({
    fetcher: (page, search) => getNodeTransferringServers(node.uuid, page, search),
    setStoreData: setNodeTransferringServers,
    paginationKey: 'servers',
  });

  useEffect(() => {
    const interval = setInterval(() => {
      refetch(false);
    }, 1000);

    return () => clearInterval(interval);
  }, [node.uuid, search]);

  return (
    <>
      <AdminSubContentContainer title='Node Transfers' titleOrder={2} search={search} setSearch={setSearch}>
        <Table
          columns={['ID', 'Progress', 'Archive Rate', 'Network Rate', 'Name', 'Node', 'Owner', 'Created']}
          loading={loading}
          pagination={nodeTransferringServers.servers}
          onPageSelect={setPage}
          allowSelect={false}
        >
          {nodeTransferringServers.servers.data.map((server) => (
            <SelectionArea.Selectable key={server.uuid} item={server}>
              {(innerRef: Ref<HTMLElement>) => (
                <ServerRow
                  key={server.uuid}
                  server={server}
                  transferProgress={nodeTransferringServers.transfers[server.uuid]}
                  ref={innerRef as Ref<HTMLTableRowElement>}
                />
              )}
            </SelectionArea.Selectable>
          ))}
        </Table>
      </AdminSubContentContainer>
    </>
  );
}
