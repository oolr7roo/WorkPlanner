import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    allowedHosts: ["home-macmini.tail7073a2.ts.net"],
    watch: { ignored: ["**/postgresql/**"] },
  },
  plugins: [
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
