import { ReactNode, useRef } from 'react';
import { useGlobalStore } from '@/stores/global.ts';
import ServerContentContainer from './containers/ServerContentContainer.tsx';
import Tooltip from './Tooltip.tsx';

interface LayoutProps {
  children: ReactNode;
  isNormal: boolean;
}

export default function Container({ children, isNormal }: LayoutProps) {
  const { settings } = useGlobalStore();
  const bodyRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className={
        isNormal
          ? 'flex flex-col justify-between min-w-full h-full'
          : 'flex flex-col justify-between h-full overflow-auto p-4'
      }
    >
      <div ref={bodyRef}>
        {children}
      </div>
        <div className='my-2 text-xs transition-all text-gray-400 mr-12'>
          <span className='flex flex-row justify-end gap-2'>
            <Tooltip label={settings.version}>
              <a href='https://calagopus.com' target='_blank' rel='noopener noreferrer' className='underline'>
                Calagopus
              </a>
            </Tooltip>
            © 2025 - {new Date().getFullYear()}
          </span>
        </div>
    </div>
  );
}
