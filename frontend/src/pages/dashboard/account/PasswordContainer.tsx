import { faUserLock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Grid, Group, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useState } from 'react';
import { z } from 'zod';
import { httpErrorToHuman } from '@/api/axios.ts';
import updatePassword from '@/api/me/account/updatePassword.ts';
import Button from '@/elements/Button.tsx';
import PasswordInput from '@/elements/input/PasswordInput.tsx';
import TitleCard from '@/elements/TitleCard.tsx';
import { dashboardPasswordSchema } from '@/lib/schemas/dashboard.ts';
import { useToast } from '@/providers/ToastProvider.tsx';
import { useTranslations } from '@/providers/TranslationProvider.tsx';
import { AccountCardProps } from './DashboardAccount.tsx';

export default function PasswordContainer({ blurred }: AccountCardProps) {
  const { t } = useTranslations();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof dashboardPasswordSchema>>({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
    validateInputOnBlur: true,
    validate: zod4Resolver(dashboardPasswordSchema),
  });

  const doUpdate = () => {
    setLoading(true);

    updatePassword({
      password: form.values.currentPassword,
      newPassword: form.values.newPassword,
    })
      .then(() => {
        addToast(t('pages.account.account.containers.password.toast.updated', {}), 'success');
        form.reset();
      })
      .catch((msg) => {
        addToast(httpErrorToHuman(msg), 'error');
      })
      .finally(() => setLoading(false));
  };

  return (
    <Grid.Col span={{ base: 12, md: 6, lg: 4 }} className={blurred ? 'blur-xs pointer-events-none select-none' : ''}>
      <TitleCard
        title={t('pages.account.account.containers.password.title', {})}
        icon={<FontAwesomeIcon icon={faUserLock} />}
        className='h-full'
      >
        <form onSubmit={form.onSubmit(() => doUpdate())}>
          <Stack>
            <PasswordInput
              withAsterisk
              label={t('pages.account.account.containers.password.form.currentPassword', {})}
              placeholder={t('pages.account.account.containers.password.form.currentPassword', {})}
              autoComplete='current-password'
              {...form.getInputProps('currentPassword')}
            />
            <PasswordInput
              withAsterisk
              label={t('pages.account.account.containers.password.form.newPassword', {})}
              placeholder={t('pages.account.account.containers.password.form.newPassword', {})}
              autoComplete='new-password'
              {...form.getInputProps('newPassword')}
            />
            <PasswordInput
              withAsterisk
              label={t('pages.account.account.containers.password.form.confirmNewPassword', {})}
              placeholder={t('pages.account.account.containers.password.form.confirmNewPassword', {})}
              autoComplete='new-password'
              {...form.getInputProps('confirmNewPassword')}
            />
            <Group>
              <Button type='submit' disabled={!form.isValid()} loading={loading}>
                {t('common.button.update', {})}
              </Button>
            </Group>
          </Stack>
        </form>
      </TitleCard>
    </Grid.Col>
  );
}
