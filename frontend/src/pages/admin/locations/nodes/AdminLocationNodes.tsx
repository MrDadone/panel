import { useState } from 'react';
import { z } from 'zod';
import getLocationNodes from '@/api/admin/locations/nodes/getLocationNodes.ts';
import { getEmptyPaginationSet } from '@/api/axios.ts';
import AdminSubContentContainer from '@/elements/containers/AdminSubContentContainer.tsx';
import Table from '@/elements/Table.tsx';
import { adminLocationSchema } from '@/lib/schemas/admin/locations.ts';
import { adminNodeSchema } from '@/lib/schemas/admin/nodes.ts';
import { nodeTableColumns } from '@/lib/tableColumns.ts';
import { useSearchablePaginatedTable } from '@/plugins/useSearchablePageableTable.ts';
import NodeRow from '../../nodes/NodeRow.tsx';

export default function AdminLocationNodes({ location }: { location: z.infer<typeof adminLocationSchema> }) {
  const [locationNodes, setLocationNodes] = useState<Pagination<z.infer<typeof adminNodeSchema>>>(
    getEmptyPaginationSet(),
  );

  const { loading, search, setSearch, setPage } = useSearchablePaginatedTable({
    fetcher: (page, search) => getLocationNodes(location.uuid, page, search),
    setStoreData: setLocationNodes,
  });

  return (
    <AdminSubContentContainer title='Location Nodes' titleOrder={2} search={search} setSearch={setSearch}>
      <Table columns={nodeTableColumns} loading={loading} pagination={locationNodes} onPageSelect={setPage}>
        {locationNodes.data.map((node) => (
          <NodeRow key={node.uuid} node={node} />
        ))}
      </Table>
    </AdminSubContentContainer>
  );
}
