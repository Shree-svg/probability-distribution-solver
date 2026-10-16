import {
  conditionalSurvival,
  dbinom,
  dexp,
  dgamma,
  dnorm,
  dpois,
  dweibull,
  mgfBinomial,
  mgfExponential,
  mgfGamma,
  mgfNormal,
  mgfPoisson,
  mgfWeibull,
  pbinom,
  pexp,
  pgamma,
  pnorm,
  ppois,
  pweibull,
  qbinom,
  qexp,
  qgamma,
  qnorm,
  qpois,
  qweibull,
  sbinom,
  sexp,
  sgamma,
  snorm,
  spois,
  statsBinomial,
  statsExponential,
  statsGamma,
  statsNormal,
  statsPoisson,
  statsWeibull,
  sweibull,
} from '../engine/distributions';
import type { DistributionParams } from '../engine/types';
import {
  assertValidNumber,
  safeFormatNumber,
  validateDistributionParams,
  validateProbability,
} from '../engine/validator';
import { generateRScript } from '../rgen';
import type { SolvedProblem, SolvedStep, SolverQuery } from './types';

export function evaluateSolverQuery(
  dist: DistributionParams,
  query: SolverQuery,
  assumptions: string[] = [],
  layerUsed: 'Layer A (Rule-Based)' | 'Layer B (Gemini API)' = 'Layer A (Rule-Based)',
  parameterizationNotes?: string
): SolvedProblem {
  const validDist = validateDistributionParams(dist);
  if (!validDist.isValid) {
    throw new Error(validDist.error);
  }

  const steps: SolvedStep[] = [];
  let resultValue: number;
  let rCode: string;

  // Step 1: Distribution Identification
  let distSummary = '';
  switch (dist.type) {
    case 'binomial':
      distSummary = `Binomial(size n = ${dist.params.size}, prob p = ${dist.params.prob})`;
      break;
    case 'poisson':
      distSummary = `Poisson(lambda = ${dist.params.lambda})`;
      break;
    case 'normal':
      distSummary = `Normal(mean mu = ${dist.params.mean}, sd sigma = ${dist.params.sd})`;
      break;
    case 'exponential':
      distSummary = `Exponential(rate lambda = ${dist.params.rate})`;
      break;
    case 'gamma':
      distSummary = `Gamma(shape alpha = ${dist.params.shape}, rate lambda = ${dist.params.rate})`;
      break;
    case 'weibull':
      distSummary = `Weibull(shape k = ${dist.params.shape}, scale lambda = ${dist.params.scale})`;
      break;
  }

  steps.push({
    stepNumber: 1,
    title: 'Distribution Identification & Parameterization',
    explanation: `Identify distribution as ${distSummary}. Parameters conform to standard R convention.`,
    result: distSummary,
  });

  // Step 2: Assumptions or Model Definition
  if (assumptions.length > 0) {
    steps.push({
      stepNumber: 2,
      title: 'Modeling Assumptions',
      explanation: assumptions.map((a, i) => `(${i + 1}) ${a}`).join('; '),
    });
  } else {
    steps.push({
      stepNumber: 2,
      title: 'Model Definition & Support',
      explanation:
        dist.type === 'binomial' || dist.type === 'poisson'
          ? 'Model treated as discrete distribution with integer support under standard R conventions.'
          : `Model treated as continuous distribution with support on ${
              dist.type === 'normal' ? '(-∞, +∞)' : '[0, +∞)'
            } under standard R conventions.`,
    });
  }

  const isDiscrete = dist.type === 'binomial' || dist.type === 'poisson';

  // Step 3-5: Query Evaluation
  switch (query.type) {
    case 'prob_equal': {
      const x = query.x ?? 0;
      if (dist.type === 'binomial') {
        resultValue = dbinom(x, dist.params.size, dist.params.prob);
        rCode = `dbinom(${x}, size = ${dist.params.size}, prob = ${dist.params.prob})`;
        steps.push({
          stepNumber: steps.length + 1,
          title: 'PMF Formulation',
          explanation: 'Evaluate binomial probability mass function P(X = x) = (n choose x) * p^x * (1-p)^(n-x)',
          formula: 'P(X = x) = C(n, x) * p^x * (1 - p)^(n - x)',
          substituted: `C(${dist.params.size}, ${x}) * (${dist.params.prob})^${x} * (1 - ${dist.params.prob})^(${dist.params.size} - ${x})`,
          result: safeFormatNumber(resultValue, 6),
        });
      } else if (dist.type === 'poisson') {
        resultValue = dpois(x, dist.params.lambda);
        rCode = `dpois(${x}, lambda = ${dist.params.lambda})`;
        steps.push({
          stepNumber: steps.length + 1,
          title: 'PMF Formulation',
          explanation: 'Evaluate Poisson probability mass function P(X = x) = lambda^x * exp(-lambda) / x!',
          formula: 'P(X = x) = (lambda^x * e^(-lambda)) / x!',
          substituted: `(${dist.params.lambda}^${x} * e^(-${dist.params.lambda})) / ${x}!`,
          result: safeFormatNumber(resultValue, 6),
        });
      } else {
        // Continuous distribution
        let pdfVal: number;
        if (dist.type === 'normal') {
          pdfVal = dnorm(x, dist.params.mean, dist.params.sd);
          rCode = `dnorm(${x}, mean = ${dist.params.mean}, sd = ${dist.params.sd})`;
        } else if (dist.type === 'exponential') {
          pdfVal = dexp(x, dist.params.rate);
          rCode = `dexp(${x}, rate = ${dist.params.rate})`;
        } else if (dist.type === 'gamma') {
          pdfVal = dgamma(x, dist.params.shape, dist.params.rate);
          rCode = `dgamma(${x}, shape = ${dist.params.shape}, rate = ${dist.params.rate})`;
        } else {
          pdfVal = dweibull(x, dist.params.shape, dist.params.scale);
          rCode = `dweibull(${x}, shape = ${dist.params.shape}, scale = ${dist.params.scale})`;
        }
        resultValue = 0; // Exactly 0 for point in continuous distribution
        steps.push({
          stepNumber: steps.length + 1,
          title: 'Continuous Distribution Point Probability',
          explanation: `For continuous distributions, P(X = ${x}) = 0 strictly. Probability density at this point is f(${x}) = ${safeFormatNumber(pdfVal, 6)}.`,
          formula: 'P(X = x) = 0 for continuous random variables; f(x) gives the density height.',
          result: '0 (density = ' + safeFormatNumber(pdfVal, 6) + ')',
        });
      }
      break;
    }

    case 'prob_less_equal': {
      const x = query.x ?? 0;
      if (dist.type === 'binomial') {
        resultValue = pbinom(x, dist.params.size, dist.params.prob);
        rCode = `pbinom(${x}, size = ${dist.params.size}, prob = ${dist.params.prob})`;
      } else if (dist.type === 'poisson') {
        resultValue = ppois(x, dist.params.lambda);
        rCode = `ppois(${x}, lambda = ${dist.params.lambda})`;
      } else if (dist.type === 'normal') {
        resultValue = pnorm(x, dist.params.mean, dist.params.sd);
        rCode = `pnorm(${x}, mean = ${dist.params.mean}, sd = ${dist.params.sd})`;
      } else if (dist.type === 'exponential') {
        resultValue = pexp(x, dist.params.rate);
        rCode = `pexp(${x}, rate = ${dist.params.rate})`;
      } else if (dist.type === 'gamma') {
        resultValue = pgamma(x, dist.params.shape, dist.params.rate);
        rCode = `pgamma(${x}, shape = ${dist.params.shape}, rate = ${dist.params.rate})`;
      } else {
        resultValue = pweibull(x, dist.params.shape, dist.params.scale);
        rCode = `pweibull(${x}, shape = ${dist.params.shape}, scale = ${dist.params.scale})`;
      }
      steps.push({
        stepNumber: steps.length + 1,
        title: 'Cumulative Probability P(X <= x)',
        explanation: `Evaluate cumulative distribution function F(${x}) = P(X <= ${x}).`,
        formula: 'P(X <= x) = F(x)',
        substituted: `F(${x})`,
        result: safeFormatNumber(resultValue, 6),
      });
      break;
    }

    case 'prob_less': {
      const x = query.x ?? 0;
      if (isDiscrete) {
        const k = x - 1;
        if (dist.type === 'binomial') {
          resultValue = pbinom(k, dist.params.size, dist.params.prob);
          rCode = `pbinom(${k}, size = ${dist.params.size}, prob = ${dist.params.prob})`;
        } else {
          resultValue = ppois(k, dist.params.lambda);
          rCode = `ppois(${k}, lambda = ${dist.params.lambda})`;
        }
        steps.push({
          stepNumber: steps.length + 1,
          title: 'Discrete Strict Inequality Conversion',
          explanation: `For discrete integer random variables, P(X < ${x}) is strictly equivalent to P(X <= ${x} - 1) = P(X <= ${k}).`,
          formula: 'P(X < x) = P(X <= x - 1)',
          substituted: `P(X <= ${k})`,
          result: safeFormatNumber(resultValue, 6),
        });
      } else {
        // Continuous: P(X < x) = P(X <= x)
        if (dist.type === 'normal') {
          resultValue = pnorm(x, dist.params.mean, dist.params.sd);
          rCode = `pnorm(${x}, mean = ${dist.params.mean}, sd = ${dist.params.sd})`;
        } else if (dist.type === 'exponential') {
          resultValue = pexp(x, dist.params.rate);
          rCode = `pexp(${x}, rate = ${dist.params.rate})`;
        } else if (dist.type === 'gamma') {
          resultValue = pgamma(x, dist.params.shape, dist.params.rate);
          rCode = `pgamma(${x}, shape = ${dist.params.shape}, rate = ${dist.params.rate})`;
        } else {
          resultValue = pweibull(x, dist.params.shape, dist.params.scale);
          rCode = `pweibull(${x}, shape = ${dist.params.shape}, scale = ${dist.params.scale})`;
        }
        steps.push({
          stepNumber: steps.length + 1,
          title: 'Continuous Strict Inequality',
          explanation: `For continuous distributions, P(X < ${x}) = P(X <= ${x}) = F(${x}).`,
          formula: 'P(X < x) = F(x)',
          substituted: `F(${x})`,
          result: safeFormatNumber(resultValue, 6),
        });
      }
      break;
    }

    case 'prob_greater_equal': {
      const x = query.x ?? 0;
      if (isDiscrete) {
        const k = x - 1;
        if (dist.type === 'binomial') {
          resultValue = sbinom(k, dist.params.size, dist.params.prob);
          rCode = `pbinom(${k}, size = ${dist.params.size}, prob = ${dist.params.prob}, lower.tail = FALSE)`;
        } else {
          resultValue = spois(k, dist.params.lambda);
          rCode = `ppois(${k}, lambda = ${dist.params.lambda}, lower.tail = FALSE)`;
        }
        steps.push({
          stepNumber: steps.length + 1,
          title: 'Discrete "At Least" Conversion',
          explanation: `For discrete variables, P(X >= ${x}) = 1 - P(X <= ${x} - 1) = 1 - P(X <= ${k}) = P(X > ${k}).`,
          formula: 'P(X >= x) = 1 - P(X <= x - 1)',
          substituted: `1 - F(${k})`,
          result: safeFormatNumber(resultValue, 6),
        });
      } else {
        // Continuous: P(X >= x) = P(X > x) = 1 - F(x) = S(x)
        if (dist.type === 'normal') {
          resultValue = snorm(x, dist.params.mean, dist.params.sd);
          rCode = `pnorm(${x}, mean = ${dist.params.mean}, sd = ${dist.params.sd}, lower.tail = FALSE)`;
        } else if (dist.type === 'exponential') {
          resultValue = sexp(x, dist.params.rate);
          rCode = `pexp(${x}, rate = ${dist.params.rate}, lower.tail = FALSE)`;
        } else if (dist.type === 'gamma') {
          resultValue = sgamma(x, dist.params.shape, dist.params.rate);
          rCode = `pgamma(${x}, shape = ${dist.params.shape}, rate = ${dist.params.rate}, lower.tail = FALSE)`;
        } else {
          resultValue = sweibull(x, dist.params.shape, dist.params.scale);
          rCode = `pweibull(${x}, shape = ${dist.params.shape}, scale = ${dist.params.scale}, lower.tail = FALSE)`;
        }
        steps.push({
          stepNumber: steps.length + 1,
          title: 'Continuous Upper Tail P(X >= x)',
          explanation: `For continuous distributions, P(X >= ${x}) = P(X > ${x}) = S(${x}) = 1 - F(${x}).`,
          formula: 'P(X >= x) = 1 - F(x) = S(x)',
          substituted: `1 - F(${x})`,
          result: safeFormatNumber(resultValue, 6),
        });
      }
      break;
    }

    case 'prob_greater': {
      const x = query.x ?? 0;
      if (isDiscrete) {
        if (dist.type === 'binomial') {
          resultValue = sbinom(x, dist.params.size, dist.params.prob);
          rCode = `pbinom(${x}, size = ${dist.params.size}, prob = ${dist.params.prob}, lower.tail = FALSE)`;
        } else {
          resultValue = spois(x, dist.params.lambda);
          rCode = `ppois(${x}, lambda = ${dist.params.lambda}, lower.tail = FALSE)`;
        }
        steps.push({
          stepNumber: steps.length + 1,
          title: 'Discrete Strict Upper Tail P(X > x)',
          explanation: `For discrete variables, P(X > ${x}) = 1 - P(X <= ${x}).`,
          formula: 'P(X > x) = 1 - P(X <= x)',
          substituted: `1 - F(${x})`,
          result: safeFormatNumber(resultValue, 6),
        });
      } else {
        // Continuous: P(X > x) = 1 - F(x) = S(x)
        if (dist.type === 'normal') {
          resultValue = snorm(x, dist.params.mean, dist.params.sd);
          rCode = `pnorm(${x}, mean = ${dist.params.mean}, sd = ${dist.params.sd}, lower.tail = FALSE)`;
        } else if (dist.type === 'exponential') {
          resultValue = sexp(x, dist.params.rate);
          rCode = `pexp(${x}, rate = ${dist.params.rate}, lower.tail = FALSE)`;
        } else if (dist.type === 'gamma') {
          resultValue = sgamma(x, dist.params.shape, dist.params.rate);
          rCode = `pgamma(${x}, shape = ${dist.params.shape}, rate = ${dist.params.rate}, lower.tail = FALSE)`;
        } else {
          resultValue = sweibull(x, dist.params.shape, dist.params.scale);
          rCode = `pweibull(${x}, shape = ${dist.params.shape}, scale = ${dist.params.scale}, lower.tail = FALSE)`;
        }
        steps.push({
          stepNumber: steps.length + 1,
          title: 'Continuous Upper Tail P(X > x)',
          explanation: `Evaluate survival function P(X > ${x}) = S(${x}) = 1 - F(${x}).`,
          formula: 'P(X > x) = 1 - F(x)',
          substituted: `1 - F(${x})`,
          result: safeFormatNumber(resultValue, 6),
        });
      }
      break;
    }

    case 'prob_interval': {
      const a = query.a ?? 0;
      const b = query.b ?? 0;
      if (a > b) {
        throw new Error(`Interval lower bound a (${a}) cannot be greater than upper bound b (${b}).`);
      }

      if (isDiscrete) {
        const aMinus1 = a - 1;
        if (dist.type === 'binomial') {
          const fb = pbinom(b, dist.params.size, dist.params.prob);
          const fa = aMinus1 >= 0 ? pbinom(aMinus1, dist.params.size, dist.params.prob) : 0;
          resultValue = fb - fa;
          rCode = `pbinom(${b}, size = ${dist.params.size}, prob = ${dist.params.prob}) - pbinom(${aMinus1}, size = ${dist.params.size}, prob = ${dist.params.prob})`;
        } else {
          const fb = ppois(b, dist.params.lambda);
          const fa = aMinus1 >= 0 ? ppois(aMinus1, dist.params.lambda) : 0;
          resultValue = fb - fa;
          rCode = `ppois(${b}, lambda = ${dist.params.lambda}) - ppois(${aMinus1}, lambda = ${dist.params.lambda})`;
        }
        steps.push({
          stepNumber: steps.length + 1,
          title: 'Discrete Interval Probability P(a <= X <= b)',
          explanation: `For discrete integer random variables, P(${a} <= X <= ${b}) = P(X <= ${b}) - P(X <= ${a} - 1).`,
          formula: 'P(a <= X <= b) = F(b) - F(a - 1)',
          substituted: `F(${b}) - F(${aMinus1})`,
          result: safeFormatNumber(resultValue, 6),
        });
      } else {
        if (dist.type === 'normal') {
          const fb = pnorm(b, dist.params.mean, dist.params.sd);
          const fa = pnorm(a, dist.params.mean, dist.params.sd);
          resultValue = fb - fa;
          rCode = `pnorm(${b}, mean = ${dist.params.mean}, sd = ${dist.params.sd}) - pnorm(${a}, mean = ${dist.params.mean}, sd = ${dist.params.sd})`;
        } else if (dist.type === 'exponential') {
          const fb = pexp(b, dist.params.rate);
          const fa = pexp(a, dist.params.rate);
          resultValue = fb - fa;
          rCode = `pexp(${b}, rate = ${dist.params.rate}) - pexp(${a}, rate = ${dist.params.rate})`;
        } else if (dist.type === 'gamma') {
          const fb = pgamma(b, dist.params.shape, dist.params.rate);
          const fa = pgamma(a, dist.params.shape, dist.params.rate);
          resultValue = fb - fa;
          rCode = `pgamma(${b}, shape = ${dist.params.shape}, rate = ${dist.params.rate}) - pgamma(${a}, shape = ${dist.params.shape}, rate = ${dist.params.rate})`;
        } else {
          const fb = pweibull(b, dist.params.shape, dist.params.scale);
          const fa = pweibull(a, dist.params.shape, dist.params.scale);
          resultValue = fb - fa;
          rCode = `pweibull(${b}, shape = ${dist.params.shape}, scale = ${dist.params.scale}) - pweibull(${a}, shape = ${dist.params.shape}, scale = ${dist.params.scale})`;
        }
        steps.push({
          stepNumber: steps.length + 1,
          title: 'Continuous Interval Probability P(a <= X <= b)',
          explanation: `Evaluate P(${a} <= X <= ${b}) = F(${b}) - F(${a}).`,
          formula: 'P(a <= X <= b) = F(b) - F(a)',
          substituted: `F(${b}) - F(${a})`,
          result: safeFormatNumber(resultValue, 6),
        });
      }
      break;
    }

    case 'quantile':
    case 'find_x_for_p': {
      let p = query.p ?? 0.5;
      if (query.type === 'find_x_for_p' && (query.direction === 'greater' || query.direction === 'greater_equal')) {
        p = 1 - p;
      }
      validateProbability(p, 'probability');

      if (dist.type === 'binomial') {
        resultValue = qbinom(p, dist.params.size, dist.params.prob);
        rCode = `qbinom(${p}, size = ${dist.params.size}, prob = ${dist.params.prob})`;
      } else if (dist.type === 'poisson') {
        resultValue = qpois(p, dist.params.lambda);
        rCode = `qpois(${p}, lambda = ${dist.params.lambda})`;
      } else if (dist.type === 'normal') {
        resultValue = qnorm(p, dist.params.mean, dist.params.sd);
        rCode = `qnorm(${p}, mean = ${dist.params.mean}, sd = ${dist.params.sd})`;
      } else if (dist.type === 'exponential') {
        resultValue = qexp(p, dist.params.rate);
        rCode = `qexp(${p}, rate = ${dist.params.rate})`;
      } else if (dist.type === 'gamma') {
        resultValue = qgamma(p, dist.params.shape, dist.params.rate);
        rCode = `qgamma(${p}, shape = ${dist.params.shape}, rate = ${dist.params.rate})`;
      } else {
        resultValue = qweibull(p, dist.params.shape, dist.params.scale);
        rCode = `qweibull(${p}, shape = ${dist.params.shape}, scale = ${dist.params.scale})`;
      }
      steps.push({
        stepNumber: steps.length + 1,
        title: 'Quantile / Inverse Cumulative Evaluation',
        explanation: `Find value x such that cumulative probability equals ${p}.`,
        formula: 'x = Q(p) = F^(-1)(p)',
        substituted: `Q(${p})`,
        result: safeFormatNumber(resultValue, 6),
      });
      break;
    }

    case 'mean': {
      if (dist.type === 'binomial') {
        resultValue = statsBinomial(dist.params).mean;
        rCode = `${dist.params.size} * ${dist.params.prob}`;
      } else if (dist.type === 'poisson') {
        resultValue = statsPoisson(dist.params).mean;
        rCode = `${dist.params.lambda}`;
      } else if (dist.type === 'normal') {
        resultValue = statsNormal(dist.params).mean;
        rCode = `${dist.params.mean}`;
      } else if (dist.type === 'exponential') {
        resultValue = statsExponential(dist.params).mean;
        rCode = `1 / ${dist.params.rate}`;
      } else if (dist.type === 'gamma') {
        resultValue = statsGamma(dist.params).mean;
        rCode = `${dist.params.shape} / ${dist.params.rate}`;
      } else {
        resultValue = statsWeibull(dist.params).mean;
        rCode = `${dist.params.scale} * gamma(1 + 1 / ${dist.params.shape})`;
      }
      steps.push({
        stepNumber: steps.length + 1,
        title: 'Expected Value (Mean)',
        explanation: 'Evaluate theoretical mean of the distribution.',
        formula: 'E[X] = mu',
        result: safeFormatNumber(resultValue, 6),
      });
      break;
    }

    case 'variance': {
      if (dist.type === 'binomial') {
        resultValue = statsBinomial(dist.params).variance;
        rCode = `${dist.params.size} * ${dist.params.prob} * (1 - ${dist.params.prob})`;
      } else if (dist.type === 'poisson') {
        resultValue = statsPoisson(dist.params).variance;
        rCode = `${dist.params.lambda}`;
      } else if (dist.type === 'normal') {
        resultValue = statsNormal(dist.params).variance;
        rCode = `${dist.params.sd}^2`;
      } else if (dist.type === 'exponential') {
        resultValue = statsExponential(dist.params).variance;
        rCode = `1 / (${dist.params.rate}^2)`;
      } else if (dist.type === 'gamma') {
        resultValue = statsGamma(dist.params).variance;
        rCode = `${dist.params.shape} / (${dist.params.rate}^2)`;
      } else {
        resultValue = statsWeibull(dist.params).variance;
        rCode = `(${dist.params.scale}^2) * (gamma(1 + 2/${dist.params.shape}) - gamma(1 + 1/${dist.params.shape})^2)`;
      }
      steps.push({
        stepNumber: steps.length + 1,
        title: 'Variance',
        explanation: 'Evaluate theoretical variance Var(X) = E[(X - mu)^2].',
        formula: 'Var(X) = sigma^2',
        result: safeFormatNumber(resultValue, 6),
      });
      break;
    }

    case 'sd': {
      let variance: number;
      if (dist.type === 'binomial') variance = statsBinomial(dist.params).variance;
      else if (dist.type === 'poisson') variance = statsPoisson(dist.params).variance;
      else if (dist.type === 'normal') variance = statsNormal(dist.params).variance;
      else if (dist.type === 'exponential') variance = statsExponential(dist.params).variance;
      else if (dist.type === 'gamma') variance = statsGamma(dist.params).variance;
      else variance = statsWeibull(dist.params).variance;

      resultValue = Math.sqrt(variance);
      rCode = `sqrt(${safeFormatNumber(variance, 6)})`;
      steps.push({
        stepNumber: steps.length + 1,
        title: 'Standard Deviation',
        explanation: 'Evaluate standard deviation as positive square root of variance: SD(X) = sqrt(Var(X)).',
        formula: 'SD(X) = sqrt(Var(X))',
        substituted: `sqrt(${safeFormatNumber(variance, 6)})`,
        result: safeFormatNumber(resultValue, 6),
      });
      break;
    }

    case 'mgf': {
      const t = query.t ?? 0;
      if (dist.type === 'binomial') {
        resultValue = mgfBinomial(t, dist.params.size, dist.params.prob);
        rCode = `(1 - ${dist.params.prob} + ${dist.params.prob} * exp(${t}))^${dist.params.size}`;
      } else if (dist.type === 'poisson') {
        resultValue = mgfPoisson(t, dist.params.lambda);
        rCode = `exp(${dist.params.lambda} * (exp(${t}) - 1))`;
      } else if (dist.type === 'normal') {
        resultValue = mgfNormal(t, dist.params.mean, dist.params.sd);
        rCode = `exp(${dist.params.mean} * ${t} + 0.5 * (${dist.params.sd}^2) * (${t}^2))`;
      } else if (dist.type === 'exponential') {
        resultValue = mgfExponential(t, dist.params.rate);
        rCode = `${dist.params.rate} / (${dist.params.rate} - ${t})`;
      } else if (dist.type === 'gamma') {
        resultValue = mgfGamma(t, dist.params.shape, dist.params.rate);
        rCode = `(${dist.params.rate} / (${dist.params.rate} - ${t}))^${dist.params.shape}`;
      } else {
        resultValue = mgfWeibull(t, dist.params.shape, dist.params.scale);
        rCode = `1 / (1 - ${dist.params.scale} * ${t})`;
      }
      steps.push({
        stepNumber: steps.length + 1,
        title: 'Moment Generating Function M_X(t)',
        explanation: `Evaluate moment generating function E[e^(t*X)] at t = ${t}.`,
        formula: 'M_X(t) = E[e^(t*X)]',
        substituted: `M_X(${t})`,
        result: safeFormatNumber(resultValue, 6),
      });
      break;
    }

    case 'conditional_survival': {
      const s = query.s ?? 0;
      const t = query.t ?? 0;
      resultValue = conditionalSurvival(s, t, dist);
      if (dist.type === 'exponential') {
        rCode = `pexp(${t}, rate = ${dist.params.rate}, lower.tail = FALSE)`;
        steps.push({
          stepNumber: steps.length + 1,
          title: 'Memoryless Property of Exponential Distribution',
          explanation: `Due to the memoryless property of the Exponential distribution, P(X > s + t | X > s) = P(X > t) = e^(-lambda * t) regardless of elapsed time s=${s}.`,
          formula: 'P(X > s + t | X > s) = P(X > t) = e^(-lambda * t)',
          substituted: `e^(-${dist.params.rate} * ${t})`,
          result: safeFormatNumber(resultValue, 6),
        });
      } else {
        rCode = `(1 - pnorm(${s + t}, ...)) / (1 - pnorm(${s}, ...))`; // generic concept
        steps.push({
          stepNumber: steps.length + 1,
          title: 'Conditional Probability Formulation',
          explanation: `By definition of conditional probability, P(X > ${s + t} | X > ${s}) = P(X > ${s + t}) / P(X > ${s}) = S(${s + t}) / S(${s}).`,
          formula: 'P(X > s + t | X > s) = S(s + t) / S(s)',
          substituted: `S(${s + t}) / S(${s})`,
          result: safeFormatNumber(resultValue, 6),
        });
      }
      break;
    }
  }

  assertValidNumber(resultValue, 'Solver final calculation');

  return {
    success: true,
    distribution: dist,
    query,
    assumptions,
    steps,
    resultValue,
    formattedResult: safeFormatNumber(resultValue, 6),
    rCode,
    rScript: generateRScript({ distribution: dist, query, resultValue }),
    layerUsed,
    parameterizationNotes,
    explanation: steps[steps.length - 1]?.title || 'Solved probability calculation',
  };
}
