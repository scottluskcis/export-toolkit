# outport

> Tool for exporting data to a format that can be used for reporting such as CSV, JSON, etc.

[![CI](https://github.com/scottluskcis/outport/actions/workflows/ci.yml/badge.svg)](https://github.com/scottluskcis/outport/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![npm version](https://badge.fury.io/js/@scottluskcis%2Foutport.svg)](https://www.npmjs.com/package/@scottluskcis/outport)
[![npm downloads](https://img.shields.io/npm/dm/@scottluskcis/outport.svg)](https://www.npmjs.com/package/@scottluskcis/outport)

## ✨ Features

- 🚀 **Fluent Builder API** - Intuitive, chainable configuration
- 📝 **CSV & JSON Support** - Export to popular formats
- 🔄 **Async Generator Streaming** - Handle large datasets efficiently
- 🪝 **Lifecycle Hooks** - Transform, validate, and track progress
- 💪 **Type-Safe** - Full TypeScript support with strict typing
- ⚡ **High Performance** - Automatic batching and memory optimization
- 🎯 **Commander.js Integration** - Perfect for CLI tools
- 🧪 **Well-Tested** - 170+ tests with 80%+ coverage

## 🚀 Quick Start

### Installation

```bash
npm install @scottluskcis/outport
# or
pnpm add @scottluskcis/outport
# or
yarn add @scottluskcis/outport
```

### Simple Export

```typescript
import { outport } from 'outport';

interface User {
  id: number;
  name: string;
  email: string;
}

const users: User[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' },
];

// CSV export
await outport<User>().to('./users.csv').write(users);

// JSON export
await outport<User>().to('./users.json').prettyPrint().write(users);
```

### With Configuration

```typescript
// Tab-separated CSV with custom headers
await outport<User>()
  .to('./users.tsv')
  .withDelimiter('\t')
  .withHeaders(['ID', 'Full Name', 'Email Address'])
  .withUtf8Bom(true)
  .write(users);
```

### With Progress Tracking

```typescript
await outport<User>()
  .to('./users.csv')
  .onProgress((current, total) => {
    console.log(`Progress: ${current}/${total}`);
  })
  .write(users);
```

### Streaming Large Datasets

```typescript
async function* fetchUsers(): AsyncGenerator<User> {
  for (let page = 1; page <= 100; page++) {
    const users = await api.getUsers(page);
    for (const user of users) {
      yield user;
    }
  }
}

// Automatically batched for efficiency
const result = await outport<User>()
  .to('./users.csv')
  .withBatchSize(100)
  .onProgress((count) => console.log(`Exported ${count} users...`))
  .fromAsyncGenerator(fetchUsers());

console.log(`Total exported: ${result.value}`);
```

### Commander.js Integration

```typescript
import { Command } from 'commander';
import { outport } from 'outport';

const program = new Command();

program
  .command('export')
  .option('-o, --output <file>', 'Output file')
  .action(async (options) => {
    const users = await fetchUsers();

    await outport<User>()
      .to(options.output)
      .onProgress((current, total) => {
        process.stdout.write(`\rExporting: ${current}/${total}`);
      })
      .onComplete((result, total) => {
        if (result.success) {
          console.log(`\n✓ Exported ${total} users`);
        }
      })
      .write(users);
  });
```

## 📚 Documentation

- **[Builder API Guide](docs/builder-api.md)** - Complete guide to the fluent builder API
- **[CSV Writer Guide](docs/csv-writer.md)** - CSV-specific examples and patterns
- **[JSON Writer Guide](docs/json-writer.md)** - JSON-specific examples and patterns
- **[Type Safety Examples](docs/type-safety-example.md)** - TypeScript usage patterns

## 🎯 Key Concepts

### Builder Pattern

The fluent builder API makes configuration intuitive and self-documenting:

```typescript
await outport<User>()
  .to('./users.csv') // Where to write
  .withDelimiter(',') // CSV config
  .withHeaders(['ID', 'Name']) // Custom headers
  .onProgress(trackProgress) // Lifecycle hooks
  .write(users); // Execute
```

### Lifecycle Hooks

Tap into the export process at key points:

```typescript
await outport<User>()
  .to('./users.csv')
  .onBeforeWrite((data) => data.filter((u) => u.active)) // Transform
  .onProgress((current, total) => updateUI(current)) // Track
  .onAfterWrite((data, count) => logExport(count)) // Post-process
  .onError((error) => handleError(error)) // Error handling
  .onComplete((result, total) => notify(total)) // Completion
  .write(users);
```

### Async Generator Streaming

Process millions of records without loading them all into memory:

```typescript
async function* streamFromDatabase() {
  let offset = 0;
  const batchSize = 1000;

  while (true) {
    const records = await db.query({ offset, limit: batchSize });
    if (records.length === 0) break;

    for (const record of records) {
      yield record;
    }

    offset += batchSize;
  }
}

// Automatically batched and memory-efficient
await outport<Record>()
  .to('./records.csv')
  .withBatchSize(500)
  .fromAsyncGenerator(streamFromDatabase());
```

## 🏗️ Architecture

Outport follows SOLID principles and clean architecture:

- **Single Responsibility**: Each class has one job (formatting, writing, batching)
- **Open/Closed**: Extend with hooks without modifying core code
- **Liskov Substitution**: All writers implement the same interface
- **Interface Segregation**: Separate interfaces for different concerns
- **Dependency Inversion**: Depend on abstractions, not concretions

### Core Components

```
Builder API (Fluent Interface)
     ↓
WriterFactory (Abstraction)
     ↓
├── CsvWriter ──→ CsvFormatter, CsvHeaderManager
└── JsonWriter ──→ JsonFormatter
     ↓
FileWriter (I/O Abstraction)
     ↓
Node.js File System
```

## 🔧 Development

### Setup

```bash
# Clone the repository
git clone https://github.com/scottluskcis/outport.git
cd outport

# Install dependencies
pnpm install
```

### Available Scripts

| Script                   | Description                                              |
| ------------------------ | -------------------------------------------------------- |
| `pnpm run build`         | Compile TypeScript to JavaScript                         |
| `pnpm run test`          | Run tests once                                           |
| `pnpm run test:watch`    | Run tests in watch mode                                  |
| `pnpm run test:coverage` | Generate test coverage report                            |
| `pnpm run lint`          | Check for linting errors                                 |
| `pnpm run lint:fix`      | Fix auto-fixable linting errors                          |
| `pnpm run format`        | Format all files with Prettier                           |
| `pnpm run format:check`  | Check if files are formatted correctly                   |
| `pnpm run typecheck`     | Type check without emitting files                        |
| `pnpm run ci`            | Run all CI checks (typecheck, lint, format, build, test) |

### Project Structure

```
outport/
├── .github/           # GitHub Actions workflows and configs
├── docs/              # Documentation
│   └── csv-writer.md  # CSV Writer usage guide
├── src/               # Source TypeScript files
│   ├── index.ts       # Main entry point
│   └── index.test.ts  # Test files
├── dist/              # Compiled JavaScript (generated)
├── coverage/          # Test coverage reports (generated)
├── .nvmrc             # Node.js version specification
├── package.json       # Project metadata and dependencies
├── tsconfig.json      # TypeScript configuration
├── vitest.config.ts   # Vitest test configuration
├── eslint.config.js   # ESLint configuration (flat config)
└── .prettierrc        # Prettier configuration
```

## 📚 Documentation

- **[CSV Writer Guide](docs/csv-writer.md)** - Examples and usage patterns for the CSV writer
- **[JSON Writer Guide](docs/json-writer.md)** - Examples and usage patterns for the JSON writer

## 🧪 Testing

This project uses [Vitest](https://vitest.dev/) for testing with the following features:

- ✅ Global test APIs (describe, it, expect)
- 📊 Coverage reports with v8
- ⚡ Fast execution with Vite
- 🎯 80%+ coverage threshold

Run tests:

```bash
# Run once
pnpm run test

# Watch mode
pnpm run test:watch

# With coverage
pnpm run test:coverage
```

## 🎨 Code Quality

- **TypeScript**: Strict mode with modern ES2022+ features
- **ESLint**: v9+ with flat config and TypeScript support
- **Prettier**: Consistent code formatting
- **Vitest**: Comprehensive test coverage
- **Husky**: Pre-commit hooks for quality checks

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for your changes
4. Make your changes
5. Ensure all checks pass (`pnpm run ci`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

Please make sure to:

- Write tests for new functionality
- Follow the existing code style
- Update documentation as needed
- Ensure all CI checks pass

## 📄 License

MIT © [scottluskcis](https://github.com/scottluskcis)

## 🔗 Links

- [GitHub Repository](https://github.com/scottluskcis/outport)
- [Issue Tracker](https://github.com/scottluskcis/outport/issues)
- [Changelog](https://github.com/scottluskcis/outport/blob/main/CHANGELOG.md)
