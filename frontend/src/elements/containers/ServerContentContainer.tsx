import { Group, Title } from '@mantine/core';
import { Dispatch, ReactNode, SetStateAction } from 'react';
import { ContainerRegistry } from 'shared';
import TextInput from '@/elements/input/TextInput.tsx';
import { useTranslations } from '@/providers/TranslationProvider.tsx';
import { useServerStore } from '@/stores/server.ts';
import ContentContainer from './ContentContainer.tsx';
import { useCurrentWindow } from '@/providers/CurrentWindowProvider.tsx';

interface Props {
  title: string;
  subtitle?: string;
  hideTitleComponent?: boolean;
  search?: string;
  setSearch?: Dispatch<SetStateAction<string>>;
  contentRight?: ReactNode;
  registry?: ContainerRegistry;
  children: ReactNode;
  fullscreen?: boolean;
}

export default function ServerContentContainer({
  title,
  subtitle,
  hideTitleComponent = false,
  search,
  setSearch,
  contentRight,
  registry,
  children,
  fullscreen = false,
}: Props) {
  const { t } = useTranslations();
  const { server } = useServerStore();
  const { id } = useCurrentWindow();

  return (
    <ContentContainer title={`${title} | ${server.name}`}>
      <div className={`${fullscreen || id ? 'mb-4' : 'px-4 lg:px-12 mb-4 lg:mt-12'}`}>
        {registry?.prependedComponents.map((Component, index) => (
          <Component key={`prepended-${index}`} />
        ))}

        {hideTitleComponent ? null : setSearch ? (
          <Group justify='space-between' mb='md'>
            <div>
              <Title order={1} c='white'>
                {title}
              </Title>
              {subtitle ? <p className='text-xs text-gray-300!'>{subtitle}</p> : null}
            </div>
            <Group>
              <TextInput
                placeholder={t('common.input.search', {})}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                w={250}
              />
              {contentRight}
            </Group>
          </Group>
        ) : contentRight ? (
          <Group justify='space-between' mb='md'>
            <div>
              <Title order={1} c='white'>
                {title}
              </Title>
              {subtitle ? <p className='text-xs text-gray-300!'>{subtitle}</p> : null}
            </div>
            <Group>{contentRight}</Group>
          </Group>
        ) : (
          <div>
            <Title order={1} c='white'>
              {title}
            </Title>
            {subtitle ? <p className='text-xs text-gray-300!'>{subtitle}</p> : null}
          </div>
        )}
        {registry?.prependedContentComponents.map((Component, index) => (
          <Component key={`prepended-content-${index}`} />
        ))}

        {children}

        {registry?.appendedContentComponents.map((Component, index) => (
          <Component key={`appended-content-${index}`} />
        ))}
      </div>
    </ContentContainer>
  );
}
