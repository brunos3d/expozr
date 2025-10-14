import React from "react";
import { createNavigator } from "@expozr/navigator";

const EXPOZR_REMOTE_URL = "http://localhost:3001"; // URL of the remote expozr

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
    "webpack-react-components": {
      url: EXPOZR_REMOTE_URL,
    },
  },
});

// Component loaded with UMD preference
const RemoteButton = React.lazy(() =>
  navigator
    .loadCargo<CargoModule>("webpack-react-components", "./Button")
    .then((cargo) => ({ default: cargo.module.Button }))
);

function App() {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Webpack React Host Application</h1>
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

        <React.Suspense fallback={<div>Loading UMD buttons...</div>}>
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
          port 3001. The Button component is defined in the remote application
          and consumed here seamlessly!
        </p>
        <p>
          <strong>Architecture:</strong> Host (port 3000) → Remote App (port
          3001) → Button Component
        </p>
      </div>
    </div>
  );
}

export default App;
