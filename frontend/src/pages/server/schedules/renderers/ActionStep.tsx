import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Group, Text, ThemeIcon, Timeline } from '@mantine/core';
import AnimatedHourglass from '@/elements/AnimatedHourglass.tsx';
import Badge from '@/elements/Badge.tsx';
import Card from '@/elements/Card.tsx';
import Tooltip from '@/elements/Tooltip.tsx';
import { scheduleStepIconMapping } from '@/lib/enums.ts';
import ActionRenderer from './ActionRenderer.tsx';

interface ActionStepProps {
  step: ScheduleStep;
  isActive: boolean;
}

export default function ActionStep({ step, isActive }: ActionStepProps) {
  return (
    <Timeline.Item
      bullet={
        isActive ? (
          <AnimatedHourglass />
        ) : (
          <FontAwesomeIcon icon={scheduleStepIconMapping[step.action.type]} size='sm' />
        )
      }
      title={
        <Group gap='sm'>
          <Text fw={600}>
            Step {step.order}: {step.action.type.replace(/_/g, ' ').toUpperCase()}{' '}
          </Text>
          {isActive && <Badge ml='md'>Running</Badge>}
          {step.error && (
            <Tooltip label={step.error}>
              <ThemeIcon size='sm' color='red'>
                <FontAwesomeIcon icon={faExclamationTriangle} size='xs' />
              </ThemeIcon>
            </Tooltip>
          )}
        </Group>
      }
    >
      <Card p='sm' mt='xs'>
        <ActionRenderer action={step.action} mode='detailed' />
      </Card>
    </Timeline.Item>
  );
}
