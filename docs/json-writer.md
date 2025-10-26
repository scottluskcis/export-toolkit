# JSON Writer Guide

Quick reference for using the `JsonWriter` class to export data to JSON files.

## Basic Usage

### Simple Write

```typescript
import { JsonWriter } from '@scottluskcis/export-toolkit';

interface User {
  id: number;
  name: string;
  email: string;
}

const writer = new JsonWriter<User>({
  type: 'json',
  mode: 'write',
  file: './output/users.json',
});

const users: User[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' },
];

// Synchronous
const result = writer.writeSync(users);

// Asynchronous
const result = await writer.write(users);
```

### Append Mode

```typescript
const writer = new JsonWriter<User>({
  type: 'json',
  mode: 'append',
  file: './output/users.json',
});

// Append single object
writer.appendSync({ id: 3, name: 'Charlie', email: 'charlie@example.com' });

// Append multiple objects
await writer.append([
  { id: 4, name: 'Diana', email: 'diana@example.com' },
  { id: 5, name: 'Eve', email: 'eve@example.com' },
]);
```

**Note:** Unlike CSV append mode which adds rows to the end of a file, JSON append mode loads the entire JSON array, adds new items, and rewrites the complete array. This is necessary to maintain valid JSON structure.

### Async Generator (Streaming Large Datasets)

```typescript
async function* fetchUsers(): AsyncGenerator<User> {
  // Simulate fetching data in batches from database/API
  for (let i = 0; i < 1000; i += 100) {
    const batch = await fetchUserBatch(i, 100);
    for (const user of batch) {
      yield user;
    }
  }
}

const writer = new JsonWriter<User>({
  type: 'json',
  mode: 'write',
  file: './output/large-dataset.json',
});

// Process first batch to initialize
const generator = fetchUsers();
const firstBatch = [];
for (let i = 0; i < 100; i++) {
  const { value, done } = await generator.next();
  if (done) break;
  firstBatch.push(value);
}
await writer.write(firstBatch);

// Stream remaining items
for await (const user of generator) {
  await writer.append(user);
}
```

## Custom Configuration

### Compact Output (No Pretty Print)

```typescript
const writer = new JsonWriter<User>({
  type: 'json',
  mode: 'write',
  file: './output/users.json',
  config: {
    prettyPrint: false, // Single-line, compact JSON
  },
});
```

### Custom Indentation

```typescript
const writer = new JsonWriter<User>({
  type: 'json',
  mode: 'write',
  file: './output/users.json',
  config: {
    prettyPrint: true,
    indent: 4, // Use 4 spaces instead of default 2
  },
});
```

### UTF-8 BOM

```typescript
const writer = new JsonWriter<User>({
  type: 'json',
  mode: 'write',
  file: './output/users.json',
  config: {
    includeUtf8Bom: true, // Adds BOM for compatibility with some legacy tools
  },
});
```

## Configuration Options

| Option           | Type      | Default | Description                                             |
| ---------------- | --------- | ------- | ------------------------------------------------------- |
| `prettyPrint`    | `boolean` | `true`  | Format JSON with indentation and newlines               |
| `indent`         | `number`  | `2`     | Number of spaces for indentation (0-10)                 |
| `includeUtf8Bom` | `boolean` | `false` | Add UTF-8 BOM at start of file for legacy compatibility |

## Error Handling

The writer uses a Result type pattern for error handling:

```typescript
const result = writer.writeSync(users);

if (result.success) {
  console.log('Write successful!');
} else {
  console.error('Write failed:', result.error.message);
}
```

## Factory Pattern

Use the `WriterFactory` to create writers:

```typescript
import { WriterFactory } from '@scottluskcis/export-toolkit';

const writer = WriterFactory.create<User>({
  type: 'json',
  mode: 'write',
  file: './output/users.json',
  config: {
    prettyPrint: true,
    indent: 2,
  },
});
```

## Output Format

The JSON writer always outputs data as a JSON array:

```json
[
  {
    "id": 1,
    "name": "Alice",
    "email": "alice@example.com"
  },
  {
    "id": 2,
    "name": "Bob",
    "email": "bob@example.com"
  }
]
```

With `prettyPrint: false`:

```json
[
  { "id": 1, "name": "Alice", "email": "alice@example.com" },
  { "id": 2, "name": "Bob", "email": "bob@example.com" }
]
```

## Comparison with CSV Writer

| Feature                | CSV Writer                | JSON Writer                       |
| ---------------------- | ------------------------- | --------------------------------- |
| **Output Format**      | Tabular rows              | Structured JSON array             |
| **Headers**            | Required, customizable    | Not applicable (uses object keys) |
| **Nested Objects**     | Serialized to string      | Native support                    |
| **Arrays**             | Serialized to string      | Native support                    |
| **Append Performance** | Fast (file append)        | Slower (reload + rewrite)         |
| **File Size**          | Typically smaller         | Typically larger                  |
| **Human Readable**     | Yes (with column headers) | Yes (with prettyPrint)            |
| **Excel Compatible**   | Yes                       | No (requires conversion)          |
| **API Friendly**       | Less common               | Very common                       |

## Tips

- Use `mode: 'write'` to overwrite files each time
- Use `mode: 'append'` to add items to existing JSON arrays (note: this reloads and rewrites the entire file)
- JSON append mode is less efficient than CSV append for large files since it must rewrite the entire array
- Set `prettyPrint: false` for smaller file sizes and faster writes
- JSON is ideal for nested/complex data structures that don't fit well in CSV format
- File paths should end with `.json` extension
- Consider using streaming CSV for very large datasets where JSON's memory requirements might be problematic

## Special Data Types

The JSON writer handles TypeScript/JavaScript data types according to JSON specification:

- **Strings**: Preserved as-is
- **Numbers**: Preserved as-is
- **Booleans**: Preserved as-is
- **null**: Preserved as-is
- **undefined**: Omitted from output (JSON.stringify behavior)
- **Dates**: Serialized as ISO 8601 strings
- **Nested Objects**: Fully supported
- **Arrays**: Fully supported
- **Functions**: Omitted (JSON.stringify behavior)
- **Symbols**: Omitted (JSON.stringify behavior)

## Common Use Cases

### API Response Export

```typescript
// Export API responses to JSON files
const writer = new JsonWriter<ApiResponse>({
  type: 'json',
  mode: 'write',
  file: './api-backup.json',
});

const responses = await fetchAllFromAPI();
await writer.write(responses);
```

### Configuration File Generation

```typescript
// Generate configuration files
const writer = new JsonWriter<Config>({
  type: 'json',
  mode: 'write',
  file: './config/generated.json',
  config: {
    prettyPrint: true,
    indent: 2,
  },
});

const config = generateConfig();
writer.writeSync([config]);
```

### Data Pipeline Output

```typescript
// Output processed data for downstream systems
const writer = new JsonWriter<ProcessedData>({
  type: 'json',
  mode: 'write',
  file: './output/processed.json',
  config: {
    prettyPrint: false, // Compact for smaller files
  },
});

const processed = await processDataPipeline();
await writer.write(processed);
```
