import { createNavigator } from "@expozr/navigator";

// Simple TypeScript script for the host application
console.log("🏠 Host application loaded!");

// Export some functions to demonstrate ES module functionality
export function greetUser(name: string): string {
  return `Hello, ${name}! Welcome to the host application.`;
}

export function getCurrentTime(): string {
  return new Date().toLocaleTimeString();
}

const EXPOZR_REMOTE_URL = "http://localhost:3001"; // URL of the remote expozr

type CargoModule = {
  greet: (name: string) => string;
  add: (a: number, b: number) => number;
  multiply: (a: number, b: number) => number;
  getCurrentTime: () => string;
};

// Main initialization
function init(): void {
  console.log(`⏰ Application started at: ${getCurrentTime()}`);
  console.log(greetUser("Developer"));

  // Update the status in the HTML
  const statusElement = document.querySelector(".status");
  if (statusElement) {
    statusElement.innerHTML = `
      ✅ Host application is running!<br />
      📦 TypeScript compiled and loaded as ES module<br />
      🔄 Webpack is watching for changes with hot reload<br />
      ⏰ Last reload: ${getCurrentTime()}
    `;
  }

  console.log("🎉 Host application initialization complete!");
}

async function initRemote() {
  try {
    const navigator = createNavigator({
      expozrs: {
        "umd-remote-app": {
          url: EXPOZR_REMOTE_URL,
        },
      },
    });

    // Load remote module with auto-detection (will detect as UMD)
    const { module } = await navigator.loadCargo<CargoModule>(
      "umd-remote-app",
      "./utils",
      {
        moduleFormat: "umd", // Explicit override
        exports: ["add", "greet", "multiply", "getCurrentTime"],
      }
    );

    console.log("🌐 Remote module loaded successfully!");

    console.log("📦 Testing remote module functions:");

    // Test the remote functions directly
    console.log("200 + 300 =", module.add(200, 300));
    console.log("400 * 500 =", module.multiply(400, 500));
    console.log(module.greet("Host User"));
    console.log("Remote time:", module.getCurrentTime());
  } catch (error) {
    console.error("❌ Failed to load remote module:", error);
  }
}

// Wait for DOM to be ready, then initialize
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
  initRemote();
}
