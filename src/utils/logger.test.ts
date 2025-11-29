describe('logger', () => {
  let logger: typeof import('./logger').logger;
  let mockDebug: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]]>;
  let mockInfo: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]]>;
  let mockWarn: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]]>;
  let mockError: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]]>;

  // Helper to mock config before importing logger
  function setConfig(overrides: Partial<{ ENABLE_LOGGING: boolean; LOG_LEVEL: string }>) {
    jest.resetModules();
    jest.doMock('./config', () => ({
      config: {
        ENABLE_LOGGING: true,
        LOG_LEVEL: 'debug',
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
    setConfig({ ENABLE_LOGGING: true, LOG_LEVEL: 'debug' });

    // Act
    logger.debug('debug message', { foo: 'bar' });

    // Assert
    expect(mockDebug).toHaveBeenCalledWith(expect.stringContaining('[DEBUG] debug message'));
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
    setConfig({ ENABLE_LOGGING: true, LOG_LEVEL: 'info' });

    // Act
    logger.info('info message');

    // Assert
    expect(mockInfo).toHaveBeenCalledWith(expect.stringContaining('[INFO] info message'));
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
    setConfig({ ENABLE_LOGGING: true, LOG_LEVEL: 'warn' });

    // Act
    logger.warn('warn message', { a: 1 });

    // Assert
    expect(mockWarn).toHaveBeenCalledWith(expect.stringContaining('[WARN] warn message'));
  });

  it('logs error with error object', () => {
    // Arrange
    setConfig({ ENABLE_LOGGING: true, LOG_LEVEL: 'error' });
    const error = new Error('fail');

    // Act
    logger.error('error message', error, { foo: 1 });

    // Assert
    expect(mockError).toHaveBeenCalledWith(expect.stringContaining('[ERROR] error message'));
    const logStr = mockError.mock.calls[0][0] as string;
    expect(logStr).toContain('fail');
    expect(logStr).toContain('stack');
  });

  it('logs error without error object', () => {
    // Arrange
    setConfig({ ENABLE_LOGGING: true, LOG_LEVEL: 'error' });

    // Act
    logger.error('error message');

    // Assert
    expect(mockError).toHaveBeenCalledWith(expect.stringContaining('[ERROR] error message'));
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
});
