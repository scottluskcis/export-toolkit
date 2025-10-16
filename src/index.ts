/**
 * Greets a person with a custom message.
 *
 * @param name - The name of the person to greet
 * @returns A greeting message
 *
 * @example
 * ```ts
 * const message = greet('Alice');
 * console.log(message); // "Hello, Alice!"
 * ```
 */
export function greet(name: string): string {
  return `Hello, ${name}!`;
}

/**
 * Adds two numbers together.
 *
 * @param a - The first number
 * @param b - The second number
 * @returns The sum of a and b
 *
 * @example
 * ```ts
 * const result = add(2, 3);
 * console.log(result); // 5
 * ```
 */
export function add(a: number, b: number): number {
  return a + b;
}
