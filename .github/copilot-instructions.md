# Copilot Instructions for Outport Project

## Project Overview

This is a TypeScript project using modern best practices with ES modules, pnpm package management, and comprehensive tooling.

## Technology Stack

- **TypeScript**: Strict mode enabled with modern ES2022+ features
- **Package Manager**: pnpm (required)
- **Build Tool**: TypeScript Compiler (tsc)
- **Testing**: Vitest with coverage support
- **Linting**: ESLint v9+ with flat config format
- **Formatting**: Prettier
- **CI/CD**: GitHub Actions

## Code Standards

### Design Principles

- Follow **SOLID** design patterns:
  - **S**ingle Responsibility Principle: Each class/module should have one reason to change
  - **O**pen/Closed Principle: Open for extension, closed for modification
  - **L**iskov Substitution Principle: Subtypes must be substitutable for their base types
  - **I**nterface Segregation Principle: Don't force clients to depend on interfaces they don't use
  - **D**ependency Inversion Principle: Depend on abstractions, not concretions
- Favor composition over inheritance
- Keep functions and methods small and focused
- Use dependency injection for better testability

### TypeScript

- Always use ES modules (`import`/`export`)
- Enable strict type checking
- Prefer type inference but add explicit return types for exported functions
- Use `type` imports when importing only types
- Avoid `any` - use `unknown` or proper types
- Use optional chaining and nullish coalescing operators

### File Organization

- Source files in `src/`
- Test files in `__tests__/` folder with `.test.ts` extension (or `.spec.ts`)
  - Tests can also be placed alongside source files with `.test.ts` extension
  - Organize test files to mirror the structure of source files
- One export per file when possible
- Barrel exports in `index.ts` files

### Testing

- Write tests for all new functionality
- Use descriptive test names
- Follow AAA pattern: Arrange, Act, Assert
- Aim for 80%+ code coverage
- Use Vitest's global APIs (describe, it, expect)

### Naming Conventions

- Files: kebab-case (e.g., `user-service.ts`)
- Classes/Interfaces/Types: PascalCase
- Functions/Variables: camelCase
- Constants: UPPER_SNAKE_CASE for true constants
- Private class members: prefix with `#` or `_`

### Code Style

- Use single quotes for strings
- Semicolons required
- Trailing commas in ES5-compatible contexts
- 100 character line length
- 2 space indentation

## Development Workflow

### Before Committing

1. **Always check linting and formatting first:**
   - Run `pnpm run lint` to check for linting errors
   - Run `pnpm run format:check` to verify formatting
   - Or fix automatically with `pnpm run lint:fix` and `pnpm run format`
2. **Then ensure all CI checks pass:**
   - Run `pnpm run typecheck` to verify types
   - Run `pnpm run test` to ensure tests pass
3. **Or use `pnpm run ci` to run all checks at once** (recommended)
   - This runs: typecheck → lint → format:check → build → test
   - **All changes must pass `pnpm run ci` before committing**

### Scripts

- `pnpm run build` - Compile TypeScript
- `pnpm run test` - Run tests once
- `pnpm run test:watch` - Run tests in watch mode
- `pnpm run test:coverage` - Generate coverage report
- `pnpm run lint` - Check for linting errors
- `pnpm run lint:fix` - Fix auto-fixable linting errors
- `pnpm run format` - Format all files
- `pnpm run format:check` - Check formatting
- `pnpm run typecheck` - Type check without emitting
- `pnpm run ci` - Run all CI checks locally

## Best Practices

### Error Handling

- Use custom error classes for domain errors
- Always type-guard error objects in catch blocks
- Prefer Result types over throwing for expected errors

### Async Code

- Use async/await over Promises.then()
- Handle promise rejections properly
- Avoid mixing callbacks and promises

### Dependencies

- Keep dependencies minimal
- Prefer packages with TypeScript support
- Update dependencies regularly
- Use exact versions in package.json when stability is critical

### Documentation

- Add JSDoc comments for public APIs
- Keep README.md up to date
- Document complex algorithms inline
- **When adding new features, create documentation in the `docs/` folder**
  - Follow the existing pattern (e.g., `csv-writer.md`, `json-writer.md`)
  - Include usage examples and API reference
  - Update the README to link to new documentation
- Update this file when project conventions change

## CI/CD

- All PRs must pass CI checks
- CI runs on Node.js 18.x, 20.x, and 22.x
- Must pass: typecheck, lint, format check, build, and tests
- Coverage reports uploaded for Node.js 22.x
- **Copilot code review automatically runs on all pull requests**
  - Review feedback should be addressed before merging
  - Copilot may suggest improvements for code quality, security, and best practices

## Contributing

When adding new features:

1. Create a feature branch
2. Write tests first (TDD) in the `__tests__/` folder
3. Implement the feature following SOLID principles
4. Create documentation in the `docs/` folder
5. Ensure linting and formatting pass (`pnpm run lint`, `pnpm run format:check`)
6. **Ensure all CI checks pass locally (`pnpm run ci`)**
7. Create a pull request with clear description
8. Address any Copilot review feedback
