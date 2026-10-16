import { describe, expect, it } from 'vitest';
import { parseWordProblemLayerA } from '../src/solver/layer_a';
import type { SolvedProblem } from '../src/solver/types';

function solveProblem(text: string): SolvedProblem {
  const res = parseWordProblemLayerA(text);
  if (!res.success) {
    if ('needsClarification' in res && res.needsClarification) {
      throw new Error(`Clarification needed: ${res.clarifyingQuestion}`);
    }
    throw new Error('error' in res ? res.error : 'Failed to solve');
  }
  return res;
}

describe('Worded Problem Solver - 60+ Realistic Problems', () => {
  // ==========================================
  // 1. NORMAL DISTRIBUTION (10 PROBLEMS)
  // ==========================================
  describe('Normal Distribution Worded Problems', () => {
    it('1. IQ scores cumulative P(X <= 115)', () => {
      const p = solveProblem(
        'IQ scores are normally distributed with a mean of 100 and a standard deviation of 15. What is the probability that a randomly chosen person has an IQ of at most 115?'
      );
      expect(p.distribution.type).toBe('normal');
      expect(p.resultValue).toBeCloseTo(0.841345, 5);
      expect(p.rCode).toContain('pnorm(115, mean = 100, sd = 15)');
      expect(p.steps.length).toBeGreaterThanOrEqual(3);
    });

    it('2. Heights with variance conversion P(X > 191)', () => {
      const p = solveProblem(
        'The height of adult males follows a normal distribution with mean 175 cm and variance 64. What is the probability of selecting a male taller than 191 cm?'
      );
      expect(p.distribution.type).toBe('normal');
      if (p.distribution.type === 'normal') {
        expect(p.distribution.params.sd).toBe(8);
      }
      expect(p.resultValue).toBeCloseTo(0.02275, 5);
      expect(p.rCode).toContain('pnorm(191, mean = 175, sd = 8, lower.tail = FALSE)');
    });

    it('3. Bolt diameters interval P(9.6 <= X <= 10.4)', () => {
      const p = solveProblem(
        'A manufacturing process produces bolts with diameter normally distributed with mean 10 mm and standard deviation 0.2 mm. What proportion of bolts are between 9.6 and 10.4 mm?'
      );
      expect(p.resultValue).toBeCloseTo(0.9545, 4);
    });

    it('4. Exam scores within 15 points of mean', () => {
      const p = solveProblem(
        'Exam test scores follow a normal distribution with mean 70 and standard deviation 10. What is the probability that a student scores within 15 of the mean?'
      );
      expect(p.resultValue).toBeCloseTo(0.866386, 5);
    });

    it('5. Battery lifetime cutoff for top 5%', () => {
      const p = solveProblem(
        'Battery lifespan is normally distributed with mean 1200 hours and standard deviation 100 hours. Find the cutoff for top 5% longest lasting batteries.'
      );
      expect(p.resultValue).toBeCloseTo(1364.485, 2);
    });

    it('6. Coffee dispenser 90th percentile', () => {
      const p = solveProblem(
        'A coffee dispenser dispenses coffee with mean 200 ml and standard deviation 12 ml. What is the 90th percentile of dispensed coffee volume?'
      );
      expect(p.resultValue).toBeCloseTo(215.3786, 2);
    });

    it('7. Expected value calculation', () => {
      const p = solveProblem(
        'For a normal distribution with mean 50 and standard deviation 5, what is the expected value?'
      );
      expect(p.resultValue).toBe(50);
    });

    it('8. Standard normal strict inequality P(X < -1.96)', () => {
      const p = solveProblem(
        'A standard normal distribution has mean 0 and standard deviation 1. What is the probability of a value strictly less than -1.96?'
      );
      expect(p.resultValue).toBeCloseTo(0.024998, 5);
    });

    it('9. Standard deviation from variance', () => {
      const p = solveProblem(
        'Consider a normal distribution with mean 25 and variance 16. What is the standard deviation?'
      );
      expect(p.resultValue).toBe(4);
    });

    it('10. MGF at t = 0.5', () => {
      const p = solveProblem(
        'A variable follows a normal distribution with mean 2 and standard deviation 1. Find the moment generating function at t = 0.5.'
      );
      expect(p.resultValue).toBeCloseTo(3.080217, 5);
    });
  });

  // ==========================================
  // 2. BINOMIAL DISTRIBUTION (10 PROBLEMS)
  // ==========================================
  describe('Binomial Distribution Worded Problems', () => {
    it('11. Multiple choice exam P(X = 5)', () => {
      const p = solveProblem(
        'A student takes a multiple choice exam with 20 trials and probability of success 0.25 on each trial. What is the probability of getting exactly 5 correct answers?'
      );
      expect(p.distribution.type).toBe('binomial');
      expect(p.resultValue).toBeCloseTo(0.202331, 5);
    });

    it('12. Quality inspection P(X <= 2)', () => {
      const p = solveProblem(
        'A quality inspector examines 50 items where each has a 2% chance of being defective. What is the probability of finding at most 2 defective items?'
      );
      expect(p.resultValue).toBeCloseTo(0.921575, 5);
    });

    it('13. Basketball free throws "at least" P(X >= 12)', () => {
      const p = solveProblem(
        'A basketball player takes 15 free throws with a 80% success rate. What is the probability of making at least 12 free throws?'
      );
      // Discrete: P(X >= 12) = 1 - P(X <= 11)
      expect(p.resultValue).toBeCloseTo(0.648162, 5);
      expect(p.rCode).toContain('pbinom(11, size = 15, prob = 0.8, lower.tail = FALSE)');
    });

    it('14. Clinical trial "more than" P(X > 22)', () => {
      const p = solveProblem(
        'In a clinical trial with 30 trials and probability of success 0.7, what is the probability that more than 22 patients recover?'
      );
      // Discrete: P(X > 22) = 1 - P(X <= 22)
      expect(p.resultValue).toBeCloseTo(0.281377, 5);
      expect(p.rCode).toContain('pbinom(22, size = 30, prob = 0.7, lower.tail = FALSE)');
    });

    it('15. Fair coin flips "fewer than" P(X < 4)', () => {
      const p = solveProblem(
        'A fair coin is tossed 10 times in 10 trials. What is the probability of getting fewer than 4 heads?'
      );
      // Discrete: P(X < 4) = P(X <= 3)
      expect(p.resultValue).toBeCloseTo(0.171875, 5);
      expect(p.rCode).toContain('pbinom(3, size = 10, prob = 0.5)');
    });

    it('16. Digital transmission interval P(1 <= X <= 3)', () => {
      const p = solveProblem(
        'A digital transmitter sends 8 bits with probability of success 0.1. What is the probability that the number of successes is between 1 and 3?'
      );
      // Discrete: P(X <= 3) - P(X <= 0)
      expect(p.resultValue).toBeCloseTo(0.564508, 5);
    });

    it('17. Sales calls expected value (mean)', () => {
      const p = solveProblem(
        'A call center makes 100 trials with a 0.05 probability of success. What is the expected value of closed deals?'
      );
      expect(p.resultValue).toBe(5);
    });

    it('18. Lottery tickets variance', () => {
      const p = solveProblem(
        'A lottery ticket has a 0.1 probability of success. If someone participates in 40 trials, what is the variance of winning tickets?'
      );
      expect(p.resultValue).toBeCloseTo(3.6, 5);
    });

    it('19. Binomial median', () => {
      const p = solveProblem(
        'Consider a binomial distribution with size 12 and prob 0.4. What is the median number of successes?'
      );
      expect(p.resultValue).toBe(5);
    });

    it('20. Binomial MGF at t = 0.2', () => {
      const p = solveProblem(
        'For a binomial distribution with size 10 and prob 0.3, find the moment generating function at t = 0.2.'
      );
      expect(p.resultValue).toBeCloseTo(1.902331, 5);
    });
  });

  // ==========================================
  // 3. POISSON DISTRIBUTION (10 PROBLEMS)
  // ==========================================
  describe('Poisson Distribution Worded Problems', () => {
    it('21. Call center exact arrivals P(X = 4)', () => {
      const p = solveProblem(
        'Calls arrive at a call center according to a Poisson process at an average rate of 4 calls per minute. What is the probability of receiving exactly 4 calls?'
      );
      expect(p.distribution.type).toBe('poisson');
      expect(p.resultValue).toBeCloseTo(0.195367, 5);
    });

    it('22. Server requests at most P(X <= 3)', () => {
      const p = solveProblem(
        'A server receives an average of 5 requests per second following a Poisson distribution. What is the probability of receiving at most 3 requests?'
      );
      expect(p.resultValue).toBeCloseTo(0.265026, 5);
    });

    it('23. Emergency room arrivals at least P(X >= 8)', () => {
      const p = solveProblem(
        'A hospital emergency room experiences an average of 6 arrivals per hour. What is the probability of at least 8 arrivals?'
      );
      // Discrete: P(X >= 8) = 1 - P(X <= 7)
      expect(p.resultValue).toBeCloseTo(0.25602, 5);
      expect(p.rCode).toContain('ppois(7, lambda = 6, lower.tail = FALSE)');
    });

    it('24. Bakery sales more than P(X > 12)', () => {
      const p = solveProblem(
        'A bakery sells an average of 10 specialty cakes per day following a Poisson process. What is the probability that more than 12 cakes are sold?'
      );
      // Discrete: P(X > 12) = 1 - P(X <= 12)
      expect(p.resultValue).toBeCloseTo(0.208444, 5);
      expect(p.rCode).toContain('ppois(12, lambda = 10, lower.tail = FALSE)');
    });

    it('25. Typographical errors fewer than P(X < 2)', () => {
      const p = solveProblem(
        'Typographical errors in a textbook follow a Poisson distribution with mean 2 per page. What is the probability that a page has fewer than 2 errors?'
      );
      // Discrete: P(X < 2) = P(X <= 1)
      expect(p.resultValue).toBeCloseTo(0.406006, 5);
      expect(p.rCode).toContain('ppois(1, lambda = 2)');
    });

    it('26. Optical fiber flaws interval P(2 <= X <= 5)', () => {
      const p = solveProblem(
        'Flaws on an optical fiber occur at a Poisson rate of 3 per kilometer. What is the probability of having between 2 and 5 flaws?'
      );
      expect(p.resultValue).toBeCloseTo(0.716934, 5);
    });

    it('27. Traffic accidents standard deviation', () => {
      const p = solveProblem(
        'Accidents at an intersection follow a Poisson distribution with lambda 2.5 per month. What is the standard deviation of monthly accidents?'
      );
      expect(p.resultValue).toBeCloseTo(1.581139, 5);
    });

    it('28. Radioactive source median', () => {
      const p = solveProblem(
        'A radioactive source emits particles at an average rate of 8 per second following a Poisson distribution. Find the median number of particles.'
      );
      expect(p.resultValue).toBe(8);
    });

    it('29. Packet drops MGF at t = 0.4', () => {
      const p = solveProblem(
        'Network packet drops occur at an average rate of 1.5 per minute. What is the moment generating function at t = 0.4?'
      );
      expect(p.resultValue).toBeCloseTo(2.091198, 5);
    });

    it('30. Earthquakes zero events P(X = 0)', () => {
      const p = solveProblem(
        'Earthquakes occur in a region according to a Poisson distribution with mean 3.2 per year. What is the probability that exactly 0 earthquakes occur?'
      );
      expect(p.resultValue).toBeCloseTo(0.040762, 5);
    });
  });

  // ==========================================
  // 4. EXPONENTIAL DISTRIBUTION (10 PROBLEMS)
  // ==========================================
  describe('Exponential Distribution Worded Problems', () => {
    it('31. Bus waiting time with mean conversion P(X <= 5)', () => {
      const p = solveProblem(
        'The waiting time for a bus follows an exponential distribution with a mean waiting time of 10 minutes. What is the probability of waiting at most 5 minutes?'
      );
      expect(p.distribution.type).toBe('exponential');
      if (p.distribution.type === 'exponential') {
        expect(p.distribution.params.rate).toBeCloseTo(0.1, 5);
      }
      expect(p.resultValue).toBeCloseTo(0.393469, 5);
    });

    it('32. Component lifetime with mean conversion P(X > 1500)', () => {
      const p = solveProblem(
        'The lifetime of an electronic component is exponentially distributed with a mean lifetime of 1000 hours. What is the probability that the component survives more than 1500 hours?'
      );
      expect(p.resultValue).toBeCloseTo(0.22313, 5);
    });

    it('33. ATM service time P(X >= 2)', () => {
      const p = solveProblem(
        'Service time at an ATM is exponentially distributed with rate 0.5 per minute. What is the probability that service takes at least 2 minutes?'
      );
      expect(p.resultValue).toBeCloseTo(0.367879, 5);
    });

    it('34. Radioactive decay interval P(1 <= X <= 3)', () => {
      const p = solveProblem(
        'A radioactive substance decays with an exponential rate of 0.2 per year. What is the probability of decay occurring between 1 and 3 years?'
      );
      expect(p.resultValue).toBeCloseTo(0.269919, 5);
    });

    it('35. Phone call median duration', () => {
      const p = solveProblem(
        'The duration of phone calls follows an exponential distribution with a mean waiting time of 4 minutes. What is the median call duration?'
      );
      expect(p.resultValue).toBeCloseTo(2.772589, 5);
    });

    it('36. Light bulb 90th percentile', () => {
      const p = solveProblem(
        'A light bulb has an exponentially distributed lifetime with rate 0.002 per hour. Find the 90th percentile of the bulb lifetime.'
      );
      expect(p.resultValue).toBeCloseTo(1151.2925, 2);
    });

    it('37. Lifetime variance', () => {
      const p = solveProblem(
        'A component has an exponential lifetime with rate 0.05 per year. What is the variance of its lifetime?'
      );
      expect(p.resultValue).toBeCloseTo(400, 5);
    });

    it('38. Exponential MGF at t = 0.1', () => {
      const p = solveProblem(
        'A system has an exponentially distributed lifetime with rate 0.4 per month. What is the moment generating function at t = 0.1?'
      );
      expect(p.resultValue).toBeCloseTo(1.333333, 5);
    });

    it('39. Memoryless conditional survival P(X > 80 | X > 50)', () => {
      const p = solveProblem(
        'A machine part has an exponential lifetime with rate 0.01 per day. Given that it has survived 50 days, what is the probability it survives an additional 30 days?'
      );
      expect(p.resultValue).toBeCloseTo(0.740818, 5);
    });

    it('40. Customer arrivals fewer than P(X < 0.5)', () => {
      const p = solveProblem(
        'The waiting time between arrivals is exponentially distributed with rate 2 per hour. What is the probability of waiting fewer than 0.5 hours?'
      );
      expect(p.resultValue).toBeCloseTo(0.632121, 5);
    });
  });

  // ==========================================
  // 5. GAMMA DISTRIBUTION (10 PROBLEMS)
  // ==========================================
  describe('Gamma Distribution Worded Problems', () => {
    it('41. Sequential tasks completion P(X <= 4)', () => {
      const p = solveProblem(
        'The total time to complete tasks follows a gamma distribution with shape 3 and rate 0.5 per hour. What is the probability of completion in at most 4 hours?'
      );
      expect(p.distribution.type).toBe('gamma');
      expect(p.resultValue).toBeCloseTo(0.323324, 5);
    });

    it('42. Rainfall accumulation with scale conversion P(X > 15)', () => {
      const p = solveProblem(
        'A rainfall model uses a gamma distribution with shape 2 and scale 5 cm. What is the probability of receiving more than 15 cm of rain?'
      );
      expect(p.distribution.type).toBe('gamma');
      if (p.distribution.type === 'gamma') {
        expect(p.distribution.params.rate).toBeCloseTo(0.2, 5);
      }
      expect(p.resultValue).toBeCloseTo(0.199148, 5);
    });

    it('43. Process duration at least P(X >= 3)', () => {
      const p = solveProblem(
        'A biological process follows a gamma distribution with shape 4 and rate 2 per day. What is the probability that the process takes at least 3 days?'
      );
      expect(p.resultValue).toBeCloseTo(0.151204, 5);
    });

    it('44. Component wear expected value (mean)', () => {
      const p = solveProblem(
        'Component wear follows a gamma distribution with shape 2.5 and rate 1. What is the expected value of component wear?'
      );
      expect(p.resultValue).toBe(2.5);
    });

    it('45. Gamma variance', () => {
      const p = solveProblem(
        'For a gamma distribution with shape 3 and rate 2, what is the variance?'
      );
      expect(p.resultValue).toBe(0.75);
    });

    it('46. Project completion interval P(2 <= X <= 6)', () => {
      const p = solveProblem(
        'A project completion time follows a gamma distribution with shape 2 and rate 0.5. What is the probability that completion takes between 2 and 6 days?'
      );
      expect(p.resultValue).toBeCloseTo(0.536611, 5);
    });

    it('47. Gamma standard deviation', () => {
      const p = solveProblem(
        'A financial return variable follows a gamma distribution with shape 5 and rate 2.5. What is the standard deviation?'
      );
      expect(p.resultValue).toBeCloseTo(0.894427, 5);
    });

    it('48. Gamma MGF at t = 0.5', () => {
      const p = solveProblem(
        'Consider a gamma distribution with shape 4 and rate 2. What is the moment generating function at t = 0.5?'
      );
      expect(p.resultValue).toBeCloseTo(3.160494, 5);
    });

    it('49. Queue service median with scale conversion', () => {
      const p = solveProblem(
        'A queue service process has a gamma distribution with shape 2 and scale 4. Find the median service time.'
      );
      expect(p.resultValue).toBeCloseTo(6.713389, 5);
    });

    it('50. Server processing fewer than P(X < 2)', () => {
      const p = solveProblem(
        'A server processing time follows a gamma distribution with shape 3 and rate 1. What is the probability of taking fewer than 2 seconds?'
      );
      expect(p.resultValue).toBeCloseTo(0.323324, 5);
    });
  });

  // ==========================================
  // 6. WEIBULL DISTRIBUTION (10 PROBLEMS)
  // ==========================================
  describe('Weibull Distribution Worded Problems', () => {
    it('51. Wind turbine blade life P(X <= 5)', () => {
      const p = solveProblem(
        'Wind turbine blade fatigue life follows a Weibull distribution with shape 2 and scale 10 years. What is the probability that a blade lasts at most 5 years?'
      );
      expect(p.distribution.type).toBe('weibull');
      expect(p.resultValue).toBeCloseTo(0.221199, 5);
    });

    it('52. Mechanical pump breakdown P(X > 1200)', () => {
      const p = solveProblem(
        'The time to breakdown for a pump follows a Weibull distribution with shape 1.5 and scale 1000 hours. What is the probability that the pump exceeds 1200 hours?'
      );
      expect(p.resultValue).toBeCloseTo(0.268598, 5);
    });

    it('53. Material strength at least P(X >= 40)', () => {
      const p = solveProblem(
        'A composite material has breaking strength distributed as Weibull with shape 3 and scale 50. What is the probability that the strength is at least 40?'
      );
      expect(p.resultValue).toBeCloseTo(0.599296, 5);
    });

    it('54. Aerospace bearing interval P(1000 <= X <= 1500)', () => {
      const p = solveProblem(
        'An aerospace bearing has a Weibull distribution with shape 2 and scale 2000 hours. What is the probability of failure between 1000 and 1500 hours?'
      );
      expect(p.resultValue).toBeCloseTo(0.209018, 5);
    });

    it('55. Expected value with shape = 1', () => {
      const p = solveProblem(
        'For a Weibull distribution with shape 1 and scale 500, what is the expected value?'
      );
      expect(p.resultValue).toBe(500);
    });

    it('56. Wearout median', () => {
      const p = solveProblem(
        'A microchip wearout model follows a Weibull distribution with shape 2 and scale 5 years. What is the median wearout time?'
      );
      expect(p.resultValue).toBeCloseTo(4.162773, 5);
    });

    it('57. Engine valve standard deviation', () => {
      const p = solveProblem(
        'An engine valve has a Weibull distribution with shape 2 and scale 10. What is the standard deviation of its operating life?'
      );
      expect(p.resultValue).toBeCloseTo(4.632514, 5);
    });

    it('58. Cutting tool top 10% cutoff (90th percentile)', () => {
      const p = solveProblem(
        'A cutting tool has a Weibull distribution with shape 2.5 and scale 100 hours. Find the cutoff for top 10% longest lasting tools.'
      );
      expect(p.resultValue).toBeCloseTo(139.6003, 2);
    });

    it('59. Weibull MGF for shape = 1 at t = 0.2', () => {
      const p = solveProblem(
        'A Weibull distribution has shape 1 and scale 2. What is the moment generating function at t = 0.2?'
      );
      expect(p.resultValue).toBeCloseTo(1.666667, 5);
    });

    it('60. Fiber cable lifetime fewer than P(X < 4)', () => {
      const p = solveProblem(
        'A fiber cable lifetime follows a Weibull distribution with shape 2 and scale 8 years. What is the probability that the lifetime is fewer than 4 years?'
      );
      expect(p.resultValue).toBeCloseTo(0.221199, 5);
    });
  });

  // ==========================================
  // 7. AMBIGUITY AND CLARIFICATIONS (4 CASES)
  // ==========================================
  describe('Ambiguity and Clarification Handling', () => {
    it('61. Asks for clarification when Normal SD is missing', () => {
      const res = parseWordProblemLayerA(
        'A normal distribution with mean 50. Find the probability of being less than 40.'
      );
      expect(res.success).toBe(false);
      if ('needsClarification' in res && res.needsClarification) {
        expect(res.needsClarification).toBe(true);
        expect(res.clarifyingQuestion).toContain('standard deviation');
      }
    });

    it('62. Asks for clarification when Binomial prob is missing', () => {
      const res = parseWordProblemLayerA(
        'A binomial experiment with 20 trials. What is the probability of 5 successes?'
      );
      expect(res.success).toBe(false);
      if ('needsClarification' in res && res.needsClarification) {
        expect(res.needsClarification).toBe(true);
        expect(res.clarifyingQuestion).toContain('probability of success');
      }
    });

    it('63. Asks for clarification when Poisson lambda is missing', () => {
      const res = parseWordProblemLayerA(
        'A random variable follows a Poisson distribution. What is the probability of at least 3 events?'
      );
      expect(res.success).toBe(false);
      if ('needsClarification' in res && res.needsClarification) {
        expect(res.needsClarification).toBe(true);
        expect(res.clarifyingQuestion).toContain('lambda');
      }
    });

    it('64. Asks for clarification when query operation is missing', () => {
      const res = parseWordProblemLayerA(
        'The heights of trees follow a normal distribution with mean 20 and standard deviation 4.'
      );
      expect(res.success).toBe(false);
      if ('needsClarification' in res && res.needsClarification) {
        expect(res.needsClarification).toBe(true);
        expect(res.clarifyingQuestion).toContain('What probability');
      }
    });
  });
});
