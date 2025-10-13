/**
 * Init command - Initialize new Expozr projects
 */

import * as fs from "fs";
import * as path from "path";
import inquirer from "inquirer";
import chalk from "chalk";
import { defineExpozrConfig, defineHostConfig } from "@expozr/core";

export async function initCommand(type: string, name: string, options: any) {
  console.log(
    chalk.blue(`\n🚀 Initializing ${type} project: ${chalk.bold(name)}\n`)
  );

  const targetDir = options.directory || name;
  const targetPath = path.resolve(process.cwd(), targetDir);

  // Check if directory exists
  if (fs.existsSync(targetPath)) {
    const { overwrite } = await inquirer.prompt([
      {
        type: "confirm",
        name: "overwrite",
        message: `Directory ${targetDir} already exists. Overwrite?`,
        default: false,
      },
    ]);

    if (!overwrite) {
      console.log(chalk.yellow("Operation cancelled."));
      return;
    }
  }

  try {
    // Create directory
    fs.mkdirSync(targetPath, { recursive: true });

    if (type === "expozr") {
      await initExpozr(name, targetPath, options);
    } else if (type === "host") {
      await initHost(name, targetPath, options);
    } else {
      throw new Error(`Unknown project type: ${type}. Use 'expozr' or 'host'.`);
    }

    console.log(chalk.green(`\n✅ Successfully initialized ${type} project!`));
    console.log(chalk.gray(`\nNext steps:`));
    console.log(chalk.gray(`  cd ${targetDir}`));
    console.log(chalk.gray(`  npm install`));
    console.log(chalk.gray(`  npm run dev`));
  } catch (error) {
    console.error(
      chalk.red("Error initializing project:"),
      (error as Error).message
    );
    process.exit(1);
  }
}

async function initExpozr(name: string, targetPath: string, options: any) {
  const packageJson = {
    name: name,
    version: "1.0.0",
    description: "Expozr expozr project",
    main: "dist/index.js",
    scripts: {
      build: "webpack --mode production",
      dev: "webpack --mode development --watch",
      start: "webpack serve --mode development",
    },
    devDependencies: {
      "@expozr/webpack-adapter": "^0.1.0",
      webpack: "^5.0.0",
      "webpack-cli": "^5.0.0",
      "webpack-dev-server": "^4.0.0",
      typescript: "^5.0.0",
      "ts-loader": "^9.0.0",
    },
    dependencies: {},
  };

  const expozrConfig = defineExpozrConfig({
    name: name,
    version: "1.0.0",
    expose: {
      "./hello": "./src/hello.ts",
    },
    metadata: {
      description: "Example Expozr expozr",
      author: "Your Name",
      license: "MIT",
    },
  });

  const webpackConfig = `
const { createExpozrPlugin } = require('@expozr/webpack-adapter');

module.exports = {
  entry: './src/index.ts',
  mode: 'production',
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    createExpozrPlugin(),
  ],
};
`;

  const tsConfig = {
    compilerOptions: {
      target: "ES2020",
      module: "ESNext",
      moduleResolution: "node",
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      declaration: true,
      outDir: "./dist",
      rootDir: "./src",
    },
    include: ["src/**/*"],
    exclude: ["node_modules", "dist"],
  };

  const helloExample = `
export function hello(name: string = 'World'): string {
  return \`Hello, \${name}! From Expozr expozr "\${require('../package.json').name}"\`;
}

export default hello;
`;

  const indexFile = `
export { hello } from './hello';
`;

  // Write files
  fs.writeFileSync(
    path.join(targetPath, "package.json"),
    JSON.stringify(packageJson, null, 2)
  );
  fs.writeFileSync(
    path.join(targetPath, "expozr.config.js"),
    `module.exports = ${JSON.stringify(expozrConfig, null, 2)};`
  );
  fs.writeFileSync(path.join(targetPath, "webpack.config.js"), webpackConfig);
  fs.writeFileSync(
    path.join(targetPath, "tsconfig.json"),
    JSON.stringify(tsConfig, null, 2)
  );

  // Create src directory
  fs.mkdirSync(path.join(targetPath, "src"));
  fs.writeFileSync(path.join(targetPath, "src", "hello.ts"), helloExample);
  fs.writeFileSync(path.join(targetPath, "src", "index.ts"), indexFile);

  // Create README
  const readme = `
# ${name}

An Expozr expozr project.

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
\`\`\`

## Configuration

Edit \`expozr.config.js\` to configure what modules to expose.
`;

  fs.writeFileSync(path.join(targetPath, "README.md"), readme);
}

