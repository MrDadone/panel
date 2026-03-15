import { Stack } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { z } from 'zod';
import Switch from '@/elements/input/Switch.tsx';
import { serverScheduleStepUpdateSchema } from '@/lib/schemas/server/schedules.ts';
import ScheduleDynamicParameterInput from '../ScheduleDynamicParameterInput.tsx';

export default function StepCopyFile({
  form,
}: {
  form: UseFormReturnType<z.infer<typeof serverScheduleStepUpdateSchema>>;
}) {
  return (
    <Stack>
      <ScheduleDynamicParameterInput
        withAsterisk
        label='Source File'
        placeholder='/source.txt'
        value={form.getInputProps('action.file').value}
        onChange={(v) => form.setFieldValue('action.file', v)}
      />
      <ScheduleDynamicParameterInput
        withAsterisk
        label='Destination'
        placeholder='/backup/target.txt'
        value={form.getInputProps('action.destination').value}
        onChange={(v) => form.setFieldValue('action.destination', v)}
      />
      <Switch label='Run in Foreground' {...form.getInputProps('action.foreground', { type: 'checkbox' })} />
      <Switch label='Ignore Failure' {...form.getInputProps('action.ignoreFailure', { type: 'checkbox' })} />
    </Stack>
  );
}
