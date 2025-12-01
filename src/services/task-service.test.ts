import { TaskItem } from '../models/task';

// Mock dependencies
const mockSend = jest.fn();
const mockLoggerInfo = jest.fn();
const mockLoggerError = jest.fn();

jest.mock('../utils/dynamodb-client', () => ({
  dynamoDocClient: {
    send: mockSend,
  },
}));

jest.mock('../utils/logger', () => ({
  logger: {
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

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Import the module after mocks are set up
    listTasks = require('./task-service').listTasks;
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
});
