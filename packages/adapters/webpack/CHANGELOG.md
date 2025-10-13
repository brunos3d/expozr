# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 1.2.1 (2025-10-13)

### Bug Fixes

* **compatibility:** update imports to work with refactored @expozr/core package
  - Fixed function imports to use new utility classes (ValidationUtils, ChecksumUtils, etc.)
  - Resolved MODULE_NOT_FOUND errors after core package restructure
  - Updated expozr-plugin.ts, host-plugin.ts to use proper utility class methods
  - Ensured webpack remote applications work correctly with new core structure

# 1.2.0 (2025-10-11)


### Bug Fixes

* update gitHead references across all package.json files ([90e508d](https://github.com/brunos3d/expozr/commit/90e508d7d66060afd36d394187f8c876a4a76e8e))


### Features

* add ESM host and remote application examples with Webpack configuration ([5e80484](https://github.com/brunos3d/expozr/commit/5e80484f3b3f276e236206b3ba6430cadcd891ba))
* add publishConfig for public access to all packages ([572f332](https://github.com/brunos3d/expozr/commit/572f332aaaef874ba8820338c11cf5e80c47a3ee))
* add UMD example with auto-loader and enhance core module system ([fd852f4](https://github.com/brunos3d/expozr/commit/fd852f40574924e2b75c069d475687f59e4c70dc))
* add Vite adapter for Expozr ecosystem ([9d4ebf2](https://github.com/brunos3d/expozr/commit/9d4ebf2803f5f056cde4edd7ee558a02bf6a8ef6))
* **react:** add react utility package ([3286c1a](https://github.com/brunos3d/expozr/commit/3286c1a917dd66acdd4a361e3c4180f000b4b4cc))
* **react:** restructure example app with new entry point and improved component loading ([ae41c75](https://github.com/brunos3d/expozr/commit/ae41c75c554a5112b26239f7f8c5ba4083285dab))





# 1.1.0 (2025-10-09)


### Features

* **react:** add react utility package ([3286c1a](https://github.com/brunos3d/expozr/commit/3286c1a917dd66acdd4a361e3c4180f000b4b4cc))
* **react:** restructure example app with new entry point and improved component loading ([ae41c75](https://github.com/brunos3d/expozr/commit/ae41c75c554a5112b26239f7f8c5ba4083285dab))
