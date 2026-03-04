import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon, Stack, Title } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { z } from 'zod';
import Button from '@/elements/Button.tsx';
import TextInput from '@/elements/input/TextInput.tsx';
import { serverScheduleStepMatchRegexSchema, serverScheduleStepSchema } from '@/lib/schemas/server/schedules.ts';
import ScheduleDynamicParameterInput from '../ScheduleDynamicParameterInput.tsx';

export default function StepMatchRegex({
  form,
}: {
  form: UseFormReturnType<z.infer<typeof serverScheduleStepSchema>>;
}) {
  return (
    <Stack>
      <ScheduleDynamicParameterInput
        label='Input'
        placeholder='The input data to be matched by the regex'
        value={form.getInputProps('action.input').value}
        onChange={(v) => form.setFieldValue('action.input', v)}
      />

      <TextInput
        label='Regex'
        placeholder='The regex to use for matching, must comply with https://crates.io/crates/regex'
        {...form.getInputProps('action.regex')}
      />

      <div>
        <Title order={4} mb='sm'>
          Outputs
        </Title>
        {(form.values.action as z.infer<typeof serverScheduleStepMatchRegexSchema>).outputInto.map(
          (outputInto, index) => (
            <div key={`output-${index}`} className='flex flex-row items-end space-x-2 mb-2'>
              <ScheduleDynamicParameterInput
                label={`Output ${index + 1}`}
                allowNull
                allowString={false}
                value={form.getInputProps(`action.outputInto.${index}`).value}
                onChange={(v) => form.setFieldValue(`action.outputInto.${index}`, v)}
              />

              <ActionIcon
                size='input-sm'
                color='red'
                variant='light'
                onClick={() => form.removeListItem('action.outputInto', index)}
              >
                <FontAwesomeIcon icon={faMinus} />
              </ActionIcon>
            </div>
          ),
        )}

        <Button
          onClick={() => form.insertListItem('action.outputInto', { variable: '' })}
          variant='light'
          leftSection={<FontAwesomeIcon icon={faPlus} />}
        >
          Add Output
        </Button>
      </div>
    </Stack>
  );
}
