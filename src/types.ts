/**
 * Result type for operations that can fail.
 *
 * This discriminated union provides type-safe error handling without exceptions.
 * Check the `success` property to determine if the operation succeeded.
 *
 * @template T - The type of the success value
 * @template E - The type of the error (defaults to Error)
 *
 * @example
 * ```typescript
 * const result = writer.writeSync(data);
 * if (result.success) {
 *   console.log('Success!', result.value);
 * } else {
 *   console.error('Error:', result.error.message);
 * }
 * ```
 */
export type Result<T, E = Error> = { success: true; value: T } | { success: false; error: E };

// Writer interface with generics and async support
/**
 * Generic writer interface for all data exporters.
 *
 * Provides both synchronous and asynchronous methods for writing and appending data.
 * All methods use the Result type for error handling instead of throwing exceptions.
 *
 * @template T - The type of data objects being written. Must extend Record<string, unknown>
 *
 * @example
 * ```typescript
 * interface User extends Record<string, unknown> {
 *   id: number;
 *   name: string;
 * }
 *
 * const writer: OutportWriter<User> = new CsvWriter({...});
 *
 * // Synchronous write
 * const result = writer.writeSync([{ id: 1, name: 'Alice' }]);
 *
 * // Asynchronous append
 * await writer.append({ id: 2, name: 'Bob' });
 * ```
 */
export interface OutportWriter<T extends Record<string, unknown>> {
  /**
   * Synchronously write multiple rows of data.
   *
   * In 'write' mode, overwrites the file. In 'append' mode, adds to existing content.
   *
   * @param data - Array of data objects to write
   * @returns Result indicating success or failure
   */
  writeSync(data: T[]): Result<void>;

  /**
   * Asynchronously write multiple rows of data.
   *
   * In 'write' mode, overwrites the file. In 'append' mode, adds to existing content.
   *
   * @param data - Array of data objects to write
   * @returns Promise of Result indicating success or failure
   */
  write(data: T[]): Promise<Result<void>>;

  /**
   * Synchronously append one or more rows to the file.
   *
   * If the file doesn't exist, creates it with headers.
   *
   * @param data - Single data object or array of objects to append
   * @returns Result indicating success or failure
   */
  appendSync(data: T | T[]): Result<void>;

  /**
   * Asynchronously append one or more rows to the file.
   *
   * If the file doesn't exist, creates it with headers.
   *
   * @param data - Single data object or array of objects to append
   * @returns Promise of Result indicating success or failure
   */
  append(data: T | T[]): Promise<Result<void>>;
}

/**
 * Supported writer types for data export.
 *
 * - `csv` - Comma-separated values format
 * - `json` - JavaScript Object Notation format (coming soon)
 */
export type WriterType = 'csv' | 'json';

/**
 * Write mode determining how the writer handles existing files.
 *
 * - `write` - Overwrites the entire file on each write operation
 * - `append` - Adds data to the end of existing files
 *
 * @example
 * ```typescript
 * // Overwrite mode - clears file each time
 * const writer1 = new CsvWriter({ type: 'csv', mode: 'write', file: 'data.csv' });
 *
 * // Append mode - adds to existing file
 * const writer2 = new CsvWriter({ type: 'csv', mode: 'append', file: 'data.csv' });
 * ```
 */
export type WriterMode = 'write' | 'append';

/**
 * CSV-specific configuration options.
 *
 * Customize CSV output format, headers, delimiters, and encoding.
 *
 * @template T - The type of data objects being written
 *
 * @example
 * ```typescript
 * // Tab-separated with custom headers
 * const config: CsvConfig<User> = {
 *   delimiter: '\t',
 *   headers: ['ID', 'Name', 'Email'],
 *   includeUtf8Bom: true
 * };
 * ```
 */
export interface CsvConfig<T> {
  /**
   * Column delimiter character (default: ',').
   *
   * Must be a single character. Common values:
   * - ',' - Comma (default)
   * - '\t' - Tab (TSV files)
   * - ';' - Semicolon (European CSV)
   * - '|' - Pipe
   */
  delimiter?: string;

  /**
   * Quote character for escaping values (default: '"').
   *
   * Must be a single character. Values containing delimiters,
   * newlines, or quotes will be wrapped in this character.
   */
  quote?: string;

  /**
   * Map object keys to custom column names.
   *
   * @example
   * ```typescript
   * columnMapping: {
   *   userId: 'User ID',
   *   fullName: 'Full Name'
   * }
   * ```
   */
  columnMapping?: Partial<Record<keyof T, string>>;

  /**
   * Explicitly set column headers in desired order.
   *
   * If not provided, headers are inferred from the first data object.
   *
   * @example
   * ```typescript
   * headers: ['ID', 'Name', 'Email']
   * ```
   */
  headers?: string[];

