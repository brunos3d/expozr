# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 2.1.0 (2025-10-15)


### Bug Fixes

* add [@vite-ignore](https://github.com/vite-ignore) comments for dynamic imports in loaders ([ce3279a](https://github.com/brunos3d/expozr/commit/ce3279acc78130cc1be5495da5108347b8c797d6))
* update gitHead fields in package.json for version tracking ([1ddc2ff](https://github.com/brunos3d/expozr/commit/1ddc2ffc6794437333543647f5d6866233c01a56))
* update gitHead references across all package.json files ([90e508d](https://github.com/brunos3d/expozr/commit/90e508d7d66060afd36d394187f8c876a4a76e8e))


### Features

* Add ExpozrHostPlugin for handling remote module consumption in Webpack ([8dba43f](https://github.com/brunos3d/expozr/commit/8dba43fe9ee5688e8477285bd03e81b9ac9d17cc))
* add publishConfig for public access to all packages ([572f332](https://github.com/brunos3d/expozr/commit/572f332aaaef874ba8820338c11cf5e80c47a3ee))
* add UMD example with auto-loader and enhance core module system ([fd852f4](https://github.com/brunos3d/expozr/commit/fd852f40574924e2b75c069d475687f59e4c70dc))
* enable automatic module discovery and enhance button component with new styles and sizes ([2542ec3](https://github.com/brunos3d/expozr/commit/2542ec3a427c7da8b8c629cc3fa10f3af9b77fcb))
* implement standardized global binding structure for UMD and ESM modules ([a1f2f8d](https://github.com/brunos3d/expozr/commit/a1f2f8d4d4297b9fabf2d77cb06644fe270cffc4))
* major refactoring of @expozr/core package and webpack adapter compatibility fixes ([81ea9e5](https://github.com/brunos3d/expozr/commit/81ea9e5f8d98358704434213d097bdcb4209d5bc))
* **react:** add react utility package ([3286c1a](https://github.com/brunos3d/expozr/commit/3286c1a917dd66acdd4a361e3c4180f000b4b4cc))


### BREAKING CHANGES

* Complete restructure of @expozr/core package for better organization

## 🚀 Core Package Refactoring (@expozr/core v1.3.0)

### New Modular Structure:
- `/adapters/` - Bundler adapters (AbstractBundlerAdapter, InventoryGenerator, etc.)
- `/loaders/` - Module loaders (ESMModuleLoader, UMDModuleLoader, etc.)
- `/config/` - Configuration utilities (presets, schemas, validation)
- `/utils/` - Utility classes (ValidationUtils, ChecksumUtils, UrlUtils, etc.)

### Key Improvements:
- **Utility Classes**: Organized functions into logical classes for better maintainability
- **Enhanced Documentation**: Comprehensive JSDoc comments throughout
- **Better Type Safety**: Improved TypeScript types and error handling
- **Tree-shaking Friendly**: Modular exports for optimal bundle sizes
- **100% Backward Compatibility**: All existing imports continue to work

### Technical Changes:
- Moved validation functions to `ValidationUtils` class
- Created `ChecksumUtils` for checksum generation
- Added `UrlUtils`, `VersionUtils`, `ObjectUtils` classes
- Refactored bundler adapters into dedicated modules
- Enhanced configuration management with presets

## 🔧 Webpack Adapter Fixes (@expozr/webpack-adapter v1.2.1)

### Bug Fixes:
- Fixed import paths after core package refactoring
- Updated function calls to use new utility classes:
  - `validateExpozrConfig` → `ValidationUtils.validateExpozrConfig`
  - `generateChecksum` → `ChecksumUtils.generateAsync`
  - `deepMerge` → `ObjectUtils.deepMerge`
- Resolved MODULE_NOT_FOUND errors in webpack remote applications
- Ensured proper dependency linking in monorepo setup

### Files Modified:
- `packages/adapters/webpack/src/expozr-plugin.ts`
- `packages/adapters/webpack/src/host-plugin.ts`
- `packages/adapters/webpack/src/adapter.ts`

## 📚 Documentation:
- Added comprehensive `REFACTORING.md` with migration guide
- Updated CHANGELOG.md files for both packages
- Enhanced inline documentation across all modules

## ✅ Testing:
- All packages build successfully
- Webpack remote applications working correctly
- Backward compatibility maintained
- Examples tested and functional

This refactoring significantly improves code organization, maintainability, and developer experience while ensuring all existing functionality continues to work seamlessly.





# 2.0.0 (2025-10-13)


### Bug Fixes

* add [@vite-ignore](https://github.com/vite-ignore) comments for dynamic imports in loaders ([ce3279a](https://github.com/brunos3d/expozr/commit/ce3279acc78130cc1be5495da5108347b8c797d6))
* update gitHead fields in package.json for version tracking ([1ddc2ff](https://github.com/brunos3d/expozr/commit/1ddc2ffc6794437333543647f5d6866233c01a56))
* update gitHead references across all package.json files ([90e508d](https://github.com/brunos3d/expozr/commit/90e508d7d66060afd36d394187f8c876a4a76e8e))


### Features

* add publishConfig for public access to all packages ([572f332](https://github.com/brunos3d/expozr/commit/572f332aaaef874ba8820338c11cf5e80c47a3ee))
* add UMD example with auto-loader and enhance core module system ([fd852f4](https://github.com/brunos3d/expozr/commit/fd852f40574924e2b75c069d475687f59e4c70dc))
* major refactoring of @expozr/core package and webpack adapter compatibility fixes ([81ea9e5](https://github.com/brunos3d/expozr/commit/81ea9e5f8d98358704434213d097bdcb4209d5bc))
* **react:** add react utility package ([3286c1a](https://github.com/brunos3d/expozr/commit/3286c1a917dd66acdd4a361e3c4180f000b4b4cc))


### BREAKING CHANGES

* Complete restructure of @expozr/core package for better organization

## 🚀 Core Package Refactoring (@expozr/core v1.3.0)

### New Modular Structure:
- `/adapters/` - Bundler adapters (AbstractBundlerAdapter, InventoryGenerator, etc.)
- `/loaders/` - Module loaders (ESMModuleLoader, UMDModuleLoader, etc.)
- `/config/` - Configuration utilities (presets, schemas, validation)
- `/utils/` - Utility classes (ValidationUtils, ChecksumUtils, UrlUtils, etc.)

### Key Improvements:
- **Utility Classes**: Organized functions into logical classes for better maintainability
- **Enhanced Documentation**: Comprehensive JSDoc comments throughout
- **Better Type Safety**: Improved TypeScript types and error handling
- **Tree-shaking Friendly**: Modular exports for optimal bundle sizes
- **100% Backward Compatibility**: All existing imports continue to work

### Technical Changes:
- Moved validation functions to `ValidationUtils` class
- Created `ChecksumUtils` for checksum generation
- Added `UrlUtils`, `VersionUtils`, `ObjectUtils` classes
- Refactored bundler adapters into dedicated modules
- Enhanced configuration management with presets

## 🔧 Webpack Adapter Fixes (@expozr/webpack-adapter v1.2.1)

### Bug Fixes:
- Fixed import paths after core package refactoring
- Updated function calls to use new utility classes:
  - `validateExpozrConfig` → `ValidationUtils.validateExpozrConfig`
  - `generateChecksum` → `ChecksumUtils.generateAsync`
  - `deepMerge` → `ObjectUtils.deepMerge`
- Resolved MODULE_NOT_FOUND errors in webpack remote applications
- Ensured proper dependency linking in monorepo setup

### Files Modified:
- `packages/adapters/webpack/src/expozr-plugin.ts`
- `packages/adapters/webpack/src/host-plugin.ts`
- `packages/adapters/webpack/src/adapter.ts`

## 📚 Documentation:
- Added comprehensive `REFACTORING.md` with migration guide
- Updated CHANGELOG.md files for both packages
- Enhanced inline documentation across all modules

## ✅ Testing:
- All packages build successfully
- Webpack remote applications working correctly
- Backward compatibility maintained
- Examples tested and functional

This refactoring significantly improves code organization, maintainability, and developer experience while ensuring all existing functionality continues to work seamlessly.





# 1.3.0 (2025-10-13)

### Features

- **refactor:** comprehensive package restructure for better organization ([#major](https://github.com/brunos3d/expozr/commit/refactor))
  - Organized code into modular directories: `/adapters`, `/loaders`, `/config`, `/utils`
  - Created utility classes: `ValidationUtils`, `ChecksumUtils`, `UrlUtils`, `VersionUtils`, `ObjectUtils`
  - Enhanced documentation with comprehensive JSDoc comments
  - Improved type safety and error handling
  - Maintained 100% backward compatibility through re-exports

### Bug Fixes

- **webpack-adapter:** fix import paths after core package refactoring
  - Updated function imports to use new utility classes
  - Fixed MODULE_NOT_FOUND errors in webpack remote applications
  - Ensured proper dependency linking in monorepo setup

### Documentation

- add comprehensive REFACTORING.md with migration guide and technical details
- enhanced inline documentation across all modules

# 1.2.0 (2025-10-11)

### Bug Fixes

- add [@vite-ignore](https://github.com/vite-ignore) comments for dynamic imports in loaders ([ce3279a](https://github.com/brunos3d/expozr/commit/ce3279acc78130cc1be5495da5108347b8c797d6))
- update gitHead references across all package.json files ([90e508d](https://github.com/brunos3d/expozr/commit/90e508d7d66060afd36d394187f8c876a4a76e8e))

### Features

- add publishConfig for public access to all packages ([572f332](https://github.com/brunos3d/expozr/commit/572f332aaaef874ba8820338c11cf5e80c47a3ee))
- add UMD example with auto-loader and enhance core module system ([fd852f4](https://github.com/brunos3d/expozr/commit/fd852f40574924e2b75c069d475687f59e4c70dc))
- **react:** add react utility package ([3286c1a](https://github.com/brunos3d/expozr/commit/3286c1a917dd66acdd4a361e3c4180f000b4b4cc))

# 1.1.0 (2025-10-09)

### Features

- **react:** add react utility package ([3286c1a](https://github.com/brunos3d/expozr/commit/3286c1a917dd66acdd4a361e3c4180f000b4b4cc))
