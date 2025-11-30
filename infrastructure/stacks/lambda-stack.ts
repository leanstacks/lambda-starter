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

    // Output the API URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: this.api.url,
      description: 'URL of the Tasks API',
      exportName: `${props.envName}-tasks-api-url`,
    });

    // Output the API Gateway ID
    new cdk.CfnOutput(this, 'ApiId', {
      value: this.api.restApiId,
      description: 'ID of the Tasks API',
      exportName: `${props.envName}-tasks-api-id`,
    });

    // Output the list tasks function ARN
    new cdk.CfnOutput(this, 'ListTasksFunctionArn', {
      value: this.listTasksFunction.functionArn,
      description: 'ARN of the list tasks Lambda function',
      exportName: `${props.envName}-list-tasks-function-arn`,
    });
  }
}
