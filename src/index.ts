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
} from './types.js';

// Export errors
export {
  OutportError,
  ValidationError,
  CsvFormattingError,
  JsonFormattingError,
  FileWriteError,
  HeaderInitializationError,
} from './errors.js';

// Export writers
export { CsvWriter } from './writers/csv/CsvWriter.js';
export { JsonWriter } from './writers/json/JsonWriter.js';
export { WriterFactory } from './writers/WriterFactory.js';

// Export file writer implementation
export { NodeFileWriter } from './io/FileWriter.js';

// Export builder API
export { OutportBuilder } from './builder/index.js';
export type {
  BeforeWriteHook,
  AfterWriteHook,
  ProgressHook,
  ErrorHook,
  CompleteHook,
  LifecycleHooks,
} from './builder/index.js';

// Export convenience functions
export { outport } from './convenience/index.js';

// Export streaming utilities
export { StreamingWriter, BatchProcessor } from './streaming/index.js';
export type { StreamingOptions } from './streaming/index.js';
