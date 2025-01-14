import { defineConfig } from "tsup";
import { peerDependencies } from "./package.json";

const externalDependencies = peerDependencies
  ? Object.keys(peerDependencies)
  : [];

export default defineConfig({
  entry: ["src/index.tsx"],
  format: ["cjs", "esm"],
  target: ["es6"],
  sourcemap: false,
  clean: true,
  dts: true,
  external: externalDependencies,
  keepNames: true,
  jsxFactory: "automatic",
});
