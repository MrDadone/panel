import {
  faChevronDown,
  faClockRotateLeft,
  faExclamationTriangle,
  faPencil,
  faPlay,
  faPlayCircle,
  faReply,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Group, Stack, Tabs, Timeline, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import getSchedule from '@/api/server/schedules/getSchedule.ts';
import getScheduleSteps from '@/api/server/schedules/steps/getScheduleSteps.ts';
import triggerSchedule from '@/api/server/schedules/triggerSchedule.ts';
import updateSchedule from '@/api/server/schedules/updateSchedule.ts';
import Badge from '@/elements/Badge.tsx';
import Button from '@/elements/Button.tsx';
import { ServerCan } from '@/elements/Can.tsx';
import Card from '@/elements/Card.tsx';
import ContextMenu, { ContextMenuProvider } from '@/elements/ContextMenu.tsx';
import ServerContentContainer from '@/elements/containers/ServerContentContainer.tsx';
import Spinner from '@/elements/Spinner.tsx';
import Tooltip from '@/elements/Tooltip.tsx';
import { formatDateTime } from '@/lib/time.ts';
import { useToast } from '@/providers/ToastProvider.tsx';
import { useServerStore } from '@/stores/server.ts';
import ScheduleCreateOrUpdateModal from './modals/ScheduleCreateOrUpdateModal.tsx';
import ActionStep from './renderers/ActionStep.tsx';
import DetailCard from './renderers/DetailCard.tsx';
import TriggerCard from './renderers/TriggerCard.tsx';
import SchedulePreConditionBuilder from './SchedulePreConditionBuilder.tsx';
import StepsEditor from './StepsEditor.tsx';

export default function ScheduleView() {
  const params = useParams<'id'>();
  const { addToast } = useToast();
  const { server, schedule, setSchedule, runningScheduleSteps, scheduleSteps, setScheduleSteps } = useServerStore();

  const [openModal, setOpenModal] = useState<'actions' | 'update' | null>(null);
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setDate(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (params.id) {
      getSchedule(server.uuid, params.id).then(setSchedule);
      getScheduleSteps(server.uuid, params.id).then(setScheduleSteps);
    }
  }, [params.id]);

  const doTriggerSchedule = (skipCondition: boolean) => {
    if (params.id) {
      setLoading(true);

      triggerSchedule(server.uuid, params.id, skipCondition)
        .then(() => {
          addToast('Schedule triggered.', 'success');
        })
        .finally(() => setLoading(false));
    }
  };

  const doUpdate = () => {
    if (params.id) {
      setLoading(true);

      updateSchedule(server.uuid, params.id, { condition: schedule!.condition })
        .then(() => {
          addToast('Schedule updated.', 'success');
        })
        .finally(() => setLoading(false));
    }
  };

  if (!schedule || !scheduleSteps) {
    return (
      <div className='w-full'>
        <Spinner.Centered />
      </div>
    );
  }

  return (
    <ServerContentContainer title='Schedule' hideTitleComponent>
      <ScheduleCreateOrUpdateModal
        propSchedule={schedule}
        onScheduleUpdate={(s) => setSchedule({ ...schedule, ...s })}
        opened={openModal === 'update'}
        onClose={() => setOpenModal(null)}
      />

      <Stack gap='lg'>
        <Group justify='space-between'>
          <Group gap='md'>
            <Title order={1} c='white'>
              {schedule.name}
            </Title>
            <Badge color={schedule.enabled ? 'green' : 'red'} size='lg'>
              {schedule.enabled ? 'Active' : 'Inactive'}
            </Badge>
          </Group>

          <ServerCan action='schedules.update'>
            <Group>
              {scheduleSteps.length > 0 && (
                <ContextMenuProvider>
                  <ContextMenu
                    items={[
                      {
                        icon: faPlayCircle,
                        label: 'Trigger (do not skip condition)',
                        onClick: () => doTriggerSchedule(false),
                        color: 'gray',
                      },
                      {
                        icon: faPlay,
                        label: 'Trigger (skip condition)',
                        onClick: () => doTriggerSchedule(true),
                        color: 'gray',
                      },
                    ]}
                  >
                    {({ openMenu }) =>
                      schedule.enabled ? (
                        <Button
                          loading={loading}
                          onClick={(e) => {
                            e.stopPropagation();
                            const rect = e.currentTarget.getBoundingClientRect();
                            openMenu(rect.left, rect.bottom);
                          }}
                          color='green'
                          rightSection={<FontAwesomeIcon icon={faChevronDown} />}
                        >
                          Trigger
                        </Button>
                      ) : (
                        <Tooltip label='Cannot Trigger disabled schedule'>
                          <Button
                            disabled
                            onClick={(e) => {
                              e.stopPropagation();
                              const rect = e.currentTarget.getBoundingClientRect();
                              openMenu(rect.left, rect.bottom);
                            }}
                            color='green'
                            rightSection={<FontAwesomeIcon icon={faChevronDown} />}
                          >
                            Trigger
                          </Button>
                        </Tooltip>
                      )
                    }
                  </ContextMenu>
                </ContextMenuProvider>
              )}
              <Button
                onClick={() => setOpenModal('update')}
                color='blue'
                leftSection={<FontAwesomeIcon icon={faPencil} />}
              >
                Edit
              </Button>
            </Group>
          </ServerCan>
        </Group>

        <div className='flex flex-row space-x-2'>
          <DetailCard
            icon={<FontAwesomeIcon icon={faClockRotateLeft} />}
            label='Last Run'
            value={schedule.lastRun ? formatDateTime(schedule.lastRun) : 'Never'}
            color='blue'
          />
          <DetailCard
            icon={<FontAwesomeIcon icon={faExclamationTriangle} />}
            label='Last Failure'
            value={schedule.lastFailure ? formatDateTime(schedule.lastFailure) : 'None'}
            color={schedule.lastFailure ? 'red' : 'green'}
          />
        </div>

        <Tabs defaultValue='actions'>
          <Tabs.List>
            <Tabs.Tab value='actions'>Actions</Tabs.Tab>
            <Tabs.Tab value='conditions'>Conditions</Tabs.Tab>
            <Tabs.Tab value='triggers'>Triggers</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value='actions' pt='md'>
            <Card p='lg'>
              <Group justify='space-between'>
                <Title order={3} mb='md'>
                  Schedule Actions
                </Title>
                <ServerCan action='schedules.update'>
                  <Group>
                    <Button
                      onClick={() => setOpenModal(openModal === 'actions' ? null : 'actions')}
                      variant='outline'
                      leftSection={<FontAwesomeIcon icon={openModal === 'actions' ? faReply : faPencil} />}
                    >
                      {openModal === 'actions' ? 'Exit Editor' : 'Edit'}
                    </Button>
                  </Group>
                </ServerCan>
              </Group>
              {openModal === 'actions' ? (
                <StepsEditor schedule={schedule} />
              ) : scheduleSteps.length === 0 ? (
                <Alert icon={<FontAwesomeIcon icon={faExclamationTriangle} />} color='yellow'>
                  No actions configured for this schedule
                </Alert>
              ) : (
                <Timeline
                  active={
                    scheduleSteps.findIndex((step) => step.uuid === runningScheduleSteps.get(schedule.uuid)) ?? -1
                  }
                  color='blue'
                  bulletSize={40}
                  lineWidth={2}
                >
                  {scheduleSteps.map((step) => (
                    <ActionStep
                      key={step.uuid}
                      step={step}
                      isActive={step.uuid === runningScheduleSteps.get(schedule.uuid)}
                    />
                  ))}
                </Timeline>
              )}
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value='conditions' pt='md'>
            <Card p='lg'>
              <Title order={3} mb='md'>
                Execution Pre-Conditions
              </Title>
              <SchedulePreConditionBuilder
                condition={schedule.condition}
                onChange={(condition) => setSchedule({ ...schedule, condition })}
              />

              <ServerCan action='schedules.update'>
                <div className='flex flex-row mt-6'>
                  <Button loading={loading} onClick={doUpdate}>
                    Update
                  </Button>
                </div>
              </ServerCan>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value='triggers' pt='md'>
            <Card p='lg'>
              <Title order={3} mb='md'>
                Schedule Triggers
              </Title>
              {schedule.triggers.length === 0 ? (
                <Alert icon={<FontAwesomeIcon icon={faExclamationTriangle} />} color='yellow'>
                  No triggers configured for this schedule
                </Alert>
              ) : (
                <Stack gap='md'>
                  {schedule.triggers.map((trigger, index) => (
                    <TriggerCard key={index} date={date} timezone={server.timezone || 'UTC'} trigger={trigger} />
                  ))}
                </Stack>
              )}
            </Card>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </ServerContentContainer>
  );
}
