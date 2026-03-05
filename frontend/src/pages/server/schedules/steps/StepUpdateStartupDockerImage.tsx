import { Stack } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { z } from 'zod';
import Select from '@/elements/input/Select.tsx';
import Switch from '@/elements/input/Switch.tsx';
import { serverScheduleStepUpdateSchema } from '@/lib/schemas/server/schedules.ts';
import { useServerStore } from '@/stores/server.ts';

export default function StepUpdateStartupDockerImage({
  form,
}: {
  form: UseFormReturnType<z.infer<typeof serverScheduleStepUpdateSchema>>;
}) {
  const server = useServerStore((state) => state.server);

  return (
    <Stack>
      <Select
        withAsterisk
        label='Docker Image'
        data={Object.entries(server.egg.dockerImages).map(([key, value]) => ({
          value,
          label: key,
        }))}
        {...form.getInputProps('action.image')}
      />
      <Switch label='Ignore Failure' {...form.getInputProps('action.ignoreFailure', { type: 'checkbox' })} />
    </Stack>
  );
}
