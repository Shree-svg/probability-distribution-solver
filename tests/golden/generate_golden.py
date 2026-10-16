#!/usr/bin/env python3
"""
Generate golden test cases using scipy.stats across all six distributions:
- Binomial (size, prob)
- Poisson (lambda)
- Normal (mean, sd)
- Exponential (rate)
- Gamma (shape, rate)
- Weibull (shape, scale)

Functions tested:
- pmf / pdf
- cdf
- sf
- quantile (ppf)
- mean
- variance
- skewness
- kurtosis (excess kurtosis)
- median
"""

import json
import math
import os
import random
import numpy as np
import scipy.stats as stats

# Set fixed seed for deterministic reproducibility
random.seed(42)
np.random.seed(42)

cases = []

def add_case(dist_type, params, func, expected, arg=None):
    if expected is None or math.isnan(expected) or math.isinf(expected):
        return
    cases.append({
        "dist": dist_type,
        "params": params,
        "func": func,
        "arg": arg,
        "expected": float(expected)
    })

# ==========================================
# 1. NORMAL DISTRIBUTION
# ==========================================
def gen_normal():
    # Edge case parameter configs
    configs = [
        {"mean": 0.0, "sd": 1.0},
        {"mean": 0.0, "sd": 1e-6}, # edge case: sigma = 1e-6
        {"mean": 100.0, "sd": 0.001},
        {"mean": -50.0, "sd": 15.0},
        {"mean": 10.0, "sd": 2.0},
        {"mean": 1e5, "sd": 500.0},
    ]
    # Random configs
    for _ in range(35):
        m = random.uniform(-100, 100)
        s = 10 ** random.uniform(-4, 3)
        configs.append({"mean": m, "sd": s})

    for cfg in configs:
        m, s = cfg["mean"], cfg["sd"]
        d = stats.norm(loc=m, scale=s)
        # Moments & summary stats
        add_case("normal", cfg, "mean", d.mean())
        add_case("normal", cfg, "variance", d.var())
        add_case("normal", cfg, "skewness", float(d.stats(moments='s')))
        add_case("normal", cfg, "kurtosis", float(d.stats(moments='k'))) # excess kurtosis = 0
        add_case("normal", cfg, "median", d.median())

        # Specific evaluation points including extreme tails z = +/- 8
        test_x = [
            m, m + s, m - s, m + 1.96 * s, m - 1.96 * s,
            m + 3 * s, m - 3 * s, m + 5 * s, m - 5 * s,
            m + 8 * s, m - 8 * s, # extreme tails z = +/- 8
        ]
        # random points
        test_x.extend(m + s * np.random.uniform(-4, 4, 6))

        for x in test_x:
            add_case("normal", cfg, "pdf", d.pdf(x), arg=float(x))
            add_case("normal", cfg, "cdf", d.cdf(x), arg=float(x))
            add_case("normal", cfg, "sf", d.sf(x), arg=float(x))

        # Quantiles (avoiding 0 and 1 because normal is unbounded)
        test_p = [1e-6, 1e-4, 0.001, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 0.75, 0.9, 0.95, 0.975, 0.99, 0.999, 1 - 1e-4, 1 - 1e-6]
        test_p.extend(np.random.uniform(0.001, 0.999, 6))
        for p in test_p:
            add_case("normal", cfg, "quantile", d.ppf(p), arg=float(p))

# ==========================================
# 2. BINOMIAL DISTRIBUTION
# ==========================================
def gen_binomial():
    configs = [
        {"size": 1, "prob": 0.5},       # edge: n=1
        {"size": 1, "prob": 0.0},       # edge: p=0
        {"size": 1, "prob": 1.0},       # edge: p=1
        {"size": 10, "prob": 0.5},
        {"size": 10, "prob": 0.0},      # edge: p=0
        {"size": 10, "prob": 1.0},      # edge: p=1
        {"size": 20, "prob": 0.3},
        {"size": 100, "prob": 0.01},
        {"size": 1000, "prob": 0.5},
        {"size": 100000, "prob": 0.0001}, # edge: n=100000
        {"size": 100000, "prob": 0.5},    # edge: n=100000
    ]
    for _ in range(30):
        n = random.choice([1, 2, 5, 10, 20, 50, 100, 500, 1000, 5000, 20000])
        p = random.choice([0.0, 1.0, random.uniform(0.001, 0.999)])
        configs.append({"size": n, "prob": p})

    for cfg in configs:
        n, p = cfg["size"], cfg["prob"]
        d = stats.binom(n, p)
        mean_val = float(d.mean())
        var_val = float(d.var())
        add_case("binomial", cfg, "mean", mean_val)
        add_case("binomial", cfg, "variance", var_val)
        skew = float(d.stats(moments='s')) if var_val > 1e-14 else 0.0
        kurt = float(d.stats(moments='k')) if var_val > 1e-14 else 0.0
        add_case("binomial", cfg, "skewness", skew)
        add_case("binomial", cfg, "kurtosis", kurt)
        add_case("binomial", cfg, "median", float(d.median()))

        # Evaluation points on boundaries and random
        test_x = [-1, 0, 1, int(n * p), n - 1, n, n + 1]
        if n > 10:
            test_x.extend([int(n * 0.25), int(n * 0.75)])
        test_x = sorted(list(set(test_x)))

        for x in test_x:
            add_case("binomial", cfg, "pmf", d.pmf(x), arg=int(x))
            add_case("binomial", cfg, "cdf", d.cdf(x), arg=float(x))
            add_case("binomial", cfg, "sf", d.sf(x), arg=float(x))

        # Quantiles including edge cases p=0 and p=1
        test_p = [0.0, 1e-5, 0.01, 0.1, 0.25, 0.5, 0.75, 0.9, 0.99, 1 - 1e-5, 1.0]
        test_p.extend(np.random.uniform(0.001, 0.999, 4))
        for prob_val in test_p:
            val = float(d.ppf(prob_val))
            if prob_val == 0.0:
                val = max(0.0, val) # R convention: qbinom(0) = 0
            add_case("binomial", cfg, "quantile", val, arg=float(prob_val))

