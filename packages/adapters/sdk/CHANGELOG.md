# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 2.1.0 (2025-10-15)


### Features

* Create adapter SDK and refactor bundler adapters ([9387988](https://github.com/brunos3d/expozr/commit/938798833369f6a5268008bc5965cef8dd9d5dd0))





# Changelog - @expozr/adapter-sdk

All notable changes to the Expozr Adapter SDK will be documented in this file.

## [2.0.0] - 2025-10-13

### Added

- **Initial release** of the shared Adapter SDK package
- **Shared constants** for configuration files, paths, and common patterns
- **Configuration loading utilities** with support for both sync and async loading
- **Format utilities** for handling multiple module formats (ESM, UMD, CJS)
- **External configuration utilities** for managing external dependencies
- **Warning suppression utilities** for better developer experience
- **Plugin base classes** for consistent plugin architecture across bundlers
- **ESM-specific utilities** for webpack ESM compilation support

### Features

- Support for standard configuration files (`expozr.config.ts`, `expozr.config.js`, etc.)
- Automatic configuration discovery and validation
- Multi-format build support with proper file naming conventions
- Warning pattern suppression for common Expozr-related bundler warnings
- TypeScript compilation configuration helpers
- External dependency management for both warehouse and host applications
- Development server configuration utilities

### Architecture

- Centralized constants and configuration patterns
- Reusable base classes for plugin development
- Shared utilities to reduce code duplication across adapters
- Clean separation of concerns between bundler-specific and shared logic
