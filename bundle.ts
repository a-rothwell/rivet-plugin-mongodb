import * as esbuild from "esbuild";

// The isomorphic dynamically imports the node entry point, so we need to rewrite the import to point to the
// bundled node entry point instead of the original place it was.
const rewriteNodeEntryPlugin: esbuild.Plugin = {
  name: "rewrite-node-entry",
  setup(build) {
    build.onResolve({ filter: /\/nodeEntry$/ }, (args) => {
      return {
        external: true,
        path: "../esm/nodeEntry.js",
      };
    });
  },
};

const isomorphicBundleOptions: esbuild.BuildOptions = {
  entryPoints: ["src/index.ts", "src/nodeEntry.ts"],
  bundle: true,
  platform: "neutral",
  target: "es2020",
  outdir: "dist/esm",
  format: "esm",
  external: ["mongodb", "./src/nodeEntry"],
  plugins: [rewriteNodeEntryPlugin],
};

const nodeBundleOptions: esbuild.BuildOptions = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  target: "es2020",
  outfile: "dist/cjs/index.cjs",
  format: "cjs",
};

if (process.argv.includes("--watch")) {
  const isoContext = await esbuild.context(isomorphicBundleOptions);
  await isoContext.watch();

  const nodeContext = await esbuild.context(nodeBundleOptions);
  await nodeContext.watch();

  console.log("Watching for changes...");
} else {
  await esbuild.build(isomorphicBundleOptions);
  await esbuild.build(nodeBundleOptions);
}
