import { faCog, faComputer, faEgg, faServer } from '@fortawesome/free-solid-svg-icons';
import { Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import getMount from '@/api/admin/mounts/getMount.ts';
import { httpErrorToHuman } from '@/api/axios.ts';
import Spinner from '@/elements/Spinner.tsx';
import SubNavigation from '@/elements/SubNavigation.tsx';
import MountCreateOrUpdate from '@/pages/admin/mounts/MountCreateOrUpdate.tsx';
import { useToast } from '@/providers/ToastProvider.tsx';
import AdminMountEggs from './eggs/AdminMountEggs.tsx';
import AdminMountNodes from './nodes/AdminMountNodes.tsx';
import AdminMountServers from './servers/AdminMountServers.tsx';

export default function MountView() {
  const params = useParams<'id'>();
  const { addToast } = useToast();
  const [mount, setMount] = useState<Mount | null>(null);

  useEffect(() => {
    if (params.id) {
      getMount(params.id)
        .then((mount) => {
          setMount(mount);
        })
        .catch((msg) => {
          addToast(httpErrorToHuman(msg), 'error');
        });
    }
  }, [params.id]);

  return !mount ? (
    <Spinner.Centered />
  ) : (
    <>
      <Title order={1}>{mount.name}</Title>

      <SubNavigation
        baseUrl={`/admin/mounts/${params.id}`}
        items={[
          {
            name: 'General',
            icon: faCog,
            path: `/`,
            element: <MountCreateOrUpdate contextMount={mount} />,
          },
          {
            name: 'Eggs',
            icon: faEgg,
            path: `/eggs`,
            element: <AdminMountEggs mount={mount} />,
            permission: 'eggs.read',
          },
          {
            name: 'Nodes',
            icon: faServer,
            path: `/nodes`,
            element: <AdminMountNodes mount={mount} />,
            permission: 'nodes.read',
          },
          {
            name: 'Servers',
            icon: faComputer,
            path: `/servers`,
            element: <AdminMountServers mount={mount} />,
            permission: 'servers.read',
          },
        ]}
      />
    </>
  );
}
