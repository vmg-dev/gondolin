# Follow‑up Plan (Post‑POC)

This captures the next milestones after Option B (RPC exec POC) to avoid losing scope.

## 1) FUSE filesystem (guest)
- Implement `fuse-sandboxfs` with minimal ops:
  - readdir/getattr/open/read/write/create
- Backed by host RPC store (in‑memory initially).
- Mount at `/data` and support `ls/cat/echo`.

## 2) Host FS backing store
- Replace in‑memory store with:
  - DB‑backed namespace (production)
  - local disk (dev)
- Add optimistic caching (inode + LRU) in guest.

## 3) Network proxy
- Enforce outbound traffic through host proxy.
- Add allow/deny list and rate limiting.
- Optional HTTPS MITM + injected CA cert.

## 4) Resource limits + policies
- QEMU CPU/memory caps.
- Exec timeouts and process limits.
- IO bandwidth shaping (if needed).

## 5) Dev/prod parity
- Standardize guest image build.
- macOS QEMU flags (HVF) vs Linux (KVM).
- Keep host RPC and guest behavior identical.

## 6) Hardening + observability
- Structured logging + metrics from host and guest.
- Fuzz RPC protocol.
- Stress test multiple concurrent VMs.

## 7) Packaging + automation
- Build pipelines for guest image.
- Host controller deployment artifacts.
- Versioned API contract between host and guest.
