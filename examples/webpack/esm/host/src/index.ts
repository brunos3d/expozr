// ESM Host application using Expozr Navigator
import { createNavigator } from "@expozr/navigator";

const EXPOZR_REMOTE_URL = "http://localhost:3001"; // URL of the remote expozr

console.log("🏠 ESM Host application loaded!");

// Export some functions to demonstrate ES module functionality
export function greetUser(name: string): string {
  return `Hello, ${name}! Welcome to the ESM host application.`;
}

export function getCurrentTime(): string {
  return new Date().toLocaleTimeString();
}

// Main initialization
async function init(): Promise<void> {
  console.log(`⏰ Application started at: ${getCurrentTime()}`);
  console.log(greetUser("Developer"));

  // Update the status in the HTML
  const statusElement = document.querySelector(".status");
  if (statusElement) {
    statusElement.innerHTML = `
      ✅ ESM Host application is running!<br />
      📦 Using Expozr webpack adapter with ESM modules<br />
      🔄 Webpack is watching for changes with hot reload<br />
      ⏰ Last reload: ${getCurrentTime()}
    `;
  }

  console.log("🎉 ESM Host application initialization complete!");
}

async function initRemote() {
  // Initialize Expozr Navigator

  // You can reuse the navigator instance across your application
  const navigator = createNavigator({
    expozrs: {
      "remote-esm-functions": {
        url: EXPOZR_REMOTE_URL,
        version: "^1.0.0",
      },
    },
  });

  try {
    // Load the remote ESM expozr
    console.log("🌐 Loading remote ESM functions...");
    const remoteUtils = await navigator.loadCargo(
      "remote-esm-functions",
      "utils"
    );

    console.log("🚚 Remote utils cargo:", JSON.stringify(remoteUtils));

    if (remoteUtils && remoteUtils.module) {
      console.log("✅ Remote ESM functions loaded successfully!");

      // Test the remote functions
      const module = remoteUtils.module;
      if (module.greet) {
        console.log("📞 Calling remote greet:", module.greet("ESM Host"));
      }
      if (module.add) {
        console.log("🧮 Calling remote add:", module.add(100, 25));
      }
      if (module.multiply) {
        console.log("✖️ Calling remote multiply:", module.multiply(5, 100));
      }
      if (module.getCurrentTime) {
        console.log("⏰ Remote time:", module.getCurrentTime());
      }
    }
  } catch (error) {
    console.error("❌ Failed to load remote ESM functions:", error);
  }

  try {
    const remoteUrl = `${EXPOZR_REMOTE_URL}/utils.js`;
    const remoteModule = await import(/* webpackIgnore: true */ remoteUrl);
    console.log("🌐 Remote module loaded successfully!");

    // Test the remote functions
    if (remoteModule.greet) {
      console.log("📞 Calling remote greet:", remoteModule.greet("Host App"));
    }
    if (remoteModule.add) {
      console.log("🧮 Calling remote add:", remoteModule.add(10, 5));
    }
    if (remoteModule.multiply) {
      console.log("✖️ Calling remote multiply:", remoteModule.multiply(3, 7));
    }

    // Use default export if available
    if (remoteModule.default) {
      console.log("📦 Remote default export:", remoteModule.default);
      console.log(
        "🎯 Using default.greet:",
        remoteModule.default.greet("Via Default")
      );
    }
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
