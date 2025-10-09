import React from "react";
import { bootstrapReactWarehouse } from "@expozr/react";

/**
 * Main App component that renders with loaded remote components
 */
const App: React.FC<{
  components: Record<string, React.ComponentType<any>>;
}> = ({ components }) => {
  const { Button } = components;

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <h1>🚀 Expozr React Host Application</h1>
      <p>
        This example shows how to consume React components from a remote
        warehouse using the simplified <code>@expozr/react</code> API.
      </p>

      <div
        style={{
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "20px",
          backgroundColor: Button ? "#d4edda" : "#fff3cd",
          border: `1px solid ${Button ? "#c3e6cb" : "#ffeaa7"}`,
          color: Button ? "#155724" : "#856404",
        }}
      >
        <strong>Status:</strong>{" "}
        {Button
          ? "✅ Remote component loaded successfully!"
          : "⏳ Loading remote component..."}
      </div>

      {Button && (
        <div style={{ marginBottom: "20px" }}>
          <h2>� Testing Remote Button Component</h2>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Button>Default Button</Button>
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button size="small">Small Button</Button>
            <Button size="large">Large Button</Button>
            <Button disabled>Disabled Button</Button>
            <Button
              onClick={() => alert("Remote button clicked!")}
              style={{ backgroundColor: "#ff6b6b", color: "white" }}
            >
              Custom Styled Button
            </Button>
          </div>

          <div style={{ marginTop: "15px", fontSize: "14px", color: "#666" }}>
            <strong>Component Info:</strong>
            <ul style={{ margin: "5px 0", paddingLeft: "20px" }}>
              <li>Source: Remote warehouse at http://localhost:3001</li>
              <li>Type: {typeof Button}</li>
              <li>
                Props: Supports variant, size, disabled, onClick, style, and
                children
              </li>
            </ul>
          </div>
        </div>
      )}

      <div
        style={{
          marginTop: "30px",
          padding: "15px",
          backgroundColor: "#f8f9fa",
          color: "#333",
          borderRadius: "8px",
        }}
      >
        <h3>❓ How this works</h3>
        <ol style={{ margin: "10px 0", paddingLeft: "20px" }}>
          <li>
            <strong>Remote Warehouse:</strong> Components are built and served
            from <code>examples/webpack/react/remote</code> (port 3001)
          </li>
          <li>
            <strong>Simplified API:</strong> Using{" "}
            <code>bootstrapReactWarehouse()</code> eliminates manual component
            loading
          </li>
          <li>
            <strong>Auto Setup:</strong> React globals and UMD loading are
            handled automatically
          </li>
          <li>
            <strong>Type Safety:</strong> Full TypeScript support with proper
            component typing
          </li>
          <li>
            <strong>Error Handling:</strong> Built-in error states and fallbacks
          </li>
        </ol>

        <h4>🔧 Simplified Code</h4>
        <pre
          style={{
            backgroundColor: "#fff",
            padding: "10px",
            borderRadius: "4px",
            fontSize: "12px",
          }}
        >
          {`// Before: Manual setup (60+ lines)
async function bootstrap() {
  setupReactGlobals();
  const inventory = await loadWarehouseInventory(url);
  const buttonModule = await loadUMDModule(...);
  // ... complex component extraction logic
  const root = createRoot(container);
  root.render(<App />);
}

// After: One function call (3 lines)
bootstrapReactWarehouse(
  "http://localhost:3001/",
  "app", 
  (components) => <App components={components} />
);`}
        </pre>
      </div>

      {!Button && (
        <div
          style={{
            marginTop: "20px",
            backgroundColor: "#f8d7da",
            padding: "15px",
            borderRadius: "8px",
          }}
        >
          <strong>⚠️ Troubleshooting:</strong>
          <p>
            If components are not loading, make sure the remote warehouse is
            running on port 3001. Run <code>npm run dev</code> in{" "}
            <code>examples/webpack/react/remote</code>
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Bootstrap the application with the simplified @expozr/react API
 * This replaces ~60 lines of manual setup code with a single function call
 */
bootstrapReactWarehouse(
  "http://localhost:3001/",
  "app",
  (components: Record<string, React.ComponentType<any>>) => (
    <App components={components} />
  )
).catch((error: any) => {
  console.error("Failed to bootstrap application:", error);
});
