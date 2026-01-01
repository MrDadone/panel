import {
  faCodeCommit,
  faCog,
  faExternalLink,
  faFolder,
  faNetworkWired,
  faWrench,
} from '@fortawesome/free-solid-svg-icons';
import { Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { Route, Routes, useParams } from 'react-router';
import getServer from '@/api/admin/servers/getServer.ts';
import { httpErrorToHuman } from '@/api/axios.ts';
import Spinner from '@/elements/Spinner.tsx';
import SubNavigation from '@/elements/SubNavigation.tsx';
import AdminServerAllocations from '@/pages/admin/servers/allocations/AdminServerAllocations.tsx';
import AdminServerManagement from '@/pages/admin/servers/management/AdminServerManagement.tsx';
import AdminServerMounts from '@/pages/admin/servers/mounts/AdminServerMounts.tsx';
import ServerUpdate from '@/pages/admin/servers/ServerUpdate.tsx';
import AdminServerVariables from '@/pages/admin/servers/variables/AdminServerVariables.tsx';
import { useToast } from '@/providers/ToastProvider.tsx';

export default function ServerView() {
  const params = useParams<'id'>();
  const { addToast } = useToast();
  const [server, setServer] = useState<AdminServer | null>(null);

  useEffect(() => {
    if (params.id) {
      getServer(params.id)
        .then((server) => {
          setServer(server);
        })
        .catch((msg) => {
          addToast(httpErrorToHuman(msg), 'error');
        });
    }
  }, [params.id]);

  return !server ? (
    <Spinner.Centered />
  ) : (
    <>
      <Title order={1}>{server.name}</Title>

      <SubNavigation
        baseUrl={`/admin/servers/${params.id}`}
        items={[
          {
            name: 'General',
            icon: faCog,
            path: '/',
            element: <ServerUpdate contextServer={server} />,
          },
          {
            name: 'Allocations',
            icon: faNetworkWired,
            path: `/allocations`,
            element: <AdminServerAllocations server={server} />,
            permission: 'servers.allocations',
          },
          {
            name: 'Variables',
            icon: faCodeCommit,
            path: `/variables`,
            element: <AdminServerVariables server={server} />,
            permission: 'servers.variables',
          },
          {
            name: 'Mounts',
            icon: faFolder,
            path: `/mounts`,
            element: <AdminServerMounts server={server} />,
            permission: 'servers.mounts',
          },
          {
            name: 'Management',
            icon: faWrench,
            path: `/management`,
            element: <AdminServerManagement server={server} />,
          },
          {
            name: 'View',
            icon: faExternalLink,
            link: `/server/${params.id}`,
            permission: 'servers.read',
          },
        ]}
      />
    </>
  );
}
