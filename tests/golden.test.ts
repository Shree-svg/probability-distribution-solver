import { describe, expect, it } from 'vitest';
import goldenData from './golden/golden.json';
import {
  dbinom,
  pbinom,
  sbinom,
  qbinom,
  statsBinomial,
  dpois,
  ppois,
  spois,
  qpois,
  statsPoisson,
  dnorm,
  pnorm,
  snorm,
  qnorm,
  statsNormal,
  dexp,
  pexp,
  sexp,
  qexp,
  statsExponential,
  dgamma,
  pgamma,
  sgamma,
  qgamma,
  statsGamma,
  dweibull,
  pweibull,
  sweibull,
  qweibull,
  statsWeibull,
} from '../src/engine/distributions';

interface GoldenRecord {
  dist: 'normal' | 'binomial' | 'poisson' | 'exponential' | 'gamma' | 'weibull';
  params: Record<string, number>;
  func: string;
  arg: number | null;
  expected: number;
}

function checkTolerance(actual: number, expected: number, rtol = 1e-9, atol = 1e-12): boolean {
  if (Number.isNaN(actual) || !Number.isFinite(actual)) return false;
  const diff = Math.abs(actual - expected);
  if (diff <= atol) return true;
  if (Math.abs(expected) > 0) {
    return diff / Math.abs(expected) <= rtol;
  }
  return false;
}

