// Simple TypeScript script for the host application
console.log("🏠 Host application loaded!");

// Export some functions to demonstrate ES module functionality
export function greetUser(name: string): string {
  return `Hello, ${name}! Welcome to the host application.`;
}

export function getCurrentTime(): string {
  return new Date().toLocaleTimeString();
}

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
    const remoteUrl = "http://localhost:3001/main.js";
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
