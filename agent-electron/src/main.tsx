import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App.tsx";
import "./index.css";
import { LiveKitRoom } from "@livekit/components-react";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LiveKitRoom
      data-lk-theme="default"
      token={
        location.search.includes("control=true")
          ? import.meta.env.VITE_LIVEKIT_CONTROL_TOKEN
          : import.meta.env.VITE_LIVEKIT_TOKEN
      }
      serverUrl={
        import.meta.env.VITE_LIVEKIT_SERVER ?? "https://webrtc.msuncloud.com"
      }
    >
      <App />
    </LiveKitRoom>
  </React.StrictMode>,
);

// Use contextBridge
window.ipcRenderer?.on("main-process-message", (_event, message) => {
  console.log(message);
});
