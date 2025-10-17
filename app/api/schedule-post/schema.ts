import { z } from 'zod';

const validIntervalUnits = ['hours', 'days', 'weeks'] as const;

export const schedulePostSchema = z.object({
  scheduleType: z.enum(['daily', 'custom']),
  intervalValue: z.number().optional(),
  intervalUnit: z.enum(validIntervalUnits).optional(),
  timeOfDay: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { 
    message: "Invalid time format, expected HH:MM" 
  }),
  timeZoneId: z.string().min(1, { message: "Timezone ID is required" }),
}).superRefine((data, ctx) => {
  if (data.scheduleType === 'custom') {
    if (data.intervalValue === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Interval value is required for custom schedule',
        path: ['intervalValue'],
      });
    }
    if (data.intervalUnit === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Interval unit is required for custom schedule',
        path: ['intervalUnit'],
      });
    }
  }
});

export type SchedulePostData = z.infer<typeof schedulePostSchema>;
