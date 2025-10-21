import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StreamingWriter } from '../../src/streaming/StreamingWriter';
import { outport } from '../../src/convenience/factory';
import { CsvWriter } from '../../src/writers/csv/CsvWriter';
import * as fs from 'node:fs';
import * as path from 'node:path';

interface TestUser extends Record<string, unknown> {
  id: number;
  name: string;
  email: string;
}

describe('StreamingWriter', () => {
  const testDir = path.join(process.cwd(), '__tests__', 'temp', 'streaming');
  const csvFile = path.join(testDir, 'stream-users.csv');

  beforeEach(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(csvFile)) {
      fs.unlinkSync(csvFile);
    }
  });

  // Helper async generator
  async function* generateUsers(count: number): AsyncGenerator<TestUser> {
    for (let i = 1; i <= count; i++) {
      // Simulate async operation
      await Promise.resolve();
      yield {
        id: i,
        name: `User${i}`,
        email: `user${i}@example.com`,
      };
    }
  }

  describe('Basic Streaming', () => {
    it('should stream data from async generator', async () => {
      const writer = new CsvWriter<TestUser>({
        type: 'csv',
        mode: 'write',
        file: csvFile,
      });

      const streamWriter = new StreamingWriter(writer, { batchSize: 10 });
      const result = await streamWriter.stream(generateUsers(25));

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(25);
      }
      expect(fs.existsSync(csvFile)).toBe(true);

      const content = fs.readFileSync(csvFile, 'utf-8');
      const lines = content.trim().split('\n');
      expect(lines).toHaveLength(26); // 25 users + 1 header
    });

    it('should handle empty generator', async () => {
      const writer = new CsvWriter<TestUser>({
        type: 'csv',
        mode: 'write',
        file: csvFile,
      });

      async function* empty(): AsyncGenerator<TestUser> {
        // Empty generator
      }

      const streamWriter = new StreamingWriter(writer);
      const result = await streamWriter.stream(empty());

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(0);
      }
    });

    it('should respect batch size', async () => {
      const writer = new CsvWriter<TestUser>({
        type: 'csv',
        mode: 'write',
        file: csvFile,
      });

      const batchSizes: number[] = [];

      const streamWriter = new StreamingWriter(writer, {
        batchSize: 5,
        onProgress: (current) => {
          batchSizes.push(current);
        },
      });

      await streamWriter.stream(generateUsers(12));

      // Progress should be cumulative: 5, 10, 12
      expect(batchSizes[0]).toBe(5);
      expect(batchSizes[1]).toBe(10);
      expect(batchSizes[2]).toBe(12);
    });
  });

  describe('Progress Reporting', () => {
    it('should call onProgress hook', async () => {
      const writer = new CsvWriter<TestUser>({
        type: 'csv',
        mode: 'write',
        file: csvFile,
      });

      const progressUpdates: number[] = [];

      const streamWriter = new StreamingWriter(writer, {
        batchSize: 5,
        onProgress: (current) => {
          progressUpdates.push(current);
        },
      });

      await streamWriter.stream(generateUsers(12));

      expect(progressUpdates.length).toBeGreaterThan(0);
      expect(progressUpdates[progressUpdates.length - 1]).toBe(12);
    });
  });

  describe('Transform Streaming', () => {
    it('should transform items during streaming', async () => {
      const writer = new CsvWriter<TestUser>({
        type: 'csv',
        mode: 'write',
        file: csvFile,
      });

      const streamWriter = new StreamingWriter(writer, { batchSize: 5 });

      const result = await streamWriter.streamWithTransform(generateUsers(10), (user) => ({
        ...user,
        name: user.name.toUpperCase(),
      }));

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(10);
      }

      const content = fs.readFileSync(csvFile, 'utf-8');
      expect(content).toContain('USER1');
      expect(content).toContain('USER10');
    });

    it('should filter items with transform returning null', async () => {
      const writer = new CsvWriter<TestUser>({
        type: 'csv',
        mode: 'write',
        file: csvFile,
      });

      const streamWriter = new StreamingWriter(writer, { batchSize: 5 });

      const result = await streamWriter.streamWithTransform(
        generateUsers(10),
        (user) => (user.id % 2 === 0 ? user : null) // Only even IDs
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(5); // Only 5 even numbers
      }

      const content = fs.readFileSync(csvFile, 'utf-8');
      const lines = content.trim().split('\n');
      expect(lines).toHaveLength(6); // 5 users + 1 header
    });
  });

  describe('Builder Integration', () => {
    it('should stream via builder fromAsyncGenerator', async () => {
      const result = await outport<TestUser>()
        .to(csvFile)
        .withBatchSize(5)
        .fromAsyncGenerator(generateUsers(15));

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(15);
      }

      const content = fs.readFileSync(csvFile, 'utf-8');
      const lines = content.trim().split('\n');
      expect(lines).toHaveLength(16); // 15 users + 1 header
    });

    it('should stream via builder stream method', async () => {
      const result = await outport<TestUser>()
        .to(csvFile)
        .stream(() => generateUsers(10));

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(10);
      }
    });

    it('should handle streaming with progress callback', async () => {
      const progressUpdates: number[] = [];

      const result = await outport<TestUser>()
        .to(csvFile)
        .withBatchSize(3)
        .onProgress((current) => {
          progressUpdates.push(current);
        })
        .fromAsyncGenerator(generateUsers(10));

      expect(result.success).toBe(true);
      expect(progressUpdates.length).toBeGreaterThan(0);
      expect(progressUpdates[progressUpdates.length - 1]).toBe(10);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors during streaming', async () => {
      async function* errorGenerator(): AsyncGenerator<TestUser> {
        yield { id: 1, name: 'User1', email: 'user1@example.com' };
        await Promise.resolve(); // Perform async operation before error
        throw new Error('Generator error');
      }

      const writer = new CsvWriter<TestUser>({
        type: 'csv',
        mode: 'write',
        file: csvFile,
      });

      const streamWriter = new StreamingWriter(writer);
      const result = await streamWriter.stream(errorGenerator());

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('Generator error');
      }
    });
  });

  describe('Large Dataset Simulation', () => {
    it('should handle large datasets efficiently', async () => {
      const result = await outport<TestUser>()
        .to(csvFile)
        .withBatchSize(100)
        .fromAsyncGenerator(generateUsers(1000));

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(1000);
      }

      // Verify file was created
      expect(fs.existsSync(csvFile)).toBe(true);

      // Just check first and last lines without reading entire file
      const content = fs.readFileSync(csvFile, 'utf-8');
      expect(content).toContain('User1');
      expect(content).toContain('User1000');
    });
  });
});
