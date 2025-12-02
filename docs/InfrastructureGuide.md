# Infrastructure Guide

A comprehensive guide to AWS Cloud Development Kit (CDK) and the infrastructure implementation for the lambda-starter project.

## Table of Contents

- [Introduction to AWS CDK](#introduction-to-aws-cdk)
- [Why CDK?](#why-cdk)
- [CDK Concepts](#cdk-concepts)
- [Project Infrastructure](#project-infrastructure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Infrastructure Resources](#infrastructure-resources)
- [Stack Management](#stack-management)
- [Commands Reference](#commands-reference)
- [Deployment Guide](#deployment-guide)
- [Testing Infrastructure](#testing-infrastructure)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)
- [Additional Resources](#additional-resources)

---

## Introduction to AWS CDK

The AWS Cloud Development Kit (CDK) is an open-source software development framework for defining cloud infrastructure using familiar programming languages. Rather than writing JSON or YAML templates, you write code in TypeScript, Python, Java, or other supported languages.

### What is Infrastructure as Code?

Infrastructure as Code (IaC) is the practice of managing and provisioning infrastructure through code rather than manual processes. This approach:

- **Increases consistency**: Same code produces identical infrastructure
- **Enables version control**: Track changes over time
- **Facilitates collaboration**: Multiple developers can work together
- **Speeds up deployment**: Automated provisioning reduces errors
- **Improves documentation**: Code serves as living documentation

### CDK vs CloudFormation

While CDK ultimately generates CloudFormation templates, it offers several advantages:

| Feature        | CloudFormation (YAML/JSON)  | AWS CDK                             |
| -------------- | --------------------------- | ----------------------------------- |
| Language       | YAML or JSON                | TypeScript, Python, Java, C#, Go    |
| Type Safety    | None                        | Compile-time checking               |
| Code Reuse     | Limited (via nested stacks) | Full programming language features  |
| Testing        | Manual validation           | Unit tests with Jest, PyTest, etc.  |
| Abstractions   | Low-level resources         | High-level constructs with defaults |
| Learning Curve | CloudFormation-specific     | Use existing programming skills     |

### How CDK Works

```
┌─────────────────┐
│  CDK Code (TS)  │
│   app.ts        │
└────────┬────────┘
         │
         ▼
   ┌─────────────┐
   │ cdk synth   │
   └──────┬──────┘
          │
          ▼
┌──────────────────┐
│  CloudFormation  │
│    Template      │
└────────┬─────────┘
         │
         ▼
   ┌─────────────┐
   │ cdk deploy  │
   └──────┬──────┘
          │
          ▼
┌──────────────────┐
│  AWS Resources   │
│ (DynamoDB, etc.) │
└──────────────────┘
```

1. **Write** infrastructure code in TypeScript
2. **Synthesize** CloudFormation templates using `cdk synth`
3. **Deploy** to AWS using `cdk deploy`
4. **Update** by modifying code and redeploying

---

## Why CDK?

### Benefits for This Project

1. **Type Safety**: TypeScript catches errors at compile time
2. **Testability**: Unit tests ensure infrastructure correctness
3. **Reusability**: Share constructs across multiple stacks
4. **Maintainability**: Clear, readable code vs. verbose YAML
5. **Productivity**: Less boilerplate, more functionality
6. **Integration**: Seamless integration with application code

### When to Use CDK

CDK is ideal when:

- You want to use programming languages for infrastructure
- Your team has development experience
- You need complex, conditional infrastructure
- You want to write unit tests for infrastructure
- You need to create reusable infrastructure components

### When Not to Use CDK

Consider alternatives when:

- Your team prefers declarative YAML/JSON
- You're using simple, static infrastructure
- You need multi-cloud support (consider Terraform)
- You have significant investment in existing CloudFormation

---

## CDK Concepts

### Constructs

Constructs are the basic building blocks of CDK applications. There are three levels:

**L1 Constructs (CloudFormation Resources)**

- Direct mapping to CloudFormation resources
- Named with `Cfn` prefix (e.g., `CfnBucket`)
- Require all properties to be specified

**L2 Constructs (AWS Constructs)**

- Higher-level, opinionated abstractions
- Provide sensible defaults
- Example: `Table` for DynamoDB

**L3 Constructs (Patterns)**

- Multi-resource patterns
- Represent common architectures
- Example: `ApplicationLoadBalancedFargateService`

### Stacks

A **Stack** is a unit of deployment. It maps to a CloudFormation stack and contains a group of related resources.

```typescript
export class DataStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    // Resources defined here
  }
}
```

### Apps

An **App** is the root construct that contains one or more stacks.

```typescript
const app = new cdk.App();
new DataStack(app, 'DataStack-dev');
```

### Environments

Environments specify the AWS account and region where stacks are deployed:

```typescript
{
  env: {
    account: '123456789012',
    region: 'us-east-1'
  }
}
```

---

## Project Infrastructure

### Architecture Overview

The lambda-starter infrastructure uses a modular, environment-aware design:

```
┌─────────────────────────────────────────┐
│           CDK Application               │
│                                         │
│  ┌────────────────────────────────────┐ │
│  │        Configuration Layer         │ │
│  │  • Environment Variables (.env)    │ │
│  │  • Zod Validation                  │ │
│  │  • AWS Account/Region Resolution   │ │
│  │  • Logging Configuration           │ │
│  └────────────────────────────────────┘ │
│                                         │
│  ┌────────────────────────────────────┐ │
│  │          Data Stack                │ │
│  │  • DynamoDB Tables                 │ │
│  │  • Environment-specific configs    │ │
│  │  • Resource tagging                │ │
│  └────────────────────────────────────┘ │
│                                         │
│  ┌────────────────────────────────────┐ │
│  │         Lambda Stack               │ │
│  │  • Lambda Functions                │ │
│  │  • API Gateway REST API            │ │
│  │  • CloudWatch Logs (JSON format)   │ │
│  │  • Environment-specific retention  │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Design Principles

1. **Environment Isolation**: Separate AWS accounts per environment
2. **Configuration Validation**: Zod ensures correct configuration
3. **Resource Tagging**: All resources tagged for cost allocation
4. **Type Safety**: TypeScript prevents configuration errors
5. **Testability**: Unit tests validate infrastructure logic
6. **Modularity**: Separate stacks for different resource types

### Technology Stack

- **AWS CDK**: https://docs.aws.amazon.com/cdk/api/v2/
- **TypeScript**: https://www.typescriptlang.org/
- **Node.js**: https://nodejs.org/
- **Testing**: https://jestjs.io/
- **Validation**: https://zod.dev/

---

## Getting Started

### Prerequisites

1. **Node.js v24+** installed

   ```bash
   node --version
   ```

2. **AWS CLI** configured

   ```bash
   aws configure
   aws sts get-caller-identity
   ```

3. **AWS CDK** installed globally (optional)

   ```bash
   npm install -g aws-cdk
   ```

4. **Bootstrap CDK** (once per account/region)
   ```bash
   cdk bootstrap aws://ACCOUNT-ID/REGION
   ```

### Initial Setup

1. **Navigate to infrastructure directory**

   ```bash
   cd infrastructure
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**

   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

4. **Build the project**

   ```bash
   npm run build
   ```

5. **Run tests**

   ```bash
   npm test
   ```

6. **Synthesize CloudFormation**
   ```bash
   npm run synth
   ```

---

## Configuration

### Environment Variables

All configuration is managed through environment variables prefixed with `CDK_`:

| Variable                 | Required | Description                | Default          |
| ------------------------ | -------- | -------------------------- | ---------------- |
| `CDK_APP_NAME`           | No       | Application name           | `lambda-starter` |
| `CDK_ENV`                | Yes      | Environment                | -                |
| `CDK_ACCOUNT`            | No       | AWS account ID override    | From AWS CLI     |
| `CDK_REGION`             | No       | AWS region override        | From AWS CLI     |
| `CDK_OU`                 | No       | Organizational unit        | `leanstacks`     |
| `CDK_OWNER`              | No       | Resource owner             | `unknown`        |
| `CDK_APP_ENABLE_LOGGING` | No       | Enable application logging | `true`           |
| `CDK_APP_LOGGING_LEVEL`  | No       | Application logging level  | `info`           |
| `CDK_APP_LOGGING_FORMAT` | No       | Application logging format | `json`           |

### Configuration Validation

Configuration is validated using Zod schemas. Invalid configurations fail at synthesis time with descriptive errors.

### AWS Account Resolution

The CDK automatically detects AWS credentials:

- **CDK_DEFAULT_ACCOUNT**: From your AWS profile
- **CDK_DEFAULT_REGION**: From your AWS profile

Override by setting `CDK_ACCOUNT` and `CDK_REGION` in `.env`.

### Environment-Specific Configuration

Each environment can have different settings:

**Development (dev)**

- Pay-per-request billing
- No point-in-time recovery
- `DESTROY` removal policy

**Production (prd)**

- Pay-per-request billing
- Point-in-time recovery enabled
- `RETAIN` removal policy

---

## Infrastructure Resources

### Data Stack

**Purpose**: Manages DynamoDB tables and data-related resources.

**Stack Naming**: `{app-name}-data-{env}` (e.g., `lambda-starter-data-dev`)

#### Task Table

**Resource Type**: DynamoDB Table

**Configuration**:

- **Table Name**: `{app-name}-task-{env}`
- **Partition Key**: `pk` (String)
- **Billing Mode**: Pay-per-request (on-demand)
- **Encryption**: AWS managed (SSE)
- **Point-in-time Recovery**: Enabled for `prd` only
- **Removal Policy**:
  - `RETAIN` for `prd` (preserved on deletion)
  - `DESTROY` for `dev`/`qat` (deleted on deletion)

**Outputs**:

- `TaskTableName`: Table name (exported as `{env}-task-table-name`)
- `TaskTableArn`: Table ARN (exported as `{env}-task-table-arn`)

**Usage Example**:

```typescript
// Reference in Lambda code
const tableName = process.env.TASK_TABLE_NAME;
```

### Lambda Stack

**Purpose**: Manages Lambda functions, API Gateway, and application runtime resources.

**Stack Naming**: `{app-name}-lambda-{env}` (e.g., `lambda-starter-lambda-dev`)

#### List Tasks Function

**Resource Type**: AWS Lambda Function

**Configuration**:

- **Function Name**: `{app-name}-list-tasks-{env}`
- **Runtime**: Node.js 24.x
- **Handler**: `handler` (bundled with esbuild)
- **Memory**: 256 MB
- **Timeout**: 10 seconds
- **Log Format**: JSON (structured logging)
- **Bundling**: Automatic TypeScript compilation with esbuild
- **Environment Variables**:
  - `TASKS_TABLE`: DynamoDB table name
  - `ENABLE_LOGGING`: Logging enabled flag (from `CDK_APP_ENABLE_LOGGING`)
  - `LOG_LEVEL`: Minimum log level (from `CDK_APP_LOGGING_LEVEL`)
  - `LOG_FORMAT`: Log output format (from `CDK_APP_LOGGING_FORMAT`)

**CloudWatch Logs**:

- **Log Group**: `/aws/lambda/{app-name}-list-tasks-{env}`
- **Log Retention**:
  - `prd`: 30 days
  - Other environments: 7 days
- **Removal Policy**:
  - `prd`: `RETAIN` (logs preserved on stack deletion)
  - Other environments: `DESTROY` (logs deleted on stack deletion)

**IAM Permissions**:

- **DynamoDB**: Read access (Scan) to the Task table
- **CloudWatch Logs**: Write access to its log group

#### Get Task Function

**Resource Type**: AWS Lambda Function

**Configuration**:

- **Function Name**: `{app-name}-get-task-{env}`
- **Runtime**: Node.js 24.x
- **Handler**: `handler` (bundled with esbuild)
- **Memory**: 256 MB
- **Timeout**: 10 seconds
- **Log Format**: JSON (structured logging)
- **Bundling**: Automatic TypeScript compilation with esbuild
- **Environment Variables**:
  - `TASKS_TABLE`: DynamoDB table name
  - `ENABLE_LOGGING`: Logging enabled flag (from `CDK_APP_ENABLE_LOGGING`)
  - `LOG_LEVEL`: Minimum log level (from `CDK_APP_LOGGING_LEVEL`)
  - `LOG_FORMAT`: Log output format (from `CDK_APP_LOGGING_FORMAT`)

**CloudWatch Logs**:

- **Log Group**: `/aws/lambda/{app-name}-get-task-{env}`
- **Log Retention**:
  - `prd`: 30 days
  - Other environments: 7 days
- **Removal Policy**:
  - `prd`: `RETAIN` (logs preserved on stack deletion)
  - Other environments: `DESTROY` (logs deleted on stack deletion)

**IAM Permissions**:

- **DynamoDB**: Read access (GetItem) to the Task table
- **CloudWatch Logs**: Write access to its log group

#### Create Task Function

**Resource Type**: AWS Lambda Function

**Configuration**:

- **Function Name**: `{app-name}-create-task-{env}`
- **Runtime**: Node.js 24.x
- **Handler**: `handler` (bundled with esbuild)
- **Memory**: 256 MB
- **Timeout**: 10 seconds
- **Log Format**: JSON (structured logging)
- **Bundling**: Automatic TypeScript compilation with esbuild
- **Environment Variables**:
  - `TASKS_TABLE`: DynamoDB table name
  - `ENABLE_LOGGING`: Logging enabled flag (from `CDK_APP_ENABLE_LOGGING`)
  - `LOG_LEVEL`: Minimum log level (from `CDK_APP_LOGGING_LEVEL`)
  - `LOG_FORMAT`: Log output format (from `CDK_APP_LOGGING_FORMAT`)

**CloudWatch Logs**:

- **Log Group**: `/aws/lambda/{app-name}-create-task-{env}`
- **Log Retention**:
  - `prd`: 30 days
  - Other environments: 7 days
- **Removal Policy**:
  - `prd`: `RETAIN` (logs preserved on stack deletion)
  - Other environments: `DESTROY` (logs deleted on stack deletion)

**IAM Permissions**:

- **DynamoDB**: Write access (PutItem) to the Task table
- **CloudWatch Logs**: Write access to its log group

#### Update Task Function

**Resource Type**: AWS Lambda Function

**Configuration**:

- **Function Name**: `{app-name}-update-task-{env}`
- **Runtime**: Node.js 24.x
- **Handler**: `handler` (bundled with esbuild)
- **Memory**: 256 MB
- **Timeout**: 10 seconds
- **Log Format**: JSON (structured logging)
- **Bundling**: Automatic TypeScript compilation with esbuild
- **Environment Variables**:
  - `TASKS_TABLE`: DynamoDB table name
  - `ENABLE_LOGGING`: Logging enabled flag (from `CDK_APP_ENABLE_LOGGING`)
  - `LOG_LEVEL`: Minimum log level (from `CDK_APP_LOGGING_LEVEL`)
  - `LOG_FORMAT`: Log output format (from `CDK_APP_LOGGING_FORMAT`)

**CloudWatch Logs**:

- **Log Group**: `/aws/lambda/{app-name}-update-task-{env}`
- **Log Retention**:
  - `prd`: 30 days
  - Other environments: 7 days
- **Removal Policy**:
  - `prd`: `RETAIN` (logs preserved on stack deletion)
  - Other environments: `DESTROY` (logs deleted on stack deletion)

**IAM Permissions**:

- **DynamoDB**: Read-write access (GetItem, UpdateItem) to the Task table
- **CloudWatch Logs**: Write access to its log group

#### Lambda Starter API

**Resource Type**: API Gateway REST API

**Configuration**:

- **API Name**: `{app-name}-api-{env}`
- **Description**: "Lambda Starter API for {env} environment"
- **Stage**: `{env}` (e.g., `dev`, `prd`)
- **CORS**: Enabled with preflight OPTIONS support
  - Allowed Headers: `Content-Type`, `Authorization`
  - Allowed Methods: Configured per resource
  - Allowed Origins: Configured per environment
- **Throttling**:
  - Rate limits configured per stage
  - Burst limits configured per stage

**API Resources**:

- **GET /tasks**: List all tasks
  - Integration: Lambda proxy integration with List Tasks Function
  - Response: JSON array of tasks

- **GET /tasks/{taskId}**: Get a specific task by ID
  - Integration: Lambda proxy integration with Get Task Function
  - Path Parameter: `taskId` - The unique identifier of the task
  - Response: JSON object with the requested task
  - Error Responses:
    - 404 Not Found: Task ID does not exist or path parameter is missing
    - 500 Internal Server Error: Failed to retrieve task

- **POST /tasks**: Create a new task
  - Integration: Lambda proxy integration with Create Task Function
  - Request Body: JSON object with task properties
    - `title` (required): string, max 100 characters
    - `detail` (optional): string, max 1000 characters
    - `dueAt` (optional): ISO8601 timestamp
    - `isComplete` (optional): boolean, defaults to false
  - Response: JSON object with created task including ID and timestamps
  - Success Status: 201 Created
  - Error Responses:
    - 400 Bad Request: Invalid request body or validation error
    - 500 Internal Server Error: Failed to create task

- **PUT /tasks/{taskId}**: Update an existing task
  - Integration: Lambda proxy integration with Update Task Function
  - Path Parameter: `taskId` - The unique identifier of the task
  - Request Body: JSON object with task properties
    - `title` (required): string, max 100 characters
    - `detail` (optional): string, max 1000 characters - omit to remove from task
    - `dueAt` (optional): ISO8601 timestamp - omit to remove from task
    - `isComplete` (required): boolean
  - Response: JSON object with updated task
  - Success Status: 200 OK
  - Error Responses:
    - 400 Bad Request: Invalid request body or validation error
    - 404 Not Found: Task ID does not exist
    - 500 Internal Server Error: Failed to update task

**Outputs**:

- `ApiUrl`: The API Gateway endpoint URL (e.g., `https://abc123.execute-api.us-east-1.amazonaws.com/dev/`)
- `ApiId`: The API Gateway ID
- `ListTasksFunctionArn`: The List Tasks Lambda function ARN
- `GetTaskFunctionArn`: The Get Task Lambda function ARN
- `CreateTaskFunctionArn`: The Create Task Lambda function ARN
- `UpdateTaskFunctionArn`: The Update Task Lambda function ARN

**Logging Configuration**:

The Lambda stack uses environment variables to configure application behavior:

- **CDK_APP_ENABLE_LOGGING**: Controls whether logging is enabled in Lambda functions
  - Set to `true` (default) or `false`
  - Passed to Lambda as `ENABLE_LOGGING` environment variable
  - When disabled, Lambda functions produce minimal log output

- **CDK_APP_LOGGING_LEVEL**: Sets the minimum log level for application logs
  - Valid values: `debug`, `info` (default), `warn`, `error`
  - Passed to Lambda as `LOG_LEVEL` environment variable
  - Controls verbosity of application logging

- **CDK_APP_LOGGING_FORMAT**: Sets the log output format
  - Valid values: `text`, `json` (default)
  - Passed to Lambda as `LOG_FORMAT` environment variable
  - `json`: Structured JSON logs ideal for CloudWatch Logs Insights and log aggregation
  - `text`: Human-readable text format with stringified context

**Example Usage**:

```bash
# Development with debug logging in text format
CDK_APP_ENABLE_LOGGING=true
CDK_APP_LOGGING_LEVEL=debug
CDK_APP_LOGGING_FORMAT=text

# Production with info logging in JSON format
CDK_APP_ENABLE_LOGGING=true
CDK_APP_LOGGING_LEVEL=info
CDK_APP_LOGGING_FORMAT=json

# Disable logging (not recommended)
CDK_APP_ENABLE_LOGGING=false
```

### Resource Tagging

All resources are automatically tagged:

| Tag     | Source         | Purpose                    |
| ------- | -------------- | -------------------------- |
| `App`   | `CDK_APP_NAME` | Application identification |
| `Env`   | `CDK_ENV`      | Environment tracking       |
| `OU`    | `CDK_OU`       | Organizational unit        |
| `Owner` | `CDK_OWNER`    | Resource ownership         |

Tags enable:

- Cost allocation reports
- Resource filtering
- Compliance tracking
- Access control policies

---

## Stack Management

### Viewing Stacks

List all stacks:

```bash
npm run cdk list
```

View stack details:

```bash
npm run cdk list --long
```

### Synthesizing Templates

Generate CloudFormation templates:

```bash
npm run synth
```

Output location: `cdk.out/`

View specific stack template:

```bash
npm run cdk synth lambda-starter-data-stack-dev
```

### Comparing Changes

See differences before deploying:

```bash
npm run diff
```

Compare specific stack:

```bash
npm run cdk diff lambda-starter-data-stack-dev
```

### Stack Outputs

View stack outputs:

```bash
aws cloudformation describe-stacks \
  --stack-name lambda-starter-data-dev \
  --query 'Stacks[0].Outputs'
```

---

## Commands Reference

### NPM Scripts

| Command                 | Description               |
| ----------------------- | ------------------------- |
| `npm run build`         | Compile TypeScript        |
| `npm run clean`         | Remove build artifacts    |
| `npm test`              | Run unit tests            |
| `npm run test:coverage` | Run tests with coverage   |
| `npm run test:watch`    | Watch mode for tests      |
| `npm run synth`         | Synthesize CloudFormation |
| `npm run deploy`        | Deploy all stacks         |
| `npm run diff`          | Show differences          |
| `npm run destroy`       | Destroy all stacks        |

### CDK CLI Commands

| Command         | Description                     |
| --------------- | ------------------------------- |
| `cdk init`      | Initialize new CDK project      |
| `cdk bootstrap` | Bootstrap CDK in account/region |
| `cdk synth`     | Synthesize CloudFormation       |
| `cdk deploy`    | Deploy stacks                   |
| `cdk diff`      | Compare deployed vs local       |
| `cdk destroy`   | Remove stacks                   |
| `cdk list`      | List stacks                     |
| `cdk doctor`    | Check CDK setup                 |

### Advanced Commands

**Deploy with approval bypass** (CI/CD):

```bash
npm run cdk deploy -- --require-approval never
```

**Deploy specific stack**:

```bash
npm run cdk deploy lambda-starter-data-stack-dev
```

**Destroy with force**:

```bash
npm run cdk destroy --all --force
```

**Watch mode** (auto-deploy on changes):

```bash
npm run cdk watch
```

---

## Deployment Guide

### Development Deployment

```bash
# 1. Configure for dev
cat > .env << EOF
CDK_ENV=dev
CDK_APP_ENABLE_LOGGING=true
CDK_APP_LOGGING_LEVEL=debug
EOF

# 2. Review changes
npm run diff

# 3. Deploy
npm run deploy
```

### Production Deployment

```bash
# 1. Configure for production
cat > .env << EOF
CDK_APP_NAME=lambda-starter
CDK_ENV=prd
CDK_ACCOUNT=123456789012
CDK_REGION=us-east-1
CDK_OU=leanstacks
CDK_OWNER=platform-team
CDK_APP_ENABLE_LOGGING=true
CDK_APP_LOGGING_LEVEL=info
EOF

# 2. Review changes carefully
npm run diff

# 3. Deploy with confirmation
npm run deploy
```

### CI/CD Deployment

```bash
# Set environment variables
export CDK_ENV=prd
export CDK_ACCOUNT=123456789012
export CDK_REGION=us-east-1
export CDK_APP_ENABLE_LOGGING=true
export CDK_APP_LOGGING_LEVEL=info

# Deploy without prompts
npm run deploy -- --require-approval never
```

### Rollback Procedure

If deployment fails or issues arise:

```bash
# 1. Identify the stack
aws cloudformation describe-stacks

# 2. Rollback to previous version
aws cloudformation rollback-stack \
  --stack-name lambda-starter-data-prd

# 3. Or destroy and redeploy
npm run cdk destroy lambda-starter-data-stack-prd
# Fix issue in code
npm run deploy
```

---

## Testing Infrastructure

### Unit Tests

Run all tests:

```bash
npm test
```

Run with coverage:

```bash
npm run test:coverage
```

Watch mode for development:

```bash
npm run test:watch
```

### What's Tested

1. **Configuration Validation**
   - Environment variable parsing
   - Zod schema validation
   - Default value handling

2. **Stack Resources**
   - Correct resource creation
   - Property values
   - Dependencies

3. **Environment Logic**
   - Different behaviors per environment
   - Conditional resource creation

4. **Tagging**
   - All resources properly tagged
   - Tag inheritance

### Test Structure

```typescript
describe('DataStack', () => {
  describe('dev environment', () => {
    it('should create a Task table', () => {
      // Arrange
      const app = new cdk.App();
      const stack = new DataStack(app, 'TestStack', {
        envName: 'dev',
      });

      // Act
      const template = Template.fromStack(stack);

      // Assert
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        TableName: 'task-dev',
      });
    });
  });
});
```

### Best Practices

1. Test each stack in isolation
2. Test environment-specific behavior
3. Verify resource properties
4. Check outputs and exports
5. Test tag application
6. Use CDK assertions library

---

## Troubleshooting

### Common Issues

#### Configuration Validation Failed

**Problem**: `CDK configuration validation failed: CDK_ENV: Required`

**Solutions**:

1. Ensure `.env` file exists in `infrastructure/` directory
2. Verify `CDK_ENV` is set to valid value (`dev`, `qat`, `prd`)
3. Check for typos in variable names

#### TypeScript Compilation Errors

**Problem**: Build fails with TypeScript errors

**Solutions**:

1. Install dependencies: `npm install`
2. Clean and rebuild: `npm run clean && npm run build`
3. Check Node.js version: `node --version` (should be v24+)
4. Verify TypeScript version: `npx tsc --version`

#### Deployment Failures

**Problem**: Stack deployment fails

**Solutions**:

1. Verify AWS credentials: `aws sts get-caller-identity`
2. Check IAM permissions
3. Review CloudFormation events in AWS Console
4. Check for resource naming conflicts
5. Ensure CDK is bootstrapped: `cdk bootstrap`

#### Bootstrap Version Mismatch

**Problem**: `This stack requires bootstrap stack version X`

**Solution**:

```bash
cdk bootstrap aws://ACCOUNT-ID/REGION --force
```

#### Resource Already Exists

**Problem**: `Resource already exists` error during deployment

**Solutions**:

1. Check if resource exists in AWS Console
2. Import existing resource:
   ```bash
   npm run cdk import lambda-starter-data-stack-dev
   ```
3. Or destroy and recreate:
   ```bash
   npm run cdk destroy lambda-starter-data-stack-dev
   npm run deploy
   ```

#### Node Version Warnings

**Problem**: Warning about untested Node.js version

**Solution**:

```bash
export JSII_SILENCE_WARNING_UNTESTED_NODE_VERSION=1
```

Or use supported Node.js version (22.x or 20.x).

### Debugging Tips

1. **Enable verbose output**:

   ```bash
   npm run cdk deploy -- --verbose
   ```

2. **Check synthesized template**:

   ```bash
   npm run synth
   cat cdk.out/lambda-starter-data-stack-dev.template.json
   ```

3. **View CloudFormation events**:

   ```bash
   aws cloudformation describe-stack-events \
     --stack-name lambda-starter-data-dev
   ```

4. **Check CDK context**:

   ```bash
   npm run cdk context
   ```

5. **Validate IAM permissions**:
   ```bash
   aws iam simulate-principal-policy \
     --policy-source-arn arn:aws:iam::ACCOUNT:user/USERNAME \
     --action-names cloudformation:*
   ```

---

## Best Practices

### Security

1. **Never commit secrets**: Use `.env` for local only
2. **Use AWS Secrets Manager**: Store sensitive values securely
3. **Implement least privilege**: Grant minimal IAM permissions
4. **Enable encryption**: Use AWS managed keys by default
5. **Separate accounts**: Use different AWS accounts per environment
6. **Enable MFA**: Require MFA for production deployments
7. **Audit regularly**: Review CloudTrail logs

### Development

1. **Test before deploying**: Always run `npm test`
2. **Review diffs**: Use `npm run diff` before deployment
3. **Use descriptive names**: Follow naming conventions
4. **Document changes**: Update README and comments
5. **Type everything**: Leverage TypeScript's type system
6. **Version dependencies**: Lock dependency versions
7. **Write unit tests**: Test infrastructure code

### Operations

1. **Tag everything**: Enable cost tracking and filtering
2. **Monitor costs**: Set up budget alerts
3. **Backup production**: Enable point-in-time recovery
4. **Retain critical resources**: Use `RETAIN` policy for production
5. **Version control**: Commit all infrastructure changes
6. **Use CI/CD**: Automate deployments
7. **Document runbooks**: Create operational procedures

### Code Organization

1. **One stack per concern**: Separate data, compute, networking
2. **Reusable constructs**: Create custom constructs for patterns
3. **Environment configuration**: Externalize environment-specific values
4. **Consistent naming**: Use clear, consistent resource names
5. **Modular structure**: Keep files small and focused

### Deployment

1. **Deploy to dev first**: Test changes in development
2. **Use change sets**: Review changes before applying
3. **Implement gradual rollout**: Deploy to environments sequentially
4. **Have rollback plan**: Document rollback procedures
5. **Monitor deployments**: Watch CloudFormation events
6. **Communicate changes**: Notify team of deployments

---

## Additional Resources

### Official Documentation

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/latest/guide/)
- [AWS CDK API Reference](https://docs.aws.amazon.com/cdk/api/v2/)
- [CDK Workshop](https://cdkworkshop.com/)
- [CDK Patterns](https://cdkpatterns.com/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)

### Community Resources

- [AWS CDK GitHub](https://github.com/aws/aws-cdk)
- [CDK Slack Channel](https://cdk.dev)
- [AWS Developer Forums](https://forums.aws.amazon.com/forum.jspa?forumID=351)
- [CDK Examples Repository](https://github.com/aws-samples/aws-cdk-examples)

### Learning Resources

- [AWS CDK Workshop](https://cdkworkshop.com/)
- [AWS CDK Best Practices](https://docs.aws.amazon.com/cdk/latest/guide/best-practices.html)
- [Infrastructure as Code Best Practices](https://docs.aws.amazon.com/prescriptive-guidance/latest/infrastructure-as-code/welcome.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

### Tools

- [CDK Construct Hub](https://constructs.dev/)
- [AWS CLI Documentation](https://docs.aws.amazon.com/cli/)
- [CloudFormation Documentation](https://docs.aws.amazon.com/cloudformation/)
- [AWS Console](https://console.aws.amazon.com/)

---

## Support

For questions or issues:

1. Check this guide and the [troubleshooting section](#troubleshooting)
2. Review the [infrastructure README](../infrastructure/README.md)
3. Search [GitHub Issues](https://github.com/leanstacks/lambda-starter/issues)
4. Contact the platform team
5. Create a new issue with detailed information

---

**Last Updated**: November 30, 2025  
**Version**: 1.0.0  
**Maintained By**: LeanStacks Platform Team
