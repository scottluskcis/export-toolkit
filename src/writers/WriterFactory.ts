import type { OutportWriter, WriterConfig, FileWriter } from '../types';
import { CsvWriter } from './csv/CsvWriter';
import { JsonWriter } from './json/JsonWriter';
import { ValidationError } from '../errors';

/**
 * Factory for creating data writer instances.
 *
 * Provides a centralized way to instantiate writers based on configuration,
 * making it easy to switch between different output formats.
 *
 * @example
 * ```typescript
 * const writer = WriterFactory.create<User>({
 *   type: 'csv',
 *   mode: 'write',
 *   file: './output.csv',
 *   csvConfig: { delimiter: '\t' }
 * });
 * ```
 */
export class WriterFactory {
  /**
   * Creates a writer instance based on the provided configuration.
   *
   * @template T - The type of data objects being written
   * @param config - Writer configuration including type and options
   * @param fileWriter - Optional custom file writer for dependency injection
   * @returns A writer instance matching the specified type
   *
   * @throws {ValidationError} If an unsupported writer type is specified
   *
   * @example
   * ```typescript
   * const csvWriter = WriterFactory.create<User>({
   *   type: 'csv',
   *   mode: 'write',
   *   file: './users.csv'
   * });
   * ```
   */
  static create<T extends Record<string, unknown>>(
    config: WriterConfig<T>,
    fileWriter?: FileWriter
  ): OutportWriter<T> {
    switch (config.type) {
      case 'csv':
        return new CsvWriter<T>(config, fileWriter);
      case 'json':
        return new JsonWriter<T>(config, fileWriter);
      default: {
        // Exhaustive check - this should never be reached
        const _exhaustive: never = config.type;
        throw new ValidationError(`Unknown writer type: ${String(_exhaustive)}`);
      }
    }
  }
}
