import { assertValidNumber, validateFiniteNumber } from './validator';

/**
 * Log-Gamma function via Lanczos approximation (g=7, N=9).
 * Precise to ~1e-15 relative error for x > 0.
 */
export function logGamma(x: number): number {
  if (x <= 0) {
    throw new Error(`logGamma is only defined for positive numbers (received ${x}).`);
  }

  const p = [
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];

  const g = 7;
  const z = x - 1;
  let sum = p[0];
  for (let i = 1; i < p.length; i++) {
    sum += p[i] / (z + i);
  }

  const t = z + g + 0.5;
  const res = 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(sum);
  return assertValidNumber(res, 'logGamma');
}

/**
 * Gamma function for positive x.
 */
export function gamma(x: number): number {
  if (x <= 0) {
    throw new Error(`Gamma function argument must be positive (received ${x}).`);
  }
  return assertValidNumber(Math.exp(logGamma(x)), 'gamma');
}

/**
 * Log of factorial n!
 */
export function logFactorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) {
    throw new Error(`Factorial is defined for non-negative integers (received ${n}).`);
  }
  if (n === 0 || n === 1) return 0;
  return logGamma(n + 1);
}

/**
 * Log of beta function B(a, b) = Gamma(a)Gamma(b)/Gamma(a+b)
 */
export function logBeta(a: number, b: number): number {
  if (a <= 0 || b <= 0) {
    throw new Error(`logBeta arguments must be positive (received a=${a}, b=${b}).`);
  }
  return logGamma(a) + logGamma(b) - logGamma(a + b);
}

/**
 * Cody's CALERF implementation for erf and erfc.
 * Reference: W. J. Cody, Math. Comp. 23 (1969), pp. 631-638 / Netlib specfun/erf.
 * Achieves exact IEEE 754 double precision (~1e-16 relative error) everywhere.
 */
const SQRPI = 5.6418958354775628695e-1;
const THRESH = 0.46875;
const SIXTEN = 16.0;

const CALERF_A = [
  3.16112374387056560e0,
  1.13864154151050156e2,
  3.77485237685302021e2,
  3.20937758913846947e3,
  1.85777706184603153e-1,
];
const CALERF_B = [
  2.36012909523441209e1,
  2.44024637934444173e2,
  1.28261652607737228e3,
  2.84423683343917062e3,
];

const CALERF_C = [
  5.64188496988670089e-1,
  8.88314979438837594e0,
  6.61191906371416295e1,
  2.98635138197400131e2,
  8.81952221241769090e2,
  1.71204761263407058e3,
  2.05107837782607147e3,
  1.23033935479799725e3,
  2.15311535474403846e-8,
];
const CALERF_D = [
  1.57449261107098347e1,
  1.17693950891312499e2,
  5.37181101862009858e2,
  1.62138957456669019e3,
  3.29079923573345963e3,
  4.36261909014324716e3,
  3.43936767414372164e3,
  1.23033935480374942e3,
];

const CALERF_P = [
  3.05326634961232344e-1,
  3.60344899949804439e-1,
  1.25781726111229246e-1,
  1.60837851487422766e-2,
  6.58749161529837803e-4,
  1.63153871373020978e-2,
];
const CALERF_Q = [
  2.56852019228982242e0,
  1.87295284992346047e0,
  5.27905102951428412e-1,
  6.05183413124413191e-2,
  2.33520497626869185e-3,
];

export function erf(arg: number): number {
  validateFiniteNumber(arg, 'erf input');
  const y = Math.abs(arg);
  if (y <= THRESH) {
    const ysq = y * y;
    let xnum = CALERF_A[4] * ysq;
    let xden = ysq;
    for (let i = 0; i < 3; i++) {
      xnum = (xnum + CALERF_A[i]) * ysq;
      xden = (xden + CALERF_B[i]) * ysq;
    }
    const res = arg * (xnum + CALERF_A[3]) / (xden + CALERF_B[3]);
    return assertValidNumber(res, 'erf');
  }
  const c = erfc(y);
  const res = arg >= 0 ? 1 - c : c - 1;
  return assertValidNumber(res, 'erf');
}

