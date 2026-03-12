import { useState } from 'react';
import { z } from 'zod';
import getBackupConfigurationServers from '@/api/admin/backup-configurations/servers/getBackupConfigurationServers.ts';
import { getEmptyPaginationSet } from '@/api/axios.ts';
import AdminSubContentContainer from '@/elements/containers/AdminSubContentContainer.tsx';
import Table from '@/elements/Table.tsx';
import { adminBackupConfigurationSchema } from '@/lib/schemas/admin/backupConfigurations.ts';
import { adminServerSchema } from '@/lib/schemas/admin/servers.ts';
import { serverTableColumns } from '@/lib/tableColumns.ts';
import ServerRow from '@/pages/admin/servers/ServerRow.tsx';
import { useSearchablePaginatedTable } from '@/plugins/useSearchablePageableTable.ts';

export default function AdminBackupConfigurationServers({
  backupConfiguration,
}: {
  backupConfiguration: z.infer<typeof adminBackupConfigurationSchema>;
}) {
  const [backupConfigurationServers, setBackupConfigurationServers] = useState<
    Pagination<z.infer<typeof adminServerSchema>>
  >(getEmptyPaginationSet());

  const { loading, search, setSearch, setPage } = useSearchablePaginatedTable({
    fetcher: (page, search) => getBackupConfigurationServers(backupConfiguration.uuid, page, search),
    setStoreData: setBackupConfigurationServers,
  });

  return (
    <AdminSubContentContainer title={`Backup Config Servers`} titleOrder={2} search={search} setSearch={setSearch}>
      <Table
        columns={serverTableColumns}
        loading={loading}
        pagination={backupConfigurationServers}
        onPageSelect={setPage}
      >
        {backupConfigurationServers.data.map((server) => (
          <ServerRow key={server.uuid} server={server} />
        ))}
      </Table>
    </AdminSubContentContainer>
  );
}
