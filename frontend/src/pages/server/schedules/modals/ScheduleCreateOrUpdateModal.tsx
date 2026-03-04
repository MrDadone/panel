import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon, ModalProps, Stack, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { httpErrorToHuman } from '@/api/axios.ts';
import createSchedule from '@/api/server/schedules/createSchedule.ts';
import updateSchedule from '@/api/server/schedules/updateSchedule.ts';
import Button from '@/elements/Button.tsx';
import Divider from '@/elements/Divider.tsx';
import Select from '@/elements/input/Select.tsx';
import Switch from '@/elements/input/Switch.tsx';
import TextInput from '@/elements/input/TextInput.tsx';
import { Modal, ModalFooter } from '@/elements/modals/Modal.tsx';
import { scheduleTriggerDefaultMapping, scheduleTriggerLabelMapping } from '@/lib/enums.ts';
import { serverScheduleSchema } from '@/lib/schemas/server/schedules.ts';
import { useToast } from '@/providers/ToastProvider.tsx';
import { useServerStore } from '@/stores/server.ts';
import { TriggerExtraForm, TriggerInlineForm } from '../triggers/TriggerForm.tsx';

type Props = ModalProps & {
  propSchedule?: ServerSchedule;
  onScheduleUpdate?: (schedule: Partial<ServerSchedule>) => void;
};

const TRIGGER_TYPE_OPTIONS = Object.entries(scheduleTriggerLabelMapping).map(([value, label]) => ({
  value,
  label,
}));

export default function ScheduleCreateOrUpdateModal({ propSchedule, onScheduleUpdate, opened, onClose }: Props) {
  const { addToast } = useToast();
  const { server, addSchedule } = useServerStore();

  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof serverScheduleSchema>>({
    initialValues: {
      name: '',
      enabled: true,
      triggers: [],
      condition: {
        type: 'none',
      },
    },
    validateInputOnBlur: true,
    validate: zod4Resolver(serverScheduleSchema),
  });

  useEffect(() => {
    if (propSchedule) {
      form.setValues({
        name: propSchedule.name,
        enabled: propSchedule.enabled,
        triggers: propSchedule.triggers,
      });
    }
  }, [propSchedule]);

  const doCreateOrUpdate = () => {
    setLoading(true);

    if (propSchedule?.uuid) {
      updateSchedule(server.uuid, propSchedule.uuid, form.values)
        .then(() => {
          addToast('Schedule updated.', 'success');
          onClose();
          // onScheduleUpdate!({ name, enabled, triggers });
        })
        .catch((msg) => {
          addToast(httpErrorToHuman(msg), 'error');
        })
        .finally(() => setLoading(false));
    } else {
      createSchedule(server.uuid, form.values)
        .then((schedule) => {
          addToast('Schedule created.', 'success');
          form.reset();
          onClose();
          addSchedule(schedule);
        })
        .catch((msg) => {
          addToast(httpErrorToHuman(msg), 'error');
        })
        .finally(() => setLoading(false));
    }
  };

  const removeTrigger = (index: number) => {
    form.removeListItem('triggers', index);
  };

  const addTrigger = () => {
    form.insertListItem('triggers', scheduleTriggerDefaultMapping.cron);
  };

  return (
    <Modal title={`${propSchedule?.uuid ? 'Update' : 'Create'} Schedule`} onClose={onClose} opened={opened} size='lg'>
      <Stack>
        <TextInput label='Schedule Name' placeholder='Schedule Name' {...form.getInputProps('name')} />

        <Switch label='Enabled' name='enabled' {...form.getInputProps('enabled', { type: 'checkbox' })} />

        <div>
          <Title order={4} mb='sm'>
            Triggers
          </Title>
          {form.values.triggers.map((trigger, index) => (
            <div key={`trigger-${index}`} className='flex flex-col'>
              {index !== 0 && <Divider my='sm' />}

              <div className='flex flex-row items-end space-x-2 mb-2'>
                <Select
                  label={`Trigger ${index + 1}`}
                  placeholder={`Trigger ${index + 1}`}
                  className='flex-1'
                  data={TRIGGER_TYPE_OPTIONS}
                  {...form.getInputProps(`triggers.${index}.type`)}
                />

                <TriggerInlineForm form={form} index={index} />

                <ActionIcon size='input-sm' color='red' variant='light' onClick={() => removeTrigger(index)}>
                  <FontAwesomeIcon icon={faMinus} />
                </ActionIcon>
              </div>

              <TriggerExtraForm form={form} index={index} />
            </div>
          ))}

          <Button onClick={addTrigger} variant='light' leftSection={<FontAwesomeIcon icon={faPlus} />}>
            Add Trigger
          </Button>
        </div>

        <ModalFooter>
          <Button onClick={doCreateOrUpdate} loading={loading} disabled={!form.isValid()}>
            {propSchedule?.uuid ? 'Update' : 'Create'}
          </Button>
          <Button variant='default' onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </Stack>
    </Modal>
  );
}
