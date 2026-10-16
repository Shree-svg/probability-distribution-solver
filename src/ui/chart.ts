import {
  dbinom,
  dexp,
  dgamma,
  dnorm,
  dpois,
  dweibull,
  pbinom,
  pexp,
  pgamma,
  pnorm,
  ppois,
  pweibull,
  qexp,
  qgamma,
  qweibull,
  statsWeibull,
} from '../engine/distributions';
import type { DistributionParams } from '../engine/types';
import type { SolverQuery } from '../solver/types';
import { icons } from './icons';

export function renderInteractiveDistributionChart(
  dist: DistributionParams,
  query: SolverQuery,
  resultValue?: number
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'chart-card';

  const isDiscrete = dist.type === 'binomial' || dist.type === 'poisson';

  const header = document.createElement('div');
  header.className = 'chart-header';
  header.innerHTML = `
    <div class="chart-title-group">
      <span class="chart-icon">${isDiscrete ? icons.spreadsheet(18) : icons.sparkles(18)}</span>
      <div>
        <h4 class="chart-title">${isDiscrete ? 'Probability Mass Function (PMF)' : 'Probability Density Function (PDF)'}</h4>
        <span class="chart-subtitle">Shaded region illustrates the queried event • Hover to inspect values</span>
      </div>
    </div>
    <div class="chart-legend-badge">
      <span class="legend-color-box active"></span>
      <span class="legend-label">Queried Region (28%)</span>
      <span class="legend-color-box inactive"></span>
      <span class="legend-label">Distribution</span>
      <span class="legend-color-box mean-line-sample"></span>
      <span class="legend-label">Mean (μ)</span>
    </div>
  `;
  container.appendChild(header);

  const chartWrap = document.createElement('div');
  chartWrap.className = 'chart-canvas-wrap';

  const tooltip = document.createElement('div');
  tooltip.className = 'chart-tooltip';
  tooltip.style.display = 'none';
  chartWrap.appendChild(tooltip);

  const width = 680;
  const height = 300;
  const padLeft = 56; // Spec: left padding 56px so y-axis title never overlaps tick labels
  const padRight = 30;
  const padTop = 32;
  const padBottom = 48;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('class', 'dist-svg');

  const dims: ChartDimensions = {
    width,
    height,
    padLeft,
    padRight,
    padTop,
    padBottom,
    plotW,
    plotH,
    tooltip,
    chartWrap,
  };

  if (isDiscrete) {
    renderDiscreteChart(svg, dist, query, resultValue, dims);
  } else {
    renderContinuousChart(svg, dist, query, resultValue, dims);
  }

  chartWrap.appendChild(svg);
  container.appendChild(chartWrap);
  return container;
}

interface ChartDimensions {
  width: number;
  height: number;
  padLeft: number;
  padRight: number;
  padTop: number;
  padBottom: number;
  plotW: number;
  plotH: number;
  tooltip: HTMLElement;
  chartWrap: HTMLElement;
}

function getDistributionMean(dist: DistributionParams): number {
  switch (dist.type) {
    case 'binomial':
      return dist.params.size * dist.params.prob;
    case 'poisson':
      return dist.params.lambda;
    case 'normal':
      return dist.params.mean;
    case 'exponential':
      return 1 / dist.params.rate;
    case 'gamma':
      return dist.params.shape / dist.params.rate;
    case 'weibull':
      return statsWeibull(dist.params).mean;
  }
}

