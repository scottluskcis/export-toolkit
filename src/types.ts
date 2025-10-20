// Result type for error handling
export type Result<T, E = Error> = { success: true; value: T } | { success: false; error: E };

// Writer interface with generics and async support
export interface OutportWriter<T = unknown> {
  writeSync(data: T[]): Result<void>;
  write(data: T[]): Promise<Result<void>>;

  appendSync(data: T | T[]): Result<void>;
  append(data: T | T[]): Promise<Result<void>>;
}

export type WriterType = 'csv' | 'json';
export type WriterMode = 'write' | 'append';

// CSV-specific configuration
export interface CsvConfig<T> {
  // Delimiter character (default: ',')
  delimiter?: string;

  // Quote character for escaping (default: '"')
  quote?: string;

  // Map object keys to CSV column names
  columnMapping?: Partial<Record<keyof T, string>>;

  // Or provide explicit headers in order
  headers?: string[];

  // Keys to include (in order). If not provided, uses all keys from first object
  includeKeys?: (keyof T)[];

  // Include BOM for Excel compatibility (default: false)
  includeUtf8Bom?: boolean;
}

export interface WriterOptions<T = unknown> {
  type: WriterType;
  mode: WriterMode;
  file: string;

  // CSV-specific options
  csvConfig?: CsvConfig<T>;
}

// For factory pattern
export type WriterConfig<T = unknown> = WriterOptions<T>;

// File writer abstraction for dependency injection
export interface FileWriter {
  writeSync(path: string, content: string): Result<void>;
  write(path: string, content: string): Promise<Result<void>>;

  appendSync(path: string, content: string): Result<void>;
  append(path: string, content: string): Promise<Result<void>>;

  existsSync(path: string): boolean;
  exists(path: string): Promise<boolean>;
}
