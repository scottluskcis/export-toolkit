/**
 * Flattens a nested object into a single-level object with underscore-separated keys.
 *
 * @param obj - The object to flatten
 * @param prefix - Optional prefix for keys (used in recursion)
 * @returns Flattened object with primitive values or arrays as JSON strings
 *
 * @example
 * ```typescript
 * const nested = {
 *   user: {
 *     name: 'John',
 *     address: {
 *       city: 'NYC'
 *     }
 *   }
 * };
 * const flat = flattenObject(nested);
 * // Result: { 'user_name': 'John', 'user_address_city': 'NYC' }
 * ```
 */
export function flattenObject(
  obj: Record<string, unknown>,
  prefix = ''
): Record<string, string | number | boolean | null> {
  const flattened: Record<string, string | number | boolean | null> = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      const newKey = prefix ? `${prefix}_${key}` : key;

      if (value === null || value === undefined) {
        flattened[newKey] = null;
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        // Recursively flatten nested objects
        Object.assign(flattened, flattenObject(value as Record<string, unknown>, newKey));
      } else if (Array.isArray(value)) {
        // Convert arrays to JSON strings
        flattened[newKey] = JSON.stringify(value);
      } else {
        flattened[newKey] = value as string | number | boolean;
      }
    }
  }

  return flattened;
}
