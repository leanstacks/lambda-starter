import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

/**
 * Properties for the LambdaStack.
 */
export interface LambdaStackProps extends cdk.StackProps {
  /**
   * Application name.
   */
  appName: string;

  /**
   * Environment name (dev, qat, prd).
   */
  envName: string;

  /**
   * Reference to the Task DynamoDB table.
   */
  taskTable: dynamodb.ITable;

  /**
   * Whether to enable application logging.
   */
  enableLogging: boolean;

  /**
   * Application logging level.
   */
  loggingLevel: string;

  /**
   * Application logging format (text or json).
   */
  loggingFormat: string;
}

/**
 * CDK Stack for Lambda functions and API Gateway.
 */
export class LambdaStack extends cdk.Stack {
  /**
   * The API Gateway REST API.
   */
  public readonly api: apigateway.RestApi;

  /**
   * The list tasks Lambda function.
   */
  public readonly listTasksFunction: NodejsFunction;

  /**
   * The get task Lambda function.
   */
  public readonly getTaskFunction: NodejsFunction;

  /**
   * The create task Lambda function.
   */
  public readonly createTaskFunction: NodejsFunction;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    // Create the list tasks Lambda function
    this.listTasksFunction = new NodejsFunction(this, 'ListTasksFunction', {
      functionName: `${props.appName}-list-tasks-${props.envName}`,
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: 'handler',
      entry: path.join(__dirname, '../../src/handlers/list-tasks.ts'),
      environment: {
        TASKS_TABLE: props.taskTable.tableName,
        ENABLE_LOGGING: props.enableLogging.toString(),
        LOG_LEVEL: props.loggingLevel,
        LOG_FORMAT: props.loggingFormat,
      },
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
      bundling: {
        minify: true,
        sourceMap: true,
      },
      loggingFormat: lambda.LoggingFormat.JSON,
      applicationLogLevelV2: lambda.ApplicationLogLevel.INFO,
      systemLogLevelV2: lambda.SystemLogLevel.INFO,
      logGroup: new logs.LogGroup(this, 'ListTasksFunctionLogGroup', {
        logGroupName: `/aws/lambda/${props.appName}-list-tasks-${props.envName}`,
        retention: props.envName === 'prd' ? logs.RetentionDays.ONE_MONTH : logs.RetentionDays.ONE_WEEK,
        removalPolicy: props.envName === 'prd' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      }),
    });

    // Grant the Lambda function read access to the DynamoDB table
    props.taskTable.grantReadData(this.listTasksFunction);

    // Create the get task Lambda function
    this.getTaskFunction = new NodejsFunction(this, 'GetTaskFunction', {
      functionName: `${props.appName}-get-task-${props.envName}`,
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: 'handler',
      entry: path.join(__dirname, '../../src/handlers/get-task.ts'),
      environment: {
        TASKS_TABLE: props.taskTable.tableName,
        ENABLE_LOGGING: props.enableLogging.toString(),
        LOG_LEVEL: props.loggingLevel,
        LOG_FORMAT: props.loggingFormat,
      },
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
      bundling: {
        minify: true,
        sourceMap: true,
      },
      loggingFormat: lambda.LoggingFormat.JSON,
      applicationLogLevelV2: lambda.ApplicationLogLevel.INFO,
      systemLogLevelV2: lambda.SystemLogLevel.INFO,
      logGroup: new logs.LogGroup(this, 'GetTaskFunctionLogGroup', {
        logGroupName: `/aws/lambda/${props.appName}-get-task-${props.envName}`,
        retention: props.envName === 'prd' ? logs.RetentionDays.ONE_MONTH : logs.RetentionDays.ONE_WEEK,
        removalPolicy: props.envName === 'prd' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      }),
    });

    // Grant the Lambda function read access to the DynamoDB table
    props.taskTable.grantReadData(this.getTaskFunction);

    // Create the create task Lambda function
    this.createTaskFunction = new NodejsFunction(this, 'CreateTaskFunction', {
      functionName: `${props.appName}-create-task-${props.envName}`,
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: 'handler',
      entry: path.join(__dirname, '../../src/handlers/create-task.ts'),
      environment: {
        TASKS_TABLE: props.taskTable.tableName,
        ENABLE_LOGGING: props.enableLogging.toString(),
        LOG_LEVEL: props.loggingLevel,
        LOG_FORMAT: props.loggingFormat,
      },
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
      bundling: {
        minify: true,
        sourceMap: true,
      },
      loggingFormat: lambda.LoggingFormat.JSON,
      applicationLogLevelV2: lambda.ApplicationLogLevel.INFO,
      systemLogLevelV2: lambda.SystemLogLevel.INFO,
      logGroup: new logs.LogGroup(this, 'CreateTaskFunctionLogGroup', {
        logGroupName: `/aws/lambda/${props.appName}-create-task-${props.envName}`,
        retention: props.envName === 'prd' ? logs.RetentionDays.ONE_MONTH : logs.RetentionDays.ONE_WEEK,
        removalPolicy: props.envName === 'prd' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      }),
    });

    // Grant the Lambda function write access to the DynamoDB table
    props.taskTable.grantWriteData(this.createTaskFunction);

    // Create API Gateway REST API
    this.api = new apigateway.RestApi(this, 'LambdaStarterApi', {
      restApiName: `${props.appName}-api-${props.envName}`,
      description: `Lambda Starter API for ${props.envName} environment`,
      deployOptions: {
        stageName: props.envName,
        throttlingRateLimit: 100,
        throttlingBurstLimit: 200,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    // Create /tasks resource
    const tasksResource = this.api.root.addResource('tasks');

    // Add GET method to /tasks
    tasksResource.addMethod('GET', new apigateway.LambdaIntegration(this.listTasksFunction));

    // Add POST method to /tasks
    tasksResource.addMethod('POST', new apigateway.LambdaIntegration(this.createTaskFunction));

    // Create /tasks/{taskId} resource
    const taskResource = tasksResource.addResource('{taskId}');

    // Add GET method to /tasks/{taskId}
    taskResource.addMethod('GET', new apigateway.LambdaIntegration(this.getTaskFunction));

    // Output the API URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: this.api.url,
      description: 'URL of the Tasks API',
      exportName: `${props.appName}-tasks-api-url-${props.envName}`,
    });

    // Output the API Gateway ID
    new cdk.CfnOutput(this, 'ApiId', {
      value: this.api.restApiId,
      description: 'ID of the Tasks API',
      exportName: `${props.appName}-tasks-api-id-${props.envName}`,
    });

    // Output the list tasks function ARN
    new cdk.CfnOutput(this, 'ListTasksFunctionArn', {
      value: this.listTasksFunction.functionArn,
      description: 'ARN of the list tasks Lambda function',
      exportName: `${props.appName}-list-tasks-function-arn-${props.envName}`,
    });

    // Output the get task function ARN
    new cdk.CfnOutput(this, 'GetTaskFunctionArn', {
      value: this.getTaskFunction.functionArn,
      description: 'ARN of the get task Lambda function',
      exportName: `${props.appName}-get-task-function-arn-${props.envName}`,
    });

    // Output the create task function ARN
    new cdk.CfnOutput(this, 'CreateTaskFunctionArn', {
      value: this.createTaskFunction.functionArn,
      description: 'ARN of the create task Lambda function',
      exportName: `${props.appName}-create-task-function-arn-${props.envName}`,
    });
  }
}
