import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(() => {
  return {
    root: "example",
    envPrefix: "LIVEKIT_",
    plugins: [react({})],
  };
});
