import { describe, expect, it } from 'vitest';
import {
  dbinom,
  pbinom,
  dpois,
  ppois,
  pnorm,
  qnorm,
  dexp,
  pexp,
  sexp,
  qexp,
  dgamma,
  pgamma,
  qgamma,
  dweibull,
  pweibull,
  qweibull,
} from '../src/engine/distributions';

describe('Mathematical Property Tests', () => {
  it('PMFs sum to 1', () => {
    // Binomial PMF sum over full support [0, size]
    const n = 25;
    const p = 0.4;
    let binomSum = 0;
    for (let k = 0; k <= n; k++) {
      binomSum += dbinom(k, n, p);
    }
    expect(binomSum).toBeCloseTo(1.0, 10);

    // Poisson PMF sum up to reasonable truncation
    const lambda = 4.0;
    let poisSum = 0;
    for (let k = 0; k <= 40; k++) {
      poisSum += dpois(k, lambda);
    }
    expect(poisSum).toBeCloseTo(1.0, 10);
  });

  it('CDFs are strictly monotonic and end at 1', () => {
    // Normal
    const normPoints = [-10, -3, -1, 0, 1, 3, 10];
    for (let i = 0; i < normPoints.length - 1; i++) {
      expect(pnorm(normPoints[i + 1], 0, 1)).toBeGreaterThanOrEqual(pnorm(normPoints[i], 0, 1));
    }
    expect(pnorm(10, 0, 1)).toBeCloseTo(1.0, 10);

    // Binomial
    for (let k = 0; k < 20; k++) {
      expect(pbinom(k + 1, 20, 0.5)).toBeGreaterThanOrEqual(pbinom(k, 20, 0.5));
    }
    expect(pbinom(20, 20, 0.5)).toBe(1.0);

    // Poisson
    for (let k = 0; k < 30; k++) {
      expect(ppois(k + 1, 5)).toBeGreaterThanOrEqual(ppois(k, 5));
    }
    expect(ppois(50, 5)).toBeCloseTo(1.0, 10);

    // Exponential
    const expPoints = [0, 0.5, 1, 2, 5, 10, 20];
    for (let i = 0; i < expPoints.length - 1; i++) {
      expect(pexp(expPoints[i + 1], 1.5)).toBeGreaterThanOrEqual(pexp(expPoints[i], 1.5));
    }
    expect(pexp(50, 1.5)).toBeCloseTo(1.0, 10);

    // Gamma
    const gammaPoints = [0, 0.2, 0.5, 1, 2, 5, 10];
    for (let i = 0; i < gammaPoints.length - 1; i++) {
      expect(pgamma(gammaPoints[i + 1], 2, 1)).toBeGreaterThanOrEqual(pgamma(gammaPoints[i], 2, 1));
    }
    expect(pgamma(50, 2, 1)).toBeCloseTo(1.0, 10);

    // Weibull
    const weibullPoints = [0, 0.5, 1, 2, 4, 8, 16];
    for (let i = 0; i < weibullPoints.length - 1; i++) {
      expect(pweibull(weibullPoints[i + 1], 2, 3)).toBeGreaterThanOrEqual(pweibull(weibullPoints[i], 2, 3));
    }
    expect(pweibull(50, 2, 3)).toBeCloseTo(1.0, 10);
  });

  it('quantile(cdf(x)) round-trips for continuous distributions', () => {
    // Normal round-trip
    const xNorm = 1.25;
    const cdfNorm = pnorm(xNorm, 0, 1);
    expect(qnorm(cdfNorm, 0, 1)).toBeCloseTo(xNorm, 9);

    // Exponential round-trip
    const xExp = 2.4;
    const cdfExp = pexp(xExp, 0.8);
    expect(qexp(cdfExp, 0.8)).toBeCloseTo(xExp, 9);

    // Gamma round-trip
    const xGamma = 3.5;
    const cdfGamma = pgamma(xGamma, 2.5, 1.2);
    expect(qgamma(cdfGamma, 2.5, 1.2)).toBeCloseTo(xGamma, 9);

    // Weibull round-trip
    const xWeibull = 2.8;
    const cdfWeibull = pweibull(xWeibull, 2.0, 3.0);
    expect(qweibull(cdfWeibull, 2.0, 3.0)).toBeCloseTo(xWeibull, 9);
  });

  it('Gamma(1, lambda) equals Exponential(lambda)', () => {
    const lambda = 2.5;
    const testPoints = [0.1, 0.5, 1.0, 2.0, 3.5];

    for (const x of testPoints) {
      // PDF
      expect(dgamma(x, 1, lambda)).toBeCloseTo(dexp(x, lambda), 10);
      // CDF
      expect(pgamma(x, 1, lambda)).toBeCloseTo(pexp(x, lambda), 10);
    }

    // Quantile
    for (const p of [0.1, 0.25, 0.5, 0.75, 0.9]) {
      expect(qgamma(p, 1, lambda)).toBeCloseTo(qexp(p, lambda), 9);
    }
  });

  it('Weibull(1, scale) equals Exponential(rate = 1 / scale)', () => {
    const scale = 4.0;
    const rate = 1.0 / scale;
    const testPoints = [0.2, 0.8, 1.5, 3.0, 6.0];

    for (const x of testPoints) {
      // PDF
      expect(dweibull(x, 1, scale)).toBeCloseTo(dexp(x, rate), 10);
      // CDF
      expect(pweibull(x, 1, scale)).toBeCloseTo(pexp(x, rate), 10);
    }

    // Quantile
    for (const p of [0.1, 0.25, 0.5, 0.75, 0.9]) {
      expect(qweibull(p, 1, scale)).toBeCloseTo(qexp(p, rate), 9);
    }
  });

  it('Binomial converges to Poisson limit (n -> infty, n*p = lambda)', () => {
    const lambda = 3.0;
    const n = 100000;
    const p = lambda / n;

    for (const k of [0, 1, 2, 3, 4, 5, 8]) {
      const pBinom = dbinom(k, n, p);
      const pPois = dpois(k, lambda);
      // Relative error should be < 1e-4 for n = 100000
      expect(Math.abs(pBinom - pPois)).toBeLessThan(1e-4);
    }
  });

  describe('Textbook Values Verification', () => {
    it('Phi(1.96) = 0.9750021', () => {
      const actual = pnorm(1.96, 0, 1);
      expect(Number(actual.toFixed(7))).toBe(0.9750021);
    });

    it('Binomial(10, 0.5) P(X <= 5) = 0.6230469', () => {
      const actual = pbinom(5, 10, 0.5);
      expect(Number(actual.toFixed(7))).toBe(0.6230469);
    });

    it('Poisson(3) P(X <= 2) = 0.4231901', () => {
      const actual = ppois(2, 3);
      expect(Number(actual.toFixed(7))).toBe(0.4231901);
    });

    it('Exponential(2) P(X > 1) = 0.1353353', () => {
      const actual = sexp(1, 2);
      expect(Number(actual.toFixed(7))).toBe(0.1353353);
    });
  });
});
