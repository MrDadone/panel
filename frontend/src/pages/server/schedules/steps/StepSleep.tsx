import { UseFormReturnType } from '@mantine/form';
import { z } from 'zod';
import NumberInput from '@/elements/input/NumberInput.tsx';
import { serverScheduleStepSchema } from '@/lib/schemas/server/schedules.ts';

export default function StepSleep({ form }: { form: UseFormReturnType<z.infer<typeof serverScheduleStepSchema>> }) {
  return (
    <NumberInput
      withAsterisk
      label='Duration (milliseconds)'
      placeholder='1000'
      min={1}
      {...form.getInputProps('action.duration')}
    />
  );
}
