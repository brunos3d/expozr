/**
 * Example: Module System Configuration with Expozr Navigator
 *
 * This example demonstrates how to configure module loading strategies
 * both globally and per-load using the Expozr Navigator.
 *
 * Global Configuration (createNavigator):
 * - Set default module format preferences (esm, umd, cjs)
 * - Configure fallback order
 * - Set loading strategy (dynamic, static, lazy, eager)
 * - Enable/disable hybrid mode
 *
 * Per-Load Configuration (loadCargo options):
 * - Override format for specific components
 * - Set custom fallback order
 * - Change loading strategy per component
 */

import React from "react";
import { createNavigator } from "@expozr/navigator";

const EXPOZR_REMOTE_URL = "http://localhost:5001"; // URL of the remote expozr

// Define the Button component type
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
}

type ButtonComponent = React.ComponentType<ButtonProps>;

type CargoModule = {
  Button: ButtonComponent;
};

const navigator = createNavigator({
  expozrs: {
    "vite-react-components": {
      url: EXPOZR_REMOTE_URL,
    },
  },
  // Global module system configuration
  moduleSystem: {
    primary: "esm", // Prefer ESM modules
    fallbacks: ["umd", "cjs"], // Fall back to UMD, then CJS
    strategy: "dynamic", // Use dynamic loading strategy
    hybrid: true, // Enable hybrid mode
  },
});

// Component loaded with ESM preference
const RemoteButton = React.lazy(() =>
  navigator
    .loadCargo<CargoModule>("vite-react-components", "./Button", {
      // Per-load module system preferences
      moduleFormat: "esm", // Prefer ESM for this specific load
      fallbackFormats: ["umd"], // Only fall back to UMD if ESM fails
      strategy: "dynamic", // Use dynamic loading for this component
    })
    .then((cargo) => ({
      default: cargo.module.Button,
    }))
);

// Component loaded with UMD preference (for demonstration)
const RemoteButtonUMD = React.lazy(() =>
  navigator
    .loadCargo<CargoModule>("vite-react-components", "./Button", {
      moduleFormat: "umd", // Prefer UMD for this component
      fallbackFormats: ["esm", "cjs"], // Fall back to ESM, then CJS
      strategy: "eager", // Load eagerly
    })
    .then((cargo) => ({
      default: cargo.module.Button,
    }))
);

function App() {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Vite React Host Application</h1>
      <p>
        Successfully loaded and using the remote Button component from the
        remote application!
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          maxWidth: "300px",
        }}
      >
        <h2>Remote Button Component Examples:</h2>

        <React.Suspense fallback={<div>Loading ESM buttons...</div>}>
          <RemoteButton onClick={() => alert("Remote primary button clicked!")}>
            Remote Primary Button
          </RemoteButton>

          <RemoteButton
            variant="secondary"
            onClick={() => alert("Remote secondary button clicked!")}
          >
            Remote Secondary Button
          </RemoteButton>

          <RemoteButton
            variant="danger"
            size="large"
            onClick={() => alert("Remote danger button clicked!")}
          >
            Remote Danger Button
          </RemoteButton>

          <RemoteButton
            variant="primary"
            size="small"
            onClick={() => alert("Remote small button clicked!")}
          >
            Remote Small Button
          </RemoteButton>

          <RemoteButton disabled>Remote Disabled Button</RemoteButton>
        </React.Suspense>

        <div
          style={{
            margin: "20px 0",
            padding: "10px",
            backgroundColor: "#f9f9f9",
            borderRadius: "4px",
          }}
        >
          <p style={{ fontSize: "14px", margin: "0 0 10px 0" }}>
            <strong>UMD-Preferred Button:</strong> (Same component, different
            loading strategy)
          </p>
          <React.Suspense fallback={<div>Loading UMD button...</div>}>
            <RemoteButtonUMD
              variant="secondary"
              onClick={() => alert("UMD-loaded button clicked!")}
            >
              UMD-Loaded Button
            </RemoteButtonUMD>
          </React.Suspense>
        </div>
      </div>

      <div
        style={{
          marginTop: "40px",
          padding: "20px",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
        }}
      >
        <h3>🎉 Success!</h3>
        <p>
          These buttons are loaded dynamically from the remote app running on
          port 5001. The Button component is defined in the remote application
          and consumed here seamlessly!
        </p>
        <p>
          <strong>Architecture:</strong> Host (port 5000) → Remote App (port
          5001) → Button Component
        </p>

        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            backgroundColor: "#e8f4fd",
            borderRadius: "6px",
          }}
        >
          <h4>📘 Module System Configuration</h4>
          <p>
            <strong>Global Configuration:</strong>
          </p>
          <ul style={{ fontSize: "14px", margin: "8px 0" }}>
            <li>
              <strong>Primary:</strong> ESM (Preferred module format)
            </li>
            <li>
              <strong>Fallbacks:</strong> UMD → CJS (Fallback order)
            </li>
            <li>
              <strong>Strategy:</strong> Dynamic loading
            </li>
            <li>
              <strong>Hybrid:</strong> Enabled
            </li>
          </ul>
          <p>
            <strong>Per-Load Options:</strong>
          </p>
          <ul style={{ fontSize: "14px", margin: "8px 0" }}>
            <li>
              <strong>Module Format:</strong> ESM (Override for this component)
            </li>
            <li>
              <strong>Fallback Formats:</strong> UMD only
            </li>
            <li>
              <strong>Strategy:</strong> Dynamic (Per-load override)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
