import type {
  OutportWriter,
  WriterType,
  WriterMode,
  CsvConfig,
  JsonConfig,
  Result,
} from '../types.js';
import { WriterFactory } from '../writers/WriterFactory.js';
import type {
  BeforeWriteHook,
  AfterWriteHook,
  ProgressHook,
  ErrorHook,
  CompleteHook,
  LifecycleHooks,
} from './hooks.js';
import { ValidationError } from '../errors.js';
import { StreamingWriter } from '../streaming/StreamingWriter.js';

/**
 * Fluent builder for creating and configuring data writers.
 *
 * Provides a convenient, chainable API for configuring and executing
 * data export operations without manually instantiating writers.
 *
 * @template T - The type of data objects being written
 *
 * @example
 * ```typescript
 * // Simple CSV export
 * await outport<User>()
 *   .to('./users.csv')
 *   .write(users);
 *
 * // With configuration and hooks
 * await outport<User>()
 *   .to('./users.csv')
 *   .withDelimiter('\t')
 *   .onProgress((current, total) => console.log(`${current}/${total}`))
 *   .write(users);
 * ```
 */
export class OutportBuilder<T extends Record<string, unknown>> {
  private filePath?: string;
  private writerType?: WriterType;
  private mode: WriterMode = 'write';
  private csvConfig: Partial<CsvConfig<T>> = {};
  private jsonConfig: Partial<JsonConfig> = {};
  private hooks: LifecycleHooks<T> = {};
  private batchSize: number = 100;

  /**
   * Specify the output file path.
   * File extension is used to auto-detect format if not explicitly set.
   *
   * @param path - Path to the output file
   * @returns This builder instance for chaining
   *
   * @example
   * ```typescript
   * outport<User>().to('./users.csv')
   * outport<User>().to('./data.json')
   * ```
   */
  to(path: string): this {
    this.filePath = path;

    // Auto-detect type from extension if not already set
    if (!this.writerType) {
      if (path.endsWith('.csv')) {
        this.writerType = 'csv';
      } else if (path.endsWith('.json')) {
        this.writerType = 'json';
      }
    }

    return this;
  }

  /**
   * Explicitly set the writer type.
   * Usually not needed as type is auto-detected from file extension.
   *
   * @param type - Writer type ('csv' or 'json')
   * @returns This builder instance for chaining
   */
  as(type: WriterType): this {
    this.writerType = type;
    return this;
  }

  /**
   * Set the write mode.
   *
   * @param mode - 'write' to overwrite file, 'append' to add to existing file
   * @returns This builder instance for chaining
   *
   * @example
   * ```typescript
   * outport<User>().to('./users.csv').inMode('append')
   * ```
   */
  inMode(mode: WriterMode): this {
    this.mode = mode;
    return this;
  }

  // CSV-specific configuration methods

  /**
   * Set the CSV delimiter character.
   *
   * @param delimiter - Single character delimiter (default: ',')
   * @returns This builder instance for chaining
   *
   * @example
   * ```typescript
   * outport<User>().to('./users.tsv').withDelimiter('\t')
   * ```
   */
  withDelimiter(delimiter: string): this {
    this.csvConfig.delimiter = delimiter;
    return this;
  }

  /**
   * Set the CSV quote character.
   *
   * @param quote - Single character for quoting values (default: '"')
   * @returns This builder instance for chaining
   */
  withQuote(quote: string): this {
    this.csvConfig.quote = quote;
    return this;
  }

  /**
   * Set custom CSV headers.
   *
   * @param headers - Array of header strings
   * @returns This builder instance for chaining
   *
   * @example
   * ```typescript
   * outport<User>()
   *   .to('./users.csv')
   *   .withHeaders(['ID', 'Name', 'Email'])
   * ```
   */
  withHeaders(headers: string[]): this {
    this.csvConfig.headers = headers;
    return this;
  }

