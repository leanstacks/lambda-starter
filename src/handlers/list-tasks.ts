import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { listTasks } from '../services/task-service.js';
import { internalServerError, ok } from '../utils/apigateway-response.js';
import { logger } from '../utils/logger.js';

/**
 * Lambda handler for listing all tasks
 * Handles GET requests from API Gateway to retrieve all tasks from DynamoDB
 *
 * @param event - API Gateway proxy event
 * @returns API Gateway proxy result with list of tasks or error message
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing list tasks request', {
    requestId: event.requestContext.requestId,
    path: event.path,
    httpMethod: event.httpMethod,
  });

  try {
    const tasks = await listTasks();

    logger.info('Successfully retrieved tasks', {
      count: tasks.length,
      requestId: event.requestContext.requestId,
    });

    return ok(tasks);
  } catch (error) {
    logger.error('Failed to list tasks', error as Error, {
      requestId: event.requestContext.requestId,
    });

    return internalServerError('Failed to retrieve tasks');
  }
};
