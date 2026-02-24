import {
  faCogs,
  faEarthAmerica,
  faGraduationCap,
  faRocket,
  faServer,
  faUsers,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { ComponentType } from 'react';
import OobeConfiguration from '@/pages/oobe/OobeConfiguration.tsx';
import OobeFinished from '@/pages/oobe/OobeFinished.tsx';
import OobeLocation from '@/pages/oobe/OobeLocation.tsx';
import OobeLogin from '@/pages/oobe/OobeLogin.tsx';
import OobeNode from '@/pages/oobe/OobeNode.tsx';
import OobeRegister from '@/pages/oobe/OobeRegister.tsx';
import OobeWelcome from '@/pages/oobe/OobeWelcome.tsx';
import { OobeComponentProps } from '@/routers/OobeRouter.tsx';

export interface OobeStep {
  path: string;
  stepKey: OobeStepKey | null;
  label: string | null;
  icon: IconDefinition | null;
  component: ComponentType<OobeComponentProps>;
  preAuth?: boolean;
  skipTo?: OobeStepKey;
}
export const steps: OobeStep[] = [
  {
    path: '',
    stepKey: 'register',
    label: 'Welcome',
    icon: faRocket,
    component: OobeWelcome,
    preAuth: true,
  },
  {
    path: '/register',
    stepKey: null,
    label: 'Register',
    icon: faUsers,
    component: OobeRegister,
    preAuth: true,
  },
  {
    path: '/login',
    stepKey: null,
    label: null,
    icon: null,
    component: OobeLogin,
    preAuth: true,
  },
  {
    path: '/configuration',
    stepKey: 'configuration',
    label: 'Configuration',
    icon: faCogs,
    component: OobeConfiguration,
  },
  {
    path: '/location',
    stepKey: 'location',
    label: 'Location',
    icon: faEarthAmerica,
    component: OobeLocation,
    skipTo: 'finished',
  },
  {
    path: '/node',
    stepKey: 'node',
    label: 'Node',
    icon: faServer,
    component: OobeNode,
    skipTo: 'finished',
  },
  {
    path: '/finish',
    stepKey: 'finished',
    label: 'Finish',
    icon: faGraduationCap,
    component: OobeFinished,
  },
];