  /**
   * Set CSV column keys to include.
   *
   * @param keys - Array of property keys to include
   * @returns This builder instance for chaining
   *
   * @example
   * ```typescript
   * outport<User>()
   *   .to('./users.csv')
   *   .withColumns(['id', 'name', 'email'])
   * ```
   */
  withColumns(keys: Array<keyof T>): this {
    this.csvConfig.includeKeys = keys;
    return this;
  }

  /**
   * Set CSV column mapping for custom header names.
   *
   * @param mapping - Object mapping property keys to header names
   * @returns This builder instance for chaining
   *
   * @example
   * ```typescript
   * outport<User>()
   *   .to('./users.csv')
   *   .withColumnMapping({ id: 'User ID', name: 'Full Name' })
   * ```
   */
  withColumnMapping(mapping: Partial<Record<keyof T, string>>): this {
    this.csvConfig.columnMapping = mapping;
    return this;
  }

  /**
   * Enable UTF-8 BOM for CSV files.
   *
   * @param include - Whether to include BOM (default: false)
   * @returns This builder instance for chaining
   */
  withUtf8Bom(include: boolean = true): this {
    if (this.writerType === 'csv' || this.filePath?.endsWith('.csv')) {
      this.csvConfig.includeUtf8Bom = include;
    } else {
      this.jsonConfig.includeUtf8Bom = include;
    }
    return this;
  }

  // JSON-specific configuration methods

  /**
   * Enable pretty-printing for JSON output.
   *
   * @param pretty - Whether to pretty-print (default: true)
   * @returns This builder instance for chaining
   *
   * @example
   * ```typescript
   * outport<User>().to('./users.json').prettyPrint()
   * ```
   */
  prettyPrint(pretty: boolean = true): this {
    this.jsonConfig.prettyPrint = pretty;
    return this;
  }

  /**
   * Set JSON indentation level.
   *
   * @param spaces - Number of spaces for indentation (default: 2)
   * @returns This builder instance for chaining
   *
   * @example
   * ```typescript
   * outport<User>().to('./users.json').withIndent(4)
   * ```
   */
  withIndent(spaces: number): this {
    this.jsonConfig.indent = spaces;
    return this;
  }

  // Hook methods

  /**
   * Register a hook to be called before data is written.
   * Can be used to transform data before writing.
   *
   * @param hook - Function to call before writing
   * @returns This builder instance for chaining
   *
   * @example
   * ```typescript
   * outport<User>()
   *   .to('./users.csv')
   *   .onBeforeWrite((data) => data.filter(u => u.active))
   * ```
   */
  onBeforeWrite(hook: BeforeWriteHook<T>): this {
    this.hooks.beforeWrite = hook;
    return this;
  }

  /**
   * Register a hook to be called after data is written.
   *
   * @param hook - Function to call after writing
   * @returns This builder instance for chaining
   */
  onAfterWrite(hook: AfterWriteHook<T>): this {
    this.hooks.afterWrite = hook;
    return this;
  }

  /**
   * Register a progress callback.
   *
   * @param hook - Function to call with progress updates
   * @returns This builder instance for chaining
   *
   * @example
   * ```typescript
   * outport<User>()
   *   .to('./users.csv')
   *   .onProgress((current, total) => {
   *     console.log(`Progress: ${current}/${total}`);
   *   })
   * ```
   */
  onProgress(hook: ProgressHook): this {
    this.hooks.onProgress = hook;
    return this;
  }

  /**
   * Register an error handler.
   *
   * @param hook - Function to call when errors occur
   * @returns This builder instance for chaining
   */
  onError(hook: ErrorHook): this {
    this.hooks.onError = hook;
    return this;
  }

  /**
   * Register a completion callback.
   *
   * @param hook - Function to call when operation completes
   * @returns This builder instance for chaining
   */
  onComplete(hook: CompleteHook): this {
    this.hooks.onComplete = hook;
    return this;
  }

  /**
   * Set the batch size for streaming operations.
   *
   * @param size - Number of records per batch (default: 100)
   * @returns This builder instance for chaining
   */
  withBatchSize(size: number): this {
    this.batchSize = size;
    return this;
  }

