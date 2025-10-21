# CSV Writer Guide

Quick reference for using the `CsvWriter` class to export data to CSV files.

## Basic Usage

### Simple Write

```typescript
import { CsvWriter } from '@scottluskcis/outport';

interface User {
  id: number;
  name: string;
  email: string;
}

const writer = new CsvWriter<User>({
  type: 'csv',
  mode: 'write',
  file: './output/users.csv',
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
const writer = new CsvWriter<User>({
  type: 'csv',
  mode: 'append',
  file: './output/users.csv',
});

// Append single row
writer.appendSync({ id: 3, name: 'Charlie', email: 'charlie@example.com' });

// Append multiple rows
await writer.append([
  { id: 4, name: 'Diana', email: 'diana@example.com' },
  { id: 5, name: 'Eve', email: 'eve@example.com' },
]);
```

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

const writer = new CsvWriter<User>({
  type: 'csv',
  mode: 'write',
  file: './output/large-dataset.csv',
});

// Process first batch to initialize headers
const generator = fetchUsers();
const firstBatch = [];
for (let i = 0; i < 100; i++) {
  const { value, done } = await generator.next();
  if (done) break;
  firstBatch.push(value);
}
await writer.write(firstBatch);

// Stream remaining rows
for await (const user of generator) {
  await writer.append(user);
}
```

## Custom Configuration

### Custom Delimiter

```typescript
const writer = new CsvWriter<User>({
  type: 'csv',
  mode: 'write',
  file: './output/users.tsv',
  csv: {
    delimiter: '\t', // Tab-separated values
  },
});
```

### Custom Headers

```typescript
const writer = new CsvWriter<User>({
  type: 'csv',
  mode: 'write',
  file: './output/users.csv',
  csv: {
    headers: ['ID', 'Full Name', 'Email Address'],
  },
});
```

### Column Mapping

```typescript
const writer = new CsvWriter<User>({
  type: 'csv',
  mode: 'write',
  file: './output/users.csv',
  csv: {
    columnMapping: {
      id: 'ID',
      name: 'Full Name',
      email: 'Email Address',
    },
  },
});
```

### Include Keys as First Row

```typescript
const writer = new CsvWriter<User>({
  type: 'csv',
  mode: 'write',
  file: './output/users.csv',
  csv: {
    includeKeys: true, // Uses object keys as headers
  },
});
```

### UTF-8 BOM

```typescript
const writer = new CsvWriter<User>({
  type: 'csv',
  mode: 'write',
  file: './output/users.csv',
  csv: {
    includeUtf8Bom: true, // Adds BOM for Excel compatibility
  },
});
```

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
import { WriterFactory } from '@scottluskcis/outport';

const writer = WriterFactory.create<User>({
  type: 'csv',
  mode: 'write',
  file: './output/users.csv',
});
```

## Tips

- Use `mode: 'write'` to overwrite files each time
- Use `mode: 'append'` to add rows to existing files
- Headers are automatically inferred from the first data object
- Custom delimiters must be single characters
- File paths should end with `.csv` extension