# ==========================================
# 3. POISSON DISTRIBUTION
# ==========================================
def gen_poisson():
    configs = [
        {"lambda": 0.001}, # edge: lambda = 0.001
        {"lambda": 0.05},
        {"lambda": 0.5},
        {"lambda": 1.0},
        {"lambda": 3.0},
        {"lambda": 10.0},
        {"lambda": 50.0},
        {"lambda": 200.0},
        {"lambda": 1000.0}, # edge: lambda = 1000
    ]
    for _ in range(30):
        l = 10 ** random.uniform(-3, 3)
        configs.append({"lambda": l})

    for cfg in configs:
        l = cfg["lambda"]
        d = stats.poisson(mu=l)
        add_case("poisson", cfg, "mean", float(d.mean()))
        add_case("poisson", cfg, "variance", float(d.var()))
        add_case("poisson", cfg, "skewness", float(d.stats(moments='s')))
        add_case("poisson", cfg, "kurtosis", float(d.stats(moments='k')))
        add_case("poisson", cfg, "median", float(d.median()))

        # Evaluation points
        test_x = [-1, 0, 1, int(l), int(l + math.sqrt(l)), int(l + 3 * math.sqrt(l))]
        test_x = sorted(list(set(test_x)))

        for x in test_x:
            add_case("poisson", cfg, "pmf", d.pmf(x), arg=int(x))
            add_case("poisson", cfg, "cdf", d.cdf(x), arg=float(x))
            add_case("poisson", cfg, "sf", d.sf(x), arg=float(x))

        # Quantiles (p=0 is 0; p=1 is unbounded)
        test_p = [0.0, 1e-4, 0.01, 0.05, 0.25, 0.5, 0.75, 0.9, 0.95, 0.99, 0.999]
        for prob_val in test_p:
            val = float(d.ppf(prob_val))
            if prob_val == 0.0:
                val = max(0.0, val) # R convention: qpois(0) = 0
            add_case("poisson", cfg, "quantile", val, arg=float(prob_val))

# ==========================================
# 4. EXPONENTIAL DISTRIBUTION
# ==========================================
def gen_exponential():
    configs = [
        {"rate": 0.001}, # edge: lambda = 0.001
        {"rate": 0.05},
        {"rate": 0.5},
        {"rate": 1.0},
        {"rate": 2.0},
        {"rate": 10.0},
        {"rate": 100.0},
        {"rate": 1000.0}, # edge: lambda = 1000
    ]
    for _ in range(30):
        r = 10 ** random.uniform(-3, 3)
        configs.append({"rate": r})

    for cfg in configs:
        rate = cfg["rate"]
        scale = 1.0 / rate
        d = stats.expon(scale=scale)

        add_case("exponential", cfg, "mean", float(d.mean()))
        add_case("exponential", cfg, "variance", float(d.var()))
        add_case("exponential", cfg, "skewness", float(d.stats(moments='s')))
        add_case("exponential", cfg, "kurtosis", float(d.stats(moments='k'))) # 6.0
        add_case("exponential", cfg, "median", float(d.median()))

        # Evaluation points (including boundaries x < 0, x = 0, x > 0)
        test_x = [-1.0, 0.0, scale * 0.1, scale * 0.5, scale * 1.0, scale * 2.0, scale * 5.0, scale * 10.0]
        test_x.extend(np.random.exponential(scale, 4))
        for x in sorted(test_x):
            add_case("exponential", cfg, "pdf", d.pdf(x), arg=float(x))
            add_case("exponential", cfg, "cdf", d.cdf(x), arg=float(x))
            add_case("exponential", cfg, "sf", d.sf(x), arg=float(x))

        # Quantiles (p=0 is 0; p=1 is unbounded)
        test_p = [0.0, 1e-5, 0.01, 0.05, 0.1, 0.25, 0.5, 0.75, 0.9, 0.95, 0.99, 0.999]
        for p in test_p:
            add_case("exponential", cfg, "quantile", float(d.ppf(p)), arg=float(p))

