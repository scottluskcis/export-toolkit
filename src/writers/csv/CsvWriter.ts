import type { OutportWriter, WriterOptions, Result, FileWriter } from '../../types';
import { ValidationError, CsvFormattingError } from '../../errors';
import { NodeFileWriter } from '../../io/FileWriter';
import { CsvFormatter } from './CsvFormatter';
import { CsvHeaderManager } from './CsvHeaderManager';

/**
 * CSV writer implementation that delegates to specialized helper classes
 */
export class CsvWriter<T extends Record<string, unknown>> implements OutportWriter<T> {
  private readonly formatter: CsvFormatter;
  private readonly headerManager: CsvHeaderManager<T>;
  private readonly fileWriter: FileWriter;
  private readonly includeUtf8Bom: boolean;

  constructor(
    private readonly options: WriterOptions<T>,
    fileWriter: FileWriter = new NodeFileWriter()
  ) {
    this.validate(options);
    this.fileWriter = fileWriter;

    // Initialize formatter with config
    const delimiter = options.csvConfig?.delimiter ?? ',';
    const quote = options.csvConfig?.quote ?? '"';
    this.formatter = new CsvFormatter(delimiter, quote);

    // Initialize header manager
    this.headerManager = new CsvHeaderManager<T>(options.csvConfig);

    this.includeUtf8Bom = options.csvConfig?.includeUtf8Bom ?? false;
  }

  /**
   * Validates writer options
   */
  private validate(options: WriterOptions<T>): void {
    if (options.type !== 'csv') {
      throw new ValidationError('Invalid writer type for CsvWriter');
    }

    if (options.file == null || options.file.length === 0) {
      throw new ValidationError('File path must be provided for CsvWriter');
    }

    if (!options.file.endsWith('.csv')) {
      throw new ValidationError('File extension must be .csv for CsvWriter');
    }

    const delimiter = options.csvConfig?.delimiter ?? ',';
    if (delimiter.length !== 1) {
      throw new ValidationError('Delimiter must be a single character');
    }

    const quote = options.csvConfig?.quote ?? '"';
    if (quote.length !== 1) {
      throw new ValidationError('Quote character must be a single character');
    }
  }

  /**
   * Writes headers to file (sync)
   */
  private writeHeadersSync(): Result<void> {
    const headerLine = this.formatter.formatRow(this.headerManager.getHeaders());
    const content = this.includeUtf8Bom ? '\uFEFF' + headerLine + '\n' : headerLine + '\n';

    if (this.options.mode === 'write') {
      return this.fileWriter.writeSync(this.options.file, content);
    } else if (this.options.mode === 'append') {
      if (!this.fileWriter.existsSync(this.options.file)) {
        return this.fileWriter.writeSync(this.options.file, content);
      }
    }

    return { success: true, value: undefined };
  }

  /**
   * Writes headers to file (async)
   */
  private async writeHeaders(): Promise<Result<void>> {
    const headerLine = this.formatter.formatRow(this.headerManager.getHeaders());
    const content = this.includeUtf8Bom ? '\uFEFF' + headerLine + '\n' : headerLine + '\n';

    if (this.options.mode === 'write') {
      return await this.fileWriter.write(this.options.file, content);
    } else if (this.options.mode === 'append') {
      const exists = await this.fileWriter.exists(this.options.file);
      if (!exists) {
        return await this.fileWriter.write(this.options.file, content);
      }
    }

    return { success: true, value: undefined };
  }

  /**
   * Formats and writes data rows (sync)
   */
  private writeRowsSync(data: T[]): Result<void> {
    try {
      const lines = data
        .map((obj) => this.headerManager.objectToValues(obj))
        .map((values) => this.formatter.formatRow(values))
        .join('\n');

      return this.fileWriter.appendSync(this.options.file, lines + '\n');
    } catch (error) {
      return {
        success: false,
        error: new CsvFormattingError(error instanceof Error ? error.message : String(error)),
      };
    }
  }

  /**
   * Formats and writes data rows (async)
   */
  private async writeRows(data: T[]): Promise<Result<void>> {
    try {
      const lines = data
        .map((obj) => this.headerManager.objectToValues(obj))
        .map((values) => this.formatter.formatRow(values))
        .join('\n');

      return await this.fileWriter.append(this.options.file, lines + '\n');
    } catch (error) {
      return {
        success: false,
        error: new CsvFormattingError(error instanceof Error ? error.message : String(error)),
      };
    }
  }

  // ==================== PUBLIC API ====================

  /**
   * Writes multiple rows of data to file (sync)
   */
  writeSync(data: T[]): Result<void> {
    if (data.length === 0) {
      return {
        success: false,
        error: new ValidationError('Cannot write empty data array'),
      };
    }

    // Initialize headers if needed
    if (!this.headerManager.isInitialized()) {
      const initResult = this.headerManager.initialize(data[0]!);
      if (!initResult.success) {
        return initResult;
      }

      const writeResult = this.writeHeadersSync();
      if (!writeResult.success) {
        return writeResult;
      }
    }

    return this.writeRowsSync(data);
  }

  /**
   * Writes multiple rows of data to file (async)
   */
  async write(data: T[]): Promise<Result<void>> {
    if (data.length === 0) {
      return {
        success: false,
        error: new ValidationError('Cannot write empty data array'),
      };
    }

    // Initialize headers if needed
    if (!this.headerManager.isInitialized()) {
      const initResult = this.headerManager.initialize(data[0]!);
      if (!initResult.success) {
        return initResult;
      }

      const writeResult = await this.writeHeaders();
      if (!writeResult.success) {
        return writeResult;
      }
    }

    return await this.writeRows(data);
  }

  /**
   * Appends single or multiple rows to the file (sync)
   */
  appendSync(data: T | T[]): Result<void> {
    const dataArray = Array.isArray(data) ? data : [data];

    if (dataArray.length === 0) {
      return { success: true, value: undefined };
    }

    // Initialize headers if needed
    if (!this.headerManager.isInitialized()) {
      const initResult = this.headerManager.initialize(dataArray[0]!);
      if (!initResult.success) {
        return initResult;
      }

      const writeResult = this.writeHeadersSync();
      if (!writeResult.success) {
        return writeResult;
      }
    }

    return this.writeRowsSync(dataArray);
  }

  /**
   * Appends single or multiple rows to the file (async)
   */
  async append(data: T | T[]): Promise<Result<void>> {
    const dataArray = Array.isArray(data) ? data : [data];

    if (dataArray.length === 0) {
      return { success: true, value: undefined };
    }

    // Initialize headers if needed
    if (!this.headerManager.isInitialized()) {
      const initResult = this.headerManager.initialize(dataArray[0]!);
      if (!initResult.success) {
        return initResult;
      }

      const writeResult = await this.writeHeaders();
      if (!writeResult.success) {
        return writeResult;
      }
    }

    return await this.writeRows(dataArray);
  }
}
