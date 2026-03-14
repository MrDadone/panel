import { Stack } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { z } from 'zod';
import TextArea from '@/elements/input/TextArea.tsx';
import { serverScheduleStepUpdateSchema } from '@/lib/schemas/server/schedules.ts';
import ScheduleDynamicParameterInput from '../ScheduleDynamicParameterInput.tsx';

export default function StepFormat({
  form,
}: {
  form: UseFormReturnType<z.infer<typeof serverScheduleStepUpdateSchema>>;
}) {
  return (
    <Stack>
      <TextArea
        withAsterisk
        label='Format String'
        description='The Format string, can include variables by wrapping inside {...}'
        placeholder='Hello {variable}!'
        {...form.getInputProps('action.format')}
      />

      <ScheduleDynamicParameterInput
        label='Output into'
        placeholder='Output the concatinated string into a variable'
        allowString={false}
        value={form.getInputProps('action.outputInto').value}
        onChange={(v) => form.setFieldValue('action.outputInto', v)}
      />
    </Stack>
  );
}
