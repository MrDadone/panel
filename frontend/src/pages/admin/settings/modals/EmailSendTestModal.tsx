import { ModalProps } from '@mantine/core';
import { useForm } from '@mantine/form';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useState } from 'react';
import { z } from 'zod';
import testSystemEmail from '@/api/admin/system/email/testSystemEmail.ts';
import { httpErrorToHuman } from '@/api/axios.ts';
import Button from '@/elements/Button.tsx';
import TextInput from '@/elements/input/TextInput.tsx';
import Modal from '@/elements/modals/Modal.tsx';
import { adminSettingsEmailTestSchema } from '@/lib/schemas/admin/settings.ts';
import { useAuth } from '@/providers/AuthProvider.tsx';
import { useToast } from '@/providers/ToastProvider.tsx';

export default function EmailSendTestModal({ opened, onClose }: ModalProps) {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof adminSettingsEmailTestSchema>>({
    initialValues: {
      email: user?.email ?? '',
    },
    validateInputOnBlur: true,
    validate: zod4Resolver(adminSettingsEmailTestSchema),
  });

  const doSendTestEmail = () => {
    setLoading(true);

    testSystemEmail(form.values.email)
      .then(() => {
        addToast('Test email has been sent successfully.', 'success');
        onClose();
      })
      .catch((msg) => {
        addToast(httpErrorToHuman(msg), 'error');
      })
      .finally(() => setLoading(false));
  };

  return (
    <Modal title='Send Test Email' onClose={onClose} opened={opened}>
      <form onSubmit={form.onSubmit(() => doSendTestEmail())}>
        <TextInput withAsterisk label='Email' placeholder='Email' {...form.getInputProps('email')} />

        <Modal.Footer>
          <Button type='submit' loading={loading} disabled={!form.isValid()}>
            Send Test Email
          </Button>
          <Button variant='default' onClick={onClose}>
            Close
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
