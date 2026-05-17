import esbuild from "esbuild";
import process from "process";
import { builtinModules } from "module";

const prod = process.argv[2] === "production";

const buildOptions = {
  banner: { js: "/* 30日能量记录 Obsidian Plugin */" },
  entryPoints: ["main.ts"],
  bundle: true,
  external: ["obsidian", "electron", ...builtinModules],
  format: "cjs",
  target: "es2016",
  logLevel: "info",
  sourcemap: prod ? false : "inline",
  treeShaking: true,
  outfile: "main.js",
};

if (prod) {
  esbuild.build(buildOptions).catch(() => process.exit(1));
} else {
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();
}
