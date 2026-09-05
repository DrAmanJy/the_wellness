export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ProcedureSignature<TInput = unknown, TOutput = unknown> {
  name: string;
  method: HttpMethod;
  path: string;
  authRequired?: boolean;
  adminOnly?: boolean;
  description?: string;
  _input?: TInput;
  _output?: TOutput;
}

export function createProcedure<TInput = unknown, TOutput = unknown>(
  config: Omit<ProcedureSignature<TInput, TOutput>, '_input' | '_output'>,
): ProcedureSignature<TInput, TOutput> {
  return config;
}
