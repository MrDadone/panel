import { faArchive, faChartBar, faCog, faDesktop, faEarthAmerica, faServer } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import getBackupConfiguration from '@/api/admin/backup-configurations/getBackupConfiguration.ts';
import { httpErrorToHuman } from '@/api/axios.ts';
import AdminContentContainer from '@/elements/containers/AdminContentContainer.tsx';
import Spinner from '@/elements/Spinner.tsx';
import SubNavigation from '@/elements/SubNavigation.tsx';
import AdminBackupConfigurationLocations from '@/pages/admin/backupConfigurations/locations/AdminBackupConfigurationLocations.tsx';
import AdminBackupConfigurationNodes from '@/pages/admin/backupConfigurations/nodes/AdminBackupConfigurationNodes.tsx';
import AdminBackupConfigurationServers from '@/pages/admin/backupConfigurations/servers/AdminBackupConfigurationServers.tsx';
import AdminBackupConfigurationStats from '@/pages/admin/backupConfigurations/stats/AdminBackupConfigurationStats.tsx';
import { useToast } from '@/providers/ToastProvider.tsx';
import BackupConfigurationCreateOrUpdate from './BackupConfigurationCreateOrUpdate.tsx';
import AdminBackupConfigurationBackups from './backups/AdminBackupConfigurationBackups.tsx';

export default function BackupConfigurationView() {
  const params = useParams<'id'>();
  const { addToast } = useToast();
  const [backupConfiguration, setBackupConfiguration] = useState<BackupConfiguration | null>(null);

  useEffect(() => {
    if (params.id) {
      getBackupConfiguration(params.id)
        .then((backupConfig) => {
          setBackupConfiguration(backupConfig);
        })
        .catch((msg) => {
          addToast(httpErrorToHuman(msg), 'error');
        });
    }
  }, [params.id]);

  return !backupConfiguration ? (
    <Spinner.Centered />
  ) : (
    <AdminContentContainer title={backupConfiguration.name}>
      <SubNavigation
        baseUrl={`/admin/backup-configurations/${params.id}`}
        items={[
          {
            name: 'General',
            icon: faCog,
            path: `/`,
            element: <BackupConfigurationCreateOrUpdate contextBackupConfiguration={backupConfiguration} />,
          },
          {
            name: 'Stats',
            icon: faChartBar,
            path: `/stats`,
            element: <AdminBackupConfigurationStats backupConfiguration={backupConfiguration} />,
          },
          {
            name: 'Backups',
            icon: faArchive,
            path: `/backups`,
            permission: 'backup-configurations.backups',
            element: <AdminBackupConfigurationBackups backupConfiguration={backupConfiguration} />,
          },
          {
            name: 'Locations',
            icon: faEarthAmerica,
            path: `/locations`,
            permission: 'locations.read',
            element: <AdminBackupConfigurationLocations backupConfiguration={backupConfiguration} />,
          },
          {
            name: 'Nodes',
            icon: faServer,
            path: `/nodes`,
            permission: 'nodes.read',
            element: <AdminBackupConfigurationNodes backupConfiguration={backupConfiguration} />,
          },
          {
            name: 'Servers',
            icon: faDesktop,
            path: `/servers`,
            permission: 'servers.read',
            element: <AdminBackupConfigurationServers backupConfiguration={backupConfiguration} />,
          },
        ]}
      />
    </AdminContentContainer>
  );
}
