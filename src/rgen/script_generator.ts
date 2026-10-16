import type { DistributionParams } from '../engine/types';
import { validateDistributionParams } from '../engine/validator';
import type { SolverQuery } from '../solver/types';

export interface RScriptInput {
  distribution: DistributionParams;
  query: SolverQuery;
  resultValue?: number;
}

/**
 * Builds a runnable base-R script for any solved probability problem.
 * Conforms strictly to:
 * - Base R only (no external packages)
 * - Binomial: dbinom, pbinom, qbinom
 * - Poisson: dpois, ppois, qpois
 * - Normal: dnorm, pnorm, qnorm (mean, sd)
 * - Exponential: dexp, pexp, qexp (rate)
 * - Gamma: dgamma(x, shape=, rate=), pgamma, qgamma
 * - Weibull: dweibull(x, shape=, scale=), pweibull, qweibull
 * - Discrete P(X >= x) uses x - 1 with lower.tail = FALSE
 * - Interval: pnorm(b) - pnorm(a) for continuous, pbinom(b) - pbinom(a - 1) for discrete
 * - Every single line of code has an explanatory comment directly above it
 * - Computes and prints mean and variance
 * - Prints the answer using cat and round
 * - Produces base-R plots: barplot with colored region for discrete, curve() + polygon() for continuous
 */
