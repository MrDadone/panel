import { faChevronDown, faChevronRight, faFileAlt, faFolder, faHardDrive, faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Collapse, Group, Kbd, ModalProps, Stack, Text, UnstyledButton } from '@mantine/core';
import { useForm } from '@mantine/form';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { httpErrorToHuman } from '@/api/axios.ts';
import searchFiles from '@/api/server/files/searchFiles.ts';
import Button from '@/elements/Button.tsx';
import SizeInput from '@/elements/input/SizeInput.tsx';
import Switch from '@/elements/input/Switch.tsx';
import TagsInput from '@/elements/input/TagsInput.tsx';
import TextInput from '@/elements/input/TextInput.tsx';
import Modal from '@/elements/modals/Modal.tsx';
import { serverFilesSearchSchema } from '@/lib/schemas/server/files.ts';
import { useToast } from '@/providers/ToastProvider.tsx';
import { useGlobalStore } from '@/stores/global.ts';
import { useServerStore } from '@/stores/server.ts';

interface FilterSectionProps {
  icon: typeof faFolder;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  children: React.ReactNode;
}

function FilterSection({ icon, title, description, enabled, onToggle, children }: FilterSectionProps) {
  return (
    <div className='border border-white/10 rounded-lg overflow-hidden'>
      <UnstyledButton
        className='w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors'
        onClick={() => onToggle(!enabled)}
      >
        <FontAwesomeIcon icon={icon} className='text-white/40 w-4' />
        <div className='flex-1 text-left'>
          <Text size='sm' fw={500} c='white'>
            {title}
          </Text>
          <Text size='xs' c='dimmed'>
            {description}
          </Text>
        </div>
        <FontAwesomeIcon
          icon={enabled ? faChevronDown : faChevronRight}
          className='text-white/40 w-3 ml-1'
        />
      </UnstyledButton>
      <Collapse in={enabled}>
        <div className='px-4 pb-4 pt-2 border-t border-white/10 bg-white/[0.02]'>{children}</div>
      </Collapse>
    </div>
  );
}

interface FileSearchModalProps extends ModalProps {
  onSearchComplete?: (searchInfo: { query?: string; filters: z.infer<typeof serverFilesSearchSchema> }) => void;
}

