import { Stack } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { z } from 'zod';
import Switch from '@/elements/input/Switch.tsx';
import { serverScheduleStepSchema } from '@/lib/schemas/server/schedules.ts';
import ScheduleDynamicParameterInput from '../ScheduleDynamicParameterInput.tsx';

export default function StepUpdateStartupCommand({
  form,
}: {
  form: UseFormReturnType<z.infer<typeof serverScheduleStepSchema>>;
}) {
  return (
    <Stack>
      <ScheduleDynamicParameterInput
        withAsterisk
        label='Startup Command'
        placeholder='java -jar server.jar'
        value={form.getInputProps('action.command').value}
        onChange={(v) => form.setFieldValue('action.command', v)}
      />
      <Switch label='Ignore Failure' {...form.getInputProps('action.ignoreFailure', { type: 'checkbox' })} />
    </Stack>
  );
}
