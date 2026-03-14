import { Stack } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { z } from 'zod';
import TagsInput from '@/elements/input/TagsInput.tsx';
import { serverScheduleStepUpdateSchema } from '@/lib/schemas/server/schedules.ts';
import ScheduleDynamicParameterInput from '../ScheduleDynamicParameterInput.tsx';

export default function StepDeleteFiles({
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
      <TagsInput
        withAsterisk
        label='Files to Delete'
        placeholder='Add files to delete'
        {...form.getInputProps('action.files', { type: 'checkbox' })}
      />
    </Stack>
  );
}
