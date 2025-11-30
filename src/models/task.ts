import { z } from 'zod';

/**
 * Zod schema for Task validation
 */
export const taskSchema = z.object({
  id: z.uuid('Task id must be a valid UUID'),
  title: z.string().min(1, 'Task title is required').max(100, 'Task title must not exceed 100 characters'),
  detail: z.string().max(1000, 'Task detail must not exceed 1000 characters').optional(),
  dueAt: z.iso.datetime('Task dueAt must be a valid ISO8601 timestamp').optional(),
  isComplete: z.boolean().default(false),
  createdAt: z.iso.datetime('Task createdAt must be a valid ISO8601 timestamp'),
  updatedAt: z.iso.datetime('Task updatedAt must be a valid ISO8601 timestamp'),
});

/**
 * Type representing a Task
 */
export type Task = z.infer<typeof taskSchema>;
