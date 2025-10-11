import { Button } from "./components/Button";

function App() {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Vite React Remote - Button Component Warehouse</h1>
      <p>
        This is a remote application that exposes a Button component via Expozr.
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          maxWidth: "300px",
        }}
      >
        <h2>Button Examples:</h2>

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
    </div>
  );
}

export default App;
