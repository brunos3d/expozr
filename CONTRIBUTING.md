# 🤝 Contributing to Expozr

Thank you for considering contributing to Expozr! We're excited to build the future of module federation together. This guide will help you get started.

## 🎯 How to Contribute

There are many ways to contribute to Expozr:

- 🐛 **Report bugs** and submit feature requests
- 📖 **Improve documentation** and examples
- 🔧 **Submit code** for bug fixes and new features
- 🧪 **Write tests** to improve code coverage
- 💡 **Share ideas** and feedback in discussions
- 🌟 **Star the repo** and spread the word

## 🚀 Quick Start for Contributors

### Prerequisites

- **Node.js** 18+ and **npm** 8+
- **Git** for version control
- Familiarity with **TypeScript** and **Webpack**

### Setting Up the Development Environment

1. **Fork and clone the repository:**

```bash
git clone https://github.com/YOUR_USERNAME/expozr.git
cd expozr
```

2. **Install dependencies:**

```bash
npm install
```

3. **Build all packages:**

```bash
npm run build
```

4. **Run tests:**

```bash
npm test
```

5. **Start development mode:**

```bash
npm run dev
```

### Project Structure

```
expozr/
├── packages/
│   ├── core/                    # Core abstractions and types
│   ├── navigator/               # Runtime loader system
│   ├── react/                   # React utilities
│   ├── cli/                     # Command line tools
│   └── adapters/
│       └── webpack/             # Webpack adapter
├── examples/
│   └── webpack/
│       ├── vanilla/             # Vanilla JS examples
│       └── react/               # React examples
├── docs/                        # Documentation (future)
└── scripts/                     # Build and development scripts
```

## 📝 Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

### 2. Make Changes

- Follow our coding standards (see below)
- Write or update tests as needed
- Update documentation if necessary

### 3. Test Your Changes

```bash
# Run all tests
npm test

# Run linting
npm run lint

# Type checking
npm run typecheck

# Test examples
cd examples/webpack/vanilla/remote && npm run dev
# In another terminal:
cd examples/webpack/vanilla/host && npm run dev
```

### 4. Commit Your Changes

