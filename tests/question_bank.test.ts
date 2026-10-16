import { describe, expect, it } from 'vitest';
import {
  getAllQuestions,
  getCategories,
  getQuestionById,
  getQuestionCount,
  getQuestionsByDistribution,
  getRandomQuestion,
  filterQuestions,
} from '../src/data/question_bank';
import type { DistributionType } from '../src/engine/types';
import { parseWordProblemLayerA } from '../src/solver/layer_a';
import { evaluateSolverQuery } from '../src/solver/evaluator';

const DISTRIBUTIONS: DistributionType[] = [
  'binomial',
  'poisson',
  'normal',
  'exponential',
  'gamma',
  'weibull',
];

describe('Question Bank Database (100 Questions per Distribution)', () => {
  it('contains exactly 600 total questions across all 6 distributions', () => {
    const all = getAllQuestions();
    expect(all.length).toBe(600);
    expect(getQuestionCount()).toBe(600);
  });

  it('contains exactly 100 questions for each of the 6 distributions', () => {
    for (const dist of DISTRIBUTIONS) {
      const questions = getQuestionsByDistribution(dist);
      expect(questions.length).toBe(100);
      expect(getQuestionCount(dist)).toBe(100);
    }
  });

  it('every question has complete metadata and non-empty text', () => {
    const all = getAllQuestions();
    const seenIds = new Set<string>();

    for (const q of all) {
      expect(q.id).toBeDefined();
      expect(seenIds.has(q.id)).toBe(false);
      seenIds.add(q.id);

      expect(DISTRIBUTIONS).toContain(q.distribution);
      expect(q.title.trim().length).toBeGreaterThan(5);
      expect(q.question.trim().length).toBeGreaterThan(20);
      expect(q.category.trim().length).toBeGreaterThan(3);
      expect(['Basic', 'Intermediate', 'Advanced']).toContain(q.difficulty);
      expect(q.params).toBeDefined();
      expect(q.query).toBeDefined();
    }
  });

  it('supports category discovery and retrieval', () => {
    const allCats = getCategories();
    expect(allCats.length).toBeGreaterThanOrEqual(10);

    for (const dist of DISTRIBUTIONS) {
      const distCats = getCategories(dist);
      expect(distCats.length).toBe(10);
    }
  });

  it('supports lookup by ID and random retrieval', () => {
    const bin1 = getQuestionById('binom-001');
    expect(bin1).toBeDefined();
    expect(bin1?.distribution).toBe('binomial');

    const randNorm = getRandomQuestion('normal');
    expect(randNorm.distribution).toBe('normal');

    const randAny = getRandomQuestion();
    expect(randAny).toBeDefined();
  });

  it('supports flexible filtering by distribution, difficulty, category and search term', () => {
    const filtered1 = filterQuestions({ distribution: 'poisson', difficulty: 'Basic' });
    expect(filtered1.length).toBeGreaterThan(0);
    expect(filtered1.every((q) => q.distribution === 'poisson' && q.difficulty === 'Basic')).toBe(true);

    const filteredSearch = filterQuestions({ searchQuery: 'trauma' });
    expect(filteredSearch.length).toBeGreaterThan(0);
    expect(filteredSearch.some((q) => q.title.toLowerCase().includes('trauma'))).toBe(true);
  });

  it('evaluates cleanly through the probability engine without NaN or Infinity', () => {
    // Sample test across all distributions to verify mathematical validity
    for (const dist of DISTRIBUTIONS) {
      const sample = getQuestionsByDistribution(dist).slice(0, 5);
      for (const q of sample) {
        let params: any;
        if (dist === 'binomial') {
          params = { type: 'binomial', params: { size: q.params.size, prob: q.params.prob } };
        } else if (dist === 'poisson') {
          params = { type: 'poisson', params: { lambda: q.params.lambda } };
        } else if (dist === 'normal') {
          params = { type: 'normal', params: { mean: q.params.mean, sd: q.params.sd } };
        } else if (dist === 'exponential') {
          params = { type: 'exponential', params: { rate: q.params.rate } };
        } else if (dist === 'gamma') {
          params = { type: 'gamma', params: { shape: q.params.shape, rate: q.params.rate } };
        } else if (dist === 'weibull') {
          params = { type: 'weibull', params: { shape: q.params.shape, scale: q.params.scale } };
        }

        const sol = evaluateSolverQuery(params, q.query);
        expect(sol.resultValue).toBeDefined();
        expect(Number.isFinite(sol.resultValue)).toBe(true);
        expect(Number.isNaN(sol.resultValue)).toBe(false);
      }
    }
  });

  it('Layer A NLP parser successfully parses database question statements', () => {
    // Verify that question texts are natural and parseable by Layer A
    for (const dist of DISTRIBUTIONS) {
      const sample = getQuestionsByDistribution(dist).slice(0, 5);
      for (const q of sample) {
        const parsed = parseWordProblemLayerA(q.question);
        if (!parsed.success) {
          console.error(`Failed to parse [${q.id}]: "${q.question}"`, parsed);
        }
        expect(parsed.success).toBe(true);
        if (parsed.success) {
          expect(parsed.distribution.type).toBe(dist);
        }
      }
    }
  });
});
