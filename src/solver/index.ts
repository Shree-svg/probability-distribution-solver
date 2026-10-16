export * from './types';
export * from './evaluator';
export * from './layer_a';
export * from './layer_b';
export * from './server';

// Backward compatibility alias for UI and earlier callers
import { parseWordProblemLayerA } from './layer_a';
import type { SolverResponse } from './types';

export function parseAndSolve(text: string) {
  const res: SolverResponse = parseWordProblemLayerA(text);
  if (res.success) {
    return {
      success: true as const,
      problem: res,
    };
  } else if ('needsClarification' in res && res.needsClarification) {
    return {
      success: false as const,
      error: `[Clarification Needed] ${res.clarifyingQuestion}`,
    };
  } else {
    return {
      success: false as const,
      error: ('error' in res && res.error) ? res.error : 'Failed to solve problem.',
    };
  }
}
