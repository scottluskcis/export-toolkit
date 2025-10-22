import type { OutportWriter, WriterOptions, Result, FileWriter } from '../../types.js';
import { ValidationError, CsvFormattingError } from '../../errors.js';
import { NodeFileWriter } from '../../io/FileWriter.js';
import { CsvFormatter } from './CsvFormatter.js';
import { CsvHeaderManager } from './CsvHeaderManager.js';

/**
 * CSV Writer for exporting data to CSV files.
 *
 * Provides both synchronous and asynchronous methods for writing and appending
 * data with support for custom delimiters, headers, column mapping, and more.
 *
 * The writer handles header initialization, value formatting, and file I/O,
 * delegating to specialized helper classes for each concern.
 *
 * @template T - The type of data objects being written. Must extend Record<string, unknown>
 *
 * @example
 * ```typescript
 * interface User extends Record<string, unknown> {
 *   id: number;
 *   name: string;
 *   email: string;
 * }
 *
 * const writer = new CsvWriter<User>({
 *   type: 'csv',
 *   mode: 'write',
 *   file: './users.csv',
 *   csvConfig: {
 *     headers: ['ID', 'Name', 'Email'],
 *     delimiter: ',',
 *     includeUtf8Bom: true
 *   }
 * });
 *
 * const users = [
 *   { id: 1, name: 'Alice', email: 'alice@example.com' },
 *   { id: 2, name: 'Bob', email: 'bob@example.com' }
 * ];
 *
 * // Synchronous write
 * const result = writer.writeSync(users);
 *
 * // Asynchronous append
 * await writer.append({ id: 3, name: 'Charlie', email: 'charlie@example.com' });
 * ```
 */
export class CsvWriter<T extends Record<string, unknown>> implements OutportWriter<T> {
  private readonly formatter: CsvFormatter;
  private readonly headerManager: CsvHeaderManager<T>;
  private readonly fileWriter: FileWriter;
  private readonly includeUtf8Bom: boolean;

  /**
   * Creates a new CSV writer instance.
   *
   * @param options - Configuration options for the CSV writer
   * @param fileWriter - Optional custom file writer for dependency injection (useful for testing)
   *
   * @throws {ValidationError} If configuration is invalid (e.g., non-csv type, empty file path, multi-character delimiter)
   *
   * @example
   * ```typescript
   * const writer = new CsvWriter<User>({
   *   type: 'csv',
   *   mode: 'write',
   *   file: './output.csv'
   * });
   * ```
   */
  constructor(
    private readonly options: WriterOptions<T> & { type: 'csv' },
    fileWriter: FileWriter = new NodeFileWriter()
  ) {
    this.validate(options);
    this.fileWriter = fileWriter;

    // Initialize formatter with config
    const delimiter = options.config?.delimiter ?? ',';
    const quote = options.config?.quote ?? '"';
    this.formatter = new CsvFormatter(delimiter, quote);

    // Initialize header manager
    this.headerManager = new CsvHeaderManager<T>(options.config);

    this.includeUtf8Bom = options.config?.includeUtf8Bom ?? false;
  }

  /**
   * Validates writer options
   */
  private validate(options: WriterOptions<T>): void {
    if (options.type !== 'csv') {
      throw new ValidationError('Invalid writer type for CsvWriter');
    }

    if (options.file == null || options.file.length === 0) {
      throw new ValidationError('File path must be provided for CsvWriter');
    }

    if (!options.file.endsWith('.csv')) {
      throw new ValidationError('File extension must be .csv for CsvWriter');
    }

    const delimiter = options.config?.delimiter ?? ',';
    if (delimiter.length !== 1) {
      throw new ValidationError('Delimiter must be a single character');
    }

    const quote = options.config?.quote ?? '"';
    if (quote.length !== 1) {
      throw new ValidationError('Quote character must be a single character');
    }
  }

