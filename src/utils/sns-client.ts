import { MessageAttributeValue, PublishCommand, SNSClient } from '@aws-sdk/client-sns';

import { config } from './config';
import { logger } from './logger';

/**
 * SNS client instance for publishing messages to SNS topics.
 */
const _snsClient = new SNSClient({
  region: config.AWS_REGION,
});

/**
 * Interface for SNS message attributes.
 */
export interface MessageAttributes {
  [key: string]: MessageAttributeValue;
}

/**
 * Publishes a message to an SNS topic.
 * @param topicArn - The ARN of the SNS topic to publish to
 * @param message - The message content (will be converted to JSON string)
 * @param attributes - Optional message attributes for filtering
 * @returns Promise that resolves to the message ID
 * @throws Error if the SNS publish operation fails
 */
export const publishToTopic = async (
  topicArn: string,
  message: Record<string, unknown>,
  attributes?: MessageAttributes,
): Promise<string> => {
  logger.debug({ topicArn }, '[SnsClient] > publishToTopic');

  try {
    // Create the PublishCommand with the message and attributes
    const command = new PublishCommand({
      TopicArn: topicArn,
      Message: JSON.stringify(message),
      MessageAttributes: attributes,
    });

    logger.debug({ command }, '[SnsClient] publishToTopic - PublishCommand');

    // Send the publish command
    const response = await _snsClient.send(command);

    logger.debug(
      { topicArn, messageId: response.MessageId },
      '[SnsClient] < publishToTopic - successfully published message',
    );

    return response.MessageId ?? '';
  } catch (error) {
    // Handle publish errors
    logger.error(
      { error: error as Error, topicArn },
      '[SnsClient] < publishToTopic - failed to publish message to SNS',
    );
    throw error;
  }
};
