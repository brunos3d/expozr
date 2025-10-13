# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 1.3.0 (2025-10-13)

### Features

* **refactor:** comprehensive package restructure for better organization ([#major](https://github.com/brunos3d/expozr/commit/refactor))
  - Organized code into modular directories: `/adapters`, `/loaders`, `/config`, `/utils`
  - Created utility classes: `ValidationUtils`, `ChecksumUtils`, `UrlUtils`, `VersionUtils`, `ObjectUtils`
  - Enhanced documentation with comprehensive JSDoc comments
  - Improved type safety and error handling
  - Maintained 100% backward compatibility through re-exports

### Bug Fixes

* **webpack-adapter:** fix import paths after core package refactoring
  - Updated function imports to use new utility classes
  - Fixed MODULE_NOT_FOUND errors in webpack remote applications
  - Ensured proper dependency linking in monorepo setup

### Documentation

* add comprehensive REFACTORING.md with migration guide and technical details
* enhanced inline documentation across all modules

# 1.2.0 (2025-10-11)


### Bug Fixes

* add [@vite-ignore](https://github.com/vite-ignore) comments for dynamic imports in loaders ([ce3279a](https://github.com/brunos3d/expozr/commit/ce3279acc78130cc1be5495da5108347b8c797d6))
* update gitHead references across all package.json files ([90e508d](https://github.com/brunos3d/expozr/commit/90e508d7d66060afd36d394187f8c876a4a76e8e))


### Features

* add publishConfig for public access to all packages ([572f332](https://github.com/brunos3d/expozr/commit/572f332aaaef874ba8820338c11cf5e80c47a3ee))
* add UMD example with auto-loader and enhance core module system ([fd852f4](https://github.com/brunos3d/expozr/commit/fd852f40574924e2b75c069d475687f59e4c70dc))
* **react:** add react utility package ([3286c1a](https://github.com/brunos3d/expozr/commit/3286c1a917dd66acdd4a361e3c4180f000b4b4cc))





# 1.1.0 (2025-10-09)


### Features

* **react:** add react utility package ([3286c1a](https://github.com/brunos3d/expozr/commit/3286c1a917dd66acdd4a361e3c4180f000b4b4cc))
