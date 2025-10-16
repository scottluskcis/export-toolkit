# outport

> Tool for exporting data to a format that can be used for reporting such as CSV, JSON, etc.

[![CI](https://github.com/scottluskcis/outport/actions/workflows/ci.yml/badge.svg)](https://github.com/scottluskcis/outport/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)

## ✨ Features

- 🚀 Export data to multiple formats (CSV, JSON, etc.)
- 📦 TypeScript-first with full type safety
- ✅ Comprehensive test coverage (100%)
- 🎯 Modern ES modules
- 🔧 Strict TypeScript configuration
- 📝 Well-documented API with JSDoc comments

## 📦 Installation

```bash
pnpm add outport
# or
npm install outport
# or
yarn add outport
```

## 🚀 Quick Start

```typescript
import { greet, add } from 'outport';

// Greet someone
console.log(greet('World')); // "Hello, World!"

// Perform calculations
console.log(add(2, 3)); // 5
```

## 📖 API Reference

### `greet(name: string): string`

Greets a person with a custom message.

**Parameters:**

- `name` - The name of the person to greet

**Returns:** A greeting message

**Example:**

```typescript
const message = greet('Alice');
console.log(message); // "Hello, Alice!"
```

### `add(a: number, b: number): number`

Adds two numbers together.

**Parameters:**

- `a` - The first number
- `b` - The second number

**Returns:** The sum of a and b

**Example:**

```typescript
const result = add(2, 3);
console.log(result); // 5
```

## 🛠️ Development

### Prerequisites

- Node.js >= 18.0.0 (recommended: 22.x via `.nvmrc`)
- pnpm >= 8.0.0

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

---
