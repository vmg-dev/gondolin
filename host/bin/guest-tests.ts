import fs from "fs";
import path from "path";

import { VM } from "../src/vm";

const MAX_STDIN_BYTES = 16 * 1024 * 1024;

function resolveRepoRoot() {
  return path.resolve(__dirname, "../..");
}

function defaultTestPaths(repoRoot: string) {
  return [
    {
      label: "module",
      hostPath: path.resolve(repoRoot, "guest/zig-out/bin/sandboxd-mod-tests"),
    },
    {
      label: "executable",
      hostPath: path.resolve(repoRoot, "guest/zig-out/bin/sandboxd-exe-tests"),
    },
  ];
}

async function runTest(vm: VM, label: string, payload: Buffer) {
  const guestPath = `/tmp/sandboxd-${label}-tests`;
  const command = [
    "/bin/sh",
    "-c",
    `cat > ${guestPath} && chmod +x ${guestPath} && ${guestPath}`,
  ];

  const exec = await vm.execStream(command, {
    stdin: payload,
    stdout: (chunk) => process.stdout.write(chunk),
    stderr: (chunk) => process.stderr.write(chunk),
  });
  const result = await exec.result;
  if (result.exitCode !== 0) {
    throw new Error(`guest ${label} tests failed with exit code ${result.exitCode}`);
  }
}

async function main() {
  const repoRoot = resolveRepoRoot();
  const tests = defaultTestPaths(repoRoot);

  for (const test of tests) {
    if (!fs.existsSync(test.hostPath)) {
      throw new Error(`missing test binary: ${test.hostPath}`);
    }
  }

  const vm = new VM({
    server: {
      console: "none",
      maxStdinBytes: MAX_STDIN_BYTES,
    },
  });

  try {
    await vm.start();
    for (const test of tests) {
      const payload = fs.readFileSync(test.hostPath);
      await runTest(vm, test.label, payload);
    }
  } finally {
    await vm.stop();
  }
}

main().catch((err) => {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`${message}\n`);
  process.exit(1);
});
