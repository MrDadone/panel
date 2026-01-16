import { SelectProps } from '@mantine/core';
import { useLocation } from 'react-router';
import getServers from '@/api/server/getServers.ts';
import Select from '@/elements/input/Select.tsx';
import { useSearchableResource } from '@/plugins/useSearchableResource.ts';
import { useServerStore } from '@/stores/server.ts';
import { useUserStore } from '@/stores/user.ts';

const getStatusColor = (powerState?: ServerPowerState, status?: ServerStatus | null, suspended?: boolean) => {
  if (suspended) return 'bg-red-500';
  if (status === 'installing' || status === 'restoring_backup') return 'bg-yellow-500';
  if (status === 'install_failed') return 'bg-red-500';

  switch (powerState) {
    case 'running':
      return 'bg-green-500';
    case 'starting':
      return 'bg-yellow-500';
    case 'stopping':
      return 'bg-red-500';
    default:
      return 'bg-zinc-500';
  }
};

export default function ServerSwitcher({ className }: { className?: string }) {
  const currentServer = useServerStore((state) => state.server);
  const currentPowerState = useServerStore((state) => state.state);
  const { getServerResourceUsage } = useUserStore();
  const location = useLocation();

  const servers = useSearchableResource<Server>({
    fetcher: (search) => getServers(1, search),
  });

  const otherServers = servers.items.filter((s) => s.uuid !== currentServer?.uuid);

  const renderOption: SelectProps['renderOption'] = ({ option }) => {
    const server = otherServers.find((s) => s.uuid === option.value);
    if (!server) return option.label;

    return (
      <div className='flex items-center gap-2'>
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${getStatusColor(getServerResourceUsage(server.uuid)?.state, server.status, server.suspended)}`}
        />
        <span className='truncate'>{server.name}</span>
      </div>
    );
  };

  const handleChange = (value: string | null) => {
    if (value) {
      const currentPath = location.pathname.replace(/^\/server\/[^/]+/, '');
      window.location.href = `/server/${value}${currentPath}${location.search}${location.hash}`;
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
      nothingFoundMessage='No other servers'
      renderOption={renderOption}
      leftSection={
        currentServer?.uuid && (
          <span
            className={`w-2 h-2 rounded-full ${getStatusColor(
              currentPowerState,
              currentServer.status,
              currentServer.suspended,
            )}`}
          />
        )
      }
    />
  );
}
