# Infrastructure

AWS CDK infrastructure for the lambda-starter project.

## Table of Contents

- [Overview](#overview)
- [What is AWS CDK?](#what-is-aws-cdk)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Available Commands](#available-commands)
- [Stacks](#stacks)
- [Resource Tagging](#resource-tagging)
- [Deployment](#deployment)
- [Testing](#testing)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [Additional Resources](#additional-resources)

## Overview

This directory contains the AWS CDK infrastructure code for deploying the lambda-starter application. The infrastructure is written in TypeScript and uses AWS CDK v2 for infrastructure as code.

The CDK application is designed to be environment-aware, supporting deployment to multiple environments (dev, qat, prd) with environment-specific configurations and safeguards.

## What is AWS CDK?

The AWS Cloud Development Kit (CDK) is an open-source software development framework for defining cloud infrastructure in code and provisioning it through AWS CloudFormation.

**Key Benefits:**

- **Familiar Languages**: Write infrastructure in TypeScript, Python, Java, or C#
- **Higher-Level Abstractions**: Use constructs that provide sensible defaults
- **Type Safety**: Catch errors at compile time
- **Reusability**: Share and reuse infrastructure components
- **Testing**: Write unit tests for your infrastructure

**How it Works:**

1. Write infrastructure code in TypeScript
2. CDK synthesizes CloudFormation templates
3. CloudFormation provisions AWS resources
4. Changes are deployed as stack updates

## Technology Stack

- **AWS CDK:** v2.178.0+
- **Language:** TypeScript 5.9+
- **Node.js:** v24+
- **Package Manager:** npm
- **Testing:** Jest
- **Validation:** Zod
- **AWS SDK:** v3

## Project Structure

```
/infrastructure
  /stacks
    data-stack.ts           # DynamoDB tables and data resources
    data-stack.test.ts      # Unit tests for data stack
  /utils
    config.ts               # Configuration management with Zod validation
    config.test.ts          # Unit tests for config
  app.ts                    # CDK application entry point
  cdk.json                  # CDK configuration and feature flags
  jest.config.ts            # Jest configuration
  jest.setup.ts             # Jest setup
  package.json              # Dependencies and scripts
  tsconfig.json             # TypeScript configuration
  .env                      # Local environment variables (not committed)
  .env.example              # Example environment configuration
  README.md                 # This file
```

## Prerequisites

Before you begin, ensure you have the following installed and configured:

1. **Node.js v24 or later**

   ```bash
   node --version  # Should be v24.x.x or higher
   ```

2. **AWS CLI** configured with appropriate credentials

   ```bash
   aws configure
   aws sts get-caller-identity  # Verify credentials
   ```

3. **AWS Account(s)** for target environment(s)
   - Separate accounts recommended for dev, qat, and prd
   - Appropriate IAM permissions to create resources

4. **CDK Bootstrap** (first-time setup per account/region)
   ```bash
   cdk bootstrap aws://ACCOUNT-ID/REGION
   ```

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and set the required variables:

```bash
# Required
CDK_ENV=dev

# Optional - Application name (default: lambda-starter)
# CDK_APP_NAME=my-app

# Optional - Override AWS credentials (uses CDK_DEFAULT_ACCOUNT/REGION from AWS CLI by default)
# CDK_ACCOUNT=123456789012
# CDK_REGION=us-east-1

# Optional - Resource tagging
# CDK_OU=leanstacks
# CDK_OWNER=team-name
```

**Important:** The `.env` file is excluded from version control. Never commit credentials or secrets.

### 3. Build the Infrastructure Code

```bash
npm run build
```

### 4. Run Tests

```bash
npm test
```

### 5. Synthesize CloudFormation Templates

```bash
npm run synth
```

This generates CloudFormation templates in the `cdk.out` directory. Review them to understand what will be deployed.

### 6. Deploy (Optional)

```bash
npm run deploy
```

## Configuration

### Environment Variables

All CDK configuration is managed through environment variables prefixed with `CDK_` to avoid conflicts with application code.

| Variable                  | Required | Description                                | Valid Values                     | Default                            |
| ------------------------- | -------- | ------------------------------------------ | -------------------------------- | ---------------------------------- |
| `CDK_APP_NAME`            | No       | Application name for stack naming and tags | Any string                       | `lambda-starter`                   |
| `CDK_ENV`                 | Yes      | Infrastructure environment                 | `dev`, `qat`, `prd`              | -                                  |
| `CDK_ACCOUNT`             | No       | Override AWS account ID                    | 12-digit account ID              | `CDK_DEFAULT_ACCOUNT` from AWS CLI |
| `CDK_REGION`              | No       | Override AWS region                        | Valid AWS region                 | `CDK_DEFAULT_REGION` from AWS CLI  |
| `CDK_OU`                  | No       | Organizational unit                        | Any string                       | `leanstacks`                       |
| `CDK_OWNER`               | No       | Team or owner name                         | Any string                       | `unknown`                          |
| `CDK_APP_LOGGING_ENABLED` | No       | Enable application logging                 | `true`, `false`                  | `true`                             |
| `CDK_APP_LOGGING_LEVEL`   | No       | Application logging level                  | `debug`, `info`, `warn`, `error` | `info`                             |
| `CDK_APP_LOGGING_FORMAT`  | No       | Application logging format                 | `text`, `json`                   | `json`                             |

### AWS Account and Region Resolution

The CDK automatically detects your AWS account and region from your AWS CLI configuration:

- **CDK_DEFAULT_ACCOUNT**: Set by CDK from your AWS credentials
- **CDK_DEFAULT_REGION**: Set by CDK from your AWS profile

You can override these by setting `CDK_ACCOUNT` and `CDK_REGION` in your `.env` file.

### Configuration Validation

Configuration is validated using Zod at synthesis time. Invalid configurations will fail with descriptive error messages:

```bash
# Missing CDK_ENV
Error: CDK configuration validation failed: CDK_ENV: Required

# Invalid CDK_ENV value
Error: CDK configuration validation failed: CDK_ENV: CDK_ENV must be one of: dev, qat, prd
```

## Available Commands

| Command                 | Description                                             |
| ----------------------- | ------------------------------------------------------- |
| `npm run build`         | Compile TypeScript to JavaScript (outputs to `cdk.out`) |
| `npm run clean`         | Remove build artifacts and coverage reports             |
| `npm test`              | Run unit tests                                          |
| `npm run test:coverage` | Run tests with coverage report                          |
| `npm run test:watch`    | Run tests in watch mode                                 |
| `npm run synth`         | Synthesize CloudFormation templates                     |
| `npm run cdk <command>` | Run any CDK CLI command                                 |
| `npm run deploy`        | Deploy all stacks to AWS                                |
| `npm run diff`          | Show differences between deployed and local             |
| `npm run destroy`       | Destroy deployed stacks                                 |

### Common CDK Commands

```bash
# List all stacks
npm run cdk list

# Show differences for a specific stack
npm run cdk diff LambdaStarterDataStack-dev

# Deploy a specific stack
npm run cdk deploy LambdaStarterDataStack-dev

# View stack outputs
npm run cdk list --long

# Destroy all stacks
npm run cdk destroy --all
```

## Stacks

### Data Stack

**Purpose:** Manages DynamoDB tables and data-related resources.

**Stack Name:** `lambda-starter-data-{env}` (e.g., `lambda-starter-data-dev`)

**Resources:**

- **Task Table** (`task-{env}`)
  - Partition Key: `id` (String)
  - Billing Mode: Pay-per-request (on-demand)
  - Encryption: AWS managed (SSE)
  - Point-in-time Recovery: Enabled for `prd` only
  - Removal Policy:
    - `RETAIN` for `prd` (table preserved on stack deletion)
    - `DESTROY` for other environments (table deleted on stack deletion)

**Outputs:**

- `TaskTableName`: The DynamoDB table name (exported as `{env}-task-table-name`)
- `TaskTableArn`: The DynamoDB table ARN (exported as `{env}-task-table-arn`)

### Lambda Stack

**Purpose:** Manages Lambda functions, API Gateway, and application runtime resources.

**Stack Name:** `lambda-starter-lambda-{env}` (e.g., `lambda-starter-lambda-dev`)

**Resources:**

- **List Tasks Function** (`list-tasks-{env}`)
  - Runtime: Node.js 24.x
  - Memory: 256 MB
  - Timeout: 10 seconds
  - Handler: Retrieves all tasks from DynamoDB
  - IAM Permissions: Read access to Task table (Scan)

- **Get Task Function** (`get-task-{env}`)
  - Runtime: Node.js 24.x
  - Memory: 256 MB
  - Timeout: 10 seconds
  - Handler: Retrieves a single task by ID
  - IAM Permissions: Read access to Task table (GetItem)

- **Create Task Function** (`create-task-{env}`)
  - Runtime: Node.js 24.x
  - Memory: 256 MB
  - Timeout: 10 seconds
  - Handler: Creates a new task in DynamoDB
  - IAM Permissions: Write access to Task table (PutItem)

- **Update Task Function** (`update-task-{env}`)
  - Runtime: Node.js 24.x
  - Memory: 256 MB
  - Timeout: 10 seconds
  - Handler: Updates an existing task in DynamoDB
  - IAM Permissions: Read-write access to Task table (GetItem, UpdateItem)

- **Delete Task Function** (`delete-task-{env}`)
  - Runtime: Node.js 24.x
  - Memory: 256 MB
  - Timeout: 10 seconds
  - Handler: Deletes an existing task from DynamoDB
  - IAM Permissions: Read-write access to Task table (DeleteItem)

**Common Lambda Configuration:**

- Log Format: JSON (structured logging)
- Log Retention:
  - `prd`: 30 days
  - Other environments: 7 days
- Log Removal Policy:
  - `prd`: `RETAIN` (logs preserved on stack deletion)
  - Other environments: `DESTROY` (logs deleted on stack deletion)

- **Lambda Starter API** (`lambda-starter-api-{env}`)
  - Type: REST API
  - Endpoints:
    - `GET /tasks` - List all tasks
    - `GET /tasks/{taskId}` - Get a specific task
    - `POST /tasks` - Create a new task
    - `PUT /tasks/{taskId}` - Update an existing task
    - `DELETE /tasks/{taskId}` - Delete an existing task
  - CORS: Enabled with preflight OPTIONS support
  - Throttling: Rate and burst limits configured
  - Stage: `{env}` (e.g., `dev`, `prd`)

**Outputs:**

- `ApiUrl`: The API Gateway endpoint URL
- `ApiId`: The API Gateway ID
- `ListTasksFunctionArn`: The List Tasks Lambda function ARN
- `GetTaskFunctionArn`: The Get Task Lambda function ARN
- `CreateTaskFunctionArn`: The Create Task Lambda function ARN
- `UpdateTaskFunctionArn`: The Update Task Lambda function ARN
- `DeleteTaskFunctionArn`: The Delete Task Lambda function ARN

**Logging Configuration:**

The Lambda stack uses the `CDK_APP_LOGGING_ENABLED`, `CDK_APP_LOGGING_LEVEL`, and `CDK_APP_LOGGING_FORMAT` environment variables to configure application logging:

- **CDK_APP_LOGGING_ENABLED**: Controls whether logging is enabled in the Lambda functions
- **CDK_APP_LOGGING_LEVEL**: Sets the minimum log level (`debug`, `info`, `warn`, `error`)
- **CDK_APP_LOGGING_FORMAT**: Sets the log output format (`text` or `json`)

These values are passed to the Lambda functions as environment variables (`LOGGING_ENABLED`, `LOGGING_LEVEL`, and `LOGGING_FORMAT`) and control both CloudWatch log output and application-level logging behavior.

**Log Format Options:**

- **json** (default): Structured JSON logs ideal for CloudWatch Logs Insights and log aggregation tools. Each log entry is a JSON object with fields like `timestamp`, `level`, `message`, and any additional context fields.
- **text**: Human-readable text format with timestamp, level, and message. Context is stringified and appended to the message.

## Resource Tagging

All resources are automatically tagged for cost allocation, compliance, and management:

| Tag     | Description         | Example Value       | Source                              |
| ------- | ------------------- | ------------------- | ----------------------------------- |
| `App`   | Application name    | `lambda-starter`    | `CDK_APP_NAME` environment variable |
| `Env`   | Environment         | `dev`, `qat`, `prd` | `CDK_ENV` environment variable      |
| `OU`    | Organizational unit | `leanstacks`        | `CDK_OU` environment variable       |
| `Owner` | Team or owner       | `platform-team`     | `CDK_OWNER` environment variable    |

Tags are applied at the app level and automatically inherited by all stacks and resources.

## Deployment

### Deploy to Development

```bash
# Ensure .env is configured for dev
echo "CDK_ENV=dev" > .env

# Review what will be deployed
npm run synth

# Deploy
npm run deploy
```

### Deploy to Production

```bash
# Configure for production
cat > .env << EOF
CDK_ENV=prd
CDK_ACCOUNT=123456789012
CDK_REGION=us-east-1
CDK_OU=leanstacks
CDK_OWNER=platform-team
EOF

# Review changes
npm run diff

# Deploy with manual approval
npm run deploy
```

### CI/CD Deployment

For automated deployments, set environment variables directly:

```bash
export CDK_ENV=prd
export CDK_ACCOUNT=123456789012
export CDK_REGION=us-east-1

npm run deploy -- --require-approval never
```

## Testing

### Unit Tests

Run all unit tests:

```bash
npm test
```

### Test Coverage

Generate a coverage report:

```bash
npm run test:coverage
```

Coverage reports are generated in the `coverage` directory and can be viewed in your browser:

```bash
open coverage/lcov-report/index.html
```

### Watch Mode

Run tests in watch mode for development:

```bash
npm run test:watch
```

### What is Tested?

- **Configuration Validation**: Ensures environment variables are properly validated
- **Stack Resources**: Verifies correct resource creation and properties
- **Environment-Specific Logic**: Tests different behaviors for dev vs prd
- **Tagging**: Confirms all resources are properly tagged

## Best Practices

### Security

1. **Never commit secrets**: Use `.env` for local configuration only
2. **Use AWS Secrets Manager**: Store sensitive values in AWS Secrets Manager or SSM Parameter Store
3. **Least privilege**: Grant only necessary IAM permissions
4. **Enable encryption**: All data at rest should be encrypted
5. **Separate accounts**: Use different AWS accounts for each environment

### Development

1. **Test before deploying**: Always run `npm test` before deployment
2. **Review diffs**: Use `npm run diff` to review changes before applying
3. **Use descriptive names**: Follow naming conventions for resources
4. **Document changes**: Update README when adding new stacks or resources
5. **Type safety**: Leverage TypeScript for compile-time error detection

### Operations

1. **Tag everything**: Ensure all resources have proper tags
2. **Monitor costs**: Use cost allocation tags to track spending
3. **Backup production**: Enable point-in-time recovery for critical databases
4. **Retain production resources**: Use `RETAIN` removal policy for production
5. **Version control**: Commit infrastructure changes to source control

## Troubleshooting

### Configuration Validation Errors

**Problem:** `CDK configuration validation failed`

**Solutions:**

1. Verify `.env` file exists in the infrastructure directory
2. Check that `CDK_ENV` is set to a valid value (`dev`, `qat`, `prd`)
3. Ensure all required variables are set

### TypeScript Compilation Errors

**Problem:** Build fails with TypeScript errors

**Solutions:**

1. Ensure dependencies are installed: `npm install`
2. Verify Node.js version: `node --version` (should be v24+)
3. Check for syntax errors in TypeScript files
4. Clean and rebuild: `npm run clean && npm run build`

### Deployment Failures

**Problem:** Stack deployment fails

**Solutions:**

1. Verify AWS credentials: `aws sts get-caller-identity`
2. Check account and region: Ensure `CDK_ACCOUNT` and `CDK_REGION` match your AWS profile
3. Confirm IAM permissions: Verify you have necessary permissions
4. Review CloudFormation events in AWS Console for detailed error messages
5. Check for resource naming conflicts

### CDK Bootstrap Issues

**Problem:** `This stack requires bootstrap stack version X`

**Solution:**

```bash
cdk bootstrap aws://ACCOUNT-ID/REGION --force
```

### Node Version Warnings

**Problem:** Warning about untested Node.js version

**Solution:**

```bash
export JSII_SILENCE_WARNING_UNTESTED_NODE_VERSION=1
```

Or use a supported Node.js version (22.x or 20.x).

## Additional Resources

### AWS CDK Documentation

- [AWS CDK Developer Guide](https://docs.aws.amazon.com/cdk/latest/guide/)
- [AWS CDK API Reference](https://docs.aws.amazon.com/cdk/api/v2/)
- [CDK Workshop](https://cdkworkshop.com/)
- [CDK Patterns](https://cdkpatterns.com/)

### Best Practices

- [CDK Best Practices](https://docs.aws.amazon.com/cdk/latest/guide/best-practices.html)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Infrastructure as Code Best Practices](https://docs.aws.amazon.com/prescriptive-guidance/latest/infrastructure-as-code/welcome.html)

### Community

- [AWS CDK GitHub](https://github.com/aws/aws-cdk)
- [CDK Slack Channel](https://cdk.dev)
- [AWS Developer Forums](https://forums.aws.amazon.com/forum.jspa?forumID=351)

---

For questions or issues, please contact the platform team or open an issue in the repository.
