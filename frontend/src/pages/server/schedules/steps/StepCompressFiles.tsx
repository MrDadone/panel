import { Stack } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { z } from 'zod';
import Select from '@/elements/input/Select.tsx';
import Switch from '@/elements/input/Switch.tsx';
import TagsInput from '@/elements/input/TagsInput.tsx';
import { archiveFormatLabelMapping } from '@/lib/enums.ts';
import { serverScheduleStepSchema } from '@/lib/schemas/server/schedules.ts';
import ScheduleDynamicParameterInput from '../ScheduleDynamicParameterInput.tsx';

export default function StepCompressFiles({
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
      <TagsInput
        withAsterisk
        label='Files to Compress'
        placeholder='Add files to compress'
        {...form.getInputProps('action.files')}
      />
      <Select
        withAsterisk
        label='Archive Format'
        data={Object.entries(archiveFormatLabelMapping).map(([value, label]) => ({
          value,
          label,
        }))}
        {...form.getInputProps('action.format')}
      />
      <ScheduleDynamicParameterInput
        withAsterisk
        label='Archive Name'
        placeholder='backup.tar.gz'
        value={form.getInputProps('action.name').value}
        onChange={(v) => form.setFieldValue('action.name', v)}
      />
      <Switch label='Run in Foreground' {...form.getInputProps('action.foreground', { type: 'checkbox' })} />
      <Switch label='Ignore Failure' {...form.getInputProps('action.ignoreFailure', { type: 'checkbox' })} />
    </Stack>
  );
}