async function initHost(name: string, targetPath: string, options: any) {
  const packageJson = {
    name: name,
    version: "1.0.0",
    description: "Expozr host project",
    main: "dist/index.js",
    scripts: {
      build: "webpack --mode production",
      dev: "webpack --mode development --watch",
      start: "webpack serve --mode development",
    },
    devDependencies: {
      "@expozr/webpack-adapter": "^0.1.0",
      "@expozr/navigator": "^0.1.0",
      webpack: "^5.0.0",
      "webpack-cli": "^5.0.0",
      "webpack-dev-server": "^4.0.0",
      typescript: "^5.0.0",
      "ts-loader": "^9.0.0",
      "html-webpack-plugin": "^5.0.0",
    },
    dependencies: {},
  };

  const hostConfig = defineHostConfig({
    expozrs: {
      // Example expozr - users should add their own
      // 'my-components': {
      //   url: 'https://cdn.example.com/my-components',
      //   version: '^1.0.0'
      // }
    },
    cache: {
      strategy: "memory",
      ttl: 3600000,
    },
  });

  const webpackConfig = `
const { createHostPlugin } = require('@expozr/webpack-adapter');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.ts',
  mode: 'development',
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    createHostPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
  ],
  devServer: {
    port: 3000,
    open: true,
  },
};
`;

  const appExample = `
import { createNavigator } from '@expozr/navigator';

async function main() {
  const navigator = createNavigator({
    expozrs: {
      // Add expozr configurations here
    }
  });

  console.log('🏠 Expozr host application started!');
  console.log('Add expozrs to expozr.host.config.js to start loading remote modules.');

  // Example of loading a module (uncomment when you have expozrs configured):
  // try {
  //   const hello = await navigator.loadCargo('my-expozr', 'hello');
  //   console.log(hello.module('Expozr'));
  // } catch (error) {
  //   console.error('Failed to load module:', error);
  // }
}

main().catch(console.error);
`;

  const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${name}</title>
</head>
<body>
    <div id="app">
        <h1>🏠 Expozr Host Application</h1>
        <p>Check the console for logs!</p>
    </div>
</body>
</html>
`;

  // Write files
  fs.writeFileSync(
    path.join(targetPath, "package.json"),
    JSON.stringify(packageJson, null, 2)
  );
  fs.writeFileSync(
    path.join(targetPath, "expozr.host.config.js"),
    `module.exports = ${JSON.stringify(hostConfig, null, 2)};`
  );
  fs.writeFileSync(path.join(targetPath, "webpack.config.js"), webpackConfig);

  // Create src directory
  fs.mkdirSync(path.join(targetPath, "src"));
  fs.writeFileSync(path.join(targetPath, "src", "index.ts"), appExample);
  fs.writeFileSync(path.join(targetPath, "src", "index.html"), htmlTemplate);

  // Create README
  const readme = `
# ${name}

An Expozr host application.

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm start
\`\`\`

## Adding Expozrs

Edit \`expozr.host.config.js\` to add expozr configurations:

\`\`\`javascript
module.exports = {
  expozrs: {
    'my-components': {
      url: 'https://cdn.example.com/my-components',
      version: '^1.0.0'
    }
  }
};
\`\`\`

Then use the Navigator to load modules in your application.
`;

  fs.writeFileSync(path.join(targetPath, "README.md"), readme);
}