export function generateRScript(input: RScriptInput): string {
  const dist = input.distribution;
  const query = input.query;

  const valid = validateDistributionParams(dist);
  if (!valid.isValid) {
    throw new Error(`Invalid distribution parameters: ${valid.error}`);
  }

  const lines: string[] = [];

  function add(comment: string, code: string) {
    lines.push(`# ${comment}`);
    lines.push(code);
  }

  const isDiscrete = dist.type === 'binomial' || dist.type === 'poisson';

  // ==========================================
  // Section 1: Parameter Definitions & Moments
  // ==========================================
  switch (dist.type) {
    case 'binomial':
      add('Define the number of independent trials (size n)', `size <- ${dist.params.size}`);
      add('Define the probability of success on each trial (prob p)', `prob <- ${dist.params.prob}`);
      add('Compute the theoretical binomial mean: E[X] = n * p', 'mean_val <- size * prob');
      add('Compute the theoretical binomial variance: Var(X) = n * p * (1 - p)', 'var_val <- size * prob * (1 - prob)');
      break;

    case 'poisson':
      add('Define the average event rate parameter (lambda)', `lambda <- ${dist.params.lambda}`);
      add('Compute the theoretical Poisson mean: E[X] = lambda', 'mean_val <- lambda');
      add('Compute the theoretical Poisson variance: Var(X) = lambda', 'var_val <- lambda');
      break;

    case 'normal':
      add('Define the normal distribution mean parameter (mu)', `mu <- ${dist.params.mean}`);
      add('Define the normal distribution standard deviation parameter (sigma)', `sigma <- ${dist.params.sd}`);
      add('Compute the theoretical normal mean: E[X] = mu', 'mean_val <- mu');
      add('Compute the theoretical normal variance: Var(X) = sigma^2', 'var_val <- sigma^2');
      break;

    case 'exponential':
      add('Define the exponential rate parameter (lambda)', `rate <- ${dist.params.rate}`);
      add('Compute the theoretical exponential mean: E[X] = 1 / rate', 'mean_val <- 1 / rate');
      add('Compute the theoretical exponential variance: Var(X) = 1 / (rate^2)', 'var_val <- 1 / (rate^2)');
      break;

    case 'gamma':
      add('Define the gamma shape parameter (alpha)', `shape <- ${dist.params.shape}`);
      add('Define the gamma rate parameter (lambda)', `rate <- ${dist.params.rate}`);
      add('Compute the theoretical gamma mean: E[X] = shape / rate', 'mean_val <- shape / rate');
      add('Compute the theoretical gamma variance: Var(X) = shape / (rate^2)', 'var_val <- shape / (rate^2)');
      break;

    case 'weibull':
      add('Define the Weibull shape parameter (k)', `shape <- ${dist.params.shape}`);
      add('Define the Weibull scale parameter (lambda)', `scale <- ${dist.params.scale}`);
      add('Compute the theoretical Weibull mean: E[X] = scale * gamma(1 + 1/shape)', 'mean_val <- scale * gamma(1 + 1 / shape)');
      add('Compute the theoretical Weibull variance: Var(X) = scale^2 * (gamma(1 + 2/shape) - gamma(1 + 1/shape)^2)', 'var_val <- scale^2 * (gamma(1 + 2 / shape) - (gamma(1 + 1 / shape))^2)');
      break;
  }

  // ==========================================
  // Section 2: Query Evaluation
  // ==========================================
  switch (query.type) {
    case 'prob_equal': {
      const x = query.x ?? 0;
      add('Define the query target point x', `x_val <- ${x}`);
      if (dist.type === 'binomial') {
        add('Evaluate the binomial probability mass function P(X = x)', 'ans <- dbinom(x_val, size = size, prob = prob)');
      } else if (dist.type === 'poisson') {
        add('Evaluate the Poisson probability mass function P(X = x)', 'ans <- dpois(x_val, lambda = lambda)');
      } else {
        add('For continuous distributions, exact point probability P(X = x) is zero', 'ans <- 0');
      }
      break;
    }

    case 'prob_less_equal': {
      const x = query.x ?? 0;
      add('Define the upper bound threshold x', `x_val <- ${x}`);
      if (dist.type === 'binomial') {
        add('Evaluate the cumulative distribution function P(X <= x)', 'ans <- pbinom(x_val, size = size, prob = prob)');
      } else if (dist.type === 'poisson') {
        add('Evaluate the cumulative distribution function P(X <= x)', 'ans <- ppois(x_val, lambda = lambda)');
      } else if (dist.type === 'normal') {
        add('Evaluate the cumulative distribution function P(X <= x)', 'ans <- pnorm(x_val, mean = mu, sd = sigma)');
      } else if (dist.type === 'exponential') {
        add('Evaluate the cumulative distribution function P(X <= x)', 'ans <- pexp(x_val, rate = rate)');
      } else if (dist.type === 'gamma') {
        add('Evaluate the cumulative distribution function P(X <= x)', 'ans <- pgamma(x_val, shape = shape, rate = rate)');
      } else {
        add('Evaluate the cumulative distribution function P(X <= x)', 'ans <- pweibull(x_val, shape = shape, scale = scale)');
      }
      break;
    }

    case 'prob_less': {
      const x = query.x ?? 0;
      add('Define the strict upper bound threshold x', `x_val <- ${x}`);
      if (isDiscrete) {
        add('For discrete integer variables, P(X < x) is strictly equivalent to P(X <= x - 1)', 'k_val <- x_val - 1');
        if (dist.type === 'binomial') {
          add('Evaluate cumulative probability P(X <= x - 1)', 'ans <- pbinom(k_val, size = size, prob = prob)');
        } else {
          add('Evaluate cumulative probability P(X <= x - 1)', 'ans <- ppois(k_val, lambda = lambda)');
        }
      } else {
        add('For continuous distributions, strict inequality P(X < x) equals P(X <= x)', 'ans <- ' + getContinuousCdfCall(dist.type, 'x_val'));
      }
      break;
    }

    case 'prob_greater_equal': {
      const x = query.x ?? 0;
      add('Define the lower bound threshold x', `x_val <- ${x}`);
      if (isDiscrete) {
        add('For discrete variables, P(X >= x) uses x - 1 with lower.tail = FALSE', 'k_val <- x_val - 1');
        if (dist.type === 'binomial') {
          add('Evaluate survival probability P(X >= x) = 1 - P(X <= x - 1)', 'ans <- pbinom(k_val, size = size, prob = prob, lower.tail = FALSE)');
        } else {
          add('Evaluate survival probability P(X >= x) = 1 - P(X <= x - 1)', 'ans <- ppois(k_val, lambda = lambda, lower.tail = FALSE)');
        }
      } else {
        add('For continuous distributions, P(X >= x) equals survival probability P(X > x)', 'ans <- ' + getContinuousSfCall(dist.type, 'x_val'));
      }
      break;
    }

    case 'prob_greater': {
      const x = query.x ?? 0;
      add('Define the strict lower bound threshold x', `x_val <- ${x}`);
      if (isDiscrete) {
        add('For discrete variables, P(X > x) uses x with lower.tail = FALSE', 'ans <- ' + (dist.type === 'binomial' ? 'pbinom(x_val, size = size, prob = prob, lower.tail = FALSE)' : 'ppois(x_val, lambda = lambda, lower.tail = FALSE)'));
      } else {
        add('Evaluate continuous survival function P(X > x) using lower.tail = FALSE', 'ans <- ' + getContinuousSfCall(dist.type, 'x_val'));
      }
      break;
    }

    case 'prob_interval': {
      const a = query.a ?? 0;
      const b = query.b ?? 0;
      add('Define the lower bound a of the interval', `a_val <- ${a}`);
      add('Define the upper bound b of the interval', `b_val <- ${b}`);
      if (isDiscrete) {
        add('For discrete integer variables, P(a <= X <= b) equals P(X <= b) - P(X <= a - 1)', 'a_minus_1 <- a_val - 1');
        if (dist.type === 'binomial') {
          add('Evaluate discrete interval probability using pbinom', 'ans <- pbinom(b_val, size = size, prob = prob) - pbinom(a_minus_1, size = size, prob = prob)');
        } else {
          add('Evaluate discrete interval probability using ppois', 'ans <- ppois(b_val, lambda = lambda) - ppois(a_minus_1, lambda = lambda)');
        }
      } else {
        add('Evaluate continuous interval probability F(b) - F(a)', `ans <- ${getContinuousCdfCall(dist.type, 'b_val')} - ${getContinuousCdfCall(dist.type, 'a_val')}`);
      }
      break;
    }

    case 'quantile': {
      const p = query.p ?? 0.5;
      add('Define the target cumulative probability p', `p_val <- ${p}`);
      if (dist.type === 'binomial') {
        add('Evaluate the binomial quantile function qbinom', 'ans <- qbinom(p_val, size = size, prob = prob)');
      } else if (dist.type === 'poisson') {
        add('Evaluate the Poisson quantile function qpois', 'ans <- qpois(p_val, lambda = lambda)');
      } else if (dist.type === 'normal') {
        add('Evaluate the normal quantile function qnorm', 'ans <- qnorm(p_val, mean = mu, sd = sigma)');
      } else if (dist.type === 'exponential') {
        add('Evaluate the exponential quantile function qexp', 'ans <- qexp(p_val, rate = rate)');
      } else if (dist.type === 'gamma') {
        add('Evaluate the gamma quantile function qgamma', 'ans <- qgamma(p_val, shape = shape, rate = rate)');
      } else {
        add('Evaluate the Weibull quantile function qweibull', 'ans <- qweibull(p_val, shape = shape, scale = scale)');
      }
      break;
    }

    case 'find_x_for_p': {
      const p = query.p ?? 0.5;
      const dir = query.direction ?? 'less_equal';
      add('Define target probability p for cutoff determination', `p_val <- ${p}`);
      const isUpper = dir === 'greater' || dir === 'greater_equal';
      if (isUpper) {
        add('Calculate upper-tail cutoff using lower.tail = FALSE', 'ans <- ' + getQuantileCall(dist.type, 'p_val', false));
      } else {
        add('Calculate standard lower-tail cutoff value', 'ans <- ' + getQuantileCall(dist.type, 'p_val', true));
      }
      break;
    }

    case 'mean':
      add('Assign target answer to distribution theoretical mean', 'ans <- mean_val');
      break;

    case 'variance':
      add('Assign target answer to distribution theoretical variance', 'ans <- var_val');
      break;

    case 'sd':
      add('Compute target standard deviation as square root of variance', 'ans <- sqrt(var_val)');
      break;

    case 'mgf': {
      const t = query.t ?? 0;
      add('Define evaluation point t for moment generating function', `t_val <- ${t}`);
      switch (dist.type) {
        case 'binomial':
          add('Compute Binomial MGF M(t) = (1 - p + p * exp(t))^n', 'ans <- (1 - prob + prob * exp(t_val))^size');
          break;
        case 'poisson':
          add('Compute Poisson MGF M(t) = exp(lambda * (exp(t) - 1))', 'ans <- exp(lambda * (exp(t_val) - 1))');
          break;
        case 'normal':
          add('Compute Normal MGF M(t) = exp(mu * t + 0.5 * sigma^2 * t^2)', 'ans <- exp(mu * t_val + 0.5 * (sigma^2) * (t_val^2))');
          break;
        case 'exponential':
          add('Compute Exponential MGF M(t) = rate / (rate - t)', 'ans <- rate / (rate - t_val)');
          break;
        case 'gamma':
          add('Compute Gamma MGF M(t) = (1 - t / rate)^(-shape)', 'ans <- (1 - t_val / rate)^(-shape)');
          break;
        case 'weibull':
          add('Compute Weibull MGF (valid for shape = 1): M(t) = (1 - scale * t)^(-1)', 'ans <- (1 - scale * t_val)^(-1)');
          break;
      }
      break;
    }

    case 'conditional_survival': {
      const s = query.s ?? 0;
      const t = query.t ?? 0;
      add('Define elapsed conditioning threshold s', `s_val <- ${s}`);
      add('Define additional survival time t', `t_val <- ${t}`);
      if (dist.type === 'exponential') {
        add('Due to memoryless property, P(X > s + t | X > s) = P(X > t)', 'ans <- pexp(t_val, rate = rate, lower.tail = FALSE)');
      } else {
        add('Evaluate conditional survival P(X > s + t | X > s) = S(s + t) / S(s)', `ans <- (${getContinuousSfCall(dist.type, 's_val + t_val')}) / (${getContinuousSfCall(dist.type, 's_val')})`);
      }
      break;
    }
  }

  // ==========================================
  // Section 3: Output Printing
  // ==========================================
  add('Display calculated theoretical mean to console', 'cat(sprintf("Mean: %.4f\\n", round(mean_val, 4)))');
  add('Display calculated theoretical variance to console', 'cat(sprintf("Variance: %.4f\\n", round(var_val, 4)))');
  add('Display problem answer rounded to 6 decimal places with cat', 'cat(sprintf("Result: %.6f\\n", round(ans, 6)))');
  add('Display exact machine-readable answer for verification', 'cat(sprintf("ANSWER: %.10f\\n", ans))');

  // ==========================================
  // Section 4: Visual Plotting
  // ==========================================
  if (isDiscrete) {
    if (dist.type === 'binomial') {
      add('Define discrete sequence of possible outcomes 0 through n', 'x_vals <- 0:size');
      add('Calculate probability mass function dbinom across all possible outcomes', 'probs <- dbinom(x_vals, size = size, prob = prob)');
    } else {
      add('Define discrete upper plotting limit based on Poisson rate', 'max_k <- max(15, ceiling(lambda + 4 * sqrt(max(lambda, 1))))');
      add('Define discrete sequence of possible outcomes 0 through max_k', 'x_vals <- 0:max_k');
      add('Calculate probability mass function dpois across all outcomes', 'probs <- dpois(x_vals, lambda = lambda)');
    }

    const colorCondition = getDiscreteColorCondition(query);
    add('Assign bar colors highlighting the queried event region', `bar_cols <- ifelse(${colorCondition}, "skyblue", "lightgray")`);
    add('Render base-R barplot displaying probability distribution and queried region', `barplot(probs, names.arg = x_vals, col = bar_cols, main = "${getPlotTitle(dist, query)}", xlab = "Number of Successes / Events (x)", ylab = "Probability P(X = x)")`);
    add('Add legend identifying the highlighted probability region', 'legend("topright", legend = c("Region of interest", "Other outcomes"), fill = c("skyblue", "lightgray"), bty = "n")');
  } else {
    // Continuous plotting
    add('Calculate lower plotting boundary (at least 4 standard deviations below mean or 0)', getPlotMinExpr(dist));
    add('Calculate upper plotting boundary (at least 4 standard deviations above mean or 99.9th percentile)', getPlotMaxExpr(dist));
    add('Draw probability density function curve with base-R curve()', `curve(${getDensityExpr(dist)}, from = x_min, to = x_max, n = 500, col = "blue", lwd = 2, main = "${getPlotTitle(dist, query)}", xlab = "x", ylab = "Density f(x)")`);

    const shadeRange = getContinuousShadeRange(dist, query);
    add('Generate evaluation sequence of x coordinates for shaded polygon region', `x_shade <- seq(${shadeRange.minExpr}, ${shadeRange.maxExpr}, length.out = 200)`);
    add('Compute corresponding probability density y coordinates for shaded polygon', `y_shade <- ${getDensityExprWithVar(dist, 'x_shade')}`);
    add('Draw shaded polygon representing the queried probability area under curve', `polygon(c(${shadeRange.minExpr}, x_shade, ${shadeRange.maxExpr}), c(0, y_shade, 0), col = rgb(0.2, 0.4, 0.8, 0.4), border = NA)`);
    add('Add vertical dashed reference line for distribution mean', 'abline(v = mean_val, col = "darkred", lty = 2, lwd = 1.5)');
    add('Add comprehensive legend with curve, shaded area, and mean line', 'legend("topright", legend = c("Density curve", "Query region", "Mean"), col = c("blue", rgb(0.2, 0.4, 0.8, 0.4), "darkred"), lty = c(1, NA, 2), pch = c(NA, 15, NA), lwd = c(2, NA, 1.5), bty = "n")');
  }

  return lines.join('\n');
}

