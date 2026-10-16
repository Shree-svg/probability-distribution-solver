import { describe, expect, it } from 'vitest';
import {
  assertValidNumber,
  safeFormatNumber,
  validateFiniteNumber,
  validateNormalParams,
  validateProbability,
  validatePoissonParams,
  validateBinomialParams,
  validateExponentialParams,
  validateGammaParams,
  validateWeibullParams,
} from '../src/engine/validator';

describe('Ground Rule 3: Validation and Safe Formatting', () => {
  it('rejects undefined with a clear validation error', () => {
    const res = validateFiniteNumber(undefined, 'TestField');
    expect(res.isValid).toBe(false);
    if (!res.isValid) {
      expect(res.error).toContain('undefined');
    }
  });

  it('rejects NaN with a clear validation error', () => {
    const res = validateFiniteNumber(NaN, 'Calculation');
    expect(res.isValid).toBe(false);
    if (!res.isValid) {
      expect(res.error).toContain('NaN');
    }
  });

  it('rejects Infinity and -Infinity', () => {
    const res1 = validateFiniteNumber(Infinity, 'Value');
    const res2 = validateFiniteNumber(-Infinity, 'Value');
    expect(res1.isValid).toBe(false);
    expect(res2.isValid).toBe(false);
    if (!res1.isValid) expect(res1.error).toContain('Infinity');
    if (!res2.isValid) expect(res2.error).toContain('Infinity');
  });

  it('safeFormatNumber never returns NaN, Infinity, or undefined', () => {
    expect(safeFormatNumber(NaN)).toContain('Validation Error');
    expect(safeFormatNumber(Infinity)).toContain('Validation Error');
    expect(safeFormatNumber(undefined)).toContain('Validation Error');
    expect(safeFormatNumber(null)).toContain('Validation Error');
    expect(safeFormatNumber(3.14159265)).toBe('3.141593');
  });

  it('assertValidNumber throws EngineValidationError instead of letting NaN through', () => {
    expect(() => assertValidNumber(NaN, 'Test')).toThrowError(/NaN/);
    expect(() => assertValidNumber(Infinity, 'Test')).toThrowError(/Infinity/);
    expect(() => assertValidNumber(undefined, 'Test')).toThrowError(/undefined/);
  });

  it('validates probabilities strictly in [0, 1]', () => {
    expect(validateProbability(0).isValid).toBe(true);
    expect(validateProbability(1).isValid).toBe(true);
    expect(validateProbability(0.5).isValid).toBe(true);
    expect(validateProbability(-0.1).isValid).toBe(false);
    expect(validateProbability(1.01).isValid).toBe(false);
  });

  it('validates distribution parameters correctly', () => {
    // Normal sd must be > 0
    expect(validateNormalParams({ mean: 0, sd: -1 }).isValid).toBe(false);
    expect(validateNormalParams({ mean: 0, sd: 0 }).isValid).toBe(false);
    expect(validateNormalParams({ mean: 0, sd: 1 }).isValid).toBe(true);

    // Binomial size must be non-negative integer
    expect(validateBinomialParams({ size: -5, prob: 0.5 }).isValid).toBe(false);
    expect(validateBinomialParams({ size: 2.5, prob: 0.5 }).isValid).toBe(false);
    expect(validateBinomialParams({ size: 10, prob: 1.5 }).isValid).toBe(false);
    expect(validateBinomialParams({ size: 10, prob: 0.5 }).isValid).toBe(true);

    // Poisson lambda > 0
    expect(validatePoissonParams({ lambda: 0 }).isValid).toBe(false);
    expect(validatePoissonParams({ lambda: -2 }).isValid).toBe(false);
    expect(validatePoissonParams({ lambda: 3.5 }).isValid).toBe(true);

    // Exponential rate > 0
    expect(validateExponentialParams({ rate: 0 }).isValid).toBe(false);
    expect(validateExponentialParams({ rate: 1.5 }).isValid).toBe(true);

    // Gamma shape > 0 and rate > 0
    expect(validateGammaParams({ shape: -1, rate: 2 }).isValid).toBe(false);
    expect(validateGammaParams({ shape: 2, rate: -1 }).isValid).toBe(false);
    expect(validateGammaParams({ shape: 2, rate: 3 }).isValid).toBe(true);

    // Weibull shape > 0 and scale > 0
    expect(validateWeibullParams({ shape: 0, scale: 2 }).isValid).toBe(false);
    expect(validateWeibullParams({ shape: 2, scale: 0 }).isValid).toBe(false);
    expect(validateWeibullParams({ shape: 2, scale: 3 }).isValid).toBe(true);
  });
});
