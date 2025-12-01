describe('logger', () => {
  let logger: typeof import('./logger').logger;
  let mockDebug: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]]>;
  let mockInfo: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]]>;
  let mockWarn: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]]>;
  let mockError: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]]>;

  // Helper to mock config before importing logger
  function setConfig(overrides: Partial<{ ENABLE_LOGGING: boolean; LOG_LEVEL: string; LOG_FORMAT: string }>) {
    jest.resetModules();
    jest.doMock('./config', () => ({
      config: {
        ENABLE_LOGGING: true,
        LOG_LEVEL: 'debug',
        LOG_FORMAT: 'json',
        ...overrides,
      },
    }));
    logger = require('./logger').logger;
  }

  beforeEach(() => {
    jest.resetModules();
    mockDebug = jest.spyOn(console, 'debug').mockImplementation(() => {});
    mockInfo = jest.spyOn(console, 'info').mockImplementation(() => {});
    mockWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    mockError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    mockDebug.mockRestore();
    mockInfo.mockRestore();
    mockWarn.mockRestore();
    mockError.mockRestore();
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('logs debug when enabled and level is debug', () => {
    // Arrange
    setConfig({ ENABLE_LOGGING: true, LOG_LEVEL: 'debug', LOG_FORMAT: 'text' });

    // Act
    logger.debug('debug message', { foo: 'bar' });

    // Assert
    expect(mockDebug).toHaveBeenCalledWith('debug message', { foo: 'bar' });
  });

  it('does not log debug if level is info', () => {
    // Arrange
    setConfig({ ENABLE_LOGGING: true, LOG_LEVEL: 'info' });

    // Act
    logger.debug('should not log');

    // Assert
    expect(mockDebug).not.toHaveBeenCalled();
  });

  it('logs info when enabled and level is info', () => {
    // Arrange
    setConfig({ ENABLE_LOGGING: true, LOG_LEVEL: 'info', LOG_FORMAT: 'text' });

    // Act
    logger.info('info message');

    // Assert
    expect(mockInfo).toHaveBeenCalledWith('info message', undefined);
  });

  it('does not log info if level is warn', () => {
    // Arrange
    setConfig({ ENABLE_LOGGING: true, LOG_LEVEL: 'warn' });

    // Act
    logger.info('should not log');

    // Assert
    expect(mockInfo).not.toHaveBeenCalled();
  });

  it('logs warn when enabled and level is warn', () => {
    // Arrange
    setConfig({ ENABLE_LOGGING: true, LOG_LEVEL: 'warn', LOG_FORMAT: 'text' });

    // Act
    logger.warn('warn message', { a: 1 });

    // Assert
    expect(mockWarn).toHaveBeenCalledWith('warn message', { a: 1 });
  });

  it('logs error with error object', () => {
    // Arrange
    setConfig({ ENABLE_LOGGING: true, LOG_LEVEL: 'error', LOG_FORMAT: 'text' });
    const error = new Error('fail');

    // Act
    logger.error('error message', error, { foo: 1 });

    // Assert
    expect(mockError).toHaveBeenCalled();
    const errorContext = mockError.mock.calls[0][1] as Record<string, unknown>;
    expect(errorContext.errorMessage).toBe('fail');
    expect(errorContext.foo).toBe(1);
    expect(errorContext.stack).toBeDefined();
  });

  it('logs error without error object', () => {
    // Arrange
    setConfig({ ENABLE_LOGGING: true, LOG_LEVEL: 'error', LOG_FORMAT: 'text' });

    // Act
    logger.error('error message');

    // Assert
    expect(mockError).toHaveBeenCalledWith('error message', undefined);
  });

  it('does not log if ENABLE_LOGGING is false', () => {
    // Arrange
    setConfig({ ENABLE_LOGGING: false, LOG_LEVEL: 'debug' });

    // Act
    logger.debug('should not log');
    logger.info('should not log');
    logger.warn('should not log');
    logger.error('should not log');

    // Assert
    expect(mockDebug).not.toHaveBeenCalled();
    expect(mockInfo).not.toHaveBeenCalled();
    expect(mockWarn).not.toHaveBeenCalled();
    expect(mockError).not.toHaveBeenCalled();
  });

  describe('JSON format', () => {
    let stdoutSpy: jest.SpyInstance;

    beforeEach(() => {
      stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    });

    afterEach(() => {
      stdoutSpy.mockRestore();
    });

    it('logs as JSON when LOG_FORMAT is json', () => {
      // Arrange
      setConfig({ ENABLE_LOGGING: true, LOG_LEVEL: 'info', LOG_FORMAT: 'json' });

      // Act
      logger.info('test message', { userId: 123 });

      // Assert
      expect(stdoutSpy).toHaveBeenCalled();
      const logOutput = stdoutSpy.mock.calls[0][0] as string;
      const parsed = JSON.parse(logOutput);
      expect(parsed).toMatchObject({
        level: 'info',
        msg: 'test message',
        context: { userId: 123 },
      });
      expect(parsed.time).toBeDefined();
    });

    it('logs context as separate fields in JSON format', () => {
      // Arrange
      setConfig({ ENABLE_LOGGING: true, LOG_LEVEL: 'debug', LOG_FORMAT: 'json' });

      // Act
      logger.debug('processing request', { requestId: 'abc-123', duration: 250 });

      // Assert
      expect(stdoutSpy).toHaveBeenCalled();
      const logOutput = stdoutSpy.mock.calls[0][0] as string;
      const parsed = JSON.parse(logOutput);
      expect(parsed.context.requestId).toBe('abc-123');
      expect(parsed.context.duration).toBe(250);
      expect(parsed.msg).toBe('processing request');
    });

    it('logs error details in JSON format', () => {
      // Arrange
      setConfig({ ENABLE_LOGGING: true, LOG_LEVEL: 'error', LOG_FORMAT: 'json' });
      const error = new Error('test error');

      // Act
      logger.error('operation failed', error, { operation: 'getData' });

      // Assert
      expect(stdoutSpy).toHaveBeenCalled();
      const logOutput = stdoutSpy.mock.calls[0][0] as string;
      const parsed = JSON.parse(logOutput);
      expect(parsed.msg).toBe('operation failed');
      expect(parsed.context.errorMessage).toBe('test error');
      expect(parsed.context.operation).toBe('getData');
      expect(parsed.context.stack).toBeDefined();
    });
  });

  describe('text format', () => {
    it('logs as text when LOG_FORMAT is text', () => {
      // Arrange
      setConfig({ ENABLE_LOGGING: true, LOG_LEVEL: 'info', LOG_FORMAT: 'text' });

      // Act
      logger.info('test message', { userId: 123 });

      // Assert
      expect(mockInfo).toHaveBeenCalled();
      const message = mockInfo.mock.calls[0][0] as string;
      const context = mockInfo.mock.calls[0][1] as Record<string, unknown>;
      expect(message).toBe('test message');
      expect(context).toEqual({ userId: 123 });
    });

    it('logs with context as stringified object in text format', () => {
      // Arrange
      setConfig({ ENABLE_LOGGING: true, LOG_LEVEL: 'warn', LOG_FORMAT: 'text' });

      // Act
      logger.warn('warning message', { code: 'WARN_001' });

      // Assert
      expect(mockWarn).toHaveBeenCalled();
      const message = mockWarn.mock.calls[0][0] as string;
      const context = mockWarn.mock.calls[0][1] as Record<string, unknown>;
      expect(message).toBe('warning message');
      expect(context).toEqual({ code: 'WARN_001' });
    });

    it('logs error with error details in text format', () => {
      // Arrange
      setConfig({ ENABLE_LOGGING: true, LOG_LEVEL: 'error', LOG_FORMAT: 'text' });
      const error = new Error('test error');

      // Act
      logger.error('operation failed', error);

      // Assert
      expect(mockError).toHaveBeenCalled();
      const message = mockError.mock.calls[0][0] as string;
      const context = mockError.mock.calls[0][1] as Record<string, unknown>;
      expect(message).toBe('operation failed');
      expect(context.errorMessage).toBe('test error');
      expect(context.stack).toBeDefined();
    });
  });
});
