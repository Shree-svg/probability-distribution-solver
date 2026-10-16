import type {
  BinomialParams,
  DistributionParams,
  ExponentialParams,
  GammaParams,
  NormalParams,
  PoissonParams,
  ValidationResult,
  WeibullParams,
} from './types';

export class EngineValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EngineValidationError';
  }
}

/**
 * Validates that a numeric value is strictly defined, non-null, not NaN, and finite.
 * Strictly enforces Rule 3: Never display NaN, Infinity or undefined.
 */
export function validateFiniteNumber(
  value: unknown,
  name: string = 'Value'
): ValidationResult<number> {
  if (value === undefined) {
    return { isValid: false, error: `${name} is undefined.` };
  }
  if (value === null) {
    return { isValid: false, error: `${name} cannot be null.` };
  }
  if (typeof value !== 'number') {
    return { isValid: false, error: `${name} must be a number.` };
  }
  if (Number.isNaN(value)) {
    return { isValid: false, error: `${name} resulted in NaN (Not a Number).` };
  }
  if (!Number.isFinite(value)) {
    return { isValid: false, error: `${name} cannot be Infinity or -Infinity.` };
  }
  return { isValid: true, value };
}

/**
 * Asserts that a calculation result is a valid finite number.
 * Throws EngineValidationError if invalid so errors are caught and surfaced cleanly.
 */
export function assertValidNumber(value: unknown, context: string = 'Calculation'): number {
  const result = validateFiniteNumber(value, context);
  if (!result.isValid) {
    throw new EngineValidationError(result.error);
  }
  return result.value;
}

/**
 * Format any calculation output safely, ensuring no NaN, Infinity or undefined is ever displayed.
 */
export function safeFormatNumber(value: unknown, digits: number = 6): string {
  const check = validateFiniteNumber(value, 'Result');
  if (!check.isValid) {
    return `[Validation Error: ${check.error}]`;
  }
  const formatted = Number(check.value.toFixed(digits));
  return formatted.toString();
}

export function validateProbability(p: unknown, name: string = 'Probability'): ValidationResult<number> {
  const numCheck = validateFiniteNumber(p, name);
  if (!numCheck.isValid) return numCheck;

  const val = numCheck.value;
  if (val < 0 || val > 1) {
    return { isValid: false, error: `${name} must be between 0 and 1 inclusive (received ${val}).` };
  }
  return { isValid: true, value: val };
}

export function validateBinomialParams(params: BinomialParams): ValidationResult<BinomialParams> {
  const sizeCheck = validateFiniteNumber(params.size, 'size (n)');
  if (!sizeCheck.isValid) return sizeCheck;
  if (!Number.isInteger(params.size) || params.size < 0) {
    return { isValid: false, error: 'Binomial size (n) must be a non-negative integer.' };
  }

  const probCheck = validateProbability(params.prob, 'prob (p)');
  if (!probCheck.isValid) return probCheck;

  return { isValid: true, value: params };
}

export function validatePoissonParams(params: PoissonParams): ValidationResult<PoissonParams> {
  const lambdaCheck = validateFiniteNumber(params.lambda, 'lambda');
  if (!lambdaCheck.isValid) return lambdaCheck;
  if (params.lambda <= 0) {
    return { isValid: false, error: 'Poisson lambda must be strictly greater than 0.' };
  }
  return { isValid: true, value: params };
}

export function validateNormalParams(params: NormalParams): ValidationResult<NormalParams> {
  const meanCheck = validateFiniteNumber(params.mean, 'mean (mu)');
  if (!meanCheck.isValid) return meanCheck;

  const sdCheck = validateFiniteNumber(params.sd, 'sd (sigma)');
  if (!sdCheck.isValid) return sdCheck;
  if (params.sd <= 0) {
    return { isValid: false, error: 'Normal sd (sigma) must be strictly greater than 0.' };
  }
  return { isValid: true, value: params };
}

export function validateExponentialParams(params: ExponentialParams): ValidationResult<ExponentialParams> {
  const rateCheck = validateFiniteNumber(params.rate, 'rate (lambda)');
  if (!rateCheck.isValid) return rateCheck;
  if (params.rate <= 0) {
    return { isValid: false, error: 'Exponential rate (lambda) must be strictly greater than 0.' };
  }
  return { isValid: true, value: params };
}

export function validateGammaParams(params: GammaParams): ValidationResult<GammaParams> {
  const shapeCheck = validateFiniteNumber(params.shape, 'shape (alpha)');
  if (!shapeCheck.isValid) return shapeCheck;
  if (params.shape <= 0) {
    return { isValid: false, error: 'Gamma shape (alpha) must be strictly greater than 0.' };
  }

  const rateCheck = validateFiniteNumber(params.rate, 'rate (lambda)');
  if (!rateCheck.isValid) return rateCheck;
  if (params.rate <= 0) {
    return { isValid: false, error: 'Gamma rate (lambda) must be strictly greater than 0.' };
  }
  return { isValid: true, value: params };
}

export function validateWeibullParams(params: WeibullParams): ValidationResult<WeibullParams> {
  const shapeCheck = validateFiniteNumber(params.shape, 'shape (k)');
  if (!shapeCheck.isValid) return shapeCheck;
  if (params.shape <= 0) {
    return { isValid: false, error: 'Weibull shape (k) must be strictly greater than 0.' };
  }

  const scaleCheck = validateFiniteNumber(params.scale, 'scale (lambda)');
  if (!scaleCheck.isValid) return scaleCheck;
  if (params.scale <= 0) {
    return { isValid: false, error: 'Weibull scale (lambda) must be strictly greater than 0.' };
  }
  return { isValid: true, value: params };
}

export function validateDistributionParams(dist: DistributionParams): ValidationResult<DistributionParams> {
  switch (dist.type) {
    case 'binomial': {
      const res = validateBinomialParams(dist.params);
      return res.isValid ? { isValid: true, value: { type: 'binomial', params: res.value } } : res;
    }
    case 'poisson': {
      const res = validatePoissonParams(dist.params);
      return res.isValid ? { isValid: true, value: { type: 'poisson', params: res.value } } : res;
    }
    case 'normal': {
      const res = validateNormalParams(dist.params);
      return res.isValid ? { isValid: true, value: { type: 'normal', params: res.value } } : res;
    }
    case 'exponential': {
      const res = validateExponentialParams(dist.params);
      return res.isValid ? { isValid: true, value: { type: 'exponential', params: res.value } } : res;
    }
    case 'gamma': {
      const res = validateGammaParams(dist.params);
      return res.isValid ? { isValid: true, value: { type: 'gamma', params: res.value } } : res;
    }
    case 'weibull': {
      const res = validateWeibullParams(dist.params);
      return res.isValid ? { isValid: true, value: { type: 'weibull', params: res.value } } : res;
    }
  }
}
