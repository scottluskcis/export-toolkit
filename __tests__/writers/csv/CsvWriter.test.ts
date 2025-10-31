import { describe, it, expect, beforeEach, afterEach, afterAll, vi } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { CsvWriter } from '../../../src/writers/csv/CsvWriter';
import type { WriterOptions, FileWriter } from '../../../src/types';

interface TestUser extends Record<string, unknown> {
  id: number;
  name: string;
  email: string;
}

describe('CsvWriter', () => {
  const testDir = path.join(process.cwd(), '__tests__', 'temp', 'csv-writer');
  let testFile: string;

  beforeEach(() => {
    // Create test directory
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    // Create unique test file for each test
    testFile = path.join(testDir, `test-${Date.now()}-${Math.random()}.csv`);
  });

  afterEach(() => {
    // Clean up test files
    if (fs.existsSync(testFile)) {
      fs.unlinkSync(testFile);
    }
  });

  describe('constructor validation', () => {
    it('should throw error for non-csv type', () => {
      // Arrange
      const options: WriterOptions<TestUser> = {
        type: 'json',
        mode: 'write',
        file: testFile,
      };

      // Act & Assert
      expect(() => new CsvWriter(options as any)).toThrow('Invalid writer type for CsvWriter');
    });

    it('should throw error for empty file path', () => {
      // Arrange
      const options: WriterOptions<TestUser> = {
        type: 'csv',
        mode: 'write',
        file: '',
      };

      // Act & Assert
      expect(() => new CsvWriter(options)).toThrow('File path must be provided for CsvWriter');
    });

    it('should throw error for non-csv file extension', () => {
      // Arrange
      const options: WriterOptions<TestUser> = {
        type: 'csv',
        mode: 'write',
        file: 'test.txt',
      };

      // Act & Assert
      expect(() => new CsvWriter(options)).toThrow('File extension must be .csv for CsvWriter');
    });

    it('should throw error for multi-character delimiter', () => {
      // Arrange
      const options: WriterOptions<TestUser> = {
        type: 'csv',
        mode: 'write',
        file: testFile,
        config: {
          delimiter: ',,',
        },
      };

      // Act & Assert
      expect(() => new CsvWriter(options)).toThrow('Delimiter must be a single character');
    });

    it('should throw error for multi-character quote', () => {
      // Arrange
      const options: WriterOptions<TestUser> = {
        type: 'csv',
        mode: 'write',
        file: testFile,
        config: {
          quote: '""',
        },
      };

      // Act & Assert
      expect(() => new CsvWriter(options)).toThrow('Quote character must be a single character');
    });
  });

  describe('writeSync', () => {
    it('should write data with inferred headers', () => {
      // Arrange
      const options: WriterOptions<TestUser> = {
        type: 'csv',
        mode: 'write',
        file: testFile,
      };
      const writer = new CsvWriter<TestUser>(options);
      const data: TestUser[] = [
        { id: 1, name: 'John', email: 'john@example.com' },
        { id: 2, name: 'Jane', email: 'jane@example.com' },
      ];

      // Act
      const result = writer.writeSync(data);

      // Assert
      expect(result.success).toBe(true);
      const content = fs.readFileSync(testFile, 'utf-8');
      expect(content).toBe('id,name,email\n1,John,john@example.com\n2,Jane,jane@example.com\n');
    });

    it('should write data with custom headers', () => {
      // Arrange
      const options: WriterOptions<TestUser> = {
        type: 'csv',
        mode: 'write',
        file: testFile,
        config: {
          headers: ['ID', 'Name', 'Email'],
        },
      };
      const writer = new CsvWriter<TestUser>(options);
      const data: TestUser[] = [{ id: 1, name: 'John', email: 'john@example.com' }];

      // Act
      const result = writer.writeSync(data);

      // Assert
      expect(result.success).toBe(true);
      const content = fs.readFileSync(testFile, 'utf-8');
      expect(content).toBe('ID,Name,Email\n1,John,john@example.com\n');
    });

    it('should write data with column mapping', () => {
      // Arrange
      const options: WriterOptions<TestUser> = {
        type: 'csv',
        mode: 'write',
        file: testFile,
        config: {
          columnMapping: {
            id: 'User ID',
            name: 'Full Name',
            email: 'Email Address',
          },
        },
      };
      const writer = new CsvWriter<TestUser>(options);
      const data: TestUser[] = [{ id: 1, name: 'John', email: 'john@example.com' }];

      // Act
      writer.writeSync(data);

      // Assert
      const content = fs.readFileSync(testFile, 'utf-8');
      expect(content).toBe('User ID,Full Name,Email Address\n1,John,john@example.com\n');
    });

    it('should write data with includeKeys', () => {
      // Arrange
      const options: WriterOptions<TestUser> = {
        type: 'csv',
        mode: 'write',
        file: testFile,
        config: {
          includeKeys: ['name', 'email'],
        },
      };
      const writer = new CsvWriter<TestUser>(options);
      const data: TestUser[] = [{ id: 1, name: 'John', email: 'john@example.com' }];

      // Act
      writer.writeSync(data);

      // Assert
      const content = fs.readFileSync(testFile, 'utf-8');
      expect(content).toBe('name,email\nJohn,john@example.com\n');
    });

    it('should use custom delimiter', () => {
      // Arrange
      const options: WriterOptions<TestUser> = {
        type: 'csv',
        mode: 'write',
        file: testFile,
        config: {
          delimiter: '\t',
        },
      };
      const writer = new CsvWriter<TestUser>(options);
      const data: TestUser[] = [{ id: 1, name: 'John', email: 'john@example.com' }];

      // Act
      writer.writeSync(data);

      // Assert
      const content = fs.readFileSync(testFile, 'utf-8');
      expect(content).toBe('id\tname\temail\n1\tJohn\tjohn@example.com\n');
    });

    it('should add UTF-8 BOM when configured', () => {
      // Arrange
      const options: WriterOptions<TestUser> = {
        type: 'csv',
        mode: 'write',
        file: testFile,
        config: {
          includeUtf8Bom: true,
        },
      };
      const writer = new CsvWriter<TestUser>(options);
      const data: TestUser[] = [{ id: 1, name: 'John', email: 'john@example.com' }];

      // Act
      writer.writeSync(data);

      // Assert
      const content = fs.readFileSync(testFile, 'utf-8');
      expect(content).toBe('\uFEFFid,name,email\n1,John,john@example.com\n');
    });

    it('should return error for empty data array', () => {
      // Arrange
      const options: WriterOptions<TestUser> = {
        type: 'csv',
        mode: 'write',
        file: testFile,
      };
      const writer = new CsvWriter<TestUser>(options);

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
        type: 'csv',
        mode: 'write',
        file: testFile,
      };
      const writer = new CsvWriter<TestUser>(options);
      const data: TestUser[] = [
        { id: 1, name: 'John', email: 'john@example.com' },
        { id: 2, name: 'Jane', email: 'jane@example.com' },
      ];

      // Act
      const result = await writer.write(data);

      // Assert
      expect(result.success).toBe(true);
      const content = fs.readFileSync(testFile, 'utf-8');
      expect(content).toBe('id,name,email\n1,John,john@example.com\n2,Jane,jane@example.com\n');
    });

    it('should return error for empty data array', async () => {
      // Arrange
      const options: WriterOptions<TestUser> = {
        type: 'csv',
        mode: 'write',
        file: testFile,
      };
      const writer = new CsvWriter<TestUser>(options);

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
        type: 'csv',
        mode: 'append',
        file: testFile,
      };
      const writer = new CsvWriter<TestUser>(options);

      // Write initial data
      writer.writeSync([{ id: 1, name: 'John', email: 'john@example.com' }]);

      // Act
      const result = writer.appendSync({
        id: 2,
        name: 'Jane',
        email: 'jane@example.com',
      });

      // Assert
      expect(result.success).toBe(true);
      const content = fs.readFileSync(testFile, 'utf-8');
      expect(content).toBe('id,name,email\n1,John,john@example.com\n2,Jane,jane@example.com\n');
    });

    it('should append multiple rows to existing file', () => {
      // Arrange
      const options: WriterOptions<TestUser> = {
        type: 'csv',
        mode: 'append',
        file: testFile,
      };
      const writer = new CsvWriter<TestUser>(options);

      // Write initial data
      writer.writeSync([{ id: 1, name: 'John', email: 'john@example.com' }]);

      // Act
      const result = writer.appendSync([
        { id: 2, name: 'Jane', email: 'jane@example.com' },
        { id: 3, name: 'Bob', email: 'bob@example.com' },
      ]);

      // Assert
      expect(result.success).toBe(true);
      const content = fs.readFileSync(testFile, 'utf-8');
      expect(content).toBe(
        'id,name,email\n1,John,john@example.com\n2,Jane,jane@example.com\n3,Bob,bob@example.com\n'
      );
    });

    it('should create file with headers if it does not exist in append mode', () => {
      // Arrange
      const options: WriterOptions<TestUser> = {
        type: 'csv',
        mode: 'append',
        file: testFile,
      };
      const writer = new CsvWriter<TestUser>(options);

      // Act
      const result = writer.appendSync({
        id: 1,
        name: 'John',
        email: 'john@example.com',
      });

      // Assert
      expect(result.success).toBe(true);
      const content = fs.readFileSync(testFile, 'utf-8');
      expect(content).toBe('id,name,email\n1,John,john@example.com\n');
    });

    it('should handle empty array gracefully', () => {
      // Arrange
      const options: WriterOptions<TestUser> = {
        type: 'csv',
        mode: 'append',
        file: testFile,
      };
      const writer = new CsvWriter<TestUser>(options);

      // Act
      const result = writer.appendSync([]);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe('append (async)', () => {
    it('should append single row to existing file asynchronously', async () => {
      // Arrange
      const options: WriterOptions<TestUser> = {
        type: 'csv',
        mode: 'append',
        file: testFile,
      };
      const writer = new CsvWriter<TestUser>(options);

      // Write initial data
      await writer.write([{ id: 1, name: 'John', email: 'john@example.com' }]);

      // Act
      const result = await writer.append({
        id: 2,
        name: 'Jane',
        email: 'jane@example.com',
      });

      // Assert
      expect(result.success).toBe(true);
      const content = fs.readFileSync(testFile, 'utf-8');
      expect(content).toBe('id,name,email\n1,John,john@example.com\n2,Jane,jane@example.com\n');
    });

    it('should append multiple rows asynchronously', async () => {
      // Arrange
      const options: WriterOptions<TestUser> = {
        type: 'csv',
        mode: 'append',
        file: testFile,
      };
      const writer = new CsvWriter<TestUser>(options);

      // Write initial data
      await writer.write([{ id: 1, name: 'John', email: 'john@example.com' }]);

      // Act
      const result = await writer.append([
        { id: 2, name: 'Jane', email: 'jane@example.com' },
        { id: 3, name: 'Bob', email: 'bob@example.com' },
      ]);

      // Assert
      expect(result.success).toBe(true);
      const content = fs.readFileSync(testFile, 'utf-8');
      expect(content).toBe(
        'id,name,email\n1,John,john@example.com\n2,Jane,jane@example.com\n3,Bob,bob@example.com\n'
      );
    });
  });

  describe('dependency injection', () => {
    it('should accept custom FileWriter implementation', () => {
      // Arrange
      const writeSyncSpy = vi.fn(() => ({ success: true as const, value: undefined as void }));
      const writeSpy = vi.fn(() =>
        Promise.resolve({ success: true as const, value: undefined as void })
      );
      const appendSyncSpy = vi.fn(() => ({ success: true as const, value: undefined as void }));
      const appendSpy = vi.fn(() =>
        Promise.resolve({ success: true as const, value: undefined as void })
      );
      const existsSyncSpy = vi.fn(() => false);
      const existsSpy = vi.fn(() => Promise.resolve(false));

      const mockFileWriter: FileWriter = {
        writeSync: writeSyncSpy,
        write: writeSpy,
        appendSync: appendSyncSpy,
        append: appendSpy,
        existsSync: existsSyncSpy,
        exists: existsSpy,
      };

      const options: WriterOptions<TestUser> = {
        type: 'csv',
        mode: 'write',
        file: testFile,
      };
      const writer = new CsvWriter<TestUser>(options, mockFileWriter);
      const data: TestUser[] = [{ id: 1, name: 'John', email: 'john@example.com' }];

      // Act
      writer.writeSync(data);

      // Assert
      expect(writeSyncSpy).toHaveBeenCalledWith(testFile, 'id,name,email\n');
      expect(appendSyncSpy).toHaveBeenCalledWith(testFile, '1,John,john@example.com\n');
    });
  });

  describe('mode behavior', () => {
    it('should overwrite file in write mode', () => {
      // Arrange
      const options: WriterOptions<TestUser> = {
        type: 'csv',
        mode: 'write',
        file: testFile,
      };
      const writer = new CsvWriter<TestUser>(options);

      // Write initial data
      writer.writeSync([{ id: 1, name: 'John', email: 'john@example.com' }]);

      // Act - write again
      writer.writeSync([{ id: 2, name: 'Jane', email: 'jane@example.com' }]);

      // Assert
      const content = fs.readFileSync(testFile, 'utf-8');
      // File should only contain the second write (not appended)
      expect(content).toBe('id,name,email\n2,Jane,jane@example.com\n');
    });

    it('should not write headers again in append mode if file exists', () => {
      // Arrange
      const options: WriterOptions<TestUser> = {
        type: 'csv',
        mode: 'append',
        file: testFile,
      };
      const writer = new CsvWriter<TestUser>(options);

      // Write initial data
      writer.writeSync([{ id: 1, name: 'John', email: 'john@example.com' }]);

      // Create new writer instance with same file
      const writer2 = new CsvWriter<TestUser>(options);

      // Act - append more data
      writer2.appendSync({ id: 2, name: 'Jane', email: 'jane@example.com' });

      // Assert
      const content = fs.readFileSync(testFile, 'utf-8');
      const lines = content.split('\n').filter((line) => line.length > 0);
      const headerCount = lines.filter((line) => line === 'id,name,email').length;
      expect(headerCount).toBe(1); // Should only have one header row
    });
  });

  describe('flattenNestedObjects option', () => {
    interface NestedUser extends Record<string, unknown> {
      id: number;
      name: string;
      address: {
        street: string;
        city: string;
        zip: string;
      };
      contact: {
        email: string;
        phone: string;
      };
    }

    it('should write flattened CSV with nested objects (writeSync)', () => {
      // Arrange
      const options: WriterOptions<NestedUser> = {
        type: 'csv',
        mode: 'write',
        file: testFile,
        config: {
          flattenNestedObjects: true,
        },
      };
      const writer = new CsvWriter<NestedUser>(options);
      const data: NestedUser[] = [
        {
          id: 1,
          name: 'John Doe',
          address: { street: '123 Main St', city: 'NYC', zip: '10001' },
          contact: { email: 'john@example.com', phone: '555-1234' },
        },
        {
          id: 2,
          name: 'Jane Smith',
          address: { street: '456 Oak Ave', city: 'LA', zip: '90001' },
          contact: { email: 'jane@example.com', phone: '555-5678' },
        },
      ];

      // Act
      const result = writer.writeSync(data);

      // Assert
      expect(result.success).toBe(true);
      const content = fs.readFileSync(testFile, 'utf-8');
      const lines = content.split('\n').filter((line) => line.length > 0);

      expect(lines[0]).toBe(
        'id,name,address_street,address_city,address_zip,contact_email,contact_phone'
      );
      expect(lines[1]).toBe('1,John Doe,123 Main St,NYC,10001,john@example.com,555-1234');
      expect(lines[2]).toBe('2,Jane Smith,456 Oak Ave,LA,90001,jane@example.com,555-5678');
    });

    it('should write flattened CSV with nested objects (async write)', async () => {
      // Arrange
      const options: WriterOptions<NestedUser> = {
        type: 'csv',
        mode: 'write',
        file: testFile,
        config: {
          flattenNestedObjects: true,
        },
      };
      const writer = new CsvWriter<NestedUser>(options);
      const data: NestedUser[] = [
        {
          id: 1,
          name: 'John Doe',
          address: { street: '123 Main St', city: 'NYC', zip: '10001' },
          contact: { email: 'john@example.com', phone: '555-1234' },
        },
      ];

      // Act
      const result = await writer.write(data);

      // Assert
      expect(result.success).toBe(true);
      const content = fs.readFileSync(testFile, 'utf-8');
      const lines = content.split('\n').filter((line) => line.length > 0);

      expect(lines[0]).toBe(
        'id,name,address_street,address_city,address_zip,contact_email,contact_phone'
      );
      expect(lines[1]).toBe('1,John Doe,123 Main St,NYC,10001,john@example.com,555-1234');
    });

    it('should append flattened rows (appendSync)', () => {
      // Arrange
      const options: WriterOptions<NestedUser> = {
        type: 'csv',
        mode: 'append',
        file: testFile,
        config: {
          flattenNestedObjects: true,
        },
      };
      const writer = new CsvWriter<NestedUser>(options);
      const user1: NestedUser = {
        id: 1,
        name: 'John Doe',
        address: { street: '123 Main St', city: 'NYC', zip: '10001' },
        contact: { email: 'john@example.com', phone: '555-1234' },
      };
      const user2: NestedUser = {
        id: 2,
        name: 'Jane Smith',
        address: { street: '456 Oak Ave', city: 'LA', zip: '90001' },
        contact: { email: 'jane@example.com', phone: '555-5678' },
      };

      // Act
      writer.appendSync(user1);
      writer.appendSync(user2);

      // Assert
      const content = fs.readFileSync(testFile, 'utf-8');
      const lines = content.split('\n').filter((line) => line.length > 0);

      expect(lines.length).toBe(3);
      expect(lines[0]).toBe(
        'id,name,address_street,address_city,address_zip,contact_email,contact_phone'
      );
      expect(lines[1]).toBe('1,John Doe,123 Main St,NYC,10001,john@example.com,555-1234');
      expect(lines[2]).toBe('2,Jane Smith,456 Oak Ave,LA,90001,jane@example.com,555-5678');
    });

    it('should handle arrays in nested objects by converting to JSON', () => {
      // Arrange
      interface UserWithArray extends Record<string, unknown> {
        id: number;
        profile: {
          name: string;
          tags: string[];
        };
      }

      const options: WriterOptions<UserWithArray> = {
        type: 'csv',
        mode: 'write',
        file: testFile,
        config: {
          flattenNestedObjects: true,
        },
      };
      const writer = new CsvWriter<UserWithArray>(options);
      const data: UserWithArray[] = [
        {
          id: 1,
          profile: { name: 'John', tags: ['developer', 'typescript'] },
        },
      ];

      // Act
      const result = writer.writeSync(data);

      // Assert
      expect(result.success).toBe(true);
      const content = fs.readFileSync(testFile, 'utf-8');
      const lines = content.split('\n').filter((line) => line.length > 0);

      expect(lines[0]).toBe('id,profile_name,profile_tags');
      expect(lines[1]).toBe('1,John,"[""developer"",""typescript""]"');
    });

    it('should handle null values in nested objects', () => {
      // Arrange
      interface UserWithNull extends Record<string, unknown> {
        id: number;
        profile: {
          name: string;
          middleName: null;
          age: number;
        };
      }

      const options: WriterOptions<UserWithNull> = {
        type: 'csv',
        mode: 'write',
        file: testFile,
        config: {
          flattenNestedObjects: true,
        },
      };
      const writer = new CsvWriter<UserWithNull>(options);
      const data: UserWithNull[] = [
        {
          id: 1,
          profile: { name: 'John', middleName: null, age: 30 },
        },
      ];

      // Act
      const result = writer.writeSync(data);

      // Assert
      expect(result.success).toBe(true);
      const content = fs.readFileSync(testFile, 'utf-8');
      const lines = content.split('\n').filter((line) => line.length > 0);

      expect(lines[0]).toBe('id,profile_name,profile_middleName,profile_age');
      expect(lines[1]).toBe('1,John,,30');
    });

    it('should handle deeply nested objects', () => {
      // Arrange
      interface DeeplyNested extends Record<string, unknown> {
        id: number;
        user: {
          info: {
            name: string;
            contact: {
              email: string;
            };
          };
        };
      }

      const options: WriterOptions<DeeplyNested> = {
        type: 'csv',
        mode: 'write',
        file: testFile,
        config: {
          flattenNestedObjects: true,
        },
      };
      const writer = new CsvWriter<DeeplyNested>(options);
      const data: DeeplyNested[] = [
        {
          id: 1,
          user: {
            info: {
              name: 'John',
              contact: {
                email: 'john@example.com',
              },
            },
          },
        },
      ];

      // Act
      const result = writer.writeSync(data);

      // Assert
      expect(result.success).toBe(true);
      const content = fs.readFileSync(testFile, 'utf-8');
      const lines = content.split('\n').filter((line) => line.length > 0);

      expect(lines[0]).toBe('id,user_info_name,user_info_contact_email');
      expect(lines[1]).toBe('1,John,john@example.com');
    });

    it('should not flatten when option is false', () => {
      // Arrange
      const options: WriterOptions<NestedUser> = {
        type: 'csv',
        mode: 'write',
        file: testFile,
        config: {
          flattenNestedObjects: false,
        },
      };
      const writer = new CsvWriter<NestedUser>(options);
      const data: NestedUser[] = [
        {
          id: 1,
          name: 'John Doe',
          address: { street: '123 Main St', city: 'NYC', zip: '10001' },
          contact: { email: 'john@example.com', phone: '555-1234' },
        },
      ];

      // Act
      const result = writer.writeSync(data);

      // Assert
      expect(result.success).toBe(true);
      const content = fs.readFileSync(testFile, 'utf-8');
      const lines = content.split('\n').filter((line) => line.length > 0);

      // Without flattening, nested objects are JSON stringified
      expect(lines[0]).toBe('id,name,address,contact');
      expect(lines[1]).toContain('1,John Doe');
    });
  });

  // Cleanup temp directory after all tests
  afterAll(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });
});
