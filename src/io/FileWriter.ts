import * as fs from 'node:fs';
import * as fsPromises from 'node:fs/promises';
import type { FileWriter as IFileWriter, Result } from '../types.js';
import { FileWriteError } from '../errors.js';

/**
 * Default file writer implementation using Node.js fs module.
 *
 * Provides both synchronous and asynchronous file operations with
 * proper error handling using the Result type pattern.
 *
 * @example
 * ```typescript
 * const writer = new NodeFileWriter();
 *
 * // Synchronous write
 * const result = writer.writeSync('./output.txt', 'Hello, World!');
 *
 * // Asynchronous write
 * const result = await writer.write('./output.txt', 'Hello, World!');
 * ```
 */
export class NodeFileWriter implements IFileWriter {
  writeSync(path: string, content: string): Result<void> {
    try {
      fs.writeFileSync(path, content, 'utf-8');
      return { success: true, value: undefined };
    } catch (error) {
      return {
        success: false,
        error: new FileWriteError(
          `Failed to write file: ${path}`,
          error instanceof Error ? error : undefined
        ),
      };
    }
  }

  async write(path: string, content: string): Promise<Result<void>> {
    try {
      await fsPromises.writeFile(path, content, 'utf-8');
      return { success: true, value: undefined };
    } catch (error) {
      return {
        success: false,
        error: new FileWriteError(
          `Failed to write file: ${path}`,
          error instanceof Error ? error : undefined
        ),
      };
    }
  }

  appendSync(path: string, content: string): Result<void> {
    try {
      fs.appendFileSync(path, content, 'utf-8');
      return { success: true, value: undefined };
    } catch (error) {
      return {
        success: false,
        error: new FileWriteError(
          `Failed to append to file: ${path}`,
          error instanceof Error ? error : undefined
        ),
      };
    }
  }

  async append(path: string, content: string): Promise<Result<void>> {
    try {
      await fsPromises.appendFile(path, content, 'utf-8');
      return { success: true, value: undefined };
    } catch (error) {
      return {
        success: false,
        error: new FileWriteError(
          `Failed to append to file: ${path}`,
          error instanceof Error ? error : undefined
        ),
      };
    }
  }

  existsSync(path: string): boolean {
    return fs.existsSync(path);
  }

  async exists(path: string): Promise<boolean> {
    try {
      await fsPromises.access(path);
      return true;
    } catch {
      return false;
    }
  }
}
