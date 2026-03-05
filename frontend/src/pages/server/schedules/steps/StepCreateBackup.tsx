import { Group, Stack } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { z } from 'zod';
import Switch from '@/elements/input/Switch.tsx';
import TagsInput from '@/elements/input/TagsInput.tsx';
import { serverScheduleStepUpdateSchema } from '@/lib/schemas/server/schedules.ts';
import ScheduleDynamicParameterInput from '../ScheduleDynamicParameterInput.tsx';

export default function StepCreateBackup({
  form,
}: {
  form: UseFormReturnType<z.infer<typeof serverScheduleStepUpdateSchema>>;
}) {
  return (
    <Stack>
      <ScheduleDynamicParameterInput
        label='Backup Name'
        placeholder='Backup Name'
        allowNull
        value={form.getInputProps('action.name').value}
        onChange={(v) => form.setFieldValue('action.name', v)}
      />
      <Group>
        <Switch label='Run in Foreground' {...form.getInputProps('action.foreground', { type: 'checkbox' })} />
        <Switch label='Ignore Failure' {...form.getInputProps('action.ignoreFailure', { type: 'checkbox' })} />
      </Group>
      <TagsInput
        label='Ignored Files'
        placeholder='Add files to ignore'
        {...form.getInputProps('action.ignoredFiles')}
      />
    </Stack>
  );
}
