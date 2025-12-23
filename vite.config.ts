import type { Plugin } from "vite";
import { defineConfig } from "vite";
import path from "path";
import { globSync } from "glob";

/*
The intent of this plugin is to make so that Rollup watches files
that are not in the module graph (i.e. not imported in a JS file),
allowing for rebuilds when the module's manifest changes, or when
handlebars is updated.
*/
function watcher(...globs: string[]): Plugin {
    return {
        name: "watcher",
        buildStart() {
            for (const item of globs) {
                globSync(path.resolve(item)).forEach((filename) => {
                    this.addWatchFile(filename);
                });
            }
        },
    };
}

export default defineConfig({
  publicDir: "public",
  base: "/modules/crowdgoeswild/",
  root: "src/",
  plugins: [
    watcher(
      `./src/public/**/*`,
    )
  ],
  server: {
    port: 31001,
    open: true,
    proxy: {
      "^(?!/modules/crowdgoeswild)": "http://localhost:30000/",
      "/socket.io": {
        target: "ws://localhost:30000",
        ws: true,
      },
    },
  },
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    sourcemap: true,
    minify: false,
    watch: {
      include: ["src/**/*.ts", "src/**/*.scss", "src/**/*.hbs", "src/**/*.json"],
      exclude: ["node_modules/**", "dist/**"],
    },
    rollupOptions: {
      external: ["/scripts/greensock/esm/all.js"],
      makeAbsoluteExternalsRelative: false,
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "style.css") return "crowdgoeswild.css";
          return assetInfo.name as string;
        },
        globals: {
          gsap: "gsap",
          Handlebars: "Handlebars",
        },
      },
    },
    lib: {
      name: "crowdgoeswild",
      entry: path.resolve(__dirname, "src/crowdgoeswild.ts"),
      formats: ["es"],
      fileName: "crowdgoeswild",
    },
  },
});
