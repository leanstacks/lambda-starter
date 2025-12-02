import { randomUUID } from 'crypto';
import { PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

import { CreateTaskDto } from '../models/create-task-dto.js';
import { Task, TaskItem, TaskKeys, toTask } from '../models/task.js';
import { config } from '../utils/config.js';
import { dynamoDocClient } from '../utils/dynamodb-client.js';
import { logger } from '../utils/logger.js';

/**
 * Retrieves all tasks from the DynamoDB table
 * @returns Promise that resolves to an array of Task objects
 * @throws Error if the DynamoDB scan operation fails
 */
export const listTasks = async (): Promise<Task[]> => {
  logger.info('[TaskService] > listTasks', { tableName: config.TASKS_TABLE });

  try {
    const command = new ScanCommand({
      TableName: config.TASKS_TABLE,
    });
    logger.debug('[TaskService] listTasks - ScanCommand', { command });

    const response = await dynamoDocClient.send(command);

    const taskItems = (response.Items as TaskItem[]) ?? [];
    const tasks = taskItems.map(toTask);

    logger.info('[TaskService] < listTasks - successfully retrieved tasks', {
      count: tasks.length,
      scannedCount: response.ScannedCount,
    });

    return tasks;
  } catch (error) {
    logger.error('[TaskService] < listTasks - failed to fetch tasks from DynamoDB', error as Error, {
      tableName: config.TASKS_TABLE,
    });
    throw error;
  }
};

/**
 * Creates a new task in the DynamoDB table
 * @param createTaskDto - The data for the new task
 * @returns Promise that resolves to the created Task object
 * @throws Error if the DynamoDB put operation fails
 */
export const createTask = async (createTaskDto: CreateTaskDto): Promise<Task> => {
  logger.info('[TaskService] > createTask', { tableName: config.TASKS_TABLE });

  try {
    const id = randomUUID();
    const now = new Date().toISOString();

    const taskItem: TaskItem = {
      pk: TaskKeys.pk(id),
      id,
      title: createTaskDto.title,
      ...(createTaskDto.detail && { detail: createTaskDto.detail }),
      ...(createTaskDto.dueAt && { dueAt: createTaskDto.dueAt }),
      isComplete: createTaskDto.isComplete ?? false,
      createdAt: now,
      updatedAt: now,
    };

    const command = new PutCommand({
      TableName: config.TASKS_TABLE,
      Item: taskItem,
    });
    logger.debug('[TaskService] createTask - PutCommand', { command });

    await dynamoDocClient.send(command);

    const task = toTask(taskItem);

    logger.info('[TaskService] < createTask - successfully created task', {
      id: task.id,
    });

    return task;
  } catch (error) {
    logger.error('[TaskService] < createTask - failed to create task in DynamoDB', error as Error, {
      tableName: config.TASKS_TABLE,
    });
    throw error;
  }
};
