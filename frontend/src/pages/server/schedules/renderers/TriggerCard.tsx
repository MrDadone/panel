import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Group, Text, ThemeIcon } from '@mantine/core';
import { CronExpressionParser } from 'cron-parser';
import { z } from 'zod';
import Card from '@/elements/Card.tsx';
import Code from '@/elements/Code.tsx';
import FormattedTimestamp from '@/elements/time/FormattedTimestamp.tsx';
import { scheduleTriggerColorMapping, scheduleTriggerIconMapping } from '@/lib/enums.ts';
import { serverScheduleTriggerSchema } from '@/lib/schemas/server/schedules.ts';
import { useTranslations } from '@/providers/TranslationProvider.tsx';

interface TriggerCardProps {
  date: Date;
  timezone: string;
  trigger: z.infer<typeof serverScheduleTriggerSchema>;
}

export default function TriggerCard({ date, timezone, trigger }: TriggerCardProps) {
  const { t } = useTranslations();

  return (
    <Card>
      <Group>
        <ThemeIcon color={scheduleTriggerColorMapping[trigger.type]}>
          <FontAwesomeIcon icon={scheduleTriggerIconMapping[trigger.type]} />
        </ThemeIcon>
        {trigger.type === 'cron' ? (
          <span className='flex flex-row'>
            <Text className='mr-1!'>
              On Cron Interval <Code>{trigger.schedule}</Code>, Next run is
            </Text>
            <FormattedTimestamp
              timestamp={CronExpressionParser.parse(trigger.schedule, {
                currentDate: date,
                tz: timezone,
              })
                .next()
                .toDate()}
              autoUpdate={false}
              precise
            />
            .
          </span>
        ) : trigger.type === 'power_action' ? (
          <Text>
            When Power Action <Code>{trigger.action}</Code> is requested.
          </Text>
        ) : trigger.type === 'server_state' ? (
          <Text>
            When Server State <Code>{t(`common.enum.serverState.${trigger.state}`, {})}</Code> is reached.
          </Text>
        ) : trigger.type === 'backup_status' ? (
          <Text>
            When Backup reaches Status <Code>{trigger.status}</Code>.
          </Text>
        ) : trigger.type === 'console_line' ? (
          <Text>
            When Console Output reaches line that contains <Code>{trigger.contains}</Code>.
          </Text>
        ) : trigger.type === 'crash' ? (
          <Text>When Server crashes.</Text>
        ) : null}
      </Group>
    </Card>
  );
}
