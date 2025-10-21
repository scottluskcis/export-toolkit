import { describe, it, expect } from 'vitest';
import { WriterFactory } from '../../src/writers/WriterFactory';
import { ValidationError } from '../../src/errors';

describe('WriterFactory', () => {
  it('should have create method', () => {
    expect(WriterFactory).toBeDefined();
    expect(typeof WriterFactory.create).toBe('function');
  });

  it('should create CsvWriter successfully', () => {
    expect(() => {
      WriterFactory.create({
        type: 'csv',
        mode: 'write',
        file: 'test.csv',
      });
    }).not.toThrow();
  });

  it('should create JsonWriter successfully', () => {
    expect(() => {
      WriterFactory.create({
        type: 'json',
        mode: 'write',
        file: 'test.json',
      });
    }).not.toThrow();
  });

  it('should throw ValidationError for unknown writer type', () => {
    expect(() => {
      WriterFactory.create({
        type: 'unknown' as never,
        mode: 'write',
        file: 'test.csv',
      });
    }).toThrow(ValidationError);
  });
});