  /**
   * Get the configured batch size.
   *
   * @returns The batch size
   */
  getBatchSize(): number {
    return this.batchSize;
  }

  /**
   * Get the configured lifecycle hooks.
   *
   * @returns The hooks object
   */
  getHooks(): LifecycleHooks<T> {
    return this.hooks;
  }

  /**
   * Write data synchronously.
   *
   * Note: Hooks in synchronous operations use fire-and-forget pattern (void operator).
   * Since this is a sync method, we cannot await promise-based hooks. The void operator
   * explicitly indicates we're intentionally ignoring any promises returned by hooks,
   * allowing both sync and async hook implementations to work. This differs from the
   * async write() method where hooks are properly awaited.
   *
   * @param data - Array of data objects to write
   * @returns Result indicating success or failure
   *
   * @example
   * ```typescript
   * const result = outport<User>()
   *   .to('./users.csv')
   *   .writeSync(users);
   * ```
   */
  writeSync(data: T[]): Result<void> {
    const writer = this.createWriter();
    let processedData = data;
    let totalRecords = data.length;

    try {
      // Call beforeWrite hook
      if (this.hooks.beforeWrite) {
        const transformed = this.hooks.beforeWrite(data);
        // Handle both sync and async returns (but sync here)
        if (transformed instanceof Promise) {
          throw new ValidationError('Cannot use async beforeWrite hook with writeSync');
        }
        processedData = transformed;
        totalRecords = processedData.length;
      }

      // Report progress before write (fire-and-forget if hook returns a promise)
      if (this.hooks.onProgress) {
        void this.hooks.onProgress(0, totalRecords);
      }

      // Perform write
      const result = writer.writeSync(processedData);

      if (result.success) {
        // Report completion progress (fire-and-forget if hook returns a promise)
        if (this.hooks.onProgress) {
          void this.hooks.onProgress(totalRecords, totalRecords);
        }

        // Call afterWrite hook (fire-and-forget if hook returns a promise)
        if (this.hooks.afterWrite) {
          void this.hooks.afterWrite(processedData, totalRecords);
        }
      } else if (this.hooks.onError) {
        // Fire-and-forget error hook
        void this.hooks.onError(result.error);
      }

      // Call complete hook (fire-and-forget if hook returns a promise)
      if (this.hooks.onComplete) {
        void this.hooks.onComplete(result, totalRecords);
      }

      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (this.hooks.onError) {
        // Fire-and-forget error hook
        void this.hooks.onError(err);
      }
      const failResult: Result<void> = { success: false, error: err };
      if (this.hooks.onComplete) {
        // Fire-and-forget complete hook
        void this.hooks.onComplete(failResult, totalRecords);
      }
      return failResult;
    }
  }

  /**
   * Write data asynchronously.
   *
   * @param data - Array of data objects to write
   * @returns Promise of Result indicating success or failure
   *
   * @example
   * ```typescript
   * await outport<User>()
   *   .to('./users.csv')
   *   .write(users);
   * ```
   */
  async write(data: T[]): Promise<Result<void>> {
    const writer = this.createWriter();
    let processedData = data;
    let totalRecords = data.length;

    try {
      // Call beforeWrite hook
      if (this.hooks.beforeWrite) {
        processedData = await this.hooks.beforeWrite(data);
        totalRecords = processedData.length;
      }

      // Report progress before write
      if (this.hooks.onProgress) {
        await this.hooks.onProgress(0, totalRecords);
      }

      // Perform write
      const result = await writer.write(processedData);

      if (result.success) {
        // Report completion progress
        if (this.hooks.onProgress) {
          await this.hooks.onProgress(totalRecords, totalRecords);
        }

        // Call afterWrite hook
        if (this.hooks.afterWrite) {
          await this.hooks.afterWrite(processedData, totalRecords);
        }
      } else if (this.hooks.onError) {
        await this.hooks.onError(result.error);
      }

      // Call complete hook
      if (this.hooks.onComplete) {
        await this.hooks.onComplete(result, totalRecords);
      }

      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (this.hooks.onError) {
        await this.hooks.onError(err);
      }
      const failResult: Result<void> = { success: false, error: err };
      if (this.hooks.onComplete) {
        await this.hooks.onComplete(failResult, totalRecords);
      }
      return failResult;
    }
  }