We use [Conventional Commits](https://www.conventionalcommits.org/) for consistent commit messages:

```bash
git commit -m "feat: add new warehouse configuration option"
git commit -m "fix: resolve module loading issue in React components"
git commit -m "docs: update README with new examples"
git commit -m "test: add unit tests for navigator cache"
```

**Commit Types:**

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `test:` - Adding or updating tests
- `refactor:` - Code refactoring
- `style:` - Code style changes (formatting, etc.)
- `chore:` - Build process or auxiliary tool changes

### 5. Push and Create Pull Request

```bash
git push origin your-branch-name
```

Then create a Pull Request on GitHub with:

- Clear title and description
- Reference to any related issues
- Screenshots for UI changes
- Test instructions for reviewers

## 🧪 Testing Guidelines

### Running Tests

```bash
# All packages
npm test

# Specific package
cd packages/core && npm test

# Watch mode
npm test -- --watch
```

### Writing Tests

- Write unit tests for all new functionality
- Follow the existing test patterns in each package
- Use descriptive test names: `should load React component from warehouse`
- Test both success and error cases
- Mock external dependencies appropriately

### Test Structure

```typescript
describe("Navigator", () => {
  describe("loadWarehouse", () => {
    it("should successfully load warehouse inventory", async () => {
      // Arrange
      const mockInventory = {
        /* ... */
      };

      // Act
      const result = await navigator.loadWarehouse(url);

      // Assert
      expect(result).toEqual(expectedResult);
    });

    it("should handle network errors gracefully", async () => {
      // Test error scenarios
    });
  });
});
```

## 📋 Coding Standards

### TypeScript

- Use **strict TypeScript** - all packages have strict mode enabled
- Prefer **explicit types** over `any`
- Use **interfaces** for object shapes
- Export types that consumers might need
- Document complex types with JSDoc comments

```typescript
/**
 * Configuration for warehouse module exposure
 */
export interface ExposureConfig {
  /** Entry point for the module */
  entry: string;
  /** Named exports to expose */
  exports?: string[];
  /** Module dependencies */
  dependencies?: Record<string, string>;
}
```

### Code Style

We use **Prettier** and **ESLint** for consistent code formatting:

```bash
# Auto-format code
npm run lint -- --fix

# Check formatting
npm run lint
```

**Key Guidelines:**

- Use **2 spaces** for indentation
- **Single quotes** for strings
- **Trailing commas** in objects and arrays
- **Semicolons** at the end of statements
- **camelCase** for variables and functions
- **PascalCase** for classes and types

### File Naming

- **kebab-case** for file names: `warehouse-config.ts`
- **PascalCase** for components: `NavigatorProvider.tsx`
- **camelCase** for utilities: `loadModule.ts`

### Documentation

- Use **JSDoc** for all public APIs
- Include **examples** in documentation
- Document **complex algorithms** with inline comments
- Keep **README files** up to date in each package

````typescript
/**
 * Loads a module from a remote warehouse
 *
 * @param warehouseUrl - URL of the warehouse
 * @param moduleName - Name of the module to load
 * @returns Promise that resolves to the loaded module
 *
 * @example
 * ```typescript
 * const ButtonModule = await loadModule('http://localhost:3001', 'Button');
 * ```
 */
export async function loadModule(
  warehouseUrl: string,
  moduleName: string
): Promise<any> {
  // Implementation
}
````

## 📦 Package Development

### Creating New Packages

1. Create package directory: `packages/your-package/`
2. Copy `package.json` structure from existing packages
3. Set up TypeScript configuration
4. Add to root `package.json` workspaces
5. Update Lerna configuration if needed

### Package Structure

```
packages/your-package/
├── src/
│   ├── index.ts              # Main entry point
│   ├── types.ts              # Type definitions
│   └── utils.ts              # Utility functions
├── dist/                     # Built output (generated)
├── package.json              # Package configuration
├── tsconfig.json             # TypeScript config
├── rollup.config.js          # Build configuration
└── README.md                 # Package documentation
```

### Dependencies

- **Keep dependencies minimal** - only add what's truly needed
- **Pin dependency versions** to avoid version conflicts
- **Use peerDependencies** for framework integrations (React, Vue, etc.)
- **Prefer devDependencies** for build tools

## 🐛 Bug Reports

When reporting bugs, please include:

### Required Information

- **Expozr version** you're using
- **Node.js and npm versions**
- **Operating system** and version
- **Bundler** and version (Webpack, Vite, etc.)
- **Framework** if applicable (React, Vue, etc.)

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:

1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots/Code**
If applicable, add screenshots or code snippets.

**Environment:**

- Expozr version: [e.g. 0.1.0]
- Node.js version: [e.g. 18.17.0]
- Bundler: [e.g. Webpack 5.88.0]
- OS: [e.g. macOS 13.4]

**Additional context**
Any other context about the problem.
```

## 💡 Feature Requests

We love feature ideas! When suggesting new features:

### Consider

- **Is it aligned** with Expozr's core mission?
- **Would it benefit** the broader community?
- **Is it feasible** to implement and maintain?
- **Does it work** across different bundlers?

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
Other solutions or features you've considered.

**Additional context**
Screenshots, mockups, or examples of the feature.

**Implementation ideas**
If you have thoughts on how to implement this.
```

## 🚀 Release Process

### For Maintainers

1. **Update version** with Lerna: `npm run version`
2. **Review changelog** generated by conventional commits
3. **Create release notes** highlighting key changes
4. **Publish packages**: `npm run publish`
5. **Tag release** on GitHub with release notes
6. **Update documentation** if needed

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **Major** (1.0.0): Breaking changes
- **Minor** (0.1.0): New features (backwards compatible)
- **Patch** (0.0.1): Bug fixes

## 📚 Documentation

### Contributing to Docs

- **Keep examples working** and up to date
- **Write for beginners** - assume minimal prior knowledge
- **Include working code** that can be copy-pasted
- **Add context** about when/why to use features
- **Use clear headings** and structure

### Documentation Standards

- Use **Markdown** for all documentation
- Include **code examples** for all features
- Add **TypeScript types** in examples
- Link to **relevant examples** in the examples/ directory
- Keep **line length under 100 characters**

## 🏷️ Labels and Issue Management

### Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `question` - Further information is requested
- `duplicate` - This issue or PR already exists
- `wontfix` - This will not be worked on

### Priority Labels

- `priority: high` - Critical issues
- `priority: medium` - Important features
- `priority: low` - Nice to have

### Area Labels

- `area: core` - Core package issues
- `area: webpack` - Webpack adapter
- `area: react` - React utilities
- `area: cli` - CLI tools
- `area: examples` - Example applications
- `area: docs` - Documentation

## 🤔 Getting Help

### Questions and Discussions

- **GitHub Discussions** - For questions and community discussion
- **Issues** - For bug reports and feature requests
- **Discord** (coming soon) - For real-time chat

### Code Reviews

All contributions go through code review:

- **Be respectful** and constructive
- **Focus on the code**, not the person
- **Explain your reasoning** when requesting changes
- **Ask questions** if something is unclear
- **Appreciate the contribution** - say thanks!

## 🎉 Recognition

Contributors who help improve Expozr will be:

- **Listed in contributors** on GitHub
- **Mentioned in release notes** for significant contributions
- **Added to README** for major features
- **Invited to maintainer discussions** for regular contributors

## 📄 License

By contributing to Expozr, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Expozr! 🚀**

Every contribution, no matter how small, helps build a better developer experience for the entire community.

Got questions? Feel free to open an issue or start a discussion. We're here to help!
