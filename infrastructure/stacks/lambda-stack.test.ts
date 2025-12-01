import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { LambdaStack } from './lambda-stack';

// Mock NodejsFunction to avoid Docker bundling during tests
jest.mock('aws-cdk-lib/aws-lambda-nodejs', () => {
  const actual = jest.requireActual('aws-cdk-lib/aws-lambda-nodejs');
  const lambda = jest.requireActual('aws-cdk-lib/aws-lambda');
  return {
    ...actual,
    NodejsFunction: class extends lambda.Function {
      constructor(scope: any, id: string, props: any) {
        // Use inline code instead of bundling for tests
        super(scope, id, {
          ...props,
          code: lambda.Code.fromInline('exports.handler = async () => {}'),
        });
      }
    },
  };
});

describe('LambdaStack', () => {
  describe('dev environment', () => {
    let template: Template;

    beforeAll(() => {
      const testApp = new cdk.App();
      const mockTestStack = new cdk.Stack(testApp, 'MockStack');
      const testMockTable = new dynamodb.Table(mockTestStack, 'MockTaskTable', {
        tableName: 'mock-task-table',
        partitionKey: {
          name: 'id',
          type: dynamodb.AttributeType.STRING,
        },
      });

      const stack = new LambdaStack(testApp, 'TestLambdaStack', {
        appName: 'lambda-starter',
        envName: 'dev',
        taskTable: testMockTable,
        enableLogging: true,
        loggingLevel: 'debug',
        loggingFormat: 'json',
      });
      template = Template.fromStack(stack);
    });

    it('should create a list tasks Lambda function', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        FunctionName: 'lambda-starter-list-tasks-dev',
        Runtime: 'nodejs24.x',
        Handler: 'handler',
        Timeout: 10,
        MemorySize: 256,
      });
    });

    it('should configure Lambda environment variables', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        Environment: {
          Variables: {
            TASKS_TABLE: Match.anyValue(),
            ENABLE_LOGGING: 'true',
            LOG_LEVEL: 'debug',
            LOG_FORMAT: 'json',
          },
        },
      });
    });

    it('should create an API Gateway REST API', () => {
      template.hasResourceProperties('AWS::ApiGateway::RestApi', {
        Name: 'lambda-starter-api-dev',
        Description: 'Lambda Starter API for dev environment',
      });
    });

    it('should create a /tasks resource', () => {
      template.resourceCountIs('AWS::ApiGateway::Resource', 1);
      template.hasResourceProperties('AWS::ApiGateway::Resource', {
        PathPart: 'tasks',
      });
    });

    it('should create a GET method on /tasks', () => {
      template.hasResourceProperties('AWS::ApiGateway::Method', {
        HttpMethod: 'GET',
      });
    });

    it('should integrate API Gateway with Lambda', () => {
      template.hasResourceProperties('AWS::ApiGateway::Method', {
        Integration: {
          Type: 'AWS_PROXY',
        },
      });
    });

    it('should configure API Gateway deployment', () => {
      template.hasResourceProperties('AWS::ApiGateway::Stage', {
        StageName: 'dev',
      });
    });

    it('should configure API Gateway throttling', () => {
      template.hasResourceProperties('AWS::ApiGateway::Stage', {
        MethodSettings: [
          {
            ThrottlingRateLimit: 100,
            ThrottlingBurstLimit: 200,
          },
        ],
      });
    });

    it('should grant Lambda read access to DynamoDB', () => {
      template.hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Action: [
                'dynamodb:BatchGetItem',
                'dynamodb:GetRecords',
                'dynamodb:GetShardIterator',
                'dynamodb:Query',
                'dynamodb:GetItem',
                'dynamodb:Scan',
                'dynamodb:ConditionCheckItem',
                'dynamodb:DescribeTable',
              ],
            }),
          ]),
        },
      });
    });

    it('should export API URL', () => {
      template.hasOutput('ApiUrl', {
        Export: {
          Name: 'dev-tasks-api-url',
        },
      });
    });

    it('should export API ID', () => {
      template.hasOutput('ApiId', {
        Export: {
          Name: 'dev-tasks-api-id',
        },
      });
    });

    it('should export Lambda function ARN', () => {
      template.hasOutput('ListTasksFunctionArn', {
        Export: {
          Name: 'dev-list-tasks-function-arn',
        },
      });
    });
  });

  describe('prd environment', () => {
    let template: Template;

    beforeAll(() => {
      const testApp = new cdk.App();
      const mockTestStack = new cdk.Stack(testApp, 'MockStack');
      const testMockTable = new dynamodb.Table(mockTestStack, 'MockTaskTable', {
        tableName: 'mock-task-table',
        partitionKey: {
          name: 'id',
          type: dynamodb.AttributeType.STRING,
        },
      });

      const stack = new LambdaStack(testApp, 'TestLambdaStack', {
        appName: 'lambda-starter',
        envName: 'prd',
        taskTable: testMockTable,
        enableLogging: true,
        loggingLevel: 'info',
        loggingFormat: 'json',
      });
      template = Template.fromStack(stack);
    });

    it('should create Lambda with prd naming', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        FunctionName: 'lambda-starter-list-tasks-prd',
      });
    });

    it('should configure info log level for prd', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        Environment: {
          Variables: {
            LOG_LEVEL: 'info',
          },
        },
      });
    });

    it('should create API Gateway with prd naming', () => {
      template.hasResourceProperties('AWS::ApiGateway::RestApi', {
        Name: 'lambda-starter-api-prd',
        Description: 'Lambda Starter API for prd environment',
      });
    });

    it('should deploy to prd stage', () => {
      template.hasResourceProperties('AWS::ApiGateway::Stage', {
        StageName: 'prd',
      });
    });
  });

  describe('CORS configuration', () => {
    let template: Template;

    beforeAll(() => {
      const testApp = new cdk.App();
      const mockTestStack = new cdk.Stack(testApp, 'MockStack');
      const testMockTable = new dynamodb.Table(mockTestStack, 'MockTaskTable', {
        tableName: 'mock-task-table',
        partitionKey: {
          name: 'id',
          type: dynamodb.AttributeType.STRING,
        },
      });

      const stack = new LambdaStack(testApp, 'TestLambdaStack', {
        appName: 'lambda-starter',
        envName: 'dev',
        taskTable: testMockTable,
        enableLogging: true,
        loggingLevel: 'debug',
        loggingFormat: 'json',
      });
      template = Template.fromStack(stack);
    });

    it('should configure CORS preflight for OPTIONS method', () => {
      template.hasResourceProperties('AWS::ApiGateway::Method', {
        HttpMethod: 'OPTIONS',
      });
    });

    it('should include CORS headers in OPTIONS response', () => {
      template.hasResourceProperties('AWS::ApiGateway::Method', {
        Integration: {
          IntegrationResponses: [
            {
              ResponseParameters: {
                'method.response.header.Access-Control-Allow-Headers': "'Content-Type,Authorization'",
                'method.response.header.Access-Control-Allow-Methods': Match.anyValue(),
                'method.response.header.Access-Control-Allow-Origin': Match.anyValue(),
              },
            },
          ],
        },
      });
    });
  });
});
