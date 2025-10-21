import { describe, it, expect } from 'vitest';
import { JsonFormatter } from '../../../src/writers/json/JsonFormatter';
import { JsonFormattingError } from '../../../src/errors';

interface TestData extends Record<string, unknown> {
  id: number;
  name: string;
}

describe('JsonFormatter', () => {
  describe('constructor', () => {
    it('should create formatter with default options', () => {
      // Arrange & Act
      const formatter = new JsonFormatter();

      // Assert
      expect(formatter).toBeInstanceOf(JsonFormatter);
    });

    it('should create formatter with custom options', () => {
      // Arrange & Act
      const formatter = new JsonFormatter(false, 4);

      // Assert
      expect(formatter).toBeInstanceOf(JsonFormatter);
    });
  });

  describe('format', () => {
    describe('array context (isArrayContext = true)', () => {
      it('should format data as pretty-printed JSON array by default', () => {
        // Arrange
        const formatter = new JsonFormatter();
        const data: TestData[] = [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' },
        ];

        // Act
        const result = formatter.format(data, true);

        // Assert
        expect(result).toBe(JSON.stringify(data, null, 2));
        expect(result).toContain('[\n');
        expect(result).toContain('  {\n');
        expect(result).toContain('    "id": 1');
      });

      it('should format data as compact JSON array when prettyPrint is false', () => {
        // Arrange
        const formatter = new JsonFormatter(false);
        const data: TestData[] = [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' },
        ];

        // Act
        const result = formatter.format(data, true);

        // Assert
        expect(result).toBe(JSON.stringify(data));
        expect(result).not.toContain('\n');
        expect(result).toBe('[{"id":1,"name":"Alice"},{"id":2,"name":"Bob"}]');
      });

      it('should format data with custom indentation', () => {
        // Arrange
        const formatter = new JsonFormatter(true, 4);
        const data: TestData[] = [{ id: 1, name: 'Alice' }];

        // Act
        const result = formatter.format(data, true);

        // Assert
        expect(result).toBe(JSON.stringify(data, null, 4));
        expect(result).toContain('    {\n');
        expect(result).toContain('        "id": 1');
      });

      it('should format empty array', () => {
        // Arrange
        const formatter = new JsonFormatter();
        const data: TestData[] = [];

        // Act
        const result = formatter.format(data, true);

        // Assert
        expect(result).toBe('[]');
      });

      it('should format array with complex nested objects', () => {
        // Arrange
        const formatter = new JsonFormatter();
        interface ComplexData extends Record<string, unknown> {
          id: number;
          metadata: { tags: string[]; count: number };
        }
        const data: ComplexData[] = [
          {
            id: 1,
            metadata: {
              tags: ['tag1', 'tag2'],
              count: 5,
            },
          },
        ];

        // Act
        const result = formatter.format(data, true);

        // Assert
        expect(result).toContain('"tags": [');
        expect(result).toContain('"tag1"');
        expect(result).toContain('"count": 5');
      });
    });

    describe('non-array context (isArrayContext = false)', () => {
      it('should format items without array brackets', () => {
        // Arrange
        const formatter = new JsonFormatter();
        const data: TestData[] = [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' },
        ];

        // Act
        const result = formatter.format(data, false);

        // Assert
        expect(result).not.toContain('[');
        expect(result).toContain('{\n  "id": 1');
        expect(result).toContain('{\n  "id": 2');
        expect(result.split('\n{\n').length).toBe(2); // Two separate objects
      });

      it('should format items without array brackets in compact mode', () => {
        // Arrange
        const formatter = new JsonFormatter(false);
        const data: TestData[] = [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' },
        ];

        // Act
        const result = formatter.format(data, false);

        // Assert
        expect(result).not.toContain('[');
        expect(result).toBe('{"id":1,"name":"Alice"}\n{"id":2,"name":"Bob"}');
      });
    });

    describe('error handling', () => {
      it('should throw JsonFormattingError for circular references', () => {
        // Arrange
        const formatter = new JsonFormatter();
        interface CircularData extends Record<string, unknown> {
          id: number;
          self?: CircularData;
        }
        const circular: CircularData = { id: 1 };
        circular.self = circular;

        // Act & Assert
        expect(() => formatter.format([circular], true)).toThrow(JsonFormattingError);
        expect(() => formatter.format([circular], true)).toThrow(/Failed to format data as JSON/);
      });
    });

    describe('special values', () => {
      it('should handle null values', () => {
        // Arrange
        const formatter = new JsonFormatter();
        interface NullableData extends Record<string, unknown> {
          id: number;
          name: string | null;
        }
        const data: NullableData[] = [{ id: 1, name: null }];

        // Act
        const result = formatter.format(data, true);

        // Assert
        expect(result).toContain('"name": null');
      });

      it('should handle undefined values (converted to null by JSON.stringify)', () => {
        // Arrange
        const formatter = new JsonFormatter();
        interface UndefinedData extends Record<string, unknown> {
          id: number;
          name?: string;
        }
        const data: UndefinedData[] = [{ id: 1 }];

        // Act
        const result = formatter.format(data, true);

        // Assert
        // undefined values are omitted by JSON.stringify
        expect(result).not.toContain('name');
        expect(result).toContain('"id": 1');
      });

      it('should handle boolean values', () => {
        // Arrange
        const formatter = new JsonFormatter();
        interface BooleanData extends Record<string, unknown> {
          id: number;
          active: boolean;
        }
        const data: BooleanData[] = [
          { id: 1, active: true },
          { id: 2, active: false },
        ];

        // Act
        const result = formatter.format(data, true);

        // Assert
        expect(result).toContain('"active": true');
        expect(result).toContain('"active": false');
      });

      it('should handle number values including zero and negative', () => {
        // Arrange
        const formatter = new JsonFormatter();
        interface NumberData extends Record<string, unknown> {
          id: number;
          value: number;
        }
        const data: NumberData[] = [
          { id: 1, value: 0 },
          { id: 2, value: -42 },
          { id: 3, value: 3.14 },
        ];

        // Act
        const result = formatter.format(data, true);

        // Assert
        expect(result).toContain('"value": 0');
        expect(result).toContain('"value": -42');
        expect(result).toContain('"value": 3.14');
      });
    });
  });

  describe('formatItem', () => {
    it('should format single item as pretty-printed JSON', () => {
      // Arrange
      const formatter = new JsonFormatter();
      const data: TestData = { id: 1, name: 'Alice' };

      // Act
      const result = formatter.formatItem(data);

      // Assert
      expect(result).toBe(JSON.stringify(data, null, 2));
      expect(result).toContain('{\n');
      expect(result).toContain('  "id": 1');
    });

    it('should format single item as compact JSON when prettyPrint is false', () => {
      // Arrange
      const formatter = new JsonFormatter(false);
      const data: TestData = { id: 1, name: 'Alice' };

      // Act
      const result = formatter.formatItem(data);

      // Assert
      expect(result).toBe(JSON.stringify(data));
      expect(result).toBe('{"id":1,"name":"Alice"}');
    });

    it('should format single item with custom indentation', () => {
      // Arrange
      const formatter = new JsonFormatter(true, 4);
      const data: TestData = { id: 1, name: 'Alice' };

      // Act
      const result = formatter.formatItem(data);

      // Assert
      expect(result).toBe(JSON.stringify(data, null, 4));
      expect(result).toContain('    "id": 1');
    });

    it('should throw JsonFormattingError for circular references', () => {
      // Arrange
      const formatter = new JsonFormatter();
      interface CircularData extends Record<string, unknown> {
        id: number;
        self?: CircularData;
      }
      const circular: CircularData = { id: 1 };
      circular.self = circular;

      // Act & Assert
      expect(() => formatter.formatItem(circular)).toThrow(JsonFormattingError);
      expect(() => formatter.formatItem(circular)).toThrow(/Failed to format data as JSON/);
    });
  });
});
