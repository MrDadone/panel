import { faCog, faUsers } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import getRole from '@/api/admin/roles/getRole.ts';
import { httpErrorToHuman } from '@/api/axios.ts';
import AdminContentContainer from '@/elements/containers/AdminContentContainer.tsx';
import Spinner from '@/elements/Spinner.tsx';
import SubNavigation from '@/elements/SubNavigation.tsx';
import RoleCreateOrUpdate from '@/pages/admin/roles/RoleCreateOrUpdate.tsx';
import AdminRoleUsers from '@/pages/admin/roles/users/AdminRoleUsers.tsx';
import { useToast } from '@/providers/ToastProvider.tsx';

export default function RoleView() {
  const params = useParams<'id'>();
  const { addToast } = useToast();
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    if (params.id) {
      getRole(params.id)
        .then((role) => {
          setRole(role);
        })
        .catch((msg) => {
          addToast(httpErrorToHuman(msg), 'error');
        });
    }
  }, [params.id]);

  return !role ? (
    <Spinner.Centered />
  ) : (
    <AdminContentContainer title={role.name}>
      <SubNavigation
        baseUrl={`/admin/roles/${params.id}`}
        items={[
          {
            name: 'General',
            icon: faCog,
            path: `/`,
            element: <RoleCreateOrUpdate contextRole={role} />,
          },
          {
            name: 'Users',
            icon: faUsers,
            path: `/users`,
            element: <AdminRoleUsers role={role} />,
            permission: 'users.read',
          },
        ]}
      />
    </AdminContentContainer>
  );
}
