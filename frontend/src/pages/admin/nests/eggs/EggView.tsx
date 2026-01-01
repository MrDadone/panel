import { faCodeCommit, faCog, faComputer, faEgg } from '@fortawesome/free-solid-svg-icons';
import { Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import getEgg from '@/api/admin/nests/eggs/getEgg.ts';
import { httpErrorToHuman } from '@/api/axios.ts';
import Spinner from '@/elements/Spinner.tsx';
import SubNavigation from '@/elements/SubNavigation.tsx';
import EggCreateOrUpdate from '@/pages/admin/nests/eggs/EggCreateOrUpdate.tsx';
import AdminEggMounts from '@/pages/admin/nests/eggs/mounts/AdminEggMounts.tsx';
import AdminEggVariables from '@/pages/admin/nests/eggs/variables/AdminEggVariables.tsx';
import { useToast } from '@/providers/ToastProvider.tsx';
import AdminEggServers from './servers/AdminEggServers.tsx';

export default function EggView({ contextNest }: { contextNest: AdminNest }) {
  const params = useParams<'eggId'>();
  const { addToast } = useToast();
  const [egg, setEgg] = useState<AdminNestEgg | null>(null);

  useEffect(() => {
    if (params.eggId) {
      getEgg(contextNest.uuid, params.eggId)
        .then((egg) => {
          setEgg(egg);
        })
        .catch((msg) => {
          addToast(httpErrorToHuman(msg), 'error');
        });
    }
  }, [params.eggId]);

  return !contextNest || !egg ? (
    <Spinner.Centered />
  ) : (
    <>
      <Title order={2}>{egg?.name}</Title>

      <SubNavigation
        baseUrl={`/admin/nests/${contextNest.uuid}/eggs/${params.eggId}`}
        items={[
          {
            name: 'General',
            icon: faCog,
            path: '/',
            element: <EggCreateOrUpdate contextNest={contextNest} contextEgg={egg} />,
          },
          {
            name: 'Variables',
            icon: faCodeCommit,
            path: `/variables`,
            element: <AdminEggVariables contextNest={contextNest} contextEgg={egg} />,
          },
          {
            name: 'Mounts',
            icon: faEgg,
            path: `/mounts`,
            element: <AdminEggMounts contextNest={contextNest} contextEgg={egg} />,
            permission: 'eggs.mounts',
          },
          {
            name: 'Servers',
            icon: faComputer,
            path: `/servers`,
            element: <AdminEggServers contextNest={contextNest} contextEgg={egg} />,
            permission: 'servers.read',
          },
        ]}
      />
    </>
  );
}
