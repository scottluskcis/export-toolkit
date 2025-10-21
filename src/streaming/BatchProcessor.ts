/**
 * Processes items in batches from an async generator.
 *
 * Provides automatic batching and backpressure handling for streaming
 * large datasets efficiently.
 *
 * @template T - The type of items being processed
 */
export class BatchProcessor<T> {
  /**
   * Creates a new batch processor.
   *
   * @param batchSize - Number of items per batch (default: 100)
   */
  constructor(private readonly batchSize: number = 100) {}

  /**
   * Processes an async generator in batches.
   *
   * @param source - Async generator providing items
   * @param onBatch - Callback to process each batch
   * @returns Total number of items processed
   *
   * @example
   * ```typescript
   * const processor = new BatchProcessor<User>(50);
   * const total = await processor.process(
   *   fetchUsers(),
   *   async (batch) => {
   *     await writer.append(batch);
   *   }
   * );
   * console.log(`Processed ${total} users`);
   * ```
   */
  async process(
    source: AsyncGenerator<T> | AsyncIterable<T>,
    onBatch: (batch: T[], batchNumber: number) => Promise<void>
  ): Promise<number> {
    let batch: T[] = [];
    let totalProcessed = 0;
    let batchNumber = 0;

    for await (const item of source) {
      batch.push(item);

      if (batch.length >= this.batchSize) {
        batchNumber++;
        await onBatch(batch, batchNumber);
        totalProcessed += batch.length;
        batch = [];
      }
    }

    // Process remaining items
    if (batch.length > 0) {
      batchNumber++;
      await onBatch(batch, batchNumber);
      totalProcessed += batch.length;
    }

    return totalProcessed;
  }

  /**
   * Collects all items from an async generator into an array.
   * Use with caution for large datasets as it loads everything into memory.
   *
   * @param source - Async generator providing items
   * @returns Array of all items
   */
  async collectAll(source: AsyncGenerator<T> | AsyncIterable<T>): Promise<T[]> {
    const items: T[] = [];
    for await (const item of source) {
      items.push(item);
    }
    return items;
  }

  /**
   * Collects a limited number of items from an async generator.
   *
   * @param source - Async generator providing items
   * @param limit - Maximum number of items to collect
   * @returns Array of collected items
   */
  async collectLimit(source: AsyncGenerator<T> | AsyncIterable<T>, limit: number): Promise<T[]> {
    const items: T[] = [];
    let count = 0;

    for await (const item of source) {
      items.push(item);
      count++;
      if (count >= limit) {
        break;
      }
    }

    return items;
  }
}
