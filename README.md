# Distribution Solver

A probability distribution calculator and word-problem solver for exam practice.
Pick a distribution (or type a question), and get the answer, exam-style
step-by-step working, an interactive plot and ready-to-run base-R code.

## Features

- **Six distributions:** Binomial, Poisson, Normal, Exponential, Gamma, Weibull
- **Calculator mode:** enter parameters and choose P(X = x), P(X ≤ x), P(X ≥ x),
  P(a ≤ X ≤ b), quantiles, moments or the MGF
- **Ask-a-problem mode:** paste a worded question and the solver extracts the
  distribution, parameters and query
- **Step-by-step working** with formulas, substitution and result
- **Interactive charts** with the queried region shaded (PMF bars or PDF curve)
- **Runnable base-R script** for every solution, with a Copy and Download .R button
- **Summary statistics:** mean, variance, SD, skewness, excess kurtosis, median, mode, MGF
- **Practice variations** with randomised parameters and a question bank
- Light and dark themes, responsive layout

## How accuracy is ensured

The language-understanding layer only reads the question and extracts the
distribution, parameters and what is being asked. **A deterministic math engine does
all calculations**, and no result is hardcoded.

- Special functions implemented from scratch (log-gamma, error function,
  incomplete gamma and beta, inverse normal CDF)
- Engine tested against SciPy reference values plus property tests
  (PMFs sum to 1, CDFs are monotonic, quantile round-trips, distribution identities)
- Invalid input shows a validation message and never NaN or Infinity

## Parameterization (R convention)

| Distribution | Parameters |
|---|---|
| Binomial | size n, prob p |
| Poisson | λ |
| Normal | mean μ, sd σ |
| Exponential | rate λ |
| Gamma | shape α, rate λ |
| Weibull | shape k, scale λ |

## Getting started

```bash
git clone https://github.com/YOUR-USERNAME/distribution-solver.git
cd distribution-solver
npm install
npm run dev        # start the app
npm test           # run the test suite
```

Optional: copy `.env.example` to `.env` and add `GEMINI_API_KEY` to enable the
LLM-assisted question parser. Without it, the offline rule-based parser is used.
To cross-check the generated R scripts, install [R](https://www.r-project.org/)
so `Rscript` is available.

## Project structure

```
src/engine    math engine (distributions, special functions)
src/solver    question parser and step-by-step solver
src/rgen      R code generator
src/ui        interface
tests/        unit, golden and property tests
```

## Tech stack

TypeScript, Vite, Vitest, KaTeX, SVG charts, base R (generated scripts)

## License

MIT
