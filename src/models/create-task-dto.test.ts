import { CreateTaskDtoSchema } from './create-task-dto';

describe('create-task-dto', () => {
  describe('CreateTaskDtoSchema', () => {
    it('should validate a valid create task DTO with all fields', () => {
      // Arrange
      const validDto = {
        title: 'Test Task',
        detail: 'Test detail',
        dueAt: '2025-12-31T23:59:59.000Z',
        isComplete: false,
      };

      // Act
      const result = CreateTaskDtoSchema.safeParse(validDto);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validDto);
      }
    });

    it('should validate a valid create task DTO with only title', () => {
      // Arrange
      const validDto = {
        title: 'Test Task',
      };

      // Act
      const result = CreateTaskDtoSchema.safeParse(validDto);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('Test Task');
        expect(result.data.isComplete).toBe(false); // Default value
      }
    });

    it('should validate a valid create task DTO with optional fields', () => {
      // Arrange
      const validDto = {
        title: 'Test Task',
        detail: 'Test detail',
        isComplete: true,
      };

      // Act
      const result = CreateTaskDtoSchema.safeParse(validDto);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validDto);
      }
    });

    it('should reject when title is missing', () => {
      // Arrange
      const invalidDto = {
        detail: 'Test detail',
      };

      // Act
      const result = CreateTaskDtoSchema.safeParse(invalidDto);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(1);
        expect(result.error.issues[0].path).toEqual(['title']);
      }
    });

    it('should reject when title is empty string', () => {
      // Arrange
      const invalidDto = {
        title: '',
      };

      // Act
      const result = CreateTaskDtoSchema.safeParse(invalidDto);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Title is required');
      }
    });

    it('should reject when title exceeds 100 characters', () => {
      // Arrange
      const invalidDto = {
        title: 'a'.repeat(101),
      };

      // Act
      const result = CreateTaskDtoSchema.safeParse(invalidDto);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Title must not exceed 100 characters');
      }
    });

    it('should accept title with exactly 100 characters', () => {
      // Arrange
      const validDto = {
        title: 'a'.repeat(100),
      };

      // Act
      const result = CreateTaskDtoSchema.safeParse(validDto);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should reject when detail exceeds 1000 characters', () => {
      // Arrange
      const invalidDto = {
        title: 'Test Task',
        detail: 'a'.repeat(1001),
      };

      // Act
      const result = CreateTaskDtoSchema.safeParse(invalidDto);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Detail must not exceed 1000 characters');
      }
    });

    it('should accept detail with exactly 1000 characters', () => {
      // Arrange
      const validDto = {
        title: 'Test Task',
        detail: 'a'.repeat(1000),
      };

      // Act
      const result = CreateTaskDtoSchema.safeParse(validDto);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should reject when dueAt is not a valid ISO8601 timestamp', () => {
      // Arrange
      const invalidDto = {
        title: 'Test Task',
        dueAt: '2025-12-31',
      };

      // Act
      const result = CreateTaskDtoSchema.safeParse(invalidDto);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('ISO8601');
      }
    });

    it('should reject when dueAt is not a valid date string', () => {
      // Arrange
      const invalidDto = {
        title: 'Test Task',
        dueAt: 'invalid-date',
      };

      // Act
      const result = CreateTaskDtoSchema.safeParse(invalidDto);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('ISO8601');
      }
    });

    it('should accept valid ISO8601 timestamp with timezone', () => {
      // Arrange
      const validDto = {
        title: 'Test Task',
        dueAt: '2025-12-31T23:59:59.000Z',
      };

      // Act
      const result = CreateTaskDtoSchema.safeParse(validDto);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should reject when isComplete is not a boolean', () => {
      // Arrange
      const invalidDto = {
        title: 'Test Task',
        isComplete: 'true',
      };

      // Act
      const result = CreateTaskDtoSchema.safeParse(invalidDto);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['isComplete']);
      }
    });

    it('should accept isComplete as true', () => {
      // Arrange
      const validDto = {
        title: 'Test Task',
        isComplete: true,
      };

      // Act
      const result = CreateTaskDtoSchema.safeParse(validDto);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isComplete).toBe(true);
      }
    });

    it('should reject when extra fields are provided', () => {
      // Arrange
      const invalidDto = {
        title: 'Test Task',
        extraField: 'should not be here',
      };

      // Act
      const result = CreateTaskDtoSchema.safeParse(invalidDto);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('unrecognized_keys');
      }
    });
  });
});
