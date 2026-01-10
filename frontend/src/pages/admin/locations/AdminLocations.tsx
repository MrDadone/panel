import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Route, Routes, useNavigate } from 'react-router';
import getLocations from '@/api/admin/locations/getLocations.ts';
import Button from '@/elements/Button.tsx';
import { AdminCan } from '@/elements/Can.tsx';
import AdminContentContainer from '@/elements/containers/AdminContentContainer.tsx';
import Table from '@/elements/Table.tsx';
import { locationTableColumns } from '@/lib/tableColumns.ts';
import { useSearchablePaginatedTable } from '@/plugins/useSearchablePageableTable.ts';
import AdminPermissionGuard from '@/routers/guards/AdminPermissionGuard.tsx';
import { useAdminStore } from '@/stores/admin.tsx';
import LocationCreateOrUpdate from './LocationCreateOrUpdate.tsx';
import LocationRow from './LocationRow.tsx';
import LocationView from './LocationView.tsx';

function LocationsContainer() {
  const navigate = useNavigate();
  const { locations, setLocations } = useAdminStore();

  const { loading, search, setSearch, setPage } = useSearchablePaginatedTable({
    fetcher: getLocations,
    setStoreData: setLocations,
  });

  return (
    <AdminContentContainer
      title='Locations'
      search={search}
      setSearch={setSearch}
      contentRight={
        <AdminCan action='locations.create'>
          <Button
            onClick={() => navigate('/admin/locations/new')}
            color='blue'
            leftSection={<FontAwesomeIcon icon={faPlus} />}
          >
            Create
          </Button>
        </AdminCan>
      }
    >
      <Table columns={locationTableColumns} loading={loading} pagination={locations} onPageSelect={setPage}>
        {locations.data.map((location) => (
          <LocationRow key={location.uuid} location={location} />
        ))}
      </Table>
    </AdminContentContainer>
  );
}

export default function AdminLocations() {
  return (
    <Routes>
      <Route path='/' element={<LocationsContainer />} />
      <Route path='/:id/*' element={<LocationView />} />
      <Route element={<AdminPermissionGuard permission='locations.create' />}>
        <Route path='/new' element={<LocationCreateOrUpdate />} />
      </Route>
    </Routes>
  );
}
