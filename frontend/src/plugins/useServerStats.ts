import debounce from 'debounce';
import { useEffect, useState } from 'react';
import getNodeResources from '@/api/me/servers/resources/getNodeResources.ts';
import { useUserStore } from '@/stores/user.ts';

export function useServerStats(servers: Server[]) {
  const [loadingStats, setLoadingStats] = useState(true);
  const { addServerResourceUsage } = useUserStore();

  useEffect(() => {
    setLoadingStats(true);
    const uniqueNodeIds = new Set([...servers.map((s) => s.nodeUuid)]);

    const debouncedSetLoading = debounce(() => {
      setLoadingStats(false);
    }, 50);

    Promise.all(
      [...uniqueNodeIds].map((nodeId) =>
        getNodeResources(nodeId).then((response) => {
          for (const [serverId, resources] of Object.entries(response)) {
            addServerResourceUsage(serverId, resources);
          }
        }),
      ),
    ).finally(debouncedSetLoading);

    return () => {
      debouncedSetLoading.clear();
    };
  }, [servers]);

  return loadingStats;
}
