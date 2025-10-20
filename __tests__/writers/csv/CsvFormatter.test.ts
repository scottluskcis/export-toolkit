import { describe, it, expect } from 'vitest';
import { CsvFormatter } from '../../../src/writers/csv/CsvFormatter';

describe('CsvFormatter', () => {
  describe('with default delimiter and quote', () => {
    it('should format simple values', () => {
      // Arrange
      const formatter = new CsvFormatter();
      const values = ['John', 'Doe', 30, true];

      // Act
      const result = formatter.formatRow(values);

      // Assert
      expect(result).toBe('John,Doe,30,true');
    });

    it('should handle null and undefined values', () => {
      // Arrange
      const formatter = new CsvFormatter();
      const values = ['John', null, undefined, 30];

      // Act
      const result = formatter.formatRow(values);

      // Assert
      expect(result).toBe('John,,,30');
    });

    it('should quote values containing commas', () => {
      // Arrange
      const formatter = new CsvFormatter();
      const values = ['John Doe', 'New York, NY', 30];

      // Act
      const result = formatter.formatRow(values);

      // Assert
      expect(result).toBe('John Doe,"New York, NY",30');
    });

    it('should quote values containing newlines', () => {
      // Arrange
      const formatter = new CsvFormatter();
      const values = ['John', 'Line1\nLine2', 30];

      // Act
      const result = formatter.formatRow(values);

      // Assert
      expect(result).toBe('John,"Line1\nLine2",30');
    });

    it('should quote values containing quotes and escape them', () => {
      // Arrange
      const formatter = new CsvFormatter();
      const values = ['John', 'He said "Hello"', 30];

      // Act
      const result = formatter.formatRow(values);

      // Assert
      expect(result).toBe('John,"He said ""Hello""",30');
    });

    it('should handle multiple quotes in a value', () => {
      // Arrange
      const formatter = new CsvFormatter();
      const values = ['Test', '"Quote" and "Another"', 30];

      // Act
      const result = formatter.formatRow(values);

      // Assert
      expect(result).toBe('Test,"""Quote"" and ""Another""",30');
    });

    it('should format empty array', () => {
      // Arrange
      const formatter = new CsvFormatter();

      // Act
      const result = formatter.formatRow([]);

      // Assert
      expect(result).toBe('');
    });

    it('should handle objects by JSON stringifying them', () => {
      // Arrange
      const formatter = new CsvFormatter();
      const values = ['John', { age: 30, city: 'NYC' }, 30];

      // Act
      const result = formatter.formatRow(values);

      // Assert
      expect(result).toBe('John,"{""age"":30,""city"":""NYC""}",30');
    });

    it('should handle arrays by JSON stringifying them', () => {
      // Arrange
      const formatter = new CsvFormatter();
      const values = ['John', [1, 2, 3], 30];

      // Act
      const result = formatter.formatRow(values);

      // Assert
      expect(result).toBe('John,"[1,2,3]",30');
    });
  });

  describe('with custom delimiter', () => {
    it('should use custom delimiter', () => {
      // Arrange
      const formatter = new CsvFormatter('\t');
      const values = ['John', 'Doe', 30];

      // Act
      const result = formatter.formatRow(values);

      // Assert
      expect(result).toBe('John\tDoe\t30');
    });

    it('should quote values containing the custom delimiter', () => {
      // Arrange
      const formatter = new CsvFormatter('\t');
      const values = ['John\tDoe', 'NYC', 30];

      // Act
      const result = formatter.formatRow(values);

      // Assert
      expect(result).toBe('"John\tDoe"\tNYC\t30');
    });

    it('should use semicolon delimiter', () => {
      // Arrange
      const formatter = new CsvFormatter(';');
      const values = ['John', 'Doe', 30];

      // Act
      const result = formatter.formatRow(values);

      // Assert
      expect(result).toBe('John;Doe;30');
    });

    it('should quote values containing semicolon when using semicolon delimiter', () => {
      // Arrange
      const formatter = new CsvFormatter(';');
      const values = ['John;Doe', 'NYC', 30];

      // Act
      const result = formatter.formatRow(values);

      // Assert
      expect(result).toBe('"John;Doe";NYC;30');
    });
  });

  describe('with custom quote character', () => {
    it('should use custom quote character', () => {
      // Arrange
      const formatter = new CsvFormatter(',', "'");
      const values = ['John', 'New York, NY', 30];

      // Act
      const result = formatter.formatRow(values);

      // Assert
      expect(result).toBe("John,'New York, NY',30");
    });

    it('should escape custom quote character', () => {
      // Arrange
      const formatter = new CsvFormatter(',', "'");
      const values = ['John', "It's great", 30];

      // Act
      const result = formatter.formatRow(values);

      // Assert
      expect(result).toBe("John,'It''s great',30");
    });
  });

  describe('edge cases', () => {
    it('should handle boolean values', () => {
      // Arrange
      const formatter = new CsvFormatter();
      const values = [true, false, true];

      // Act
      const result = formatter.formatRow(values);

      // Assert
      expect(result).toBe('true,false,true');
    });

    it('should handle numeric values including zero', () => {
      // Arrange
      const formatter = new CsvFormatter();
      const values = [0, -1, 3.14, 1000000];

      // Act
      const result = formatter.formatRow(values);

      // Assert
      expect(result).toBe('0,-1,3.14,1000000');
    });

    it('should handle empty strings', () => {
      // Arrange
      const formatter = new CsvFormatter();
      const values = ['', 'John', ''];

      // Act
      const result = formatter.formatRow(values);

      // Assert
      expect(result).toBe(',John,');
    });

    it('should handle carriage returns', () => {
      // Arrange
      const formatter = new CsvFormatter();
      const values = ['John', 'Line1\r\nLine2', 30];

      // Act
      const result = formatter.formatRow(values);

      // Assert
      expect(result).toBe('John,"Line1\r\nLine2",30');
    });
  });
});
