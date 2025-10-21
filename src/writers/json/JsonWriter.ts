import type { OutportWriter, WriterOptions, Result, FileWriter } from '../../types';
import { ValidationError, JsonFormattingError } from '../../errors';
import { NodeFileWriter } from '../../io/FileWriter';
import { JsonFormatter } from './JsonFormatter';
import * as fs from 'node:fs';
import * as fsPromises from 'node:fs/promises';

/**
 * JSON Writer for exporting data to JSON files.
 *
 * Provides both synchronous and asynchronous methods for writing and appending
 * data with support for pretty-printing, custom indentation, and UTF-8 BOM.
 *
 * The writer handles JSON formatting and file I/O, following SOLID principles
 * by delegating formatting concerns to the JsonFormatter class.
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
 * const writer = new JsonWriter<User>({
 *   type: 'json',
 *   mode: 'write',
 *   file: './users.json',
 *   jsonConfig: {
 *     prettyPrint: true,
 *     indent: 2,
 *     includeUtf8Bom: false
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
export class JsonWriter<T extends Record<string, unknown>> implements OutportWriter<T> {
  private readonly formatter: JsonFormatter;
  private readonly fileWriter: FileWriter;
  private readonly includeUtf8Bom: boolean;
  private dataArray: T[] = [];
  private isInitialized: boolean = false;

  /**
   * Creates a new JSON writer instance.
   *
   * @param options - Configuration options for the JSON writer
   * @param fileWriter - Optional custom file writer for dependency injection (useful for testing)
   *
   * @throws {ValidationError} If configuration is invalid (e.g., non-json type, empty file path)
   *
   * @example
   * ```typescript
   * const writer = new JsonWriter<User>({
   *   type: 'json',
   *   mode: 'write',
   *   file: './output.json'
   * });
   * ```
   */
  constructor(
    private readonly options: WriterOptions<T>,
    fileWriter: FileWriter = new NodeFileWriter()
  ) {
    this.validate(options);
    this.fileWriter = fileWriter;

    // Initialize formatter with config
    const prettyPrint = options.jsonConfig?.prettyPrint ?? true;
    const indent = options.jsonConfig?.indent ?? 2;
    this.formatter = new JsonFormatter(prettyPrint, indent);

    this.includeUtf8Bom = options.jsonConfig?.includeUtf8Bom ?? false;
  }

  /**
   * Validates writer options
   */
  private validate(options: WriterOptions<T>): void {
    if (options.type !== 'json') {
      throw new ValidationError('Invalid writer type for JsonWriter');
    }

    if (options.file == null || options.file.length === 0) {
      throw new ValidationError('File path must be provided for JsonWriter');
    }

    if (!options.file.endsWith('.json')) {
      throw new ValidationError('File extension must be .json for JsonWriter');
    }

    const indent = options.jsonConfig?.indent ?? 2;
    if (indent < 0 || indent > 10) {
      throw new ValidationError('Indent must be between 0 and 10');
    }
  }

  /**
   * Loads existing data from file if it exists and is in append mode
   */
  private loadExistingDataSync(): Result<void> {
    if (this.options.mode === 'append' && this.fileWriter.existsSync(this.options.file)) {
      try {
        const content: string = fs.readFileSync(this.options.file, 'utf-8');
        // Remove BOM if present
        const cleanContent: string = content.replace(/^\uFEFF/, '');
        if (cleanContent.trim()) {
          const parsed: unknown = JSON.parse(cleanContent);
          this.dataArray = Array.isArray(parsed) ? (parsed as T[]) : [parsed as T];
        }
        return { success: true, value: undefined };
      } catch (error) {
        return {
          success: false,
          error: new JsonFormattingError(
            `Failed to parse existing JSON file: ${error instanceof Error ? error.message : String(error)}`
          ),
        };
      }
    }
    return { success: true, value: undefined };
  }

  /**
   * Loads existing data from file if it exists and is in append mode
   */
  private async loadExistingData(): Promise<Result<void>> {
    if (this.options.mode === 'append') {
      const exists = await this.fileWriter.exists(this.options.file);
      if (exists) {
        try {
          const content: string = await fsPromises.readFile(this.options.file, 'utf-8');
          // Remove BOM if present
          const cleanContent: string = content.replace(/^\uFEFF/, '');
          if (cleanContent.trim()) {
            const parsed: unknown = JSON.parse(cleanContent);
            this.dataArray = Array.isArray(parsed) ? (parsed as T[]) : [parsed as T];
          }
          return { success: true, value: undefined };
        } catch (error) {
          return {
            success: false,
            error: new JsonFormattingError(
              `Failed to parse existing JSON file: ${error instanceof Error ? error.message : String(error)}`
            ),
          };
        }
      }
    }
    return { success: true, value: undefined };
  }

  /**
   * Writes the complete data array to file (sync)
   */
  private writeDataSync(): Result<void> {
    try {
      const json = this.formatter.format(this.dataArray, true);
      const content = this.includeUtf8Bom ? '\uFEFF' + json : json;
      return this.fileWriter.writeSync(this.options.file, content);
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof JsonFormattingError
            ? error
            : new JsonFormattingError(error instanceof Error ? error.message : String(error)),
      };
    }
  }

  /**
   * Writes the complete data array to file (async)
   */
  private async writeData(): Promise<Result<void>> {
    try {
      const json = this.formatter.format(this.dataArray, true);
      const content = this.includeUtf8Bom ? '\uFEFF' + json : json;
      return await this.fileWriter.write(this.options.file, content);
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof JsonFormattingError
            ? error
            : new JsonFormattingError(error instanceof Error ? error.message : String(error)),
      };
    }
  }

  // ==================== PUBLIC API ====================

  /**
   * Synchronously writes multiple rows of data to the file.
   *
   * In 'write' mode, this overwrites the entire file with a JSON array.
   * In 'append' mode, this adds data to the existing array in the file.
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

    if (this.options.mode === 'write') {
      // In write mode, replace all data
      this.dataArray = [...data];
      this.isInitialized = true;
      return this.writeDataSync();
    } else {
      // In append mode, load existing data first if not initialized
      if (!this.isInitialized) {
        const loadResult = this.loadExistingDataSync();
        if (!loadResult.success) {
          return loadResult;
        }
        this.isInitialized = true;
      }
      this.dataArray.push(...data);
      return this.writeDataSync();
    }
  }

  /**
   * Asynchronously writes multiple rows of data to the file.
   *
   * In 'write' mode, this overwrites the entire file with a JSON array.
   * In 'append' mode, this adds data to the existing array in the file.
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

    if (this.options.mode === 'write') {
      // In write mode, replace all data
      this.dataArray = [...data];
      this.isInitialized = true;
      return await this.writeData();
    } else {
      // In append mode, load existing data first if not initialized
      if (!this.isInitialized) {
        const loadResult = await this.loadExistingData();
        if (!loadResult.success) {
          return loadResult;
        }
        this.isInitialized = true;
      }
      this.dataArray.push(...data);
      return await this.writeData();
    }
  }

  /**
   * Synchronously appends one or more rows to the file.
   *
   * Loads the existing JSON array from the file, adds new items, and writes
   * the complete array back. If the file doesn't exist, creates a new array.
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

    // Load existing data if not initialized
    if (!this.isInitialized) {
      const loadResult = this.loadExistingDataSync();
      if (!loadResult.success) {
        return loadResult;
      }
      this.isInitialized = true;
    }

    this.dataArray.push(...dataArray);
    return this.writeDataSync();
  }

  /**
   * Asynchronously appends one or more rows to the file.
   *
   * Loads the existing JSON array from the file, adds new items, and writes
   * the complete array back. If the file doesn't exist, creates a new array.
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

    // Load existing data if not initialized
    if (!this.isInitialized) {
      const loadResult = await this.loadExistingData();
      if (!loadResult.success) {
        return loadResult;
      }
      this.isInitialized = true;
    }

    this.dataArray.push(...dataArray);
    return await this.writeData();
  }
}
