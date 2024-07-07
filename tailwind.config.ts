import type { Config } from "tailwindcss";
import daisyui from "daisyui";

export default {
  content: ["./example/**/*.{tsx,html}"],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
} satisfies Config;
