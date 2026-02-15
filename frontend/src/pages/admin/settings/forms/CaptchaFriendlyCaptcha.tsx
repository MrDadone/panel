import { Group, Stack } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { useEffect } from 'react';
import { z } from 'zod';
import PasswordInput from '@/elements/input/PasswordInput.tsx';
import TextInput from '@/elements/input/TextInput.tsx';
import { adminSettingsCaptchaProviderFriendlyCaptchaSchema } from '@/lib/schemas/admin/settings.ts';

export default function CaptchaFriendlyCaptcha({
  form,
}: {
  form: UseFormReturnType<z.infer<typeof adminSettingsCaptchaProviderFriendlyCaptchaSchema>>;
}) {
  useEffect(() => {
    form.setValues({
      siteKey: form.values.siteKey ?? '',
      apiKey: form.values.apiKey ?? '',
    });
  }, []);

  return (
    <Stack mt='md'>
      <Group grow>
        <TextInput withAsterisk label='Site Key' placeholder='Site Key' {...form.getInputProps('siteKey')} />
        <PasswordInput withAsterisk label='API Key' placeholder='API Key' {...form.getInputProps('apiKey')} />
      </Group>
    </Stack>
  );
}