export function erfc(arg: number): number {
  validateFiniteNumber(arg, 'erfc input');
  const y = Math.abs(arg);

  if (y <= THRESH) {
    const ysq = y * y;
    let xnum = CALERF_A[4] * ysq;
    let xden = ysq;
    for (let i = 0; i < 3; i++) {
      xnum = (xnum + CALERF_A[i]) * ysq;
      xden = (xden + CALERF_B[i]) * ysq;
    }
    const resErf = y * (xnum + CALERF_A[3]) / (xden + CALERF_B[3]);
    const res = arg >= 0 ? 1 - resErf : 1 + resErf;
    return assertValidNumber(res, 'erfc');
  }

  if (y <= 4.0) {
    let xnum = CALERF_C[8] * y;
    let xden = y;
    for (let i = 0; i < 7; i++) {
      xnum = (xnum + CALERF_C[i]) * y;
      xden = (xden + CALERF_D[i]) * y;
    }
    let res = (xnum + CALERF_C[7]) / (xden + CALERF_D[7]);
    const ysq = Math.floor(y * SIXTEN) / SIXTEN;
    const del = (y - ysq) * (y + ysq);
    res = Math.exp(-ysq * ysq) * Math.exp(-del) * res;
    return assertValidNumber(arg >= 0 ? res : 2 - res, 'erfc');
  }

  // y > 4.0
  if (y >= 26.543) {
    return arg >= 0 ? 0 : 2;
  }

  const ysq = 1.0 / (y * y);
  let xnum = CALERF_P[5] * ysq;
  let xden = ysq;
  for (let i = 0; i < 4; i++) {
    xnum = (xnum + CALERF_P[i]) * ysq;
    xden = (xden + CALERF_Q[i]) * ysq;
  }
  let res = ysq * (xnum + CALERF_P[4]) / (xden + CALERF_Q[4]);
  res = (SQRPI - res) / y;
  const ysqInt = Math.floor(y * SIXTEN) / SIXTEN;
  const del = (y - ysqInt) * (y + ysqInt);
  res = Math.exp(-ysqInt * ysqInt) * Math.exp(-del) * res;
  return assertValidNumber(arg >= 0 ? res : 2 - res, 'erfc');
}

/**
 * Standard Normal cumulative distribution function Φ(z) = P(Z <= z).
 */
export function standardNormalCdf(z: number): number {
  validateFiniteNumber(z, 'standardNormalCdf input');
  if (z <= -38) return 0;
  if (z >= 38) return 1;

  if (z < 0) {
    const res = 0.5 * erfc(-z / Math.SQRT2);
    return Math.max(0, Math.min(1, assertValidNumber(res, 'standardNormalCdf')));
  } else {
    const res = 1 - 0.5 * erfc(z / Math.SQRT2);
    return Math.max(0, Math.min(1, assertValidNumber(res, 'standardNormalCdf')));
  }
}

/**
 * Standard Normal Survival Function: P(Z > z) = 1 - Φ(z).
 * Accurate in the extreme upper tail without catastrophic cancellation.
 */
export function standardNormalSf(z: number): number {
  validateFiniteNumber(z, 'standardNormalSf input');
  if (z >= 38) return 0;
  if (z <= -38) return 1;

  if (z >= 0) {
    const res = 0.5 * erfc(z / Math.SQRT2);
    return Math.max(0, Math.min(1, assertValidNumber(res, 'standardNormalSf')));
  } else {
    const res = 1 - 0.5 * erfc(-z / Math.SQRT2);
    return Math.max(0, Math.min(1, assertValidNumber(res, 'standardNormalSf')));
  }
}

/**
 * Standard Normal Quantile Function Φ^(-1)(p) with Acklam approximation
 * followed by Halley's rational refinement to reach machine precision (~1e-15).
 */
