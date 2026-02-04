import { SelectProps } from '@mantine/core';
import { useLocation, useNavigate } from 'react-router';
import getServers from '@/api/server/getServers.ts';
import Select from '@/elements/input/Select.tsx';
import { useSearchableResource } from '@/plugins/useSearchableResource.ts';
import { useServerStats } from '@/plugins/useServerStats.ts';
import { useServerStore } from '@/stores/server.ts';
import { useUserStore } from '@/stores/user.ts';

const getStatusColor = (powerState?: ServerPowerState, status?: ServerStatus | null, suspended?: boolean) => {
  if (suspended) return 'bg-server-status-offline';
  if (status === 'installing' || status === 'restoring_backup') return 'bg-server-status-starting';
  if (status === 'install_failed') return 'bg-server-status-offline';

  switch (powerState) {
    case 'running':
      return 'bg-server-status-running';
    case 'starting':
      return 'bg-server-status-starting';
    case 'stopping':
      return 'bg-server-status-stopping';
    default:
      return 'bg-server-status-offline';
  }
};

export default function ServerSwitcher({ className }: { className?: string }) {
  const currentServer = useServerStore((state) => state.server);
  const { getServerResourceUsage } = useUserStore();
  const location = useLocation();
  const navigate = useNavigate();

  const servers = useSearchableResource<Server>({
    fetcher: (search) => getServers(1, search),
  });
  const loadingStats = useServerStats(servers.items);

  if (loadingStats) return <Select className={className} placeholder={currentServer?.name || 'Switch server...'} />;

  const otherServers = servers.items.filter((s) => s.uuid !== currentServer?.uuid);

  const renderOption: SelectProps['renderOption'] = ({ option }) => {
    const server = otherServers.find((s) => s.uuid === option.value);
    if (!server) return option.label;

    const stats = getServerResourceUsage(server.uuid, server.nodeUuid);

    return (
      <div className='flex items-center gap-2'>
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${getStatusColor(stats?.state, server.status, server.suspended)}`}
        />
        <span className='truncate'>{server.name}</span>
      </div>
    );
  };

  const handleChange = (value: string | null) => {
    if (value) {
      const currentPath = location.pathname.replace(/^\/server\/[^/]+/, '');
      navigate(`/server/${value}${currentPath}${location.search}${location.hash}`);
    }
  };

  return (
    <Select
      className={className}
      placeholder={currentServer?.name || 'Switch server...'}
      data={otherServers.map((server) => ({
        label: server.name,
        value: server.uuid,
      }))}
      value={null}
      onChange={handleChange}
      searchable
      searchValue={servers.search}
      onSearchChange={servers.setSearch}
      renderOption={renderOption}
    />
  );
}