function renderDiscreteChart(
  svg: SVGSVGElement,
  dist: DistributionParams,
  query: SolverQuery,
  resultValue: number | undefined,
  dims: ChartDimensions
) {
  let minK = 0;
  let maxK = 10;

  if (dist.type === 'binomial') {
    const n = dist.params.size;
    if (n <= 30) {
      minK = 0;
      maxK = n;
    } else {
      const mu = n * dist.params.prob;
      const sigma = Math.sqrt(n * dist.params.prob * (1 - dist.params.prob));
      minK = Math.max(0, Math.floor(mu - 3.8 * sigma));
      maxK = Math.min(n, Math.ceil(mu + 3.8 * sigma));
    }
  } else if (dist.type === 'poisson') {
    const l = dist.params.lambda;
    const sigma = Math.sqrt(l);
    minK = Math.max(0, Math.floor(l - 3.5 * sigma));
    maxK = Math.max(12, Math.ceil(l + 4 * sigma));
  }

  const kValues: number[] = [];
  for (let k = minK; k <= maxK; k++) {
    kValues.push(k);
  }

  const probs = kValues.map((k) => {
    if (dist.type === 'binomial') return dbinom(k, dist.params.size, dist.params.prob);
    if (dist.type === 'poisson') return dpois(k, dist.params.lambda);
    return 0;
  });

  const maxProb = Math.max(...probs, 0.05) * 1.15;

  // Grid lines
  renderGrid(svg, dims, maxProb, 'P(X = x)');

  const numBars = kValues.length;
  const barGap = numBars > 20 ? 2 : 4;
  const barW = Math.max(4, Math.min(36, (dims.plotW - barGap * (numBars - 1)) / numBars));
  const totalBarsW = numBars * barW + (numBars - 1) * barGap;
  const startX = dims.padLeft + (dims.plotW - totalBarsW) / 2;

  // Render bars
  kValues.forEach((k, idx) => {
    const p = probs[idx];
    const isHighlighted = isDiscreteHighlighted(k, query, resultValue);
    const barH = (p / maxProb) * dims.plotH;
    const xPos = startX + idx * (barW + barGap);
    const yPos = dims.padTop + (dims.plotH - barH);

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', String(xPos));
    rect.setAttribute('y', String(yPos));
    rect.setAttribute('width', String(barW));
    rect.setAttribute('height', String(Math.max(2, barH)));
    rect.setAttribute('rx', '3');

    // Curve/bars in accent teal 2.5px, queried region teal at 28% opacity, non-queried bars at 25% opacity
    if (isHighlighted) {
      rect.setAttribute('fill', 'var(--accent)');
      rect.setAttribute('fill-opacity', '0.28');
      rect.setAttribute('stroke', 'var(--accent)');
      rect.setAttribute('stroke-width', '2.5');
    } else {
      rect.setAttribute('fill', 'var(--accent)');
      rect.setAttribute('fill-opacity', '0.07');
      rect.setAttribute('stroke', 'var(--muted)');
      rect.setAttribute('stroke-opacity', '0.25');
      rect.setAttribute('stroke-width', '1');
    }

    rect.setAttribute('class', `chart-bar ${isHighlighted ? 'bar-queried' : 'bar-unqueried'}`);

    // Tooltip event listeners
    rect.addEventListener('mouseenter', (e) => {
      let cumP = 0;
      if (dist.type === 'binomial') cumP = pbinom(k, dist.params.size, dist.params.prob);
      if (dist.type === 'poisson') cumP = ppois(k, dist.params.lambda);

      dims.tooltip.style.display = 'block';
      dims.tooltip.innerHTML = `
        <div class="tooltip-header">Outcome <strong>k = ${k}</strong></div>
        <div class="tooltip-row"><span>P(X = ${k}):</span> <strong>${p.toFixed(5)}</strong></div>
        <div class="tooltip-row"><span>P(X ≤ ${k}):</span> <strong>${cumP.toFixed(5)}</strong></div>
        ${
          isHighlighted
            ? '<div class="tooltip-tag tag-active">In Query Region</div>'
            : '<div class="tooltip-tag tag-inactive">Outside Region</div>'
        }
      `;
      positionTooltip(dims.tooltip, dims.chartWrap, e);
    });

    rect.addEventListener('mousemove', (e) => {
      positionTooltip(dims.tooltip, dims.chartWrap, e);
    });

    rect.addEventListener('mouseleave', () => {
      dims.tooltip.style.display = 'none';
    });

    svg.appendChild(rect);

    // X Axis Tick Label
    const stepLabel = Math.ceil(numBars / 15);
    if (numBars <= 20 || idx % stepLabel === 0 || idx === numBars - 1) {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', String(xPos + barW / 2));
      text.setAttribute('y', String(dims.height - 18));
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('class', 'chart-axis-text');
      text.textContent = String(k);
      svg.appendChild(text);
    }
  });

  // Dashed amber mean line
  const meanVal = getDistributionMean(dist);
  if (meanVal >= minK && meanVal <= maxK) {
    const meanNorm = (meanVal - minK) / Math.max(1, maxK - minK);
    const meanX = startX + meanNorm * totalBarsW;

    const meanLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    meanLine.setAttribute('x1', String(meanX));
    meanLine.setAttribute('x2', String(meanX));
    meanLine.setAttribute('y1', String(dims.padTop));
    meanLine.setAttribute('y2', String(dims.padTop + dims.plotH));
    meanLine.setAttribute('stroke', 'var(--highlight)');
    meanLine.setAttribute('stroke-width', '2');
    meanLine.setAttribute('stroke-dasharray', '4,4');
    meanLine.setAttribute('class', 'chart-mean-line');
    svg.appendChild(meanLine);

    const meanLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    meanLabel.setAttribute('x', String(meanX));
    meanLabel.setAttribute('y', String(dims.padTop - 8));
    meanLabel.setAttribute('text-anchor', 'middle');
    meanLabel.setAttribute('class', 'chart-mean-label');
    meanLabel.textContent = `μ = ${meanVal.toFixed(2)}`;
    svg.appendChild(meanLabel);
  }

  // X Axis Label
  const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  xLabel.setAttribute('x', String(dims.padLeft + dims.plotW / 2));
  xLabel.setAttribute('y', String(dims.height - 4));
  xLabel.setAttribute('text-anchor', 'middle');
  xLabel.setAttribute('class', 'chart-axis-label');
  xLabel.textContent = 'Number of Events / Successes (x)';
  svg.appendChild(xLabel);
}

