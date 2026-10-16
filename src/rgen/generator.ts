import type { DistributionParams } from '../engine/types';
import { validateDistributionParams, validateFiniteNumber, validateProbability } from '../engine/validator';
export { generateRScript, type RScriptInput } from './script_generator';

export type QueryOp =
  | { op: 'pdf'; x: number }
  | { op: 'cdf'; q: number; lowerTail?: boolean }
  | { op: 'interval'; lower: number; upper: number }
  | { op: 'quantile'; p: number }
  | { op: 'sample'; n: number };

/**
 * Generates idiomatic R code strictly using R distribution naming and parameterization conventions:
 * - Binomial: size, prob
 * - Poisson: lambda
 * - Normal: mean, sd
 * - Exponential: rate
 * - Gamma: shape, rate
 * - Weibull: shape, scale
 */
export function generateRCode(dist: DistributionParams, query: QueryOp): string {
  const validDist = validateDistributionParams(dist);
  if (!validDist.isValid) {
    throw new Error(`Invalid distribution parameters: ${validDist.error}`);
  }

  switch (dist.type) {
    case 'binomial': {
      const p = dist.params;
      const args = `size = ${p.size}, prob = ${p.prob}`;
      switch (query.op) {
        case 'pdf':
          validateFiniteNumber(query.x, 'x');
          return `dbinom(${query.x}, ${args})`;
        case 'cdf':
          validateFiniteNumber(query.q, 'q');
          return query.lowerTail === false
            ? `pbinom(${query.q}, ${args}, lower.tail = FALSE)`
            : `pbinom(${query.q}, ${args})`;
        case 'interval':
          validateFiniteNumber(query.lower, 'lower');
          validateFiniteNumber(query.upper, 'upper');
          return `pbinom(${query.upper}, ${args}) - pbinom(${query.lower - 1}, ${args})`;
        case 'quantile':
          validateProbability(query.p, 'p');
          return `qbinom(${query.p}, ${args})`;
        case 'sample':
          return `rbinom(${query.n}, ${args})`;
      }
      break;
    }

    case 'poisson': {
      const p = dist.params;
      const args = `lambda = ${p.lambda}`;
      switch (query.op) {
        case 'pdf':
          validateFiniteNumber(query.x, 'x');
          return `dpois(${query.x}, ${args})`;
        case 'cdf':
          validateFiniteNumber(query.q, 'q');
          return query.lowerTail === false
            ? `ppois(${query.q}, ${args}, lower.tail = FALSE)`
            : `ppois(${query.q}, ${args})`;
        case 'interval':
          validateFiniteNumber(query.lower, 'lower');
          validateFiniteNumber(query.upper, 'upper');
          return `ppois(${query.upper}, ${args}) - ppois(${query.lower - 1}, ${args})`;
        case 'quantile':
          validateProbability(query.p, 'p');
          return `qpois(${query.p}, ${args})`;
        case 'sample':
          return `rpois(${query.n}, ${args})`;
      }
      break;
    }

    case 'normal': {
      const p = dist.params;
      const args = `mean = ${p.mean}, sd = ${p.sd}`;
      switch (query.op) {
        case 'pdf':
          validateFiniteNumber(query.x, 'x');
          return `dnorm(${query.x}, ${args})`;
        case 'cdf':
          validateFiniteNumber(query.q, 'q');
          return query.lowerTail === false
            ? `pnorm(${query.q}, ${args}, lower.tail = FALSE)`
            : `pnorm(${query.q}, ${args})`;
        case 'interval':
          validateFiniteNumber(query.lower, 'lower');
          validateFiniteNumber(query.upper, 'upper');
          return `pnorm(${query.upper}, ${args}) - pnorm(${query.lower}, ${args})`;
        case 'quantile':
          validateProbability(query.p, 'p');
          return `qnorm(${query.p}, ${args})`;
        case 'sample':
          return `rnorm(${query.n}, ${args})`;
      }
      break;
    }

    case 'exponential': {
      const p = dist.params;
      const args = `rate = ${p.rate}`;
      switch (query.op) {
        case 'pdf':
          validateFiniteNumber(query.x, 'x');
          return `dexp(${query.x}, ${args})`;
        case 'cdf':
          validateFiniteNumber(query.q, 'q');
          return query.lowerTail === false
            ? `pexp(${query.q}, ${args}, lower.tail = FALSE)`
            : `pexp(${query.q}, ${args})`;
        case 'interval':
          validateFiniteNumber(query.lower, 'lower');
          validateFiniteNumber(query.upper, 'upper');
          return `pexp(${query.upper}, ${args}) - pexp(${query.lower}, ${args})`;
        case 'quantile':
          validateProbability(query.p, 'p');
          return `qexp(${query.p}, ${args})`;
        case 'sample':
          return `rexp(${query.n}, ${args})`;
      }
      break;
    }

    case 'gamma': {
      const p = dist.params;
      const args = `shape = ${p.shape}, rate = ${p.rate}`;
      switch (query.op) {
        case 'pdf':
          validateFiniteNumber(query.x, 'x');
          return `dgamma(${query.x}, ${args})`;
        case 'cdf':
          validateFiniteNumber(query.q, 'q');
          return query.lowerTail === false
            ? `pgamma(${query.q}, ${args}, lower.tail = FALSE)`
            : `pgamma(${query.q}, ${args})`;
        case 'interval':
          validateFiniteNumber(query.lower, 'lower');
          validateFiniteNumber(query.upper, 'upper');
          return `pgamma(${query.upper}, ${args}) - pgamma(${query.lower}, ${args})`;
        case 'quantile':
          validateProbability(query.p, 'p');
          return `qgamma(${query.p}, ${args})`;
        case 'sample':
          return `rgamma(${query.n}, ${args})`;
      }
      break;
    }

    case 'weibull': {
      const p = dist.params;
      const args = `shape = ${p.shape}, scale = ${p.scale}`;
      switch (query.op) {
        case 'pdf':
          validateFiniteNumber(query.x, 'x');
          return `dweibull(${query.x}, ${args})`;
        case 'cdf':
          validateFiniteNumber(query.q, 'q');
          return query.lowerTail === false
            ? `pweibull(${query.q}, ${args}, lower.tail = FALSE)`
            : `pweibull(${query.q}, ${args})`;
        case 'interval':
          validateFiniteNumber(query.lower, 'lower');
          validateFiniteNumber(query.upper, 'upper');
          return `pweibull(${query.upper}, ${args}) - pweibull(${query.lower}, ${args})`;
        case 'quantile':
          validateProbability(query.p, 'p');
          return `qweibull(${query.p}, ${args})`;
        case 'sample':
          return `rweibull(${query.n}, ${args})`;
      }
      break;
    }
  }
}
