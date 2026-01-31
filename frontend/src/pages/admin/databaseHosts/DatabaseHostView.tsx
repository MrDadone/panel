import { faCog, faDatabase } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import getDatabaseHost from '@/api/admin/database-hosts/getDatabaseHost.ts';
import { httpErrorToHuman } from '@/api/axios.ts';
import AdminContentContainer from '@/elements/containers/AdminContentContainer.tsx';
import Spinner from '@/elements/Spinner.tsx';
import SubNavigation from '@/elements/SubNavigation.tsx';
import AdminDatabaseHostDatabases from '@/pages/admin/databaseHosts/databases/AdminDatabaseHostDatabases.tsx';
import { useToast } from '@/providers/ToastProvider.tsx';
import DatabaseHostCreateOrUpdate from './DatabaseHostCreateOrUpdate.tsx';

export default function DatabaseHostView() {
  const params = useParams<'id'>();
  const { addToast } = useToast();
  const [databaseHost, setDatabaseHost] = useState<AdminDatabaseHost | null>(null);

  useEffect(() => {
    if (params.id) {
      getDatabaseHost(params.id)
        .then((databaseHost) => {
          setDatabaseHost(databaseHost);
        })
        .catch((msg) => {
          addToast(httpErrorToHuman(msg), 'error');
        });
    }
  }, [params.id]);

  return !databaseHost ? (
    <Spinner.Centered />
  ) : (
    <AdminContentContainer title={databaseHost.name}>
      <SubNavigation
        baseUrl={`/admin/database-hosts/${params.id}`}
        items={[
          {
            name: 'General',
            icon: faCog,
            path: `/`,
            element: <DatabaseHostCreateOrUpdate contextDatabaseHost={databaseHost} />,
          },
          {
            name: 'Databases',
            icon: faDatabase,
            path: `/databases`,
            element: <AdminDatabaseHostDatabases databaseHost={databaseHost} />,
          },
        ]}
      />
    </AdminContentContainer>
  );
}
