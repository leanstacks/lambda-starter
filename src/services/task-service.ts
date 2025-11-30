import { ScanCommand } from '@aws-sdk/lib-dynamodb';

import { Task } from '../models/task.js';
import { config } from '../utils/config.js';
import { dynamoDocClient } from '../utils/dynamodb-client.js';
import { logger } from '../utils/logger.js';

/**
 * Retrieves all tasks from the DynamoDB table
 * @returns Promise that resolves to an array of Task objects
 * @throws Error if the DynamoDB scan operation fails
 */
export const listTasks = async (): Promise<Task[]> => {
  logger.info('Fetching all tasks from DynamoDB', { tableName: config.TASKS_TABLE });

  try {
    const command = new ScanCommand({
      TableName: config.TASKS_TABLE,
    });

    const response = await dynamoDocClient.send(command);

    logger.info('Successfully retrieved tasks', {
      count: response.Items?.length ?? 0,
      scannedCount: response.ScannedCount,
    });

    return (response.Items as Task[]) ?? [];
  } catch (error) {
    logger.error('Failed to fetch tasks from DynamoDB', error as Error, {
      tableName: config.TASKS_TABLE,
    });
    throw error;
  }
};
