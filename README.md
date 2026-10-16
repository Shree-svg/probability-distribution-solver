# Distribution Solver

A probability distribution calculator and word-problem solver for exam practice built with Vite, TypeScript, and vanilla DOM. Pick a distribution (or type a question), and get high-precision answers, exam-style step-by-step working with formulas, interactive shaded SVG distribution plots, and runnable base-R code.

## Features

- **Six distributions:** Binomial, Poisson, Normal, Exponential, Gamma, Weibull
- **Calculator mode:** enter parameters and choose P(X = x), P(X ≤ x), P(X ≥ x), P(a ≤ X ≤ b), quantiles, moments, or the MGF
- **Ask-a-problem mode:** paste a worded question and the solver extracts the distribution, parameters, and query
- **Step-by-step working** with formulas, substitution, and evaluated result
- **Interactive SVG charts** with queried regions shaded (PMF bars or PDF curve) and hover inspection
- **Runnable base-R script** for every solution, with Copy and Download `.R` buttons
- **Summary statistics:** mean, variance, SD, skewness, excess kurtosis, median, mode, MGF
- **Practice variations & Question bank:** 100 questions per distribution with instant solution loading
- **Themes & Responsive layout:** Light and Obsidian Cypress dark theme, fully optimized for desktop and mobile

## How accuracy is ensured

The language-understanding layer only reads the question and extracts the distribution, parameters, and what is being asked. **A deterministic math engine does all calculations**, and no result is hardcoded.

- Special functions implemented from scratch (log-gamma, error function, incomplete gamma and beta, inverse normal CDF)
- Engine tested against SciPy reference values plus property tests (PMFs sum to 1, CDFs are monotonic, quantile round-trips, distribution identities)
- Invalid input shows a validation message and never NaN or Infinity

## Parameterization (R convention)

| Distribution | Parameters |
|---|---|
| Binomial | size $n$, prob $p$ |
| Poisson | $\lambda$ |
| Normal | mean $\mu$, sd $\sigma$ |
| Exponential | rate $\lambda$ |
| Gamma | shape $\alpha$, rate $\lambda$ |
| Weibull | shape $k$, scale $\lambda$ |

## Directory Layout

```
distribution-solver/
├── src/
│   ├── engine/       # Mathematical computations, distributions, CDF/PDF/quantile functions
│   ├── solver/       # Natural language & question parsing into distribution queries
│   ├── rgen/         # Base-R code generator matching R distribution conventions
│   ├── ui/           # Vanilla DOM UI components, input controls, and renderers
│   ├── data/         # 600-question practice database (100 per distribution)
│   ├── main.ts       # Application entry point
│   └── style.css     # UI styles and themes
├── tests/            # Vitest unit & integration test suites
│   └── golden/       # Golden test reference data and verification benchmarks
├── index.html        # Main HTML page
├── package.json      # Dependencies and npm scripts
├── tsconfig.json     # TypeScript configuration
└── README.md         # Project documentation and ground rules
```

## Getting started

```bash
git clone https://github.com/Shree-svg/probability-distribution-solver.git
cd probability-distribution-solver
npm install
npm run dev        # start the Vite dev server
npm test           # run Vitest test suite
npm run build      # compile production bundle
```

Optional: copy `.env.example` to `.env` and add `GEMINI_API_KEY` to enable the LLM-assisted question parser. Without it, the offline rule-based parser is used automatically.
To cross-check the generated R scripts, install [R](https://www.r-project.org/) so `Rscript` is available.

## Tech stack

TypeScript, Vite, Vitest, KaTeX, SVG charts, base R (generated scripts)

## License

MIT
