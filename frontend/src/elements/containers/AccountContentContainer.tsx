import { ReactNode } from 'react';
import { ContainerRegistry } from 'shared';
import { useGlobalStore } from '@/stores/global.ts';
import ContentContainer from './ContentContainer.tsx';

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
