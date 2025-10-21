# Type Safety with Discriminated Union

The refactored `WriterOptions` type uses a discriminated union pattern to provide compile-time type safety when configuring writers.

## Benefits

### Before: Separate Config Properties

```typescript
// Old approach - could mix incompatible configs
interface WriterOptions<T> {
  type: 'csv' | 'json';
  csvConfig?: CsvConfig<T>;
  jsonConfig?: JsonConfig;
  // ...
}

// Nothing prevented this invalid combination:
const options: WriterOptions<User> = {
  type: 'csv',
  jsonConfig: { prettyPrint: true }, // Wrong config for CSV!
  // ...
};
```

### After: Discriminated Union

```typescript
// New approach - type system enforces correctness
type WriterOptions<T> =
  | (WriterOptionsBase & { type: 'csv'; config?: CsvConfig<T> })
  | (WriterOptionsBase & { type: 'json'; config?: JsonConfig });

// TypeScript now prevents invalid combinations:
const csvOptions: WriterOptions<User> = {
  type: 'csv',
  config: { prettyPrint: true }, // ❌ Type error! prettyPrint doesn't exist on CsvConfig
  // ...
};

const jsonOptions: WriterOptions<User> = {
  type: 'json',
  config: { delimiter: ',' }, // ❌ Type error! delimiter doesn't exist on JsonConfig
  // ...
};
```

## Type Narrowing

The factory uses TypeScript's type narrowing to ensure type safety:

```typescript
export function createWriter<T extends Record<string, unknown>>(
  options: WriterOptions<T>
): CsvWriter<T> | JsonWriter<T> {
  switch (options.type) {
    case 'csv':
      // TypeScript knows options.config is CsvConfig<T> here
      return new CsvWriter(options);
    case 'json':
      // TypeScript knows options.config is JsonConfig here
      return new JsonWriter(options);
    default:
      // Exhaustiveness check
      const _exhaustive: never = options;
      throw new Error(`Unknown writer type: ${(_exhaustive as WriterOptions<T>).type}`);
  }
}
```

## IntelliSense Support

When you set the `type` property, your IDE will automatically suggest only the valid config options:

```typescript
const options: WriterOptions<User> = {
  type: 'csv',
  mode: 'write',
  file: 'users.csv',
  config: {
    // ✅ IntelliSense suggests: delimiter, quoteStrings, includeHeaders, etc.
    delimiter: '\t',
    quoteStrings: 'always',
  },
};

const jsonOptions: WriterOptions<User> = {
  type: 'json',
  mode: 'write',
  file: 'users.json',
  config: {
    // ✅ IntelliSense suggests: prettyPrint, indent
    prettyPrint: true,
    indent: 2,
  },
};
```

## Scalability

Adding new writer types is straightforward and maintains type safety:

```typescript
// Add XML writer
type WriterOptions<T> =
  | (WriterOptionsBase & { type: 'csv'; config?: CsvConfig<T> })
  | (WriterOptionsBase & { type: 'json'; config?: JsonConfig })
  | (WriterOptionsBase & { type: 'xml'; config?: XmlConfig }); // New type

// TypeScript will now require updating the factory's switch statement
// (exhaustiveness check catches missing cases)
```

## Summary

The discriminated union pattern provides:

- **Compile-time safety**: Invalid config combinations are caught at compile time
- **Better IntelliSense**: IDE autocomplete shows only valid options
- **Exhaustiveness checking**: TypeScript ensures all cases are handled
- **Scalability**: Easy to add new writer types without breaking existing code
- **Maintainability**: Single `config` property is cleaner than multiple optional configs