  /**
   * Keys to include from data objects, in the desired order.
   *
   * If not provided, all keys from the first data object are used.
   *
   * @example
   * ```typescript
   * includeKeys: ['id', 'name'] // Only export these columns
   * ```
   */
  includeKeys?: (keyof T)[];

  /**
   * Include UTF-8 Byte Order Mark (BOM) at the start of the file.
   *
   * Set to true for better Excel compatibility when your data contains
   * non-ASCII characters (accents, emoji, etc.). Modern tools ignore the BOM.
   *
   * @default false
   */
  includeUtf8Bom?: boolean;
}

/**
 * JSON-specific configuration options.
 *
 * Customize JSON output format, indentation, and structure.
 *
 * @example
 * ```typescript
 * // Pretty-printed with 2-space indentation
 * const config: JsonConfig = {
 *   prettyPrint: true,
 *   indent: 2
 * };
 * ```
 */
export interface JsonConfig {
  /**
   * Enable pretty-printing (formatted with indentation and newlines).
   *
   * When true, output will be human-readable with proper indentation.
   * When false, output will be compact single-line JSON.
   *
   * @default true
   */
  prettyPrint?: boolean;

  /**
   * Number of spaces for indentation when prettyPrint is enabled.
   *
   * Only applies when prettyPrint is true.
   *
   * @default 2
   */
  indent?: number;

  /**
   * Include UTF-8 Byte Order Mark (BOM) at the start of the file.
   *
   * Set to true for better compatibility with some legacy tools when your data
   * contains non-ASCII characters (accents, emoji, etc.).
   *
   * @default false
   */
  includeUtf8Bom?: boolean;
}

/**
 * Complete writer options including type-specific configuration.
 *
 * Includes the base writer configuration plus optional format-specific settings.
 *
 * @template T - The type of data objects being written
 *
 * @example
 * ```typescript
 * const options: WriterOptions<User> = {
 *   type: 'csv',
 *   mode: 'write',
 *   file: './output/users.csv',
 *   csvConfig: {
 *     delimiter: '\t',
 *     includeUtf8Bom: true
 *   }
 * };
 * ```
 */
export interface WriterOptions<T = unknown> {
  /** The type of writer to use (e.g., 'csv', 'json') */
  type: WriterType;

  /** Write mode: 'write' to overwrite, 'append' to add to existing file */
  mode: WriterMode;

  /** Destination file path (absolute or relative) */
  file: string;

  /** CSV-specific configuration options */
  csvConfig?: CsvConfig<T>;

  /** JSON-specific configuration options */
  jsonConfig?: JsonConfig;
}

/**
 * Alias for WriterOptions - used by factory pattern.
 *
 * @template T - The type of data objects being written
 */
export type WriterConfig<T = unknown> = WriterOptions<T>;

/**
 * File writer abstraction for testability and dependency injection.
 *
 * Provides a consistent interface for file I/O operations, making it easy
 * to mock file operations in tests or swap implementations.
 *
 * @example
 * ```typescript
 * // Use custom file writer for testing
 * const mockWriter: FileWriter = {
 *   writeSync: (path, content) => ({ success: true, value: undefined }),
 *   write: async (path, content) => ({ success: true, value: undefined }),
 *   appendSync: (path, content) => ({ success: true, value: undefined }),
 *   append: async (path, content) => ({ success: true, value: undefined }),
 *   existsSync: (path) => false,
 *   exists: async (path) => false,
 * };
 *
 * const writer = new CsvWriter(config, mockWriter);
 * ```
 */
export interface FileWriter {
  /**
   * Synchronously write content to a file, overwriting if it exists.
   *
   * @param path - Absolute or relative file path
   * @param content - String content to write
   * @returns Result indicating success or failure
   */
  writeSync(path: string, content: string): Result<void>;

  /**
   * Asynchronously write content to a file, overwriting if it exists.
   *
   * @param path - Absolute or relative file path
   * @param content - String content to write
   * @returns Promise of Result indicating success or failure
   */
  write(path: string, content: string): Promise<Result<void>>;

  /**
   * Synchronously append content to a file, creating it if it doesn't exist.
   *
   * @param path - Absolute or relative file path
   * @param content - String content to append
   * @returns Result indicating success or failure
   */
  appendSync(path: string, content: string): Result<void>;

  /**
   * Asynchronously append content to a file, creating it if it doesn't exist.
   *
   * @param path - Absolute or relative file path
   * @param content - String content to append
   * @returns Promise of Result indicating success or failure
   */
  append(path: string, content: string): Promise<Result<void>>;

  /**
   * Synchronously check if a file exists.
   *
   * @param path - Absolute or relative file path
   * @returns true if the file exists, false otherwise
   */
  existsSync(path: string): boolean;

  /**
   * Asynchronously check if a file exists.
   *
   * @param path - Absolute or relative file path
   * @returns Promise resolving to true if the file exists, false otherwise
   */
  exists(path: string): Promise<boolean>;
}
