import { Stack } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { z } from 'zod';
import Switch from '@/elements/input/Switch.tsx';
import { serverScheduleStepSchema } from '@/lib/schemas/server/schedules.ts';
import ScheduleDynamicParameterInput from '../ScheduleDynamicParameterInput.tsx';

export default function StepDecompressFile({
  form,
}: {
  form: UseFormReturnType<z.infer<typeof serverScheduleStepSchema>>;
}) {
  return (
    <Stack>
      <ScheduleDynamicParameterInput
        withAsterisk
        label='Root Path'
        placeholder='/'
        value={form.getInputProps('action.root').value}
        onChange={(v) => form.setFieldValue('action.root', v)}
      />
      <ScheduleDynamicParameterInput
        withAsterisk
        label='File'
        placeholder='backup.tar.gz'
        value={form.getInputProps('action.file').value}
        onChange={(v) => form.setFieldValue('action.file', v)}
      />
      <Switch label='Run in Foreground' {...form.getInputProps('action.foreground', { type: 'checkbox' })} />
      <Switch label='Ignore Failure' {...form.getInputProps('action.ignoreFailure', { type: 'checkbox' })} />
    </Stack>
  );
}
