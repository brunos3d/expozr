"use client";

import Button from "../components/Button";

export default function Page() {
  return (
    <main style={{ padding: 32, fontFamily: "Arial, sans-serif" }}>
      <h1>Remote Next.js App</h1>
      <p>This page imports and shows its own Button component.</p>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          maxWidth: 300,
        }}
      >
        <Button onClick={() => alert("Primary button clicked!")}>
          Primary Button
        </Button>
        <Button
          variant="secondary"
          onClick={() => alert("Secondary button clicked!")}
        >
          Secondary Button
        </Button>
        <Button
          variant="danger"
          size="large"
          onClick={() => alert("Danger button clicked!")}
        >
          Danger Button
        </Button>
        <Button
          variant="primary"
          size="small"
          onClick={() => alert("Small button clicked!")}
        >
          Small Button
        </Button>
        <Button disabled>Disabled Button</Button>
      </div>
    </main>
  );
}
