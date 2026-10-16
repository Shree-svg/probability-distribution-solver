import { execSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { describe, expect, it } from 'vitest';
import { parseWordProblemLayerA } from '../src/solver/layer_a';
import { generateRCode, generateRScript } from '../src/rgen';

function verifyEveryLineHasComment(script: string) {
  const lines = script
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  expect(lines.length).toBeGreaterThan(0);
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].startsWith('#')) {
      expect(i).toBeGreaterThan(0);
      expect(lines[i - 1].startsWith('#')).toBe(true);
    }
  }
}

function checkRscriptAvailable(): boolean {
  try {
    const out = execSync('Rscript --version', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return out.includes('R') || out.includes('version');
  } catch {
    return false;
  }
}

describe('R Code & Script Generator (Base R Conventions)', () => {
  it('generates accurate R code for Binomial(size, prob)', () => {
    const dist = { type: 'binomial' as const, params: { size: 10, prob: 0.3 } };
    expect(generateRCode(dist, { op: 'pdf', x: 3 })).toBe('dbinom(3, size = 10, prob = 0.3)');
    expect(generateRCode(dist, { op: 'cdf', q: 4 })).toBe('pbinom(4, size = 10, prob = 0.3)');
    expect(generateRCode(dist, { op: 'cdf', q: 4, lowerTail: false })).toBe(
      'pbinom(4, size = 10, prob = 0.3, lower.tail = FALSE)'
    );
    expect(generateRCode(dist, { op: 'quantile', p: 0.85 })).toBe('qbinom(0.85, size = 10, prob = 0.3)');
  });

  it('generates accurate R code for Poisson(lambda)', () => {
    const dist = { type: 'poisson' as const, params: { lambda: 3 } };
    expect(generateRCode(dist, { op: 'pdf', x: 2 })).toBe('dpois(2, lambda = 3)');
    expect(generateRCode(dist, { op: 'cdf', q: 4 })).toBe('ppois(4, lambda = 3)');
    expect(generateRCode(dist, { op: 'quantile', p: 0.5 })).toBe('qpois(0.5, lambda = 3)');
  });

  it('generates accurate R code for Normal(mean, sd)', () => {
    const dist = { type: 'normal' as const, params: { mean: 10, sd: 2 } };
    expect(generateRCode(dist, { op: 'pdf', x: 12 })).toBe('dnorm(12, mean = 10, sd = 2)');
    expect(generateRCode(dist, { op: 'cdf', q: 12 })).toBe('pnorm(12, mean = 10, sd = 2)');
    expect(generateRCode(dist, { op: 'interval', lower: 8, upper: 12 })).toBe(
      'pnorm(12, mean = 10, sd = 2) - pnorm(8, mean = 10, sd = 2)'
    );
    expect(generateRCode(dist, { op: 'quantile', p: 0.975 })).toBe('qnorm(0.975, mean = 10, sd = 2)');
  });

  it('generates accurate R code for Exponential(rate)', () => {
    const dist = { type: 'exponential' as const, params: { rate: 0.5 } };
    expect(generateRCode(dist, { op: 'pdf', x: 2 })).toBe('dexp(2, rate = 0.5)');
    expect(generateRCode(dist, { op: 'cdf', q: 2 })).toBe('pexp(2, rate = 0.5)');
    expect(generateRCode(dist, { op: 'quantile', p: 0.5 })).toBe('qexp(0.5, rate = 0.5)');
  });

  it('generates accurate R code for Gamma(shape, rate)', () => {
    const dist = { type: 'gamma' as const, params: { shape: 3, rate: 2 } };
    expect(generateRCode(dist, { op: 'pdf', x: 2 })).toBe('dgamma(2, shape = 3, rate = 2)');
    expect(generateRCode(dist, { op: 'cdf', q: 2 })).toBe('pgamma(2, shape = 3, rate = 2)');
    expect(generateRCode(dist, { op: 'quantile', p: 0.5 })).toBe('qgamma(0.5, shape = 3, rate = 2)');
  });

  it('generates accurate R code for Weibull(shape, scale)', () => {
    const dist = { type: 'weibull' as const, params: { shape: 2, scale: 3 } };
    expect(generateRCode(dist, { op: 'pdf', x: 1.5 })).toBe('dweibull(1.5, shape = 2, scale = 3)');
    expect(generateRCode(dist, { op: 'cdf', q: 1.5 })).toBe('pweibull(1.5, shape = 2, scale = 3)');
    expect(generateRCode(dist, { op: 'quantile', p: 0.5 })).toBe('qweibull(0.5, shape = 2, scale = 3)');
  });

  // ==========================================
  // Full Script Generation Requirements
  // ==========================================
  describe('Full Runnable Script Structure & Annotation', () => {
    it('verifies every code line has an explanatory comment directly above it', () => {
      const script = generateRScript({
        distribution: { type: 'normal', params: { mean: 100, sd: 15 } },
        query: { type: 'prob_less_equal', x: 115 },
      });
      verifyEveryLineHasComment(script);
    });

    it('verifies parameter definitions, mean/var computation, and cat/round printing', () => {
      const script = generateRScript({
        distribution: { type: 'binomial', params: { size: 20, prob: 0.4 } },
        query: { type: 'prob_greater_equal', x: 10 },
      });
      verifyEveryLineHasComment(script);
      expect(script).toContain('size <- 20');
      expect(script).toContain('prob <- 0.4');
      expect(script).toContain('mean_val <- size * prob');
      expect(script).toContain('var_val <- size * prob * (1 - prob)');
      expect(script).toContain('cat(sprintf("Result: %.6f\\n", round(ans, 6)))');
      expect(script).toContain('cat(sprintf("Mean: %.4f\\n", round(mean_val, 4)))');
      expect(script).toContain('cat(sprintf("Variance: %.4f\\n", round(var_val, 4)))');
    });

    it('verifies discrete P(X >= x) rule: uses x - 1 with lower.tail = FALSE', () => {
      const binomScript = generateRScript({
        distribution: { type: 'binomial', params: { size: 15, prob: 0.5 } },
        query: { type: 'prob_greater_equal', x: 8 },
      });
      expect(binomScript).toContain('k_val <- x_val - 1');
      expect(binomScript).toContain('pbinom(k_val, size = size, prob = prob, lower.tail = FALSE)');

      const poisScript = generateRScript({
        distribution: { type: 'poisson', params: { lambda: 5 } },
        query: { type: 'prob_greater_equal', x: 4 },
      });
      expect(poisScript).toContain('k_val <- x_val - 1');
      expect(poisScript).toContain('ppois(k_val, lambda = lambda, lower.tail = FALSE)');
    });

    it('verifies interval rules: pnorm(b) - pnorm(a) for continuous, pbinom(b) - pbinom(a - 1) for discrete', () => {
      const normScript = generateRScript({
        distribution: { type: 'normal', params: { mean: 50, sd: 5 } },
        query: { type: 'prob_interval', a: 45, b: 55 },
      });
      expect(normScript).toContain('pnorm(b_val, mean = mu, sd = sigma) - pnorm(a_val, mean = mu, sd = sigma)');

      const binomScript = generateRScript({
        distribution: { type: 'binomial', params: { size: 30, prob: 0.2 } },
        query: { type: 'prob_interval', a: 3, b: 8 },
      });
      expect(binomScript).toContain('a_minus_1 <- a_val - 1');
      expect(binomScript).toContain('pbinom(b_val, size = size, prob = prob) - pbinom(a_minus_1, size = size, prob = prob)');
    });

    it('verifies discrete plotting with barplot and colored region', () => {
      const script = generateRScript({
        distribution: { type: 'poisson', params: { lambda: 4 } },
        query: { type: 'prob_less_equal', x: 3 },
      });
      expect(script).toContain('barplot(');
      expect(script).toContain('col = bar_cols');
      expect(script).toContain('legend("topright"');
    });

    it('verifies continuous plotting with curve() and polygon() shading', () => {
      const script = generateRScript({
        distribution: { type: 'exponential', params: { rate: 0.2 } },
        query: { type: 'prob_less_equal', x: 5 },
      });
      expect(script).toContain('curve(');
      expect(script).toContain('polygon(');
      expect(script).toContain('main = ');
      expect(script).toContain('xlab = ');
      expect(script).toContain('ylab = ');
      expect(script).toContain('legend("topright"');
    });
  });

  // ==========================================
  // Terminal Rscript Execution Tests
  // ==========================================
  describe('Terminal Execution Verification via Rscript', () => {
    const isROnline = checkRscriptAvailable();

    if (!isROnline) {
      it('informs user that R is not installed and shows installation instructions', () => {
        const installInstructions = `
===================================================================
R / Rscript is not detected on this system.
To install R and enable native terminal script verification:

- macOS (Homebrew):
    brew install r

- Debian / Ubuntu:
    sudo apt-get update && sudo apt-get install -y r-base

- Windows:
    winget install RProject.R
    Or download installer from: https://cran.r-project.org/bin/windows/base/

- Official CRAN download for all operating systems:
    https://cran.r-project.org/
===================================================================`;
        console.warn(installInstructions);
        expect(isROnline).toBe(false);
      });
      return;
    }

    const testCases: Array<{
      name: string;
      problem: string;
    }> = [
      {
        name: 'Normal P(X <= 115)',
        problem: 'IQ scores are normally distributed with a mean of 100 and a standard deviation of 15. What is the probability that a randomly chosen person has an IQ of at most 115?',
      },
      {
        name: 'Normal P(X > 191) with variance conversion',
        problem: 'The height of adult males follows a normal distribution with mean 175 cm and variance 64. What is the probability of selecting a male taller than 191 cm?',
      },
      {
        name: 'Normal Interval P(9.6 <= X <= 10.4)',
        problem: 'A manufacturing process produces bolts with diameter normally distributed with mean 10 mm and standard deviation 0.2 mm. What proportion of bolts are between 9.6 and 10.4 mm?',
      },
      {
        name: 'Normal 90th percentile',
        problem: 'A coffee dispenser dispenses coffee with mean 200 ml and standard deviation 12 ml. What is the 90th percentile of dispensed coffee volume?',
      },
      {
        name: 'Binomial exact P(X = 5)',
        problem: 'A student takes a multiple choice exam with 20 trials and probability of success 0.25 on each trial. What is the probability of getting exactly 5 correct answers?',
      },
      {
        name: 'Binomial at least P(X >= 12)',
        problem: 'A basketball player takes 15 free throws with a 80% success rate. What is the probability of making at least 12 free throws?',
      },
      {
        name: 'Binomial more than P(X > 22)',
        problem: 'In a clinical trial with 30 trials and probability of success 0.7, what is the probability that more than 22 patients recover?',
      },
      {
        name: 'Binomial interval P(1 <= X <= 3)',
        problem: 'A digital transmitter sends 8 bits with probability of success 0.1. What is the probability that the number of successes is between 1 and 3?',
      },
      {
        name: 'Poisson exact P(X = 4)',
        problem: 'Calls arrive at a call center at an average rate of 6 calls per hour according to a Poisson process. What is the probability of receiving exactly 4 calls?',
      },
      {
        name: 'Poisson at most P(X <= 3)',
        problem: 'A web server receives on average 5 requests per second following a Poisson distribution. What is the probability of at most 3 requests?',
      },
      {
        name: 'Poisson at least P(X >= 8)',
        problem: 'Emergency room arrivals follow a Poisson distribution with mean 10 arrivals per night. What is the probability of at least 8 arrivals?',
      },
      {
        name: 'Exponential with mean conversion P(X <= 5)',
        problem: 'The waiting time for a bus has an exponential distribution with a mean waiting time of 10 minutes. What is the probability of waiting at most 5 minutes?',
      },
      {
        name: 'Exponential survival P(X >= 2)',
        problem: 'Service time at an ATM is exponentially distributed with rate 0.5 per minute. What is the probability that a customer takes at least 2 minutes?',
      },
      {
        name: 'Exponential memoryless conditional survival',
        problem: 'A machine part has an exponential lifetime with rate 0.01 per day. Given that it has survived 50 days, what is the probability it survives an additional 30 days?',
      },
      {
        name: 'Gamma P(X <= 4)',
        problem: 'A system undergoes 3 sequential stages where each stage has rate 1. The total time follows a Gamma distribution with shape 3 and rate 1. What is the probability that total time is at most 4 hours?',
      },
      {
        name: 'Gamma interval P(2 <= X <= 6)',
        problem: 'A project duration follows a Gamma distribution with shape 4 and rate 0.8. What is the probability of completion between 2 and 6 weeks?',
      },
      {
        name: 'Weibull P(X <= 5)',
        problem: 'The time to failure of a wind turbine blade follows a Weibull distribution with shape 1.5 and scale 10 years. What is the probability the blade fails within 5 years?',
      },
      {
        name: 'Weibull survival P(X > 1200)',
        problem: 'A mechanical pump lifetime follows a Weibull distribution with shape 2 and scale 1500 hours. What is the probability that the pump exceeds 1200 hours?',
      },
      {
        name: 'Weibull 90th percentile cutoff',
        problem: 'A cutting tool has a Weibull distribution with shape 2.5 and scale 100 hours. Find the cutoff for top 10% longest lasting tools.',
      },
    ];

    testCases.forEach((tc) => {
      it(`runs generated R script in terminal for: ${tc.name}`, () => {
        const solved = parseWordProblemLayerA(tc.problem);
        expect(solved.success).toBe(true);
        if (!solved.success) return;

        // Generate R script
        const rScript = generateRScript({
          distribution: solved.distribution,
          query: solved.query,
          resultValue: solved.resultValue,
        });

        // Ensure every line has an explanation comment
        verifyEveryLineHasComment(rScript);

        // Write to temporary R script file
        const tmpDir = os.tmpdir();
        const tmpFile = path.join(tmpDir, `test_r_${Date.now()}_${Math.random().toString(36).substring(7)}.R`);
        const pdfFile = path.join(tmpDir, `plot_${Date.now()}.pdf`);

        // Run with a null/temp PDF graphics device so batch Rscript runs cleanly in headless environments
        const scriptToExecute = `pdf("${pdfFile}")\n${rScript}\ndev.off()\n`;
        fs.writeFileSync(tmpFile, scriptToExecute, 'utf8');

        try {
          const stdout = execSync(`Rscript "${tmpFile}"`, {
            encoding: 'utf8',
            stdio: ['pipe', 'pipe', 'pipe'],
          });

          // Match ANSWER line
          const match = stdout.match(/ANSWER:\s*([0-9]*\.?[0-9]+(?:e[-+]?[0-9]+)?)/i);
          expect(match).not.toBeNull();
          if (match) {
            const rAnswer = parseFloat(match[1]);
            expect(rAnswer).toBeCloseTo(solved.resultValue, 5);
          }
        } finally {
          // Cleanup temporary files
          if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
          if (fs.existsSync(pdfFile)) fs.unlinkSync(pdfFile);
          if (fs.existsSync('Rplots.pdf')) fs.unlinkSync('Rplots.pdf');
        }
      });
    });
  });
});
