# Export Toolkit Samples

This directory contains practical, runnable examples demonstrating how to use the Export Toolkit library's builder API for various real-world scenarios.

## Prerequisites

Make sure you have the project built:

```bash
pnpm install
pnpm run build
```

## Running Samples

Execute any sample directly with Node.js:

```bash
# Run a specific sample
node --loader ts-node/esm samples/01-basic-csv-export.ts

# Or use tsx (faster)
npx tsx samples/01-basic-csv-export.ts
```

Each sample will create output files in the `samples/temp/` directory.

## Available Samples

### 1. Basic CSV Export (`01-basic-csv-export.ts`)

**Difficulty**: Beginner  
**Concepts**: Basic CSV export, fluent API

The simplest example showing how to export an array of objects to CSV format using the builder API.

```bash
npx tsx samples/01-basic-csv-export.ts
```

### 2. Basic JSON Export (`02-basic-json-export.ts`)

**Difficulty**: Beginner  
**Concepts**: JSON export, pretty printing

Export data to JSON format with pretty printing enabled for human-readable output.

```bash
npx tsx samples/02-basic-json-export.ts
```

### 3. CSV Custom Configuration (`03-csv-custom-config.ts`)

**Difficulty**: Intermediate  
**Concepts**: TSV format, custom delimiters, custom headers, UTF-8 BOM

Demonstrates advanced CSV configuration including:

- Custom delimiters (tab-separated values)
- Custom column headers and ordering
- UTF-8 BOM for Excel compatibility

```bash
npx tsx samples/03-csv-custom-config.ts
```

### 4. Progress Tracking (`04-progress-tracking.ts`)

**Difficulty**: Intermediate  
**Concepts**: Progress hook, visual feedback

Shows how to implement a progress bar using the `onProgress` hook for long-running exports.

```bash
npx tsx samples/04-progress-tracking.ts
```

### 5. Data Transformation (`05-data-transformation.ts`)

**Difficulty**: Intermediate  
**Concepts**: onBeforeWrite hook, filtering, transforming data

Use lifecycle hooks to filter and transform data before writing:

- Filter records (only active users)
- Add computed fields (full name)
- Redact sensitive information (salary levels)

```bash
npx tsx samples/05-data-transformation.ts
```

### 6. Streaming Large Datasets (`06-streaming-large-dataset.ts`)

**Difficulty**: Advanced  
**Concepts**: Async generators, streaming, memory efficiency

Efficiently export millions of records using async generators and streaming. Perfect for:

- Database cursor pagination
- API pagination
- Large file processing

```bash
npx tsx samples/06-streaming-large-dataset.ts
```

### 7. Error Handling (`07-error-handling.ts`)

**Difficulty**: Advanced  
**Concepts**: onError hook, validation, error logging

Comprehensive error handling including:

- Data validation
- Error logging to files
- Graceful failure handling
- File system error recovery

```bash
npx tsx samples/07-error-handling.ts
```

## Sample Output

All samples create output files in:

```
samples/temp/
├── basic-csv/
│   └── users.csv
├── basic-json/
│   └── users.json
├── custom-csv/
│   └── products.tsv
├── progress/
│   └── records.csv
├── transform/
│   └── transformed-users.csv
├── streaming/
│   └── server-logs.csv
└── error-handling/
    ├── transactions.json
    └── errors.log
```

The `temp/` directory is gitignored and safe to delete.

## Learning Path

1. Start with **01-basic-csv-export** and **02-basic-json-export** to understand the core API
2. Progress to **03-csv-custom-config** to learn about configuration options
3. Try **04-progress-tracking** to add user feedback
4. Explore **05-data-transformation** to manipulate data with hooks
5. Master **06-streaming-large-dataset** for performance-critical applications
6. Study **07-error-handling** for production-ready error management

## Key Concepts

### Builder Pattern

All samples use the fluent builder API:

```typescript
await outport<YourType>()
  .to('output.csv')
  .withCsvConfig({
    /* options */
  })
  .onProgress((count) => {
    /* track progress */
  })
  .write(data);
```

### Lifecycle Hooks

- `onBeforeWrite`: Transform or filter data before writing
- `onAfterWrite`: Post-processing after write completes
- `onProgress`: Track progress during write operation
- `onError`: Handle errors gracefully
- `onComplete`: Final cleanup or notifications

### Streaming Support

Use async generators for memory-efficient processing:

```typescript
async function* generateData() {
  for (let i = 0; i < 1000000; i++) {
    yield { id: i, data: '...' };
  }
}

await outport<Record>().to('output.csv').stream(generateData());
```

## Tips

1. **Type Safety**: Always specify your data type: `outport<YourInterface>()`
2. **Memory Efficiency**: Use streaming for large datasets (>10K records)
3. **Error Handling**: Always include `onError` hooks in production code
4. **Progress Feedback**: Use `onProgress` for long-running exports
5. **Data Validation**: Validate in `onBeforeWrite` to catch issues early

## Further Reading

- [Builder API Documentation](../docs/builder-api.md)
- [CSV Writer Documentation](../docs/csv-writer.md)
- [JSON Writer Documentation](../docs/json-writer.md)
- [Type Safety Guide](../docs/type-safety-example.md)

## Contributing

To add a new sample:

1. Create `XX-descriptive-name.ts` in this directory
2. Follow the existing format (header comment, imports, main function)
3. Add entry to this README with description and commands
4. Ensure output goes to `samples/temp/your-sample/`
5. Test that it runs successfully

## Support

If you encounter issues running these samples, please check:

- Node.js version (18+ required)
- TypeScript is installed
- Project is built (`pnpm run build`)
- Dependencies are installed (`pnpm install`)
