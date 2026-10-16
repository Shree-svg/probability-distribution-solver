import {
  statsBinomial,
  statsExponential,
  statsGamma,
  statsNormal,
  statsPoisson,
  statsWeibull,
} from '../engine/distributions';
import type { DistributionParams } from '../engine/types';
import { safeFormatNumber } from '../engine/validator';

export interface SummaryMetric {
  label: string;
  symbol: string;
  value: string;
  formula: string;
  latexSymbol: string;
  latexFormula: string;
}

export function computeDistributionSummary(dist: DistributionParams): SummaryMetric[] {
  switch (dist.type) {
    case 'binomial': {
      const { size: n, prob: p } = dist.params;
      const stats = statsBinomial(dist.params);
      const sd = Math.sqrt(stats.variance);
      const modeVal = Math.floor((n + 1) * p);
      return [
        {
          label: 'Expected Value (Mean)',
          symbol: 'E[X]',
          value: safeFormatNumber(stats.mean, 4),
          formula: 'n * p',
          latexSymbol: '\\text{E}[X]',
          latexFormula: 'n p',
        },
        {
          label: 'Variance',
          symbol: 'Var(X)',
          value: safeFormatNumber(stats.variance, 4),
          formula: 'n * p * (1 - p)',
          latexSymbol: '\\text{Var}(X)',
          latexFormula: 'n p (1 - p)',
        },
        {
          label: 'Standard Deviation',
          symbol: 'SD(X)',
          value: safeFormatNumber(sd, 4),
          formula: 'sqrt(Var(X))',
          latexSymbol: '\\sigma',
          latexFormula: '\\sqrt{n p (1 - p)}',
        },
        {
          label: 'Skewness',
          symbol: 'γ₁',
          value: safeFormatNumber(stats.skewness, 4),
          formula: '(1 - 2p) / sqrt(n * p * (1-p))',
          latexSymbol: '\\gamma_1',
          latexFormula: '\\frac{1 - 2p}{\\sqrt{n p (1 - p)}}',
        },
        {
          label: 'Excess Kurtosis',
          symbol: 'γ₂',
          value: safeFormatNumber(stats.kurtosis, 4),
          formula: '(1 - 6p(1-p)) / (n * p * (1-p))',
          latexSymbol: '\\gamma_2',
          latexFormula: '\\frac{1 - 6p(1 - p)}{n p (1 - p)}',
        },
        {
          label: 'Median',
          symbol: 'Med',
          value: safeFormatNumber(stats.median, 0),
          formula: 'qbinom(0.5, n, p)',
          latexSymbol: 'm',
          latexFormula: 'F^{-1}(0.5)',
        },
        {
          label: 'Mode',
          symbol: 'Mode',
          value: String(modeVal),
          formula: 'floor((n + 1) * p)',
          latexSymbol: '\\text{Mode}(X)',
          latexFormula: '\\lfloor (n + 1)p \\rfloor',
        },
        {
          label: 'Moment Generating Function',
          symbol: 'M_X(t)',
          value: `(1 - ${p} + ${p}*e^t)^${n}`,
          formula: '(1 - p + p * e^t)^n',
          latexSymbol: 'M_X(t)',
          latexFormula: '(1 - p + p e^t)^n',
        },
      ];
    }

    case 'poisson': {
      const { lambda: l } = dist.params;
      const stats = statsPoisson(dist.params);
      const sd = Math.sqrt(stats.variance);
      const modeVal = Math.floor(l);
      return [
        {
          label: 'Expected Value (Mean)',
          symbol: 'E[X]',
          value: safeFormatNumber(stats.mean, 4),
          formula: 'lambda',
          latexSymbol: '\\text{E}[X]',
          latexFormula: '\\lambda',
        },
        {
          label: 'Variance',
          symbol: 'Var(X)',
          value: safeFormatNumber(stats.variance, 4),
          formula: 'lambda',
          latexSymbol: '\\text{Var}(X)',
          latexFormula: '\\lambda',
        },
        {
          label: 'Standard Deviation',
          symbol: 'SD(X)',
          value: safeFormatNumber(sd, 4),
          formula: 'sqrt(lambda)',
          latexSymbol: '\\sigma',
          latexFormula: '\\sqrt{\\lambda}',
        },
        {
          label: 'Skewness',
          symbol: 'γ₁',
          value: safeFormatNumber(stats.skewness, 4),
          formula: 'lambda^(-1/2)',
          latexSymbol: '\\gamma_1',
          latexFormula: '\\lambda^{-1/2}',
        },
        {
          label: 'Excess Kurtosis',
          symbol: 'γ₂',
          value: safeFormatNumber(stats.kurtosis, 4),
          formula: '1 / lambda',
          latexSymbol: '\\gamma_2',
          latexFormula: '\\lambda^{-1}',
        },
        {
          label: 'Median',
          symbol: 'Med',
          value: safeFormatNumber(stats.median, 0),
          formula: 'qpois(0.5, lambda)',
          latexSymbol: 'm',
          latexFormula: 'F^{-1}(0.5)',
        },
        {
          label: 'Mode',
          symbol: 'Mode',
          value: String(modeVal),
          formula: 'floor(lambda)',
          latexSymbol: '\\text{Mode}(X)',
          latexFormula: '\\lfloor \\lambda \\rfloor',
        },
        {
          label: 'Moment Generating Function',
          symbol: 'M_X(t)',
          value: `exp(${l} * (e^t - 1))`,
          formula: 'exp(lambda * (e^t - 1))',
          latexSymbol: 'M_X(t)',
          latexFormula: 'e^{\\lambda(e^t - 1)}',
        },
      ];
    }

    case 'normal': {
      const { mean: mu, sd: sigma } = dist.params;
      const stats = statsNormal(dist.params);
      return [
        {
          label: 'Expected Value (Mean)',
          symbol: 'E[X]',
          value: safeFormatNumber(stats.mean, 4),
          formula: 'mu',
          latexSymbol: '\\mu',
          latexFormula: '\\mu',
        },
        {
          label: 'Variance',
          symbol: 'Var(X)',
          value: safeFormatNumber(stats.variance, 4),
          formula: 'sigma^2',
          latexSymbol: '\\sigma^2',
          latexFormula: '\\sigma^2',
        },
        {
          label: 'Standard Deviation',
          symbol: 'SD(X)',
          value: safeFormatNumber(sigma, 4),
          formula: 'sigma',
          latexSymbol: '\\sigma',
          latexFormula: '\\sigma',
        },
        {
          label: 'Skewness',
          symbol: 'γ₁',
          value: '0.0000 (symmetric)',
          formula: '0',
          latexSymbol: '\\gamma_1',
          latexFormula: '0',
        },
        {
          label: 'Excess Kurtosis',
          symbol: 'γ₂',
          value: '0.0000 (mesokurtic)',
          formula: '0',
          latexSymbol: '\\gamma_2',
          latexFormula: '0',
        },
        {
          label: 'Median',
          symbol: 'Med',
          value: safeFormatNumber(stats.median, 4),
          formula: 'mu',
          latexSymbol: 'm',
          latexFormula: '\\mu',
        },
        {
          label: 'Mode',
          symbol: 'Mode',
          value: safeFormatNumber(mu, 4),
          formula: 'mu',
          latexSymbol: '\\text{Mode}(X)',
          latexFormula: '\\mu',
        },
        {
          label: 'Moment Generating Function',
          symbol: 'M_X(t)',
          value: `exp(${mu}*t + 0.5*${(sigma ** 2).toFixed(2)}*t^2)`,
          formula: 'exp(mu * t + 0.5 * sigma^2 * t^2)',
          latexSymbol: 'M_X(t)',
          latexFormula: 'e^{\\mu t + \\frac{1}{2}\\sigma^2 t^2}',
        },
      ];
    }

    case 'exponential': {
      const { rate: l } = dist.params;
      const stats = statsExponential(dist.params);
      const sd = Math.sqrt(stats.variance);
      return [
        {
          label: 'Expected Value (Mean)',
          symbol: 'E[X]',
          value: safeFormatNumber(stats.mean, 4),
          formula: '1 / lambda',
          latexSymbol: '\\text{E}[X]',
          latexFormula: '\\frac{1}{\\lambda}',
        },
        {
          label: 'Variance',
          symbol: 'Var(X)',
          value: safeFormatNumber(stats.variance, 4),
          formula: '1 / lambda^2',
          latexSymbol: '\\text{Var}(X)',
          latexFormula: '\\frac{1}{\\lambda^2}',
        },
        {
          label: 'Standard Deviation',
          symbol: 'SD(X)',
          value: safeFormatNumber(sd, 4),
          formula: '1 / lambda',
          latexSymbol: '\\sigma',
          latexFormula: '\\frac{1}{\\lambda}',
        },
        {
          label: 'Skewness',
          symbol: 'γ₁',
          value: safeFormatNumber(stats.skewness, 4),
          formula: '2',
          latexSymbol: '\\gamma_1',
          latexFormula: '2',
        },
        {
          label: 'Excess Kurtosis',
          symbol: 'γ₂',
          value: safeFormatNumber(stats.kurtosis, 4),
          formula: '6',
          latexSymbol: '\\gamma_2',
          latexFormula: '6',
        },
        {
          label: 'Median',
          symbol: 'Med',
          value: safeFormatNumber(stats.median, 4),
          formula: 'ln(2) / lambda',
          latexSymbol: 'm',
          latexFormula: '\\frac{\\ln 2}{\\lambda}',
        },
        {
          label: 'Mode',
          symbol: 'Mode',
          value: '0.0000',
          formula: '0',
          latexSymbol: '\\text{Mode}(X)',
          latexFormula: '0',
        },
        {
          label: 'Moment Generating Function',
          symbol: 'M_X(t)',
          value: `${l} / (${l} - t),  t < ${l}`,
          formula: 'lambda / (lambda - t)',
          latexSymbol: 'M_X(t)',
          latexFormula: '\\frac{\\lambda}{\\lambda - t} \\quad (t < \\lambda)',
        },
      ];
    }

    case 'gamma': {
      const { shape: a, rate: l } = dist.params;
      const stats = statsGamma(dist.params);
      const sd = Math.sqrt(stats.variance);
      const modeVal = a >= 1 ? (a - 1) / l : 0;
      return [
        {
          label: 'Expected Value (Mean)',
          symbol: 'E[X]',
          value: safeFormatNumber(stats.mean, 4),
          formula: 'alpha / lambda',
          latexSymbol: '\\text{E}[X]',
          latexFormula: '\\frac{\\alpha}{\\lambda}',
        },
        {
          label: 'Variance',
          symbol: 'Var(X)',
          value: safeFormatNumber(stats.variance, 4),
          formula: 'alpha / lambda^2',
          latexSymbol: '\\text{Var}(X)',
          latexFormula: '\\frac{\\alpha}{\\lambda^2}',
        },
        {
          label: 'Standard Deviation',
          symbol: 'SD(X)',
          value: safeFormatNumber(sd, 4),
          formula: 'sqrt(alpha) / lambda',
          latexSymbol: '\\sigma',
          latexFormula: '\\frac{\\sqrt{\\alpha}}{\\lambda}',
        },
        {
          label: 'Skewness',
          symbol: 'γ₁',
          value: safeFormatNumber(stats.skewness, 4),
          formula: '2 / sqrt(alpha)',
          latexSymbol: '\\gamma_1',
          latexFormula: '\\frac{2}{\\sqrt{\\alpha}}',
        },
        {
          label: 'Excess Kurtosis',
          symbol: 'γ₂',
          value: safeFormatNumber(stats.kurtosis, 4),
          formula: '6 / alpha',
          latexSymbol: '\\gamma_2',
          latexFormula: '\\frac{6}{\\alpha}',
        },
        {
          label: 'Median',
          symbol: 'Med',
          value: safeFormatNumber(stats.median, 4),
          formula: 'qgamma(0.5, alpha, lambda)',
          latexSymbol: 'm',
          latexFormula: 'F^{-1}(0.5)',
        },
        {
          label: 'Mode',
          symbol: 'Mode',
          value: safeFormatNumber(modeVal, 4),
          formula: 'alpha >= 1 ? (alpha - 1) / lambda : 0',
          latexSymbol: '\\text{Mode}(X)',
          latexFormula: '\\frac{\\alpha - 1}{\\lambda} \\quad (\\alpha \\ge 1)',
        },
        {
          label: 'Moment Generating Function',
          symbol: 'M_X(t)',
          value: `(1 - t / ${l})^(-${a}),  t < ${l}`,
          formula: '(1 - t / lambda)^(-alpha)',
          latexSymbol: 'M_X(t)',
          latexFormula: '\\left(1 - \\frac{t}{\\lambda}\\right)^{-\\alpha} \\quad (t < \\lambda)',
        },
      ];
    }

    case 'weibull': {
      const { shape: k, scale: l } = dist.params;
      const stats = statsWeibull(dist.params);
      const sd = Math.sqrt(stats.variance);
      const modeVal = k > 1 ? l * Math.pow((k - 1) / k, 1 / k) : 0;
      const mgfText = k === 1 ? `(1 - ${l}*t)^(-1), t < ${1 / l}` : 'No closed form for k ≠ 1';
      return [
        {
          label: 'Expected Value (Mean)',
          symbol: 'E[X]',
          value: safeFormatNumber(stats.mean, 4),
          formula: 'lambda * Gamma(1 + 1/k)',
          latexSymbol: '\\text{E}[X]',
          latexFormula: '\\lambda \\Gamma\\left(1 + \\frac{1}{k}\\right)',
        },
        {
          label: 'Variance',
          symbol: 'Var(X)',
          value: safeFormatNumber(stats.variance, 4),
          formula: 'lambda^2 * [Gamma(1 + 2/k) - Gamma^2(1 + 1/k)]',
          latexSymbol: '\\text{Var}(X)',
          latexFormula: '\\lambda^2 \\left[\\Gamma\\left(1 + \\frac{2}{k}\\right) - \\Gamma^2\\left(1 + \\frac{1}{k}\\right)\\right]',
        },
        {
          label: 'Standard Deviation',
          symbol: 'SD(X)',
          value: safeFormatNumber(sd, 4),
          formula: 'sqrt(Var(X))',
          latexSymbol: '\\sigma',
          latexFormula: '\\sqrt{\\text{Var}(X)}',
        },
        {
          label: 'Skewness',
          symbol: 'γ₁',
          value: safeFormatNumber(stats.skewness, 4),
          formula: 'Third standardized moment',
          latexSymbol: '\\gamma_1',
          latexFormula: '\\gamma_1(k)',
        },
        {
          label: 'Excess Kurtosis',
          symbol: 'γ₂',
          value: safeFormatNumber(stats.kurtosis, 4),
          formula: 'Fourth standardized moment - 3',
          latexSymbol: '\\gamma_2',
          latexFormula: '\\gamma_2(k)',
        },
        {
          label: 'Median',
          symbol: 'Med',
          value: safeFormatNumber(stats.median, 4),
          formula: 'lambda * (ln 2)^(1/k)',
          latexSymbol: 'm',
          latexFormula: '\\lambda (\\ln 2)^{1/k}',
        },
        {
          label: 'Mode',
          symbol: 'Mode',
          value: safeFormatNumber(modeVal, 4),
          formula: 'k > 1 ? lambda * ((k-1)/k)^(1/k) : 0',
          latexSymbol: '\\text{Mode}(X)',
          latexFormula: '\\lambda \\left(\\frac{k - 1}{k}\\right)^{1/k} \\quad (k > 1)',
        },
        {
          label: 'Moment Generating Function',
          symbol: 'M_X(t)',
          value: mgfText,
          formula: 'k = 1: (1 - lambda * t)^(-1)',
          latexSymbol: 'M_X(t)',
          latexFormula: k === 1 ? '(1 - \\lambda t)^{-1}' : '\\sum_{n=0}^\\infty \\frac{t^n}{n!} \\text{E}[X^n]',
        },
      ];
    }
  }
}
