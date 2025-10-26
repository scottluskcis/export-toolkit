import { describe, it, expect } from 'vitest';
import { CsvHeaderManager } from '../../../src/writers/csv/CsvHeaderManager';
import type { CsvConfig } from '../../../src/types';

interface TestUser extends Record<string, unknown> {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
}

describe('CsvHeaderManager', () => {
  const sampleUser: TestUser = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    age: 30,
  };

  describe('initialization without config', () => {
    it('should initialize headers from object keys', () => {
      // Arrange
      const manager = new CsvHeaderManager<TestUser>();

      // Act
      const result = manager.initialize(sampleUser);

      // Assert
      expect(result.success).toBe(true);
      expect(manager.getHeaders()).toEqual(['id', 'firstName', 'lastName', 'email', 'age']);
    });

    it('should initialize keys from object keys', () => {
      // Arrange
      const manager = new CsvHeaderManager<TestUser>();

      // Act
      manager.initialize(sampleUser);

      // Assert
      expect(manager.getKeys()).toEqual(['id', 'firstName', 'lastName', 'email', 'age']);
    });

    it('should return isInitialized as true after initialization', () => {
      // Arrange
      const manager = new CsvHeaderManager<TestUser>();

      // Act
      manager.initialize(sampleUser);

      // Assert
      expect(manager.isInitialized()).toBe(true);
    });

    it('should return isInitialized as false before initialization', () => {
      // Arrange
      const manager = new CsvHeaderManager<TestUser>();

      // Assert
      expect(manager.isInitialized()).toBe(false);
    });
  });

  describe('initialization with explicit headers', () => {
    it('should use provided headers', () => {
      // Arrange
      const config: CsvConfig<TestUser> = {
        headers: ['ID', 'First Name', 'Last Name', 'Email', 'Age'],
      };
      const manager = new CsvHeaderManager<TestUser>(config);

      // Act
      const result = manager.initialize(sampleUser);

      // Assert
      expect(result.success).toBe(true);
      expect(manager.getHeaders()).toEqual(['ID', 'First Name', 'Last Name', 'Email', 'Age']);
    });

    it('should still infer keys from data object', () => {
      // Arrange
      const config: CsvConfig<TestUser> = {
        headers: ['ID', 'First Name', 'Last Name', 'Email', 'Age'],
      };
      const manager = new CsvHeaderManager<TestUser>(config);

      // Act
      manager.initialize(sampleUser);

      // Assert
      expect(manager.getKeys()).toEqual(['id', 'firstName', 'lastName', 'email', 'age']);
    });
  });

  describe('initialization with column mapping', () => {
    it('should map column names', () => {
      // Arrange
      const config: CsvConfig<TestUser> = {
        columnMapping: {
          id: 'User ID',
          firstName: 'First Name',
          lastName: 'Last Name',
          email: 'Email Address',
          age: 'Age',
        },
      };
      const manager = new CsvHeaderManager<TestUser>(config);

      // Act
      const result = manager.initialize(sampleUser);

      // Assert
      expect(result.success).toBe(true);
      expect(manager.getHeaders()).toEqual([
        'User ID',
        'First Name',
        'Last Name',
        'Email Address',
        'Age',
      ]);
    });

    it('should use key name for unmapped columns', () => {
      // Arrange
      const config: CsvConfig<TestUser> = {
        columnMapping: {
          firstName: 'First Name',
          lastName: 'Last Name',
        },
      };
      const manager = new CsvHeaderManager<TestUser>(config);

      // Act
      manager.initialize(sampleUser);

      // Assert
      expect(manager.getHeaders()).toEqual(['id', 'First Name', 'Last Name', 'email', 'age']);
    });
  });

  describe('initialization with includeKeys', () => {
    it('should only include specified keys', () => {
      // Arrange
      const config: CsvConfig<TestUser> = {
        includeKeys: ['firstName', 'lastName', 'email'],
      };
      const manager = new CsvHeaderManager<TestUser>(config);

      // Act
      const result = manager.initialize(sampleUser);

      // Assert
      expect(result.success).toBe(true);
      expect(manager.getHeaders()).toEqual(['firstName', 'lastName', 'email']);
      expect(manager.getKeys()).toEqual(['firstName', 'lastName', 'email']);
    });

    it('should work with column mapping and includeKeys together', () => {
      // Arrange
      const config: CsvConfig<TestUser> = {
        includeKeys: ['firstName', 'lastName', 'email'],
        columnMapping: {
          firstName: 'First Name',
          lastName: 'Last Name',
          email: 'Email Address',
        },
      };
      const manager = new CsvHeaderManager<TestUser>(config);

      // Act
      manager.initialize(sampleUser);

      // Assert
      expect(manager.getHeaders()).toEqual(['First Name', 'Last Name', 'Email Address']);
      expect(manager.getKeys()).toEqual(['firstName', 'lastName', 'email']);
    });
  });

  describe('objectToValues', () => {
    it('should convert object to values in correct order', () => {
      // Arrange
      const manager = new CsvHeaderManager<TestUser>();
      manager.initialize(sampleUser);

      // Act
      const values = manager.objectToValues(sampleUser);

      // Assert
      expect(values).toEqual([1, 'John', 'Doe', 'john@example.com', 30]);
    });

    it('should convert object with includeKeys to filtered values', () => {
      // Arrange
      const config: CsvConfig<TestUser> = {
        includeKeys: ['firstName', 'email'],
      };
      const manager = new CsvHeaderManager<TestUser>(config);
      manager.initialize(sampleUser);

      // Act
      const values = manager.objectToValues(sampleUser);

      // Assert
      expect(values).toEqual(['John', 'john@example.com']);
    });

    it('should throw error if not initialized', () => {
      // Arrange
      const manager = new CsvHeaderManager<TestUser>();

      // Act & Assert
      expect(() => manager.objectToValues(sampleUser)).toThrow('Keys not initialized');
    });
  });

  describe('getHeaders', () => {
    it('should throw error if not initialized', () => {
      // Arrange
      const manager = new CsvHeaderManager<TestUser>();

      // Act & Assert
      expect(() => manager.getHeaders()).toThrow('Headers not initialized');
    });
  });

  describe('getKeys', () => {
    it('should throw error if not initialized', () => {
      // Arrange
      const manager = new CsvHeaderManager<TestUser>();

      // Act & Assert
      expect(() => manager.getKeys()).toThrow('Keys not initialized');
    });
  });

  describe('multiple initialization attempts', () => {
    it('should not reinitialize headers', () => {
      // Arrange
      const manager = new CsvHeaderManager<TestUser>();
      manager.initialize(sampleUser);
      const firstHeaders = manager.getHeaders();

      const differentUser: TestUser = {
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        age: 25,
      };

      // Act
      const result = manager.initialize(differentUser);

      // Assert
      expect(result.success).toBe(true);
      expect(manager.getHeaders()).toEqual(firstHeaders);
    });
  });

  describe('error cases', () => {
    it('should return error for empty object', () => {
      // Arrange
      const manager = new CsvHeaderManager<Record<string, unknown>>();
      const emptyObject = {};

      // Act
      const result = manager.initialize(emptyObject);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('Cannot determine headers from empty object');
      }
    });
  });

  describe('flattenNestedObjects config option', () => {
    interface NestedUser extends Record<string, unknown> {
      id: number;
      name: string;
      address: {
        street: string;
        city: string;
      };
      tags: string[];
    }

    const nestedUser: NestedUser = {
      id: 1,
      name: 'John Doe',
      address: {
        street: '123 Main St',
        city: 'NYC',
      },
      tags: ['tag1', 'tag2'],
    };

    it('should flatten nested objects when option is enabled', () => {
      // Arrange
      const config: CsvConfig<NestedUser> = {
        flattenNestedObjects: true,
      };
      const manager = new CsvHeaderManager<NestedUser>(config);

      // Act
      const result = manager.initialize(nestedUser);

      // Assert
      expect(result.success).toBe(true);
      expect(manager.getHeaders()).toEqual([
        'id',
        'name',
        'address_street',
        'address_city',
        'tags',
      ]);
    });

    it('should convert flattened object to values correctly', () => {
      // Arrange
      const config: CsvConfig<NestedUser> = {
        flattenNestedObjects: true,
      };
      const manager = new CsvHeaderManager<NestedUser>(config);
      manager.initialize(nestedUser);

      // Act
      const values = manager.objectToValues(nestedUser);

      // Assert
      expect(values).toEqual([1, 'John Doe', '123 Main St', 'NYC', '["tag1","tag2"]']);
    });

    it('should not flatten when option is disabled', () => {
      // Arrange
      const config: CsvConfig<NestedUser> = {
        flattenNestedObjects: false,
      };
      const manager = new CsvHeaderManager<NestedUser>(config);

      // Act
      const result = manager.initialize(nestedUser);

      // Assert
      expect(result.success).toBe(true);
      expect(manager.getHeaders()).toEqual(['id', 'name', 'address', 'tags']);
    });

    it('should not flatten when option is not provided', () => {
      // Arrange
      const manager = new CsvHeaderManager<NestedUser>();

      // Act
      const result = manager.initialize(nestedUser);

      // Assert
      expect(result.success).toBe(true);
      expect(manager.getHeaders()).toEqual(['id', 'name', 'address', 'tags']);
    });

    it('should handle deeply nested objects', () => {
      // Arrange
      interface DeeplyNested extends Record<string, unknown> {
        id: number;
        user: {
          name: string;
          location: {
            address: {
              street: string;
              city: string;
            };
          };
        };
      }

      const deeplyNested: DeeplyNested = {
        id: 1,
        user: {
          name: 'John',
          location: {
            address: {
              street: '123 Main St',
              city: 'NYC',
            },
          },
        },
      };

      const config: CsvConfig<DeeplyNested> = {
        flattenNestedObjects: true,
      };
      const manager = new CsvHeaderManager<DeeplyNested>(config);

      // Act
      const result = manager.initialize(deeplyNested);

      // Assert
      expect(result.success).toBe(true);
      expect(manager.getHeaders()).toEqual([
        'id',
        'user_name',
        'user_location_address_street',
        'user_location_address_city',
      ]);
    });

    it('should handle null values in nested objects', () => {
      // Arrange
      interface UserWithNull extends Record<string, unknown> {
        id: number;
        profile: {
          name: string;
          middleName: null;
        };
      }

      const userWithNull: UserWithNull = {
        id: 1,
        profile: {
          name: 'John',
          middleName: null,
        },
      };

      const config: CsvConfig<UserWithNull> = {
        flattenNestedObjects: true,
      };
      const manager = new CsvHeaderManager<UserWithNull>(config);

      // Act
      manager.initialize(userWithNull);
      const values = manager.objectToValues(userWithNull);

      // Assert
      expect(values).toEqual([1, 'John', null]);
    });
  });
});
