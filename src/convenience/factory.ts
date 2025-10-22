import { OutportBuilder } from '../builder/OutportBuilder.js';

/**
 * Creates a new fluent builder for configuring and executing data exports.
 *
 * This is the main entry point for the builder API, providing a convenient
 * and chainable interface for data export operations.
 *
 * @template T - The type of data objects being written
 * @returns A new OutportBuilder instance
 *
 * @example
 * ```typescript
 * // Simple CSV export
 * await outport<User>()
 *   .to('./users.csv')
 *   .write(users);
 *
 * // JSON with pretty printing
 * await outport<Product>()
 *   .to('./products.json')
 *   .prettyPrint()
 *   .write(products);
 *
 * // CSV with custom delimiter and progress tracking
 * await outport<Order>()
 *   .to('./orders.tsv')
 *   .withDelimiter('\t')
 *   .onProgress((current, total) => {
 *     console.log(`Progress: ${current}/${total}`);
 *   })
 *   .write(orders);
 * ```
 */
export function outport<T extends Record<string, unknown>>(): OutportBuilder<T> {
  return new OutportBuilder<T>();
}
