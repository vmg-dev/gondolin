# Gondolin Host Controller

This package contains the host-side CLI and WebSocket controller for the sandbox
VM.

## Current state

- QEMU is launched with a **virtio-serial** control channel and a **virtio-net** device wired to a host socket backend.
- A WebSocket server exposes an exec API (stdin/pty + streaming stdout/stderr) that the CLI and `VM` client use.
- The host runs a **TypeScript network stack** (`NetworkStack`) that implements Ethernet framing, ARP, IPv4, ICMP, DHCP, TCP, and UDP.
- TCP flows are classified; only HTTP and TLS are accepted (CONNECT is rejected). Other TCP traffic is dropped.
- HTTP/HTTPS requests are terminated on the host and bridged via `fetch`, with optional request/response hooks.
- TLS MITM is implemented: a local CA + per-host leaf certs are generated under `var/mitm` and used to re-encrypt TLS.
- UDP forwarding is limited to DNS (port 53). The guest still points at `8.8.8.8` by default.
- A WS test (`pnpm run test:ws`) exercises guest HTTP/HTTPS fetches against icanhazip.com.

## What is *not* implemented yet
- SandboxPolicy allow/deny rules are defined but not enforced for DNS/HTTP/TLS.
- Generic TCP/UDP passthrough (beyond HTTP/TLS + DNS) is not supported.

## Useful commands
- `pnpm run dev:ws -- --net-debug` to start the WS server with network debug logging.
- `pnpm run test:ws` to run the guest HTTP/HTTPS fetch test via WS.
- `tsx bin/bash.ts` to launch a quick interactive Bash session against the VM.
