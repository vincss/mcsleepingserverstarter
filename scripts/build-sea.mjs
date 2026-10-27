import { spawnSync } from "node:child_process";
import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildSync } from "esbuild";
import { createRequire } from "node:module";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const target = process.env.SEA_TARGET ?? getHostTarget();
const targetPlatform = {
  "win-x64": ["win32", "x64"],
  "linux-x64": ["linux", "x64"],
  "linux-arm64": ["linux", "arm64"],
  "macos-x64": ["darwin", "x64"],
  "macos-arm64": ["darwin", "arm64"],
  "alpine-arm64": ["linux", "arm64"],
}[target];

if (!targetPlatform) {
  throw new Error(`Unsupported SEA_TARGET: ${target}`);
}

if (
  process.platform !== targetPlatform[0] ||
  process.arch !== targetPlatform[1]
) {
  throw new Error(
    `SEA target ${target} requires ${targetPlatform.join("/")}, got ${process.platform}/${process.arch}`,
  );
}

if (
  target === "alpine-arm64" &&
  process.report.getReport().header.glibcVersionRuntime
) {
  throw new Error(
    "The Alpine target must be built with a musl-based Node.js runtime",
  );
}

const viewsDirectory = path.join(root, "build", "views");
if (!existsSync(viewsDirectory)) {
  throw new Error("Build views first by running npm run prebuild");
}

const outputDirectory = path.join(root, "bin");
mkdirSync(outputDirectory, { recursive: true });

const outputPath = path.join(
  outputDirectory,
  `mcsleepingserverstarter-${target}${target.startsWith("win-") ? ".exe" : ""}`,
);
const tempDirectory = mkdtempSync(path.join(os.tmpdir(), "sss-sea-"));
const bundlePath = path.join(tempDirectory, "sleepingServerStarter.cjs");
const blobPath = path.join(tempDirectory, "sea-prep.blob");
const configPath = path.join(tempDirectory, "sea-config.json");
const postjectPackagePath = require.resolve("postject/package.json");
const postjectPackage = JSON.parse(readFileSync(postjectPackagePath, "utf8"));
const postjectCli = path.resolve(
  path.dirname(postjectPackagePath),
  postjectPackage.bin.postject,
);

const collectAssets = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return collectAssets(absolutePath);
    }

    return [
      [
        path.posix.join(
          "views",
          path.relative(viewsDirectory, absolutePath).split(path.sep).join("/"),
        ),
        absolutePath,
      ],
    ];
  });

const run = (command, args) => {
  const result = spawnSync(command, args, { cwd: root, stdio: "inherit" });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`${command} exited with status ${result.status}`);
  }
};

try {
  buildSync({
    entryPoints: [path.join(root, "build", "sleepingServerStarter.js")],
    bundle: true,
    platform: "node",
    target: "node24",
    format: "cjs",
    outfile: bundlePath,
  });

  writeFileSync(
    configPath,
    JSON.stringify({
      main: bundlePath,
      output: blobPath,
      useCodeCache: false,
      assets: Object.fromEntries(collectAssets(viewsDirectory)),
    }),
  );
  run(process.execPath, ["--experimental-sea-config", configPath]);

  copyFileSync(process.execPath, outputPath);
  if (process.platform !== "win32") {
    chmodSync(outputPath, 0o755);
  }

  if (process.platform === "darwin") {
    run("codesign", ["--remove-signature", outputPath]);
  }

  const postjectArgs = [
    postjectCli,
    outputPath,
    "NODE_SEA_BLOB",
    blobPath,
    "--sentinel-fuse",
    "NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2",
  ];
  if (process.platform === "darwin") {
    postjectArgs.push("--macho-segment-name", "NODE_SEA");
  }
  run(process.execPath, postjectArgs);

  if (process.platform === "darwin") {
    run("codesign", ["--sign", "-", outputPath]);
  }

  if (targetPlatform[0] !== "darwin") {
    const upx = process.env.UPX_PATH ?? "upx";
    run(upx, ["-9", outputPath]);
    run(upx, ["-t", outputPath]);
  }
} finally {
  rmSync(tempDirectory, { recursive: true, force: true });
}

console.info(`Built ${path.relative(root, outputPath)}`);

function getHostTarget() {
  if (process.platform === "win32" && process.arch === "x64") {
    return "win-x64";
  }
  if (process.platform === "linux" && process.arch === "x64") {
    return "linux-x64";
  }
  if (process.platform === "linux" && process.arch === "arm64") {
    return process.report.getReport().header.glibcVersionRuntime
      ? "linux-arm64"
      : "alpine-arm64";
  }
  if (process.platform === "darwin" && process.arch === "x64") {
    return "macos-x64";
  }
  if (process.platform === "darwin" && process.arch === "arm64") {
    return "macos-arm64";
  }
  throw new Error(
    `Unsupported build platform: ${process.platform}/${process.arch}`,
  );
}
