import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "@livekit/components-styles";
import { App } from "./App";

const root = document.querySelector("[root]")!;

createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
