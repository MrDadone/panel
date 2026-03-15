import { z } from 'zod';
import { StateCreator } from 'zustand';
import { getEmptyPaginationSet } from '@/api/axios.ts';
import { serverScheduleSchema, serverScheduleStepSchema } from '@/lib/schemas/server/schedules.ts';
import { ServerStore } from '@/stores/server.ts';

export interface SchedulesSlice {
  schedules: Pagination<z.infer<typeof serverScheduleSchema>>;
  runningScheduleSteps: Map<string, string | null>;

  setSchedules: (schedules: Pagination<z.infer<typeof serverScheduleSchema>>) => void;
  addSchedule: (schedule: z.infer<typeof serverScheduleSchema>) => void;
  removeSchedule: (schedule: z.infer<typeof serverScheduleSchema>) => void;
  setRunningScheduleStep: (schedule: string, step: string | null) => void;

  schedule: z.infer<typeof serverScheduleSchema> | null;
  scheduleSteps: z.infer<typeof serverScheduleStepSchema>[];

  setSchedule: (scheduleStep: z.infer<typeof serverScheduleSchema>) => void;
  setScheduleSteps: (scheduleSteps: z.infer<typeof serverScheduleStepSchema>[]) => void;
}

export const createSchedulesSlice: StateCreator<ServerStore, [], [], SchedulesSlice> = (set, get): SchedulesSlice => ({
  schedules: getEmptyPaginationSet<z.infer<typeof serverScheduleSchema>>(),
  runningScheduleSteps: new Map(),

  setSchedules: (value) => set((state) => ({ ...state, schedules: value })),
  addSchedule: (schedule) =>
    set((state) => ({
      schedules: {
        ...state.schedules,
        data: [...state.schedules.data, schedule],
        total: state.schedules.total + 1,
      },
    })),
  removeSchedule: (schedule) =>
    set((state) => ({
      schedules: {
        ...state.schedules,
        data: state.schedules.data.filter((s) => s.uuid !== schedule.uuid),
        total: state.schedules.total - 1,
      },
    })),
  setRunningScheduleStep: (schedule, step) =>
    set((state) => {
      state.runningScheduleSteps.set(schedule, step);

      return { ...state };
    }),

  schedule: null,
  scheduleSteps: [],

  setSchedule: (schedule) => set((state) => ({ ...state, schedule })),
  setScheduleSteps: (steps) => set((state) => ({ ...state, scheduleSteps: steps })),
});
