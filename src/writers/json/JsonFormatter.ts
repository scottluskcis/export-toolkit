import { JsonFormattingError } from '../../errors.js';

/**
 * Handles JSON formatting logic - converting data to properly formatted JSON strings.
 *
 * Provides control over formatting options like pretty-printing and indentation,
 * following the Single Responsibility Principle by focusing solely on formatting.
 *
 * @example
 * ```typescript
 * const formatter = new JsonFormatter({ prettyPrint: true, indent: 2 });
 * const json = formatter.format([{ id: 1, name: 'Alice' }]);
 * ```
 */
export class JsonFormatter {
  private readonly prettyPrint: boolean;
  private readonly indent: number;

  /**
   * Creates a new JSON formatter instance.
   *
   * @param prettyPrint - Whether to format JSON with indentation and newlines (default: true)
   * @param indent - Number of spaces for indentation when prettyPrint is true (default: 2)
   */
  constructor(prettyPrint: boolean = true, indent: number = 2) {
    this.prettyPrint = prettyPrint;
    this.indent = indent;
  }

  /**
   * Formats data as a JSON string.
   *
   * In write mode, formats the data as a complete JSON array.
   * In append mode, formats individual items without array brackets.
   *
   * @param data - Data to format as JSON
   * @param isArrayContext - If true, format as complete array; if false, format as individual items
   * @returns Formatted JSON string
   * @throws {JsonFormattingError} If data cannot be serialized to JSON
   */
  format<T>(data: T[], isArrayContext: boolean = true): string {
    try {
      if (isArrayContext) {
        // Format as complete JSON array
        return this.prettyPrint ? JSON.stringify(data, null, this.indent) : JSON.stringify(data);
      } else {
        // Format individual items for appending
        // Each item on its own line, no outer array brackets
        return data
          .map((item) =>
            this.prettyPrint ? JSON.stringify(item, null, this.indent) : JSON.stringify(item)
          )
          .join('\n');
      }
    } catch (error) {
      throw new JsonFormattingError(
        `Failed to format data as JSON: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Formats a single data item as JSON.
   *
   * @param data - Single data item to format
   * @returns Formatted JSON string
   * @throws {JsonFormattingError} If data cannot be serialized to JSON
   */
  formatItem<T>(data: T): string {
    try {
      return this.prettyPrint ? JSON.stringify(data, null, this.indent) : JSON.stringify(data);
    } catch (error) {
      throw new JsonFormattingError(
        `Failed to format data as JSON: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
