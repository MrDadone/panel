import { faCog, faDatabase, faServer } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { z } from 'zod';
import getLocation from '@/api/admin/locations/getLocation.ts';
import { httpErrorToHuman } from '@/api/axios.ts';
import AdminContentContainer from '@/elements/containers/AdminContentContainer.tsx';
import Spinner from '@/elements/Spinner.tsx';
import SubNavigation from '@/elements/SubNavigation.tsx';
import { adminLocationSchema } from '@/lib/schemas/admin/locations.ts';
import { useToast } from '@/providers/ToastProvider.tsx';
import AdminLocationDatabaseHosts from './database-hosts/AdminLocationDatabaseHosts.tsx';
import LocationCreateOrUpdate from './LocationCreateOrUpdate.tsx';
import AdminLocationNodes from './nodes/AdminLocationNodes.tsx';

export default () => {
  const params = useParams<'id'>();
  const { addToast } = useToast();
  const [location, setLocation] = useState<z.infer<typeof adminLocationSchema> | null>(null);

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
    <AdminContentContainer title={location.name}>
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
    </AdminContentContainer>
  );
};
