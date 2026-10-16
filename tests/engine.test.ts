import { describe, expect, it } from 'vitest';
import {
  dbinom,
  pbinom,
  qbinom,
  statsBinomial,
  dpois,
  ppois,
  qpois,
  statsPoisson,
  dnorm,
  pnorm,
  qnorm,
  statsNormal,
  dexp,
  pexp,
  qexp,
  statsExponential,
  dgamma,
  pgamma,
  qgamma,
  statsGamma,
  dweibull,
  pweibull,
  qweibull,
  statsWeibull,
} from '../src/engine/distributions';
import { GOLDEN_CASES } from './golden/reference_cases';

describe('Engine Mathematical Calculations against Reference Values', () => {
  it('passes all golden benchmark reference cases from R', () => {
    for (const testCase of GOLDEN_CASES) {
      let actual: number;
      switch (testCase.func) {
        case 'dbinom':
          actual = dbinom(3, 10, 0.3);
          break;
        case 'pbinom':
          actual = pbinom(4, 10, 0.3);
          break;
        case 'qbinom':
          actual = qbinom(0.85, 10, 0.3);
          break;
        case 'dpois':
          actual = dpois(2, 3);
          break;
        case 'ppois':
          actual = ppois(4, 3);
          break;
        case 'qpois':
          actual = qpois(0.815263, 3);
          break;
        case 'dnorm':
          actual = dnorm(12, 10, 2);
          break;
        case 'pnorm':
          actual = pnorm(12, 10, 2);
          break;
        case 'qnorm':
          actual = qnorm(0.975, 10, 2);
          break;
        case 'dexp':
          actual = dexp(2, 0.5);
          break;
        case 'pexp':
          actual = pexp(2, 0.5);
          break;
        case 'qexp':
          actual = qexp(0.63212056, 0.5);
          break;
        case 'dgamma':
          actual = dgamma(2, 3, 2);
          break;
        case 'pgamma':
          actual = pgamma(2, 3, 2);
          break;
        case 'qgamma':
          actual = qgamma(0.76189669, 3, 2);
          break;
        case 'dweibull':
          actual = dweibull(1.5, 2, 3);
          break;
        case 'pweibull':
          actual = pweibull(1.5, 2, 3);
          break;
        case 'qweibull':
          actual = qweibull(0.2211992, 2, 3);
          break;
        default:
          throw new Error(`Unknown test function ${testCase.func}`);
      }

      // Assert no NaN, Infinity or undefined (Rule 3)
      expect(Number.isFinite(actual)).toBe(true);
      expect(Number.isNaN(actual)).toBe(false);
      expect(actual).toBeDefined();

      // Assert accuracy against reference value (Rule 2)
      expect(Math.abs(actual - testCase.expected)).toBeLessThanOrEqual(testCase.tolerance);
    }
  });

  describe('Summary Statistics (Mean and Variance)', () => {
    it('calculates Binomial mean and variance correctly', () => {
      const stats = statsBinomial({ size: 100, prob: 0.25 });
      expect(stats.mean).toBe(25);
      expect(stats.variance).toBe(18.75);
    });

    it('calculates Poisson mean and variance correctly', () => {
      const stats = statsPoisson({ lambda: 4.5 });
      expect(stats.mean).toBe(4.5);
      expect(stats.variance).toBe(4.5);
    });

    it('calculates Normal mean and variance correctly', () => {
      const stats = statsNormal({ mean: 50, sd: 5 });
      expect(stats.mean).toBe(50);
      expect(stats.variance).toBe(25);
    });

    it('calculates Exponential mean and variance correctly', () => {
      const stats = statsExponential({ rate: 2 });
      expect(stats.mean).toBe(0.5);
      expect(stats.variance).toBe(0.25);
    });

    it('calculates Gamma mean and variance correctly', () => {
      const stats = statsGamma({ shape: 4, rate: 2 });
      expect(stats.mean).toBe(2);
      expect(stats.variance).toBe(1);
    });

    it('calculates Weibull mean and variance correctly', () => {
      const stats = statsWeibull({ shape: 1, scale: 5 }); // Exponential special case (k=1)
      expect(stats.mean).toBeCloseTo(5, 5);
      expect(stats.variance).toBeCloseTo(25, 5);
    });
  });
});
