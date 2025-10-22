import type { CsvConfig, Result } from '../../types.js';
import { HeaderInitializationError } from '../../errors.js';

/**
 * Manages CSV header initialization and key determination
 */
export class CsvHeaderManager<T extends Record<string, unknown>> {
  private headers: string[] | null = null;
  private keys: (keyof T)[] | null = null;

  constructor(private readonly config?: CsvConfig<T>) {}

  /**
   * Initializes headers from config or first data object
   */
  initialize(firstDataObject: T): Result<void> {
    if (this.headers !== null && this.keys !== null) {
      return { success: true, value: undefined };
    }

    // Determine which keys to use
    if (this.config?.includeKeys) {
      this.keys = this.config.includeKeys;
    } else if (this.config?.headers && this.config.headers.length > 0) {
      // If explicit headers provided, infer keys from first object
      this.keys = Object.keys(firstDataObject) as (keyof T)[];
    } else {
      this.keys = Object.keys(firstDataObject) as (keyof T)[];
    }

    if (this.keys.length === 0) {
      return {
        success: false,
        error: new HeaderInitializationError('Cannot determine headers from empty object'),
      };
    }

    // Determine header names
    if (this.config?.headers) {
      this.headers = this.config.headers;
    } else if (this.config?.columnMapping) {
      const mapping = this.config.columnMapping;
      this.headers = this.keys.map((key) => mapping[key] ?? String(key));
    } else {
      this.headers = this.keys.map(String);
    }

    return { success: true, value: undefined };
  }

  /**
   * Gets the header row values
   */
  getHeaders(): string[] {
    if (this.headers === null) {
      throw new HeaderInitializationError('Headers not initialized');
    }
    return this.headers;
  }

  /**
   * Gets the data keys in order
   */
  getKeys(): (keyof T)[] {
    if (this.keys === null) {
      throw new HeaderInitializationError('Keys not initialized');
    }
    return this.keys;
  }

  /**
   * Converts a data object to array of values in correct order
   */
  objectToValues(data: T): unknown[] {
    return this.getKeys().map((key) => data[key]);
  }

  /**
   * Checks if headers have been initialized
   */
  isInitialized(): boolean {
    return this.headers !== null && this.keys !== null;
  }
}
