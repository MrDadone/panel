import { SelectProps } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import getServerResourceUsage from '@/api/server/getServerResourceUsage.ts';
import getServers from '@/api/server/getServers.ts';
import Select from '@/elements/input/Select.tsx';
import { useServerStore } from '@/stores/server.ts';

interface ServerOption {
  uuid: string;
  uuidShort: string;
  name: string;
  status: ServerStatus | null;
  suspended: boolean;
  powerState?: ServerPowerState;
}

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
  const location = useLocation();
  const currentServer = useServerStore((state) => state.server);
  const currentPowerState = useServerStore((state) => state.state);

  const [servers, setServers] = useState<ServerOption[]>([]);

  // Fetch all servers on mount
  useEffect(() => {
    const fetchServers = async () => {
      try {
        const response = await getServers(1);
        const serverList: ServerOption[] = response.data.map((s) => ({
          uuid: s.uuid,
          uuidShort: s.uuidShort,
          name: s.name,
          status: s.status,
          suspended: s.suspended,
        }));
        setServers(serverList);

        // Fetch power states for each server
        for (const server of serverList) {
          if (!server.suspended && !server.status) {
            getServerResourceUsage(server.uuid)
              .then((usage) => {
                setServers((prev) =>
                  prev.map((s) => (s.uuid === server.uuid ? { ...s, powerState: usage.state } : s)),
                );
              })
              .catch(() => {});
          }
        }
      } catch {}
    };

    fetchServers();
  }, []);

  // Filter out current server from the list
  const otherServers = servers.filter((s) => s.uuid !== currentServer?.uuid);

  // Build select data
  const selectData = otherServers.map((server) => ({
    value: server.uuidShort,
    label: server.name,
  }));

  const renderOption: SelectProps['renderOption'] = ({ option }) => {
    const server = otherServers.find((s) => s.uuidShort === option.value);
    if (!server) return option.label;

    return (
      <div className='flex items-center gap-2'>
        <span
          className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusColor(server.powerState, server.status, server.suspended)}`}
        />
        <span className='truncate'>{server.name}</span>
      </div>
    );
  };

  const handleChange = (value: string | null) => {
    if (value) {
      const currentPath = location.pathname.replace(/^\/server\/[^/]+/, '');
      window.location.href = `/server/${value}${currentPath}`;
    }
  };

  return (
    <Select
      className={className}
      placeholder={currentServer?.name || 'Switch server...'}
      data={selectData}
      value={null}
      onChange={handleChange}
      searchable
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
