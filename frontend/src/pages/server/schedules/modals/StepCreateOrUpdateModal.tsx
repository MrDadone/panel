import { faSave } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Divider, ModalProps, Stack, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { httpErrorToHuman } from '@/api/axios.ts';
import createScheduleStep from '@/api/server/schedules/steps/createScheduleStep.ts';
import updateScheduleStep from '@/api/server/schedules/steps/updateScheduleStep.ts';
import Button from '@/elements/Button.tsx';
import Select from '@/elements/input/Select.tsx';
import { Modal, ModalFooter } from '@/elements/modals/Modal.tsx';
import { scheduleStepDefaultMapping, scheduleStepLabelMapping } from '@/lib/enums.ts';
import {
  serverScheduleSchema,
  serverScheduleStepSchema,
  serverScheduleStepUpdateSchema,
} from '@/lib/schemas/server/schedules.ts';
import { useToast } from '@/providers/ToastProvider.tsx';
import { useServerStore } from '@/stores/server.ts';
import StepCompressFiles from '../steps/StepCompressFiles.tsx';
import StepCopyFile from '../steps/StepCopyFile.tsx';
import StepCreateBackup from '../steps/StepCreateBackup.tsx';
import StepCreateDirectory from '../steps/StepCreateDirectory.tsx';
import StepDecompressFile from '../steps/StepDecompressFile.tsx';
import StepDeleteFiles from '../steps/StepDeleteFiles.tsx';
import StepEnsure from '../steps/StepEnsure.tsx';
import StepFormat from '../steps/StepFormat.tsx';
import StepMatchRegex from '../steps/StepMatchRegex.tsx';
import StepRenameFiles from '../steps/StepRenameFiles.tsx';
import StepSendCommand from '../steps/StepSendCommand.tsx';
import StepSendPower from '../steps/StepSendPower.tsx';
import StepSleep from '../steps/StepSleep.tsx';
import StepUpdateStartupCommand from '../steps/StepUpdateStartupCommand.tsx';
import StepUpdateStartupDockerImage from '../steps/StepUpdateStartupDockerImage.tsx';
import StepUpdateStartupVariable from '../steps/StepUpdateStartupVariable.tsx';
import StepWaitForConsoleLine from '../steps/StepWaitForConsoleLine.tsx';
import StepWriteFile from '../steps/StepWriteFile.tsx';

type Props = ModalProps & {
  schedule: z.infer<typeof serverScheduleSchema>;
  propStep?: z.infer<typeof serverScheduleStepSchema>;
  nextStepOrder?: number;
  onStepCreate?: (step: z.infer<typeof serverScheduleStepSchema>) => void;
  onStepUpdate?: (step: z.infer<typeof serverScheduleStepSchema>) => void;
};

export default function StepCreateOrUpdateModal({
  schedule,
  propStep,
  nextStepOrder,
  onStepCreate,
  onStepUpdate,
  opened,
  onClose,
}: Props) {
  const { addToast } = useToast();
  const server = useServerStore((state) => state.server);

  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof serverScheduleStepUpdateSchema>>({
    initialValues: {
      order: nextStepOrder ?? 1,
      action: scheduleStepDefaultMapping.sleep,
    },
    validateInputOnBlur: true,
    validate: zod4Resolver(serverScheduleStepSchema),
  });

  useEffect(() => {
    if (propStep) {
      form.setValues({
        order: propStep.order,
        action: propStep.action,
      });
    }
  }, [propStep]);

  const doCreateOrUpdate = () => {
    setLoading(true);

    if (propStep) {
      updateScheduleStep(server.uuid, schedule.uuid, propStep.uuid, form.values)
        .then(() => {
          onClose();
          addToast('Schedule step updated.', 'success');
          onStepUpdate?.({ ...propStep, ...form.values });
        })
        .catch((msg) => {
          addToast(httpErrorToHuman(msg), 'error');
        })
        .finally(() => setLoading(false));
    } else {
      createScheduleStep(server.uuid, schedule.uuid, form.values)
        .then((step) => {
          onClose();
          addToast('Schedule step created.', 'success');
          onStepCreate?.(step);
        })
        .catch((msg) => {
          addToast(httpErrorToHuman(msg), 'error');
        })
        .finally(() => setLoading(false));
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={propStep ? 'Edit Schedule Step' : 'Create Schedule Step'}>
      <Stack gap='md'>
        <Select
          label='Action Type'
          data={Object.entries(scheduleStepLabelMapping).map(([value, label]) => ({
            value,
            label,
          }))}
          searchable
          {...form.getInputProps('action.type')}
        />

        <Divider />

        {form.values.action.type === 'sleep' ? (
          <StepSleep form={form} />
        ) : form.values.action.type === 'ensure' ? (
          <StepEnsure form={form} />
        ) : form.values.action.type === 'format' ? (
          <StepFormat form={form} />
        ) : form.values.action.type === 'match_regex' ? (
          <StepMatchRegex form={form} />
        ) : form.values.action.type === 'wait_for_console_line' ? (
          <StepWaitForConsoleLine form={form} />
        ) : form.values.action.type === 'send_power' ? (
          <StepSendPower form={form} />
        ) : form.values.action.type === 'send_command' ? (
          <StepSendCommand form={form} />
        ) : form.values.action.type === 'create_backup' ? (
          <StepCreateBackup form={form} />
        ) : form.values.action.type === 'create_directory' ? (
          <StepCreateDirectory form={form} />
        ) : form.values.action.type === 'write_file' ? (
          <StepWriteFile form={form} />
        ) : form.values.action.type === 'copy_file' ? (
          <StepCopyFile form={form} />
        ) : form.values.action.type === 'delete_files' ? (
          <StepDeleteFiles form={form} />
        ) : form.values.action.type === 'rename_files' ? (
          <StepRenameFiles form={form} />
        ) : form.values.action.type === 'compress_files' ? (
          <StepCompressFiles form={form} />
        ) : form.values.action.type === 'decompress_file' ? (
          <StepDecompressFile form={form} />
        ) : form.values.action.type === 'update_startup_variable' ? (
          <StepUpdateStartupVariable form={form} />
        ) : form.values.action.type === 'update_startup_command' ? (
          <StepUpdateStartupCommand form={form} />
        ) : form.values.action.type === 'update_startup_docker_image' ? (
          <StepUpdateStartupDockerImage form={form} />
        ) : (
          <Text c='dimmed'>Select an action type to configure</Text>
        )}

        <ModalFooter>
          <Button onClick={doCreateOrUpdate} leftSection={<FontAwesomeIcon icon={faSave} />} loading={loading}>
            {propStep ? 'Update' : 'Create'}
          </Button>
          <Button variant='default' onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </Stack>
    </Modal>
  );
}
