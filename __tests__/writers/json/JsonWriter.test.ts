/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { JsonWriter } from '../../../src/writers/json/JsonWriter';
import type { WriterOptions, FileWriter } from '../../../src/types';

interface TestUser extends Record<string, unknown> {
  id: number;
  name: string;
  email: string;
}

describe('JsonWriter', () => {
  const testDir = path.join(process.cwd(), '__tests__', 'temp', 'json-writer');
  let testFile: string;

  beforeEach(() => {
    // Create test directory
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    // Create unique test file for each test
    testFile = path.join(testDir, `test-${Date.now()}-${Math.random()}.json`);
  });

  afterEach(() => {
    // Clean up test files
    if (fs.existsSync(testFile)) {
      fs.unlinkSync(testFile);
    }
  });

  describe('constructor validation', () => {
    it('should throw error for non-json type', () => {
      // Arrange
      const options: WriterOptions<TestUser> = {
        type: 'csv',
        mode: 'write',
        file: testFile,
      };

      // Act & Assert
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      expect(() => new JsonWriter(options as any)).toThrow('Invalid writer type for JsonWriter');
    });

    it('should throw error for empty file path', () => {
      // Arrange
      const options: WriterOptions<TestUser> = {
        type: 'json',
        mode: 'write',
        file: '',
      };

      // Act & Assert
      expect(() => new JsonWriter(options)).toThrow('File path must be provided for JsonWriter');
    });

    it('should throw error for non-json file extension', () => {
      // Arrange
      const options: WriterOptions<TestUser> = {
        type: 'json',
        mode: 'write',
        file: 'test.txt',
      };

      // Act & Assert
      expect(() => new JsonWriter(options)).toThrow('File extension must be .json for JsonWriter');
    });

    it('should throw error for invalid indent value (negative)', () => {
      // Arrange
      const options: WriterOptions<TestUser> = {
        type: 'json',
        mode: 'write',
        file: testFile,
        config: {
          indent: -1,
        },
      };

      // Act & Assert
      expect(() => new JsonWriter(options)).toThrow('Indent must be between 0 and 10');
    });

    it('should throw error for invalid indent value (too large)', () => {
      // Arrange
      const options: WriterOptions<TestUser> = {
        type: 'json',
        mode: 'write',
        file: testFile,
        config: {
          indent: 11,
        },
      };

      // Act & Assert
      expect(() => new JsonWriter(options)).toThrow('Indent must be between 0 and 10');
    });
  });

  describe('writeSync', () => {
    it('should write data as pretty-printed JSON array by default', () => {
      // Arrange
      const options: WriterOptions<TestUser> = {
        type: 'json',
        mode: 'write',
        file: testFile,
      };
      const writer = new JsonWriter<TestUser>(options);
      const data: TestUser[] = [
        { id: 1, name: 'John', email: 'john@example.com' },
        { id: 2, name: 'Jane', email: 'jane@example.com' },
      ];

      // Act
      const result = writer.writeSync(data);

      // Assert
      expect(result.success).toBe(true);
      const content = fs.readFileSync(testFile, 'utf-8');
      const parsed = JSON.parse(content) as TestUser[];
      expect(parsed).toEqual(data);
      expect(content).toContain('[\n');
      expect(content).toContain('  {\n');
    });

    it('should write data as compact JSON when prettyPrint is false', () => {
      // Arrange
      const options: WriterOptions<TestUser> = {
        type: 'json',
        mode: 'write',
        file: testFile,
        config: {
          prettyPrint: false,
        },
      };
      const writer = new JsonWriter<TestUser>(options);
      const data: TestUser[] = [
        { id: 1, name: 'John', email: 'john@example.com' },
        { id: 2, name: 'Jane', email: 'jane@example.com' },
      ];

      // Act
      writer.writeSync(data);

      // Assert
      const content = fs.readFileSync(testFile, 'utf-8');
      expect(content).not.toContain('\n');
      expect(content).toBe(JSON.stringify(data));
    });

    it('should write data with custom indentation', () => {
      // Arrange
      const options: WriterOptions<TestUser> = {
        type: 'json',
        mode: 'write',
        file: testFile,
        config: {
          prettyPrint: true,
          indent: 4,
        },
      };
      const writer = new JsonWriter<TestUser>(options);
      const data: TestUser[] = [{ id: 1, name: 'John', email: 'john@example.com' }];

      // Act
      writer.writeSync(data);

      // Assert
      const content = fs.readFileSync(testFile, 'utf-8');
      expect(content).toContain('    {\n');
      expect(content).toContain('        "id": 1');
    });

    it('should write data with UTF-8 BOM when configured', () => {
      // Arrange
      const options: WriterOptions<TestUser> = {
        type: 'json',
        mode: 'write',
        file: testFile,
        config: {
          includeUtf8Bom: true,
        },
      };
      const writer = new JsonWriter<TestUser>(options);
      const data: TestUser[] = [{ id: 1, name: 'John', email: 'john@example.com' }];

      // Act
      writer.writeSync(data);

      // Assert
      const buffer = fs.readFileSync(testFile);
      expect(buffer[0]).toBe(0xef);
      expect(buffer[1]).toBe(0xbb);
      expect(buffer[2]).toBe(0xbf);
    });

    it('should overwrite file in write mode on multiple calls', () => {
      // Arrange
      const options: WriterOptions<TestUser> = {
        type: 'json',
        mode: 'write',
        file: testFile,
      };
      const writer = new JsonWriter<TestUser>(options);
      const data1: TestUser[] = [{ id: 1, name: 'John', email: 'john@example.com' }];
      const data2: TestUser[] = [{ id: 2, name: 'Jane', email: 'jane@example.com' }];

      // Act
      writer.writeSync(data1);
      writer.writeSync(data2);

      // Assert
      const content = fs.readFileSync(testFile, 'utf-8');
      const parsed = JSON.parse(content);
      expect(parsed).toEqual(data2);
      expect(parsed.length).toBe(1);
    });

    it('should return error for empty data array', () => {
      // Arrange
      const options: WriterOptions<TestUser> = {
        type: 'json',
        mode: 'write',
        file: testFile,
      };
      const writer = new JsonWriter<TestUser>(options);

      // Act
      const result = writer.writeSync([]);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('Cannot write empty data array');
      }
    });
  });

  describe('write (async)', () => {
    it('should write data asynchronously', async () => {
      // Arrange
      const options: WriterOptions<TestUser> = {
        type: 'json',
        mode: 'write',
        file: testFile,
      };
      const writer = new JsonWriter<TestUser>(options);
      const data: TestUser[] = [
        { id: 1, name: 'John', email: 'john@example.com' },
        { id: 2, name: 'Jane', email: 'jane@example.com' },
      ];

      // Act
      const result = await writer.write(data);

      // Assert
      expect(result.success).toBe(true);
      const content = fs.readFileSync(testFile, 'utf-8');
      const parsed = JSON.parse(content);
      expect(parsed).toEqual(data);
    });

    it('should return error for empty data array', async () => {
      // Arrange
      const options: WriterOptions<TestUser> = {
        type: 'json',
        mode: 'write',
        file: testFile,
      };
      const writer = new JsonWriter<TestUser>(options);

      // Act
      const result = await writer.write([]);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('Cannot write empty data array');
      }
    });
  });

  describe('appendSync', () => {
    it('should append single row to existing file', () => {
      // Arrange
      const options: WriterOptions<TestUser> = {
        type: 'json',
        mode: 'append',
        file: testFile,
      };
      const writer = new JsonWriter<TestUser>(options);
      const data1: TestUser[] = [
        { id: 1, name: 'John', email: 'john@example.com' },
        { id: 2, name: 'Jane', email: 'jane@example.com' },
      ];
      const data2: TestUser = { id: 3, name: 'Bob', email: 'bob@example.com' };

      // Act
      writer.writeSync(data1);
      const result = writer.appendSync(data2);

      // Assert
      expect(result.success).toBe(true);
      const content = fs.readFileSync(testFile, 'utf-8');
      const parsed = JSON.parse(content);
      expect(parsed).toHaveLength(3);
      expect(parsed[2]).toEqual(data2);
    });

    it('should append multiple rows to existing file', () => {
      // Arrange
      const options: WriterOptions<TestUser> = {
        type: 'json',
        mode: 'append',
        file: testFile,
      };
      const writer = new JsonWriter<TestUser>(options);
      const data1: TestUser[] = [{ id: 1, name: 'John', email: 'john@example.com' }];
      const data2: TestUser[] = [
        { id: 2, name: 'Jane', email: 'jane@example.com' },
        { id: 3, name: 'Bob', email: 'bob@example.com' },
      ];

      // Act
      writer.writeSync(data1);
      writer.appendSync(data2);

      // Assert
      const content = fs.readFileSync(testFile, 'utf-8');
      const parsed = JSON.parse(content);
      expect(parsed).toHaveLength(3);
      expect(parsed[1]).toEqual(data2[0]);
      expect(parsed[2]).toEqual(data2[1]);
    });

    it('should create new file if it does not exist', () => {
      // Arrange
      const options: WriterOptions<TestUser> = {
        type: 'json',
        mode: 'append',
        file: testFile,
      };
      const writer = new JsonWriter<TestUser>(options);
      const data: TestUser = { id: 1, name: 'John', email: 'john@example.com' };

      // Act
      const result = writer.appendSync(data);

      // Assert
      expect(result.success).toBe(true);
      expect(fs.existsSync(testFile)).toBe(true);
      const content = fs.readFileSync(testFile, 'utf-8');
      const parsed = JSON.parse(content);
      expect(parsed).toEqual([data]);
    });

    it('should handle empty array as no-op', () => {
      // Arrange
      const options: WriterOptions<TestUser> = {
        type: 'json',
        mode: 'append',
        file: testFile,
      };
      const writer = new JsonWriter<TestUser>(options);
      const data: TestUser[] = [{ id: 1, name: 'John', email: 'john@example.com' }];

      // Act
      writer.writeSync(data);
      const result = writer.appendSync([]);

      // Assert
      expect(result.success).toBe(true);
      const content = fs.readFileSync(testFile, 'utf-8');
      const parsed = JSON.parse(content);
      expect(parsed).toEqual(data);
    });

    it('should load existing data when appending to file created outside writer', () => {
      // Arrange
      const existingData: TestUser[] = [{ id: 1, name: 'Existing', email: 'existing@example.com' }];
      fs.writeFileSync(testFile, JSON.stringify(existingData), 'utf-8');

      const options: WriterOptions<TestUser> = {
        type: 'json',
        mode: 'append',
        file: testFile,
      };
      const writer = new JsonWriter<TestUser>(options);
      const newData: TestUser = { id: 2, name: 'New', email: 'new@example.com' };

      // Act
      writer.appendSync(newData);

      // Assert
      const content = fs.readFileSync(testFile, 'utf-8');
      const parsed = JSON.parse(content);
      expect(parsed).toHaveLength(2);
      expect(parsed[0]).toEqual(existingData[0]);
      expect(parsed[1]).toEqual(newData);
    });

    it('should handle file with UTF-8 BOM', () => {
      // Arrange
      const existingData: TestUser[] = [{ id: 1, name: 'Existing', email: 'existing@example.com' }];
      fs.writeFileSync(testFile, '\uFEFF' + JSON.stringify(existingData), 'utf-8');

      const options: WriterOptions<TestUser> = {
        type: 'json',
        mode: 'append',
        file: testFile,
      };
      const writer = new JsonWriter<TestUser>(options);
      const newData: TestUser = { id: 2, name: 'New', email: 'new@example.com' };

      // Act
      writer.appendSync(newData);

      // Assert
      const content = fs.readFileSync(testFile, 'utf-8');
      const parsed = JSON.parse(content.replace(/^\uFEFF/, ''));
      expect(parsed).toHaveLength(2);
    });
  });

  describe('append (async)', () => {
    it('should append single row to existing file asynchronously', async () => {
      // Arrange
      const options: WriterOptions<TestUser> = {
        type: 'json',
        mode: 'append',
        file: testFile,
      };
      const writer = new JsonWriter<TestUser>(options);
      const data1: TestUser[] = [{ id: 1, name: 'John', email: 'john@example.com' }];
      const data2: TestUser = { id: 2, name: 'Jane', email: 'jane@example.com' };

      // Act
      await writer.write(data1);
      const result = await writer.append(data2);

      // Assert
      expect(result.success).toBe(true);
      const content = fs.readFileSync(testFile, 'utf-8');
      const parsed = JSON.parse(content);
      expect(parsed).toHaveLength(2);
      expect(parsed[1]).toEqual(data2);
    });

    it('should handle empty array as no-op', async () => {
      // Arrange
      const options: WriterOptions<TestUser> = {
        type: 'json',
        mode: 'append',
        file: testFile,
      };
      const writer = new JsonWriter<TestUser>(options);
      const data: TestUser[] = [{ id: 1, name: 'John', email: 'john@example.com' }];

      // Act
      await writer.write(data);
      const result = await writer.append([]);

      // Assert
      expect(result.success).toBe(true);
      const content = fs.readFileSync(testFile, 'utf-8');
      const parsed = JSON.parse(content);
      expect(parsed).toEqual(data);
    });
  });

  describe('append mode with writeSync', () => {
    it('should append to existing file when using writeSync in append mode', () => {
      // Arrange
      const options: WriterOptions<TestUser> = {
        type: 'json',
        mode: 'append',
        file: testFile,
      };
      const writer = new JsonWriter<TestUser>(options);
      const data1: TestUser[] = [{ id: 1, name: 'John', email: 'john@example.com' }];
      const data2: TestUser[] = [{ id: 2, name: 'Jane', email: 'jane@example.com' }];

      // Act
      writer.writeSync(data1);
      writer.writeSync(data2);

      // Assert
      const content = fs.readFileSync(testFile, 'utf-8');
      const parsed = JSON.parse(content);
      expect(parsed).toHaveLength(2);
      expect(parsed[0]).toEqual(data1[0]);
      expect(parsed[1]).toEqual(data2[0]);
    });
  });

  describe('integration with WriterFactory', () => {
    it('should work when created via factory', async () => {
      // Arrange
      const { WriterFactory } = await import('../../../src/writers/WriterFactory');
      const writer = WriterFactory.create<TestUser>({
        type: 'json',
        mode: 'write',
        file: testFile,
      });
      const data: TestUser[] = [{ id: 1, name: 'John', email: 'john@example.com' }];

      // Act
      const result = writer.writeSync(data);

      // Assert
      expect(result.success).toBe(true);
      const content = fs.readFileSync(testFile, 'utf-8');
      const parsed = JSON.parse(content) as TestUser[];
      expect(parsed).toEqual(data);
    });
  });

  describe('error handling', () => {
    it('should handle file write errors', () => {
      // Arrange
      const mockFileWriter: FileWriter = {
        writeSync: vi.fn().mockReturnValue({ success: false, error: new Error('Write failed') }),
        write: vi.fn(),
        appendSync: vi.fn(),
        append: vi.fn(),
        existsSync: vi.fn().mockReturnValue(false),
        exists: vi.fn(),
      };

      const options: WriterOptions<TestUser> = {
        type: 'json',
        mode: 'write',
        file: testFile,
      };
      const writer = new JsonWriter<TestUser>(options, mockFileWriter);
      const data: TestUser[] = [{ id: 1, name: 'John', email: 'john@example.com' }];

      // Act
      const result = writer.writeSync(data);

      // Assert
      expect(result.success).toBe(false);
    });

    it('should handle invalid JSON in existing file', () => {
      // Arrange
      fs.writeFileSync(testFile, 'invalid json content', 'utf-8');

      const options: WriterOptions<TestUser> = {
        type: 'json',
        mode: 'append',
        file: testFile,
      };
      const writer = new JsonWriter<TestUser>(options);
      const data: TestUser = { id: 1, name: 'John', email: 'john@example.com' };

      // Act
      const result = writer.appendSync(data);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('Failed to parse existing JSON file');
      }
    });
  });

  describe('special data types', () => {
    it('should handle nested objects', () => {
      // Arrange
      interface ComplexUser extends Record<string, unknown> {
        id: number;
        profile: {
          name: string;
          tags: string[];
        };
      }
      const options: WriterOptions<ComplexUser> = {
        type: 'json',
        mode: 'write',
        file: testFile,
      };
      const writer = new JsonWriter<ComplexUser>(options);
      const data: ComplexUser[] = [
        {
          id: 1,
          profile: {
            name: 'John',
            tags: ['developer', 'typescript'],
          },
        },
      ];

      // Act
      writer.writeSync(data);

      // Assert
      const content = fs.readFileSync(testFile, 'utf-8');
      const parsed = JSON.parse(content);
      expect(parsed[0]!.profile.tags).toEqual(['developer', 'typescript']);
    });

    it('should handle null values', () => {
      // Arrange
      interface NullableUser extends Record<string, unknown> {
        id: number;
        name: string | null;
      }
      const options: WriterOptions<NullableUser> = {
        type: 'json',
        mode: 'write',
        file: testFile,
      };
      const writer = new JsonWriter<NullableUser>(options);
      const data: NullableUser[] = [{ id: 1, name: null }];

      // Act
      writer.writeSync(data);

      // Assert
      const content = fs.readFileSync(testFile, 'utf-8');
      expect(content).toContain('"name": null');
    });

    it('should handle boolean values', () => {
      // Arrange
      interface BoolUser extends Record<string, unknown> {
        id: number;
        active: boolean;
      }
      const options: WriterOptions<BoolUser> = {
        type: 'json',
        mode: 'write',
        file: testFile,
      };
      const writer = new JsonWriter<BoolUser>(options);
      const data: BoolUser[] = [
        { id: 1, active: true },
        { id: 2, active: false },
      ];

      // Act
      writer.writeSync(data);

      // Assert
      const content = fs.readFileSync(testFile, 'utf-8');
      expect(content).toContain('"active": true');
      expect(content).toContain('"active": false');
    });
  });
});
