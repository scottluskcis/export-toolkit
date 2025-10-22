import type { OutportWriter, Result } from '../types.js';
import { BatchProcessor } from './BatchProcessor.js';
import type { ProgressHook } from '../builder/hooks.js';

/**
 * Options for streaming write operations.
 */
export interface StreamingOptions {
  /**
   * Number of items to process in each batch.
   * @default 100
   */
  batchSize?: number;

  /**
   * Progress callback invoked after each batch.
   */
  onProgress?: ProgressHook;

  /**
   * Whether to write the first batch using write() and subsequent batches using append().
   * Set to false to append all batches (useful when file already has headers).
   * @default true
   */
  initializeWithFirstBatch?: boolean;
}

/**
 * Wrapper for streaming data from async generators to writers.
 *
 * Handles batching, progress reporting, and efficient memory usage
 * when processing large datasets.
 *
 * @template T - The type of data objects being written
 */
export class StreamingWriter<T extends Record<string, unknown>> {
  private readonly batchProcessor: BatchProcessor<T>;

  /**
   * Creates a new streaming writer.
   *
   * @param writer - The underlying writer to use
   * @param options - Streaming configuration options
   */
  constructor(
    private readonly writer: OutportWriter<T>,
    private readonly options: StreamingOptions = {}
  ) {
    this.batchProcessor = new BatchProcessor<T>(options.batchSize ?? 100);
  }

  /**
   * Streams data from an async generator to the writer.
   *
   * The first batch is written using write() to initialize headers,
   * and subsequent batches are appended.
   *
   * @param source - Async generator or iterable providing data
   * @returns Result with total number of records processed
   *
   * @example
   * ```typescript
   * async function* fetchUsers() {
   *   for (let page = 1; page <= 10; page++) {
   *     const users = await api.getUsers(page);
   *     for (const user of users) {
   *       yield user;
   *     }
   *   }
   * }
   *
   * const writer = new CsvWriter<User>({...});
   * const streamWriter = new StreamingWriter(writer, {
   *   batchSize: 50,
   *   onProgress: (current) => console.log(`Processed ${current} records`)
   * });
   *
   * const result = await streamWriter.stream(fetchUsers());
   * if (result.success) {
   *   console.log(`Total: ${result.value} records`);
   * }
   * ```
   */
  async stream(source: AsyncGenerator<T> | AsyncIterable<T>): Promise<Result<number>> {
    try {
      let totalProcessed = 0;
      let isFirstBatch = this.options.initializeWithFirstBatch ?? true;

      const processedCount = await this.batchProcessor.process(
        source,
        async (batch, _batchNumber) => {
          let result: Result<void>;

          if (isFirstBatch) {
            // Write first batch to initialize file/headers
            result = await this.writer.write(batch);
            isFirstBatch = false;
          } else {
            // Append subsequent batches
            result = await this.writer.append(batch);
          }

          if (!result.success) {
            throw result.error;
          }

          totalProcessed += batch.length;

          // Report progress
          if (this.options.onProgress) {
            await this.options.onProgress(totalProcessed);
          }
        }
      );

      return { success: true, value: processedCount };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Streams data with a callback for each item before writing.
   *
   * Useful for transforming or filtering data during streaming.
   *
   * @param source - Async generator or iterable providing data
   * @param transform - Callback to transform each item (return null to skip)
   * @returns Result with total number of records processed
   */
  async streamWithTransform(
    source: AsyncGenerator<T> | AsyncIterable<T>,
    transform: (item: T) => T | null | Promise<T | null>
  ): Promise<Result<number>> {
    const transformedSource = this.transformGenerator(source, transform);
    return await this.stream(transformedSource);
  }

  /**
   * Creates a transformed async generator.
   */
  private async *transformGenerator(
    source: AsyncGenerator<T> | AsyncIterable<T>,
    transform: (item: T) => T | null | Promise<T | null>
  ): AsyncGenerator<T> {
    for await (const item of source) {
      const transformed = await transform(item);
      if (transformed !== null) {
        yield transformed;
      }
    }
  }
}
