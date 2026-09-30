import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
describe('dynamodb-client', () => {
  let dynamoDocClient: typeof import('./dynamodb-client.js').dynamoDocClient;
  let dynamoClient: typeof import('./dynamodb-client.js').dynamoClient;
  let mockLoggerInfo: Mock;
  let mockInitializeDynamoDBClients: Mock;
  let mockGetDynamoDBClient: Mock;
  let mockGetDynamoDBDocumentClient: Mock;
  let mockDynamoClient: any;
  let mockDocClient: any;

  beforeEach(() => {
    // Reset modules to clear any cached imports
    vi.resetModules();

    // Create mock client instances
    mockDynamoClient = {
      constructor: { name: 'DynamoDBClient' },
      config: { region: 'us-east-1' },
    };
    mockDocClient = {
      constructor: { name: 'DynamoDBDocumentClient' },
    };

    // Mock the lambda-utils module
    mockInitializeDynamoDBClients = vi.fn();
    mockGetDynamoDBClient = vi.fn().mockReturnValue(mockDynamoClient);
    mockGetDynamoDBDocumentClient = vi.fn().mockReturnValue(mockDocClient);

    vi.doMock('@leanstacks/lambda-utils', () => ({
      initializeDynamoDBClients: mockInitializeDynamoDBClients,
      getDynamoDBClient: mockGetDynamoDBClient,
      getDynamoDBDocumentClient: mockGetDynamoDBDocumentClient,
    }));

    // Mock the config module
    vi.doMock('./config', () => ({
      config: {
        AWS_REGION: 'us-east-1',
        TASKS_TABLE: 'test-table',
        LOGGING_ENABLED: true,
        LOGGING_LEVEL: 'info',
        CORS_ALLOW_ORIGIN: '*',
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

  describe('dynamoDBClient', () => {
    it('should initialize lambda-utils with correct configuration', async () => {
      // Arrange & Act
      await import('./dynamodb-client.js');

      // Assert
      expect(mockInitializeDynamoDBClients).toHaveBeenCalledWith(
        { region: 'us-east-1' },
        {
          convertEmptyValues: false,
          convertClassInstanceToMap: true,
          removeUndefinedValues: true,
        },
        {
          wrapNumbers: false,
        },
      );
    });

    it('should get DynamoDB client from lambda-utils', async () => {
      // Arrange & Act
      const module = await import('./dynamodb-client.js');
      dynamoClient = module.dynamoClient;

      // Assert
      expect(dynamoClient).toBeDefined();
      expect(dynamoClient.constructor.name).toBe('DynamoDBClient');
      expect(mockGetDynamoDBClient).toHaveBeenCalled();
    });

    it('should log initialization with configuration information', async () => {
      // Arrange & Act
      await import('./dynamodb-client.js');

      // Assert
      expect(mockLoggerInfo).toHaveBeenCalledWith(
        expect.objectContaining({
          dynamoDbClientConfig: expect.objectContaining({
            region: 'us-east-1',
          }),
          marshallConfig: expect.objectContaining({
            convertEmptyValues: false,
            convertClassInstanceToMap: true,
            removeUndefinedValues: true,
          }),
          unmarshallConfig: expect.objectContaining({
            wrapNumbers: false,
          }),
        }),
        '[DynamoDBClient] - Initialized AWS DynamoDB client',
      );
    });
  });

  describe('dynamoDocClient', () => {
    it('should get DynamoDB Document client from lambda-utils', async () => {
      // Arrange & Act
      const module = await import('./dynamodb-client.js');
      dynamoDocClient = module.dynamoDocClient;

      // Assert
      expect(dynamoDocClient).toBeDefined();
      expect(dynamoDocClient.constructor.name).toBe('DynamoDBDocumentClient');
      expect(mockGetDynamoDBDocumentClient).toHaveBeenCalled();
    });

    it('should create Document client after DynamoDB client initialization', async () => {
      // Arrange & Act
      const module = await import('./dynamodb-client.js');
      dynamoDocClient = module.dynamoDocClient;
      dynamoClient = module.dynamoClient;

      // Assert
      expect(dynamoDocClient).toBeDefined();
      expect(dynamoClient).toBeDefined();
      expect(dynamoDocClient.constructor.name).toBe('DynamoDBDocumentClient');
      expect(mockGetDynamoDBDocumentClient).toHaveBeenCalled();
    });
  });

  describe('client initialization', () => {
    it('should initialize clients once when module is imported', async () => {
      // Arrange & Act
      const module1 = await import('./dynamodb-client.js');
      const module2 = await import('./dynamodb-client.js');

      // Assert - same instances should be returned (singleton pattern)
      expect(module1.dynamoClient).toBe(module2.dynamoClient);
      expect(module1.dynamoDocClient).toBe(module2.dynamoDocClient);
      // initializeDynamoDBClients should only be called once during initialization
      expect(mockInitializeDynamoDBClients).toHaveBeenCalledTimes(1);
    });

    it('should pass correct configuration to initializeDynamoDBClients', async () => {
      // Arrange & Act
      await import('./dynamodb-client.js');

      // Assert
      const callArgs = mockInitializeDynamoDBClients.mock.calls[0];
      expect(callArgs[0]).toEqual({ region: 'us-east-1' });
      expect(callArgs[1]).toEqual({
        convertEmptyValues: false,
        convertClassInstanceToMap: true,
        removeUndefinedValues: true,
      });
      expect(callArgs[2]).toEqual({ wrapNumbers: false });
    });

    it('should use AWS region from config', async () => {
      // Arrange & Act
      await import('./dynamodb-client.js');

      // Assert
      expect(mockInitializeDynamoDBClients).toHaveBeenCalledWith(
        expect.objectContaining({ region: 'us-east-1' }),
        expect.any(Object),
        expect.any(Object),
      );
    });
  });

  describe('exports', () => {
    it('should export both dynamoClient and dynamoDocClient', async () => {
      // Arrange & Act
      const module = await import('./dynamodb-client.js');

      // Assert
      expect(module.dynamoClient).toBeDefined();
      expect(module.dynamoDocClient).toBeDefined();
    });

    it('should export dynamoClient as DynamoDBClient instance', async () => {
      // Arrange & Act
      const { dynamoClient: client } = await import('./dynamodb-client.js');

      // Assert
      expect(client.constructor.name).toBe('DynamoDBClient');
    });

    it('should export dynamoDocClient as DynamoDBDocumentClient instance', async () => {
      // Arrange & Act
      const { dynamoDocClient: docClient } = await import('./dynamodb-client.js');

      // Assert
      expect(docClient.constructor.name).toBe('DynamoDBDocumentClient');
    });
  });

  describe('LocalStack configuration', () => {
    it('should include endpoint and credentials when LocalStack is enabled', async () => {
      // Arrange
      vi.doMock('./config', () => ({
        config: {
          AWS_REGION: 'us-east-1',
          TASKS_TABLE: 'test-table',
          LOGGING_ENABLED: true,
          LOGGING_LEVEL: 'info',
          CORS_ALLOW_ORIGIN: '*',
          USE_LOCALSTACK: true,
          LOCALSTACK_ENDPOINT: 'http://localstack:4566',
        },
      }));

      // Act
      await import('./dynamodb-client.js');

      // Assert
      expect(mockInitializeDynamoDBClients).toHaveBeenCalledWith(
        expect.objectContaining({
          region: 'us-east-1',
          endpoint: 'http://localstack:4566',
          credentials: {
            accessKeyId: 'test',
            secretAccessKey: 'test',
          },
        }),
        expect.any(Object),
        expect.any(Object),
      );
    });

    it('should not include endpoint when LocalStack is disabled', async () => {
      // Arrange
      vi.doMock('./config', () => ({
        config: {
          AWS_REGION: 'us-east-1',
          TASKS_TABLE: 'test-table',
          LOGGING_ENABLED: true,
          LOGGING_LEVEL: 'info',
          CORS_ALLOW_ORIGIN: '*',
          USE_LOCALSTACK: false,
          LOCALSTACK_ENDPOINT: 'http://localhost:4566',
        },
      }));

      // Act
      await import('./dynamodb-client.js');

      // Assert
      expect(mockInitializeDynamoDBClients).toHaveBeenCalledWith(
        {
          region: 'us-east-1',
        },
        expect.any(Object),
        expect.any(Object),
      );
    });

    it('should log LocalStack endpoint when enabled', async () => {
      // Arrange
      vi.doMock('./config', () => ({
        config: {
          AWS_REGION: 'us-east-1',
          TASKS_TABLE: 'test-table',
          LOGGING_ENABLED: true,
          LOGGING_LEVEL: 'info',
          CORS_ALLOW_ORIGIN: '*',
          USE_LOCALSTACK: true,
          LOCALSTACK_ENDPOINT: 'http://localstack:4566',
        },
      }));

      // Act
      await import('./dynamodb-client.js');

      // Assert
      expect(mockLoggerInfo).toHaveBeenCalledWith(
        expect.objectContaining({
          dynamoDbClientConfig: expect.objectContaining({
            endpoint: 'http://localstack:4566',
            credentials: {
              accessKeyId: 'test',
              secretAccessKey: 'test',
            },
          }),
        }),
        expect.stringContaining('DynamoDBClient'),
      );
    });
  });
});
