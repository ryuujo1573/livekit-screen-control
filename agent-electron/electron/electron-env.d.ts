import "vite-plugin-electron/electron-env";
/// <reference types="vite-plugin-electron/electron-env" />

import {
  type MouseClass,
  type KeyboardClass,
  type ScreenClass,
  type ClipboardClass,
} from "@nut-tree/nut-js";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      /**
       * The built directory structure
       *
       * ```tree
       * ├─┬─┬ dist
       * │ │ └── index.html
       * │ │
       * │ ├─┬ dist-electron
       * │ │ ├── main.js
       * │ │ └── preload.js
       * │
       * ```
       */
      APP_ROOT: string;
      /** /dist/ or /public/ */
      VITE_PUBLIC: string;
    }
  }

  // Used in Renderer process, expose in `preload.ts`
  interface Window {
    ipcRenderer: import("electron").IpcRenderer;

    readonly inputDevices: {
      mouse: MouseClass;
      keyboard: KeyboardClass;
      screen: ScreenClass;
      clipboard: ClipboardClass;
    };
  }
}
