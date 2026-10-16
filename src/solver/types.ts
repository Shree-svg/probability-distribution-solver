import type { DistributionParams, DistributionType } from '../engine/types';

export type SolverQueryType =
  | 'prob_equal'            // P(X = x)
  | 'prob_less_equal'       // P(X <= x)
  | 'prob_less'             // P(X < x)
  | 'prob_greater_equal'    // P(X >= x)
  | 'prob_greater'          // P(X > x)
  | 'prob_interval'         // P(a <= X <= b)
  | 'quantile'              // Q(p) or percentile
  | 'mean'                  // Expected value E[X]
  | 'variance'              // Var(X)
  | 'sd'                    // Standard deviation SD(X)
  | 'mgf'                   // Moment generating function M_X(t)
  | 'conditional_survival'  // P(X > s + t | X > s)
  | 'find_x_for_p';         // Find cutoff value such that P = p

export interface SolverQuery {
  type: SolverQueryType;
  x?: number;
  a?: number;
  b?: number;
  p?: number;
  t?: number;
  s?: number;
  direction?: 'less_equal' | 'greater_equal' | 'greater' | 'less'; // for find_x_for_p
}

export interface SolvedStep {
  stepNumber: number;
  title: string;
  explanation: string;
  formula?: string;
  substituted?: string;
  result?: string;
}

export interface SolvedProblem {
  success: true;
  distribution: DistributionParams;
  query: SolverQuery;
  assumptions: string[];
  steps: SolvedStep[];
  resultValue: number;
  formattedResult: string;
  rCode: string;
  rScript?: string;
  layerUsed: 'Layer A (Rule-Based)' | 'Layer B (Gemini API)';
  parameterizationNotes?: string;
  explanation: string;
}

export type ParseResult =
  | { success: true; problem: SolvedProblem }
  | { success: false; error: string };

export interface ClarificationRequired {
  success: false;
  needsClarification: true;
  clarifyingQuestion: string;
  detectedDistribution?: DistributionType;
  assumptions: string[];
}

export interface SolverError {
  success: false;
  needsClarification: false;
  error: string;
  assumptions: string[];
}

export type SolverResponse = SolvedProblem | ClarificationRequired | SolverError;

export interface LLMSchemaQuery {
  distribution: 'binomial' | 'poisson' | 'normal' | 'exponential' | 'gamma' | 'weibull';
  params: Record<string, number>;
  parameterization_notes?: string;
  query: {
    type: SolverQueryType;
    x?: number;
    a?: number;
    b?: number;
    p?: number;
    t?: number;
    s?: number;
  };
  assumptions?: string[];
}
