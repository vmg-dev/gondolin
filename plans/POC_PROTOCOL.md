# POC Protocol (Draft)

This document defines the initial RPC framing and message schema for the POC. The protocol is designed to be stream‑friendly and extensible for future features (filesystem, networking, etc.).

## Transport
- **Link:** virtio‑serial device (`/dev/vport0p0`).
- **Direction:** full duplex byte stream.
- **Framing:** length‑prefixed messages (u32, big‑endian) followed by a single encoded message.

```
+----------------+-----------------------+
| u32 len (BE)   | message bytes (len)   |
+----------------+-----------------------+
```

## Encoding
- **Format:** CBOR (concise, schema‑less, stream‑friendly). Alternatives: MessagePack.
- **Reasoning:** small, easy to parse in C/Zig, supports typed maps/arrays.

## Message Envelope
Every frame is a CBOR map with the following keys:

| Key | Type   | Required | Notes |
|-----|--------|----------|-------|
| `v` | u32    | yes      | Protocol version. Start at `1`. |
| `t` | string | yes      | Message type (e.g. `exec_request`). |
| `id`| u32    | yes      | Request/response correlation id. |
| `p` | map    | yes      | Type‑specific payload. |

## Core Types (POC)

### `exec_request`
Payload (`p`):

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `cmd` | string | yes | Command to execute. |
| `argv` | array<string> | no | Optional argv (if absent, host supplies only `cmd`). |
| `env` | array<string> | no | Environment overrides (`KEY=VALUE`). |
| `cwd` | string | no | Working directory. |
| `stdin` | bool | no | If true, host will stream `stdin_data` frames. |

### `exec_response`
Sent once per request to signal completion.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `exit_code` | i32 | yes | Process exit code. |
| `signal` | i32 | no | Signal number if terminated by signal. |

### `exec_output`
Streamed zero or more times while the process is running.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `stream` | string | yes | `stdout` or `stderr`. |
| `data` | bytes | yes | Raw output chunk. |

### `stdin_data`
Host → guest stream for process stdin.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `data` | bytes | yes | Raw input chunk. |
| `eof` | bool | no | If true, close stdin. |

### `error`
Used for protocol/processing errors.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `code` | string | yes | Error code (e.g. `invalid_request`). |
| `message` | string | yes | Human‑readable error. |

## Future Extensibility
- **Versioning:** bump `v` for breaking changes.
- **New message types:** allowed without breaking older peers (ignore unknown `t`).
- **Filesystem operations:** planned message types (e.g. `fs_read`, `fs_write`, `fs_list`, `fs_stat`) using the same envelope and streaming patterns.
- **Large data:** use chunked `*_data` messages with `offset` fields if needed.

## Notes
- Keep frames small (e.g. 8–64KB) to avoid large buffering requirements.
- **POC constraint:** only one in‑flight request at a time. Use `id` to assert that any incoming `exec_request` arrives only after the prior `id` has completed; reject/`error` otherwise.
