import { Stack } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { z } from 'zod';
import Switch from '@/elements/input/Switch.tsx';
import { serverScheduleStepUpdateSchema } from '@/lib/schemas/server/schedules.ts';
import ScheduleDynamicParameterInput from '../ScheduleDynamicParameterInput.tsx';

export default function StepCreateDirectory({
  form,
}: {
  form: UseFormReturnType<z.infer<typeof serverScheduleStepUpdateSchema>>;
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
        label='Directory Name'
        placeholder='new_folder'
        value={form.getInputProps('action.nane').value}
        onChange={(v) => form.setFieldValue('action.name', v)}
      />
      <Switch label='Ignore Failure' {...form.getInputProps('action.ignoreFailure', { type: 'checkbox' })} />
    </Stack>
  );
}
