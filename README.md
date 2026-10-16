# Probability Distribution Solver

A Vite + TypeScript web app for solving probability-distribution questions in two ways:

- **Calculator mode**: choose a distribution, enter parameters, and run a specific query.
- **Ask-a-problem mode**: paste a worded question and let the parser detect the model/query before solving.

It is designed for exam-style practice and transparent working: you get formulas, substitutions, final values, plotted regions, and matching base-R code.

## Project overview

This project combines:

- A **deterministic TypeScript math engine** (core calculations)
- A **rule-based natural-language parser** (Layer A)
- An optional **Gemini-assisted parser** path (Layer B) for server/API usage
- A browser UI with charts, question bank, and worked steps

> The parser extracts structure. The local math engine computes results.

## Workflows

### 1) Calculator mode

Use when you already know the distribution and parameters.

1. Select one of the six distributions.
2. Enter parameters using R-style parameterization.
3. Choose a query type (probability, quantile, moments, etc.).
4. Solve to get step-by-step output, chart shading, and R code.

### 2) Ask-a-problem mode

Use for natural-language questions.

1. Paste a worded problem (for example: “at least”, “at most”, “between”, “mean”, “variance”).
2. Layer A parser maps the text to distribution + parameters + query.
3. The deterministic engine evaluates the parsed query.
4. If details are missing/ambiguous, the app returns a clarification message.

## Supported distributions and parameterization

All distributions follow R conventions used by the generated code.

| Distribution | Parameters | Constraints | Notes |
|---|---|---|---|
| Binomial | `size = n`, `prob = p` | `n` integer, `n >= 0`; `0 <= p <= 1` | Discrete |
| Poisson | `lambda` | `lambda > 0` | Discrete |
| Normal | `mean = mu`, `sd = sigma` | `sd > 0` | Continuous |
| Exponential | `rate = lambda` | `lambda > 0` | Continuous |
| Gamma | `shape = alpha`, `rate = lambda` | `shape > 0`, `rate > 0` | Continuous; if scale is given, parser converts `rate = 1/scale` |
| Weibull | `shape = k`, `scale = lambda` | `shape > 0`, `scale > 0` | Continuous; if rate is given, parser converts `scale = 1/rate` |

## Supported query types

- Point probability / density: `P(X = x)`
- Cumulative and tail probabilities: `P(X <= x)`, `P(X < x)`, `P(X >= x)`, `P(X > x)`
- Interval probability: `P(a <= X <= b)`
- Quantiles and cutoffs (including top/bottom percentile style prompts)
- Moments/statistics: mean, variance, standard deviation
- MGF evaluation at `t`
- Conditional survival style queries `P(X > s+t | X > s)`

## Features

- Six distributions: Binomial, Poisson, Normal, Exponential, Gamma, Weibull
- Two solving workflows: calculator + ask-a-problem
- Step-by-step derivations with formulas and substitutions
- Interactive SVG visualization with highlighted queried region
- Generated base-R script for each solution (copy/download)
- Summary metrics (mean, variance, SD, skewness, excess kurtosis, median, mode, MGF)
- Built-in question bank (**600 total; 100 per distribution**)
- Practice variations and responsive light/dark UI

## Practical usage examples

### Calculator-style queries

- Binomial: `n = 15, p = 0.8`, query `P(X >= 12)`
- Normal: `mu = 100, sigma = 15`, query `P(X <= 115)`
- Weibull: `shape = 2.5, scale = 100`, query “top 10% cutoff” (quantile)

### Ask-a-problem prompts

- “A basketball player takes 15 free throws with an 80% success rate. What is the probability of making at least 12 free throws?”
- “IQ scores are normally distributed with mean 100 and standard deviation 15. What is the probability of at most 115?”
- “A project duration follows a Gamma distribution with shape 4 and rate 0.8. What is the probability of completion between 2 and 6 weeks?”

## Accuracy and validation

The repository validates numerical safety and correctness through:

- **Finite-number guards** (`undefined`/`null`/`NaN`/`Infinity` rejected)
- Distribution parameter validation before evaluation
- Property tests (examples: PMF sums, CDF monotonicity, quantile round-trips, distribution identities)
- Golden/reference verification against SciPy-style benchmark data (`tests/golden/golden.json`)

Core special functions are implemented in TypeScript (for example `logGamma`, error-function/normal helpers, incomplete-gamma/beta-based routines), and calculations are executed locally by the engine.

## Setup

### Prerequisites

- **Node.js 18+** (recommended current LTS)
- **npm**
- Optional: **R** (`Rscript`) if you want to execute generated `.R` scripts

### Install and run

```bash
git clone https://github.com/Shree-svg/probability-distribution-solver.git
cd probability-distribution-solver
npm install
npm run dev
```

Open the local Vite URL shown in the terminal.

## Available npm scripts

- `npm run dev` — start Vite dev server
- `npm run build` — TypeScript check + production build
- `npm run preview` — preview built app
- `npm test` — run Vitest suite once
- `npm run test:watch` — run Vitest in watch mode

## Optional Gemini configuration

The UI works fully offline with **Layer A** (rule-based parser).  
If you want to use **Layer B (Gemini API)** in server/API workflows:

1. Copy environment template:
   ```bash
   cp .env.example .env
   ```
2. Set:
   - `GEMINI_API_KEY=...`
   - optional `PORT=3001`

The server helper is in `src/solver/server.ts` (`/api/health`, `/api/solve`) and falls back to Layer A when Gemini is unavailable.

## Using generated R code (optional)

The app can produce base-R code per solution. To run it locally:

1. Save the generated snippet/script to a `.R` file.
2. Execute with:
   ```bash
   Rscript your_file.R
   ```

## Directory layout

```text
probability-distribution-solver/
├── src/
│   ├── engine/          # Deterministic distribution math + validation
│   ├── solver/          # Layer A parser + optional Layer B/API server helper
│   ├── rgen/            # Base-R code/script generation
│   ├── data/            # Question bank data and access helpers
│   ├── ui/              # Browser app UI and rendering logic
│   ├── main.ts          # Frontend entry point
│   └── style.css
├── tests/               # Vitest suites (engine, solver, properties, validation)
│   └── golden/          # Golden benchmark datasets/references
├── scripts/             # Utility scripts (question generation/screenshot helpers)
├── package.json
├── .env.example
└── README.md
```

## Contributing / development

- Keep changes consistent with R parameterization conventions used by the engine/rgen.
- Run checks before opening a PR:

```bash
npm test
npm run build
```

- Add or update tests with behavior changes (engine, parser, or integration paths).

## License

MIT
