import { ReactNode, useRef } from 'react';
import { useAuth } from '@/providers/AuthProvider.tsx';
import { useTranslations } from '@/providers/TranslationProvider.tsx';
import { useGlobalStore } from '@/stores/global.ts';
import Alert from './Alert.tsx';
import Tooltip from './Tooltip.tsx';

interface LayoutProps {
  children: ReactNode;
  isNormal: boolean;
}

export default function Container({ children, isNormal }: LayoutProps) {
  const { t } = useTranslations();
  const { impersonating } = useAuth();
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
        {impersonating && (
          <Alert color='yellow' className='mt-2 mx-2'>
            {t('elements.container.alert.impersonating', {})}
          </Alert>
        )}

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