  /**
   * Writes headers to file (sync)
   */
  private writeHeadersSync(): Result<void> {
    const headerLine = this.formatter.formatRow(this.headerManager.getHeaders());
    const content = this.includeUtf8Bom ? '\uFEFF' + headerLine + '\n' : headerLine + '\n';

    if (this.options.mode === 'write') {
      return this.fileWriter.writeSync(this.options.file, content);
    } else if (this.options.mode === 'append') {
      if (!this.fileWriter.existsSync(this.options.file)) {
        return this.fileWriter.writeSync(this.options.file, content);
      }
    }

    return { success: true, value: undefined };
  }

  /**
   * Writes headers to file (async)
   */
  private async writeHeaders(): Promise<Result<void>> {
    const headerLine = this.formatter.formatRow(this.headerManager.getHeaders());
    const content = this.includeUtf8Bom ? '\uFEFF' + headerLine + '\n' : headerLine + '\n';

    if (this.options.mode === 'write') {
      return await this.fileWriter.write(this.options.file, content);
    } else if (this.options.mode === 'append') {
      const exists = await this.fileWriter.exists(this.options.file);
      if (!exists) {
        return await this.fileWriter.write(this.options.file, content);
      }
    }

    return { success: true, value: undefined };
  }

  /**
   * Formats and writes data rows (sync)
   */
  private writeRowsSync(data: T[], isFirstWrite: boolean): Result<void> {
    try {
      const lines = data
        .map((obj) => this.headerManager.objectToValues(obj))
        .map((values) => this.formatter.formatRow(values))
        .join('\n');

      if (isFirstWrite && this.options.mode === 'write') {
        // In write mode on first write, we need to append to headers (not overwrite)
        return this.fileWriter.appendSync(this.options.file, lines + '\n');
      }

      return this.fileWriter.appendSync(this.options.file, lines + '\n');
    } catch (error) {
      return {
        success: false,
        error: new CsvFormattingError(error instanceof Error ? error.message : String(error)),
      };
    }
  }

  /**
   * Formats and writes data rows (async)
   */
  private async writeRows(data: T[], isFirstWrite: boolean): Promise<Result<void>> {
    try {
      const lines = data
        .map((obj) => this.headerManager.objectToValues(obj))
        .map((values) => this.formatter.formatRow(values))
        .join('\n');

      if (isFirstWrite && this.options.mode === 'write') {
        // In write mode on first write, we need to append to headers (not overwrite)
        return await this.fileWriter.append(this.options.file, lines + '\n');
      }

      return await this.fileWriter.append(this.options.file, lines + '\n');
    } catch (error) {
      return {
        success: false,
        error: new CsvFormattingError(error instanceof Error ? error.message : String(error)),
      };
    }
  }

  // ==================== PUBLIC API ====================

  /**
   * Synchronously writes multiple rows of data to the file.
   *
   * In 'write' mode, this overwrites the entire file. In 'append' mode,
   * this adds data to the end of the file.
   *
   * Headers are automatically initialized from the first data object if not
   * already set. In 'write' mode, headers are written on each call.
   *
   * @param data - Array of data objects to write
   * @returns Result indicating success or failure
   *
   * @example
   * ```typescript
   * const result = writer.writeSync([
   *   { id: 1, name: 'Alice' },
   *   { id: 2, name: 'Bob' }
   * ]);
   *
   * if (result.success) {
   *   console.log('Write successful!');
   * } else {
   *   console.error('Write failed:', result.error.message);
   * }
   * ```
   */
  writeSync(data: T[]): Result<void> {
    if (data.length === 0) {
      return {
        success: false,
        error: new ValidationError('Cannot write empty data array'),
      };
    }

    let headersJustInitialized = false;

    // Initialize headers if needed
    if (!this.headerManager.isInitialized()) {
      const initResult = this.headerManager.initialize(data[0]!);
      if (!initResult.success) {
        return initResult;
      }
      headersJustInitialized = true;
    }

    // In write mode, always write headers (overwriting existing content)
    // In append mode, only write headers if file doesn't exist
    if (this.options.mode === 'write' || headersJustInitialized) {
      const writeResult = this.writeHeadersSync();
      if (!writeResult.success) {
        return writeResult;
      }
    }

    return this.writeRowsSync(data, true);
  }

