export interface GoldenCase {
  distribution: string;
  func: string;
  rCode: string;
  expected: number;
  tolerance: number;
}

export const GOLDEN_CASES: GoldenCase[] = [
  // Binomial(size = 10, prob = 0.3)
  {
    distribution: 'binomial',
    func: 'dbinom',
    rCode: 'dbinom(3, size = 10, prob = 0.3)',
    expected: 0.266827932,
    tolerance: 1e-6,
  },
  {
    distribution: 'binomial',
    func: 'pbinom',
    rCode: 'pbinom(4, size = 10, prob = 0.3)',
    expected: 0.849731667,
    tolerance: 1e-6,
  },
  {
    distribution: 'binomial',
    func: 'qbinom',
    rCode: 'qbinom(0.85, size = 10, prob = 0.3)',
    expected: 5,
    tolerance: 1e-6,
  },

  // Poisson(lambda = 3)
  {
    distribution: 'poisson',
    func: 'dpois',
    rCode: 'dpois(2, lambda = 3)',
    expected: 0.224041807655,
    tolerance: 1e-6,
  },
  {
    distribution: 'poisson',
    func: 'ppois',
    rCode: 'ppois(4, lambda = 3)',
    expected: 0.815263244524,
    tolerance: 1e-6,
  },
  {
    distribution: 'poisson',
    func: 'qpois',
    rCode: 'qpois(0.815263, lambda = 3)',
    expected: 4,
    tolerance: 1e-6,
  },

  // Normal(mean = 10, sd = 2)
  {
    distribution: 'normal',
    func: 'dnorm',
    rCode: 'dnorm(12, mean = 10, sd = 2)',
    expected: 0.12098536226,
    tolerance: 1e-6,
  },
  {
    distribution: 'normal',
    func: 'pnorm',
    rCode: 'pnorm(12, mean = 10, sd = 2)',
    expected: 0.841344746069,
    tolerance: 1e-5,
  },
  {
    distribution: 'normal',
    func: 'qnorm',
    rCode: 'qnorm(0.975, mean = 10, sd = 2)',
    expected: 13.919927969,
    tolerance: 1e-4,
  },

  // Exponential(rate = 0.5)
  {
    distribution: 'exponential',
    func: 'dexp',
    rCode: 'dexp(2, rate = 0.5)',
    expected: 0.183939720586,
    tolerance: 1e-6,
  },
  {
    distribution: 'exponential',
    func: 'pexp',
    rCode: 'pexp(2, rate = 0.5)',
    expected: 0.632120558829,
    tolerance: 1e-6,
  },
  {
    distribution: 'exponential',
    func: 'qexp',
    rCode: 'qexp(0.63212056, rate = 0.5)',
    expected: 2.0,
    tolerance: 1e-4,
  },

  // Gamma(shape = 3, rate = 2)
  {
    distribution: 'gamma',
    func: 'dgamma',
    rCode: 'dgamma(2, shape = 3, rate = 2)',
    expected: 0.29305022,
    tolerance: 1e-5,
  },
  {
    distribution: 'gamma',
    func: 'pgamma',
    rCode: 'pgamma(2, shape = 3, rate = 2)',
    expected: 0.76189669,
    tolerance: 1e-5,
  },
  {
    distribution: 'gamma',
    func: 'qgamma',
    rCode: 'qgamma(0.76189669, shape = 3, rate = 2)',
    expected: 2.0,
    tolerance: 1e-3,
  },

  // Weibull(shape = 2, scale = 3)
  {
    distribution: 'weibull',
    func: 'dweibull',
    rCode: 'dweibull(1.5, shape = 2, scale = 3)',
    expected: 0.259600261024,
    tolerance: 1e-6,
  },
  {
    distribution: 'weibull',
    func: 'pweibull',
    rCode: 'pweibull(1.5, shape = 2, scale = 3)',
    expected: 0.2211992,
    tolerance: 1e-5,
  },
  {
    distribution: 'weibull',
    func: 'qweibull',
    rCode: 'qweibull(0.2211992, shape = 2, scale = 3)',
    expected: 1.5,
    tolerance: 1e-4,
  },
];
