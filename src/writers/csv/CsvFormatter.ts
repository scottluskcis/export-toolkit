/**
 * Handles CSV formatting logic - converting values to properly escaped CSV format
 */
export class CsvFormatter {
  constructor(
    private readonly delimiter: string = ',',
    private readonly quote: string = '"'
  ) {}

  /**
   * Formats a row as CSV
   */
  formatRow(values: unknown[]): string {
    return values.map((value) => this.formatValue(value)).join(this.delimiter);
  }

  /**
   * Formats a single value with proper CSV escaping
   */
  private formatValue(value: unknown): string {
    if (value == null) {
      return '';
    }

    // Convert to string representation
    let stringValue: string;
    if (typeof value === 'string') {
      stringValue = value;
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      stringValue = String(value);
    } else {
      // For objects, arrays, and other types, use JSON serialization
      stringValue = JSON.stringify(value);
    }

    // If contains delimiter, newline, or quotes, wrap in quotes and escape existing quotes
    if (
      stringValue.includes(this.delimiter) ||
      stringValue.includes('\n') ||
      stringValue.includes('\r') ||
      stringValue.includes(this.quote)
    ) {
      const escaped = stringValue.replace(new RegExp(this.quote, 'g'), this.quote + this.quote);
      return `${this.quote}${escaped}${this.quote}`;
    }

    return stringValue;
  }
}
