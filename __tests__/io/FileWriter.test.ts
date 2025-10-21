import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { NodeFileWriter } from '../../src/io/FileWriter';

describe('NodeFileWriter', () => {
  const testDir = path.join(process.cwd(), '__tests__', 'temp', 'file-writer');
  let testFile: string;
  let fileWriter: NodeFileWriter;

  beforeEach(() => {
    // Create test directory
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    // Create unique test file for each test
    testFile = path.join(testDir, `test-${Date.now()}-${Math.random()}.txt`);
    fileWriter = new NodeFileWriter();
  });

  afterEach(() => {
    // Clean up test files
    if (fs.existsSync(testFile)) {
      fs.unlinkSync(testFile);
    }
  });

  describe('writeSync', () => {
    it('should write content to a new file successfully', () => {
      // Arrange
      const content = 'Hello, World!';

      // Act
      const result = fileWriter.writeSync(testFile, content);

      // Assert
      expect(result.success).toBe(true);
      expect(fs.existsSync(testFile)).toBe(true);
      expect(fs.readFileSync(testFile, 'utf-8')).toBe(content);
    });

    it('should overwrite existing file content', () => {
      // Arrange
      fs.writeFileSync(testFile, 'Old content');
      const newContent = 'New content';

      // Act
      const result = fileWriter.writeSync(testFile, newContent);

      // Assert
      expect(result.success).toBe(true);
      expect(fs.readFileSync(testFile, 'utf-8')).toBe(newContent);
    });

    it('should return error result for invalid path', () => {
      // Arrange
      const invalidPath = '/invalid/path/that/does/not/exist/file.txt';

      // Act
      const result = fileWriter.writeSync(invalidPath, 'content');

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('Failed to write file');
      }
    });
  });

  describe('write (async)', () => {
    it('should write content to a new file successfully', async () => {
      // Arrange
      const content = 'Hello, Async World!';

      // Act
      const result = await fileWriter.write(testFile, content);

      // Assert
      expect(result.success).toBe(true);
      expect(fs.existsSync(testFile)).toBe(true);
      expect(fs.readFileSync(testFile, 'utf-8')).toBe(content);
    });

    it('should overwrite existing file content', async () => {
      // Arrange
      fs.writeFileSync(testFile, 'Old content');
      const newContent = 'New async content';

      // Act
      const result = await fileWriter.write(testFile, newContent);

      // Assert
      expect(result.success).toBe(true);
      expect(fs.readFileSync(testFile, 'utf-8')).toBe(newContent);
    });

    it('should return error result for invalid path', async () => {
      // Arrange
      const invalidPath = '/invalid/path/that/does/not/exist/file.txt';

      // Act
      const result = await fileWriter.write(invalidPath, 'content');

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('Failed to write file');
      }
    });
  });

  describe('appendSync', () => {
    it('should append content to existing file', () => {
      // Arrange
      const initialContent = 'Line 1\n';
      const appendContent = 'Line 2\n';
      fs.writeFileSync(testFile, initialContent);

      // Act
      const result = fileWriter.appendSync(testFile, appendContent);

      // Assert
      expect(result.success).toBe(true);
      expect(fs.readFileSync(testFile, 'utf-8')).toBe(initialContent + appendContent);
    });

    it('should create file if it does not exist', () => {
      // Arrange
      const content = 'New file content\n';

      // Act
      const result = fileWriter.appendSync(testFile, content);

      // Assert
      expect(result.success).toBe(true);
      expect(fs.existsSync(testFile)).toBe(true);
      expect(fs.readFileSync(testFile, 'utf-8')).toBe(content);
    });

    it('should return error result for invalid path', () => {
      // Arrange
      const invalidPath = '/invalid/path/that/does/not/exist/file.txt';

      // Act
      const result = fileWriter.appendSync(invalidPath, 'content');

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('Failed to append to file');
      }
    });
  });

  describe('append (async)', () => {
    it('should append content to existing file', async () => {
      // Arrange
      const initialContent = 'Line 1\n';
      const appendContent = 'Line 2\n';
      fs.writeFileSync(testFile, initialContent);

      // Act
      const result = await fileWriter.append(testFile, appendContent);

      // Assert
      expect(result.success).toBe(true);
      expect(fs.readFileSync(testFile, 'utf-8')).toBe(initialContent + appendContent);
    });

    it('should create file if it does not exist', async () => {
      // Arrange
      const content = 'New async file content\n';

      // Act
      const result = await fileWriter.append(testFile, content);

      // Assert
      expect(result.success).toBe(true);
      expect(fs.existsSync(testFile)).toBe(true);
      expect(fs.readFileSync(testFile, 'utf-8')).toBe(content);
    });

    it('should return error result for invalid path', async () => {
      // Arrange
      const invalidPath = '/invalid/path/that/does/not/exist/file.txt';

      // Act
      const result = await fileWriter.append(invalidPath, 'content');

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('Failed to append to file');
      }
    });
  });

  describe('existsSync', () => {
    it('should return true for existing file', () => {
      // Arrange
      fs.writeFileSync(testFile, 'content');

      // Act
      const result = fileWriter.existsSync(testFile);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for non-existing file', () => {
      // Act
      const result = fileWriter.existsSync(testFile);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('exists (async)', () => {
    it('should return true for existing file', async () => {
      // Arrange
      fs.writeFileSync(testFile, 'content');

      // Act
      const result = await fileWriter.exists(testFile);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for non-existing file', async () => {
      // Act
      const result = await fileWriter.exists(testFile);

      // Assert
      expect(result).toBe(false);
    });
  });

  // Cleanup temp directory after all tests
  afterAll(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });
});
