import pino from 'pino';
import { CloudwatchLogFormatter, pinoLambdaDestination, StructuredLogFormatter } from 'pino-lambda';

import { config } from './config';

/**
 * Initialize Pino Lambda destination
 * @see https://www.npmjs.com/package/pino-lambda#best-practices
 */
const _lambdaDestination = pinoLambdaDestination({
  formatter: config.LOGGING_FORMAT === 'json' ? new StructuredLogFormatter() : new CloudwatchLogFormatter(),
});

/**
 * Pino logger instance
 */
export const logger = pino(
  {
    enabled: config.LOGGING_ENABLED,
    level: config.LOGGING_LEVEL,
  },
  _lambdaDestination,
);
