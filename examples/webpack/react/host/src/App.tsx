import React from "react";
import { loadReactWarehouse } from "@expozr/react";

const REMOTE_WAREHOUSE_URL = "http://localhost:3001"; // URL of the remote warehouse

const warehouse = loadReactWarehouse(REMOTE_WAREHOUSE_URL);

const Button = React.lazy(() =>
  warehouse.then((mod) => ({
    default: mod.Button,
  }))
);

/**
 * Main App component that renders with loaded remote components
 */
export default function App() {
  function handleClick() {
    alert("App button clicked!");
    console.log("🔘 Remote button was clicked!");
  }

  return (
    <div className="container">
      <div id="app">
        <h1>
          <span className="emoji">🚀</span>Expozr Host Application
        </h1>

        <div style={{ marginBottom: "20px" }}>
          <h2>📡 Testing Remote Button Component</h2>
          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              marginBottom: "15px",
            }}
          >
            <Button onClick={handleClick}>Default Button</Button>
            <Button onClick={handleClick} variant="primary">
              Primary Button
            </Button>
            <Button onClick={handleClick} variant="secondary">
              Secondary Button
            </Button>
            <Button onClick={handleClick} size="small">
              Small Button
            </Button>
            <Button onClick={handleClick} size="large">
              Large Button
            </Button>
            <Button onClick={handleClick} disabled>
              Disabled Button
            </Button>
            <Button
              onClick={handleClick}
              style={{ backgroundColor: "#ff6b6b", color: "white" }}
            >
              Custom Styled Button
            </Button>
          </div>

          <div
            style={{ fontSize: "16px", color: "white", marginBottom: "10px" }}
          >
            <strong>Component Info:</strong>
            <ul style={{ margin: "5px 0", paddingLeft: "20px" }}>
              <li>Source: Remote warehouse at {REMOTE_WAREHOUSE_URL}</li>
              <li>Type: {typeof Button}</li>
              <li>
                Props: Supports variant, size, disabled, onClick, style, and
                children
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
