import { describe, it, expect } from 'vitest';
import { flattenObject } from '../../../src/writers/csv/flattenObject.js';

describe('flattenObject', () => {
  describe('simple objects', () => {
    it('should return the same object for flat structure', () => {
      // Arrange
      const input = {
        id: 1,
        name: 'John',
        age: 30,
      };

      // Act
      const result = flattenObject(input);

      // Assert
      expect(result).toEqual({
        id: 1,
        name: 'John',
        age: 30,
      });
    });

    it('should handle boolean values', () => {
      // Arrange
      const input = {
        isActive: true,
        isAdmin: false,
      };

      // Act
      const result = flattenObject(input);

      // Assert
      expect(result).toEqual({
        isActive: true,
        isAdmin: false,
      });
    });

    it('should handle null values', () => {
      // Arrange
      const input = {
        name: 'John',
        middleName: null,
        age: 30,
      };

      // Act
      const result = flattenObject(input);

      // Assert
      expect(result).toEqual({
        name: 'John',
        middleName: null,
        age: 30,
      });
    });

    it('should handle undefined values', () => {
      // Arrange
      const input = {
        name: 'John',
        middleName: undefined,
        age: 30,
      };

      // Act
      const result = flattenObject(input);

      // Assert
      expect(result).toEqual({
        name: 'John',
        middleName: null,
        age: 30,
      });
    });
  });

  describe('nested objects', () => {
    it('should flatten single level nested object', () => {
      // Arrange
      const input = {
        id: 1,
        user: {
          name: 'John',
          email: 'john@example.com',
        },
      };

      // Act
      const result = flattenObject(input);

      // Assert
      expect(result).toEqual({
        id: 1,
        user_name: 'John',
        user_email: 'john@example.com',
      });
    });

    it('should flatten deeply nested objects', () => {
      // Arrange
      const input = {
        id: 1,
        user: {
          name: 'John',
          address: {
            street: '123 Main St',
            city: 'NYC',
            location: {
              lat: 40.7128,
              lng: -74.006,
            },
          },
        },
      };

      // Act
      const result = flattenObject(input);

      // Assert
      expect(result).toEqual({
        id: 1,
        user_name: 'John',
        user_address_street: '123 Main St',
        user_address_city: 'NYC',
        user_address_location_lat: 40.7128,
        user_address_location_lng: -74.006,
      });
    });

    it('should handle multiple nested objects at same level', () => {
      // Arrange
      const input = {
        id: 1,
        user: {
          name: 'John',
          age: 30,
        },
        company: {
          name: 'Acme Inc',
          industry: 'Tech',
        },
      };

      // Act
      const result = flattenObject(input);

      // Assert
      expect(result).toEqual({
        id: 1,
        user_name: 'John',
        user_age: 30,
        company_name: 'Acme Inc',
        company_industry: 'Tech',
      });
    });

    it('should handle nested objects with null values', () => {
      // Arrange
      const input = {
        id: 1,
        user: {
          name: 'John',
          middleName: null,
          age: 30,
        },
      };

      // Act
      const result = flattenObject(input);

      // Assert
      expect(result).toEqual({
        id: 1,
        user_name: 'John',
        user_middleName: null,
        user_age: 30,
      });
    });
  });

  describe('arrays', () => {
    it('should convert arrays to JSON strings', () => {
      // Arrange
      const input = {
        id: 1,
        tags: ['javascript', 'typescript', 'nodejs'],
      };

      // Act
      const result = flattenObject(input);

      // Assert
      expect(result).toEqual({
        id: 1,
        tags: '["javascript","typescript","nodejs"]',
      });
    });

    it('should handle empty arrays', () => {
      // Arrange
      const input = {
        id: 1,
        tags: [],
      };

      // Act
      const result = flattenObject(input);

      // Assert
      expect(result).toEqual({
        id: 1,
        tags: '[]',
      });
    });

    it('should handle arrays of objects', () => {
      // Arrange
      const input = {
        id: 1,
        users: [
          { name: 'John', age: 30 },
          { name: 'Jane', age: 25 },
        ],
      };

      // Act
      const result = flattenObject(input);

      // Assert
      expect(result).toEqual({
        id: 1,
        users: '[{"name":"John","age":30},{"name":"Jane","age":25}]',
      });
    });

    it('should handle arrays inside nested objects', () => {
      // Arrange
      const input = {
        id: 1,
        user: {
          name: 'John',
          tags: ['tag1', 'tag2'],
        },
      };

      // Act
      const result = flattenObject(input);

      // Assert
      expect(result).toEqual({
        id: 1,
        user_name: 'John',
        user_tags: '["tag1","tag2"]',
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty object', () => {
      // Arrange
      const input = {};

      // Act
      const result = flattenObject(input);

      // Assert
      expect(result).toEqual({});
    });

    it('should handle object with only nested empty object', () => {
      // Arrange
      const input = {
        nested: {},
      };

      // Act
      const result = flattenObject(input);

      // Assert
      expect(result).toEqual({});
    });

    it('should use prefix parameter when provided', () => {
      // Arrange
      const input = {
        name: 'John',
        age: 30,
      };

      // Act
      const result = flattenObject(input, 'user');

      // Assert
      expect(result).toEqual({
        user_name: 'John',
        user_age: 30,
      });
    });

    it('should handle mixed primitive and nested types', () => {
      // Arrange
      const input = {
        id: 1,
        name: 'John',
        active: true,
        score: 98.5,
        metadata: {
          created: '2023-01-01',
          tags: ['a', 'b'],
        },
        notes: null,
      };

      // Act
      const result = flattenObject(input);

      // Assert
      expect(result).toEqual({
        id: 1,
        name: 'John',
        active: true,
        score: 98.5,
        metadata_created: '2023-01-01',
        metadata_tags: '["a","b"]',
        notes: null,
      });
    });
  });
});
