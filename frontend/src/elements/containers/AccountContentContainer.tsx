import { ReactNode } from 'react';
import { useGlobalStore } from '@/stores/global.ts';
import ContentContainer from './ContentContainer.tsx';
import { ContainerRegistry } from 'shared';

export default function AccountContentContainer({
  title,
  registry,
  children,
}: {
  title: string;
  registry?: ContainerRegistry;
  children: ReactNode;
}) {
  const { settings } = useGlobalStore();

  return (
    <ContentContainer title={`${title} | ${settings.app.name}`}>
      {registry?.prependedComponents.map((Component, index) => (
        <Component key={`prepended-${index}`} />
      ))}

      {children}

      {registry?.appendedContentComponents.map((Component, index) => (
        <Component key={`appended-content-${index}`} />
      ))}
    </ContentContainer>
  );
}