function getContinuousCdfCall(distType: string, qVar: string): string {
  switch (distType) {
    case 'normal':
      return `pnorm(${qVar}, mean = mu, sd = sigma)`;
    case 'exponential':
      return `pexp(${qVar}, rate = rate)`;
    case 'gamma':
      return `pgamma(${qVar}, shape = shape, rate = rate)`;
    case 'weibull':
      return `pweibull(${qVar}, shape = shape, scale = scale)`;
    default:
      return '';
  }
}

function getContinuousSfCall(distType: string, qVar: string): string {
  switch (distType) {
    case 'normal':
      return `pnorm(${qVar}, mean = mu, sd = sigma, lower.tail = FALSE)`;
    case 'exponential':
      return `pexp(${qVar}, rate = rate, lower.tail = FALSE)`;
    case 'gamma':
      return `pgamma(${qVar}, shape = shape, rate = rate, lower.tail = FALSE)`;
    case 'weibull':
      return `pweibull(${qVar}, shape = shape, scale = scale, lower.tail = FALSE)`;
    default:
      return '';
  }
}

function getQuantileCall(distType: string, pVar: string, lowerTail: boolean): string {
  const tailArg = lowerTail ? '' : ', lower.tail = FALSE';
  switch (distType) {
    case 'normal':
      return `qnorm(${pVar}, mean = mu, sd = sigma${tailArg})`;
    case 'exponential':
      return `qexp(${pVar}, rate = rate${tailArg})`;
    case 'gamma':
      return `qgamma(${pVar}, shape = shape, rate = rate${tailArg})`;
    case 'weibull':
      return `qweibull(${pVar}, shape = shape, scale = scale${tailArg})`;
    case 'binomial':
      return `qbinom(${pVar}, size = size, prob = prob${tailArg})`;
    case 'poisson':
      return `qpois(${pVar}, lambda = lambda${tailArg})`;
    default:
      return '';
  }
}

