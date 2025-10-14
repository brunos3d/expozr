import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// Expose React globally for UMD modules
(window as any).React = React;

const root = createRoot(document.getElementById("root")!);

root.render(<App />);
