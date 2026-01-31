import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import getLocationDatabaseHosts from '@/api/admin/locations/database-hosts/getLocationDatabaseHosts.ts';
import Button from '@/elements/Button.tsx';
import { AdminCan } from '@/elements/Can.tsx';
import { ContextMenuProvider } from '@/elements/ContextMenu.tsx';
import AdminSubContentContainer from '@/elements/containers/AdminSubContentContainer.tsx';
import Table from '@/elements/Table.tsx';
import { locationDatabaseHostTableColumns } from '@/lib/tableColumns.ts';
import { useSearchablePaginatedTable } from '@/plugins/useSearchablePageableTable.ts';
import { useAdminStore } from '@/stores/admin.tsx';
import LocationDatabaseHostRow from './LocationDatabaseHostRow.tsx';
import LocationDatabaseHostCreateModal from './modals/LocationDatabaseHostCreateModal.tsx';

export default function AdminLocationDatabaseHosts({ location }: { location: Location }) {
  const { locationDatabaseHosts, setLocationDatabaseHosts } = useAdminStore();

  const [openModal, setOpenModal] = useState<'create' | null>(null);

  const { loading, search, setSearch, setPage } = useSearchablePaginatedTable({
    fetcher: (page, search) => getLocationDatabaseHosts(location.uuid, page, search),
    setStoreData: setLocationDatabaseHosts,
  });

  return (
    <AdminSubContentContainer
      title='Location Database Hosts'
      titleOrder={2}
      search={search}
      setSearch={setSearch}
      contentRight={
        <AdminCan action='database-hosts.read'>
          <Button onClick={() => setOpenModal('create')} color='blue' leftSection={<FontAwesomeIcon icon={faPlus} />}>
            Add
          </Button>
        </AdminCan>
      }
    >
      <AdminCan action='database-hosts.read'>
        <LocationDatabaseHostCreateModal
          location={location}
          opened={openModal === 'create'}
          onClose={() => setOpenModal(null)}
        />
      </AdminCan>

      <ContextMenuProvider>
        <Table
          columns={locationDatabaseHostTableColumns}
          loading={loading}
          pagination={locationDatabaseHosts}
          onPageSelect={setPage}
        >
          {locationDatabaseHosts.data.map((databaseHost) => (
            <LocationDatabaseHostRow
              key={databaseHost.databaseHost.uuid}
              location={location}
              databaseHost={databaseHost}
            />
          ))}
        </Table>
      </ContextMenuProvider>
    </AdminSubContentContainer>
  );
}
