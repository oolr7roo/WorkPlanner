import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { calendarMonthLabels } from "./build/calendarMonthLabels";

export default defineConfig({
  // Keep the SDK visible to the compatibility transform in dev and production.
  optimizeDeps: {
    exclude: ["trud-calendar"],
    include: ["react", "react-dom/client", "react/jsx-runtime", "react/jsx-dev-runtime", "@floating-ui/react"],
  },
  server: {
    allowedHosts: ["home-macmini.tail7073a2.ts.net"],
    watch: { ignored: ["**/postgresql/**"] },
  },
  plugins: [
    calendarMonthLabels(),
    tailwindcss(),
    {
      name: "block-postgresql-directory",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          let path: string;
          try {
            path = decodeURIComponent((req.url ?? "").split("?")[0])
              .replaceAll("\\", "/")
              .toLowerCase();
          } catch {
            res.statusCode = 400;
            res.end();
            return;
          }

          if (path.split("/").includes("postgresql")) {
            res.statusCode = 404;
            res.end();
            return;
          }
          next();
        });
      },
    },
  ],
});
