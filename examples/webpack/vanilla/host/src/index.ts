// Simple direct approach to test module loading
async function loadModules() {
  try {
    console.log("🚀 Host application starting...");

    // Test basic connectivity first
    console.log("🔍 Testing warehouse connectivity...");
    const inventoryResponse = await fetch(
      "http://localhost:3001/expozr.inventory.json"
    );

    if (!inventoryResponse.ok) {
      throw new Error(`Warehouse not accessible: ${inventoryResponse.status}`);
    }

    const inventory = await inventoryResponse.json();
    console.log(
      "✅ Warehouse accessible. Available modules:",
      Object.keys(inventory.cargo)
    );

    // Load and execute hello module directly
    console.log("📦 Loading hello module...");
    const helloResponse = await fetch("http://localhost:3001/hello.js");
    const helloCode = await helloResponse.text();

    // Create a module scope and execute the UMD code
    const moduleExports: any = {};
    const module = { exports: moduleExports };

    // Execute the UMD module code - it will set up the global or return exports
    const executeModule = new Function(
      "exports",
      "module",
      "require",
      helloCode
    );
    executeModule(moduleExports, module, () => ({})); // Mock require function

    // UMD modules might export to global scope or module.exports
    const actualExports =
      module.exports.default || module.exports || (window as any).hello;

    console.log("✅ Hello module loaded!");
    console.log("Hello exports:", Object.keys(actualExports || {}));

    // Test the hello function
    if (actualExports && actualExports.sayHello) {
      actualExports.sayHello("Direct Loading Test");
    }

    console.log("🎉 Direct module loading successful!");

    // Update UI to show success
    const statusDiv = document.getElementById("status");
    if (statusDiv) {
      statusDiv.innerHTML = `
        <div class="status success">
          <span class="emoji">✅</span>Direct module loading completed successfully!
          <br>Warehouse: ${inventory.warehouse.name}
          <br>Modules available: ${Object.keys(inventory.cargo).join(", ")}
          <br>Hello module exports: ${Object.keys(actualExports || {}).join(", ")}
        </div>
      `;
    }
  } catch (error) {
    console.error("❌ Failed to load modules:", error);
    const statusDiv = document.getElementById("status");
    if (statusDiv) {
      statusDiv.innerHTML = `
        <div class="status error">
          <span class="emoji">❌</span>Failed to load modules: ${error instanceof Error ? error.message : String(error)}
        </div>
      `;
    }
  }
}

// Initialize the host application
document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");
  if (app) {
    app.innerHTML = `
      <h1>Expozr Host Application</h1>
      <div id="status" class="status loading">
        <span class="emoji">⏳</span>Loading modules from warehouse...
      </div>
    `;
  }

  loadModules();
});
