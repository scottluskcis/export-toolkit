import { describe, it, expect } from 'vitest';
import { WriterFactory, ValidationError } from './index.js';

describe('WriterFactory', () => {
  it('should export WriterFactory', () => {
    expect(WriterFactory).toBeDefined();
    expect(typeof WriterFactory.create).toBe('function');
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

  it('should throw ValidationError for JSON writer (not yet implemented)', () => {
    expect(() => {
      WriterFactory.create({
        type: 'json',
        mode: 'write',
        file: 'test.json',
      });
    }).toThrow('JSON writer not yet implemented');
  });
});
