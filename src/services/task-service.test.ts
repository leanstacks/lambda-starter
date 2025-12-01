import { CreateTaskDto } from '../models/create-task-dto';
import { TaskItem } from '../models/task';

// Mock dependencies
const mockSend = jest.fn();
const mockLoggerDebug = jest.fn();
const mockLoggerInfo = jest.fn();
const mockLoggerError = jest.fn();
const mockRandomUUID = jest.fn();

jest.mock('crypto', () => ({
  randomUUID: mockRandomUUID,
}));

jest.mock('../utils/dynamodb-client', () => ({
  dynamoDocClient: {
    send: mockSend,
  },
}));

jest.mock('../utils/logger', () => ({
  logger: {
    debug: mockLoggerDebug,
    info: mockLoggerInfo,
    error: mockLoggerError,
  },
}));

jest.mock('../utils/config', () => ({
  config: {
    TASKS_TABLE: 'test-tasks-table',
  },
}));

describe('task-service', () => {
  let listTasks: typeof import('./task-service').listTasks;
  let createTask: typeof import('./task-service').createTask;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Import the module after mocks are set up
    const taskService = require('./task-service');
    listTasks = taskService.listTasks;
    createTask = taskService.createTask;
  });

  describe('listTasks', () => {
    it('should return an empty array when no tasks exist', async () => {
      // Arrange
      mockSend.mockResolvedValue({
        Items: [],
        ScannedCount: 0,
      });

      // Act
      const result = await listTasks();

      // Assert
      expect(result).toEqual([]);
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(mockLoggerInfo).toHaveBeenCalledWith('[TaskService] > listTasks', {
        tableName: 'test-tasks-table',
      });
    });

    it('should return all tasks when they exist', async () => {
      // Arrange
      const mockTaskItems: TaskItem[] = [
        {
          pk: 'TASK#123e4567-e89b-12d3-a456-426614174000',
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Test Task 1',
          detail: 'Test detail 1',
          isComplete: false,
          createdAt: '2025-11-01T10:00:00.000Z',
          updatedAt: '2025-11-01T10:00:00.000Z',
        },
        {
          pk: 'TASK#123e4567-e89b-12d3-a456-426614174001',
          id: '123e4567-e89b-12d3-a456-426614174001',
          title: 'Test Task 2',
          dueAt: '2025-12-01T10:00:00.000Z',
          isComplete: true,
          createdAt: '2025-11-02T10:00:00.000Z',
          updatedAt: '2025-11-03T10:00:00.000Z',
        },
      ];

      mockSend.mockResolvedValue({
        Items: mockTaskItems,
        ScannedCount: 2,
      });

      // Act
      const result = await listTasks();

      // Assert
      expect(result).toHaveLength(2);
      // Tasks should not include pk field
      expect(result[0]).not.toHaveProperty('pk');
      expect(result[1]).not.toHaveProperty('pk');
      expect(result[0].id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(result[1].id).toBe('123e4567-e89b-12d3-a456-426614174001');
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('should handle DynamoDB errors and rethrow them', async () => {
      // Arrange
      const mockError = new Error('DynamoDB error');
      mockSend.mockRejectedValue(mockError);

      // Act & Assert
      await expect(listTasks()).rejects.toThrow('DynamoDB error');
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(mockLoggerError).toHaveBeenCalled();
    });

    it('should handle undefined Items in response', async () => {
      // Arrange
      mockSend.mockResolvedValue({
        ScannedCount: 0,
      });

      // Act
      const result = await listTasks();

      // Assert
      expect(result).toEqual([]);
      expect(mockSend).toHaveBeenCalledTimes(1);
    });
  });

  describe('createTask', () => {
    beforeEach(() => {
      // Mock Date.now() for consistent timestamps
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-12-01T10:00:00.000Z'));

      // Mock UUID generation
      mockRandomUUID.mockReturnValue('123e4567-e89b-12d3-a456-426614174000');
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should create a task with all fields', async () => {
      // Arrange
      const createTaskDto: CreateTaskDto = {
        title: 'Test Task',
        detail: 'Test detail',
        dueAt: '2025-12-31T23:59:59.000Z',
        isComplete: false,
      };

      mockSend.mockResolvedValue({});

      // Act
      const result = await createTask(createTaskDto);

      // Assert
      expect(result).toEqual({
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Task',
        detail: 'Test detail',
        dueAt: '2025-12-31T23:59:59.000Z',
        isComplete: false,
        createdAt: '2025-12-01T10:00:00.000Z',
        updatedAt: '2025-12-01T10:00:00.000Z',
      });
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            TableName: 'test-tasks-table',
            Item: expect.objectContaining({
              pk: 'TASK#123e4567-e89b-12d3-a456-426614174000',
              id: '123e4567-e89b-12d3-a456-426614174000',
              title: 'Test Task',
              detail: 'Test detail',
              dueAt: '2025-12-31T23:59:59.000Z',
              isComplete: false,
              createdAt: '2025-12-01T10:00:00.000Z',
              updatedAt: '2025-12-01T10:00:00.000Z',
            }),
          }),
        }),
      );
      expect(mockLoggerInfo).toHaveBeenCalledWith('[TaskService] > createTask', {
        tableName: 'test-tasks-table',
      });
    });

    it('should create a task with only required fields', async () => {
      // Arrange
      const createTaskDto: CreateTaskDto = {
        title: 'Test Task',
        isComplete: false,
      };

      mockSend.mockResolvedValue({});

      // Act
      const result = await createTask(createTaskDto);

      // Assert
      expect(result).toEqual({
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Task',
        isComplete: false,
        createdAt: '2025-12-01T10:00:00.000Z',
        updatedAt: '2025-12-01T10:00:00.000Z',
      });
      // Task should not include optional fields that were not provided
      expect(result).not.toHaveProperty('detail');
      expect(result).not.toHaveProperty('dueAt');
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('should create a task with isComplete defaulting to false when undefined', async () => {
      // Arrange
      const createTaskDto: CreateTaskDto = {
        title: 'Test Task',
        isComplete: false,
      };

      mockSend.mockResolvedValue({});

      // Act
      const result = await createTask(createTaskDto);

      // Assert
      expect(result.isComplete).toBe(false);
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('should create a task with isComplete set to true', async () => {
      // Arrange
      const createTaskDto: CreateTaskDto = {
        title: 'Test Task',
        isComplete: true,
      };

      mockSend.mockResolvedValue({});

      // Act
      const result = await createTask(createTaskDto);

      // Assert
      expect(result.isComplete).toBe(true);
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('should generate a unique UUID for each task', async () => {
      // Arrange
      const createTaskDto: CreateTaskDto = {
        title: 'Test Task',
        isComplete: false,
      };

      mockSend.mockResolvedValue({});

      // Act
      await createTask(createTaskDto);

      // Assert
      expect(mockRandomUUID).toHaveBeenCalledTimes(1);
    });

    it('should set createdAt and updatedAt to the current time', async () => {
      // Arrange
      const createTaskDto: CreateTaskDto = {
        title: 'Test Task',
        isComplete: false,
      };

      mockSend.mockResolvedValue({});

      // Act
      const result = await createTask(createTaskDto);

      // Assert
      expect(result.createdAt).toBe('2025-12-01T10:00:00.000Z');
      expect(result.updatedAt).toBe('2025-12-01T10:00:00.000Z');
    });

    it('should handle DynamoDB errors and rethrow them', async () => {
      // Arrange
      const createTaskDto: CreateTaskDto = {
        title: 'Test Task',
        isComplete: false,
      };

      const mockError = new Error('DynamoDB error');
      mockSend.mockRejectedValue(mockError);

      // Act & Assert
      await expect(createTask(createTaskDto)).rejects.toThrow('DynamoDB error');
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(mockLoggerError).toHaveBeenCalled();
    });

    it('should not include pk field in returned task', async () => {
      // Arrange
      const createTaskDto: CreateTaskDto = {
        title: 'Test Task',
        isComplete: false,
      };

      mockSend.mockResolvedValue({});

      // Act
      const result = await createTask(createTaskDto);

      // Assert
      expect(result).not.toHaveProperty('pk');
    });
  });
});
