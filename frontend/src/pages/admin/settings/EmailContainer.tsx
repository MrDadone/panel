import { Group } from '@mantine/core';
import { UseFormReturnType, useForm } from '@mantine/form';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import updateEmailSettings from '@/api/admin/settings/updateEmailSettings.ts';
import { httpErrorToHuman } from '@/api/axios.ts';
import Button from '@/elements/Button.tsx';
import { AdminCan } from '@/elements/Can.tsx';
import AdminSubContentContainer from '@/elements/containers/AdminSubContentContainer.tsx';
import Select from '@/elements/input/Select.tsx';
import { mailModeTypeLabelMapping } from '@/lib/enums.ts';
import {
  adminSettingsEmailFilesystemSchema,
  adminSettingsEmailSchema,
  adminSettingsEmailSendmailSchema,
  adminSettingsEmailSmtpSchema,
} from '@/lib/schemas/admin/settings.ts';
import { useToast } from '@/providers/ToastProvider.tsx';
import { useAdminStore } from '@/stores/admin.tsx';
import EmailFile from './forms/EmailFile.tsx';
import EmailSendmail from './forms/EmailSendmail.tsx';
import EmailSmtp from './forms/EmailSmtp.tsx';
import EmailSendTestModal from './modals/EmailSendTestModal.tsx';

export default function EmailContainer() {
  const { addToast } = useToast();
  const { mailMode } = useAdminStore();

  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState<'sendTestEmail' | null>(null);

  const form = useForm<z.infer<typeof adminSettingsEmailSchema>>({
    initialValues: {
      type: 'none',
    },
    validateInputOnBlur: true,
    validate: zod4Resolver(adminSettingsEmailSchema),
  });

  useEffect(() => {
    form.setValues({
      ...mailMode,
    });
  }, [mailMode]);

  const doUpdate = () => {
    setLoading(true);
    updateEmailSettings(form.values)
      .then(() => {
        addToast('Email settings updated.', 'success');
      })
      .catch((msg) => {
        addToast(httpErrorToHuman(msg), 'error');
      })
      .finally(() => setLoading(false));
  };

  return (
    <AdminSubContentContainer title='Email Settings' titleOrder={2}>
      <EmailSendTestModal opened={openModal === 'sendTestEmail'} onClose={() => setOpenModal(null)} />

      <form onSubmit={form.onSubmit(() => doUpdate())}>
        <Select
          label='Provider'
          data={Object.entries(mailModeTypeLabelMapping).map(([value, label]) => ({
            value,
            label,
          }))}
          {...form.getInputProps('type')}
        />

        {form.values.type === 'smtp' ? (
          <EmailSmtp form={form as UseFormReturnType<z.infer<typeof adminSettingsEmailSmtpSchema>>} />
        ) : form.values.type === 'sendmail' ? (
          <EmailSendmail form={form as UseFormReturnType<z.infer<typeof adminSettingsEmailSendmailSchema>>} />
        ) : form.values.type === 'filesystem' ? (
          <EmailFile form={form as UseFormReturnType<z.infer<typeof adminSettingsEmailFilesystemSchema>>} />
        ) : null}

        <Group mt='md'>
          <AdminCan action='settings.update' cantSave>
            <Button type='submit' disabled={!form.isValid()} loading={loading}>
              Save
            </Button>
          </AdminCan>
          <AdminCan action='settings.read'>
            <Button variant='outline' loading={loading} onClick={() => setOpenModal('sendTestEmail')}>
              Send Test Email
            </Button>
          </AdminCan>
        </Group>
      </form>
    </AdminSubContentContainer>
  );
}
