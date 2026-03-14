import {
  faArchive,
  faArrowUpLong,
  faCog,
  faComputer,
  faFileLines,
  faFolderTree,
  faInfoCircle,
  faNetworkWired,
  faPenRuler,
} from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { z } from 'zod';
import getNode from '@/api/admin/nodes/getNode.ts';
import { httpErrorToHuman } from '@/api/axios.ts';
import AdminContentContainer from '@/elements/containers/AdminContentContainer.tsx';
import Spinner from '@/elements/Spinner.tsx';
import SubNavigation from '@/elements/SubNavigation.tsx';
import { adminNodeSchema } from '@/lib/schemas/admin/nodes.ts';
import { useToast } from '@/providers/ToastProvider.tsx';
import AdminNodeAllocations from './allocations/AdminNodeAllocations.tsx';
import AdminNodeBackups from './backups/AdminNodeBackups.tsx';
import AdminNodeConfiguration from './configuration/AdminNodeConfiguration.tsx';
import AdminNodeLogs from './logs/AdminNodeLogs.tsx';
import AdminNodeMounts from './mounts/AdminNodeMounts.tsx';
import NodeCreateOrUpdate from './NodeCreateOrUpdate.tsx';
import AdminNodeServers from './servers/AdminNodeServers.tsx';
import AdminNodeStatistics from './statistics/AdminNodeStatistics.tsx';
import AdminNodeTransfers from './transfers/AdminNodeTransfers.tsx';

export default function NodeView() {
  const params = useParams<'id'>();
  const { addToast } = useToast();
  const [node, setNode] = useState<z.infer<typeof adminNodeSchema> | null>(null);

  useEffect(() => {
    if (params.id) {
      getNode(params.id)
        .then((node) => {
          setNode(node);
        })
        .catch((msg) => {
          addToast(httpErrorToHuman(msg), 'error');
        });
    }
  }, [params.id]);

  return !node ? (
    <Spinner.Centered />
  ) : (
    <AdminContentContainer title={node.name}>
      <SubNavigation
        baseUrl={`/admin/nodes/${params.id}`}
        items={[
          {
            name: 'General',
            icon: faCog,
            path: '/',
            element: <NodeCreateOrUpdate contextNode={node} />,
          },
          {
            name: 'Configuration',
            icon: faPenRuler,
            path: `/configuration`,
            element: <AdminNodeConfiguration node={node} />,
          },
          {
            name: 'Statistics',
            icon: faInfoCircle,
            path: `/statistics`,
            element: <AdminNodeStatistics node={node} />,
          },
          {
            name: 'Logs',
            icon: faFileLines,
            path: `/logs`,
            element: <AdminNodeLogs node={node} />,
          },
          {
            name: 'Allocations',
            icon: faNetworkWired,
            path: `/allocations`,
            element: <AdminNodeAllocations node={node} />,
            permission: 'nodes.allocations',
          },
          {
            name: 'Mounts',
            icon: faFolderTree,
            path: `/mounts`,
            element: <AdminNodeMounts node={node} />,
            permission: 'nodes.mounts',
          },
          {
            name: 'Backups',
            icon: faArchive,
            path: `/backups`,
            element: <AdminNodeBackups node={node} />,
            permission: 'nodes.backups',
          },
          {
            name: 'Servers',
            icon: faComputer,
            path: `/servers`,
            element: <AdminNodeServers node={node} />,
            permission: 'servers.read',
          },
          {
            name: 'Outgoing Transfers',
            icon: faArrowUpLong,
            path: `/transfers`,
            element: <AdminNodeTransfers node={node} />,
            permission: 'nodes.transfers',
          },
        ]}
      />
    </AdminContentContainer>
  );
}
