import { describe, it, expect } from 'vitest';
import { BatchProcessor } from '../../src/streaming/BatchProcessor';

interface TestItem extends Record<string, unknown> {
  id: number;
  value: string;
}

describe('BatchProcessor', () => {
  async function* generateItems(count: number): AsyncGenerator<TestItem> {
    for (let i = 1; i <= count; i++) {
      await Promise.resolve(); // Simulate async work
      yield { id: i, value: `item${i}` };
    }
  }

  describe('Batch Processing', () => {
    it('should process items in batches', async () => {
      const processor = new BatchProcessor<TestItem>(5);
      const batches: TestItem[][] = [];

      const total = await processor.process(generateItems(12), async (batch) => {
        await Promise.resolve();
        batches.push([...batch]);
      });

      expect(total).toBe(12);
      expect(batches).toHaveLength(3);
      expect(batches[0]).toHaveLength(5);
      expect(batches[1]).toHaveLength(5);
      expect(batches[2]).toHaveLength(2);
    });

    it('should handle empty generator', async () => {
      async function* empty(): AsyncGenerator<TestItem> {
        // Empty
      }

      const processor = new BatchProcessor<TestItem>();
      const total = await processor.process(empty(), async () => {
        // No-op
      });

      expect(total).toBe(0);
    });

    it('should use default batch size of 100', async () => {
      const processor = new BatchProcessor<TestItem>();
      let batchSize = 0;

      await processor.process(generateItems(150), async (batch) => {
        if (batchSize === 0) {
          await Promise.resolve();
          batchSize = batch.length;
        }
      });

      expect(batchSize).toBe(100);
    });

    it('should pass batch number to callback', async () => {
      const processor = new BatchProcessor<TestItem>(3);
      const batchNumbers: number[] = [];

      await processor.process(generateItems(7), async (_batch, batchNumber) => {
        await Promise.resolve();
        batchNumbers.push(batchNumber);
      });

      expect(batchNumbers).toEqual([1, 2, 3]);
    });
  });

  describe('Collection Utilities', () => {
    it('should collect all items', async () => {
      const processor = new BatchProcessor<TestItem>();
      const items = await processor.collectAll(generateItems(10));

      expect(items).toHaveLength(10);
      expect(items[0]?.id).toBe(1);
      expect(items[9]?.id).toBe(10);
    });

    it('should collect limited items', async () => {
      const processor = new BatchProcessor<TestItem>();
      const items = await processor.collectLimit(generateItems(100), 5);

      expect(items).toHaveLength(5);
      expect(items[0]?.id).toBe(1);
      expect(items[4]?.id).toBe(5);
    });

    it('should handle limit greater than available items', async () => {
      const processor = new BatchProcessor<TestItem>();
      const items = await processor.collectLimit(generateItems(3), 10);

      expect(items).toHaveLength(3);
    });
  });

  describe('Async Iterator Support', () => {
    it('should work with async iterables', async () => {
      const asyncIterable = {
        async *[Symbol.asyncIterator](): AsyncGenerator<TestItem> {
          for (let i = 1; i <= 5; i++) {
            await Promise.resolve();
            yield { id: i, value: `item${i}` };
          }
        },
      };

      const processor = new BatchProcessor<TestItem>(2);
      const batches: TestItem[][] = [];

      await processor.process(asyncIterable, async (batch) => {
        await Promise.resolve();
        batches.push([...batch]);
      });

      expect(batches).toHaveLength(3);
      expect(batches[0]).toHaveLength(2);
      expect(batches[1]).toHaveLength(2);
      expect(batches[2]).toHaveLength(1);
    });
  });
});
