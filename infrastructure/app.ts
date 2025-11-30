#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';

import { getConfig, getEnvironmentConfig, getTags } from './utils/config';
import { DataStack } from './stacks/data-stack';

// Load and validate configuration
const config = getConfig();

// Create CDK app
const app = new cdk.App();

// Get standard tags
const tags = getTags(config);

// Get AWS environment configuration
const environmentConfig = getEnvironmentConfig(config);

// Create Data Stack
new DataStack(app, `${config.CDK_APP_NAME}-data-stack-${config.CDK_ENV}`, {
  envName: config.CDK_ENV,
  stackName: `${config.CDK_APP_NAME}-data-${config.CDK_ENV}`,
  description: `Data resources for ${config.CDK_APP_NAME} (${config.CDK_ENV})`,
  ...(environmentConfig && { env: environmentConfig }),
});

// Apply tags to all stacks in the app
Object.entries(tags).forEach(([key, value]) => {
  cdk.Tags.of(app).add(key, value);
});
