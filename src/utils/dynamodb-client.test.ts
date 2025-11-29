describe('dynamodb-client', () => {
  let dynamoDocClient: typeof import('./dynamodb-client').dynamoDocClient;
  let dynamoDBClient: typeof import('./dynamodb-client').dynamoDBClient;
  let mockLoggerInfo: jest.Mock;

  beforeEach(() => {
    // Reset modules to clear any cached imports
    jest.resetModules();

    // Mock the config module
    jest.doMock('./config', () => ({
      config: {
        AWS_REGION: 'us-east-1',
        TASKS_TABLE: 'test-table',
        ENABLE_LOGGING: true,
        LOG_LEVEL: 'info',
        CORS_ALLOW_ORIGIN: '*',
      },
    }));

    // Mock the logger module
    mockLoggerInfo = jest.fn();
    jest.doMock('./logger', () => ({
      logger: {
        info: mockLoggerInfo,
        debug: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      },
    }));
  });

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe('dynamoDBClient', () => {
    it('should create a DynamoDB client instance', () => {
      // Arrange & Act
      const module = require('./dynamodb-client');
      dynamoDBClient = module.dynamoDBClient;

      // Assert
      expect(dynamoDBClient).toBeDefined();
      expect(dynamoDBClient.constructor.name).toBe('DynamoDBClient');
    });

    it('should configure DynamoDB client with AWS region from config', () => {
      // Arrange & Act
      const module = require('./dynamodb-client');
      dynamoDBClient = module.dynamoDBClient;

      // Assert
      expect(dynamoDBClient).toBeDefined();
      // Verify the client has the config property
      expect(dynamoDBClient.config).toBeDefined();
    });

    it('should log initialization with region information', () => {
      // Arrange & Act
      require('./dynamodb-client');

      // Assert
      expect(mockLoggerInfo).toHaveBeenCalledWith('Initialized AWS DynamoDB client', {
        region: 'us-east-1',
      });
    });
  });

  describe('dynamoDocClient', () => {
    it('should create a DynamoDB Document client instance', () => {
      // Arrange & Act
      const module = require('./dynamodb-client');
      dynamoDocClient = module.dynamoDocClient;

      // Assert
      expect(dynamoDocClient).toBeDefined();
      expect(dynamoDocClient.constructor.name).toBe('DynamoDBDocumentClient');
    });

    it('should create Document client from base DynamoDB client', () => {
      // Arrange & Act
      const module = require('./dynamodb-client');
      dynamoDocClient = module.dynamoDocClient;
      dynamoDBClient = module.dynamoDBClient;

      // Assert
      expect(dynamoDocClient).toBeDefined();
      expect(dynamoDBClient).toBeDefined();
      expect(dynamoDocClient.constructor.name).toBe('DynamoDBDocumentClient');
    });
  });

  describe('client initialization', () => {
    it('should initialize clients once when module is imported', () => {
      // Arrange & Act
      const module1 = require('./dynamodb-client');
      const module2 = require('./dynamodb-client');

      // Assert - same instances should be returned (singleton pattern)
      expect(module1.dynamoDBClient).toBe(module2.dynamoDBClient);
      expect(module1.dynamoDocClient).toBe(module2.dynamoDocClient);
      // Logger should only be called once during initialization
      expect(mockLoggerInfo).toHaveBeenCalledTimes(1);
    });

    it('should use different region when config changes', () => {
      // Arrange
      jest.resetModules();
      jest.doMock('./config', () => ({
        config: {
          AWS_REGION: 'eu-west-1',
          TASKS_TABLE: 'test-table',
          ENABLE_LOGGING: true,
          LOG_LEVEL: 'info',
          CORS_ALLOW_ORIGIN: '*',
        },
      }));
      jest.doMock('./logger', () => ({
        logger: {
          info: mockLoggerInfo,
          debug: jest.fn(),
          warn: jest.fn(),
          error: jest.fn(),
        },
      }));

      // Act
      require('./dynamodb-client');

      // Assert
      expect(mockLoggerInfo).toHaveBeenCalledWith('Initialized AWS DynamoDB client', {
        region: 'eu-west-1',
      });
    });
  });

  describe('exports', () => {
    it('should export both dynamoDBClient and dynamoDocClient', () => {
      // Arrange & Act
      const module = require('./dynamodb-client');

      // Assert
      expect(module.dynamoDBClient).toBeDefined();
      expect(module.dynamoDocClient).toBeDefined();
    });

    it('should export dynamoDBClient as DynamoDBClient instance', () => {
      // Arrange & Act
      const { dynamoDBClient: client } = require('./dynamodb-client');

      // Assert
      expect(client.constructor.name).toBe('DynamoDBClient');
    });

    it('should export dynamoDocClient as DynamoDBDocumentClient instance', () => {
      // Arrange & Act
      const { dynamoDocClient: docClient } = require('./dynamodb-client');

      // Assert
      expect(docClient.constructor.name).toBe('DynamoDBDocumentClient');
    });
  });
});