  /**
   * Asynchronously writes multiple rows of data to the file.
   *
   * In 'write' mode, this overwrites the entire file. In 'append' mode,
   * this adds data to the end of the file.
   *
   * Headers are automatically initialized from the first data object if not
   * already set. In 'write' mode, headers are written on each call.
   *
   * @param data - Array of data objects to write
   * @returns Promise of Result indicating success or failure
   *
   * @example
   * ```typescript
   * const result = await writer.write([
   *   { id: 1, name: 'Alice' },
   *   { id: 2, name: 'Bob' }
   * ]);
   *
   * if (result.success) {
   *   console.log('Write successful!');
   * }
   * ```
   */
  async write(data: T[]): Promise<Result<void>> {
    if (data.length === 0) {
      return {
        success: false,
        error: new ValidationError('Cannot write empty data array'),
      };
    }

    let headersJustInitialized = false;

    // Initialize headers if needed
    if (!this.headerManager.isInitialized()) {
      const initResult = this.headerManager.initialize(data[0]!);
      if (!initResult.success) {
        return initResult;
      }
      headersJustInitialized = true;
    }

    // In write mode, always write headers (overwriting existing content)
    // In append mode, only write headers if file doesn't exist
    if (this.options.mode === 'write' || headersJustInitialized) {
      const writeResult = await this.writeHeaders();
      if (!writeResult.success) {
        return writeResult;
      }
    }

    return await this.writeRows(data, true);
  }

  /**
   * Synchronously appends one or more rows to the file.
   *
   * If the file doesn't exist, creates it with headers. If headers haven't been
   * initialized, they are inferred from the first data object.
   *
   * @param data - Single data object or array of objects to append
   * @returns Result indicating success or failure
   *
   * @example
   * ```typescript
   * // Append single row
   * writer.appendSync({ id: 3, name: 'Charlie' });
   *
   * // Append multiple rows
   * writer.appendSync([
   *   { id: 4, name: 'Diana' },
   *   { id: 5, name: 'Eve' }
   * ]);
   *
   * // Append empty array is allowed (no-op)
   * writer.appendSync([]);
   * ```
   */
  appendSync(data: T | T[]): Result<void> {
    const dataArray = Array.isArray(data) ? data : [data];

    if (dataArray.length === 0) {
      return { success: true, value: undefined };
    }

    // Initialize headers if needed
    if (!this.headerManager.isInitialized()) {
      const initResult = this.headerManager.initialize(dataArray[0]!);
      if (!initResult.success) {
        return initResult;
      }

      const writeResult = this.writeHeadersSync();
      if (!writeResult.success) {
        return writeResult;
      }
    }

    return this.writeRowsSync(dataArray, false);
  }

  /**
   * Asynchronously appends one or more rows to the file.
   *
   * If the file doesn't exist, creates it with headers. If headers haven't been
   * initialized, they are inferred from the first data object.
   *
   * Useful for streaming large datasets or processing async generators.
   *
   * @param data - Single data object or array of objects to append
   * @returns Promise of Result indicating success or failure
   *
   * @example
   * ```typescript
   * // Append from async generator
   * for await (const user of fetchUsers()) {
   *   await writer.append(user);
   * }
   * ```
   */
  async append(data: T | T[]): Promise<Result<void>> {
    const dataArray = Array.isArray(data) ? data : [data];

    if (dataArray.length === 0) {
      return { success: true, value: undefined };
    }

    // Initialize headers if needed
    if (!this.headerManager.isInitialized()) {
      const initResult = this.headerManager.initialize(dataArray[0]!);
      if (!initResult.success) {
        return initResult;
      }

      const writeResult = await this.writeHeaders();
      if (!writeResult.success) {
        return writeResult;
      }
    }

    return await this.writeRows(dataArray, false);
  }
}
