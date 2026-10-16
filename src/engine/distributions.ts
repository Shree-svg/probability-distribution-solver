import type {
  BinomialParams,
  DistributionParams,
  ExponentialParams,
  GammaParams,
  NormalParams,
  PoissonParams,
  WeibullParams,
} from './types';
import {
  assertValidNumber,
  EngineValidationError,
  validateBinomialParams,
  validateExponentialParams,
  validateFiniteNumber,
  validateGammaParams,
  validateNormalParams,
  validatePoissonParams,
  validateProbability,
  validateWeibullParams,
} from './validator';
import {
  gamma,
  logFactorial,
  logGamma,
  regularizedGammaP,
  regularizedGammaQ,
  regularizedIncompleteBeta,
  standardNormalCdf,
  standardNormalQuantile,
  standardNormalSf,
} from './special';

// ==========================================
// 1. Binomial(size n, prob p)
// ==========================================

export function dbinom(x: number, size: number, prob: number): number {
  validateBinomialParams({ size, prob });
  if (!Number.isInteger(x) || x < 0 || x > size) {
    return 0;
  }
  if (prob === 0) return x === 0 ? 1 : 0;
  if (prob === 1) return x === size ? 1 : 0;

  // Exact computation in log space
  const logP =
    logFactorial(size) -
    logFactorial(x) -
    logFactorial(size - x) +
    x * Math.log(prob) +
    (size - x) * Math.log(1 - prob);
  return assertValidNumber(Math.exp(logP), 'dbinom');
}

export function pbinom(q: number, size: number, prob: number): number {
  validateBinomialParams({ size, prob });
  if (q < 0) return 0;
  if (q >= size) return 1;
  if (prob === 0) return 1;
  if (prob === 1) return q >= size ? 1 : 0;

  const k = Math.floor(q);
  // P(X <= k) = I_{1 - prob}(size - k, k + 1)
  const cdf = regularizedIncompleteBeta(1 - prob, size - k, k + 1);
  return Math.min(1, Math.max(0, assertValidNumber(cdf, 'pbinom')));
}

export function sbinom(q: number, size: number, prob: number): number {
  validateBinomialParams({ size, prob });
  if (q < 0) return 1;
  if (q >= size) return 0;
  if (prob === 0) return 0;
  if (prob === 1) return q < size ? 1 : 0;

  const k = Math.floor(q);
  // P(X > k) = I_{prob}(k + 1, size - k)
  const sf = regularizedIncompleteBeta(prob, k + 1, size - k);
  return Math.min(1, Math.max(0, assertValidNumber(sf, 'sbinom')));
}

