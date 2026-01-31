import { faBriefcase, faCog, faComputer, faFingerprint } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import getUser from '@/api/admin/users/getUser.ts';
import { httpErrorToHuman } from '@/api/axios.ts';
import AdminContentContainer from '@/elements/containers/AdminContentContainer.tsx';
import Spinner from '@/elements/Spinner.tsx';
import SubNavigation from '@/elements/SubNavigation.tsx';
import AdminUserServers from '@/pages/admin/users/servers/AdminUserServers.tsx';
import UserCreateOrUpdate from '@/pages/admin/users/UserCreateOrUpdate.tsx';
import { useToast } from '@/providers/ToastProvider.tsx';
import AdminUserActivity from './activity/AdminUserActivity.tsx';
import AdminUserOAuthLinks from './oauthLinks/AdminUserOAuthLinks.tsx';

export default function UserView() {
  const params = useParams<'id'>();
  const { addToast } = useToast();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (params.id) {
      getUser(params.id)
        .then((user) => {
          setUser(user);
        })
        .catch((msg) => {
          addToast(httpErrorToHuman(msg), 'error');
        });
    }
  }, [params.id]);

  return !user ? (
    <Spinner.Centered />
  ) : (
    <AdminContentContainer title={user.username}>
      <SubNavigation
        baseUrl={`/admin/users/${params.id}`}
        items={[
          {
            name: 'General',
            icon: faCog,
            path: `/`,
            element: <UserCreateOrUpdate contextUser={user} />,
          },
          {
            name: 'Servers',
            icon: faComputer,
            path: `/servers`,
            element: <AdminUserServers user={user} />,
            permission: 'servers.read',
          },
          {
            name: 'OAuth Links',
            icon: faFingerprint,
            path: `/oauth-links`,
            element: <AdminUserOAuthLinks user={user} />,
            permission: 'users.oauth-links',
          },
          {
            name: 'Activity',
            icon: faBriefcase,
            path: `/activity`,
            element: <AdminUserActivity user={user} />,
            permission: 'users.activity',
          },
        ]}
      />
    </AdminContentContainer>
  );
}
