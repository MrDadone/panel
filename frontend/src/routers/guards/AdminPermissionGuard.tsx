import { Outlet } from 'react-router';
import Forbidden from '@/pages/Forbidden.tsx';
import { useAdminPermissions, useCan } from '@/plugins/usePermissions.ts';

interface Props {
  permission: string | string[];
  matchAny?: boolean;
}

export default function AdminPermissionGuard({ permission, matchAny = false }: Props) {
  const canMatrix = useAdminPermissions(permission);
  const can = useCan(canMatrix, matchAny);

  if (!can) return <Forbidden />;

  return <Outlet />;
}
