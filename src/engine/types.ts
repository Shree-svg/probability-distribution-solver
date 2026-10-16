export type DistributionType =
  | 'binomial'
  | 'poisson'
  | 'normal'
  | 'exponential'
  | 'gamma'
  | 'weibull';

export interface BinomialParams {
  size: number; // n (integer >= 0)
  prob: number; // p (0 <= p <= 1)
}

export interface PoissonParams {
  lambda: number; // rate lambda > 0
}

export interface NormalParams {
  mean: number; // mu
  sd: number; // sigma > 0
}

export interface ExponentialParams {
  rate: number; // lambda > 0
}

export interface GammaParams {
  shape: number; // alpha > 0
  rate: number; // lambda > 0 (R parameterization uses rate or scale, here rate = 1/scale)
}

export interface WeibullParams {
  shape: number; // k > 0
  scale: number; // lambda > 0
}

export type DistributionParams =
  | { type: 'binomial'; params: BinomialParams }
  | { type: 'poisson'; params: PoissonParams }
  | { type: 'normal'; params: NormalParams }
  | { type: 'exponential'; params: ExponentialParams }
  | { type: 'gamma'; params: GammaParams }
  | { type: 'weibull'; params: WeibullParams };

export interface EngineResult {
  value: number;
  rCode: string;
  notes?: string;
}

export type ValidationSuccess<T> = {
  isValid: true;
  value: T;
};

export type ValidationFailure = {
  isValid: false;
  error: string;
};

export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;
