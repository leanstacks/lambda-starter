import { initializeSNSClient } from '@leanstacks/lambda-utils';
import { SNSClient } from '@aws-sdk/client-sns';

import { config } from './config.js';
import { logger } from './logger.js';

/**
 * SNS client configuration
 */
const snsClientConfig = {
  region: config.AWS_REGION,
  ...(config.USE_LOCALSTACK && {
    endpoint: config.LOCALSTACK_ENDPOINT,
    credentials: {
      accessKeyId: 'test',
      secretAccessKey: 'test',
    },
  }),
};

/**
 * Singleton SNS client configured with the application's region
 */
export const snsClient: SNSClient = initializeSNSClient(snsClientConfig);

logger.info({ snsClientConfig }, '[SNSClient] - Initialized AWS SNS client');

/**
 * Re-export utility functions from lambda-utils for convenience
 */
export { publishToTopic } from '@leanstacks/lambda-utils';