export function standardNormalQuantile(p: number): number {
  if (p <= 0 || p >= 1) {
    throw new Error(`Quantile probability p must be strictly between 0 and 1 (received ${p}).`);
  }

  // Acklam rational coefficients
  const a = [
    -3.969683028665376e1,
    2.209460984245205e2,
    -2.759285104469687e2,
    1.38357751867269e2,
    -3.066479806614716e1,
    2.506628277459239,
  ];

  const b = [
    -5.447609879822406e1,
    1.615858368580409e2,
    -1.556989798598866e2,
    6.680131188771972e1,
    -1.328068155288572e1,
  ];

  const c = [
    -7.784894002430293e-3,
    -3.223964580411365e-1,
    -2.400758277161838,
    -2.549732539343734,
    4.374664141464968,
    2.938163982698783,
  ];

  const d = [
    7.784695709041462e-3,
    3.224671290700398e-1,
    2.445134137142996,
    3.754408661907416,
  ];

  const pLow = 0.02425;
  const pHigh = 1 - pLow;

  let x: number;
  if (p < pLow) {
    const q = Math.sqrt(-2 * Math.log(p));
    x = ((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5];
    x /= (((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1;
  } else if (p <= pHigh) {
    const q = p - 0.5;
    const r = q * q;
    x = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q;
    x /= (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  } else {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    x = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]);
    x /= (((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1;
  }

  // Refine via 2 steps of Halley's method
  for (let i = 0; i < 2; i++) {
    const err = standardNormalCdf(x) - p;
    const pdf = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
    if (pdf === 0) break;
    const delta = err / (pdf + 0.5 * x * err);
    x -= delta;
    if (Math.abs(delta) < 1e-15) break;
  }

  return assertValidNumber(x, 'standardNormalQuantile');
}

/**
 * Regularized lower incomplete gamma P(a, x) = gamma(a, x) / Gamma(a)
 */
export function regularizedGammaP(a: number, x: number): number {
  if (x < 0 || a <= 0) {
    throw new Error(`regularizedGammaP invalid arguments a=${a}, x=${x}`);
  }
  if (x === 0) return 0;

  if (x < a + 1) {
    let sum = 1 / a;
    let term = 1 / a;
    for (let n = 1; n < 300; n++) {
      term *= x / (a + n);
      sum += term;
      if (Math.abs(term) < Math.abs(sum) * 1e-16) break;
    }
    const logP = -x + a * Math.log(x) - logGamma(a);
    const res = sum * Math.exp(logP);
    return Math.min(1, Math.max(0, assertValidNumber(res, 'regularizedGammaP')));
  } else {
    return Math.min(1, Math.max(0, 1 - regularizedGammaQ(a, x)));
  }
}

/**
 * Regularized upper incomplete gamma Q(a, x) = Gamma(a, x) / Gamma(a)
 */
export function regularizedGammaQ(a: number, x: number): number {
  if (x < 0 || a <= 0) {
    throw new Error(`regularizedGammaQ invalid arguments a=${a}, x=${x}`);
  }
  if (x === 0) return 1;

  if (x < a + 1) {
    return Math.min(1, Math.max(0, 1 - regularizedGammaP(a, x)));
  }

  // Lentz continued fraction
  let b = x + 1 - a;
  let c = 1 / 1e-30;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i < 300; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = b + an / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 1e-16) break;
  }
  const logTerm = -x + a * Math.log(x) - logGamma(a);
  const q = Math.exp(logTerm) * h;
  return Math.min(1, Math.max(0, assertValidNumber(q, 'regularizedGammaQ')));
}

/**
 * Regularized incomplete beta function I_x(a, b).
 * Accurate to ~1e-15 using modified Lentz's continued fraction.
 */
export function regularizedIncompleteBeta(x: number, a: number, b: number): number {
  if (x < 0 || x > 1 || a <= 0 || b <= 0) {
    throw new Error(`regularizedIncompleteBeta invalid args: x=${x}, a=${a}, b=${b}`);
  }
  if (x === 0) return 0;
  if (x === 1) return 1;

  // Symmetry relation if x > (a + 1) / (a + b + 2)
  if (x > (a + 1) / (a + b + 2)) {
    return 1 - regularizedIncompleteBeta(1 - x, b, a);
  }

  const factor = Math.exp(
    a * Math.log(x) + b * Math.log(1 - x) - logBeta(a, b)
  ) / a;

  const maxIterations = 300;
  let c = 1.0;
  let d = 1.0 - (a + b) * x / (a + 1.0);
  if (Math.abs(d) < 1e-30) d = 1e-30;
  d = 1.0 / d;
  let h = d;

  for (let m = 1; m <= maxIterations; m++) {
    const m2 = 2 * m;
    let numerator = m * (b - m) * x / ((a + m2 - 1.0) * (a + m2));
    d = 1.0 + numerator * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1.0 + numerator / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1.0 / d;
    h *= d * c;

    numerator = - (a + m) * (a + b + m) * x / ((a + m2) * (a + m2 + 1.0));
    d = 1.0 + numerator * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1.0 + numerator / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1.0 / d;
    const delta = d * c;
    h *= delta;

    if (Math.abs(delta - 1.0) < 1e-16) break;
  }

  const res = factor * h;
  return Math.min(1, Math.max(0, assertValidNumber(res, 'regularizedIncompleteBeta')));
}