function renderContinuousChart(
  svg: SVGSVGElement,
  dist: DistributionParams,
  query: SolverQuery,
  resultValue: number | undefined,
  dims: ChartDimensions
) {
  let minX = 0;
  let maxX = 10;

  if (dist.type === 'normal') {
    minX = dist.params.mean - 4 * dist.params.sd;
    maxX = dist.params.mean + 4 * dist.params.sd;
  } else if (dist.type === 'exponential') {
    minX = 0;
    maxX = qexp(0.998, dist.params.rate);
  } else if (dist.type === 'gamma') {
    minX = 0;
    maxX = qgamma(0.998, dist.params.shape, dist.params.rate);
  } else if (dist.type === 'weibull') {
    minX = 0;
    maxX = qweibull(0.998, dist.params.shape, dist.params.scale);
  }

  const steps = 300;
  const dx = (maxX - minX) / steps;
  const points: Array<{ x: number; y: number; dens: number }> = [];

  let maxDens = 0.01;

  for (let i = 0; i <= steps; i++) {
    const xVal = minX + i * dx;
    let dens = 0;
    if (dist.type === 'normal') dens = dnorm(xVal, dist.params.mean, dist.params.sd);
    else if (dist.type === 'exponential') dens = dexp(xVal, dist.params.rate);
    else if (dist.type === 'gamma') dens = dgamma(xVal, dist.params.shape, dist.params.rate);
    else if (dist.type === 'weibull') dens = dweibull(xVal, dist.params.shape, dist.params.scale);

    if (Number.isFinite(dens) && dens > maxDens) {
      maxDens = dens;
    }
    points.push({ x: xVal, y: 0, dens });
  }

  maxDens *= 1.15;

  const toSvgX = (x: number) => dims.padLeft + ((x - minX) / (maxX - minX)) * dims.plotW;
  const toSvgY = (dens: number) => dims.padTop + (1 - dens / maxDens) * dims.plotH;

  points.forEach((pt) => {
    pt.y = toSvgY(pt.dens);
  });

  renderGrid(svg, dims, maxDens, 'Density f(x)');

  // 1. Shaded area under curve for requested region: teal at 28% opacity
  const shadePath = getContinuousShadePath(dist, query, resultValue, minX, maxX, toSvgX, toSvgY);
  if (shadePath) {
    const pathElem = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathElem.setAttribute('d', shadePath);
    pathElem.setAttribute('fill', 'var(--accent)');
    pathElem.setAttribute('fill-opacity', '0.28');
    pathElem.setAttribute('class', 'chart-shaded-region');
    svg.appendChild(pathElem);
  }

  // 2. Main continuous density curve: accent teal 2.5px
  let curveD = `M ${toSvgX(points[0].x)} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    curveD += ` L ${toSvgX(points[i].x)} ${points[i].y}`;
  }

  const curveElem = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  curveElem.setAttribute('d', curveD);
  curveElem.setAttribute('fill', 'none');
  curveElem.setAttribute('stroke', 'var(--accent)');
  curveElem.setAttribute('stroke-width', '2.5');
  curveElem.setAttribute('stroke-linecap', 'round');
  curveElem.setAttribute('stroke-linejoin', 'round');
  curveElem.setAttribute('class', 'chart-density-curve');
  svg.appendChild(curveElem);

  // 3. Dashed amber mean line
  const meanVal = getDistributionMean(dist);
  if (meanVal >= minX && meanVal <= maxX) {
    const meanSvgX = toSvgX(meanVal);
    const meanLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    meanLine.setAttribute('x1', String(meanSvgX));
    meanLine.setAttribute('x2', String(meanSvgX));
    meanLine.setAttribute('y1', String(dims.padTop));
    meanLine.setAttribute('y2', String(dims.padTop + dims.plotH));
    meanLine.setAttribute('stroke', 'var(--highlight)');
    meanLine.setAttribute('stroke-width', '2');
    meanLine.setAttribute('stroke-dasharray', '4,4');
    meanLine.setAttribute('class', 'chart-mean-line');
    svg.appendChild(meanLine);

    const meanLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    meanLabel.setAttribute('x', String(meanSvgX));
    meanLabel.setAttribute('y', String(dims.padTop - 8));
    meanLabel.setAttribute('text-anchor', 'middle');
    meanLabel.setAttribute('class', 'chart-mean-label');
    meanLabel.textContent = `μ = ${meanVal >= 100 ? meanVal.toFixed(1) : meanVal.toFixed(2)}`;
    svg.appendChild(meanLabel);
  }

  // 4. Vertical indicator line for cutoff / query x if applicable
  const queryX =
    query.x ?? (query.type === 'find_x_for_p' || query.type === 'quantile' ? resultValue : undefined);
  if (queryX !== undefined && queryX >= minX && queryX <= maxX && Math.abs(queryX - meanVal) > 0.01) {
    const markerX = toSvgX(queryX);
    const markerLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    markerLine.setAttribute('x1', String(markerX));
    markerLine.setAttribute('x2', String(markerX));
    markerLine.setAttribute('y1', String(dims.padTop));
    markerLine.setAttribute('y2', String(dims.padTop + dims.plotH));
    markerLine.setAttribute('stroke', 'var(--accent)');
    markerLine.setAttribute('stroke-width', '1.5');
    markerLine.setAttribute('stroke-dasharray', '3,3');
    svg.appendChild(markerLine);

    const pinLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    pinLabel.setAttribute('x', String(markerX));
    pinLabel.setAttribute('y', String(dims.padTop - 8));
    pinLabel.setAttribute('text-anchor', 'middle');
    pinLabel.setAttribute('class', 'chart-pin-label');
    pinLabel.textContent = `x = ${queryX.toFixed(2)}`;
    svg.appendChild(pinLabel);
  }

  // 5. X-Axis tick labels
  const numTicks = 6;
  for (let i = 0; i <= numTicks; i++) {
    const val = minX + (i / numTicks) * (maxX - minX);
    const xPos = toSvgX(val);
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', String(xPos));
    text.setAttribute('y', String(dims.height - 18));
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('class', 'chart-axis-text');
    text.textContent = val >= 100 || val <= -100 ? Math.round(val).toString() : val.toFixed(1);
    svg.appendChild(text);
  }

  // X Axis Title
  const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  xLabel.setAttribute('x', String(dims.padLeft + dims.plotW / 2));
  xLabel.setAttribute('y', String(dims.height - 4));
  xLabel.setAttribute('text-anchor', 'middle');
  xLabel.setAttribute('class', 'chart-axis-label');
  xLabel.textContent = 'Random Variable (x)';
  svg.appendChild(xLabel);

  // 6. Interactive Crosshair & Tooltip Overlay
  const crosshairLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  crosshairLine.setAttribute('y1', String(dims.padTop));
  crosshairLine.setAttribute('y2', String(dims.padTop + dims.plotH));
  crosshairLine.setAttribute('stroke', 'var(--accent)');
  crosshairLine.setAttribute('stroke-dasharray', '3,3');
  crosshairLine.setAttribute('stroke-width', '1.5');
  crosshairLine.style.display = 'none';
  svg.appendChild(crosshairLine);

  const trackerPoint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  trackerPoint.setAttribute('r', '5');
  trackerPoint.setAttribute('fill', 'var(--accent)');
  trackerPoint.setAttribute('stroke', 'var(--surface)');
  trackerPoint.setAttribute('stroke-width', '2');
  trackerPoint.style.display = 'none';
  svg.appendChild(trackerPoint);

  const overlay = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  overlay.setAttribute('x', String(dims.padLeft));
  overlay.setAttribute('y', String(dims.padTop));
  overlay.setAttribute('width', String(dims.plotW));
  overlay.setAttribute('height', String(dims.plotH));
  overlay.setAttribute('fill', 'transparent');
  overlay.style.cursor = 'crosshair';

  overlay.addEventListener('mousemove', (e) => {
    const rect = svg.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * dims.width;
    if (svgX < dims.padLeft || svgX > dims.padLeft + dims.plotW) {
      crosshairLine.style.display = 'none';
      trackerPoint.style.display = 'none';
      dims.tooltip.style.display = 'none';
      return;
    }

    const normX = (svgX - dims.padLeft) / dims.plotW;
    const dataX = minX + normX * (maxX - minX);

    let dens = 0;
    let cdfVal = 0;
    if (dist.type === 'normal') {
      dens = dnorm(dataX, dist.params.mean, dist.params.sd);
      cdfVal = pnorm(dataX, dist.params.mean, dist.params.sd);
    } else if (dist.type === 'exponential') {
      dens = dexp(dataX, dist.params.rate);
      cdfVal = pexp(dataX, dist.params.rate);
    } else if (dist.type === 'gamma') {
      dens = dgamma(dataX, dist.params.shape, dist.params.rate);
      cdfVal = pgamma(dataX, dist.params.shape, dist.params.rate);
    } else if (dist.type === 'weibull') {
      dens = dweibull(dataX, dist.params.shape, dist.params.scale);
      cdfVal = pweibull(dataX, dist.params.shape, dist.params.scale);
    }

    const ptY = toSvgY(dens);

    crosshairLine.setAttribute('x1', String(svgX));
    crosshairLine.setAttribute('x2', String(svgX));
    crosshairLine.style.display = 'block';

    trackerPoint.setAttribute('cx', String(svgX));
    trackerPoint.setAttribute('cy', String(ptY));
    trackerPoint.style.display = 'block';

    dims.tooltip.style.display = 'block';
    dims.tooltip.innerHTML = `
      <div class="tooltip-header">Coordinate <strong>x = ${dataX.toFixed(3)}</strong></div>
      <div class="tooltip-row"><span>Density f(x):</span> <strong>${dens.toFixed(5)}</strong></div>
      <div class="tooltip-row"><span>Cumulative F(x):</span> <strong>${cdfVal.toFixed(5)}</strong></div>
    `;
    positionTooltip(dims.tooltip, dims.chartWrap, e);
  });

  overlay.addEventListener('mouseleave', () => {
    crosshairLine.style.display = 'none';
    trackerPoint.style.display = 'none';
    dims.tooltip.style.display = 'none';
  });

  svg.appendChild(overlay);
}

function renderGrid(svg: SVGSVGElement, dims: ChartDimensions, maxVal: number, yLabelText: string) {
  const numGridLines = 4;
  for (let i = 0; i <= numGridLines; i++) {
    const yPos = dims.padTop + (i / numGridLines) * dims.plotH;

    // Faint warm gridlines (border colour)
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', String(dims.padLeft));
    line.setAttribute('x2', String(dims.padLeft + dims.plotW));
    line.setAttribute('y1', String(yPos));
    line.setAttribute('y2', String(yPos));
    line.setAttribute('class', 'chart-grid-line');
    line.setAttribute('stroke', 'var(--border)');
    line.setAttribute('stroke-dasharray', '2,2');
    line.setAttribute('stroke-width', '1');
    svg.appendChild(line);

    const val = (1 - i / numGridLines) * maxVal;
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', String(dims.padLeft - 8));
    text.setAttribute('y', String(yPos + 4));
    text.setAttribute('text-anchor', 'end');
    text.setAttribute('class', 'chart-axis-text');
    text.textContent = val >= 10 ? val.toFixed(1) : val.toFixed(3);
    svg.appendChild(text);
  }

  // Y Axis Title (rotated, positioned safely away from padLeft - 8)
  const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  yLabel.setAttribute('x', String(-dims.padTop - dims.plotH / 2));
  yLabel.setAttribute('y', '14');
  yLabel.setAttribute('text-anchor', 'middle');
  yLabel.setAttribute('transform', 'rotate(-90)');
  yLabel.setAttribute('class', 'chart-axis-label');
  yLabel.textContent = yLabelText;
  svg.appendChild(yLabel);

  // Baseline axis
  const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  xAxis.setAttribute('x1', String(dims.padLeft));
  xAxis.setAttribute('x2', String(dims.padLeft + dims.plotW));
  xAxis.setAttribute('y1', String(dims.padTop + dims.plotH));
  xAxis.setAttribute('y2', String(dims.padTop + dims.plotH));
  xAxis.setAttribute('class', 'chart-axis-line');
  xAxis.setAttribute('stroke', 'var(--border)');
  xAxis.setAttribute('stroke-width', '1');
  svg.appendChild(xAxis);
}

function isDiscreteHighlighted(k: number, query: SolverQuery, resultValue?: number): boolean {
  switch (query.type) {
    case 'prob_equal':
      return k === (query.x ?? 0);
    case 'prob_less_equal':
      return k <= (query.x ?? 0);
    case 'prob_less':
      return k < (query.x ?? 0);
    case 'prob_greater_equal':
      return k >= (query.x ?? 0);
    case 'prob_greater':
      return k > (query.x ?? 0);
    case 'prob_interval':
      return k >= (query.a ?? 0) && k <= (query.b ?? 0);
    case 'quantile':
    case 'find_x_for_p':
      return k <= (resultValue ?? 0);
    default:
      return true;
  }
}

function getContinuousShadePath(
  dist: DistributionParams,
  query: SolverQuery,
  resultValue: number | undefined,
  minX: number,
  maxX: number,
  toSvgX: (x: number) => number,
  toSvgY: (dens: number) => number
): string | null {
  let shadeStart = minX;
  let shadeEnd = maxX;

  switch (query.type) {
    case 'prob_less_equal':
    case 'prob_less':
      shadeStart = minX;
      shadeEnd = Math.min(maxX, Math.max(minX, query.x ?? 0));
      break;

    case 'prob_greater_equal':
    case 'prob_greater':
      shadeStart = Math.min(maxX, Math.max(minX, query.x ?? 0));
      shadeEnd = maxX;
      break;

    case 'prob_interval':
      shadeStart = Math.min(maxX, Math.max(minX, query.a ?? 0));
      shadeEnd = Math.min(maxX, Math.max(minX, query.b ?? 0));
      break;

    case 'quantile':
    case 'find_x_for_p':
      if (resultValue !== undefined) {
        if (query.direction === 'greater' || query.direction === 'greater_equal') {
          shadeStart = Math.min(maxX, Math.max(minX, resultValue));
          shadeEnd = maxX;
        } else {
          shadeStart = minX;
          shadeEnd = Math.min(maxX, Math.max(minX, resultValue));
        }
      }
      break;

    case 'conditional_survival': {
      const s = query.s ?? 0;
      const t = query.t ?? 0;
      shadeStart = Math.min(maxX, Math.max(minX, s + t));
      shadeEnd = maxX;
      break;
    }

    default:
      return null;
  }

  if (shadeStart >= shadeEnd) return null;

  const steps = 180;
  const dx = (shadeEnd - shadeStart) / steps;
  let path = `M ${toSvgX(shadeStart)} ${toSvgY(0)}`;

  for (let i = 0; i <= steps; i++) {
    const xVal = shadeStart + i * dx;
    let dens = 0;
    if (dist.type === 'normal') dens = dnorm(xVal, dist.params.mean, dist.params.sd);
    else if (dist.type === 'exponential') dens = dexp(xVal, dist.params.rate);
    else if (dist.type === 'gamma') dens = dgamma(xVal, dist.params.shape, dist.params.rate);
    else if (dist.type === 'weibull') dens = dweibull(xVal, dist.params.shape, dist.params.scale);

    path += ` L ${toSvgX(xVal)} ${toSvgY(dens)}`;
  }

  path += ` L ${toSvgX(shadeEnd)} ${toSvgY(0)} Z`;
  return path;
}

function positionTooltip(tooltip: HTMLElement, container: HTMLElement, e: MouseEvent) {
  const rect = container.getBoundingClientRect();
  const relX = e.clientX - rect.left;
  const relY = e.clientY - rect.top;

  const tooltipWidth = 190;
  let posX = relX + 16;
  if (posX + tooltipWidth > rect.width) {
    posX = relX - tooltipWidth - 16;
  }

  tooltip.style.left = `${Math.max(8, posX)}px`;
  tooltip.style.top = `${Math.max(8, relY - 60)}px`;
}
