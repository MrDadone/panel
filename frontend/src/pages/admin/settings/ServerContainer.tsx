import { Group, Stack, Tooltip } from '@mantine/core';
import { useForm } from '@mantine/form';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import updateServerSettings from '@/api/admin/settings/updateServerSettings.ts';
import { httpErrorToHuman } from '@/api/axios.ts';
import Button from '@/elements/Button.tsx';
import { AdminCan } from '@/elements/Can.tsx';
import AdminSubContentContainer from '@/elements/containers/AdminSubContentContainer.tsx';
import NumberInput from '@/elements/input/NumberInput.tsx';
import SizeInput from '@/elements/input/SizeInput.tsx';
import Switch from '@/elements/input/Switch.tsx';
import { adminSettingsServerSchema } from '@/lib/schemas/admin/settings.ts';
import { useToast } from '@/providers/ToastProvider.tsx';
import { useAdminStore } from '@/stores/admin.tsx';

export default function ServerContainer() {
  const { addToast } = useToast();
  const { server } = useAdminStore();

  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof adminSettingsServerSchema>>({
    initialValues: {
      maxFileManagerViewSize: 0,
      maxFileManagerContentSearchSize: 0,
      maxFileManagerSearchResults: 1,
      maxSchedulesStepCount: 0,
      allowOverwritingCustomDockerImage: false,
      allowEditingStartupCommand: false,
      allowViewingInstallationLogs: false,
    },
    validateInputOnBlur: true,
    validate: zod4Resolver(adminSettingsServerSchema),
  });

  useEffect(() => {
    form.setValues({
      ...server,
    });
  }, [server]);

  const doUpdate = () => {
    setLoading(true);

    updateServerSettings(adminSettingsServerSchema.parse(form.values))
      .then(() => {
        addToast('Server settings updated.', 'success');
      })
      .catch((msg) => {
        addToast(httpErrorToHuman(msg), 'error');
      })
      .finally(() => setLoading(false));
  };

  return (
    <AdminSubContentContainer title='Server Settings' titleOrder={2}>
      <form onSubmit={form.onSubmit(() => doUpdate())}>
        <Stack>
          <Group grow>
            <SizeInput
              withAsterisk
              label='Max File Manager View Size'
              mode='b'
              min={0}
              value={form.values.maxFileManagerViewSize}
              onChange={(v) => form.setFieldValue('maxFileManagerViewSize', v)}
            />

            <NumberInput
              withAsterisk
              label='Max Server Schedule Steps'
              placeholder='Max Server Schedule Steps'
              {...form.getInputProps('maxSchedulesStepCount')}
            />
          </Group>

          <Group grow>
            <SizeInput
              withAsterisk
              label='Max File Manager Content Search Size'
              mode='b'
              min={0}
              value={form.values.maxFileManagerContentSearchSize}
              onChange={(v) => form.setFieldValue('maxFileManagerContentSearchSize', v)}
            />

            <NumberInput
              withAsterisk
              label='Max File Manager Search Results'
              placeholder='Max File Manager Search Results'
              {...form.getInputProps('maxFileManagerSearchResults')}
            />
          </Group>

          <Group grow>
            <Switch
              label='Allow Overwriting Custom Docker Image'
              description='If enabled, users will be able to overwrite the Docker image specified in the server configuration using the Eggs list, even if an admin has set a custom Docker image.'
              {...form.getInputProps('allowOverwritingCustomDockerImage', { type: 'checkbox' })}
            />

            <Switch
              label='Allow Editing Startup Command'
              {...form.getInputProps('allowEditingStartupCommand', { type: 'checkbox' })}
            />
          </Group>
        </Stack>

        <Switch
          label='Allow Viewing Installation Logs'
          description='If enabled, users with console read permissions will also be able to view installation logs via the websocket connection. If disabled, installation logs will only be available for admins.'
          {...form.getInputProps('allowViewingInstallationLogs', { type: 'checkbox' })}
        />

        <Group mt='md'>
          <AdminCan
            action='settings.update'
            renderOnCant={
              <Tooltip label='You do not have permission to update settings.'>
                <Button disabled>Save</Button>
              </Tooltip>
            }
          >
            <Button type='submit' disabled={!form.isValid()} loading={loading}>
              Save
            </Button>
          </AdminCan>
        </Group>
      </form>
    </AdminSubContentContainer>
  );
}
