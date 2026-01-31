import { ReactNode } from 'react';
import { ContainerRegistry } from 'shared';
import { useCurrentWindow } from '@/providers/CurrentWindowProvider.tsx';
import { useGlobalStore } from '@/stores/global.ts';
import ContentContainer from './ContentContainer.tsx';

export default function AccountContentContainer({
  title,
  registry,
  children,
  fullscreen = false,
}: {
  title: string;
  registry?: ContainerRegistry;
  children: ReactNode;
  fullscreen?: boolean;
}) {
  const { settings } = useGlobalStore();
  const { id } = useCurrentWindow();

  return (
    <ContentContainer title={`${title} | ${settings.app.name}`}>
      <div className={`${fullscreen || id ? 'mb-4' : 'px-4 lg:px-12 mb-4 lg:mt-12'}`}>
        {registry?.prependedComponents.map((Component, index) => (
          <Component key={`prepended-${index}`} />
        ))}

        {children}

        {registry?.appendedContentComponents.map((Component, index) => (
          <Component key={`appended-content-${index}`} />
        ))}
      </div>
    </ContentContainer>
  );
}
