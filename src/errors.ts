/**
 * Base error class for Outport library
 */
export class OutportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error thrown when writer validation fails
 */
export class ValidationError extends OutportError {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Error thrown when CSV formatting fails
 */
export class CsvFormattingError extends OutportError {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Error thrown when file write operations fail
 */
export class FileWriteError extends OutportError {
  constructor(
    message: string,
    public readonly originalError?: Error
  ) {
    super(message);
  }
}

/**
 * Error thrown when header initialization fails
 */
export class HeaderInitializationError extends OutportError {
  constructor(message: string) {
    super(message);
  }
}
