import { useState } from 'react';
import { z } from 'zod';
import getMountNodes from '@/api/admin/mounts/nodes/getMountNodes.ts';
import { getEmptyPaginationSet } from '@/api/axios.ts';
import AdminSubContentContainer from '@/elements/containers/AdminSubContentContainer.tsx';
import Table from '@/elements/Table.tsx';
import { adminMountSchema } from '@/lib/schemas/admin/mounts.ts';
import { adminNodeSchema } from '@/lib/schemas/admin/nodes.ts';
import { nodeTableColumns } from '@/lib/tableColumns.ts';
import { useSearchablePaginatedTable } from '@/plugins/useSearchablePageableTable.ts';
import NodeRow from '../../nodes/NodeRow.tsx';

export default function AdminMountNodes({ mount }: { mount: z.infer<typeof adminMountSchema> }) {
  const [mountNodes, setMountNodes] = useState<Pagination<AndCreated<{ node: z.infer<typeof adminNodeSchema> }>>>(
    getEmptyPaginationSet(),
  );

  const { loading, search, setSearch, setPage } = useSearchablePaginatedTable({
    fetcher: (page, search) => getMountNodes(mount.uuid, page, search),
    setStoreData: setMountNodes,
  });

  return (
    <AdminSubContentContainer title='Mount Nodes' titleOrder={2} search={search} setSearch={setSearch}>
      <Table columns={nodeTableColumns} loading={loading} pagination={mountNodes} onPageSelect={setPage}>
        {mountNodes.data.map((nodeMount) => (
          <NodeRow key={nodeMount.node.uuid} node={nodeMount.node} />
        ))}
      </Table>
    </AdminSubContentContainer>
  );
}
