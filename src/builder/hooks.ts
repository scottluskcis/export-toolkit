import type { Result } from '../types';

/**
 * Hook called before data is written.
 * Can transform the data before writing.
 *
 * @template T - The type of data being written
 * @param data - The data about to be written
 * @returns The potentially transformed data to write
 */
export type BeforeWriteHook<T extends Record<string, unknown>> = (data: T[]) => T[] | Promise<T[]>;

/**
 * Hook called after data is successfully written.
 *
 * @template T - The type of data being written
 * @param data - The data that was written
 * @param recordCount - The number of records written
 */
export type AfterWriteHook<T extends Record<string, unknown>> = (
  data: T[],
  recordCount: number
) => void | Promise<void>;

/**
 * Hook called to report progress during write operations.
 *
 * @param current - Current number of records processed
 * @param total - Total number of records to process (may be undefined for streaming)
 */
export type ProgressHook = (current: number, total?: number) => void | Promise<void>;

/**
 * Hook called when an error occurs during write operations.
 *
 * @param error - The error that occurred
 * @returns Whether to continue processing (true) or stop (false)
 */
export type ErrorHook = (error: Error) => boolean | Promise<boolean>;

/**
 * Hook called when all write operations are complete.
 *
 * @param result - The final result of the write operation
 * @param totalRecords - Total number of records processed
 */
export type CompleteHook = (result: Result<void>, totalRecords: number) => void | Promise<void>;

/**
 * Container for all lifecycle hooks.
 *
 * @template T - The type of data being written
 */
export interface LifecycleHooks<T extends Record<string, unknown>> {
  beforeWrite?: BeforeWriteHook<T>;
  afterWrite?: AfterWriteHook<T>;
  onProgress?: ProgressHook;
  onError?: ErrorHook;
  onComplete?: CompleteHook;
}
