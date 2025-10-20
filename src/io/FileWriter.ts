import * as fs from 'node:fs';
import * as fsPromises from 'node:fs/promises';
import type { FileWriter as IFileWriter, Result } from '../types';
import { FileWriteError } from '../errors';

/**
 * Default file writer implementation using Node.js fs module
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
