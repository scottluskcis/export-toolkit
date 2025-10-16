import { describe, it, expect } from 'vitest';
import { greet, add } from './index.js';

describe('greet', () => {
  it('should greet a person with their name', () => {
    // Arrange
    const name = 'Alice';

    // Act
    const result = greet(name);

    // Assert
    expect(result).toBe('Hello, Alice!');
  });

  it('should handle empty string', () => {
    // Arrange
    const name = '';

    // Act
    const result = greet(name);

    // Assert
    expect(result).toBe('Hello, !');
  });
});

describe('add', () => {
  it('should add two positive numbers', () => {
    // Arrange
    const a = 2;
    const b = 3;

    // Act
    const result = add(a, b);

    // Assert
    expect(result).toBe(5);
  });

  it('should add negative numbers', () => {
    // Arrange
    const a = -5;
    const b = 3;

    // Act
    const result = add(a, b);

    // Assert
    expect(result).toBe(-2);
  });

  it('should add zero', () => {
    // Arrange
    const a = 10;
    const b = 0;

    // Act
    const result = add(a, b);

    // Assert
    expect(result).toBe(10);
  });
});
