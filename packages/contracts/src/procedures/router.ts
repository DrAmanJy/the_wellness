import { ProcedureSignature } from './core';

export type ProcedureHandler = (...args: never[]) => unknown;

export interface ProcedureRouter {
  get(path: string, ...handlers: ProcedureHandler[]): unknown;
  post(path: string, ...handlers: ProcedureHandler[]): unknown;
  put(path: string, ...handlers: ProcedureHandler[]): unknown;
  patch(path: string, ...handlers: ProcedureHandler[]): unknown;
  delete(path: string, ...handlers: ProcedureHandler[]): unknown;
}

export function bindProcedure<TInput, TOutput>(
  router: ProcedureRouter,
  procedure: ProcedureSignature<TInput, TOutput>,
  ...handlers: ProcedureHandler[]
): void {
  const method = procedure.method.toLowerCase() as keyof ProcedureRouter;
  if (typeof router[method] === 'function') {
    router[method](procedure.path, ...handlers);
  }
}
