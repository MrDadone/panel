import { useState } from 'react';
import { z } from 'zod';
import getDatabaseHostDatabases from '@/api/admin/database-hosts/getDatabaseHostDatabases.ts';
import { getEmptyPaginationSet } from '@/api/axios.ts';
import AdminSubContentContainer from '@/elements/containers/AdminSubContentContainer.tsx';
import Table from '@/elements/Table.tsx';
import { adminDatabaseHostSchema } from '@/lib/schemas/admin/databaseHosts.ts';
import { adminServerDatabaseSchema } from '@/lib/schemas/admin/servers.ts';
import { databaseHostDatabaseTableColumns } from '@/lib/tableColumns.ts';
import { useSearchablePaginatedTable } from '@/plugins/useSearchablePageableTable.ts';
import DatabaseRow from './DatabaseRow.tsx';

export default function AdminDatabaseHostDatabases({
  databaseHost,
}: {
  databaseHost: z.infer<typeof adminDatabaseHostSchema>;
}) {
  const [databaseHostDatabases, setDatabaseHostDatabases] = useState<
    Pagination<z.infer<typeof adminServerDatabaseSchema>>
  >(getEmptyPaginationSet());

  const { loading, search, setSearch, setPage } = useSearchablePaginatedTable({
    fetcher: (page, search) => getDatabaseHostDatabases(databaseHost.uuid, page, search),
    setStoreData: setDatabaseHostDatabases,
  });

  return (
    <AdminSubContentContainer title={`Database Host Databases`} titleOrder={2} search={search} setSearch={setSearch}>
      <Table
        columns={databaseHostDatabaseTableColumns}
        loading={loading}
        pagination={databaseHostDatabases}
        onPageSelect={setPage}
      >
        {databaseHostDatabases.data.map((database) => (
          <DatabaseRow key={database.uuid} database={database} />
        ))}
      </Table>
    </AdminSubContentContainer>
  );
}
