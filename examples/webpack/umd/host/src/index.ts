/**
 * UMD Host Calculator Application
 *
 * This application demonstrates consuming UMD modules from a remote warehouse
 * using the Expozr navigator with automatic remote module loading.
 */

import "./styles.css";
import { createCalculatorApp } from "./calculator-helper";

// Remote module interfaces (optional - for TypeScript intellisense)
interface CalculatorModule {
  add: (a: number, b: number) => number;
  subtract: (a: number, b: number) => number;
  multiply: (a: number, b: number) => number;
  divide: (a: number, b: number) => number;
  Calculator: new (initialValue?: number) => any;
}

interface AdvancedModule {
  power: (base: number, exponent: number) => number;
  sqrt: (value: number) => number;
  factorial: (n: number) => number;
  percentage: (value: number, percentage: number) => number;
  round: (value: number, decimals?: number) => number;
}

/**
 * Calculator Application Class - Simplified with Auto-Loader
 */
class CalculatorApp {
  private loader: any = null;

  // Calculator state
  private currentValue: number = 0;
  private previousValue: number = 0;
  private operation: string | null = null;
  private waitingForOperand: boolean = false;

  // DOM elements
  private display: HTMLInputElement;
  private statusIndicator: HTMLElement;
  private statusText: HTMLElement;
  private moduleInfo: HTMLElement;

  constructor() {
    // Get DOM elements
    this.display = document.getElementById("display") as HTMLInputElement;
    this.statusIndicator = document.getElementById(
      "status-indicator"
    ) as HTMLElement;
    this.statusText = document.getElementById("status-text") as HTMLElement;
    this.moduleInfo = document.getElementById("module-info") as HTMLElement;

    // Initialize the application
    this.init();
  }

  /**
   * Initialize the calculator application with auto-federation
   */
  private async init(): Promise<void> {
    try {
      this.updateStatus("⏳", "Loading remote functions...");

      // Use the simplified calculator helper
      this.loader = await createCalculatorApp();

      // Setup global functions for HTML onclick handlers
      this.setupGlobalFunctions();

      // Update UI
      this.updateStatus("✅", "Connected to remote functions");
      this.showLoadedModules();

      console.log("🎉 Calculator app initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize calculator app:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.updateStatus(
        "❌",
        `Failed to load remote functions: ${errorMessage}`
      );
    }
  }

  /**
   * Setup global functions to be called from HTML
   */
  private setupGlobalFunctions(): void {
    // Create calculatorApp object with all required methods
    (window as any).calculatorApp = {
      // Basic calculator operations
      inputNumber: this.appendNumber.bind(this),
      handleOperation: this.setOperation.bind(this),
      calculate: this.calculate.bind(this),
      clearDisplay: this.clearDisplay.bind(this),
      handleBackspace: this.deleteLast.bind(this),
      clearEntry: this.clearEntry.bind(this),
      inputDecimal: this.inputDecimal.bind(this),

      // Advanced functions
      power: this.calculatePower.bind(this),
      sqrt: this.calculateSqrt.bind(this),
      factorial: this.calculateFactorial.bind(this),
      percentage: this.calculatePercentage.bind(this),
    };
  }

  /**
   * Update connection status in the UI
   */
  private updateStatus(indicator: string, text: string): void {
    this.statusIndicator.textContent = indicator;
    this.statusText.textContent = text;

    // Update status styling
    const statusElement = this.statusIndicator.parentElement;
    statusElement?.classList.remove("connected", "error");

    if (indicator === "✅") {
      statusElement?.classList.add("connected");
    } else if (indicator === "❌") {
      statusElement?.classList.add("error");
    }
  }

  /**
   * Show loaded modules information
   */
  private showLoadedModules(): void {
    if (!this.loader || this.loader.status !== "ready") return;

    const moduleNames = Object.keys(this.loader.modules);
    const functionNames = Object.keys(this.loader.functions);

    this.moduleInfo.innerHTML = `
      <div class="module-summary">
        <strong>Loaded Modules:</strong> ${moduleNames.length}<br>
        <strong>Available Functions:</strong> ${functionNames.length}
      </div>
      <div class="module-details">
        <div><strong>Modules:</strong> ${moduleNames.join(", ")}</div>
        <div><strong>Functions:</strong> ${functionNames.join(", ")}</div>
      </div>
    `;
  }

  /**
   * Update display value
   */
  private updateDisplay(value: string): void {
    this.display.value = value;
  }

  /**
   * Append number to display
   */
  public appendNumber(num: string): void {
    const currentDisplay = this.display.value;

    if (this.waitingForOperand || currentDisplay === "0") {
      this.updateDisplay(num);
      this.waitingForOperand = false;
    } else {
      this.updateDisplay(currentDisplay + num);
    }
  }

  /**
   * Set operation for calculation
   */
  public setOperation(nextOperation: string): void {
    const inputValue = parseFloat(this.display.value);

    if (this.previousValue === 0) {
      this.previousValue = inputValue;
    } else if (this.operation) {
      const newValue = this.performCalculation(
        this.previousValue,
        inputValue,
        this.operation
      );
      this.updateDisplay(String(newValue));
      this.previousValue = newValue;
    }

    this.waitingForOperand = true;
    this.operation = nextOperation;
  }

