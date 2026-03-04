import { Group, Stack } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { z } from 'zod';
import Switch from '@/elements/input/Switch.tsx';
import { serverScheduleStepSchema } from '@/lib/schemas/server/schedules.ts';
import ScheduleDynamicParameterInput from '../ScheduleDynamicParameterInput.tsx';

export default function StepWriteFile({ form }: { form: UseFormReturnType<z.infer<typeof serverScheduleStepSchema>> }) {
  return (
    <Stack>
      <ScheduleDynamicParameterInput
        withAsterisk
        label='File Path'
        placeholder='/file.txt'
        value={form.getInputProps('action.file').value}
        onChange={(v) => form.setFieldValue('action.file', v)}
      />
      <ScheduleDynamicParameterInput
        withAsterisk
        label='Content'
        placeholder='File content here...'
        textArea
        value={form.getInputProps('action.content').value}
        onChange={(v) => form.setFieldValue('action.content', v)}
      />
      <Group>
        <Switch label='Append to File' {...form.getInputProps('action.append', { type: 'checkbox' })} />
        <Switch label='Ignore Failure' {...form.getInputProps('action.ignoreFailure', { type: 'checkbox' })} />
      </Group>
    </Stack>
  );
}
