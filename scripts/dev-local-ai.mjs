import { readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const serviceEnvPath = resolve(dirname(fileURLToPath(import.meta.url)), "../../../zigex-ai/.env");

function readEnvValue(contents, name) {
  const line = contents.split(/\r?\n/).find((entry) => entry.trimStart().startsWith(`${name}=`));
  if (!line) return "";
  let value = line.slice(line.indexOf("=") + 1).trim();
  const quote = value[0];
  if ((quote === "'" || quote === '"') && value.at(-1) === quote) value = value.slice(1, -1);
  return value;
}

let serviceEnv;
try {
  serviceEnv = await readFile(serviceEnvPath, "utf8");
} catch {
  console.error("Local AI env file not found. Expected the sibling project at ../zigex-ai/.env.");
  process.exit(1);
}

const apiKey = readEnvValue(serviceEnv, "API_KEY");
if (!apiKey) {
  console.error("API_KEY is missing from ../zigex-ai/.env.");
  process.exit(1);
}

console.log("Starting Zigex with the local AI service at http://127.0.0.1:8000");
const next = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "dev", "--webpack"],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      AI_SERVICE_URL: "http://127.0.0.1:8000",
      AI_SERVICE_API_KEY: apiKey,
    },
  }
);

next.on("error", (error) => {
  console.error(`Could not start Next.js: ${error.message}`);
  process.exitCode = 1;
});
next.on("close", (code) => {
  process.exitCode = code ?? 1;
});