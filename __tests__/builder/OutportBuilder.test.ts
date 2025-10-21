import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OutportBuilder } from '../../src/builder/OutportBuilder';
import { outport } from '../../src/convenience/factory';
import * as fs from 'node:fs';
import * as path from 'node:path';

interface TestUser extends Record<string, unknown> {
  id: number;
  name: string;
  email: string;
}

describe('OutportBuilder', () => {
  const testDir = path.join(process.cwd(), '__tests__', 'temp', 'builder');
  const csvFile = path.join(testDir, 'users.csv');
  const jsonFile = path.join(testDir, 'users.json');

  beforeEach(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test files
    [csvFile, jsonFile].forEach((file) => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
  });

  describe('Basic Builder Creation', () => {
    it('should create a new builder instance', () => {
      const builder = new OutportBuilder<TestUser>();
      expect(builder).toBeInstanceOf(OutportBuilder);
    });

    it('should create builder using factory function', () => {
      const builder = outport<TestUser>();
      expect(builder).toBeInstanceOf(OutportBuilder);
    });
  });

  describe('File Path Configuration', () => {
    it('should set file path using to()', () => {
      const builder = outport<TestUser>().to(csvFile);
      expect(builder).toBeInstanceOf(OutportBuilder);
    });

    it('should auto-detect CSV type from .csv extension', async () => {
      const users: TestUser[] = [
        { id: 1, name: 'Alice', email: 'alice@example.com' },
        { id: 2, name: 'Bob', email: 'bob@example.com' },
      ];

      const result = await outport<TestUser>().to(csvFile).write(users);

      expect(result.success).toBe(true);
      expect(fs.existsSync(csvFile)).toBe(true);

      const content = fs.readFileSync(csvFile, 'utf-8');
      expect(content).toContain('Alice');
    });

    it('should auto-detect JSON type from .json extension', async () => {
      const users: TestUser[] = [
        { id: 1, name: 'Alice', email: 'alice@example.com' },
        { id: 2, name: 'Bob', email: 'bob@example.com' },
      ];

      const result = await outport<TestUser>().to(jsonFile).write(users);

      expect(result.success).toBe(true);
      expect(fs.existsSync(jsonFile)).toBe(true);

      const content = fs.readFileSync(jsonFile, 'utf-8');
      const data = JSON.parse(content) as TestUser[];
      expect(data).toHaveLength(2);
      expect(data[0]?.name).toBe('Alice');
    });

    it('should allow explicit type with as()', async () => {
      const users: TestUser[] = [{ id: 1, name: 'Alice', email: 'alice@example.com' }];

      const result = await outport<TestUser>().to(csvFile).as('csv').write(users);

      expect(result.success).toBe(true);
    });

    it('should throw error if no file path specified', () => {
      const builder = outport<TestUser>();

      expect(() => builder.writeSync([])).toThrow('File path must be specified');
    });
  });

  describe('CSV Configuration', () => {
    it('should set custom delimiter', async () => {
      const users: TestUser[] = [
        { id: 1, name: 'Alice', email: 'alice@example.com' },
        { id: 2, name: 'Bob', email: 'bob@example.com' },
      ];

      await outport<TestUser>().to(csvFile).withDelimiter('\t').write(users);

      const content = fs.readFileSync(csvFile, 'utf-8');
      expect(content).toContain('\t');
    });

    it('should set custom headers', async () => {
      const users: TestUser[] = [{ id: 1, name: 'Alice', email: 'alice@example.com' }];

      await outport<TestUser>()
        .to(csvFile)
        .withHeaders(['User ID', 'Full Name', 'Email Address'])
        .write(users);

      const content = fs.readFileSync(csvFile, 'utf-8');
      expect(content).toContain('User ID');
      expect(content).toContain('Full Name');
      expect(content).toContain('Email Address');
    });

    it('should set column mapping', async () => {
      const users: TestUser[] = [{ id: 1, name: 'Alice', email: 'alice@example.com' }];

      await outport<TestUser>()
        .to(csvFile)
        .withColumnMapping({ id: 'User ID', name: 'Full Name' })
        .write(users);

      const content = fs.readFileSync(csvFile, 'utf-8');
      expect(content).toContain('User ID');
      expect(content).toContain('Full Name');
    });

    it('should select specific columns', async () => {
      const users: TestUser[] = [{ id: 1, name: 'Alice', email: 'alice@example.com' }];

      await outport<TestUser>().to(csvFile).withColumns(['id', 'name']).write(users);

      const content = fs.readFileSync(csvFile, 'utf-8');
      const lines = content.trim().split('\n');
      expect(lines[0]).toBe('id,name');
      expect(lines[1]).toBe('1,Alice');
    });

    it('should enable UTF-8 BOM for CSV', async () => {
      const users: TestUser[] = [{ id: 1, name: 'Alice', email: 'alice@example.com' }];

      await outport<TestUser>().to(csvFile).withUtf8Bom(true).write(users);

      const buffer = fs.readFileSync(csvFile);
      expect(buffer[0]).toBe(0xef);
      expect(buffer[1]).toBe(0xbb);
      expect(buffer[2]).toBe(0xbf);
    });
  });

  describe('JSON Configuration', () => {
    it('should enable pretty printing', async () => {
      const users: TestUser[] = [{ id: 1, name: 'Alice', email: 'alice@example.com' }];

      await outport<TestUser>().to(jsonFile).prettyPrint(true).write(users);

      const content = fs.readFileSync(jsonFile, 'utf-8');
      expect(content).toContain('\n');
      expect(content).toContain('  '); // Indentation
    });

    it('should disable pretty printing', async () => {
      const users: TestUser[] = [{ id: 1, name: 'Alice', email: 'alice@example.com' }];

      await outport<TestUser>().to(jsonFile).prettyPrint(false).write(users);

      const content = fs.readFileSync(jsonFile, 'utf-8');
      expect(content).not.toContain('\n  ');
    });

    it('should set custom indentation', async () => {
      const users: TestUser[] = [{ id: 1, name: 'Alice', email: 'alice@example.com' }];

      await outport<TestUser>().to(jsonFile).withIndent(4).write(users);

      const content = fs.readFileSync(jsonFile, 'utf-8');
      expect(content).toContain('    '); // 4 spaces
    });
  });

  describe('Write Operations', () => {
    it('should write data synchronously', () => {
      const users: TestUser[] = [
        { id: 1, name: 'Alice', email: 'alice@example.com' },
        { id: 2, name: 'Bob', email: 'bob@example.com' },
      ];

      const result = outport<TestUser>().to(csvFile).writeSync(users);

      expect(result.success).toBe(true);
      expect(fs.existsSync(csvFile)).toBe(true);
    });

    it('should write data asynchronously', async () => {
      const users: TestUser[] = [
        { id: 1, name: 'Alice', email: 'alice@example.com' },
        { id: 2, name: 'Bob', email: 'bob@example.com' },
      ];

      const result = await outport<TestUser>().to(csvFile).write(users);

      expect(result.success).toBe(true);
      expect(fs.existsSync(csvFile)).toBe(true);
    });

    it('should append data', async () => {
      const user1: TestUser[] = [{ id: 1, name: 'Alice', email: 'alice@example.com' }];
      const user2: TestUser = { id: 2, name: 'Bob', email: 'bob@example.com' };

      await outport<TestUser>().to(csvFile).write(user1);
      await outport<TestUser>().to(csvFile).inMode('append').append(user2);

      const content = fs.readFileSync(csvFile, 'utf-8');
      expect(content).toContain('Alice');
      expect(content).toContain('Bob');
    });
  });

  describe('Lifecycle Hooks', () => {
    it('should call onProgress hook', async () => {
      const users: TestUser[] = [
        { id: 1, name: 'Alice', email: 'alice@example.com' },
        { id: 2, name: 'Bob', email: 'bob@example.com' },
      ];

      const progressCalls: Array<{ current: number; total?: number }> = [];

      await outport<TestUser>()
        .to(csvFile)
        .onProgress((current, total) => {
          progressCalls.push({ current, total });
        })
        .write(users);

      expect(progressCalls.length).toBeGreaterThan(0);
      expect(progressCalls[progressCalls.length - 1]?.current).toBe(2);
    });

    it('should call onBeforeWrite hook', async () => {
      const users: TestUser[] = [
        { id: 1, name: 'Alice', email: 'alice@example.com' },
        { id: 2, name: 'Bob', email: 'bob@example.com' },
      ];

      const beforeWriteCalled = vi.fn((data: TestUser[]) => data);

      await outport<TestUser>().to(csvFile).onBeforeWrite(beforeWriteCalled).write(users);

      expect(beforeWriteCalled).toHaveBeenCalledWith(users);
    });

    it('should transform data in onBeforeWrite hook', async () => {
      const users: TestUser[] = [
        { id: 1, name: 'Alice', email: 'alice@example.com' },
        { id: 2, name: 'Bob', email: 'bob@example.com' },
      ];

      await outport<TestUser>()
        .to(csvFile)
        .onBeforeWrite((data) => data.filter((u) => u.id === 1))
        .write(users);

      const content = fs.readFileSync(csvFile, 'utf-8');
      expect(content).toContain('Alice');
      expect(content).not.toContain('Bob');
    });

    it('should call onAfterWrite hook', async () => {
      const users: TestUser[] = [{ id: 1, name: 'Alice', email: 'alice@example.com' }];

      const afterWriteCalled = vi.fn();

      await outport<TestUser>().to(csvFile).onAfterWrite(afterWriteCalled).write(users);

      expect(afterWriteCalled).toHaveBeenCalledWith(users, 1);
    });

    it('should call onComplete hook', async () => {
      const users: TestUser[] = [{ id: 1, name: 'Alice', email: 'alice@example.com' }];

      const completeCalled = vi.fn();

      await outport<TestUser>().to(csvFile).onComplete(completeCalled).write(users);

      expect(completeCalled).toHaveBeenCalled();
    });

    it('should call onError hook on failure', async () => {
      const errorCalled = vi.fn();

      // Invalid path to trigger error
      const result = await outport<TestUser>()
        .to('/invalid/path/file.csv')
        .onError(errorCalled)
        .write([{ id: 1, name: 'Alice', email: 'alice@example.com' }]);

      expect(result.success).toBe(false);
      expect(errorCalled).toHaveBeenCalled();
    });
  });

  describe('Method Chaining', () => {
    it('should support fluent API chaining', async () => {
      const users: TestUser[] = [{ id: 1, name: 'Alice', email: 'alice@example.com' }];

      const result = await outport<TestUser>()
        .to(csvFile)
        .withDelimiter(',')
        .withHeaders(['ID', 'Name', 'Email'])
        .withUtf8Bom(false)
        .onProgress((_current) => {
          /* no-op */
        })
        .write(users);

      expect(result.success).toBe(true);
    });
  });

  describe('Batch Size Configuration', () => {
    it('should set and get batch size', () => {
      const builder = outport<TestUser>().withBatchSize(50);
      expect(builder.getBatchSize()).toBe(50);
    });

    it('should have default batch size of 100', () => {
      const builder = outport<TestUser>();
      expect(builder.getBatchSize()).toBe(100);
    });
  });
});
