import { useState } from 'react';
import { z } from 'zod';
import getBackupConfigurationLocations from '@/api/admin/backup-configurations/locations/getBackupConfigurationLocations.ts';
import { getEmptyPaginationSet } from '@/api/axios.ts';
import AdminSubContentContainer from '@/elements/containers/AdminSubContentContainer.tsx';
import Table from '@/elements/Table.tsx';
import { adminBackupConfigurationSchema } from '@/lib/schemas/admin/backupConfigurations.ts';
import { adminLocationSchema } from '@/lib/schemas/admin/locations.ts';
import { locationTableColumns } from '@/lib/tableColumns.ts';
import LocationRow from '@/pages/admin/locations/LocationRow.tsx';
import { useSearchablePaginatedTable } from '@/plugins/useSearchablePageableTable.ts';

export default function AdminBackupConfigurationLocations({
  backupConfiguration,
}: {
  backupConfiguration: z.infer<typeof adminBackupConfigurationSchema>;
}) {
  const [backupConfigurationLocations, setBackupConfigurationLocations] = useState<
    Pagination<z.infer<typeof adminLocationSchema>>
  >(getEmptyPaginationSet());

  const { loading, search, setSearch, setPage } = useSearchablePaginatedTable({
    fetcher: (page, search) => getBackupConfigurationLocations(backupConfiguration.uuid, page, search),
    setStoreData: setBackupConfigurationLocations,
  });

  return (
    <AdminSubContentContainer title={`Backup Config Locations`} titleOrder={2} search={search} setSearch={setSearch}>
      <Table
        columns={locationTableColumns}
        loading={loading}
        pagination={backupConfigurationLocations}
        onPageSelect={setPage}
      >
        {backupConfigurationLocations.data.map((location) => (
          <LocationRow key={location.uuid} location={location} />
        ))}
      </Table>
    </AdminSubContentContainer>
  );
}
