import { useEffect } from 'react';
import { useUserStore } from '@/stores/user.ts';

export function useServerStats(server: AdminServer | Server) {
  const fetchNodeResources = useUserStore((state) => state.fetchNodeResources);

  const stats = useUserStore((state) => {
    const _tick = state.resourceUsageTick;
    return state.getServerResourceUsage(server.uuid) || null;
  });

  useEffect(() => {
    if ('nodeUuid' in server) {
      fetchNodeResources(server.nodeUuid);
    } else if ('node' in server) {
      fetchNodeResources(server.node.uuid);
    }
  }, [server, fetchNodeResources]);

  return stats;
}