function getDensityExpr(dist: DistributionParams): string {
  switch (dist.type) {
    case 'normal':
      return 'dnorm(x, mean = mu, sd = sigma)';
    case 'exponential':
      return 'dexp(x, rate = rate)';
    case 'gamma':
      return 'dgamma(x, shape = shape, rate = rate)';
    case 'weibull':
      return 'dweibull(x, shape = shape, scale = scale)';
    default:
      return '';
  }
}

function getDensityExprWithVar(dist: DistributionParams, varName: string): string {
  switch (dist.type) {
    case 'normal':
      return `dnorm(${varName}, mean = mu, sd = sigma)`;
    case 'exponential':
      return `dexp(${varName}, rate = rate)`;
    case 'gamma':
      return `dgamma(${varName}, shape = shape, rate = rate)`;
    case 'weibull':
      return `dweibull(${varName}, shape = shape, scale = scale)`;
    default:
      return '';
  }
}

function getPlotMinExpr(dist: DistributionParams): string {
  switch (dist.type) {
    case 'normal':
      return 'x_min <- mu - 4 * sigma';
    case 'exponential':
    case 'gamma':
    case 'weibull':
      return 'x_min <- 0';
    default:
      return 'x_min <- 0';
  }
}

function getPlotMaxExpr(dist: DistributionParams): string {
  switch (dist.type) {
    case 'normal':
      return 'x_max <- mu + 4 * sigma';
    case 'exponential':
      return 'x_max <- qexp(0.999, rate = rate)';
    case 'gamma':
      return 'x_max <- qgamma(0.999, shape = shape, rate = rate)';
    case 'weibull':
      return 'x_max <- qweibull(0.999, shape = shape, scale = scale)';
    default:
      return 'x_max <- 10';
  }
}

