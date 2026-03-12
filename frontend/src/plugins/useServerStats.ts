import { useEffect } from 'react';
import { useUserStore } from '@/stores/user.ts';

export function useServerStats(server: AdminServer | Server) {
  const fetchNodeResources = useUserStore((state) => state.fetchNodeResources);

  const stats = useUserStore((state) => {
    console.debug('useServerStats - resourceUsageTick:', state.resourceUsageTick);
    return state.getServerResourceUsage(server.uuid) || null;
  });

  const nodeUuid = 'nodeUuid' in server ? server.nodeUuid : server.node?.uuid;

  useEffect(() => {
    if (!nodeUuid) return;

    fetchNodeResources(nodeUuid);

    const intervalId = setInterval(() => {
      fetchNodeResources(nodeUuid);
    }, 30500);

    return () => clearInterval(intervalId);
  }, [nodeUuid, fetchNodeResources]);

  return stats;
}
