import type { DistributionParams, DistributionType } from '../engine/types';
import { evaluateSolverQuery } from './evaluator';
import type { ClarificationRequired, SolverQuery, SolverResponse } from './types';

/**
 * Layer A: Offline, deterministic, rule-based natural language parser.
 * Maps word problems into structured distribution parameters and queries.
 * Strictly adheres to R parameterization conventions and handles conversions.
 */
export function parseWordProblemLayerA(rawText: string): SolverResponse {
  const text = rawText.trim();
  if (!text) {
    return {
      success: false,
      needsClarification: true,
      clarifyingQuestion: 'The problem statement is empty. Please enter a probability question.',
      assumptions: [],
    };
  }

  const lower = text.toLowerCase();
  const assumptions: string[] = [];

  // ==========================================
  // 1. Distribution Detection (Explicit names take priority)
  // ==========================================
  let detectedDist: DistributionType | null = null;

  if (lower.includes('normal') || lower.includes('gaussian') || lower.includes('standard normal')) {
    detectedDist = 'normal';
  } else if (lower.includes('weibull')) {
    detectedDist = 'weibull';
  } else if (lower.includes('gamma')) {
    detectedDist = 'gamma';
  } else if (lower.includes('binomial')) {
    detectedDist = 'binomial';
  } else if (lower.includes('poisson')) {
    detectedDist = 'poisson';
  } else if (lower.includes('exponential') || lower.includes('memoryless')) {
    detectedDist = 'exponential';
  } else {
    // Domain context clues when explicit name is omitted
    if (
      lower.includes('waiting time') ||
      lower.includes('time between') ||
      lower.includes('lifetime') ||
      lower.includes('time until failure') ||
      lower.includes('service time')
    ) {
      detectedDist = 'exponential';
    } else if (
      lower.includes('per hour') ||
      lower.includes('per minute') ||
      lower.includes('per day') ||
      lower.includes('per week') ||
      lower.includes('per month') ||
      lower.includes('per year') ||
      lower.includes('arrivals')
    ) {
      detectedDist = 'poisson';
    } else if (
      lower.includes('n trials') ||
      lower.includes('trials') ||
      lower.includes('probability of success') ||
      lower.includes('success rate') ||
      lower.includes('successes') ||
      lower.includes('free throws') ||
      lower.includes('defective') ||
      lower.includes('chance of being defective') ||
      lower.includes('coin flip') ||
      lower.includes('toss') ||
      lower.includes('multiple choice')
    ) {
      detectedDist = 'binomial';
    } else if (lower.includes('standard deviation') || lower.includes('bell curve') || lower.includes('z-score')) {
      detectedDist = 'normal';
    }
  }

  if (!detectedDist) {
    return {
      success: false,
      needsClarification: true,
      clarifyingQuestion:
        'Could not determine the probability distribution. Is this a Normal, Binomial, Poisson, Exponential, Gamma, or Weibull model?',
      assumptions: [],
    };
  }

  // ==========================================
  // 2. Parameter Extraction & Conversions
  // ==========================================
  let distParams: DistributionParams | null = null;
  let parameterizationNotes: string | undefined;

  switch (detectedDist) {
    case 'normal': {
      let mean: number | null = null;
      let sd: number | null = null;

      if (lower.includes('standard normal')) {
        mean = 0;
        sd = 1;
        assumptions.push('Standard Normal distribution specified (mean = 0, sd = 1)');
      }

      // Mean extraction
      const meanMatch =
        lower.match(/(?:mean|average|mu)\s*(?:of|is|=|:)?\s*(-?[0-9]*\.?[0-9]+)/) ||
        lower.match(/n\(\s*(-?[0-9]*\.?[0-9]+)\s*,/);
      if (meanMatch && mean === null) {
        mean = parseFloat(meanMatch[1]);
      }

      // SD extraction
      const sdMatch =
        lower.match(/(?:standard deviation|stdev|sd|sigma)\s*(?:of|is|=|:)?\s*([0-9]*\.?[0-9]+)/) ||
        lower.match(/n\(\s*-?[0-9]*\.?[0-9]+\s*,\s*([0-9]*\.?[0-9]+)\s*\)/);
      // Variance extraction
      const varMatch = lower.match(/(?:variance|var|sigma\^2)\s*(?:of|is|=|:)?\s*([0-9]*\.?[0-9]+)/);

      if (sdMatch && sd === null) {
        sd = parseFloat(sdMatch[1]);
      } else if (varMatch && sd === null) {
        const varianceVal = parseFloat(varMatch[1]);
        if (varianceVal > 0) {
          sd = Math.sqrt(varianceVal);
          assumptions.push(`Converted given variance (${varianceVal}) to standard deviation sigma = sqrt(${varianceVal}) = ${sd}`);
        }
      }

      if (mean === null) {
        return makeClarification(
          'What is the mean (mu) of the Normal distribution?',
          'normal',
          assumptions
        );
      }
      if (sd === null || sd <= 0) {
        return makeClarification(
          'What is the standard deviation (sigma) or variance of the Normal distribution?',
          'normal',
          assumptions
        );
      }

      distParams = { type: 'normal', params: { mean, sd } };
      break;
    }

    case 'binomial': {
      let size: number | null = null;
      let prob: number | null = null;

      // Size (n) extraction - prioritized domain counts before generic \bn\b
      const nMatch =
        lower.match(/([0-9]+)\s*(?:repeated\s+)?trials\b/) ||
        lower.match(/([0-9]+)\s*(?:free\s+throws|bits|patients|tickets|items|coins|questions|tablets|boards|cells|bolts|connectors)\b/) ||
        lower.match(/(?:sample of|samples|sample size of|out of|exam with|takes|examines|inspects|tests|checks)\s*([0-9]+)/) ||
        lower.match(/\b(?:size|n)\b\s*(?:of|is|=|:)?\s*([0-9]+)/);
      if (nMatch) {
        size = parseInt(nMatch[1], 10);
      }

      // Probability (p) extraction - strict keyword matching so query x is never confused with p
      const pMatch =
        lower.match(/(?:probability of success|prob|success rate|chance of winning|chance of being defective)\s*(?:on each trial\s+)?(?:of|is|=|:)?\s*([0-9]*\.?[0-9]+%?)/) ||
        lower.match(/(?:probability of success|success rate|chance of being defective)[^.?\n]*?(?:is|=|:)\s*([0-9]*\.?[0-9]+%?)/) ||
        lower.match(/([0-9]*\.?[0-9]+%?)\s*(?:probability of success|success rate|chance of winning|chance of being defective)/) ||
        lower.match(/\bp\b\s*[:=]\s*([0-9]*\.?[0-9]+%?)/) ||
        lower.match(/([0-9]+(?:\.[0-9]+)?)\s*%\s*(?:success|chance|rate|probability|defective)/);

      if (pMatch) {
        let pStr = pMatch[1];
        let pVal = pStr.endsWith('%') ? parseFloat(pStr.slice(0, -1)) / 100 : parseFloat(pStr);
        if (pVal > 1 && pVal <= 100) {
          pVal /= 100;
          assumptions.push(`Converted percentage ${pStr} to probability ${pVal}`);
        }
        prob = pVal;
      } else if (lower.includes('fair coin')) {
        prob = 0.5;
        assumptions.push('Assumed fair coin with p = 0.5');
      }

      if (size === null) {
        return makeClarification(
          'What is the number of trials (n) for the Binomial distribution?',
          'binomial',
          assumptions
        );
      }
      if (prob === null) {
        return makeClarification(
          'What is the probability of success (p) for each trial?',
          'binomial',
          assumptions
        );
      }

      assumptions.push('Assumed independent Bernoulli trials with constant probability of success');
      distParams = { type: 'binomial', params: { size, prob } };
      break;
    }

    case 'poisson': {
      let lambda: number | null = null;

      const lambdaMatch =
        lower.match(/(?:lambda|rate|average rate|average|mean)\s*(?:of|is|=|:)?\s*([0-9]*\.?[0-9]+)/) ||
        lower.match(/([0-9]*\.?[0-9]+)\s*(?:events?|occurrences?|customers?|calls?|accidents?|arrivals?|errors?|flaws?|specialty cakes|particles|earthquakes)\s+(?:per|in)/);

      if (lambdaMatch) {
        lambda = parseFloat(lambdaMatch[1]);
      }

      if (lambda === null || lambda <= 0) {
        return makeClarification(
          'What is the average event rate (lambda) for the Poisson process?',
          'poisson',
          assumptions
        );
      }

      assumptions.push('Assumed events occur independently at a constant average rate');
      distParams = { type: 'poisson', params: { lambda } };
      break;
    }

    case 'exponential': {
      let rate: number | null = null;

      const meanWaitMatch =
        lower.match(/(?:mean waiting time|mean lifetime|mean duration|mean service time|mean time|mean)\s*(?:between arrivals\s+)?(?:of|is|=|:)?\s*([0-9]*\.?[0-9]+)/);

      const directRateMatch =
        lower.match(/(?:rate|lambda)\s*(?:of|is|=|:)?\s*([0-9]*\.?[0-9]+)/) ||
        lower.match(/exp(?:onential)?\(\s*([0-9]*\.?[0-9]+)\s*\)/);

      if (directRateMatch) {
        rate = parseFloat(directRateMatch[1]);
      } else if (meanWaitMatch) {
        const meanVal = parseFloat(meanWaitMatch[1]);
        if (meanVal > 0) {
          rate = 1.0 / meanVal;
          assumptions.push(`Converted mean time (${meanVal}) to rate lambda = 1 / mean = ${rate}`);
        }
      }

      if (rate === null || rate <= 0) {
        return makeClarification(
          'What is the rate parameter (lambda) or mean waiting time for the Exponential distribution?',
          'exponential',
          assumptions
        );
      }

      assumptions.push('Assumed constant hazard rate (memoryless property)');
      distParams = { type: 'exponential', params: { rate } };
      break;
    }

    case 'gamma': {
      let shape: number | null = null;
      let rate: number | null = null;

      const shapeMatch = lower.match(/(?:shape|alpha|k)\s*(?:of|is|=|:)?\s*([0-9]*\.?[0-9]+)/);
      if (shapeMatch) shape = parseFloat(shapeMatch[1]);

      const rateMatch = lower.match(/(?:rate|lambda)\s*(?:of|is|=|:)?\s*([0-9]*\.?[0-9]+)/);
      const scaleMatch = lower.match(/(?:scale|theta|beta)\s*(?:of|is|=|:)?\s*([0-9]*\.?[0-9]+)/);

      if (rateMatch) {
        rate = parseFloat(rateMatch[1]);
      } else if (scaleMatch) {
        const scaleVal = parseFloat(scaleMatch[1]);
        if (scaleVal > 0) {
          rate = 1.0 / scaleVal;
          parameterizationNotes = `Converted scale (${scaleVal}) to rate lambda = 1/scale = ${rate} (R parameterization uses rate).`;
          assumptions.push(parameterizationNotes);
        }
      }

      if (shape === null || shape <= 0) {
        return makeClarification(
          'What is the shape parameter (alpha) for the Gamma distribution?',
          'gamma',
          assumptions
        );
      }
      if (rate === null || rate <= 0) {
        return makeClarification(
          'What is the rate (lambda) or scale for the Gamma distribution?',
          'gamma',
          assumptions
        );
      }

      distParams = { type: 'gamma', params: { shape, rate } };
      break;
    }

    case 'weibull': {
      let shape: number | null = null;
      let scale: number | null = null;

      const shapeMatch = lower.match(/(?:shape|k)\s*(?:of|is|=|:)?\s*([0-9]*\.?[0-9]+)/);
      if (shapeMatch) shape = parseFloat(shapeMatch[1]);

      const scaleMatch = lower.match(/(?:scale|lambda)\s*(?:of|is|=|:)?\s*([0-9]*\.?[0-9]+)/);
      const rateMatch = lower.match(/(?:rate)\s*(?:of|is|=|:)?\s*([0-9]*\.?[0-9]+)/);

      if (scaleMatch) {
        scale = parseFloat(scaleMatch[1]);
      } else if (rateMatch) {
        const rateVal = parseFloat(rateMatch[1]);
        if (rateVal > 0) {
          scale = 1.0 / rateVal;
          parameterizationNotes = `Converted rate (${rateVal}) to scale lambda = 1/rate = ${scale} (R parameterization uses scale).`;
          assumptions.push(parameterizationNotes);
        }
      }

      if (shape === null || shape <= 0) {
        return makeClarification(
          'What is the shape parameter (k) for the Weibull distribution?',
          'weibull',
          assumptions
        );
      }
      if (scale === null || scale <= 0) {
        return makeClarification(
          'What is the scale parameter (lambda) for the Weibull distribution?',
          'weibull',
          assumptions
        );
      }

      distParams = { type: 'weibull', params: { shape, scale } };
      break;
    }
  }

  if (!distParams) {
    return {
      success: false,
      needsClarification: true,
      clarifyingQuestion: 'Could not determine required parameters for the specified distribution.',
      assumptions,
    };
  }

  // ==========================================
  // 3. Query Type Extraction
  // ==========================================
  let query: SolverQuery | null = null;

  // A. Moment Generating Function at t
  const mgfMatch = lower.match(/(?:moment generating function|mgf)\s*(?:at\s+t\s*=\s*|at\s+t\s+of\s+|at\s+t\s+)?(-?[0-9]*\.?[0-9]+)/);
  if (mgfMatch) {
    query = { type: 'mgf', t: parseFloat(mgfMatch[1]) };
  }

  // B. Conditional Survival P(X > s + t | X > s)
  if (!query) {
    const condMatch =
      lower.match(/p\(\s*x\s*>\s*([0-9]*\.?[0-9]+)\s*\|\s*x\s*>\s*([0-9]*\.?[0-9]+)\s*\)/) ||
      lower.match(/(?:survived|exceeds?|greater than)\s+([0-9]*\.?[0-9]+).+?(?:additional|survives?|exceeds?)\s+([0-9]*\.?[0-9]+)/);

    if (condMatch) {
      const num1 = parseFloat(condMatch[1]);
      const num2 = parseFloat(condMatch[2]);
      let s: number;
      let t: number;
      if (lower.includes('additional')) {
        s = num1;
        t = num2;
      } else {
        s = Math.min(num1, num2);
        const st = Math.max(num1, num2);
        t = st - s;
      }
      query = { type: 'conditional_survival', s, t };
      assumptions.push(`Evaluated conditional probability P(X > ${s + t} | X > ${s}) = P(X > ${s} + ${t} | X > ${s})`);
    }
  }

  // C. Moments: Mean, Variance, Standard Deviation
  if (!query) {
    if (
      lower.includes('standard deviation') &&
      (lower.includes('what is the standard deviation') || lower.includes('find the standard deviation') || lower.includes('find standard deviation') || lower.includes('calculate standard deviation'))
    ) {
      query = { type: 'sd' };
    } else if (
      lower.includes('variance') &&
      (lower.includes('what is the variance') || lower.includes('find the variance') || lower.includes('find variance') || lower.includes('calculate variance'))
    ) {
      query = { type: 'variance' };
    } else if (
      (lower.includes('expected value') || lower.includes('mean')) &&
      (lower.includes('what is the expected value') || lower.includes('what is the mean') || lower.includes('find the expected value') || lower.includes('expected number') || lower.includes('expected value of'))
    ) {
      query = { type: 'mean' };
    }
  }

  // D. "Find value such that P = p" / Quantile / Percentile
  if (!query) {
    const findPValMatch =
      lower.match(/(?:find\s+(?:the\s+)?(?:value|x|cutoff|threshold)\s+such\s+that\s+p\s*(?:[<=<>=]+)?\s*[:=]?\s*|cutoff\s+for\s+(?:top|bottom)\s+)([0-9]*\.?[0-9]+%?)/) ||
      lower.match(/([0-9]+(?:\.[0-9]+)?)(?:th|st|nd|rd)\s+percentile/) ||
      lower.match(/(?:quantile|percentile)\s*[:=]?\s*([0-9]*\.?[0-9]+)/);

    if (findPValMatch) {
      let pStr = findPValMatch[1];
      let pVal = pStr.endsWith('%') ? parseFloat(pStr.slice(0, -1)) / 100 : parseFloat(pStr);
      if (pVal > 1 && pVal <= 100) pVal /= 100;

      let direction: SolverQuery['direction'] = 'less_equal';
      if (lower.includes('top') || lower.includes('exceed') || lower.includes('greater than') || lower.includes('longest')) {
        direction = 'greater';
      }

      query = { type: 'find_x_for_p', p: pVal, direction };
    } else if (lower.includes('median')) {
      query = { type: 'quantile', p: 0.5 };
    } else if (lower.includes('first quartile') || lower.includes('lower quartile') || lower.includes('q1')) {
      query = { type: 'quantile', p: 0.25 };
    } else if (lower.includes('third quartile') || lower.includes('upper quartile') || lower.includes('q3')) {
      query = { type: 'quantile', p: 0.75 };
    }
  }

  // E. Within k of the mean: P(mu - k <= X <= mu + k)
  if (!query) {
    const withinMatch = lower.match(/within\s+([0-9]*\.?[0-9]+)\s+(?:units?\s+|points?\s+)?(?:of\s+(?:the\s+)?mean)/);
    if (withinMatch && distParams.type === 'normal') {
      const k = parseFloat(withinMatch[1]);
      const mu = distParams.params.mean;
      query = { type: 'prob_interval', a: mu - k, b: mu + k };
      assumptions.push(`Interpreted 'within ${k} of the mean' as interval [${mu - k}, ${mu + k}]`);
    }
  }

  // F. Interval P(a <= X <= b) / Between a and b
  if (!query) {
    const intervalMatch =
      lower.match(/(?:between|from|interval)\s+(-?[0-9]*\.?[0-9]+)\s+(?:and|to)\s+(-?[0-9]*\.?[0-9]+)/) ||
      lower.match(/p\(\s*(-?[0-9]*\.?[0-9]+)\s*<=\s*x\s*<=\s*(-?[0-9]*\.?[0-9]+)\s*\)/);

    if (intervalMatch) {
      const a = parseFloat(intervalMatch[1]);
      const b = parseFloat(intervalMatch[2]);
      query = { type: 'prob_interval', a, b };
    }
  }

  // G. Upper Tail: "at least" P(X >= x)
  if (!query) {
    const atLeastMatch =
      lower.match(/(?:at\s+least|no\s+less\s+than|greater\s+than\s+or\s+equal\s+to|minimum\s+of)\s+(-?[0-9]*\.?[0-9]+)/) ||
      lower.match(/p\(\s*x\s*>=\s*(-?[0-9]*\.?[0-9]+)\s*\)/);
    if (atLeastMatch) {
      query = { type: 'prob_greater_equal', x: parseFloat(atLeastMatch[1]) };
    }
  }

  // H. Upper Tail: "more than" / "exceeds" / "taller than" / "greater than" P(X > x)
  if (!query) {
    const moreThanMatch =
      lower.match(/(?:more\s+than|strictly\s+greater\s+than|greater\s+than|taller\s+than|higher\s+than|heavier\s+than|exceeds?|above|longer\s+than|over)\s+(-?[0-9]*\.?[0-9]+)/) ||
      lower.match(/p\(\s*x\s*>\s*(-?[0-9]*\.?[0-9]+)\s*\)/);
    if (moreThanMatch) {
      query = { type: 'prob_greater', x: parseFloat(moreThanMatch[1]) };
    }
  }

  // I. Lower Tail: "at most" / "within" P(X <= x)
  if (!query) {
    const atMostMatch =
      lower.match(/(?:at\s+most|no\s+more\s+than|less\s+than\s+or\s+equal\s+to|maximum\s+of)\s+(-?[0-9]*\.?[0-9]+)/) ||
      lower.match(/(?:fails?\s+within|within)\s+(-?[0-9]*\.?[0-9]+)\s*(?:years?|hours?|days?|minutes?|seconds?|weeks?|months?|items?|trials?)/) ||
      lower.match(/p\(\s*x\s*<=\s*(-?[0-9]*\.?[0-9]+)\s*\)/);
    if (atMostMatch) {
      query = { type: 'prob_less_equal', x: parseFloat(atMostMatch[1]) };
    }
  }

  // J. Lower Tail: "fewer than" / "less than" / "shorter than" P(X < x)
  if (!query) {
    const fewerThanMatch =
      lower.match(/(?:fewer\s+than|strictly\s+less\s+than|less\s+than|shorter\s+than|lower\s+than|lighter\s+than|under|below)\s+(-?[0-9]*\.?[0-9]+)/) ||
      lower.match(/p\(\s*x\s*<\s*(-?[0-9]*\.?[0-9]+)\s*\)/);
    if (fewerThanMatch) {
      query = { type: 'prob_less', x: parseFloat(fewerThanMatch[1]) };
    }
  }

  // K. Equality: "exactly" P(X = x)
  if (!query) {
    const exactMatch =
      lower.match(/(?:exactly|equal\s+to|equals?|probability\s+of\s+getting\s+exactly|probability\s+of\s+receiving\s+exactly)\s+(-?[0-9]*\.?[0-9]+)/) ||
      lower.match(/(?:probability of|chance of)\s+([0-9]+)\s+(?:correct|successes|arrivals|failures|defective|errors|earthquakes|calls)/) ||
      lower.match(/p\(\s*x\s*=\s*(-?[0-9]*\.?[0-9]+)\s*\)/);
    if (exactMatch) {
      query = { type: 'prob_equal', x: parseFloat(exactMatch[1]) };
    }
  }

  if (!query) {
    return {
      success: false,
      needsClarification: true,
      clarifyingQuestion:
        'Could not identify the specific query. What probability, quantile, or moment do you want to calculate?',
      detectedDistribution: detectedDist,
      assumptions,
    };
  }

  // Evaluate query strictly through mathematical engine
  try {
    const evaluated = evaluateSolverQuery(
      distParams,
      query,
      assumptions,
      'Layer A (Rule-Based)',
      parameterizationNotes
    );
    return evaluated;
  } catch (err: unknown) {
    return {
      success: false,
      needsClarification: false,
      error: err instanceof Error ? err.message : String(err),
      assumptions,
    };
  }
}

function makeClarification(
  question: string,
  dist: DistributionType,
  assumptions: string[]
): ClarificationRequired {
  return {
    success: false,
    needsClarification: true,
    clarifyingQuestion: question,
    detectedDistribution: dist,
    assumptions,
  };
}
