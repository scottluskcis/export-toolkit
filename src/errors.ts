/**
 * Base error class for all Outport errors.
 *
 * All custom errors in the Outport library extend from this class,
 * making it easy to catch all Outport-specific errors.
 *
 * @example
 * ```typescript
 * try {
 *   writer.writeSync(data);
 * } catch (error) {
 *   if (error instanceof OutportError) {
 *     console.error('Outport error:', error.message);
 *   }
 * }
 * ```
 */
export class OutportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OutportError';
  }
}

/**
 * Error thrown when input validation fails.
 *
 * This error occurs when invalid configuration is provided,
 * such as empty file paths, invalid delimiters, or empty data arrays.
 *
 * @example
 * ```typescript
 * // Throws ValidationError: Cannot write empty data array
 * writer.writeSync([]);
 * ```
 */
export class ValidationError extends OutportError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Error thrown when CSV formatting fails.
 *
 * This error occurs when data cannot be properly formatted as CSV,
 * typically due to unexpected data types or formatting issues.
 */
export class CsvFormattingError extends OutportError {
  constructor(message: string) {
    super(message);
    this.name = 'CsvFormattingError';
  }
}

/**
 * Error thrown when JSON formatting fails.
 *
 * This error occurs when data cannot be properly formatted as JSON,
 * typically due to circular references or non-serializable values.
 */
export class JsonFormattingError extends OutportError {
  constructor(message: string) {
    super(message);
    this.name = 'JsonFormattingError';
  }
}

/**
 * Error thrown when file write operation fails.
 *
 * This error wraps underlying file system errors, providing context
 * about the failed operation while preserving the original error.
 *
 * @property originalError - The underlying error that caused the failure
 *
 * @example
 * ```typescript
 * const result = writer.writeSync(data);
 * if (!result.success && result.error instanceof FileWriteError) {
 *   console.error('File operation failed:', result.error.message);
 *   console.error('Original error:', result.error.originalError);
 * }
 * ```
 */
export class FileWriteError extends OutportError {
  public readonly originalError?: Error;

  constructor(message: string, originalError?: Error) {
    super(message);
    this.name = 'FileWriteError';
    this.originalError = originalError;
  }
}

/**
 * Error thrown when header initialization fails.
 *
 * This error occurs when headers cannot be properly initialized from
 * the provided data or configuration.
 */
export class HeaderInitializationError extends OutportError {
  constructor(message: string) {
    super(message);
    this.name = 'HeaderInitializationError';
  }
}
