export { SandboxVfsProvider } from "./provider";
export type { VfsBackend, VfsBackendHandle, VfsHooks, VfsHookContext } from "./provider";
export { InMemoryFsBackend, InMemoryFileHandle } from "./in-memory";
export { FsRpcClient, RpcFsBackend, RpcFileHandle } from "./rpc";
export { FsRpcService, type FsRpcMetrics, MAX_RPC_DATA } from "./rpc-service";
export { VfsStats, VfsDirent } from "./stats";
