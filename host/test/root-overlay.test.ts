import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { SandboxServer, resolveSandboxServerOptions } from "../src/sandbox-server";

function makeDummyAssets() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "gondolin-root-overlay-"));
  const kernelPath = path.join(dir, "vmlinuz");
  const initrdPath = path.join(dir, "initrd");
  const rootfsPath = path.join(dir, "rootfs.ext4");
  fs.writeFileSync(kernelPath, "");
  fs.writeFileSync(initrdPath, "");
  fs.writeFileSync(rootfsPath, "");
  return { dir, kernelPath, initrdPath, rootfsPath };
}

test("rootOverlay: SandboxServer injects root.overlay=tmpfs into kernel cmdline", async () => {
  const { dir, kernelPath, initrdPath, rootfsPath } = makeDummyAssets();
  try {
    const resolved = resolveSandboxServerOptions({
      imagePath: { kernelPath, initrdPath, rootfsPath },
      netEnabled: false,
      rootOverlay: true,
    });

    const server = new SandboxServer(resolved);
    try {
      const baseAppend = (server as any).baseAppend as string;
      assert.ok(baseAppend.includes("root.overlay=tmpfs"));
    } finally {
      await server.close();
    }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
