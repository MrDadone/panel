import { Stack } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { z } from 'zod';
import Switch from '@/elements/input/Switch.tsx';
import { serverScheduleStepSchema } from '@/lib/schemas/server/schedules.ts';
import ScheduleDynamicParameterInput from '../ScheduleDynamicParameterInput.tsx';

export default function StepUpdateStartupVariable({
  form,
}: {
  form: UseFormReturnType<z.infer<typeof serverScheduleStepSchema>>;
}) {
  return (
    <Stack>
      <ScheduleDynamicParameterInput
        withAsterisk
        label='Environment Variable'
        placeholder='JAVA_OPTS'
        value={form.getInputProps('action.envVariable').value}
        onChange={(v) => form.setFieldValue('action.envVariable', v)}
      />
      <ScheduleDynamicParameterInput
        withAsterisk
        label='Value'
        placeholder='-Xmx2G -Xms1G'
        value={form.getInputProps('action.value').value}
        onChange={(v) => form.setFieldValue('action.value', v)}
      />
      <Switch label='Ignore Failure' {...form.getInputProps('action.ignoreFailure', { type: 'checkbox' })} />
    </Stack>
  );
}
