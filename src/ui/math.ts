import katex from 'katex';

/**
 * Renders a LaTeX string into KaTeX HTML.
 * Never throws; falls back to raw text if syntax is somehow invalid.
 */
export function renderLatex(latex: string, displayMode = false): string {
  try {
    return katex.renderToString(latex, {
      throwOnError: false,
      displayMode,
    });
  } catch {
    return `<span class="math-fallback">${latex}</span>`;
  }
}

/**
 * Converts ASCII math strings (<=, >=, mu, sigma^2, e^t, etc.) to proper LaTeX.
 */
export function asciiToLatex(text: string): string {
  if (!text) return '';

  let res = text.trim();

  // Common replacements
  res = res.replace(/<=/g, '\\le ');
  res = res.replace(/>=/g, '\\ge ');
  res = res.replace(/!=/g, '\\ne ');

  // Symbols
  res = res.replace(/\bsigma\^2\b/g, '\\sigma^2');
  res = res.replace(/\bsigma\b/g, '\\sigma');
  res = res.replace(/\bmu\b/g, '\\mu');
  res = res.replace(/\blambda\b/g, '\\lambda');
  res = res.replace(/\balpha\b/g, '\\alpha');
  res = res.replace(/\bgamma_1\b/g, '\\gamma_1');
  res = res.replace(/\bgamma_2\b/g, '\\gamma_2');
  res = res.replace(/\be\^t\b/g, 'e^t');
  res = res.replace(/\be\^\{?t\}?\b/g, 'e^t');
  res = res.replace(/\bM_X\(t\)/g, 'M_X(t)');
  res = res.replace(/\bPhi\(/g, '\\Phi(');

  return res;
}

/**
 * Formats a mathematical formula or expression into KaTeX HTML.
 */
export function formatMathExpression(expr: string, displayMode = false): string {
  if (!expr) return '';

  let clean = expr.trim();

  // Clean textbook representations of distributions in step results
  clean = clean.replace(
    /Binomial\(size\s*n\s*=\s*(\d+),\s*prob\s*p\s*=\s*([0-9.]+)\)/i,
    '\\text{Binomial}(n = $1, p = $2)'
  );
  clean = clean.replace(
    /Normal\(mean\s*mu\s*=\s*([0-9.-]+),\s*sd\s*sigma\s*=\s*([0-9.]+)\)/i,
    '\\text{Normal}(\\mu = $1, \\sigma = $2)'
  );
  clean = clean.replace(/Poisson\(lambda\s*=\s*([0-9.]+)\)/i, '\\text{Poisson}(\\lambda = $1)');
  clean = clean.replace(
    /Exponential\(rate\s*lambda\s*=\s*([0-9.]+)\)/i,
    '\\text{Exponential}(\\lambda = $1)'
  );
  clean = clean.replace(
    /Gamma\(shape\s*alpha\s*=\s*([0-9.]+),\s*rate\s*lambda\s*=\s*([0-9.]+)\)/i,
    '\\text{Gamma}(\\alpha = $1, \\lambda = $2)'
  );
  clean = clean.replace(
    /Weibull\(shape\s*k\s*=\s*([0-9.]+),\s*scale\s*lambda\s*=\s*([0-9.]+)\)/i,
    '\\text{Weibull}(k = $1, \\lambda = $2)'
  );

  const latex = asciiToLatex(clean);
  return renderLatex(latex, displayMode);
}
