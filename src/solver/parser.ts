import type { DistributionParams } from '../engine/types';
import type { QueryOp } from '../rgen/generator';
import { evaluateSolverQuery } from './evaluator';
import { parseWordProblemLayerA } from './layer_a';
import type { ParseResult, SolvedProblem, SolverQuery } from './types';

/**
 * Bridges the legacy solve(dist, query) interface with evaluateSolverQuery.
 */
export function solve(dist: DistributionParams, query: QueryOp): SolvedProblem {
  let solverQuery: SolverQuery;

  switch (query.op) {
    case 'pdf':
      solverQuery = { type: 'prob_equal', x: query.x };
      break;
    case 'cdf':
      if (query.lowerTail === false) {
        solverQuery = { type: 'prob_greater', x: query.q };
      } else {
        solverQuery = { type: 'prob_less_equal', x: query.q };
      }
      break;
    case 'interval':
      solverQuery = { type: 'prob_interval', a: query.lower, b: query.upper };
      break;
    case 'quantile':
      solverQuery = { type: 'quantile', p: query.p };
      break;
    default:
      solverQuery = { type: 'prob_less_equal', x: 0 };
  }

  return evaluateSolverQuery(dist, solverQuery, [], 'Layer A (Rule-Based)');
}

/**
 * Parses freeform natural language or structured question into a ParseResult.
 */
export function parseAndSolve(text: string): ParseResult {
  const result = parseWordProblemLayerA(text);
  if (result.success) {
    return {
      success: true,
      problem: result,
    };
  } else if ('needsClarification' in result && result.needsClarification) {
    return {
      success: false,
      error: `[Clarification Needed] ${result.clarifyingQuestion}`,
    };
  } else {
    return {
      success: false,
      error: ('error' in result && result.error) ? result.error : 'Failed to solve problem.',
    };
  }
}
