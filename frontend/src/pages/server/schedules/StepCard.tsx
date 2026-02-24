import { faGear, faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon, Group, Stack, Text, ThemeIcon } from '@mantine/core';
import { useState } from 'react';
import { httpErrorToHuman } from '@/api/axios.ts';
import deleteScheduleStep from '@/api/server/schedules/steps/deleteScheduleStep.ts';
import Card from '@/elements/Card.tsx';
import ConfirmationModal from '@/elements/modals/ConfirmationModal.tsx';
import { scheduleStepIconMapping, scheduleStepLabelMapping } from '@/lib/enums.ts';
import { useToast } from '@/providers/ToastProvider.tsx';
import { useServerStore } from '@/stores/server.ts';
import StepCreateOrUpdateModal from './modals/StepCreateOrUpdateModal.tsx';
import ActionRenderer from './renderers/ActionRenderer.tsx';

interface Props {
  schedule: ServerSchedule;
  step: ScheduleStep;
  onStepUpdate: (step: ScheduleStep) => void;
  onStepDelete: (stepUuid: string) => void;
}

export default function StepCard({ schedule, step, onStepUpdate, onStepDelete }: Props) {
  const { addToast } = useToast();
  const server = useServerStore((state) => state.server);

  const [openModal, setOpenModal] = useState<'update' | 'delete' | null>(null);

  const doDelete = async () => {
    await deleteScheduleStep(server.uuid, schedule.uuid, step.uuid)
      .then(() => {
        addToast('Schedule step deleted.', 'success');
        onStepDelete(step.uuid);
      })
      .catch((msg) => {
        addToast(httpErrorToHuman(msg), 'error');
      });
  };

  return (
    <Card>
      <StepCreateOrUpdateModal
        opened={openModal === 'update'}
        onClose={() => setOpenModal(null)}
        schedule={schedule}
        propStep={step}
        onStepUpdate={onStepUpdate}
      />

      <ConfirmationModal
        opened={openModal === 'delete'}
        onClose={() => setOpenModal(null)}
        title='Confirm Schedule Step Deletion'
        confirm='Delete'
        onConfirmed={doDelete}
      >
        Are you sure you want to delete this schedule step?
      </ConfirmationModal>

      <Group justify='space-between' align='flex-start'>
        <Group gap='md' align='flex-start'>
          <ThemeIcon size='lg' color='gray'>
            <FontAwesomeIcon icon={scheduleStepIconMapping[step.action.type] || faGear} />
          </ThemeIcon>
          <Stack gap={4}>
            <Text fw={600}>{scheduleStepLabelMapping[step.action.type] || step.action.type}</Text>
            <Text size='sm' c='dimmed'>
              <ActionRenderer action={step.action} mode='compact' />
            </Text>
          </Stack>
        </Group>

        <Group gap='xs'>
          <ActionIcon color='blue' onClick={() => setOpenModal('update')}>
            <FontAwesomeIcon icon={faPencil} />
          </ActionIcon>
          <ActionIcon color='red' onClick={() => setOpenModal('delete')}>
            <FontAwesomeIcon icon={faTrash} />
          </ActionIcon>
        </Group>
      </Group>
    </Card>
  );
}
