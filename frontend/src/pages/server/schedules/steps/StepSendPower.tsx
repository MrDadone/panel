import { Stack } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { z } from 'zod';
import Select from '@/elements/input/Select.tsx';
import Switch from '@/elements/input/Switch.tsx';
import { serverPowerActionLabelMapping } from '@/lib/enums.ts';
import { serverScheduleStepUpdateSchema } from '@/lib/schemas/server/schedules.ts';

export default function StepSendPower({
  form,
}: {
  form: UseFormReturnType<z.infer<typeof serverScheduleStepUpdateSchema>>;
}) {
  return (
    <Stack>
      <Select
        withAsterisk
        label='Power Action'
        data={Object.entries(serverPowerActionLabelMapping).map(([value, label]) => ({
          value,
          label,
        }))}
        {...form.getInputProps('action.action')}
      />
      <Switch label='Ignore Failure' {...form.getInputProps('action.ignoreFailure', { type: 'checkbox' })} />
    </Stack>
  );
}
