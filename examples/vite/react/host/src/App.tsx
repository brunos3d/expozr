import React, { useState, useEffect } from "react";
import { Navigator } from "@expozr/navigator";

// Define the Button component type
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
}

type ButtonComponent = React.ComponentType<ButtonProps>;

function App() {
  const [RemoteButton, setRemoteButton] = useState<ButtonComponent | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRemoteButton = async () => {
      try {
        // Configure the navigator with the remote warehouse
        const navigator = new Navigator({
          expozrs: {
            "vite-react-components": {
              url: "http://localhost:5001",
              version: "^1.0.0",
            },
          },
        });

        // Load the Button component from the warehouse
        const loadedCargo = await navigator.loadCargo(
          "vite-react-components",
          "./Button"
        );

        // Extract the Button component from the loaded module
        setRemoteButton(() => loadedCargo.module.Button);
        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load remote component"
        );
        setLoading(false);
      }
    };

    loadRemoteButton();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <h1>Vite React Host Application</h1>
        <p>Loading remote Button component...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <h1>Vite React Host Application</h1>
        <p style={{ color: "red" }}>Error: {error}</p>
        <p>
          Make sure the remote application is running on http://localhost:5001
        </p>
      </div>
    );
  }

  if (!RemoteButton) {
    return (
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <h1>Vite React Host Application</h1>
        <p>Remote Button component not available</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Vite React Host Application</h1>
      <p>
        Successfully loaded and using the remote Button component from the
        warehouse!
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
          These buttons are loaded dynamically from the remote warehouse running
          on port 5001. The Button component is defined in the remote
          application and consumed here seamlessly!
        </p>
        <p>
          <strong>Architecture:</strong> Host (port 5000) → Remote Warehouse
          (port 5001) → Button Component
        </p>
      </div>
    </div>
  );
}

export default App;
