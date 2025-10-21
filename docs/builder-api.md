# Builder API Guide

The Builder API provides a fluent, chainable interface for configuring and executing data export operations. It's designed to be intuitive, reduce boilerplate, and integrate seamlessly with modern JavaScript patterns like async/await and async generators.

## Quick Start

```typescript
import { outport } from '@scottluskcis/outport';

// Simple CSV export
await outport<User>().to('./users.csv').write(users);

// Simple JSON export
await outport<Product>().to('./products.json').write(products);
```

## Core Concepts

### 1. Type-Safe Configuration

The builder maintains type safety throughout the entire chain:

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

// TypeScript knows the shape of your data
const result = await outport<User>()
  .to('./users.csv')
  .withColumns(['id', 'name']) // Autocomplete for column names!
  .write(users);
```

### 2. Auto-Detection

File format is automatically detected from the file extension:

```typescript
outport<T>().to('./data.csv'); // Automatically uses CsvWriter
outport<T>().to('./data.json'); // Automatically uses JsonWriter
```

### 3. Method Chaining

All configuration methods return `this`, enabling fluent chaining:

```typescript
await outport<User>()
  .to('./users.csv')
  .withDelimiter('\t')
  .withHeaders(['ID', 'Name', 'Email'])
  .withUtf8Bom(true)
  .onProgress((current, total) => console.log(`${current}/${total}`))
  .write(users);
```

## CSV Configuration

### Basic Configuration

```typescript
await outport<User>()
  .to('./users.csv')
  .withDelimiter('\t') // Tab-separated values
  .withQuote("'") // Use single quotes instead of double
  .withUtf8Bom(true) // Add UTF-8 BOM for Excel compatibility
  .write(users);
```

### Custom Headers

```typescript
await outport<User>()
  .to('./users.csv')
  .withHeaders(['User ID', 'Full Name', 'Email Address'])
  .write(users);
```

### Column Mapping

```typescript
// Map property names to custom header names
await outport<User>()
  .to('./users.csv')
  .withColumnMapping({
    id: 'User ID',
    name: 'Full Name',
    email: 'Email Address',
  })
  .write(users);
```

### Select Specific Columns

```typescript
// Only export specific columns
await outport<User>()
  .to('./users.csv')
  .withColumns(['id', 'name']) // Only ID and Name columns
  .write(users);
```

## JSON Configuration

### Pretty Printing

```typescript
// With pretty printing (default)
await outport<User>().to('./users.json').prettyPrint(true).withIndent(2).write(users);

// Compact output
await outport<User>().to('./users.json').prettyPrint(false).write(users);
```

### Custom Indentation

```typescript
await outport<User>()
  .to('./users.json')
  .withIndent(4) // 4 spaces instead of 2
  .write(users);
```

## Write Modes

### Write Mode (Overwrite)

```typescript
// Overwrites file on each write (default)
await outport<User>().to('./users.csv').inMode('write').write(users);
```

### Append Mode

```typescript
// Appends to existing file
await outport<User>().to('./users.csv').inMode('append').append(newUser);
```

## Lifecycle Hooks

Hooks provide powerful integration points for custom logic during the write process.

### onProgress Hook

Track progress during write operations:

```typescript
await outport<User>()
  .to('./users.csv')
  .onProgress((current, total) => {
    const percent = total ? Math.round((current / total) * 100) : 0;
    console.log(`Progress: ${percent}%`);
  })
  .write(users);
```

### onBeforeWrite Hook

Transform or filter data before writing:

```typescript
await outport<User>()
  .to('./users.csv')
  .onBeforeWrite((data) => {
    // Filter out inactive users
    return data.filter((user) => user.active);
  })
  .write(users);

// Async transformation
await outport<User>()
  .to('./users.csv')
  .onBeforeWrite(async (data) => {
    // Enrich data from API
    return await Promise.all(
      data.map(async (user) => ({
        ...user,
        country: await fetchCountry(user.id),
      }))
    );
  })
  .write(users);
```

### onAfterWrite Hook

Execute logic after successful write:

```typescript
await outport<User>()
  .to('./users.csv')
  .onAfterWrite((data, recordCount) => {
    console.log(`Successfully wrote ${recordCount} records`);
    // Send notification, log to database, etc.
  })
  .write(users);