export function qbinom(p: number, size: number, prob: number): number {
  validateProbability(p, 'qbinom probability');
  validateBinomialParams({ size, prob });

  if (p === 0) return 0;
  if (p === 1) return size;
  if (prob === 0) return 0;
  if (prob === 1) return size;

  // Binary search over [0, size]
  let low = 0;
  let high = size;
  let ans = size;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (pbinom(mid, size, prob) >= p - 1e-15) {
      ans = mid;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  return ans;
}

export function statsBinomial(params: BinomialParams): {
  mean: number;
  variance: number;
  skewness: number;
  kurtosis: number;
  median: number;
} {
  validateBinomialParams(params);
  const { size, prob } = params;
  const mean = size * prob;
  const variance = size * prob * (1 - prob);
  const skewness = variance > 1e-14 ? (1 - 2 * prob) / Math.sqrt(variance) : 0;
  const kurtosis = variance > 1e-14 ? (1 - 6 * prob * (1 - prob)) / variance : 0;
  const median = qbinom(0.5, size, prob);

  return {
    mean: assertValidNumber(mean, 'Binomial mean'),
    variance: assertValidNumber(variance, 'Binomial variance'),
    skewness: assertValidNumber(skewness, 'Binomial skewness'),
    kurtosis: assertValidNumber(kurtosis, 'Binomial kurtosis'),
    median: assertValidNumber(median, 'Binomial median'),
  };
}

// ==========================================
// 2. Poisson(lambda)
// ==========================================

export function dpois(x: number, lambda: number): number {
  validatePoissonParams({ lambda });
  if (!Number.isInteger(x) || x < 0) {
    return 0;
  }
  const logP = x * Math.log(lambda) - lambda - logFactorial(x);
  return assertValidNumber(Math.exp(logP), 'dpois');
}

export function ppois(q: number, lambda: number): number {
  validatePoissonParams({ lambda });
  if (q < 0) return 0;

  const k = Math.floor(q);
  // P(X <= k) = Q(k + 1, lambda)
  const cdf = regularizedGammaQ(k + 1, lambda);
  return Math.min(1, Math.max(0, assertValidNumber(cdf, 'ppois')));
}

export function spois(q: number, lambda: number): number {
  validatePoissonParams({ lambda });
  if (q < 0) return 1;

  const k = Math.floor(q);
  // P(X > k) = P(k + 1, lambda)
  const sf = regularizedGammaP(k + 1, lambda);
  return Math.min(1, Math.max(0, assertValidNumber(sf, 'spois')));
}

export function qpois(p: number, lambda: number): number {
  validateProbability(p, 'qpois probability');
  validatePoissonParams({ lambda });

  if (p === 0) return 0;
  if (p === 1) {
    throw new Error('Poisson quantile for p=1 is unbounded (infinity not allowed).');
  }

  // Binary search over [0, maxK]
  let low = 0;
  let high = Math.max(10, Math.ceil(lambda + 10 * Math.sqrt(lambda) + 50));
  while (ppois(high, lambda) < p) {
    high *= 2;
  }

  let ans = high;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (ppois(mid, lambda) >= p - 1e-15) {
      ans = mid;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  return ans;
}

export function statsPoisson(params: PoissonParams): {
  mean: number;
  variance: number;
  skewness: number;
  kurtosis: number;
  median: number;
} {
  validatePoissonParams(params);
  const l = params.lambda;
  return {
    mean: assertValidNumber(l, 'Poisson mean'),
    variance: assertValidNumber(l, 'Poisson variance'),
    skewness: assertValidNumber(1 / Math.sqrt(l), 'Poisson skewness'),
    kurtosis: assertValidNumber(1 / l, 'Poisson kurtosis'),
    median: assertValidNumber(qpois(0.5, l), 'Poisson median'),
  };
}

// ==========================================
// 3. Normal(mean mu, sd sigma)
// ==========================================

export function dnorm(x: number, mean: number, sd: number): number {
  validateNormalParams({ mean, sd });
  const z = (x - mean) / sd;
  const pdf = (1 / (sd * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
  return assertValidNumber(pdf, 'dnorm');
}

export function pnorm(q: number, mean: number, sd: number): number {
  validateNormalParams({ mean, sd });
  const z = (q - mean) / sd;
  return assertValidNumber(standardNormalCdf(z), 'pnorm');
}

export function snorm(q: number, mean: number, sd: number): number {
  validateNormalParams({ mean, sd });
  const z = (q - mean) / sd;
  return assertValidNumber(standardNormalSf(z), 'snorm');
}

export function qnorm(p: number, mean: number, sd: number): number {
  validateProbability(p, 'qnorm probability');
  validateNormalParams({ mean, sd });
  if (p === 0 || p === 1) {
    throw new Error('Normal quantile for p=0 or p=1 is unbounded (infinity not allowed).');
  }
  const z = standardNormalQuantile(p);
  return assertValidNumber(mean + sd * z, 'qnorm');
}

export function statsNormal(params: NormalParams): {
  mean: number;
  variance: number;
  skewness: number;
  kurtosis: number;
  median: number;
} {
  validateNormalParams(params);
  return {
    mean: assertValidNumber(params.mean, 'Normal mean'),
    variance: assertValidNumber(params.sd * params.sd, 'Normal variance'),
    skewness: 0,
    kurtosis: 0,
    median: assertValidNumber(params.mean, 'Normal median'),
  };
}

// ==========================================
// 4. Exponential(rate lambda)
// ==========================================

export function dexp(x: number, rate: number): number {
  validateExponentialParams({ rate });
  if (x < 0) return 0;
  const pdf = rate * Math.exp(-rate * x);
  return assertValidNumber(pdf, 'dexp');
}

export function pexp(q: number, rate: number): number {
  validateExponentialParams({ rate });
  if (q <= 0) return 0;
  const cdf = -Math.expm1(-rate * q);
  return Math.min(1, Math.max(0, assertValidNumber(cdf, 'pexp')));
}

export function sexp(q: number, rate: number): number {
  validateExponentialParams({ rate });
  if (q <= 0) return 1;
  const sf = Math.exp(-rate * q);
  return Math.min(1, Math.max(0, assertValidNumber(sf, 'sexp')));
}

export function qexp(p: number, rate: number): number {
  validateProbability(p, 'qexp probability');
  validateExponentialParams({ rate });
  if (p === 0) return 0;
  if (p === 1) {
    throw new Error('Exponential quantile for p=1 is unbounded (infinity not allowed).');
  }
  const q = -Math.log1p(-p) / rate;
  return assertValidNumber(q, 'qexp');
}

export function statsExponential(params: ExponentialParams): {
  mean: number;
  variance: number;
  skewness: number;
  kurtosis: number;
  median: number;
} {
  validateExponentialParams(params);
  const r = params.rate;
  return {
    mean: assertValidNumber(1 / r, 'Exponential mean'),
    variance: assertValidNumber(1 / (r * r), 'Exponential variance'),
    skewness: 2,
    kurtosis: 6,
    median: assertValidNumber(Math.LN2 / r, 'Exponential median'),
  };
}

// ==========================================
// 5. Gamma(shape alpha, rate lambda)
// ==========================================

export function dgamma(x: number, shape: number, rate: number): number {
  validateGammaParams({ shape, rate });
  if (x < 0) return 0;
  if (x === 0) {
    if (shape < 1) {
      throw new Error('Gamma density at x=0 for shape < 1 diverges to infinity.');
    }
    return shape === 1 ? rate : 0;
  }
  const logPdf =
    shape * Math.log(rate) -
    logGamma(shape) +
    (shape - 1) * Math.log(x) -
    rate * x;
  return assertValidNumber(Math.exp(logPdf), 'dgamma');
}

export function pgamma(q: number, shape: number, rate: number): number {
  validateGammaParams({ shape, rate });
  if (q <= 0) return 0;
  return assertValidNumber(regularizedGammaP(shape, rate * q), 'pgamma');
}

export function sgamma(q: number, shape: number, rate: number): number {
  validateGammaParams({ shape, rate });
  if (q <= 0) return 1;
  return assertValidNumber(regularizedGammaQ(shape, rate * q), 'sgamma');
}

export function qgamma(p: number, shape: number, rate: number): number {
  validateProbability(p, 'qgamma probability');
  validateGammaParams({ shape, rate });
  if (p === 0) return 0;
  if (p === 1) {
    throw new Error('Gamma quantile for p=1 is unbounded (infinity not allowed).');
  }

  // Wilson-Hilferty transformation initial guess
  let x: number;
  const z = standardNormalQuantile(p);
  const term = 1 - 1 / (9 * shape) + (z / (3 * Math.sqrt(shape)));
  if (term > 0) {
    x = (shape / rate) * Math.pow(term, 3);
  } else {
    x = (shape / rate) * Math.exp(z / Math.sqrt(shape));
  }
  if (x <= 0) x = shape / (rate * 10);

  // High precision Halley refinement against regularizedGammaP
  let low = 0;
  let high = Math.max(100, (shape / rate) * 10);
  while (pgamma(high, shape, rate) < p) {
    high *= 2;
  }

  for (let iter = 0; iter < 100; iter++) {
    const curP = pgamma(x, shape, rate);
    const diff = curP - p;
    if (Math.abs(diff) < 1e-15 || Math.abs(diff / p) < 1e-14) break;

    if (diff < 0) {
      low = Math.max(low, x);
    } else {
      high = Math.min(high, x);
    }

    const d = dgamma(x, shape, rate);
    if (d > 1e-15) {
      // Second derivative: d2 = d * ((shape - 1)/x - rate)
      const d2 = d * ((shape - 1) / x - rate);
      // Halley's step: delta = diff / (d - 0.5 * diff * d2 / d)
      const denom = d - 0.5 * (diff * d2) / d;
      const step = diff / denom;
      const nextX = x - step;
      if (nextX > low && nextX < high) {
        x = nextX;
        continue;
      }
    }
    x = 0.5 * (low + high);
  }

  return assertValidNumber(x, 'qgamma');
}

export function statsGamma(params: GammaParams): {
  mean: number;
  variance: number;
  skewness: number;
  kurtosis: number;
  median: number;
} {
  validateGammaParams(params);
  const { shape, rate } = params;
  return {
    mean: assertValidNumber(shape / rate, 'Gamma mean'),
    variance: assertValidNumber(shape / (rate * rate), 'Gamma variance'),
    skewness: assertValidNumber(2 / Math.sqrt(shape), 'Gamma skewness'),
    kurtosis: assertValidNumber(6 / shape, 'Gamma kurtosis'),
    median: assertValidNumber(qgamma(0.5, shape, rate), 'Gamma median'),
  };
}

// ==========================================
// 6. Weibull(shape k, scale lambda)
// ==========================================

export function dweibull(x: number, shape: number, scale: number): number {
  validateWeibullParams({ shape, scale });
  if (x < 0) return 0;
  if (x === 0) {
    if (shape < 1) {
      throw new Error('Weibull density at x=0 for shape < 1 diverges to infinity.');
    }
    return shape === 1 ? 1 / scale : 0;
  }
  const term1 = (shape / scale) * Math.pow(x / scale, shape - 1);
  const term2 = Math.exp(-Math.pow(x / scale, shape));
  return assertValidNumber(term1 * term2, 'dweibull');
}

export function pweibull(q: number, shape: number, scale: number): number {
  validateWeibullParams({ shape, scale });
  if (q <= 0) return 0;
  const cdf = -Math.expm1(-Math.pow(q / scale, shape));
  return Math.min(1, Math.max(0, assertValidNumber(cdf, 'pweibull')));
}

export function sweibull(q: number, shape: number, scale: number): number {
  validateWeibullParams({ shape, scale });
  if (q <= 0) return 1;
  const sf = Math.exp(-Math.pow(q / scale, shape));
  return Math.min(1, Math.max(0, assertValidNumber(sf, 'sweibull')));
}

export function qweibull(p: number, shape: number, scale: number): number {
  validateProbability(p, 'qweibull probability');
  validateWeibullParams({ shape, scale });
  if (p === 0) return 0;
  if (p === 1) {
    throw new Error('Weibull quantile for p=1 is unbounded (infinity not allowed).');
  }
  const q = scale * Math.pow(-Math.log1p(-p), 1 / shape);
  return assertValidNumber(q, 'qweibull');
}

export function statsWeibull(params: WeibullParams): {
  mean: number;
  variance: number;
  skewness: number;
  kurtosis: number;
  median: number;
} {
  validateWeibullParams(params);
  const { shape: k, scale: lambda } = params;
  const g1 = gamma(1 + 1 / k);
  const g2 = gamma(1 + 2 / k);
  const g3 = gamma(1 + 3 / k);
  const g4 = gamma(1 + 4 / k);

  const mean = lambda * g1;
  const variance = lambda * lambda * (g2 - g1 * g1);

  // Skewness: (g3 - 3*g1*g2 + 2*g1^3) / (g2 - g1^2)^(3/2)
  const skewness = (g3 - 3 * g1 * g2 + 2 * g1 * g1 * g1) / Math.pow(g2 - g1 * g1, 1.5);

  // Excess kurtosis: (g4 - 4*g1*g3 + 6*g1^2*g2 - 3*g1^4) / (g2 - g1^2)^2 - 3
  const kurtosis =
    (g4 - 4 * g1 * g3 + 6 * g1 * g1 * g2 - 3 * Math.pow(g1, 4)) / Math.pow(g2 - g1 * g1, 2) - 3;

  const median = lambda * Math.pow(Math.LN2, 1 / k);

  return {
    mean: assertValidNumber(mean, 'Weibull mean'),
    variance: assertValidNumber(variance, 'Weibull variance'),
    skewness: assertValidNumber(skewness, 'Weibull skewness'),
    kurtosis: assertValidNumber(kurtosis, 'Weibull kurtosis'),
    median: assertValidNumber(median, 'Weibull median'),
  };
}

// ==========================================
// 7. Moment Generating Functions (MGFs)
// ==========================================

export function mgfBinomial(t: number, size: number, prob: number): number {
  validateBinomialParams({ size, prob });
  validateFiniteNumber(t, 't');
  const base = 1 - prob + prob * Math.exp(t);
  return assertValidNumber(Math.pow(base, size), 'mgfBinomial');
}

export function mgfPoisson(t: number, lambda: number): number {
  validatePoissonParams({ lambda });
  validateFiniteNumber(t, 't');
  return assertValidNumber(Math.exp(lambda * Math.expm1(t)), 'mgfPoisson');
}

export function mgfNormal(t: number, mean: number, sd: number): number {
  validateNormalParams({ mean, sd });
  validateFiniteNumber(t, 't');
  const exponent = mean * t + 0.5 * sd * sd * t * t;
  return assertValidNumber(Math.exp(exponent), 'mgfNormal');
}

export function mgfExponential(t: number, rate: number): number {
  validateExponentialParams({ rate });
  validateFiniteNumber(t, 't');
  if (t >= rate) {
    throw new EngineValidationError(
      `Exponential MGF is not defined for t >= rate (received t=${t}, rate=${rate}).`
    );
  }
  return assertValidNumber(rate / (rate - t), 'mgfExponential');
}

export function mgfGamma(t: number, shape: number, rate: number): number {
  validateGammaParams({ shape, rate });
  validateFiniteNumber(t, 't');
  if (t >= rate) {
    throw new EngineValidationError(
      `Gamma MGF is not defined for t >= rate (received t=${t}, rate=${rate}).`
    );
  }
  return assertValidNumber(Math.pow(rate / (rate - t), shape), 'mgfGamma');
}

export function mgfWeibull(t: number, shape: number, scale: number): number {
  validateWeibullParams({ shape, scale });
  validateFiniteNumber(t, 't');
  if (t === 0) return 1;
  if (shape === 1) {
    const rate = 1 / scale;
    if (t >= rate) {
      throw new EngineValidationError(
        `Weibull (shape=1) MGF is not defined for t >= 1/scale (received t=${t}, scale=${scale}).`
      );
    }
    return assertValidNumber(rate / (rate - t), 'mgfWeibull');
  }
  throw new EngineValidationError(
    `Weibull MGF does not exist in closed form for shape k != 1 (received shape=${shape}).`
  );
}

// ==========================================
// 8. Conditional Probability P(X > s + t | X > s)
// ==========================================

export function conditionalSurvival(s: number, t: number, dist: DistributionParams): number {
  validateFiniteNumber(s, 's');
  validateFiniteNumber(t, 't');
  if (t < 0) {
    throw new EngineValidationError(`Incremental duration t must be non-negative (received ${t}).`);
  }
  const st = s + t;

  let sProb: number;
  let stProb: number;

  switch (dist.type) {
    case 'exponential': {
      // Memoryless property: P(X > s + t | X > s) = P(X > t)
      return sexp(t, dist.params.rate);
    }
    case 'normal': {
      sProb = snorm(s, dist.params.mean, dist.params.sd);
      stProb = snorm(st, dist.params.mean, dist.params.sd);
      break;
    }
    case 'binomial': {
      sProb = sbinom(s, dist.params.size, dist.params.prob);
      stProb = sbinom(st, dist.params.size, dist.params.prob);
      break;
    }
    case 'poisson': {
      sProb = spois(s, dist.params.lambda);
      stProb = spois(st, dist.params.lambda);
      break;
    }
    case 'gamma': {
      sProb = sgamma(s, dist.params.shape, dist.params.rate);
      stProb = sgamma(st, dist.params.shape, dist.params.rate);
      break;
    }
    case 'weibull': {
      sProb = sweibull(s, dist.params.shape, dist.params.scale);
      stProb = sweibull(st, dist.params.shape, dist.params.scale);
      break;
    }
  }

  if (sProb <= 0) {
    throw new EngineValidationError(
      `Condition P(X > ${s}) has zero probability; conditional probability is undefined.`
    );
  }

  return Math.min(1, Math.max(0, assertValidNumber(stProb / sProb, 'conditionalSurvival')));
}

