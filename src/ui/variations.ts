import type { DistributionParams, DistributionType } from '../engine/types';
import { evaluateSolverQuery } from '../solver/evaluator';
import type { SolvedProblem, SolverQuery } from '../solver/types';

export interface PracticeProblem {
  id: string;
  distType: DistributionType;
  title: string;
  problemText: string;
  distribution: DistributionParams;
  query: SolverQuery;
  solved: SolvedProblem;
}

export function generatePracticeVariations(distType: DistributionType): PracticeProblem[] {
  const problems: PracticeProblem[] = [];

  for (let i = 1; i <= 5; i++) {
    const item = createRandomizedProblem(distType, i);
    const solved = evaluateSolverQuery(
      item.distribution,
      item.query,
      ['Practice variation randomized problem generation.'],
      'Layer A (Rule-Based)'
    );
    problems.push({
      ...item,
      solved,
    });
  }

  return problems;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number, decimals = 1): number {
  const val = Math.random() * (max - min) + min;
  return parseFloat(val.toFixed(decimals));
}

function createRandomizedProblem(
  distType: DistributionType,
  index: number
): {
  id: string;
  distType: DistributionType;
  title: string;
  problemText: string;
  distribution: DistributionParams;
  query: SolverQuery;
} {
  const id = `var_${distType}_${Date.now()}_${index}`;

  switch (distType) {
    case 'normal': {
      const mu = randInt(60, 180);
      const sigma = randInt(4, 15);
      if (index === 1) {
        const x = mu + randInt(1, 2) * sigma;
        return {
          id,
          distType,
          title: 'Normal Upper Tail Exceedance',
          problemText: `A manufacturing process produces items with a characteristic normally distributed with mean ${mu} and standard deviation ${sigma}. What is the probability that a randomly tested item exceeds ${x}?`,
          distribution: { type: 'normal', params: { mean: mu, sd: sigma } },
          query: { type: 'prob_greater', x },
        };
      } else if (index === 2) {
        const a = mu - randInt(1, 2) * sigma;
        const b = mu + randInt(1, 2) * sigma;
        return {
          id,
          distType,
          title: 'Normal Tolerance Interval',
          problemText: `Measurements follow a normal distribution with mean ${mu} and standard deviation ${sigma}. What proportion of measurements fall within the tolerance interval between ${a} and ${b}?`,
          distribution: { type: 'normal', params: { mean: mu, sd: sigma } },
          query: { type: 'prob_interval', a, b },
        };
      } else if (index === 3) {
        const x = mu - randInt(1, 2) * sigma;
        return {
          id,
          distType,
          title: 'Normal Cumulative Lower Bound',
          problemText: `Scores on a standardized certification exam follow a normal distribution with mean ${mu} and standard deviation ${sigma}. What is the probability of scoring at most ${x}?`,
          distribution: { type: 'normal', params: { mean: mu, sd: sigma } },
          query: { type: 'prob_less_equal', x },
        };
      } else if (index === 4) {
        const p = [0.9, 0.95, 0.99][randInt(0, 2)];
        return {
          id,
          distType,
          title: 'Normal Percentile Cutoff',
          problemText: `Lifespan of a component follows a normal distribution with mean ${mu} hours and standard deviation ${sigma} hours. Find the cutoff value corresponding to the top ${(
            (1 - p) *
            100
          ).toFixed(0)}% longest lasting components.`,
          distribution: { type: 'normal', params: { mean: mu, sd: sigma } },
          query: { type: 'find_x_for_p', p, direction: 'greater' },
        };
      } else {
        const k = randInt(5, 12);
        return {
          id,
          distType,
          title: 'Normal Mean Deviation',
          problemText: `A physical dimension follows a normal distribution with mean ${mu} and standard deviation ${sigma}. Find the probability that a dimension is within ${k} units of the mean.`,
          distribution: { type: 'normal', params: { mean: mu, sd: sigma } },
          query: { type: 'prob_interval', a: mu - k, b: mu + k },
        };
      }
    }

    case 'binomial': {
      const n = randInt(10, 25);
      const p = [0.1, 0.2, 0.25, 0.3, 0.4, 0.5][randInt(0, 5)];
      if (index === 1) {
        const x = Math.max(1, Math.floor(n * p));
        return {
          id,
          distType,
          title: 'Binomial Exact Success Count',
          problemText: `An experiment consists of ${n} independent trials, each with success probability ${p}. What is the probability of obtaining exactly ${x} successes?`,
          distribution: { type: 'binomial', params: { size: n, prob: p } },
          query: { type: 'prob_equal', x },
        };
      } else if (index === 2) {
        const x = Math.max(2, Math.floor(n * p) + 1);
        return {
          id,
          distType,
          title: 'Binomial "At Least" Threshold',
          problemText: `A technician inspects ${n} items where each item has a ${(p * 100).toFixed(
            0
          )}% chance of defect. What is the probability of encountering at least ${x} defective items?`,
          distribution: { type: 'binomial', params: { size: n, prob: p } },
          query: { type: 'prob_greater_equal', x },
        };
      } else if (index === 3) {
        const x = Math.max(1, Math.floor(n * p));
        return {
          id,
          distType,
          title: 'Binomial "At Most" Cumulative',
          problemText: `In a clinical trial with ${n} participants, the response rate is ${p}. What is the probability that at most ${x} participants respond favorably?`,
          distribution: { type: 'binomial', params: { size: n, prob: p } },
          query: { type: 'prob_less_equal', x },
        };
      } else if (index === 4) {
        const a = Math.max(1, Math.floor(n * p) - 2);
        const b = Math.min(n, Math.floor(n * p) + 2);
        return {
          id,
          distType,
          title: 'Binomial Interval Successes',
          problemText: `A quality test runs ${n} automated cycles with failure probability ${p}. What is the probability that the number of failures is between ${a} and ${b}?`,
          distribution: { type: 'binomial', params: { size: n, prob: p } },
          query: { type: 'prob_interval', a, b },
        };
      } else {
        return {
          id,
          distType,
          title: 'Binomial Expected Value',
          problemText: `A telemarketer dials ${n} leads where each lead has a ${(p * 100).toFixed(
            0
          )}% conversion rate. What is the expected number of converted leads?`,
          distribution: { type: 'binomial', params: { size: n, prob: p } },
          query: { type: 'mean' },
        };
      }
    }

    case 'poisson': {
      const lambda = randInt(3, 12);
      if (index === 1) {
        const x = lambda;
        return {
          id,
          distType,
          title: 'Poisson Exact Arrivals',
          problemText: `Customer support tickets arrive according to a Poisson process at an average rate of ${lambda} tickets per hour. What is the probability of receiving exactly ${x} tickets in an hour?`,
          distribution: { type: 'poisson', params: { lambda } },
          query: { type: 'prob_equal', x },
        };
      } else if (index === 2) {
        const x = lambda + 2;
        return {
          id,
          distType,
          title: 'Poisson At Least Exceedance',
          problemText: `Packets arrive at a server following a Poisson distribution with mean rate ${lambda} packets per second. Find the probability of receiving at least ${x} packets.`,
          distribution: { type: 'poisson', params: { lambda } },
          query: { type: 'prob_greater_equal', x },
        };
      } else if (index === 3) {
        const x = Math.max(1, lambda - 2);
        return {
          id,
          distType,
          title: 'Poisson At Most Threshold',
          problemText: `Flaws occur in optical fiber cables at an average of ${lambda} flaws per kilometer. What is the probability of finding at most ${x} flaws in a one-kilometer segment?`,
          distribution: { type: 'poisson', params: { lambda } },
          query: { type: 'prob_less_equal', x },
        };
      } else if (index === 4) {
        return {
          id,
          distType,
          title: 'Poisson Zero Occurrence (Empty State)',
          problemText: `Micro-earthquakes in a geologically stable area follow a Poisson model with lambda = ${lambda} per decade. What is the probability of zero earthquakes in a decade?`,
          distribution: { type: 'poisson', params: { lambda } },
          query: { type: 'prob_equal', x: 0 },
        };
      } else {
        return {
          id,
          distType,
          title: 'Poisson Variance & Dispersion',
          problemText: `A Poisson process has an average event arrival rate of ${lambda} events per day. What is the variance of the daily event count?`,
          distribution: { type: 'poisson', params: { lambda } },
          query: { type: 'variance' },
        };
      }
    }

    case 'exponential': {
      const rate = [0.05, 0.1, 0.2, 0.5, 1, 2][randInt(0, 5)];
      if (index === 1) {
        const x = parseFloat((1 / rate).toFixed(2));
        return {
          id,
          distType,
          title: 'Exponential Cumulative Time',
          problemText: `The waiting time for service at a bank follows an exponential distribution with rate ${rate} customers per minute. What is the probability of waiting at most ${x} minutes?`,
          distribution: { type: 'exponential', params: { rate } },
          query: { type: 'prob_less_equal', x },
        };
      } else if (index === 2) {
        const x = parseFloat((1.5 / rate).toFixed(2));
        return {
          id,
          distType,
          title: 'Exponential Survival Function',
          problemText: `The lifespan of an electronic sensor is exponentially distributed with parameter lambda = ${rate} per year. What is the probability that the sensor lasts longer than ${x} years?`,
          distribution: { type: 'exponential', params: { rate } },
          query: { type: 'prob_greater', x },
        };
      } else if (index === 3) {
        const s = parseFloat((1 / rate).toFixed(2));
        const t = parseFloat((0.8 / rate).toFixed(2));
        return {
          id,
          distType,
          title: 'Exponential Memoryless Survival',
          problemText: `A machine component has an exponential lifetime with failure rate ${rate} per month. Given that it has operated without failure for ${s} months, what is the probability it survives an additional ${t} months?`,
          distribution: { type: 'exponential', params: { rate } },
          query: { type: 'conditional_survival', s, t },
        };
      } else if (index === 4) {
        return {
          id,
          distType,
          title: 'Exponential Median Lifetime',
          problemText: `Operating time between software errors is exponentially distributed with rate ${rate} per day. What is the median time between errors?`,
          distribution: { type: 'exponential', params: { rate } },
          query: { type: 'quantile', p: 0.5 },
        };
      } else {
        const a = parseFloat((0.5 / rate).toFixed(2));
        const b = parseFloat((2.0 / rate).toFixed(2));
        return {
          id,
          distType,
          title: 'Exponential Interval Probability',
          problemText: `Time until a light bulb burns out has an exponential distribution with rate ${rate} per 1000 hours. Find the probability of lasting between ${a} and ${b} thousand hours.`,
          distribution: { type: 'exponential', params: { rate } },
          query: { type: 'prob_interval', a, b },
        };
      }
    }

    case 'gamma': {
      const shape = randInt(2, 5);
      const rate = [0.5, 1, 1.5, 2][randInt(0, 3)];
      const mean = shape / rate;
      if (index === 1) {
        const x = parseFloat((mean + 1).toFixed(1));
        return {
          id,
          distType,
          title: 'Gamma Cumulative Process Time',
          problemText: `A complex transaction consists of ${shape} independent sequential stages, each exponentially distributed with rate ${rate}. What is the probability that the total transaction time is at most ${x} seconds?`,
          distribution: { type: 'gamma', params: { shape, rate } },
          query: { type: 'prob_less_equal', x },
        };
      } else if (index === 2) {
        const x = parseFloat((mean - 0.5).toFixed(1));
        return {
          id,
          distType,
          title: 'Gamma Lower Bound Exceedance',
          problemText: `Rainfall accumulation in a valley follows a Gamma distribution with shape parameter ${shape} and rate ${rate}. What is the probability that rainfall exceeds ${x} cm?`,
          distribution: { type: 'gamma', params: { shape, rate } },
          query: { type: 'prob_greater', x },
        };
      } else if (index === 3) {
        const a = parseFloat((mean * 0.7).toFixed(1));
        const b = parseFloat((mean * 1.4).toFixed(1));
        return {
          id,
          distType,
          title: 'Gamma Time Interval',
          problemText: `Server batch execution duration follows a Gamma distribution with shape ${shape} and rate ${rate}. Find the probability that execution finishes between ${a} and ${b} minutes.`,
          distribution: { type: 'gamma', params: { shape, rate } },
          query: { type: 'prob_interval', a, b },
        };
      } else if (index === 4) {
        return {
          id,
          distType,
          title: 'Gamma Expected Value',
          problemText: `Wear depth of an alloy bearing is modeled by a Gamma distribution with shape ${shape} and rate ${rate}. What is the expected wear depth?`,
          distribution: { type: 'gamma', params: { shape, rate } },
          query: { type: 'mean' },
        };
      } else {
        return {
          id,
          distType,
          title: 'Gamma 95th Percentile',
          problemText: `Queue completion latency follows a Gamma distribution with shape ${shape} and rate ${rate}. Determine the 95th percentile latency cutoff.`,
          distribution: { type: 'gamma', params: { shape, rate } },
          query: { type: 'quantile', p: 0.95 },
        };
      }
    }

    case 'weibull': {
      const shape = randFloat(1.5, 3.5, 1);
      const scale = randInt(50, 200);
      if (index === 1) {
        const x = randInt(Math.floor(scale * 0.4), Math.floor(scale * 0.8));
        return {
          id,
          distType,
          title: 'Weibull Failure Time',
          problemText: `The fatigue life of a mechanical spring follows a Weibull distribution with shape parameter k = ${shape} and scale lambda = ${scale} cycles. What is the probability the spring fails within ${x} cycles?`,
          distribution: { type: 'weibull', params: { shape, scale } },
          query: { type: 'prob_less_equal', x },
        };
      } else if (index === 2) {
        const x = randInt(scale, Math.floor(scale * 1.3));
        return {
          id,
          distType,
          title: 'Weibull Reliability Survival',
          problemText: `A composite rotor blade has life distributed as Weibull with shape ${shape} and scale ${scale} hours. What is the reliability probability that the blade survives beyond ${x} hours?`,
          distribution: { type: 'weibull', params: { shape, scale } },
          query: { type: 'prob_greater', x },
        };
      } else if (index === 3) {
        const a = randInt(Math.floor(scale * 0.5), Math.floor(scale * 0.8));
        const b = randInt(Math.floor(scale * 1.1), Math.floor(scale * 1.4));
        return {
          id,
          distType,
          title: 'Weibull Operating Interval',
          problemText: `Bearing wearout follows a Weibull distribution with shape ${shape} and scale ${scale} days. What is the probability that wearout occurs between ${a} and ${b} days?`,
          distribution: { type: 'weibull', params: { shape, scale } },
          query: { type: 'prob_interval', a, b },
        };
      } else if (index === 4) {
        return {
          id,
          distType,
          title: 'Weibull Top 10% Cutoff',
          problemText: `Cutting tool operating lifetime follows a Weibull distribution with shape ${shape} and scale ${scale} hours. Find the cutoff lifetime for the top 10% longest lasting tools.`,
          distribution: { type: 'weibull', params: { shape, scale } },
          query: { type: 'find_x_for_p', p: 0.1, direction: 'greater' },
        };
      } else {
        return {
          id,
          distType,
          title: 'Weibull Median Lifespan',
          problemText: `Fiber optic cable lifetime follows a Weibull distribution with shape ${shape} and scale ${scale} years. Find the median lifetime of the cable.`,
          distribution: { type: 'weibull', params: { shape, scale } },
          query: { type: 'quantile', p: 0.5 },
        };
      }
    }
  }
}
