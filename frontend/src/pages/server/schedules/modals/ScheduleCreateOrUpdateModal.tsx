import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon, Group, ModalProps, Stack, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { httpErrorToHuman } from '@/api/axios.ts';
import createSchedule from '@/api/server/schedules/createSchedule.ts';
import updateSchedule from '@/api/server/schedules/updateSchedule.ts';
import Button from '@/elements/Button.tsx';
import Divider from '@/elements/Divider.tsx';
import Select from '@/elements/input/Select.tsx';
import Switch from '@/elements/input/Switch.tsx';
import TextInput from '@/elements/input/TextInput.tsx';
import Modal from '@/elements/modals/Modal.tsx';
import { scheduleTriggerDefaultMapping, scheduleTriggerLabelMapping } from '@/lib/enums.ts';
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

  const [name, setName] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [triggers, setTriggers] = useState<ScheduleTrigger[]>([]);
  const [condition, setCondition] = useState<SchedulePreCondition>({ type: 'none' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (propSchedule) {
      setName(propSchedule.name);
      setEnabled(propSchedule.enabled);
      setTriggers(propSchedule.triggers);
    }
  }, [propSchedule]);

  const doCreateOrUpdate = () => {
    setLoading(true);

    if (propSchedule?.uuid) {
      updateSchedule(server.uuid, propSchedule.uuid, { name, enabled, triggers })
        .then(() => {
          addToast('Schedule updated.', 'success');
          onClose();
          onScheduleUpdate!({ name, enabled, triggers });
        })
        .catch((msg) => {
          addToast(httpErrorToHuman(msg), 'error');
        })
        .finally(() => setLoading(false));
    } else {
      createSchedule(server.uuid, { name, enabled, triggers, condition })
        .then((schedule) => {
          addToast('Schedule created.', 'success');
          setName('');
          setEnabled(true);
          setTriggers([]);
          setCondition({ type: 'none' });
          onClose();
          addSchedule(schedule);
        })
        .catch((msg) => {
          addToast(httpErrorToHuman(msg), 'error');
        })
        .finally(() => setLoading(false));
    }
  };

  const updateTrigger = (index: number, trigger: ScheduleTrigger) => {
    setTriggers((triggers) => [...triggers.slice(0, index), trigger, ...triggers.slice(index + 1)]);
  };

  const removeTrigger = (index: number) => {
    setTriggers((triggers) => triggers.filter((_, i) => i !== index));
  };

  const addTrigger = () => {
    setTriggers((triggers) => [...triggers, scheduleTriggerDefaultMapping.cron]);
  };

  const changeTriggerType = (index: number, type: ScheduleTrigger['type']) => {
    setTriggers((triggers) => [
      ...triggers.slice(0, index),
      scheduleTriggerDefaultMapping[type],
      ...triggers.slice(index + 1),
    ]);
  };

  return (
    <Modal title={`${propSchedule?.uuid ? 'Update' : 'Create'} Schedule`} onClose={onClose} opened={opened} size='lg'>
      <Stack>
        <TextInput
          label='Schedule Name'
          placeholder='Schedule Name'
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Switch label='Enabled' name='enabled' checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />

        <div>
          <Title order={4} mb='sm'>
            Triggers
          </Title>
          {triggers.map((trigger, index) => (
            <div key={`trigger-${index}`} className='flex flex-col'>
              {index !== 0 && <Divider my='sm' />}

              <div className='flex flex-row items-end space-x-2 mb-2'>
                <Select
                  label={`Trigger ${index + 1}`}
                  placeholder={`Trigger ${index + 1}`}
                  value={trigger.type}
                  className='flex-1'
                  onChange={(value) => changeTriggerType(index, value as ScheduleTrigger['type'])}
                  data={TRIGGER_TYPE_OPTIONS}
                />

                <TriggerInlineForm trigger={trigger} onUpdate={(t) => updateTrigger(index, t)} />

                <ActionIcon size='input-sm' color='red' variant='light' onClick={() => removeTrigger(index)}>
                  <FontAwesomeIcon icon={faMinus} />
                </ActionIcon>
              </div>

              <TriggerExtraForm trigger={trigger} onUpdate={(t) => updateTrigger(index, t)} />
            </div>
          ))}

          <Button onClick={addTrigger} variant='light' leftSection={<FontAwesomeIcon icon={faPlus} />}>
            Add Trigger
          </Button>
        </div>

        <Group>
          <Button onClick={doCreateOrUpdate} loading={loading} disabled={!name}>
            {propSchedule?.uuid ? 'Update' : 'Create'}
          </Button>
          <Button variant='default' onClick={onClose}>
            Close
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
