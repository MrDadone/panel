import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Group, Text, ThemeIcon } from '@mantine/core';
import { CronExpressionParser } from 'cron-parser';
import Card from '@/elements/Card.tsx';
import { scheduleTriggerColorMapping, scheduleTriggerIconMapping } from '@/lib/enums.ts';
import { formatTimestamp } from '@/lib/time.ts';

interface TriggerCardProps {
  date: Date;
  timezone: string;
  trigger: ScheduleTrigger;
}

function getTriggerLabel(trigger: ScheduleTrigger, date: Date, timezone: string): string {
  switch (trigger.type) {
    case 'cron': {
      const interval = CronExpressionParser.parse(trigger.schedule, {
        currentDate: date,
        tz: timezone,
      });
      return `Cron: ${trigger.schedule}\nNext Run: ${formatTimestamp(interval.next().toDate())}`;
    }
    case 'power_action':
      return `Power Action: ${trigger.action}`;
    case 'server_state':
      return `Server State: ${trigger.state}`;
    case 'backup_status':
      return `Backup Status: ${trigger.status}`;
    case 'console_line':
      return `Console Line contains: ${trigger.contains}`;
    case 'crash':
      return 'Server Crash';
    default:
      return 'Unknown Trigger';
  }
}

export default function TriggerCard({ date, timezone, trigger }: TriggerCardProps) {
  return (
    <Card>
      <Group>
        <ThemeIcon color={scheduleTriggerColorMapping[trigger.type]}>
          <FontAwesomeIcon icon={scheduleTriggerIconMapping[trigger.type]} />
        </ThemeIcon>
        <Text fw={500}>{getTriggerLabel(trigger, date, timezone)}</Text>
      </Group>
    </Card>
  );
}
