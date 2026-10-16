import type { DistributionType } from '../engine/types';
import type { SolverQueryType } from '../solver/types';

export type UIMode = 'calculator' | 'ask';
export type ThemeMode = 'dark' | 'light';

export interface UIState {
  theme: ThemeMode;
  mode: UIMode;
  selectedDist: DistributionType;
  params: {
    size?: number;
    prob?: number;
    lambda?: number;
    mean?: number;
    sd?: number;
    rate?: number;
    shape?: number;
    scale?: number;
  };
  queryType: SolverQueryType;
  queryArgs: {
    x?: number;
    a?: number;
    b?: number;
    p?: number;
    t?: number;
    s?: number;
  };
  askInput: string;
  showVariations: boolean;
  showQuestionBank: boolean;
  bankFilterDist: DistributionType | 'all';
  bankFilterDifficulty: string;
  bankFilterCategory: string;
  bankSearchQuery: string;
}
