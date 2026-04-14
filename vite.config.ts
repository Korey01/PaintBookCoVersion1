import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Plugin to suppress errors for optional @builder.io/react imports
  const builderIgnorePlugin = {
    name: 'ignore-builder-import-errors',
    resolveId(id) {
      if (id === '@builder.io/react') {
        return {
          id,
          external: true,
          moduleSideEffects: false,
        };
      }
    },
  };

  return {
    server: {
      host: "::",
      port: 8080,
      fs: {
        allow: [".", "./client", "./shared"],
        deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
      },
      proxy: {
        "/api": {
          target: "http://localhost:3000",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, "/api"),
        },
      },
    },
    build: {
      outDir: "dist/spa",
      rollupOptions: {
        // @builder.io/react is an optional integration not yet installed.
        // Externalising it lets Rollup skip resolution; the dynamic import()
        // calls in page files catch the runtime failure silently.
        external: ["@builder.io/react"],
      },
    },
    plugins: [builderIgnorePlugin, react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./client"),
        "@shared": path.resolve(__dirname, "./shared"),
        "@server": path.resolve(__dirname, "./server"),
      },
    },
  };
});
