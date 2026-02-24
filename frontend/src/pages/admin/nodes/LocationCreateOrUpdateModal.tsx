import { Group, Stack, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useState } from 'react';
import { NIL as uuidNil } from 'uuid';
import { z } from 'zod';
import getBackupConfigurations from '@/api/admin/backup-configurations/getBackupConfigurations.ts';
import createLocation from '@/api/admin/locations/createLocation.ts';
import { httpErrorToHuman } from '@/api/axios.ts';
import Button from '@/elements/Button.tsx';
import { AdminCan } from '@/elements/Can.tsx';
import Select from '@/elements/input/Select.tsx';
import TextArea from '@/elements/input/TextArea.tsx';
import TextInput from '@/elements/input/TextInput.tsx';
import Modal from '@/elements/modals/Modal.tsx';
import { adminLocationSchema } from '@/lib/schemas/admin/locations.ts';
import { useAdminCan } from '@/plugins/usePermissions.ts';
import { useSearchableResource } from '@/plugins/useSearchableResource.ts';
import { useToast } from '@/providers/ToastProvider.tsx';

interface LocationCreateOrUpdateModalProps {
  opened: boolean;
  onClose: () => void;
  onLocationCreated: () => void;
}

export default function LocationCreateOrUpdateModal({
  opened,
  onClose,
  onLocationCreated,
}: LocationCreateOrUpdateModalProps) {
  const { addToast } = useToast();
  const canReadBackupConfigurations = useAdminCan('backup-configurations.read');
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof adminLocationSchema>>({
    initialValues: {
      name: '',
      description: null,
      backupConfigurationUuid: uuidNil,
    },
    validateInputOnBlur: true,
    validate: zod4Resolver(adminLocationSchema),
  });

  const backupConfigurations = useSearchableResource<BackupConfiguration>({
    fetcher: (search) => getBackupConfigurations(1, search),
    defaultSearchValue: '',
    canRequest: canReadBackupConfigurations,
  });

  const handleSubmit = async () => {
    if (!form.isValid()) {
      return;
    }

    setLoading(true);
    try {
      await createLocation(form.values);
      addToast('Location created.', 'success');
      form.reset();
      onLocationCreated();
    } catch (error) {
      addToast(httpErrorToHuman(error), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title='Create Location' size='lg'>
      <Stack gap='md'>
        <Text size='sm' c='dimmed'>
          You need to create at least one location before you can create nodes. Locations help organize your nodes
          geographically or logically.
        </Text>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap='md'>
            <Group grow>
              <TextInput withAsterisk label='Name' placeholder='Name' {...form.getInputProps('name')} />
              <Select
                allowDeselect
                label='Backup Configuration'
                data={[
                  {
                    label: 'None',
                    value: uuidNil,
                  },
                  ...backupConfigurations.items.map((backupConfiguration) => ({
                    label: backupConfiguration.name,
                    value: backupConfiguration.uuid,
                  })),
                ]}
                searchable
                searchValue={backupConfigurations.search}
                onSearchChange={backupConfigurations.setSearch}
                disabled={!canReadBackupConfigurations}
                {...form.getInputProps('backupConfigurationUuid')}
              />
            </Group>

            <TextArea label='Description' placeholder='Description' rows={3} {...form.getInputProps('description')} />

            <Group justify='flex-end' mt='md'>
              <AdminCan action='locations.create' cantSave>
                <Button type='submit' disabled={!form.isValid()} loading={loading}>
                  Create Location
                </Button>
              </AdminCan>
            </Group>
          </Stack>
        </form>
      </Stack>
    </Modal>
  );
}