```

### onError Hook

Handle errors gracefully:

```typescript
await outport<User>()
  .to('./users.csv')
  .onError((error) => {
    console.error('Export failed:', error.message);
    // Log to error tracking service
    errorTracker.captureException(error);
    // Return true to continue, false to stop
    return false;
  })
  .write(users);
```

### onComplete Hook

Execute logic when operation completes (success or failure):

```typescript
await outport<User>()
  .to('./users.csv')
  .onComplete((result, totalRecords) => {
    if (result.success) {
      console.log(`Export complete: ${totalRecords} records`);
    } else {
      console.error('Export failed:', result.error);
    }
  })
  .write(users);
```

## Streaming with Async Generators

For large datasets that don't fit in memory, use async generators:

### Basic Streaming

```typescript
async function* fetchUsers(): AsyncGenerator<User> {
  let page = 1;
  while (true) {
    const users = await api.getUsers(page);
    if (users.length === 0) break;

    for (const user of users) {
      yield user;
    }
    page++;
  }
}

const result = await outport<User>()
  .to('./users.csv')
  .withBatchSize(100)
  .fromAsyncGenerator(fetchUsers());

if (result.success) {
  console.log(`Exported ${result.value} users`);
}
```

### Streaming with Progress

```typescript
const result = await outport<User>()
  .to('./users.csv')
  .withBatchSize(50)
  .onProgress((current) => {
    console.log(`Processed ${current} records...`);
  })
  .fromAsyncGenerator(fetchUsers());
```

### Stream Method

Alternative syntax using a generator function:

```typescript
await outport<User>()
  .to('./users.csv')
  .stream(async function* () {
    for await (const batch of fetchBatches()) {
      yield* batch; // Yield all items from batch
    }
  });
```

### Batch Size Configuration

Control memory usage by adjusting batch size:

```typescript
await outport<User>()
  .to('./users.csv')
  .withBatchSize(1000) // Process 1000 records per batch
  .fromAsyncGenerator(fetchUsers());
```

## Commander.js Integration

Perfect for CLI tools using Commander.js:

```typescript
import { Command } from 'commander';
import { outport } from '@scottluskcis/outport';

const program = new Command();

program
  .command('export')
  .option('-o, --output <file>', 'Output file')
  .option('-f, --format <format>', 'Output format (csv|json)')
  .action(async (options) => {
    const users = await fetchUsers();

    const result = await outport<User>()
      .to(options.output)
      .as(options.format)
      .onProgress((current, total) => {
        process.stdout.write(`\rExporting: ${current}/${total}`);
      })
      .onComplete((result, total) => {
        if (result.success) {
          console.log(`\n✓ Exported ${total} users to ${options.output}`);
        } else {
          console.error(`\n✗ Export failed: ${result.error.message}`);
          process.exit(1);
        }
      })
      .write(users);
  });

program.parse();
```

## Real-World Examples

### Example 1: Database Export with Pagination

```typescript
import { outport } from '@scottluskcis/outport';
import { db } from './database';

async function* fetchAllUsers() {
  let offset = 0;
  const limit = 1000;

  while (true) {
    const users = await db.users.findMany({
      take: limit,
      skip: offset,
      orderBy: { id: 'asc' },
    });

    if (users.length === 0) break;

    for (const user of users) {
      yield user;
    }

    offset += limit;
  }
}

// Export to CSV with progress tracking
const result = await outport<User>()
  .to('./exports/users.csv')
  .withBatchSize(500)
  .withColumns(['id', 'email', 'createdAt'])
  .onProgress((count) => {
    console.log(`Exported ${count} users...`);
  })
  .fromAsyncGenerator(fetchAllUsers());

console.log(`Total exported: ${result.value}`);
```

### Example 2: API Data Export with Transformation

```typescript
async function* fetchProductsFromAPI() {
  for (let page = 1; page <= 100; page++) {
    const response = await fetch(`/api/products?page=${page}`);
    const { data } = await response.json();

    for (const product of data) {
      yield product;
    }
  }
}

await outport<Product>()
  .to('./products.json')
  .prettyPrint()
  .onBeforeWrite((products) => {
    // Transform data before writing
    return products.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      inStock: p.inventory > 0,
      category: p.category.name,
    }));
  })
  .stream(() => fetchProductsFromAPI());
