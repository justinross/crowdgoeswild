import type { UserConfig } from "vite";
import path from "path";

const config: UserConfig = {
  publicDir: "public",
  base: "/modules/crowdgoeswild/",
  root: "src/",
  server: {
    port: 31001,
    open: true,
    proxy: {
      "^(?!/modules/crowdgoeswild)": "http://localhost:31000/",
      "/socket.io": {
        target: "ws://localhost:31000",
        ws: true,
      },
    },
  },
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    sourcemap: true,
    minify: false,
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
};

export default config;
