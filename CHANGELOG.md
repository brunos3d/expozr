# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 2.1.0 (2025-10-15)


### Bug Fixes

* add [@vite-ignore](https://github.com/vite-ignore) comments for dynamic imports in loaders ([ce3279a](https://github.com/brunos3d/expozr/commit/ce3279acc78130cc1be5495da5108347b8c797d6))
* add gitHead field to package.json for version tracking ([53c3d5c](https://github.com/brunos3d/expozr/commit/53c3d5c56435b2b6fd405cc3b39b091a3523f603))
* adjust console output styling for better visibility ([694ab18](https://github.com/brunos3d/expozr/commit/694ab18e08e92c7e692814c933a822cea78176ea))
* move dependencies section to the correct location in expozr.config.ts ([184dbd7](https://github.com/brunos3d/expozr/commit/184dbd7d8ce574d0844f5b3b177d8dd0be6d7902))
* remove Type Safety references from README.md ([177593a](https://github.com/brunos3d/expozr/commit/177593a41fa96074023a9bb1c01df64c4a357950))
* revert version numbers to 0.1.0 in lerna.json and update package-lock.json to 1.1.0 for dependencies ([8d30343](https://github.com/brunos3d/expozr/commit/8d30343bcc5c5751d4922392cb245f4701ab6e74))
* update @expozr/vite-adapter version to 1.1.0 in package.json and package-lock.json ([edcee38](https://github.com/brunos3d/expozr/commit/edcee38fa4806c07f0396a7b6dc422cf3a3ddd89))
* update application title to reflect Vite integration and add warning suppression in webpack config ([85be479](https://github.com/brunos3d/expozr/commit/85be479a03fe7ca75165d228132ab4b5b5b47e6c))
* update gitHead field in package.json and add ignore rule in lerna.json ([cf5db85](https://github.com/brunos3d/expozr/commit/cf5db85d49bd438d2b48df25325f5d58aeacfab3))
* update gitHead fields in package.json for version tracking ([1ddc2ff](https://github.com/brunos3d/expozr/commit/1ddc2ffc6794437333543647f5d6866233c01a56))
* update gitHead references across all package.json files ([90e508d](https://github.com/brunos3d/expozr/commit/90e508d7d66060afd36d394187f8c876a4a76e8e))
* update script references from bundle.js to main.js in HTML and TypeScript files ([9858c15](https://github.com/brunos3d/expozr/commit/9858c15ac72a8b2b8e99a3dace9f0dea4b889613))
* update version number to 0.1.0 in lerna.json ([df4d563](https://github.com/brunos3d/expozr/commit/df4d563d1bdd4651cd3129bcac6b5c12e5179f71))
* update vite adapter and navigator imports after core refactoring ([22e4c6b](https://github.com/brunos3d/expozr/commit/22e4c6bd57a904e76b26237aa99e340919fafd11))
* update Vite adapter status to ready and gitHead in package.json ([ee98d84](https://github.com/brunos3d/expozr/commit/ee98d84f460e40c7f4051147b38329a595c8090f))


### Features

* add dependencies section to README.md and restructure host configuration example ([a6ef1ec](https://github.com/brunos3d/expozr/commit/a6ef1ecb39e76df998b64a7ddeed1fee68f5a367))
* add ESM host and remote application examples with Webpack configuration ([5e80484](https://github.com/brunos3d/expozr/commit/5e80484f3b3f276e236206b3ba6430cadcd891ba))
* Add ExpozrHostPlugin for handling remote module consumption in Webpack ([8dba43f](https://github.com/brunos3d/expozr/commit/8dba43fe9ee5688e8477285bd03e81b9ac9d17cc))
* add publishConfig for public access to all packages ([572f332](https://github.com/brunos3d/expozr/commit/572f332aaaef874ba8820338c11cf5e80c47a3ee))
* add script to update example package.json files with current Lerna versions ([a1d013e](https://github.com/brunos3d/expozr/commit/a1d013e2062003544c3d4d55bc0835d829542747))
* add UMD example with auto-loader and enhance core module system ([fd852f4](https://github.com/brunos3d/expozr/commit/fd852f40574924e2b75c069d475687f59e4c70dc))
* add Vite adapter for Expozr ecosystem ([9d4ebf2](https://github.com/brunos3d/expozr/commit/9d4ebf2803f5f056cde4edd7ee558a02bf6a8ef6))
* Create adapter SDK and refactor bundler adapters ([9387988](https://github.com/brunos3d/expozr/commit/938798833369f6a5268008bc5965cef8dd9d5dd0))
* enable automatic module discovery and enhance button component with new styles and sizes ([2542ec3](https://github.com/brunos3d/expozr/commit/2542ec3a427c7da8b8c629cc3fa10f3af9b77fcb))
* enhance LoadOptions interface with advanced loading controls and detailed documentation ([fd3aa16](https://github.com/brunos3d/expozr/commit/fd3aa16d30c71547f0d25de9cb1eeb304969d047))
* implement standardized global binding structure for UMD and ESM modules ([a1f2f8d](https://github.com/brunos3d/expozr/commit/a1f2f8d4d4297b9fabf2d77cb06644fe270cffc4))
* log remote utils cargo in ESM host initialization ([ada1428](https://github.com/brunos3d/expozr/commit/ada1428fd79612e994dcfff7a577b4923117a811))
* major refactoring of @expozr/core package and webpack adapter compatibility fixes ([81ea9e5](https://github.com/brunos3d/expozr/commit/81ea9e5f8d98358704434213d097bdcb4209d5bc))
* **react:** add react utility package ([3286c1a](https://github.com/brunos3d/expozr/commit/3286c1a917dd66acdd4a361e3c4180f000b4b4cc))
* **react:** restructure example app with new entry point and improved component loading ([ae41c75](https://github.com/brunos3d/expozr/commit/ae41c75c554a5112b26239f7f8c5ba4083285dab))
* **remote-app:** add initial setup for remote TypeScript application with Webpack ([01bb1a9](https://github.com/brunos3d/expozr/commit/01bb1a9a33e006c402cf06c422131497f5ad3ae7))
* update ESM host initialization and remote URL handling; enhance status logging ([7a84542](https://github.com/brunos3d/expozr/commit/7a8454239ee2e6123881a4cb8ca0ffbe98dae1bd))
* **webpack:** add README for @expozr/webpack-adapter with detailed usage and configuration instructions ([e89341d](https://github.com/brunos3d/expozr/commit/e89341d0d1800be8876efe581a29da860d83b592))


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
* add gitHead field to package.json for version tracking ([53c3d5c](https://github.com/brunos3d/expozr/commit/53c3d5c56435b2b6fd405cc3b39b091a3523f603))
* adjust console output styling for better visibility ([694ab18](https://github.com/brunos3d/expozr/commit/694ab18e08e92c7e692814c933a822cea78176ea))
* move dependencies section to the correct location in expozr.config.ts ([184dbd7](https://github.com/brunos3d/expozr/commit/184dbd7d8ce574d0844f5b3b177d8dd0be6d7902))
* remove Type Safety references from README.md ([177593a](https://github.com/brunos3d/expozr/commit/177593a41fa96074023a9bb1c01df64c4a357950))
* revert version numbers to 0.1.0 in lerna.json and update package-lock.json to 1.1.0 for dependencies ([8d30343](https://github.com/brunos3d/expozr/commit/8d30343bcc5c5751d4922392cb245f4701ab6e74))
* update @expozr/vite-adapter version to 1.1.0 in package.json and package-lock.json ([edcee38](https://github.com/brunos3d/expozr/commit/edcee38fa4806c07f0396a7b6dc422cf3a3ddd89))
* update application title to reflect Vite integration and add warning suppression in webpack config ([85be479](https://github.com/brunos3d/expozr/commit/85be479a03fe7ca75165d228132ab4b5b5b47e6c))
* update gitHead field in package.json and add ignore rule in lerna.json ([cf5db85](https://github.com/brunos3d/expozr/commit/cf5db85d49bd438d2b48df25325f5d58aeacfab3))
* update gitHead fields in package.json for version tracking ([1ddc2ff](https://github.com/brunos3d/expozr/commit/1ddc2ffc6794437333543647f5d6866233c01a56))
* update gitHead references across all package.json files ([90e508d](https://github.com/brunos3d/expozr/commit/90e508d7d66060afd36d394187f8c876a4a76e8e))
* update script references from bundle.js to main.js in HTML and TypeScript files ([9858c15](https://github.com/brunos3d/expozr/commit/9858c15ac72a8b2b8e99a3dace9f0dea4b889613))
* update version number to 0.1.0 in lerna.json ([df4d563](https://github.com/brunos3d/expozr/commit/df4d563d1bdd4651cd3129bcac6b5c12e5179f71))
* update vite adapter and navigator imports after core refactoring ([22e4c6b](https://github.com/brunos3d/expozr/commit/22e4c6bd57a904e76b26237aa99e340919fafd11))
* update Vite adapter status to ready and gitHead in package.json ([ee98d84](https://github.com/brunos3d/expozr/commit/ee98d84f460e40c7f4051147b38329a595c8090f))


### Features

* add dependencies section to README.md and restructure host configuration example ([a6ef1ec](https://github.com/brunos3d/expozr/commit/a6ef1ecb39e76df998b64a7ddeed1fee68f5a367))
* add ESM host and remote application examples with Webpack configuration ([5e80484](https://github.com/brunos3d/expozr/commit/5e80484f3b3f276e236206b3ba6430cadcd891ba))
* add publishConfig for public access to all packages ([572f332](https://github.com/brunos3d/expozr/commit/572f332aaaef874ba8820338c11cf5e80c47a3ee))
* add UMD example with auto-loader and enhance core module system ([fd852f4](https://github.com/brunos3d/expozr/commit/fd852f40574924e2b75c069d475687f59e4c70dc))
* add Vite adapter for Expozr ecosystem ([9d4ebf2](https://github.com/brunos3d/expozr/commit/9d4ebf2803f5f056cde4edd7ee558a02bf6a8ef6))
* major refactoring of @expozr/core package and webpack adapter compatibility fixes ([81ea9e5](https://github.com/brunos3d/expozr/commit/81ea9e5f8d98358704434213d097bdcb4209d5bc))
* **react:** add react utility package ([3286c1a](https://github.com/brunos3d/expozr/commit/3286c1a917dd66acdd4a361e3c4180f000b4b4cc))
* **react:** restructure example app with new entry point and improved component loading ([ae41c75](https://github.com/brunos3d/expozr/commit/ae41c75c554a5112b26239f7f8c5ba4083285dab))
* **remote-app:** add initial setup for remote TypeScript application with Webpack ([01bb1a9](https://github.com/brunos3d/expozr/commit/01bb1a9a33e006c402cf06c422131497f5ad3ae7))


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





# 1.2.0 (2025-10-11)


### Bug Fixes

* add [@vite-ignore](https://github.com/vite-ignore) comments for dynamic imports in loaders ([ce3279a](https://github.com/brunos3d/expozr/commit/ce3279acc78130cc1be5495da5108347b8c797d6))
* add gitHead field to package.json for version tracking ([53c3d5c](https://github.com/brunos3d/expozr/commit/53c3d5c56435b2b6fd405cc3b39b091a3523f603))
* adjust console output styling for better visibility ([694ab18](https://github.com/brunos3d/expozr/commit/694ab18e08e92c7e692814c933a822cea78176ea))
* move dependencies section to the correct location in expozr.config.ts ([184dbd7](https://github.com/brunos3d/expozr/commit/184dbd7d8ce574d0844f5b3b177d8dd0be6d7902))
* remove Type Safety references from README.md ([177593a](https://github.com/brunos3d/expozr/commit/177593a41fa96074023a9bb1c01df64c4a357950))
* revert version numbers to 0.1.0 in lerna.json and update package-lock.json to 1.1.0 for dependencies ([8d30343](https://github.com/brunos3d/expozr/commit/8d30343bcc5c5751d4922392cb245f4701ab6e74))
* update @expozr/vite-adapter version to 1.1.0 in package.json and package-lock.json ([edcee38](https://github.com/brunos3d/expozr/commit/edcee38fa4806c07f0396a7b6dc422cf3a3ddd89))
* update application title to reflect Vite integration and add warning suppression in webpack config ([85be479](https://github.com/brunos3d/expozr/commit/85be479a03fe7ca75165d228132ab4b5b5b47e6c))
* update gitHead field in package.json and add ignore rule in lerna.json ([cf5db85](https://github.com/brunos3d/expozr/commit/cf5db85d49bd438d2b48df25325f5d58aeacfab3))
* update gitHead references across all package.json files ([90e508d](https://github.com/brunos3d/expozr/commit/90e508d7d66060afd36d394187f8c876a4a76e8e))
* update script references from bundle.js to main.js in HTML and TypeScript files ([9858c15](https://github.com/brunos3d/expozr/commit/9858c15ac72a8b2b8e99a3dace9f0dea4b889613))
* update version number to 0.1.0 in lerna.json ([df4d563](https://github.com/brunos3d/expozr/commit/df4d563d1bdd4651cd3129bcac6b5c12e5179f71))
* update Vite adapter status to ready and gitHead in package.json ([ee98d84](https://github.com/brunos3d/expozr/commit/ee98d84f460e40c7f4051147b38329a595c8090f))


### Features

* add dependencies section to README.md and restructure host configuration example ([a6ef1ec](https://github.com/brunos3d/expozr/commit/a6ef1ecb39e76df998b64a7ddeed1fee68f5a367))
* add ESM host and remote application examples with Webpack configuration ([5e80484](https://github.com/brunos3d/expozr/commit/5e80484f3b3f276e236206b3ba6430cadcd891ba))
* add publishConfig for public access to all packages ([572f332](https://github.com/brunos3d/expozr/commit/572f332aaaef874ba8820338c11cf5e80c47a3ee))
* add UMD example with auto-loader and enhance core module system ([fd852f4](https://github.com/brunos3d/expozr/commit/fd852f40574924e2b75c069d475687f59e4c70dc))
* add Vite adapter for Expozr ecosystem ([9d4ebf2](https://github.com/brunos3d/expozr/commit/9d4ebf2803f5f056cde4edd7ee558a02bf6a8ef6))
* **react:** add react utility package ([3286c1a](https://github.com/brunos3d/expozr/commit/3286c1a917dd66acdd4a361e3c4180f000b4b4cc))
* **react:** restructure example app with new entry point and improved component loading ([ae41c75](https://github.com/brunos3d/expozr/commit/ae41c75c554a5112b26239f7f8c5ba4083285dab))
* **remote-app:** add initial setup for remote TypeScript application with Webpack ([01bb1a9](https://github.com/brunos3d/expozr/commit/01bb1a9a33e006c402cf06c422131497f5ad3ae7))





# 1.1.0 (2025-10-09)


### Bug Fixes

* update version number to 0.1.0 in lerna.json ([df4d563](https://github.com/brunos3d/expozr/commit/df4d563d1bdd4651cd3129bcac6b5c12e5179f71))


### Features

* **react:** add react utility package ([3286c1a](https://github.com/brunos3d/expozr/commit/3286c1a917dd66acdd4a361e3c4180f000b4b4cc))
* **react:** restructure example app with new entry point and improved component loading ([ae41c75](https://github.com/brunos3d/expozr/commit/ae41c75c554a5112b26239f7f8c5ba4083285dab))