export default function FileSearchModal({ opened, onClose, onSearchComplete }: FileSearchModalProps) {
  const { addToast } = useToast();
  const { settings } = useGlobalStore();
  const { server, browsingFastDirectory, browsingDirectory, setBrowsingEntries } = useServerStore();

  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  const form = useForm<z.infer<typeof serverFilesSearchSchema>>({
    initialValues: {
      pathFilter: null,
      sizeFilter: null,
      contentFilter: null,
    },
    validateInputOnBlur: true,
    validate: zod4Resolver(serverFilesSearchSchema),
  });

  useEffect(() => {
    if (
      form.values.contentFilter?.maxSearchSize &&
      form.values.contentFilter?.maxSearchSize > settings.server.maxFileManagerContentSearchSize
    ) {
      form.setFieldValue('contentFilter.maxSearchSize', settings.server.maxFileManagerContentSearchSize);
    }
  }, [form.values.contentFilter]);

  useEffect(() => {
    if (query) {
      form.setFieldValue('pathFilter', { include: [`**${query}**`], exclude: [], caseInsensitive: true });
    } else if (!form.values.pathFilter?.include?.some((p) => p !== `**${query}**`)) {
      form.setFieldValue('pathFilter', null);
    }
  }, [query]);

  // Reset form when modal closes
  useEffect(() => {
    if (!opened) {
      setQuery('');
      form.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  const doSearch = () => {
    setLoading(true);

    searchFiles(server.uuid, { root: browsingDirectory, ...form.values })
      .then((entries) => {
        setBrowsingEntries({ total: entries.length, page: 1, perPage: entries.length, data: entries });
        onSearchComplete?.({ query, filters: form.values });
        onClose();
      })
      .catch((msg) => {
        addToast(httpErrorToHuman(msg), 'error');
      })
      .finally(() => setLoading(false));
  };

  const activeFiltersCount = [form.values.pathFilter, form.values.contentFilter, form.values.sizeFilter].filter(
    Boolean,
  ).length;

  return (
    <Modal title='Search Files' onClose={onClose} opened={opened} size='lg'>
      <form onSubmit={form.onSubmit(() => doSearch())}>
        <Stack gap='md'>
          {/* Main search input */}
          <div className='relative'>
            <TextInput
              placeholder='Search for files...'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              leftSection={<FontAwesomeIcon icon={faSearch} className='text-white/40' />}
              rightSection={
                <Kbd size='xs' className='opacity-50'>
                  Enter
                </Kbd>
              }
              size='md'
              autoFocus
            />
          </div>

          {/* Filters section */}
          <div>
            <Text size='xs' c='dimmed' mb='xs' fw={500} tt='uppercase'>
              Filters {activeFiltersCount > 0 && `(${activeFiltersCount} active)`}
            </Text>
            <Stack gap='xs'>
              <FilterSection
                icon={faFolder}
                title='Path Patterns'
                description='Filter by file path using glob patterns'
                enabled={!!form.values.pathFilter}
                onToggle={(enabled) =>
                  form.setFieldValue(
                    'pathFilter',
                    enabled ? { include: query ? [`**${query}**`] : ['**/**'], exclude: [], caseInsensitive: true } : null,
                  )
                }
              >
                <Stack gap='sm'>
                  <Group grow align='start'>
                    <TagsInput
                      label='Include'
                      placeholder='e.g., *.js, src/**'
                      size='sm'
                      value={form.values.pathFilter?.include ?? []}
                      onChange={(value) =>
                        form.setFieldValue('pathFilter', {
                          include: value,
                          exclude: form.values.pathFilter?.exclude ?? [],
                          caseInsensitive: form.values.pathFilter?.caseInsensitive ?? true,
                        })
                      }
                    />
                    <TagsInput
                      label='Exclude'
                      placeholder='e.g., node_modules/**'
                      size='sm'
                      value={form.values.pathFilter?.exclude ?? []}
                      onChange={(value) =>
                        form.setFieldValue('pathFilter', {
                          include: form.values.pathFilter?.include ?? [],
                          exclude: value,
                          caseInsensitive: form.values.pathFilter?.caseInsensitive ?? true,
                        })
                      }
                    />
                  </Group>
                  <Switch
                    label='Case insensitive'
                    checked={form.values.pathFilter?.caseInsensitive ?? true}
                    onChange={(e) =>
                      form.setFieldValue('pathFilter', {
                        include: form.values.pathFilter?.include ?? [],
                        exclude: form.values.pathFilter?.exclude ?? [],
                        caseInsensitive: e.target.checked,
                      })
                    }
                  />
                </Stack>
              </FilterSection>

              {browsingFastDirectory && (
                <FilterSection
                  icon={faFileAlt}
                  title='File Content'
                  description='Search within file contents'
                  enabled={!!form.values.contentFilter}
                  onToggle={(enabled) =>
                    form.setFieldValue(
                      'contentFilter',
                      enabled
                        ? {
                            query: '',
                            maxSearchSize: settings.server.maxFileManagerContentSearchSize,
                            includeUnmatched: false,
                            caseInsensitive: true,
                          }
                        : null,
                    )
                  }
                >
                  <Stack gap='sm'>
                    <Group grow align='start'>
                      <TextInput
                        label='Search text'
                        placeholder='Text to find in files'
                        size='sm'
                        {...form.getInputProps('contentFilter.query')}
                      />
                      <SizeInput
                        label='Max file size'
                        mode='b'
                        min={0}
                        size='sm'
                        value={form.values.contentFilter?.maxSearchSize ?? 0}
                        onChange={(value) => form.setFieldValue('contentFilter.maxSearchSize', value)}
                      />
                    </Group>
                    <Group grow>
                      <Switch
                        label='Include oversized files'
                        description='Include files that match other filters but are too large to search'
                        {...form.getInputProps('contentFilter.includeUnmatched', { type: 'checkbox' })}
                      />
                      <Switch
                        label='Case insensitive'
                        {...form.getInputProps('contentFilter.caseInsensitive', { type: 'checkbox' })}
                      />
                    </Group>
                  </Stack>
                </FilterSection>
              )}

              <FilterSection
                icon={faHardDrive}
                title='File Size'
                description='Filter by minimum and maximum file size'
                enabled={!!form.values.sizeFilter}
                onToggle={(enabled) =>
                  form.setFieldValue('sizeFilter', enabled ? { min: 0, max: 100 * 1024 * 1024 } : null)
                }
              >
                <Group grow>
                  <SizeInput
                    label='Minimum'
                    mode='b'
                    min={0}
                    size='sm'
                    value={form.values.sizeFilter?.min ?? 0}
                    onChange={(value) => form.setFieldValue('sizeFilter.min', value)}
                  />
                  <SizeInput
                    label='Maximum'
                    mode='b'
                    min={0}
                    size='sm'
                    value={form.values.sizeFilter?.max ?? 0}
                    onChange={(value) => form.setFieldValue('sizeFilter.max', value)}
                  />
                </Group>
              </FilterSection>
            </Stack>
          </div>
        </Stack>

        <Group mt='lg' justify='flex-end'>
          <Button variant='default' onClick={onClose}>
            Cancel
          </Button>
          <Button type='submit' loading={loading} leftSection={<FontAwesomeIcon icon={faSearch} />}>
            Search
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
