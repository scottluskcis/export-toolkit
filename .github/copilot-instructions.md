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

### TypeScript

- Always use ES modules (`import`/`export`)
- Enable strict type checking
- Prefer type inference but add explicit return types for exported functions
- Use `type` imports when importing only types
- Avoid `any` - use `unknown` or proper types
- Use optional chaining and nullish coalescing operators

### File Organization

- Source files in `src/`
- Test files alongside source with `.test.ts` extension
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

1. Run `pnpm run typecheck` to verify types
2. Run `pnpm run lint` to check for linting errors
3. Run `pnpm run format:check` to verify formatting
4. Run `pnpm run test` to ensure tests pass
5. Or use `pnpm run ci` to run all checks

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
- Update this file when project conventions change

## CI/CD

- All PRs must pass CI checks
- CI runs on Node.js 18.x, 20.x, and 22.x
- Must pass: typecheck, lint, format check, build, and tests
- Coverage reports uploaded for Node.js 22.x

## Contributing

When adding new features:

1. Create a feature branch
2. Write tests first (TDD)
3. Implement the feature
4. Ensure all CI checks pass locally
5. Create a pull request with clear description
