import { Stack } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { z } from 'zod';
import NumberInput from '@/elements/input/NumberInput.tsx';
import Switch from '@/elements/input/Switch.tsx';
import { serverScheduleStepSchema } from '@/lib/schemas/server/schedules.ts';
import ScheduleDynamicParameterInput from '../ScheduleDynamicParameterInput.tsx';

export default function StepWaitForConsoleLine({
  form,
}: {
  form: UseFormReturnType<z.infer<typeof serverScheduleStepSchema>>;
}) {
  return (
    <Stack>
      <ScheduleDynamicParameterInput
        label='Line contains'
        placeholder='Text to make sure is in the console line'
        value={form.getInputProps('contains.root').value}
        onChange={(v) => form.setFieldValue('action.contains', v)}
      />
      <NumberInput
        withAsterisk
        label='Timeout (milliseconds)'
        placeholder='1000'
        min={1}
        {...form.getInputProps('action.timeout')}
      />
      <ScheduleDynamicParameterInput
        label='Output into'
        placeholder='Output the captured line into a variable'
        allowNull
        allowString={false}
        value={form.getInputProps('action.outputInto').value}
        onChange={(v) => form.setFieldValue('action.outputInto', v)}
      />
      <Switch label='Ignore Failure' {...form.getInputProps('action.ignoreFailure', { type: 'checkbox' })} />
    </Stack>
  );
}
