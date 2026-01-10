import { faCog, faDatabase, faServer } from '@fortawesome/free-solid-svg-icons';
import { Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import getLocation from '@/api/admin/locations/getLocation.ts';
import { httpErrorToHuman } from '@/api/axios.ts';
import Spinner from '@/elements/Spinner.tsx';
import SubNavigation from '@/elements/SubNavigation.tsx';
import { useToast } from '@/providers/ToastProvider.tsx';
import AdminLocationDatabaseHosts from './database-hosts/AdminLocationDatabaseHosts.tsx';
import LocationCreateOrUpdate from './LocationCreateOrUpdate.tsx';
import AdminLocationNodes from './nodes/AdminLocationNodes.tsx';

export default () => {
  const params = useParams<'id'>();
  const { addToast } = useToast();
  const [location, setLocation] = useState<Location | null>(null);

  useEffect(() => {
    if (params.id) {
      getLocation(params.id)
        .then((location) => {
          setLocation(location);
        })
        .catch((msg) => {
          addToast(httpErrorToHuman(msg), 'error');
        });
    }
  }, [params.id]);

  return !location ? (
    <Spinner.Centered />
  ) : (
    <>
      <Title order={1}>{location.name}</Title>

      <SubNavigation
        baseUrl={`/admin/locations/${params.id}`}
        items={[
          {
            name: 'General',
            icon: faCog,
            path: '/',
            element: <LocationCreateOrUpdate contextLocation={location} />,
          },
          {
            name: 'Database Hosts',
            icon: faDatabase,
            path: `/database-hosts`,
            element: <AdminLocationDatabaseHosts location={location} />,
            permission: 'locations.database-hosts',
          },
          {
            name: 'Nodes',
            icon: faServer,
            path: `/nodes`,
            element: <AdminLocationNodes location={location} />,
            permission: 'nodes.read',
          },
        ]}
      />
    </>
  );
};