describe('SciPy Golden Test Suite (11,000+ Cases)', () => {
  it('matches scipy reference values with rtol=1e-9 and atol=1e-12', () => {
    const records = goldenData as GoldenRecord[];
    expect(records.length).toBeGreaterThanOrEqual(2000);

    let failures = 0;
    const failureLogs: string[] = [];

    for (let i = 0; i < records.length; i++) {
      const { dist, params, func, arg, expected } = records[i];
      let actual: number | undefined;

      try {
        switch (dist) {
          case 'normal': {
            const { mean, sd } = params;
            if (func === 'pdf' && arg !== null) actual = dnorm(arg, mean, sd);
            else if (func === 'cdf' && arg !== null) actual = pnorm(arg, mean, sd);
            else if (func === 'sf' && arg !== null) actual = snorm(arg, mean, sd);
            else if (func === 'quantile' && arg !== null) actual = qnorm(arg, mean, sd);
            else if (func === 'mean') actual = statsNormal({ mean, sd }).mean;
            else if (func === 'variance') actual = statsNormal({ mean, sd }).variance;
            else if (func === 'skewness') actual = statsNormal({ mean, sd }).skewness;
            else if (func === 'kurtosis') actual = statsNormal({ mean, sd }).kurtosis;
            else if (func === 'median') actual = statsNormal({ mean, sd }).median;
            break;
          }

          case 'binomial': {
            const { size, prob } = params;
            if (func === 'pmf' && arg !== null) actual = dbinom(arg, size, prob);
            else if (func === 'cdf' && arg !== null) actual = pbinom(arg, size, prob);
            else if (func === 'sf' && arg !== null) actual = sbinom(arg, size, prob);
            else if (func === 'quantile' && arg !== null) actual = qbinom(arg, size, prob);
            else if (func === 'mean') actual = statsBinomial({ size, prob }).mean;
            else if (func === 'variance') actual = statsBinomial({ size, prob }).variance;
            else if (func === 'skewness') actual = statsBinomial({ size, prob }).skewness;
            else if (func === 'kurtosis') actual = statsBinomial({ size, prob }).kurtosis;
            else if (func === 'median') actual = statsBinomial({ size, prob }).median;
            break;
          }

          case 'poisson': {
            const { lambda } = params;
            if (func === 'pmf' && arg !== null) actual = dpois(arg, lambda);
            else if (func === 'cdf' && arg !== null) actual = ppois(arg, lambda);
            else if (func === 'sf' && arg !== null) actual = spois(arg, lambda);
            else if (func === 'quantile' && arg !== null) actual = qpois(arg, lambda);
            else if (func === 'mean') actual = statsPoisson({ lambda }).mean;
            else if (func === 'variance') actual = statsPoisson({ lambda }).variance;
            else if (func === 'skewness') actual = statsPoisson({ lambda }).skewness;
            else if (func === 'kurtosis') actual = statsPoisson({ lambda }).kurtosis;
            else if (func === 'median') actual = statsPoisson({ lambda }).median;
            break;
          }

          case 'exponential': {
            const { rate } = params;
            if (func === 'pdf' && arg !== null) actual = dexp(arg, rate);
            else if (func === 'cdf' && arg !== null) actual = pexp(arg, rate);
            else if (func === 'sf' && arg !== null) actual = sexp(arg, rate);
            else if (func === 'quantile' && arg !== null) actual = qexp(arg, rate);
            else if (func === 'mean') actual = statsExponential({ rate }).mean;
            else if (func === 'variance') actual = statsExponential({ rate }).variance;
            else if (func === 'skewness') actual = statsExponential({ rate }).skewness;
            else if (func === 'kurtosis') actual = statsExponential({ rate }).kurtosis;
            else if (func === 'median') actual = statsExponential({ rate }).median;
            break;
          }

          case 'gamma': {
            const { shape, rate } = params;
            if (func === 'pdf' && arg !== null) actual = dgamma(arg, shape, rate);
            else if (func === 'cdf' && arg !== null) actual = pgamma(arg, shape, rate);
            else if (func === 'sf' && arg !== null) actual = sgamma(arg, shape, rate);
            else if (func === 'quantile' && arg !== null) actual = qgamma(arg, shape, rate);
            else if (func === 'mean') actual = statsGamma({ shape, rate }).mean;
            else if (func === 'variance') actual = statsGamma({ shape, rate }).variance;
            else if (func === 'skewness') actual = statsGamma({ shape, rate }).skewness;
            else if (func === 'kurtosis') actual = statsGamma({ shape, rate }).kurtosis;
            else if (func === 'median') actual = statsGamma({ shape, rate }).median;
            break;
          }

          case 'weibull': {
            const { shape, scale } = params;
            if (func === 'pdf' && arg !== null) actual = dweibull(arg, shape, scale);
            else if (func === 'cdf' && arg !== null) actual = pweibull(arg, shape, scale);
            else if (func === 'sf' && arg !== null) actual = sweibull(arg, shape, scale);
            else if (func === 'quantile' && arg !== null) actual = qweibull(arg, shape, scale);
            else if (func === 'mean') actual = statsWeibull({ shape, scale }).mean;
            else if (func === 'variance') actual = statsWeibull({ shape, scale }).variance;
            else if (func === 'skewness') actual = statsWeibull({ shape, scale }).skewness;
            else if (func === 'kurtosis') actual = statsWeibull({ shape, scale }).kurtosis;
            else if (func === 'median') actual = statsWeibull({ shape, scale }).median;
            break;
          }
        }
      } catch (err: unknown) {
        failures++;
        failureLogs.push(
          `Error on [${dist} ${func} arg=${arg}]: ${err instanceof Error ? err.message : String(err)}`
        );
        continue;
      }

      if (actual === undefined || !checkTolerance(actual, expected, 1e-9, 1e-12)) {
        failures++;
        if (failureLogs.length < 10) {
          const relErr = Math.abs(expected) > 0 ? Math.abs((actual ?? NaN) - expected) / Math.abs(expected) : Math.abs((actual ?? NaN) - expected);
          failureLogs.push(
            `Mismatch on ${dist}.${func}(${arg}): actual=${actual}, expected=${expected}, relErr=${relErr}`
          );
        }
      }
    }

    if (failures > 0) {
      console.error(`Total failures: ${failures} out of ${records.length}`);
      console.error(failureLogs.join('\n'));
    }

    expect(failures).toBe(0);
  });
});
