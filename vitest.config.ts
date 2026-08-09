import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    testTimeout: 15000,
    environment: "node",
    globals: true,
    include: ["__tests__/**/*.test.ts"],
  },
});