  /**
   * Perform calculation using remote functions
   */
  private performCalculation(
    firstValue: number,
    secondValue: number,
    operation: string
  ): number {
    if (!this.loader || this.loader.status !== "ready") {
      alert("Remote functions not loaded");
      return secondValue;
    }

    try {
      // Use the simplified auto-loader to call functions
      switch (operation) {
        case "+":
          return this.loader.functions.add(firstValue, secondValue);
        case "-":
          return this.loader.functions.subtract(firstValue, secondValue);
        case "*":
          return this.loader.functions.multiply(firstValue, secondValue);
        case "/":
          return this.loader.functions.divide(firstValue, secondValue);
        default:
          return secondValue;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown calculation error";
      alert(`Calculation error: ${errorMessage}`);
      return secondValue;
    }
  }

  /**
   * Calculate result
   */
  public calculate(): void {
    const inputValue = parseFloat(this.display.value);

    if (this.previousValue !== 0 && this.operation) {
      const newValue = this.performCalculation(
        this.previousValue,
        inputValue,
        this.operation
      );
      this.updateDisplay(String(newValue));
      this.previousValue = 0;
      this.operation = null;
      this.waitingForOperand = true;
    }
  }

  /**
   * Clear display
   */
  public clearDisplay(): void {
    this.updateDisplay("0");
    this.previousValue = 0;
    this.operation = null;
    this.waitingForOperand = false;
  }

  /**
   * Delete last character
   */
  public deleteLast(): void {
    const currentDisplay = this.display.value;
    if (currentDisplay.length > 1) {
      this.updateDisplay(currentDisplay.slice(0, -1));
    } else {
      this.updateDisplay("0");
    }
  }

  /**
   * Clear entry
   */
  public clearEntry(): void {
    this.clearDisplay();
  }

  /**
   * Input decimal point
   */
  public inputDecimal(): void {
    const currentDisplay = this.display.value;
    if (!currentDisplay.includes(".")) {
      this.appendNumber(".");
    }
  }

  /**
   * Calculate power using remote function
   */
  public calculatePower(): void {
    if (!this.loader || this.loader.status !== "ready") {
      alert("Advanced functions not loaded");
      return;
    }

    const base = parseFloat(
      (document.getElementById("power-base") as HTMLInputElement).value
    );
    const exponent = parseFloat(
      (document.getElementById("power-exp") as HTMLInputElement).value
    );

    try {
      const result = this.loader.functions.power(base, exponent);
      document.getElementById("power-result")!.textContent = `= ${result}`;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unknown power calculation error";
      alert(`Power calculation error: ${errorMessage}`);
    }
  }

  /**
   * Calculate square root using remote function
   */
  public calculateSqrt(): void {
    if (!this.loader || this.loader.status !== "ready") {
      alert("Advanced functions not loaded");
      return;
    }

    const value = parseFloat(
      (document.getElementById("sqrt-input") as HTMLInputElement).value
    );

    try {
      const result = this.loader.functions.sqrt(value);
      document.getElementById("sqrt-result")!.textContent = `= ${result}`;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unknown square root calculation error";
      alert(`Square root calculation error: ${errorMessage}`);
    }
  }

  /**
   * Calculate factorial using remote function
   */
  public calculateFactorial(): void {
    if (!this.loader || this.loader.status !== "ready") {
      alert("Advanced functions not loaded");
      return;
    }

    const value = parseInt(
      (document.getElementById("factorial-input") as HTMLInputElement).value
    );

    try {
      const result = this.loader.functions.factorial(value);
      document.getElementById("factorial-result")!.textContent = `= ${result}`;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unknown factorial calculation error";
      alert(`Factorial calculation error: ${errorMessage}`);
    }
  }

  /**
   * Calculate percentage using remote function
   */
  public calculatePercentage(): void {
    if (!this.loader || this.loader.status !== "ready") {
      alert("Advanced functions not loaded");
      return;
    }

    const value = parseFloat(
      (document.getElementById("percentage-value") as HTMLInputElement).value
    );
    const percentage = parseFloat(
      (document.getElementById("percentage-percent") as HTMLInputElement).value
    );

    try {
      const result = this.loader.functions.percentage(value, percentage);
      document.getElementById("percentage-result")!.textContent = `= ${result}`;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unknown percentage calculation error";
      alert(`Percentage calculation error: ${errorMessage}`);
    }
  }
}

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Starting UMD Calculator App...");
  new CalculatorApp();
});

// Add keyboard support
document.addEventListener("keydown", (event) => {
  const key = event.key;

  if (key >= "0" && key <= "9") {
    (window as any).calculatorApp?.inputNumber(key);
  } else if (key === ".") {
    (window as any).calculatorApp?.inputDecimal();
  } else if (key === "+") {
    (window as any).calculatorApp?.handleOperation("+");
  } else if (key === "-") {
    (window as any).calculatorApp?.handleOperation("-");
  } else if (key === "*") {
    (window as any).calculatorApp?.handleOperation("*");
  } else if (key === "/") {
    event.preventDefault();
    (window as any).calculatorApp?.handleOperation("/");
  } else if (key === "Enter" || key === "=") {
    (window as any).calculatorApp?.calculate();
  } else if (key === "Escape" || key === "c" || key === "C") {
    (window as any).calculatorApp?.clearDisplay();
  } else if (key === "Backspace") {
    (window as any).calculatorApp?.handleBackspace();
  }
});

// Export for potential external usage
export { CalculatorApp };
