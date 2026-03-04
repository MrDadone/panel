import { Stack } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { z } from 'zod';
import { serverScheduleStepSchema } from '@/lib/schemas/server/schedules.ts';
import ScheduleConditionBuilder from '../ScheduleConditionBuilder.tsx';

export default function StepEnsure({ form }: { form: UseFormReturnType<z.infer<typeof serverScheduleStepSchema>> }) {
  return (
    <Stack>
      <ScheduleConditionBuilder
        condition={form.getInputProps('action.condition').value}
        onChange={(condition) => form.setFieldValue('action.condition', condition)}
      />
    </Stack>
  );
}
