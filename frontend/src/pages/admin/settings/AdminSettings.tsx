import { faAt, faDatabase, faLayerGroup, faRobot, faServer, faToolbox, faUserCheck } from '@fortawesome/free-solid-svg-icons';
import { Title } from '@mantine/core';
import { useEffect } from 'react';
import getSettings from '@/api/admin/settings/getSettings.ts';
import { httpErrorToHuman } from '@/api/axios.ts';
import SubNavigation from '@/elements/SubNavigation.tsx';
import { useToast } from '@/providers/ToastProvider.tsx';
import { useAdminStore } from '@/stores/admin.tsx';
import ApplicationContainer from './ApplicationContainer.tsx';
import CaptchaContainer from './CaptchaContainer.tsx';
import EmailContainer from './EmailContainer.tsx';
import ServerContainer from './ServerContainer.tsx';
import StorageContainer from './StorageContainer.tsx';
import WebauthnContainer from './WebauthnContainer.tsx';
import ActivityContainer from './ActivityContainer.tsx';

export default function AdminSettings() {
  const { addToast } = useToast();
  const { setSettings } = useAdminStore();

  useEffect(() => {
    getSettings()
      .then(setSettings)
      .catch((msg) => {
        addToast(httpErrorToHuman(msg), 'error');
      });
  }, []);

  return (
    <>
      <Title order={1}>Settings</Title>

      <SubNavigation
        baseUrl='/admin/settings'
        items={[
          {
            name: 'Application',
            icon: faLayerGroup,
            path: '/',
            element: <ApplicationContainer />,
          },
          {
            name: 'Storage',
            icon: faDatabase,
            path: '/storage',
            element: <StorageContainer />,
          },
          {
            name: 'Mail',
            icon: faAt,
            path: '/mail',
            element: <EmailContainer />,
          },
          {
            name: 'Captcha',
            icon: faRobot,
            path: '/captcha',
            element: <CaptchaContainer />,
          },
          {
            name: 'Webauthn',
            icon: faUserCheck,
            path: '/webauthn',
            element: <WebauthnContainer />,
          },
          {
            name: 'Server',
            icon: faServer,
            path: '/server',
            element: <ServerContainer />,
          },
          {
            name: 'Activity',
            icon: faToolbox,
            path: '/activity',
            element: <ActivityContainer />,
          }
        ]}
      />
    </>
  );
}
