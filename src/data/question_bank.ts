import type { DistributionType } from '../engine/types';
import rawQuestions from './question_bank.json';
import type { BankQuestion, QuestionFilterCriteria } from './types';

export const QUESTION_BANK: BankQuestion[] = rawQuestions as unknown as BankQuestion[];

/**
 * Returns all 600 questions in the database.
 */
export function getAllQuestions(): BankQuestion[] {
  return QUESTION_BANK;
}

/**
 * Returns all questions for a specific distribution (approx 100 questions).
 */
export function getQuestionsByDistribution(dist: DistributionType): BankQuestion[] {
  return QUESTION_BANK.filter((q) => q.distribution === dist);
}

/**
 * Returns the count of questions for a distribution or all distributions.
 */
export function getQuestionCount(dist?: DistributionType): number {
  if (!dist) return QUESTION_BANK.length;
  return QUESTION_BANK.filter((q) => q.distribution === dist).length;
}

/**
 * Returns a list of unique categories available for a distribution or across all distributions.
 */
export function getCategories(dist?: DistributionType): string[] {
  const pool = dist ? getQuestionsByDistribution(dist) : QUESTION_BANK;
  return Array.from(new Set(pool.map((q) => q.category))).sort();
}

/**
 * Looks up a question by its unique identifier (e.g. "binom-001").
 */
export function getQuestionById(id: string): BankQuestion | undefined {
  return QUESTION_BANK.find((q) => q.id === id);
}

/**
 * Selects a random question, optionally filtered by distribution.
 */
export function getRandomQuestion(dist?: DistributionType): BankQuestion {
  const pool = dist ? getQuestionsByDistribution(dist) : QUESTION_BANK;
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}

/**
 * Filters the question database based on distribution, difficulty, category, and free-text search.
 */
export function filterQuestions(criteria: QuestionFilterCriteria): BankQuestion[] {
  let results = QUESTION_BANK;

  if (criteria.distribution && criteria.distribution !== 'all') {
    results = results.filter((q) => q.distribution === criteria.distribution);
  }

  if (criteria.difficulty && criteria.difficulty !== 'all') {
    results = results.filter((q) => q.difficulty === criteria.difficulty);
  }

  if (criteria.category && criteria.category !== 'all') {
    results = results.filter((q) => q.category === criteria.category);
  }

  if (criteria.searchQuery && criteria.searchQuery.trim().length > 0) {
    const term = criteria.searchQuery.trim().toLowerCase();
    results = results.filter(
      (q) =>
        q.title.toLowerCase().includes(term) ||
        q.question.toLowerCase().includes(term) ||
        q.category.toLowerCase().includes(term) ||
        q.id.toLowerCase().includes(term)
    );
  }

  return results;
}
