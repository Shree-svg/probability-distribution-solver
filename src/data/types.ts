import type { DistributionType } from '../engine/types';
import type { SolverQuery } from '../solver/types';

export type QuestionDifficulty = 'Basic' | 'Intermediate' | 'Advanced';

export interface BankQuestion {
  id: string;
  distribution: DistributionType;
  category: string;
  difficulty: QuestionDifficulty;
  title: string;
  question: string;
  params: Record<string, number>;
  query: SolverQuery;
}

export interface QuestionFilterCriteria {
  distribution?: DistributionType | 'all';
  difficulty?: QuestionDifficulty | 'all';
  category?: string | 'all';
  searchQuery?: string;
}
