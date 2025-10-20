import type { OutportWriter, WriterConfig, FileWriter } from '../types';
import { CsvWriter } from './csv/CsvWriter';
import { ValidationError } from '../errors';

/**
 * Factory for creating writer instances
 */
export class WriterFactory {
  /**
   * Creates a writer based on the provided configuration
   */
  static create<T extends Record<string, unknown>>(
    config: WriterConfig<T>,
    fileWriter?: FileWriter
  ): OutportWriter<T> {
    switch (config.type) {
      case 'csv':
        return new CsvWriter<T>(config, fileWriter);
      case 'json':
        throw new ValidationError('JSON writer not yet implemented');
      default: {
        // Exhaustive check - this should never be reached
        const _exhaustive: never = config.type;
        throw new ValidationError(`Unknown writer type: ${String(_exhaustive)}`);
      }
    }
  }
}