```

### Example 3: Multi-Format Export

```typescript
async function exportUsers(format: 'csv' | 'json') {
  const users = await fetchUsers();

  const builder = outport<User>()
    .to(`./exports/users.${format}`)
    .onProgress((current, total) => {
      console.log(`Progress: ${current}/${total}`);
    });

  // Format-specific configuration
  if (format === 'csv') {
    builder.withDelimiter(',').withHeaders(['User ID', 'Name', 'Email']).withUtf8Bom(true);
  } else {
    builder.prettyPrint(true).withIndent(2);
  }

  await builder.write(users);
}

// Export both formats
await Promise.all([exportUsers('csv'), exportUsers('json')]);
```

### Example 4: Error Recovery

```typescript
await outport<User>()
  .to('./users.csv')
  .onBeforeWrite(async (users) => {
    // Validate data before writing
    const valid = users.filter((u) => {
      if (!u.email || !u.email.includes('@')) {
        console.warn(`Skipping invalid user: ${u.id}`);
        return false;
      }
      return true;
    });
    return valid;
  })
  .onError((error) => {
    // Log error but don't stop
    console.error('Export error:', error);
    // Retry or alternative action
    return true; // Continue processing
  })
  .onComplete((result, total) => {
    if (result.success) {
      console.log(`✓ Exported ${total} valid users`);
    } else {
      console.error('✗ Export failed completely');
      // Fallback logic
    }
  })
  .write(users);
```

## API Reference

### Main Factory

- `outport<T>()` - Creates a new builder instance

### Configuration Methods

- `.to(path: string)` - Set output file path
- `.as(type: 'csv' | 'json')` - Explicitly set writer type
- `.inMode(mode: 'write' | 'append')` - Set write mode

### CSV Methods

- `.withDelimiter(char: string)` - Set delimiter character
- `.withQuote(char: string)` - Set quote character
- `.withHeaders(headers: string[])` - Set custom headers
- `.withColumns(keys: Array<keyof T>)` - Select columns to export
- `.withColumnMapping(mapping: Record<keyof T, string>)` - Map property names to headers
- `.withUtf8Bom(enabled: boolean)` - Enable/disable UTF-8 BOM

### JSON Methods

- `.prettyPrint(enabled: boolean)` - Enable/disable pretty printing
- `.withIndent(spaces: number)` - Set indentation level

### Hook Methods

- `.onBeforeWrite(hook: (data: T[]) => T[] | Promise<T[]>)` - Transform before write
- `.onAfterWrite(hook: (data: T[], count: number) => void | Promise<void>)` - Execute after write
- `.onProgress(hook: (current: number, total?: number) => void | Promise<void>)` - Track progress
- `.onError(hook: (error: Error) => boolean | Promise<boolean>)` - Handle errors
- `.onComplete(hook: (result: Result<void>, total: number) => void | Promise<void>)` - Handle completion

### Streaming Methods

- `.withBatchSize(size: number)` - Set batch size for streaming
- `.fromAsyncGenerator(gen: AsyncGenerator<T>)` - Stream from async generator
- `.stream(fn: () => AsyncGenerator<T>)` - Stream using generator function

### Execution Methods

- `.write(data: T[])` - Write data asynchronously
- `.writeSync(data: T[])` - Write data synchronously
- `.append(data: T | T[])` - Append data asynchronously
- `.appendSync(data: T | T[])` - Append data synchronously

## Best Practices

1. **Use Type Parameters**: Always specify your data type for better IntelliSense
2. **Handle Results**: Check the `success` property of returned results
3. **Use Async Generators for Large Datasets**: Don't load everything into memory
4. **Configure Batch Size**: Balance memory usage and performance
5. **Add Progress Hooks**: Provide feedback for long-running operations
6. **Validate in onBeforeWrite**: Filter out invalid data before writing
7. **Handle Errors Gracefully**: Use onError and onComplete hooks
8. **Use Appropriate Write Mode**: Choose between 'write' and 'append' based on your needs

## Migration from Direct Writer Usage

### Before (Direct Writer)

```typescript
import { CsvWriter } from '@scottluskcis/outport';

const writer = new CsvWriter<User>({
  type: 'csv',
  mode: 'write',
  file: './users.csv',
  config: {
    delimiter: '\t',
    headers: ['ID', 'Name'],
  },
});

const result = await writer.write(users);
```

### After (Builder API)

```typescript
import { outport } from '@scottluskcis/outport';

const result = await outport<User>()
  .to('./users.csv')
  .withDelimiter('\t')
  .withHeaders(['ID', 'Name'])
  .write(users);
```

The builder API is completely backward compatible - all existing code continues to work!
