import { Popover } from '@mantine/core';
import { useEffect, useState } from 'react';
import Select from '@/elements/input/Select.tsx';
import TextInput from '@/elements/input/TextInput.tsx';
import { serverBackupStatusLabelMapping, serverPowerStateLabelMapping } from '@/lib/enums.ts';
import ScheduleDynamicParameterInput from '../ScheduleDynamicParameterInput.tsx';

const CRON_SEGMENTS = ['Second', 'Minute', 'Hour', 'Day', 'Month', 'Weekday'] as const;

interface CrontabEditorProps {
  value: string;
  setValue: (value: string) => void;
}

function CrontabEditor({ value, setValue }: CrontabEditorProps) {
  const [segments, setSegments] = useState(['0', '0', '0', '0', '0', '0']);

  useEffect(() => {
    const newSegments = value.split(' ');
    if (segments.every((s, i) => newSegments[i] === s)) {
      return;
    }

    for (let i = 0; i < CRON_SEGMENTS.length; i++) {
      if (!newSegments[i]) {
        newSegments[i] = '0';
      }
    }

    setSegments(newSegments);
  }, [segments, value]);

  const setSegment = (index: number, value: string) => {
    const newSegments = [...segments.slice(0, index), value, ...segments.slice(index + 1)];
    setSegments(newSegments);

    setValue(newSegments.join(' '));
  };

  return (
    <div className='grid grid-cols-3 gap-2 w-64'>
      {CRON_SEGMENTS.map((label, i) => (
        <TextInput
          key={label}
          label={label}
          placeholder={label}
          value={segments[i]}
          className='flex-1'
          onChange={(e) => setSegment(i, e.target.value)}
        />
      ))}
    </div>
  );
}

interface TriggerFormProps {
  trigger: ScheduleTrigger;
  onUpdate: (trigger: ScheduleTrigger) => void;
}

function CronTriggerForm({ trigger, onUpdate }: TriggerFormProps) {
  if (trigger.type !== 'cron') return null;

  return (
    <Popover>
      <Popover.Target>
        <TextInput
          label='Cron Schedule'
          placeholder='Cron Schedule'
          value={trigger.schedule}
          className='flex-1'
          onChange={(e) => onUpdate({ type: 'cron', schedule: e.target.value })}
        />
      </Popover.Target>
      <Popover.Dropdown>
        <CrontabEditor
          value={trigger.schedule}
          setValue={(value) => onUpdate({ type: 'cron', schedule: value })}
        />
      </Popover.Dropdown>
    </Popover>
  );
}

function PowerActionTriggerForm({ trigger, onUpdate }: TriggerFormProps) {
  if (trigger.type !== 'power_action') return null;

  return (
    <Select
      label='Power Action'
      placeholder='Power Action'
      value={trigger.action}
      className='flex-1'
      onChange={(value) => onUpdate({ type: 'power_action', action: value as ServerPowerAction })}
      data={[
        { value: 'start', label: 'Start' },
        { value: 'stop', label: 'Stop' },
        { value: 'restart', label: 'Restart' },
        { value: 'kill', label: 'Kill' },
      ]}
    />
  );
}

function ServerStateTriggerForm({ trigger, onUpdate }: TriggerFormProps) {
  if (trigger.type !== 'server_state') return null;

  return (
    <Select
      label='Server State'
      placeholder='Server State'
      value={trigger.state}
      className='flex-1'
      onChange={(value) => onUpdate({ type: 'server_state', state: value as ServerPowerState })}
      data={Object.entries(serverPowerStateLabelMapping).map(([value, label]) => ({
        value,
        label,
      }))}
    />
  );
}

function BackupStatusTriggerForm({ trigger, onUpdate }: TriggerFormProps) {
  if (trigger.type !== 'backup_status') return null;

  return (
    <Select
      label='Backup Status'
      placeholder='Backup Status'
      value={trigger.status}
      className='flex-1'
      onChange={(value) => onUpdate({ type: 'backup_status', status: value as ServerBackupStatus })}
      data={Object.entries(serverBackupStatusLabelMapping).map(([value, label]) => ({
        value,
        label,
      }))}
    />
  );
}

function ConsoleLineTriggerForm({ trigger, onUpdate }: TriggerFormProps) {
  if (trigger.type !== 'console_line') return null;

  return (
    <TextInput
      label='Line Contains'
      placeholder='Line Contains'
      value={trigger.contains}
      className='flex-1'
      onChange={(e) => onUpdate({ ...trigger, contains: e.target.value })}
    />
  );
}

function ConsoleLineOutputForm({ trigger, onUpdate }: TriggerFormProps) {
  if (trigger.type !== 'console_line') return null;

  return (
    <ScheduleDynamicParameterInput
      label='Output into'
      placeholder='Output the captured line into a variable'
      className='mb-2'
      allowNull
      allowString={false}
      value={trigger.outputInto}
      onChange={(v) => onUpdate({ ...trigger, outputInto: v })}
    />
  );
}

const TRIGGER_INLINE_FORMS: Record<ScheduleTrigger['type'], React.FC<TriggerFormProps> | null> = {
  cron: CronTriggerForm,
  power_action: PowerActionTriggerForm,
  server_state: ServerStateTriggerForm,
  backup_status: BackupStatusTriggerForm,
  console_line: ConsoleLineTriggerForm,
  crash: null,
};

const TRIGGER_EXTRA_FORMS: Record<ScheduleTrigger['type'], React.FC<TriggerFormProps> | null> = {
  cron: null,
  power_action: null,
  server_state: null,
  backup_status: null,
  console_line: ConsoleLineOutputForm,
  crash: null,
};

export function TriggerInlineForm({ trigger, onUpdate }: TriggerFormProps) {
  const FormComponent = TRIGGER_INLINE_FORMS[trigger.type];
  if (!FormComponent) return null;
  return <FormComponent trigger={trigger} onUpdate={onUpdate} />;
}

export function TriggerExtraForm({ trigger, onUpdate }: TriggerFormProps) {
  const FormComponent = TRIGGER_EXTRA_FORMS[trigger.type];
  if (!FormComponent) return null;
  return <FormComponent trigger={trigger} onUpdate={onUpdate} />;
}
