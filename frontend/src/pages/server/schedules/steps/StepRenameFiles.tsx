import { Group, Stack, Text } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { z } from 'zod';
import Button from '@/elements/Button.tsx';
import TextInput from '@/elements/input/TextInput.tsx';
import { serverScheduleStepRenameFilesSchema, serverScheduleStepUpdateSchema } from '@/lib/schemas/server/schedules.ts';
import ScheduleDynamicParameterInput from '../ScheduleDynamicParameterInput.tsx';

export default function StepRenameFiles({
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

      <Stack gap='xs'>
        <Text>Files</Text>
        {(form.values.action as z.infer<typeof serverScheduleStepRenameFilesSchema>).files.map(
          (file, index: number) => (
            <Group key={index}>
              <TextInput
                withAsterisk
                label='from'
                placeholder='source.txt'
                value={file.from}
                {...form.getInputProps(`action.files.${index}.from`)}
              />
              <TextInput
                withAsterisk
                label='to'
                placeholder='target.txt'
                value={file.to}
                {...form.getInputProps(`action.files.${index}.to`)}
              />
            </Group>
          ),
        )}
      </Stack>

      <Button onClick={() => form.insertListItem('action.files', { from: '', to: '' })}>Add File</Button>
    </Stack>
  );
}