  /**
   * Append data synchronously.
   *
   * @param data - Single data object or array to append
   * @returns Result indicating success or failure
   */
  appendSync(data: T | T[]): Result<void> {
    const writer = this.createWriter();
    return writer.appendSync(data);
  }

  /**
   * Append data asynchronously.
   *
   * @param data - Single data object or array to append
   * @returns Promise of Result indicating success or failure
   */
  async append(data: T | T[]): Promise<Result<void>> {
    const writer = this.createWriter();
    return await writer.append(data);
  }

  /**
   * Stream data from an async generator.
   *
   * Automatically batches data for efficient processing and memory usage.
   * The first batch initializes the file with headers, subsequent batches are appended.
   *
   * @param source - Async generator or iterable providing data
   * @returns Promise of Result with total number of records processed
   *
   * @example
   * ```typescript
   * async function* fetchUsers() {
   *   for (let page = 1; page <= 100; page++) {
   *     const users = await api.getUsers(page);
   *     for (const user of users) {
   *       yield user;
   *     }
   *   }
   * }
   *
   * const result = await outport<User>()
   *   .to('./users.csv')
   *   .withBatchSize(50)
   *   .onProgress((count) => console.log(`Processed ${count}`))
   *   .fromAsyncGenerator(fetchUsers());
   * ```
   */
  async fromAsyncGenerator(source: AsyncGenerator<T> | AsyncIterable<T>): Promise<Result<number>> {
    const writer = this.createWriter();
    const streamingWriter = new StreamingWriter(writer, {
      batchSize: this.batchSize,
      onProgress: this.hooks.onProgress,
      initializeWithFirstBatch: true,
    });

    try {
      const result = await streamingWriter.stream(source);

      if (result.success && this.hooks.onComplete) {
        await this.hooks.onComplete({ success: true, value: undefined }, result.value);
      } else if (!result.success && this.hooks.onError) {
        await this.hooks.onError(result.error);
      }

      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (this.hooks.onError) {
        await this.hooks.onError(err);
      }
      return { success: false, error: err };
    }
  }

  /**
   * Stream data using a generator function.
   *
   * Convenience method that accepts a function returning an async generator.
   *
   * @param generatorFn - Function that returns an async generator
   * @returns Promise of Result with total number of records processed
   *
   * @example
   * ```typescript
   * await outport<User>()
   *   .to('./users.csv')
   *   .stream(async function* () {
   *     for await (const batch of fetchBatches()) {
   *       yield* batch;
   *     }
   *   });
   * ```
   */
  async stream(generatorFn: () => AsyncGenerator<T> | AsyncIterable<T>): Promise<Result<number>> {
    return await this.fromAsyncGenerator(generatorFn());
  }

  /**
   * Creates the appropriate writer instance based on configuration.
   *
   * @returns A configured writer instance
   * @throws {ValidationError} If configuration is invalid
   */
  private createWriter(): OutportWriter<T> {
    if (!this.filePath) {
      throw new ValidationError('File path must be specified using .to()');
    }

    if (!this.writerType) {
      throw new ValidationError(
        'Could not determine writer type. Use .as() or specify file extension (.csv or .json)'
      );
    }

    if (this.writerType === 'csv') {
      return WriterFactory.create<T>({
        type: 'csv',
        mode: this.mode,
        file: this.filePath,
        config: this.csvConfig,
      });
    } else {
      return WriterFactory.create<T>({
        type: 'json',
        mode: this.mode,
        file: this.filePath,
        config: this.jsonConfig,
      });
    }
  }
}