function getDiscreteColorCondition(query: SolverQuery): string {
  switch (query.type) {
    case 'prob_equal':
      return `x_vals == ${query.x ?? 0}`;
    case 'prob_less_equal':
      return `x_vals <= ${query.x ?? 0}`;
    case 'prob_less':
      return `x_vals < ${query.x ?? 0}`;
    case 'prob_greater_equal':
      return `x_vals >= ${query.x ?? 0}`;
    case 'prob_greater':
      return `x_vals > ${query.x ?? 0}`;
    case 'prob_interval':
      return `x_vals >= ${query.a ?? 0} & x_vals <= ${query.b ?? 0}`;
    case 'quantile':
    case 'find_x_for_p':
      return 'x_vals <= ans';
    default:
      return 'x_vals == round(mean_val)';
  }
}

function getContinuousShadeRange(
  _dist: DistributionParams,
  query: SolverQuery
): { minExpr: string; maxExpr: string } {
  switch (query.type) {
    case 'prob_equal': {
      const x = query.x ?? 0;
      return { minExpr: `max(x_min, ${x} - 0.01 * (x_max - x_min))`, maxExpr: `min(x_max, ${x} + 0.01 * (x_max - x_min))` };
    }
    case 'prob_less_equal':
    case 'prob_less': {
      const x = query.x ?? 0;
      return { minExpr: 'x_min', maxExpr: `min(x_max, ${x})` };
    }
    case 'prob_greater_equal':
    case 'prob_greater': {
      const x = query.x ?? 0;
      return { minExpr: `max(x_min, ${x})`, maxExpr: 'x_max' };
    }
    case 'prob_interval': {
      const a = query.a ?? 0;
      const b = query.b ?? 0;
      return { minExpr: `max(x_min, ${a})`, maxExpr: `min(x_max, ${b})` };
    }
    case 'quantile':
      return { minExpr: 'x_min', maxExpr: 'min(x_max, ans)' };
    case 'find_x_for_p': {
      const dir = query.direction ?? 'less_equal';
      if (dir === 'greater' || dir === 'greater_equal') {
        return { minExpr: 'max(x_min, ans)', maxExpr: 'x_max' };
      }
      return { minExpr: 'x_min', maxExpr: 'min(x_max, ans)' };
    }
    case 'conditional_survival': {
      const s = query.s ?? 0;
      const t = query.t ?? 0;
      return { minExpr: `max(x_min, ${s + t})`, maxExpr: 'x_max' };
    }
    default:
      return { minExpr: 'x_min', maxExpr: 'mean_val' };
  }
}

function getPlotTitle(dist: DistributionParams, query: SolverQuery): string {
  const distName = dist.type.charAt(0).toUpperCase() + dist.type.slice(1);
  return `${distName} Distribution - ${query.type.replace(/_/g, ' ')}`;
}
