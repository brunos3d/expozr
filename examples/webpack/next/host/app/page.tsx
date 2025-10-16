"use client";

import React from "react";
import dynamic from "next/dynamic";
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

// You can reuse the navigator instance across your application
const navigator = createNavigator({
  expozrs: {
    "next-remote": {
      url: EXPOZR_REMOTE_URL,
    },
  },
});

// Component loaded with UMD preference
const RemoteButton = dynamic(
  async () => {
    const { module } = await navigator.loadCargo<{ Button: ButtonComponent }>(
      "next-remote",
      "./Button"
    );

    console.log("Loaded module:", module);
    console.log("Loaded module keys:", Object.keys(module));

    // The module contains the Button component as a named export
    return { default: module.Button };
  },
  {
    ssr: false,
  }
);

export default function Page() {
  return (
    <main style={{ padding: 32, fontFamily: "Arial, sans-serif" }}>
      <h1>Next.js Host App</h1>
      <p>
        This page imports and shows the Button component from the remote app
        running on port 3001.
      </p>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          maxWidth: 300,
        }}
      >
        <React.Suspense fallback={<div>Loading remote button...</div>}>
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
          marginTop: 40,
          padding: 20,
          backgroundColor: "#f5f5f5",
          borderRadius: 8,
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
    </main>
  );
}
