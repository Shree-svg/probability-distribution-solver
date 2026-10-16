import type { DistributionParams } from '../engine/types';
import { evaluateSolverQuery } from './evaluator';
import { parseWordProblemLayerA } from './layer_a';
import type { LLMSchemaQuery, SolverResponse } from './types';

/**
 * Validates the raw JSON output from the Gemini LLM against the strict schema.
 */
function validateLLMOutput(data: unknown): LLMSchemaQuery | null {
  if (typeof data !== 'object' || data === null) return null;
  const obj = data as Record<string, unknown>;

  const validDists = ['binomial', 'poisson', 'normal', 'exponential', 'gamma', 'weibull'];
  if (typeof obj.distribution !== 'string' || !validDists.includes(obj.distribution)) {
    return null;
  }

  if (typeof obj.params !== 'object' || obj.params === null) {
    return null;
  }

  const query = obj.query as Record<string, unknown> | undefined;
  if (typeof query !== 'object' || query === null || typeof query.type !== 'string') {
    return null;
  }

  return data as LLMSchemaQuery;
}

/**
 * Builds DistributionParams adhering strictly to R conventions from the validated LLM schema.
 */
function toDistributionParams(schema: LLMSchemaQuery): DistributionParams | null {
  const p = schema.params;
  switch (schema.distribution) {
    case 'binomial':
      if (typeof p.size !== 'number' || typeof p.prob !== 'number') return null;
      return { type: 'binomial', params: { size: p.size, prob: p.prob } };
    case 'poisson':
      if (typeof p.lambda !== 'number') return null;
      return { type: 'poisson', params: { lambda: p.lambda } };
    case 'normal':
      if (typeof p.mean !== 'number' || typeof p.sd !== 'number') return null;
      return { type: 'normal', params: { mean: p.mean, sd: p.sd } };
    case 'exponential':
      if (typeof p.rate !== 'number') return null;
      return { type: 'exponential', params: { rate: p.rate } };
    case 'gamma':
      if (typeof p.shape !== 'number' || typeof p.rate !== 'number') return null;
      return { type: 'gamma', params: { shape: p.shape, rate: p.rate } };
    case 'weibull':
      if (typeof p.shape !== 'number' || typeof p.scale !== 'number') return null;
      return { type: 'weibull', params: { shape: p.shape, scale: p.scale } };
    default:
      return null;
  }
}

/**
 * Layer B: Optional server-side LLM call using Gemini API.
 * The LLM only parses the problem into distribution and query parameters.
 * The LLM NEVER computes any mathematical result.
 * If API key is missing, network fails, or validation fails, gracefully falls back to Layer A.
 */
export async function parseWordProblemLayerB(
  question: string,
  apiKey?: string
): Promise<SolverResponse> {
  const key = apiKey || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined);

  if (!key) {
    // No API key provided: fall back to Layer A
    return parseWordProblemLayerA(question);
  }

  try {
    const prompt = `You are a statistical problem parser. Analyze the following word problem and extract the probability distribution, parameters (using R parameterization conventions), and query type.
DO NOT compute any answer or result. Return ONLY valid JSON matching this schema:
{
  "distribution": "binomial" | "poisson" | "normal" | "exponential" | "gamma" | "weibull",
  "params": { ... },
  "parameterization_notes": string,
  "query": {
    "type": "prob_equal" | "prob_less_equal" | "prob_less" | "prob_greater_equal" | "prob_greater" | "prob_interval" | "quantile" | "mean" | "variance" | "sd" | "mgf" | "conditional_survival" | "find_x_for_p",
    "x": number,
    "a": number,
    "b": number,
    "p": number,
    "t": number,
    "s": number
  },
  "assumptions": string[]
}

Problem:
"${question}"`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      console.warn(`Gemini API returned ${response.status}. Falling back to Layer A.`);
      return parseWordProblemLayerA(question);
    }

    const jsonResponse = await response.json();
    const candidateText =
      jsonResponse?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return parseWordProblemLayerA(question);
    }

    const parsedJson = JSON.parse(candidateText);
    const validated = validateLLMOutput(parsedJson);

    if (!validated) {
      console.warn('Gemini response did not conform to schema. Falling back to Layer A.');
      return parseWordProblemLayerA(question);
    }

    const distParams = toDistributionParams(validated);
    if (!distParams) {
      console.warn('Invalid distribution params in LLM response. Falling back to Layer A.');
      return parseWordProblemLayerA(question);
    }

    // Evaluate parsed query strictly using mathematical engine (Rule 1)
    return evaluateSolverQuery(
      distParams,
      validated.query,
      validated.assumptions || [],
      'Layer B (Gemini API)',
      validated.parameterization_notes
    );
  } catch (error) {
    console.warn('Error invoking Gemini API. Falling back to Layer A:', error);
    return parseWordProblemLayerA(question);
  }
}
