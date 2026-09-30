import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
describe('sns-client', () => {
  let snsClient: typeof import('./sns-client.js').snsClient;
  let mockLoggerInfo: Mock;
  let mockSNSClient: any;

  beforeEach(() => {
    // Reset modules to clear any cached imports
    vi.resetModules();

    // Mock SNSClient constructor
    mockSNSClient = {
      constructor: { name: 'SNSClient' },
      config: {},
    };

    vi.doMock('@aws-sdk/client-sns', () => ({
      SNSClient: vi.fn().mockImplementation(function (config: unknown) {
        mockSNSClient.config = config;
        return mockSNSClient;
      }),
    }));

    // Mock lambda-utils so its SNS client factory uses the mocked SNSClient (dependencies are externalized in Vitest)
    vi.doMock('@leanstacks/lambda-utils', async () => {
      const { SNSClient } = await import('@aws-sdk/client-sns');
      return {
        initializeSNSClient: (config: unknown) => new SNSClient(config as never),
        publishToTopic: vi.fn(),
      };
    });

    // Mock the config module
    vi.doMock('./config', () => ({
      config: {
        AWS_REGION: 'us-east-1',
        TASKS_TABLE: 'test-table',
        TASK_EVENT_TOPIC_ARN: 'arn:aws:sns:us-east-1:123456789012:test-topic',
        LOGGING_ENABLED: true,
        LOGGING_LEVEL: 'info',
        CORS_ALLOW_ORIGIN: '*',
        USE_LOCALSTACK: false,
        LOCALSTACK_ENDPOINT: 'http://localhost:4566',
      },
    }));

    // Mock the logger module
    mockLoggerInfo = vi.fn();
    vi.doMock('./logger', () => ({
      logger: {
        info: mockLoggerInfo,
        debug: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      },
    }));
  });

  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  describe('snsClient', () => {
    it('should initialize SNS client with correct region', async () => {
      // Arrange & Act
      const module = await import('./sns-client.js');
      snsClient = module.snsClient;

      // Assert
      expect(snsClient).toBeDefined();
      expect(mockSNSClient.config).toEqual({
        region: 'us-east-1',
      });
    });

    it('should create SNSClient instance', async () => {
      // Arrange & Act
      const module = await import('./sns-client.js');
      snsClient = module.snsClient;

      // Assert
      expect(snsClient.constructor.name).toBe('SNSClient');
    });

    it('should log initialization with configuration information', async () => {
      // Arrange & Act
      await import('./sns-client.js');

      // Assert
      expect(mockLoggerInfo).toHaveBeenCalledWith(
        expect.objectContaining({
          snsClientConfig: expect.objectContaining({
            region: 'us-east-1',
          }),
        }),
        expect.stringContaining('[SNSClient]'),
      );
    });

    it('should use AWS region from config', async () => {
      // Arrange
      vi.doMock('./config', () => ({
        config: {
          AWS_REGION: 'eu-west-1',
          TASKS_TABLE: 'test-table',
          TASK_EVENT_TOPIC_ARN: 'arn:aws:sns:eu-west-1:123456789012:test-topic',
          LOGGING_ENABLED: true,
          LOGGING_LEVEL: 'info',
          CORS_ALLOW_ORIGIN: '*',
          USE_LOCALSTACK: false,
          LOCALSTACK_ENDPOINT: 'http://localhost:4566',
        },
      }));

      // Act
      await import('./sns-client.js');

      // Assert
      expect(mockSNSClient.config).toEqual({
        region: 'eu-west-1',
      });
    });
  });

  describe('exports', () => {
    it('should export snsClient', async () => {
      // Arrange & Act
      const module = await import('./sns-client.js');

      // Assert
      expect(module.snsClient).toBeDefined();
    });

    it('should export snsClient as SNSClient instance', async () => {
      // Arrange & Act
      const { snsClient: client } = await import('./sns-client.js');

      // Assert
      expect(client.constructor.name).toBe('SNSClient');
    });
  });

  describe('LocalStack configuration', () => {
    it('should include endpoint and credentials when LocalStack is enabled', async () => {
      // Arrange
      vi.doMock('./config', () => ({
        config: {
          AWS_REGION: 'us-east-1',
          TASKS_TABLE: 'test-table',
          TASK_EVENT_TOPIC_ARN: 'arn:aws:sns:us-east-1:123456789012:test-topic',
          LOGGING_ENABLED: true,
          LOGGING_LEVEL: 'info',
          CORS_ALLOW_ORIGIN: '*',
          USE_LOCALSTACK: true,
          LOCALSTACK_ENDPOINT: 'http://localstack:4566',
        },
      }));

      // Act
      await import('./sns-client.js');

      // Assert
      expect(mockSNSClient.config).toEqual({
        region: 'us-east-1',
        endpoint: 'http://localstack:4566',
        credentials: {
          accessKeyId: 'test',
          secretAccessKey: 'test',
        },
      });
    });

    it('should not include endpoint when LocalStack is disabled', async () => {
      // Arrange
      vi.doMock('./config', () => ({
        config: {
          AWS_REGION: 'us-east-1',
          TASKS_TABLE: 'test-table',
          TASK_EVENT_TOPIC_ARN: 'arn:aws:sns:us-east-1:123456789012:test-topic',
          LOGGING_ENABLED: true,
          LOGGING_LEVEL: 'info',
          CORS_ALLOW_ORIGIN: '*',
          USE_LOCALSTACK: false,
          LOCALSTACK_ENDPOINT: 'http://localhost:4566',
        },
      }));

      // Act
      await import('./sns-client.js');

      // Assert
      expect(mockSNSClient.config).toEqual({
        region: 'us-east-1',
      });
    });

    it('should log LocalStack endpoint when enabled', async () => {
      // Arrange
      vi.doMock('./config', () => ({
        config: {
          AWS_REGION: 'us-east-1',
          TASKS_TABLE: 'test-table',
          TASK_EVENT_TOPIC_ARN: 'arn:aws:sns:us-east-1:123456789012:test-topic',
          LOGGING_ENABLED: true,
          LOGGING_LEVEL: 'info',
          CORS_ALLOW_ORIGIN: '*',
          USE_LOCALSTACK: true,
          LOCALSTACK_ENDPOINT: 'http://localstack:4566',
        },
      }));

      // Act
      await import('./sns-client.js');

      // Assert
      expect(mockLoggerInfo).toHaveBeenCalledWith(
        expect.objectContaining({
          snsClientConfig: expect.objectContaining({
            region: 'us-east-1',
            endpoint: 'http://localstack:4566',
            credentials: {
              accessKeyId: 'test',
              secretAccessKey: 'test',
            },
          }),
        }),
        expect.stringContaining('[SNSClient]'),
      );
    });

    it('should use custom LocalStack endpoint from config', async () => {
      // Arrange
      vi.doMock('./config', () => ({
        config: {
          AWS_REGION: 'us-east-1',
          TASKS_TABLE: 'test-table',
          TASK_EVENT_TOPIC_ARN: 'arn:aws:sns:us-east-1:123456789012:test-topic',
          LOGGING_ENABLED: true,
          LOGGING_LEVEL: 'info',
          CORS_ALLOW_ORIGIN: '*',
          USE_LOCALSTACK: true,
          LOCALSTACK_ENDPOINT: 'http://custom-localstack:4566',
        },
      }));

      // Act
      await import('./sns-client.js');

      // Assert
      expect(mockSNSClient.config).toEqual(
        expect.objectContaining({
          endpoint: 'http://custom-localstack:4566',
        }),
      );
    });

    it('should use test credentials for LocalStack', async () => {
      // Arrange
      vi.doMock('./config', () => ({
        config: {
          AWS_REGION: 'us-east-1',
          TASKS_TABLE: 'test-table',
          TASK_EVENT_TOPIC_ARN: 'arn:aws:sns:us-east-1:123456789012:test-topic',
          LOGGING_ENABLED: true,
          LOGGING_LEVEL: 'info',
          CORS_ALLOW_ORIGIN: '*',
          USE_LOCALSTACK: true,
          LOCALSTACK_ENDPOINT: 'http://localstack:4566',
        },
      }));

      // Act
      await import('./sns-client.js');

      // Assert
      expect(mockSNSClient.config).toEqual(
        expect.objectContaining({
          credentials: {
            accessKeyId: 'test',
            secretAccessKey: 'test',
          },
        }),
      );
    });
  });

  describe('client initialization', () => {
    it('should initialize client once when module is imported', async () => {
      // Arrange
      const SNSClient = (await import('@aws-sdk/client-sns')).SNSClient;

      // Act
      await import('./sns-client.js');
      await import('./sns-client.js'); // Import again

      // Assert - SNSClient should be called only once despite multiple imports
      expect(SNSClient).toHaveBeenCalledTimes(1);
    });

    it('should pass correct configuration to SNSClient constructor', async () => {
      // Arrange
      const SNSClient = (await import('@aws-sdk/client-sns')).SNSClient;

      // Act
      await import('./sns-client.js');

      // Assert
      expect(SNSClient).toHaveBeenCalledWith(
        expect.objectContaining({
          region: 'us-east-1',
        }),
      );
    });
  });
});
