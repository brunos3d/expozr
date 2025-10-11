# UMD Remote - Math Utils Expozr

This is a UMD (Universal Module Definition) remote application that exposes mathematical utility functions for consumption by host applications using Expozr.

## 📋 Features

### Calculator Module (`./calculator`)

- **Basic Operations**: add, subtract, multiply, divide
- **Calculator Class**: Chainable operations with state management
- **Error Handling**: Input validation and divide-by-zero protection

### Advanced Module (`./advanced`)

- **Power & Roots**: power, sqrt functions
- **Factorial**: factorial calculation
- **Utilities**: percentage, round functions
- **Comprehensive Validation**: Type and range checking

## 🚀 Quick Start

### Development Server

```bash
# Install dependencies
npm install

# Start development server on port 3001
npm run dev
```

This starts the UMD expozr server that exposes math functions at `http://localhost:3001/`

### Production Build

```bash
# Build for production
npm run build
```

## 📡 Exposed Functions

### Calculator Functions

```javascript
// Basic math operations
add(5, 3); // Returns: 8
subtract(10, 4); // Returns: 6
multiply(3, 7); // Returns: 21
divide(15, 3); // Returns: 5

// Calculator class for chaining
const calc = new Calculator(10)
  .add(5) // 15
  .multiply(2) // 30
  .divide(3) // 10
  .getValue(); // Returns: 10
```

### Advanced Functions

```javascript
// Advanced operations
power(2, 3); // Returns: 8
sqrt(16); // Returns: 4
factorial(5); // Returns: 120
percentage(200, 15); // Returns: 30
round(3.14159, 2); // Returns: 3.14
```

## 🔗 Usage in Host Applications

### Loading via Expozr Navigator

```javascript
import { createNavigator } from "@expozr/navigator";

const navigator = createNavigator({
  expozrs: {
    "math-utils": {
      url: "http://localhost:3001/",
    },
  },
});

// Load calculator functions
const calculator = await navigator.loadCargo("math-utils", "./calculator");
const { add, subtract, Calculator } = calculator.module;

// Load advanced functions
const advanced = await navigator.loadCargo("math-utils", "./advanced");
const { power, sqrt, factorial } = advanced.module;
```

### Direct UMD Loading

```html
<!-- Load via script tag -->
<script src="http://localhost:3001/calculator.js"></script>
<script src="http://localhost:3001/advanced.js"></script>

<script>
  // Functions are available globally
  console.log("5 + 3 =", add(5, 3));
  console.log("2^8 =", power(2, 8));
</script>
```

## 🏗️ Architecture

### File Structure

```
src/
├── calculator.ts    # Basic math operations
└── advanced.ts      # Advanced math functions

Configuration:
├── expozr.config.ts # Expozr configuration
├── webpack.config.js # Webpack build setup
├── tsconfig.json    # TypeScript configuration
└── package.json     # Dependencies and scripts
```

### UMD Module Format

- **Universal Compatibility**: Works in browsers, Node.js, and AMD environments
- **Global Variables**: Functions available on window object in browsers
- **Module Exports**: Compatible with CommonJS and ES modules
- **No External Dependencies**: Self-contained modules

## 🧪 Testing the Remote

### Manual Testing

1. Start the development server: `npm run dev`
2. Open browser console at `http://localhost:3001`
3. Test functions directly:

   ```javascript
   // Test calculator functions
   console.log(add(10, 5));
   console.log(new Calculator(0).add(10).multiply(2).getValue());

   // Test advanced functions
   console.log(power(2, 10));
   console.log(factorial(5));
   ```

### Inventory Check

Visit `http://localhost:3001/expozr.inventory.json` to see exposed modules.

## 🎯 Next Steps

This remote is designed to be consumed by the [UMD Host example](../host/README.md).

1. Start this remote: `npm run dev` (port 3001)
2. Start the host application: `cd ../host && npm run dev` (port 3000)
3. Use the calculator in the host application

## 🔧 Configuration

The expozr is configured in `expozr.config.ts`:

- **UMD Format**: Optimized for universal compatibility
- **Multiple Entries**: Separate modules for different functionalities
- **Development-Friendly**: Source maps and readable output
- **CORS-Enabled**: Ready for cross-origin consumption
