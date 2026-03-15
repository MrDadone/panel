import { useState } from 'react';
import { z } from 'zod';
import getMountNestEggs from '@/api/admin/mounts/nest-eggs/getMountNestEggs.ts';
import { getEmptyPaginationSet } from '@/api/axios.ts';
import AdminSubContentContainer from '@/elements/containers/AdminSubContentContainer.tsx';
import Table from '@/elements/Table.tsx';
import { adminEggSchema } from '@/lib/schemas/admin/eggs.ts';
import { adminMountSchema } from '@/lib/schemas/admin/mounts.ts';
import { adminNestSchema } from '@/lib/schemas/admin/nests.ts';
import { eggTableColumns } from '@/lib/tableColumns.ts';
import { useSearchablePaginatedTable } from '@/plugins/useSearchablePageableTable.ts';
import EggRow from '../../nests/eggs/EggRow.tsx';

export default function AdminMountNestEggs({ mount }: { mount: z.infer<typeof adminMountSchema> }) {
  const [mountNestEggs, setMountNestEggs] = useState<
    Pagination<AndCreated<{ nest: z.infer<typeof adminNestSchema>; nestEgg: z.infer<typeof adminEggSchema> }>>
  >(getEmptyPaginationSet());

  const { loading, search, setSearch, setPage } = useSearchablePaginatedTable({
    fetcher: (page, search) => getMountNestEggs(mount.uuid, page, search),
    setStoreData: setMountNestEggs,
  });

  return (
    <AdminSubContentContainer title='Mount Eggs' titleOrder={2} search={search} setSearch={setSearch}>
      <Table columns={eggTableColumns} loading={loading} pagination={mountNestEggs} onPageSelect={setPage}>
        {mountNestEggs.data.map((nestEggMount) => (
          <EggRow key={nestEggMount.nestEgg.uuid} nest={nestEggMount.nest} egg={nestEggMount.nestEgg} />
        ))}
      </Table>
    </AdminSubContentContainer>
  );
}
