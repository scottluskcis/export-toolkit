// Export types
export type {
  OutportWriter,
  WriterOptions,
  WriterConfig,
  WriterType,
  WriterMode,
  CsvConfig,
  JsonConfig,
  Result,
  FileWriter,
} from './types';

// Export errors
export {
  OutportError,
  ValidationError,
  CsvFormattingError,
  JsonFormattingError,
  FileWriteError,
  HeaderInitializationError,
} from './errors';

// Export writers
export { CsvWriter } from './writers/csv/CsvWriter';
export { JsonWriter } from './writers/json/JsonWriter';
export { WriterFactory } from './writers/WriterFactory';

// Export file writer implementation
export { NodeFileWriter } from './io/FileWriter';

// Export builder API
export { OutportBuilder } from './builder';
export type {
  BeforeWriteHook,
  AfterWriteHook,
  ProgressHook,
  ErrorHook,
  CompleteHook,
  LifecycleHooks,
} from './builder';

// Export convenience functions
export { outport } from './convenience';

// Export streaming utilities
export { StreamingWriter, BatchProcessor } from './streaming';
export type { StreamingOptions } from './streaming';
