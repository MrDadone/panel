import { UseFormReturnType } from '@mantine/form';
import { z } from 'zod';
import NumberInput from '@/elements/input/NumberInput.tsx';
import { serverScheduleStepUpdateSchema } from '@/lib/schemas/server/schedules.ts';

export default function StepSleep({
  form,
}: {
  form: UseFormReturnType<z.infer<typeof serverScheduleStepUpdateSchema>>;
}) {
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