# ==========================================
# 5. GAMMA DISTRIBUTION
# ==========================================
def gen_gamma():
    configs = [
        {"shape": 0.2, "rate": 1.0}, # edge: shape < 1
        {"shape": 0.5, "rate": 2.0}, # edge: shape < 1
        {"shape": 0.8, "rate": 0.5}, # edge: shape < 1
        {"shape": 1.0, "rate": 2.0}, # shape = 1 (exponential)
        {"shape": 1.5, "rate": 1.0}, # shape > 1
        {"shape": 2.0, "rate": 3.0},
        {"shape": 3.0, "rate": 2.0},
        {"shape": 5.0, "rate": 0.5},
        {"shape": 10.0, "rate": 0.1},
        {"shape": 50.0, "rate": 5.0},
    ]
    for _ in range(25):
        sh = 10 ** random.uniform(-1, 2)
        rt = 10 ** random.uniform(-2, 2)
        configs.append({"shape": sh, "rate": rt})

    for cfg in configs:
        shape, rate = cfg["shape"], cfg["rate"]
        scale = 1.0 / rate
        d = stats.gamma(a=shape, scale=scale)

        add_case("gamma", cfg, "mean", float(d.mean()))
        add_case("gamma", cfg, "variance", float(d.var()))
        add_case("gamma", cfg, "skewness", float(d.stats(moments='s')))
        add_case("gamma", cfg, "kurtosis", float(d.stats(moments='k')))
        add_case("gamma", cfg, "median", float(d.median()))

        # Evaluation points
        m = shape * scale
        test_x = [-1.0, 0.0 if shape >= 1 else 1e-4, m * 0.2, m * 0.5, m, m * 2.0, m * 4.0]
        test_x.extend(np.random.gamma(shape, scale, 4))
        for x in sorted(test_x):
            add_case("gamma", cfg, "pdf", d.pdf(x), arg=float(x))
            add_case("gamma", cfg, "cdf", d.cdf(x), arg=float(x))
            add_case("gamma", cfg, "sf", d.sf(x), arg=float(x))

        test_p = [0.0, 1e-4, 0.01, 0.05, 0.1, 0.25, 0.5, 0.75, 0.9, 0.95, 0.99, 0.999]
        for p in test_p:
            add_case("gamma", cfg, "quantile", float(d.ppf(p)), arg=float(p))

# ==========================================
# 6. WEIBULL DISTRIBUTION
# ==========================================
def gen_weibull():
    configs = [
        {"shape": 0.3, "scale": 1.0}, # edge: shape < 1
        {"shape": 0.5, "scale": 2.0}, # edge: shape < 1
        {"shape": 0.8, "scale": 0.5}, # edge: shape < 1
        {"shape": 1.0, "scale": 3.0}, # shape = 1 (exponential)
        {"shape": 1.5, "scale": 1.0}, # shape > 1
        {"shape": 2.0, "scale": 3.0}, # Rayleigh distribution
        {"shape": 3.5, "scale": 2.0}, # ~Normal shape
        {"shape": 5.0, "scale": 10.0},
    ]
    for _ in range(25):
        sh = 10 ** random.uniform(-1, 1.5)
        sc = 10 ** random.uniform(-2, 2)
        configs.append({"shape": sh, "scale": sc})

    for cfg in configs:
        shape, scale = cfg["shape"], cfg["scale"]
        d = stats.weibull_min(c=shape, scale=scale)

        add_case("weibull", cfg, "mean", float(d.mean()))
        add_case("weibull", cfg, "variance", float(d.var()))
        add_case("weibull", cfg, "skewness", float(d.stats(moments='s')))
        add_case("weibull", cfg, "kurtosis", float(d.stats(moments='k')))
        add_case("weibull", cfg, "median", float(d.median()))

        # Evaluation points
        m = scale * math.gamma(1 + 1 / shape)
        test_x = [-1.0, 0.0 if shape >= 1 else 1e-4, m * 0.2, m * 0.5, m, m * 2.0, m * 4.0]
        test_x.extend(np.random.weibull(shape, 4) * scale)
        for x in sorted(test_x):
            add_case("weibull", cfg, "pdf", d.pdf(x), arg=float(x))
            add_case("weibull", cfg, "cdf", d.cdf(x), arg=float(x))
            add_case("weibull", cfg, "sf", d.sf(x), arg=float(x))

        test_p = [0.0, 1e-4, 0.01, 0.05, 0.1, 0.25, 0.5, 0.75, 0.9, 0.95, 0.99, 0.999]
        for p in test_p:
            add_case("weibull", cfg, "quantile", float(d.ppf(p)), arg=float(p))

def main():
    gen_normal()
    gen_binomial()
    gen_poisson()
    gen_exponential()
    gen_gamma()
    gen_weibull()

    out_dir = os.path.dirname(os.path.abspath(__file__))
    out_file = os.path.join(out_dir, "golden.json")

    with open(out_file, "w") as f:
        json.dump(cases, f, indent=2)

    print(f"Generated {len(cases)} golden test cases in {out_file}")

if __name__ == "__main__":
    main()
