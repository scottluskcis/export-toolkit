# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.7] - 2025-10-21

- **Publishing Updates** - updates for npm publishing process

## [0.0.6] - 2025-10-21

### Added

- **Initial public release** of `@scottluskcis/outport`
- **Fluent Builder API** - Intuitive, chainable configuration for data exports
- **CSV Export Support**
  - Configurable delimiters (comma, tab, semicolon, pipe)
  - Custom header labels
  - UTF-8 BOM support for Excel compatibility
  - Automatic field escaping and quoting
  - Header management and validation
- **JSON Export Support**
  - Array and object output formats
  - Pretty printing with configurable indentation
  - Streaming JSON array output
- **Async Generator Streaming** - Efficiently handle large datasets
  - Memory-efficient processing of millions of records
  - Automatic batching for optimal performance
  - Configurable batch sizes
- **Lifecycle Hooks System**
  - `onBeforeWrite` - Transform or filter data before export
  - `onProgress` - Track export progress in real-time
  - `onAfterWrite` - Post-processing after write completes
  - `onError` - Centralized error handling
  - `onComplete` - Final success/failure notifications
- **Type-Safe API** - Full TypeScript support with strict typing
  - Generic type parameters for data records
  - Comprehensive type definitions
  - Type inference throughout the API
- **High Performance**
  - Automatic batching for large datasets
  - Memory optimization for streaming
  - Efficient file I/O operations
- **Well-Tested Codebase**
  - 170+ test cases across all components
  - 80%+ code coverage
  - Comprehensive unit and integration tests
- **Complete Documentation**
  - Builder API guide with advanced patterns
  - CSV writer examples and best practices
  - JSON writer usage patterns
  - Type safety examples
  - Sample code for common use cases
- **GitHub Actions CI/CD Pipeline**
  - Automated testing on Node.js 18.x, 20.x, and 22.x
  - Automated npm publishing on release
  - Code coverage reporting
  - Automated dependency updates via Dependabot
- **Development Tools**
  - ESLint v9 with flat config
  - Prettier code formatting
  - Husky pre-commit hooks
  - Vitest for testing
  - TypeScript strict mode

### Changed

- N/A (initial release)

### Security

- Added npm provenance for supply chain security
- Implemented granular npm access tokens

[unreleased]: https://github.com/scottluskcis/outport/compare/v0.0.7...HEAD
[0.0.7]: https://github.com/scottluskcis/outport/releases/tag/v0.0.7
