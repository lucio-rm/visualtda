export interface WorkerInitRequest {
  id: string;
  type: 'init';
}

export interface WorkerInitResponse {
  id: string;
  type: 'init_result';
  success: boolean;
  ready: boolean;
  error?: string;
}

export interface WorkerRunRequest {
  id: string;
  type: 'run';
  code: string;
  functionName: string;
  args: unknown[];
  timeoutMs?: number;
}

export interface WorkerRunResponse {
  id: string;
  type: 'run_result';
  success: boolean;
  result?: unknown;
  stdout?: string;
  error?: string;
  executionTimeMs: number;
}

export type WorkerInboundMessage = WorkerInitRequest | WorkerRunRequest;
export type WorkerOutboundMessage = WorkerInitResponse | WorkerRunResponse;
