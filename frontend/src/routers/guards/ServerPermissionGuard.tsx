import { Outlet } from 'react-router';
import Forbidden from '@/pages/Forbidden.tsx';
import { useCan, useServerPermissions } from '@/plugins/usePermissions.ts';

interface Props {
  permission: string | string[];
  matchAny?: boolean;
}

export default function ServerPermissionGuard({ permission, matchAny = false }: Props) {
  const canMatrix = useServerPermissions(permission);
  const can = useCan(canMatrix, matchAny);

  if (!can) return <Forbidden />;

  return <Outlet />;
}
