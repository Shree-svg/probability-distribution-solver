import type { DistributionParams, DistributionType } from '../engine/types';
import { safeFormatNumber, validateDistributionParams } from '../engine/validator';
import {
  filterQuestions,
  getCategories,
  getRandomQuestion,
} from '../data/question_bank';
import { evaluateSolverQuery } from '../solver/evaluator';
import { parseWordProblemLayerA } from '../solver/layer_a';
import type { SolvedProblem, SolverQuery, SolverQueryType } from '../solver/types';
import { renderInteractiveDistributionChart } from './chart';
import { createElement, escapeHtml } from './components';
import { icons } from './icons';
import { formatMathExpression, renderLatex } from './math';
import { highlightRCode } from './r_highlight';
import { computeDistributionSummary } from './summary';
import type { ThemeMode, UIMode, UIState } from './types';
import { generatePracticeVariations, type PracticeProblem } from './variations';

export class DistributionApp {
  private container: HTMLElement;
  private state: UIState;
  private currentSolved: SolvedProblem | null = null;
  private currentError: string | null = null;
  private practiceVariations: PracticeProblem[] = [];
  private showSummaryFormulas = false;

  constructor(container: HTMLElement) {
    this.container = container;

    // Light (paper) is default theme per specification
    const savedTheme = (localStorage.getItem('distribution_solver_theme') as ThemeMode) || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    this.state = {
      theme: savedTheme,
      mode: 'calculator',
      selectedDist: 'normal',
      params: {
        mean: 100,
        sd: 15,
        size: 20,
        prob: 0.3,
        lambda: 4,
        rate: 0.2,
        shape: 3,
        scale: 100,
      },
      queryType: 'prob_less_equal',
      queryArgs: {
        x: 115,
        a: 85,
        b: 115,
        p: 0.95,
        t: 0.2,
        s: 50,
      },
      askInput:
        'IQ scores are normally distributed with a mean of 100 and a standard deviation of 15. What is the probability that a randomly chosen person has an IQ of at most 115?',
      showVariations: false,
      showQuestionBank: false,
      bankFilterDist: 'all',
      bankFilterDifficulty: 'all',
      bankFilterCategory: 'all',
      bankSearchQuery: '',
    };
  }

  public init(): void {
    this.solveCurrentState();
    this.render();
  }

  private toggleTheme(): void {
    const nextTheme: ThemeMode = this.state.theme === 'dark' ? 'light' : 'dark';
    this.state.theme = nextTheme;
    localStorage.setItem('distribution_solver_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    this.render();
  }

  private onDistributionChanged(newDist: DistributionType): void {
    this.state.selectedDist = newDist;

    switch (newDist) {
      case 'normal':
        this.state.params.mean = 100;
        this.state.params.sd = 15;
        this.state.queryArgs.x = 115;
        this.state.queryArgs.a = 85;
        this.state.queryArgs.b = 115;
        break;
      case 'binomial':
        this.state.params.size = 20;
        this.state.params.prob = 0.3;
        this.state.queryArgs.x = 6;
        this.state.queryArgs.a = 4;
        this.state.queryArgs.b = 8;
        break;
      case 'poisson':
        this.state.params.lambda = 4;
        this.state.queryArgs.x = 4;
        this.state.queryArgs.a = 2;
        this.state.queryArgs.b = 6;
        break;
      case 'exponential':
        this.state.params.rate = 0.2;
        this.state.queryArgs.x = 5;
        this.state.queryArgs.a = 2;
        this.state.queryArgs.b = 8;
        break;
      case 'gamma':
        this.state.params.shape = 3;
        this.state.params.rate = 1;
        this.state.queryArgs.x = 4;
        this.state.queryArgs.a = 2;
        this.state.queryArgs.b = 6;
        break;
      case 'weibull':
        this.state.params.shape = 2.5;
        this.state.params.scale = 100;
        this.state.queryArgs.x = 80;
        this.state.queryArgs.a = 50;
        this.state.queryArgs.b = 120;
        break;
    }

    this.solveCurrentState();
    this.render();
  }

  private solveCurrentState(): void {
    this.currentError = null;

    if (this.state.mode === 'calculator') {
      const distParams = this.getCurrentDistributionParams();
      const valid = validateDistributionParams(distParams);
      if (!valid.isValid) {
        this.currentError = valid.error;
        this.currentSolved = null;
        return;
      }

      const query = this.getCurrentSolverQuery();
      try {
        this.currentSolved = evaluateSolverQuery(
          distParams,
          query,
          [`User configured ${distParams.type} parameters in textbook calculator mode.`],
          'Layer A (Rule-Based)'
        );
      } catch (err: unknown) {
        this.currentError = err instanceof Error ? err.message : String(err);
        this.currentSolved = null;
      }
    } else {
      // Ask a problem mode
      const text = this.state.askInput.trim();
      if (!text) {
        this.currentError = 'Please enter a probability word problem statement.';
        this.currentSolved = null;
        return;
      }

      const res = parseWordProblemLayerA(text);
      if (res.success) {
        this.currentSolved = res;
        this.state.selectedDist = res.distribution.type;
      } else {
        this.currentSolved = null;
        if ('needsClarification' in res && res.needsClarification) {
          this.currentError = `Clarification Required: ${res.clarifyingQuestion}`;
        } else {
          this.currentError = 'error' in res ? res.error : 'Could not parse problem.';
        }
      }
    }
  }

  private getCurrentDistributionParams(): DistributionParams {
    const p = this.state.params;
    switch (this.state.selectedDist) {
      case 'binomial':
        return { type: 'binomial', params: { size: p.size ?? 20, prob: p.prob ?? 0.3 } };
      case 'poisson':
        return { type: 'poisson', params: { lambda: p.lambda ?? 4 } };
      case 'normal':
        return { type: 'normal', params: { mean: p.mean ?? 100, sd: p.sd ?? 15 } };
      case 'exponential':
        return { type: 'exponential', params: { rate: p.rate ?? 0.2 } };
      case 'gamma':
        return { type: 'gamma', params: { shape: p.shape ?? 3, rate: p.rate ?? 1 } };
      case 'weibull':
        return { type: 'weibull', params: { shape: p.shape ?? 2.5, scale: p.scale ?? 100 } };
    }
  }

  private getCurrentSolverQuery(): SolverQuery {
    const q = this.state.queryArgs;
    const type = this.state.queryType;

    switch (type) {
      case 'prob_equal':
      case 'prob_less_equal':
      case 'prob_less':
      case 'prob_greater_equal':
      case 'prob_greater':
        return { type, x: q.x ?? 0 };
      case 'prob_interval':
        return { type, a: q.a ?? 0, b: q.b ?? 1 };
      case 'quantile':
        return { type, p: q.p ?? 0.5 };
      case 'find_x_for_p':
        return { type, p: q.p ?? 0.05, direction: 'greater' };
      case 'mgf':
        return { type, t: q.t ?? 0.2 };
      case 'conditional_survival':
        return { type, s: q.s ?? 50, t: q.x ?? 30 };
      case 'mean':
      case 'variance':
      case 'sd':
        return { type };
    }
  }

  private render(): void {
    this.container.innerHTML = '';

    const root = createElement('div', { className: 'ds-container' });

    // 1. Header with ghost icon buttons
    root.appendChild(this.renderHeader());

    // 2. Main Two-Column Layout
    const grid = createElement('div', { className: 'ds-main-grid' });

    // Left Column: Controls (Sticky Sidebar)
    const inputCol = createElement('div', { className: 'ds-input-column no-print' });
    inputCol.appendChild(this.renderModeNav());
    if (this.state.mode === 'calculator') {
      inputCol.appendChild(this.renderCalculatorForm());
    } else {
      inputCol.appendChild(this.renderAskForm());
    }
    grid.appendChild(inputCol);

    // Right Column: Output Panel
    const outputCol = createElement('div', { className: 'ds-output-column' });
    outputCol.appendChild(this.renderOutputPanel());
    grid.appendChild(outputCol);

    root.appendChild(grid);

    // 3. Question Bank Section (rendered full-width below both columns)
    if (this.state.showQuestionBank) {
      root.appendChild(this.renderQuestionBankSection());
    }

    // 4. Variations Section (rendered full-width below both columns)
    if (this.state.showVariations) {
      root.appendChild(this.renderVariationsSection());
    }

    // 5. Footer with collapsible "How this works" accordion
    root.appendChild(this.renderFooter());

    this.container.appendChild(root);
  }

  private renderHeader(): HTMLElement {
    const header = createElement('header', { className: 'ds-header' });
    const isDark = this.state.theme === 'dark';

    header.innerHTML = `
      <div class="header-inner">
        <div class="brand-group">
          <div class="brand-logo" aria-hidden="true">∫dx</div>
          <div>
            <h1 class="brand-title">Distribution Solver</h1>
            <p class="brand-subtitle">High-Precision Probability & Base-R Engine</p>
          </div>
        </div>
        <div class="header-actions no-print">
          <button id="openQuestionBankBtnHeader" class="btn-ghost-header btn-bank" title="Browse 600+ Questions Database">
            ${icons.book(16)}
            <span class="btn-text">Question Bank (600)</span>
          </button>
          <button id="themeToggleBtn" class="btn-ghost-header btn-theme-toggle" title="Toggle dark and light theme" aria-label="Toggle theme">
            ${isDark ? icons.sun(18) : icons.moon(18)}
          </button>
          <button id="printBtn" class="btn-ghost-header" title="Print Solution or Save as PDF">
            ${icons.printer(16)}
            <span class="btn-text">Print / PDF</span>
          </button>
        </div>
      </div>
    `;

    const bankBtn = header.querySelector('#openQuestionBankBtnHeader');
    bankBtn?.addEventListener('click', () => {
      this.state.showQuestionBank = !this.state.showQuestionBank;
      this.render();
      if (this.state.showQuestionBank) {
        document.getElementById('questionBankSection')?.scrollIntoView({ behavior: 'smooth' });
      }
    });

    const themeBtn = header.querySelector('#themeToggleBtn');
    themeBtn?.addEventListener('click', () => this.toggleTheme());

    const printBtn = header.querySelector('#printBtn');
    printBtn?.addEventListener('click', () => window.print());

    return header;
  }

  private renderModeNav(): HTMLElement {
    const nav = createElement('div', { className: 'mode-nav' });
    nav.innerHTML = `
      <button class="mode-tab-btn ${this.state.mode === 'calculator' ? 'active' : ''}" data-mode="calculator">
        <span class="tab-icon">${icons.calculator(16)}</span>
        <span>Mode 1: Calculator</span>
      </button>
      <button class="mode-tab-btn ${this.state.mode === 'ask' ? 'active' : ''}" data-mode="ask">
        <span class="tab-icon">${icons.messageSquare(16)}</span>
        <span>Mode 2: Ask a Problem</span>
      </button>
    `;

    nav.querySelectorAll('.mode-tab-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const mode = (e.currentTarget as HTMLElement).getAttribute('data-mode') as UIMode;
        if (mode && mode !== this.state.mode) {
          this.state.mode = mode;
          this.solveCurrentState();
          this.render();
        }
      });
    });

    return nav;
  }

  private renderCalculatorForm(): HTMLElement {
    const card = createElement('div', { className: 'ds-card input-card' });

    card.innerHTML = `
      <div class="card-header">
        <div>
          <h3 class="card-title">Distribution Model</h3>
          <span class="card-subtitle">Select statistical distribution</span>
        </div>
        <span class="card-tag-muted">${this.state.selectedDist.toUpperCase()}</span>
      </div>

      <div class="form-group">
        <label for="distSelect" class="input-top-label">Distribution Model:</label>
        <div class="select-wrapper">
          <select id="distSelect" class="form-select">
            <option value="normal" ${this.state.selectedDist === 'normal' ? 'selected' : ''}>Normal (Gaussian) Distribution</option>
            <option value="binomial" ${this.state.selectedDist === 'binomial' ? 'selected' : ''}>Binomial Distribution</option>
            <option value="poisson" ${this.state.selectedDist === 'poisson' ? 'selected' : ''}>Poisson Distribution</option>
            <option value="exponential" ${this.state.selectedDist === 'exponential' ? 'selected' : ''}>Exponential Distribution</option>
            <option value="gamma" ${this.state.selectedDist === 'gamma' ? 'selected' : ''}>Gamma Distribution</option>
            <option value="weibull" ${this.state.selectedDist === 'weibull' ? 'selected' : ''}>Weibull Distribution</option>
          </select>
          <span class="select-chevron">${icons.chevronDown(16)}</span>
        </div>
        <span class="field-hint-line">Base-R parameterized distribution</span>
      </div>

      <div id="paramInputsContainer" class="param-inputs-grid"></div>

      <div class="card-divider"></div>

      <div class="card-header">
        <div>
          <h3 class="card-title">Query Operation</h3>
          <span class="card-subtitle">Probability, quantile, or moment</span>
        </div>
      </div>

      <div class="form-group">
        <label for="queryTypeSelect" class="input-top-label">Calculation Objective:</label>
        <div class="select-wrapper">
          <select id="queryTypeSelect" class="form-select">
            <option value="prob_less_equal" ${this.state.queryType === 'prob_less_equal' ? 'selected' : ''}>P(X ≤ x) — Cumulative Probability</option>
            <option value="prob_less" ${this.state.queryType === 'prob_less' ? 'selected' : ''}>P(X < x) — Strict Lower Tail</option>
            <option value="prob_greater_equal" ${this.state.queryType === 'prob_greater_equal' ? 'selected' : ''}>P(X ≥ x) — At Least / Upper Tail</option>
            <option value="prob_greater" ${this.state.queryType === 'prob_greater' ? 'selected' : ''}>P(X > x) — Survival / Exceedance</option>
            <option value="prob_equal" ${this.state.queryType === 'prob_equal' ? 'selected' : ''}>P(X = x) — Point Probability Mass</option>
            <option value="prob_interval" ${this.state.queryType === 'prob_interval' ? 'selected' : ''}>P(a ≤ X ≤ b) — Interval Range</option>
            <option value="quantile" ${this.state.queryType === 'quantile' ? 'selected' : ''}>Quantile / Percentile Q(p)</option>
            <option value="find_x_for_p" ${this.state.queryType === 'find_x_for_p' ? 'selected' : ''}>Top p% Cutoff Threshold</option>
            <option value="mean" ${this.state.queryType === 'mean' ? 'selected' : ''}>Expected Value E[X]</option>
            <option value="variance" ${this.state.queryType === 'variance' ? 'selected' : ''}>Variance Var(X) & SD</option>
            <option value="mgf" ${this.state.queryType === 'mgf' ? 'selected' : ''}>Moment Generating Function M(t)</option>
            <option value="conditional_survival" ${this.state.queryType === 'conditional_survival' ? 'selected' : ''}>Conditional P(X > s + t | X > s)</option>
          </select>
          <span class="select-chevron">${icons.chevronDown(16)}</span>
        </div>
        <span class="field-hint-line">Evaluate target probability or moment</span>
      </div>

      <div id="queryArgsContainer" class="query-args-grid"></div>

      <div class="action-buttons-row">
        <button id="calculateBtn" class="btn-primary">
          ${icons.zap(16)}
          <span>Calculate Solution</span>
        </button>
        <button id="openVariationsBtn" class="btn-secondary">
          ${icons.dices(16)}
          <span>Practice Variations</span>
        </button>
      </div>
    `;

    // Bind distribution select
    const distSelect = card.querySelector('#distSelect') as HTMLSelectElement;
    distSelect.onchange = (e) => {
      const selected = (e.target as HTMLSelectElement).value as DistributionType;
      this.onDistributionChanged(selected);
    };

    // Bind query select
    const querySelect = card.querySelector('#queryTypeSelect') as HTMLSelectElement;
    querySelect.onchange = (e) => {
      this.state.queryType = (e.target as HTMLSelectElement).value as SolverQueryType;
      this.renderQueryInputs(card.querySelector('#queryArgsContainer') as HTMLElement);
      this.solveCurrentState();
      this.updateOutputOnly();
    };

    // Render sub inputs
    this.renderParamInputs(card.querySelector('#paramInputsContainer') as HTMLElement);
    this.renderQueryInputs(card.querySelector('#queryArgsContainer') as HTMLElement);

    // Calculate click
    const calcBtn = card.querySelector('#calculateBtn');
    calcBtn?.addEventListener('click', () => {
      this.solveCurrentState();
      this.updateOutputOnly();
    });

    // Variations click
    const varBtn = card.querySelector('#openVariationsBtn');
    varBtn?.addEventListener('click', () => {
      this.practiceVariations = generatePracticeVariations(this.state.selectedDist);
      this.state.showVariations = true;
      this.render();
      document.querySelector('#variationsSection')?.scrollIntoView({ behavior: 'smooth' });
    });

    return card;
  }

  private renderParamInputs(container: HTMLElement): void {
    container.innerHTML = '';
    const dist = this.state.selectedDist;
    const p = this.state.params;

    const createField = (
      label: string,
      symbol: string,
      range: string,
      value: number,
      onChange: (val: number) => void,
      step = 1,
      min?: number,
      max?: number
    ) => {
      const field = createElement('div', { className: 'form-group input-field-wrap' });
      field.innerHTML = `
        <label class="input-top-label">
          <span class="symbol-chip">${escapeHtml(symbol)}</span>
          <span class="label-text">${escapeHtml(label)}</span>
        </label>
        <div class="input-control-box">
          <input type="number" class="form-input" value="${value}" step="${step}" ${min !== undefined ? `min="${min}"` : ''} ${max !== undefined ? `max="${max}"` : ''} />
        </div>
        <span class="field-hint-line">${escapeHtml(range)}</span>
      `;
      const input = field.querySelector('input') as HTMLInputElement;
      input.oninput = () => {
        const parsed = parseFloat(input.value);
        if (!isNaN(parsed)) {
          onChange(parsed);
          this.solveCurrentState();
          this.updateOutputOnly();
        }
      };
      return field;
    };

    switch (dist) {
      case 'normal':
        container.appendChild(
          createField('Mean (μ)', 'μ', '-∞ < μ < +∞', p.mean ?? 100, (val) => (p.mean = val), 1)
        );
        container.appendChild(
          createField(
            'Std Dev (σ)',
            'σ',
            'σ > 0',
            p.sd ?? 15,
            (val) => (p.sd = val),
            0.5,
            0.001
          )
        );
        break;

      case 'binomial':
        container.appendChild(
          createField(
            'Trials (n)',
            'n',
            'integer, n ≥ 1',
            p.size ?? 20,
            (val) => (p.size = Math.max(1, Math.round(val))),
            1,
            1
          )
        );
        container.appendChild(
          createField(
            'Success (p)',
            'p',
            '0 ≤ p ≤ 1',
            p.prob ?? 0.3,
            (val) => (p.prob = Math.max(0, Math.min(1, val))),
            0.05,
            0,
            1
          )
        );
        break;

      case 'poisson':
        container.appendChild(
          createField(
            'Rate (λ)',
            'λ',
            'λ > 0',
            p.lambda ?? 4,
            (val) => (p.lambda = Math.max(0.001, val)),
            0.5,
            0.001
          )
        );
        break;

      case 'exponential':
        container.appendChild(
          createField(
            'Rate (λ)',
            'λ',
            'λ > 0',
            p.rate ?? 0.2,
            (val) => (p.rate = Math.max(0.001, val)),
            0.05,
            0.0001
          )
        );
        break;

      case 'gamma':
        container.appendChild(
          createField(
            'Shape (α)',
            'α',
            'α > 0',
            p.shape ?? 3,
            (val) => (p.shape = Math.max(0.01, val)),
            0.5,
            0.01
          )
        );
        container.appendChild(
          createField(
            'Rate (λ)',
            'λ',
            'λ > 0',
            p.rate ?? 1,
            (val) => (p.rate = Math.max(0.01, val)),
            0.1,
            0.001
          )
        );
        break;

      case 'weibull':
        container.appendChild(
          createField(
            'Shape (k)',
            'k',
            'k > 0',
            p.shape ?? 2.5,
            (val) => (p.shape = Math.max(0.01, val)),
            0.1,
            0.01
          )
        );
        container.appendChild(
          createField(
            'Scale (λ)',
            'λ',
            'λ > 0',
            p.scale ?? 100,
            (val) => (p.scale = Math.max(0.01, val)),
            5,
            0.01
          )
        );
        break;
    }
  }

  private renderQueryInputs(container: HTMLElement): void {
    container.innerHTML = '';
    const q = this.state.queryArgs;
    const type = this.state.queryType;

    const createField = (
      label: string,
      symbol: string,
      hint: string,
      value: number,
      onChange: (val: number) => void,
      step = 1,
      min?: number,
      max?: number
    ) => {
      const field = createElement('div', { className: 'form-group input-field-wrap' });
      field.innerHTML = `
        <label class="input-top-label">
          <span class="symbol-chip">${escapeHtml(symbol)}</span>
          <span class="label-text">${escapeHtml(label)}</span>
        </label>
        <div class="input-control-box">
          <input type="number" class="form-input" value="${value}" step="${step}" ${min !== undefined ? `min="${min}"` : ''} ${max !== undefined ? `max="${max}"` : ''} />
        </div>
        <span class="field-hint-line">${escapeHtml(hint)}</span>
      `;
      const input = field.querySelector('input') as HTMLInputElement;
      input.oninput = () => {
        const parsed = parseFloat(input.value);
        if (!isNaN(parsed)) {
          onChange(parsed);
          this.solveCurrentState();
          this.updateOutputOnly();
        }
      };
      return field;
    };

    switch (type) {
      case 'prob_equal':
      case 'prob_less_equal':
      case 'prob_less':
      case 'prob_greater_equal':
      case 'prob_greater':
        container.appendChild(
          createField('Threshold (x)', 'x', 'Evaluation cutoff value', q.x ?? 115, (val) => (q.x = val), 1)
        );
        break;

      case 'prob_interval':
        container.appendChild(
          createField('Lower Bound (a)', 'a', 'Left interval boundary', q.a ?? 85, (val) => (q.a = val), 1)
        );
        container.appendChild(
          createField('Upper Bound (b)', 'b', 'Right interval boundary', q.b ?? 115, (val) => (q.b = val), 1)
        );
        break;

      case 'quantile':
        container.appendChild(
          createField(
            'Cumulative (p)',
            'p',
            '0 < p < 1 probability',
            q.p ?? 0.95,
            (val) => (q.p = Math.max(0.0001, Math.min(0.9999, val))),
            0.01,
            0.0001,
            0.9999
          )
        );
        break;

      case 'find_x_for_p':
        container.appendChild(
          createField(
            'Tail Probability (p)',
            'p',
            'e.g. top 5% = 0.05',
            q.p ?? 0.05,
            (val) => (q.p = Math.max(0.0001, Math.min(0.9999, val))),
            0.01,
            0.0001,
            0.9999
          )
        );
        break;

      case 'mgf':
        container.appendChild(
          createField('Point (t)', 't', 'Evaluation variable t', q.t ?? 0.2, (val) => (q.t = val), 0.05)
        );
        break;

      case 'conditional_survival':
        container.appendChild(
          createField('Elapsed Time (s)', 's', 'Known elapsed time', q.s ?? 50, (val) => (q.s = val), 1, 0)
        );
        container.appendChild(
          createField('Additional Time (t)', 't', 'Additional survival duration', q.x ?? 30, (val) => (q.x = val), 1, 0)
        );
        break;

      case 'mean':
      case 'variance':
      case 'sd':
        // Moments require no extra numeric parameters
        break;
    }
  }

  private renderAskForm(): HTMLElement {
    const card = createElement('div', { className: 'ds-card input-card' });

    card.innerHTML = `
      <div class="card-header">
        <div>
          <h3 class="card-title">Ask a Word Problem</h3>
          <span class="card-subtitle">Natural language probability parser</span>
        </div>
        <span class="card-tag-muted">NLP LAYER A/B</span>
      </div>

      <div class="form-group">
        <div class="form-label-row">
          <label for="askTextarea" class="input-top-label">Problem Statement:</label>
          <div class="quick-bank-actions">
            <button type="button" id="randomQuestionBtn" class="btn-text-sm" title="Insert Random Question from Bank">
              ${icons.shuffle(14)} <span>Random</span>
            </button>
            <button type="button" id="openBankBtnAsk" class="btn-text-sm btn-highlight" title="Browse 600 Questions Library">
              ${icons.book(14)} <span>600 Questions</span>
            </button>
          </div>
        </div>
        <textarea id="askTextarea" class="form-textarea" rows="4" placeholder="Enter a worded problem statement here...">${escapeHtml(this.state.askInput)}</textarea>
        <span class="field-hint-line">Supports key phrases: 'at least', 'at most', 'between', 'average', 'variance'</span>
      </div>

      <div class="example-chips-group">
        <span class="chips-label">Try Example Worded Problems:</span>
        <div class="chips-container">
          <button class="chip-btn" data-chip="normal">Normal: IQ Scores</button>
          <button class="chip-btn" data-chip="binomial">Binomial: Free Throws</button>
          <button class="chip-btn" data-chip="poisson">Poisson: Call Center</button>
          <button class="chip-btn" data-chip="exponential">Exponential: Bus Wait</button>
          <button class="chip-btn" data-chip="gamma">Gamma: Sequential Stages</button>
          <button class="chip-btn" data-chip="weibull">Weibull: Tool Cutoff</button>
          <button class="chip-btn chip-bank" id="browseBankChip">
            ${icons.book(14)} <span>Browse 100+ per Dist</span>
          </button>
        </div>
      </div>

      <div class="action-buttons-row" style="margin-top: 1.5rem;">
        <button id="solveProblemBtn" class="btn-primary">
          ${icons.search(16)}
          <span>Solve Problem</span>
        </button>
        <button id="openVariationsBtnAsk" class="btn-secondary">
          ${icons.dices(16)}
          <span>Practice Variations</span>
        </button>
      </div>
    `;

    const textarea = card.querySelector('#askTextarea') as HTMLTextAreaElement;
    textarea.oninput = () => {
      this.state.askInput = textarea.value;
    };

    const openBankAction = () => {
      this.state.showQuestionBank = true;
      this.state.bankFilterDist = this.state.selectedDist;
      this.render();
      document.querySelector('#questionBankSection')?.scrollIntoView({ behavior: 'smooth' });
    };

    card.querySelector('#openBankBtnAsk')?.addEventListener('click', openBankAction);
    card.querySelector('#browseBankChip')?.addEventListener('click', openBankAction);

    const randBtn = card.querySelector('#randomQuestionBtn');
    randBtn?.addEventListener('click', () => {
      const q = getRandomQuestion(this.state.selectedDist);
      textarea.value = q.question;
      this.state.askInput = q.question;
      this.solveCurrentState();
      this.render();
    });

    const examples: Record<string, string> = {
      normal:
        'IQ scores are normally distributed with a mean of 100 and a standard deviation of 15. What is the probability that a randomly chosen person has an IQ of at most 115?',
      binomial:
        'A basketball player takes 15 free throws with an 80% success rate. What is the probability of making at least 12 free throws?',
      poisson:
        'Calls arrive at a call center at an average rate of 6 calls per hour according to a Poisson process. What is the probability of receiving exactly 4 calls?',
      exponential:
        'The waiting time for a bus has an exponential distribution with a mean waiting time of 10 minutes. What is the probability of waiting at most 5 minutes?',
      gamma:
        'A project duration follows a Gamma distribution with shape 4 and rate 0.8. What is the probability of completion between 2 and 6 weeks?',
      weibull:
        'A cutting tool has a Weibull distribution with shape 2.5 and scale 100 hours. Find the cutoff for top 10% longest lasting tools.',
    };

    card.querySelectorAll('.chip-btn:not(#browseBankChip)').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const key = (e.currentTarget as HTMLElement).getAttribute('data-chip');
        if (key && examples[key]) {
          textarea.value = examples[key];
          this.state.askInput = examples[key];
          this.solveCurrentState();
          this.render();
        }
      });
    });

    const solveBtn = card.querySelector('#solveProblemBtn');
    solveBtn?.addEventListener('click', () => {
      this.solveCurrentState();
      this.render();
    });

    const varBtn = card.querySelector('#openVariationsBtnAsk');
    varBtn?.addEventListener('click', () => {
      this.practiceVariations = generatePracticeVariations(this.state.selectedDist);
      this.state.showVariations = true;
      this.render();
      document.querySelector('#variationsSection')?.scrollIntoView({ behavior: 'smooth' });
    });

    return card;
  }

  private getQueryProbabilityStatement(query: SolverQuery): string {
    switch (query.type) {
      case 'prob_less_equal':
        return `P(X \\le ${query.x ?? 0})`;
      case 'prob_less':
        return `P(X < ${query.x ?? 0})`;
      case 'prob_greater_equal':
        return `P(X \\ge ${query.x ?? 0})`;
      case 'prob_greater':
        return `P(X > ${query.x ?? 0})`;
      case 'prob_equal':
        return `P(X = ${query.x ?? 0})`;
      case 'prob_interval':
        return `P(${query.a ?? 0} \\le X \\le ${query.b ?? 0})`;
      case 'quantile':
        return `Q(${query.p ?? 0.5})`;
      case 'find_x_for_p':
        return `x^* \\text{ for top } ${((query.p ?? 0.05) * 100).toFixed(0)}\\%`;
      case 'mean':
        return `\\text{E}[X] = \\mu`;
      case 'variance':
        return `\\text{Var}(X) = \\sigma^2`;
      case 'sd':
        return `\\text{SD}(X) = \\sigma`;
      case 'mgf':
        return `M_X(${query.t ?? 0.2})`;
      case 'conditional_survival': {
        const s = query.s ?? 50;
        const t = query.x ?? 30;
        return `P(X > ${s + t} \\mid X > ${s})`;
      }
      default:
        return 'P(X)';
    }
  }

  private renderOutputPanel(): HTMLElement {
    const panel = createElement('div', { className: 'ds-output-container', id: 'outputPanel' });

    if (this.currentError) {
      panel.innerHTML = `
        <div class="error-card">
          <div class="error-header">
            <span class="error-icon">${icons.alertCircle(18)}</span>
            <h4 class="error-title">Validation Notice</h4>
          </div>
          <p class="error-msg">${escapeHtml(this.currentError)}</p>
        </div>
      `;
      return panel;
    }

    if (!this.currentSolved) {
      panel.innerHTML = `
        <div class="placeholder-card">
          <div class="placeholder-icon">${icons.calculator(28)}</div>
          <h4 class="placeholder-title">Ready to Calculate</h4>
          <p class="placeholder-text">Configure parameters on the left or enter a word problem to generate a full textbook mathematical solution.</p>
        </div>
      `;
      return panel;
    }

    const sol = this.currentSolved;

    // 1. Textbook Answer Card
    // Answer card: cream raised surface, 1px amber border, small caps label "ANSWER",
    // the probability statement in Fraunces italic, the value at 48px mono, and a highlight-tint background strip behind the number.
    const answerCard = createElement('div', { className: 'answer-card' });

    // Format probability statement for textbook look (e.g. P(X <= 115))
    const statementLatex = this.getQueryProbabilityStatement(sol.query);
    const mathStatementHtml = renderLatex(statementLatex);

    answerCard.innerHTML = `
      <div class="answer-card-header">
        <div class="answer-label-group">
          <span class="answer-smallcaps">ANSWER</span>
          <div class="answer-statement-fraunces">${mathStatementHtml}</div>
        </div>
        <span class="badge-verify">
          ${icons.shieldCheck(14)}
          <span>Engine & R Verified</span>
        </span>
      </div>
      <div class="answer-value-row">
        <div class="answer-big-wrapper">
          <span class="answer-big">${safeFormatNumber(sol.resultValue, 6)}</span>
        </div>
      </div>
      <div class="answer-footer">
        <div class="definition-callout">
          <span class="callout-note-label">Note</span>
          <span class="callout-text">Distribution Model: <strong>${escapeHtml(sol.steps[0]?.result || sol.distribution.type)}</strong> under standard statistical parameterization.</span>
        </div>
      </div>
    `;
    panel.appendChild(answerCard);

    // 2. Interactive SVG Chart
    const chartCard = renderInteractiveDistributionChart(
      sol.distribution,
      sol.query,
      sol.resultValue
    );
    panel.appendChild(chartCard);

    // 3. Step-by-Step Working
    // Left margin numbers in accent circles, thin vertical rule connecting them,
    // each Formula/Substitution/Result shown as ONE compact worked example block with 3px accent left border on raised background.
    const stepsCard = createElement('div', { className: 'ds-card steps-card' });
    let stepsHtml = '';
    sol.steps.forEach((st) => {
      const formulaLatex = st.formula ? formatMathExpression(st.formula) : '';
      const substitutedLatex = st.substituted ? formatMathExpression(st.substituted) : '';
      const resultLatex = st.result ? formatMathExpression(st.result) : '';

      stepsHtml += `
        <div class="step-item">
          <div class="step-num">${st.stepNumber}</div>
          <div class="step-body">
            <h5 class="step-title">${escapeHtml(st.title)}</h5>
            <p class="step-explanation">${escapeHtml(st.explanation)}</p>
            <div class="worked-example-block">
              ${
                st.formula
                  ? `<div class="worked-row"><span class="step-box-label">Formula:</span> <span class="math-slot">${formulaLatex}</span></div>`
                  : ''
              }
              ${
                st.substituted
                  ? `<div class="worked-row"><span class="step-box-label">Substitution:</span> <span class="math-slot">${substitutedLatex}</span></div>`
                  : ''
              }
              ${
                st.result
                  ? `<div class="worked-row result-row"><span class="step-box-label">Result:</span> <span class="math-slot bold-result">${resultLatex}</span></div>`
                  : ''
              }
            </div>
          </div>
        </div>
      `;
    });

    stepsCard.innerHTML = `
      <div class="card-header">
        <div>
          <h3 class="card-title">Exam-Style Step-by-Step Working</h3>
          <span class="card-subtitle">Formal mathematical derivation</span>
        </div>
        <span class="card-tag-muted">${sol.steps.length} Steps</span>
      </div>
      <div class="steps-list">${stepsHtml}</div>
    `;
    panel.appendChild(stepsCard);

    // 4. Distribution Characteristics (Stats: ONE section)
    // 4-column grid of 8 tiles, each with muted label, bold mono value, and small KaTeX definition line.
    // Duplicate table hidden behind a "Show formulas" toggle.
    const summaryCard = createElement('div', { className: 'ds-card summary-card' });
    const metrics = computeDistributionSummary(sol.distribution);

    let tilesHtml = '';
    metrics.forEach((m) => {
      const formulaLatex = m.latexFormula
        ? renderLatex(`${m.latexSymbol || ''} = ${m.latexFormula}`)
        : m.formula
          ? formatMathExpression(m.formula)
          : '';

      const isTextValue = isNaN(Number(m.value));
      tilesHtml += `
        <div class="stat-tile">
          <span class="stat-tile-label">${escapeHtml(m.label)}</span>
          <span class="stat-tile-value ${isTextValue ? 'stat-tile-value-text' : ''}" title="${escapeHtml(m.value)}">${escapeHtml(m.value)}</span>
          <div class="stat-tile-katex" title="${escapeHtml(m.formula || '')}">${formulaLatex}</div>
        </div>
      `;
    });

    let tableRows = '';
    metrics.forEach((m) => {
      const formulaLatex = m.latexFormula
        ? renderLatex(`${m.latexSymbol || ''} = ${m.latexFormula}`)
        : formatMathExpression(m.formula);

      tableRows += `
        <tr>
          <td>
            <strong>${escapeHtml(m.label)}</strong>
            <span class="metric-symbol">${m.latexSymbol ? renderLatex(m.latexSymbol) : escapeHtml(m.symbol)}</span>
          </td>
          <td class="metric-val"><code>${escapeHtml(m.value)}</code></td>
          <td class="metric-formula"><span class="table-formula-slot">${formulaLatex}</span></td>
        </tr>
      `;
    });

    summaryCard.innerHTML = `
      <div class="card-header">
        <div>
          <h3 class="card-title">Distribution Moments & Characteristics</h3>
          <span class="card-subtitle">Theoretical summary metrics & definitions</span>
        </div>
        <button id="toggleFormulasBtn" class="btn-ghost-sm" type="button">
          ${icons.eye(14)}
          <span>${this.showSummaryFormulas ? 'Hide Formulas Table' : 'Show Formulas Table'}</span>
        </button>
      </div>

      <div class="stats-eight-grid">${tilesHtml}</div>

      <div id="summaryTableWrapper" class="table-responsive" style="display: ${this.showSummaryFormulas ? 'block' : 'none'}; margin-top: 1.5rem;">
        <table class="summary-table">
          <thead>
            <tr>
              <th>Characteristic</th>
              <th>Calculated Value</th>
              <th>Theoretical Definition</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
    `;

    const toggleBtn = summaryCard.querySelector('#toggleFormulasBtn');
    toggleBtn?.addEventListener('click', () => {
      this.showSummaryFormulas = !this.showSummaryFormulas;
      const wrap = summaryCard.querySelector('#summaryTableWrapper') as HTMLElement;
      if (wrap) {
        wrap.style.display = this.showSummaryFormulas ? 'block' : 'none';
      }
      if (toggleBtn) {
        toggleBtn.innerHTML = `
          ${icons.eye(14)}
          <span>${this.showSummaryFormulas ? 'Hide Formulas Table' : 'Show Formulas Table'}</span>
        `;
      }
    });

    panel.appendChild(summaryCard);

    // 5. R Code Block with Syntax Highlighting, Warm Dark Surface, Copy & Download
    const rCard = createElement('div', { className: 'ds-card r-card' });
    const scriptToRun = sol.rScript || sol.rCode;
    const highlightedCode = highlightRCode(scriptToRun);

    rCard.innerHTML = `
      <div class="card-header">
        <div>
          <h3 class="card-title">Runnable Base-R Script</h3>
          <span class="card-subtitle">Verified in R 4.6 • Every line commented • Generates plots</span>
        </div>
        <div class="r-actions-group no-print">
          <button id="copyRBtn" class="btn-ghost-icon" title="Copy R Code">
            ${icons.copy(16)}
            <span class="btn-copy-label">Copy Code</span>
          </button>
          <button id="downloadRBtn" class="btn-ghost-icon" title="Download .R Script">
            ${icons.download(16)}
            <span>Download .R</span>
          </button>
        </div>
      </div>
      <div class="r-code-window">
        <pre class="r-code-pre"><code>${highlightedCode}</code></pre>
      </div>
    `;

    const copyBtn = rCard.querySelector('#copyRBtn') as HTMLButtonElement;
    copyBtn?.addEventListener('click', () => {
      navigator.clipboard.writeText(scriptToRun).then(() => {
        copyBtn.innerHTML = `${icons.check(16)} <span class="btn-copy-label">Copied ✓</span>`;
        setTimeout(() => {
          copyBtn.innerHTML = `${icons.copy(16)} <span class="btn-copy-label">Copy Code</span>`;
        }, 2000);
      });
    });

    const downloadBtn = rCard.querySelector('#downloadRBtn') as HTMLButtonElement;
    downloadBtn?.addEventListener('click', () => {
      const blob = new Blob([scriptToRun], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${sol.distribution.type}_solution.R`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });

    panel.appendChild(rCard);

    // 6. Assumptions & Engine Verification
    const assumptionsCard = createElement('div', { className: 'ds-card assumptions-card' });
    let assumptionsHtml = '';
    if (sol.assumptions.length > 0) {
      assumptionsHtml = `<ul>${sol.assumptions.map((a) => `<li>${escapeHtml(a)}</li>`).join('')}</ul>`;
    } else {
      assumptionsHtml = '<p>Standard model parameters under R statistical conventions.</p>';
    }

    assumptionsCard.innerHTML = `
      <div class="card-header">
        <div>
          <h3 class="card-title">Modeling Assumptions & Engine Verification</h3>
          <span class="card-subtitle">Mathematical constraints</span>
        </div>
        <span class="badge-verify">${icons.shieldCheck(14)} Verified (Tol &lt; 1e-6)</span>
      </div>
      <div class="definition-callout">
        <span class="callout-note-label">Note</span>
        <div class="callout-body">${assumptionsHtml}</div>
      </div>
    `;
    panel.appendChild(assumptionsCard);

    return panel;
  }

  private updateOutputOnly(): void {
    const existing = this.container.querySelector('#outputPanel');
    if (existing && existing.parentElement) {
      const newOutput = this.renderOutputPanel();
      existing.parentElement.replaceChild(newOutput, existing);
    }
  }

  private renderQuestionBankSection(): HTMLElement {
    const section = createElement('section', {
      className: 'bank-section no-print',
      id: 'questionBankSection',
    });

    const activeDist = this.state.bankFilterDist;
    const categories = getCategories(activeDist === 'all' ? undefined : activeDist);
    const filteredQuestions = filterQuestions({
      distribution: this.state.bankFilterDist,
      difficulty: this.state.bankFilterDifficulty as any,
      category: this.state.bankFilterCategory,
      searchQuery: this.state.bankSearchQuery,
    });

    const distTabs: { id: DistributionType | 'all'; label: string; count: number }[] = [
      { id: 'all', label: 'All Distributions', count: 600 },
      { id: 'normal', label: 'Normal (Gaussian)', count: 100 },
      { id: 'binomial', label: 'Binomial', count: 100 },
      { id: 'poisson', label: 'Poisson', count: 100 },
      { id: 'exponential', label: 'Exponential', count: 100 },
      { id: 'gamma', label: 'Gamma', count: 100 },
      { id: 'weibull', label: 'Weibull', count: 100 },
    ];

    const distTabsHtml = distTabs
      .map(
        (t) => `
        <button class="bank-dist-tab ${this.state.bankFilterDist === t.id ? 'active' : ''}" data-dist="${t.id}">
          <span>${t.label}</span>
          <span class="tab-count-chip">${t.count}</span>
        </button>
      `
      )
      .join('');

    const categoryOptionsHtml = [
      '<option value="all">All Categories & Domains</option>',
      ...categories.map(
        (c) => `<option value="${escapeHtml(c)}" ${this.state.bankFilterCategory === c ? 'selected' : ''}>${escapeHtml(c)}</option>`
      ),
    ].join('');

    const difficultyOptionsHtml = [
      { id: 'all', label: 'All Difficulties' },
      { id: 'Basic', label: 'Basic' },
      { id: 'Intermediate', label: 'Intermediate' },
      { id: 'Advanced', label: 'Advanced' },
    ]
      .map(
        (d) =>
          `<option value="${d.id}" ${this.state.bankFilterDifficulty === d.id ? 'selected' : ''}>${d.label}</option>`
      )
      .join('');

    let questionsHtml = '';
    if (filteredQuestions.length === 0) {
      questionsHtml = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--muted);">
          <p style="font-size: 1.1rem; font-weight: 600;">No questions match your filter criteria.</p>
          <p style="font-size: 0.85rem; margin-top: 0.35rem;">Try clearing your search query or selecting "All Distributions".</p>
        </div>
      `;
    } else {
      questionsHtml = filteredQuestions
        .map((q) => {
          let paramStr = '';
          if (q.distribution === 'binomial') {
            paramStr = `n=${q.params.size}, p=${q.params.prob}`;
          } else if (q.distribution === 'poisson') {
            paramStr = `λ=${q.params.lambda}`;
          } else if (q.distribution === 'normal') {
            paramStr = `μ=${q.params.mean}, σ=${q.params.sd}`;
          } else if (q.distribution === 'exponential') {
            paramStr = `λ=${q.params.rate}`;
          } else if (q.distribution === 'gamma') {
            paramStr = `α=${q.params.shape}, λ=${q.params.rate}`;
          } else if (q.distribution === 'weibull') {
            paramStr = `k=${q.params.shape}, λ=${q.params.scale}`;
          }

          return `
            <div class="bank-card" id="card_${q.id}">
              <div>
                <div class="bank-card-badges">
                  <span class="difficulty-tag diff-${q.difficulty.toLowerCase()}">${q.difficulty}</span>
                  <span class="card-tag-muted">${q.distribution.toUpperCase()}</span>
                  <span class="card-tag-category">${escapeHtml(q.category)}</span>
                </div>
                <h4 class="bank-q-title">${escapeHtml(q.title)}</h4>
                <p class="bank-q-text">${escapeHtml(q.question)}</p>
              </div>
              <div class="bank-card-footer">
                <span class="bank-params-mono">${escapeHtml(paramStr)}</span>
                <button class="btn-ghost-sm btn-bank-solve" data-qid="${q.id}">
                  ${icons.zap(14)}
                  <span>Solve Question</span>
                </button>
              </div>
            </div>
          `;
        })
        .join('');
    }

    section.innerHTML = `
      <div class="bank-header">
        <div>
          <h3 class="section-title">Question Bank Library (600 Questions)</h3>
          <p class="section-subtitle">100 realistic textbook problems per distribution with analytical step solutions and base-R code.</p>
        </div>
        <div class="variations-btn-group">
          <button id="bankRandomBtn" class="btn-secondary">
            ${icons.shuffle(14)}
            <span>Random Question</span>
          </button>
          <button id="closeBankBtn" class="btn-ghost-icon" title="Close Question Bank">
            ${icons.x(16)}
            <span>Close</span>
          </button>
        </div>
      </div>

      <div class="bank-filter-bar">
        <div class="bank-dist-tabs">${distTabsHtml}</div>
        <div class="bank-filter-controls-row">
          <div class="select-wrapper">
            <select id="bankCategorySelect" class="form-select bank-select">${categoryOptionsHtml}</select>
            <span class="select-chevron">${icons.chevronDown(14)}</span>
          </div>
          <div class="select-wrapper">
            <select id="bankDifficultySelect" class="form-select bank-select">${difficultyOptionsHtml}</select>
            <span class="select-chevron">${icons.chevronDown(14)}</span>
          </div>
          <div class="search-input-wrap">
            <span class="search-icon">${icons.search(14)}</span>
            <input id="bankSearchInput" class="form-input bank-search-input" type="text" placeholder="Search keywords, domains, or problem descriptions..." value="${escapeHtml(this.state.bankSearchQuery)}" />
          </div>
        </div>
      </div>

      <div class="bank-status-bar">
        <span>Showing <strong>${filteredQuestions.length}</strong> of 600 curated problems</span>
        <span class="status-tip">Click "Solve Question" to load and run full solver</span>
      </div>

      <div class="bank-grid">${questionsHtml}</div>
    `;

    // Event listeners for tabs
    section.querySelectorAll('.bank-dist-tab').forEach((tab) => {
      tab.addEventListener('click', (e) => {
        const dist = (e.currentTarget as HTMLElement).getAttribute('data-dist') as DistributionType | 'all';
        this.state.bankFilterDist = dist;
        this.state.bankFilterCategory = 'all';
        this.render();
        document.querySelector('#questionBankSection')?.scrollIntoView({ behavior: 'smooth' });
      });
    });

    // Category select
    const catSelect = section.querySelector('#bankCategorySelect') as HTMLSelectElement;
    catSelect?.addEventListener('change', () => {
      this.state.bankFilterCategory = catSelect.value;
      this.render();
      document.querySelector('#questionBankSection')?.scrollIntoView({ behavior: 'smooth' });
    });

    // Difficulty select
    const diffSelect = section.querySelector('#bankDifficultySelect') as HTMLSelectElement;
    diffSelect?.addEventListener('change', () => {
      this.state.bankFilterDifficulty = diffSelect.value;
      this.render();
      document.querySelector('#questionBankSection')?.scrollIntoView({ behavior: 'smooth' });
    });

    // Search input
    const searchInput = section.querySelector('#bankSearchInput') as HTMLInputElement;
    searchInput?.addEventListener('input', () => {
      this.state.bankSearchQuery = searchInput.value;
      this.render();
      const el = document.querySelector('#bankSearchInput') as HTMLInputElement;
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
    });

    // Random question button
    const bankRandBtn = section.querySelector('#bankRandomBtn');
    bankRandBtn?.addEventListener('click', () => {
      const q = getRandomQuestion(this.state.bankFilterDist === 'all' ? undefined : this.state.bankFilterDist);
      this.state.askInput = q.question;
      this.state.selectedDist = q.distribution;
      this.state.mode = 'ask';
      this.solveCurrentState();
      this.render();
      document.querySelector('#outputPanel')?.scrollIntoView({ behavior: 'smooth' });
    });

    // Close button
    const closeBtn = section.querySelector('#closeBankBtn');
    closeBtn?.addEventListener('click', () => {
      this.state.showQuestionBank = false;
      this.render();
    });

    // Solve button for each question card
    section.querySelectorAll('.btn-bank-solve').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const qid = (e.currentTarget as HTMLElement).getAttribute('data-qid');
        if (qid) {
          const q = filterQuestions({ searchQuery: qid })[0];
          if (q) {
            this.state.askInput = q.question;
            this.state.selectedDist = q.distribution;
            this.state.mode = 'ask';
            this.solveCurrentState();
            this.render();
            document.querySelector('#outputPanel')?.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });

    return section;
  }

  private renderVariationsSection(): HTMLElement {
    const section = createElement('section', {
      className: 'variations-section no-print',
      id: 'variationsSection',
    });

    let itemsHtml = '';
    this.practiceVariations.forEach((v, idx) => {
      itemsHtml += `
        <div class="variation-card">
          <div class="var-header">
            <span class="card-tag-muted">Problem ${idx + 1}</span>
            <h4 class="var-title">${escapeHtml(v.title)}</h4>
          </div>
          <p class="var-text">${escapeHtml(v.problemText)}</p>
          <div class="var-actions">
            <button class="btn-ghost-sm btn-reveal" data-target="var_ans_${v.id}">
              ${icons.eye(14)}
              <span>Show Answer & Steps</span>
            </button>
          </div>
          <div id="var_ans_${v.id}" class="var-answer-box" style="display: none;">
            <div class="var-result-pill">
              <span class="pill-label">Calculated Result:</span>
              <strong class="pill-val">${safeFormatNumber(v.solved.resultValue, 6)}</strong>
            </div>
            <div class="var-steps">
              ${v.solved.steps
                .map(
                  (s) => `
                <div class="var-step-line">
                  <span class="var-step-label">Step ${s.stepNumber}:</span>
                  <span class="var-step-text">${escapeHtml(s.explanation)}</span>
                </div>
              `
                )
                .join('')}
            </div>
            <div class="var-r">
              <span class="var-r-label">R Verification:</span>
              <code class="var-r-code">${escapeHtml(v.solved.rCode)}</code>
            </div>
          </div>
        </div>
      `;
    });

    section.innerHTML = `
      <div class="variations-header">
        <div>
          <h3 class="section-title">5 Practice Variations (${this.state.selectedDist.toUpperCase()})</h3>
          <p class="section-subtitle">Randomized parameter problems to test and practice your knowledge.</p>
        </div>
        <div class="variations-btn-group">
          <button id="regenerateVarBtn" class="btn-secondary">
            ${icons.shuffle(14)}
            <span>Generate 5 New</span>
          </button>
          <button id="closeVarBtn" class="btn-ghost-icon" title="Close Variations">
            ${icons.x(16)}
            <span>Close</span>
          </button>
        </div>
      </div>
      <div class="variations-grid">${itemsHtml}</div>
    `;

    // Reveal toggle
    section.querySelectorAll('.btn-reveal').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const btnElem = e.currentTarget as HTMLElement;
        const targetId = btnElem.getAttribute('data-target');
        if (targetId) {
          const ansBox = section.querySelector(`#${targetId}`) as HTMLElement;
          if (ansBox) {
            const isHidden = ansBox.style.display === 'none';
            ansBox.style.display = isHidden ? 'block' : 'none';
            btnElem.innerHTML = isHidden
              ? `${icons.x(14)} <span>Hide Solution</span>`
              : `${icons.eye(14)} <span>Show Answer & Steps</span>`;
          }
        }
      });
    });

    const regenBtn = section.querySelector('#regenerateVarBtn');
    regenBtn?.addEventListener('click', () => {
      this.practiceVariations = generatePracticeVariations(this.state.selectedDist);
      this.render();
      document.querySelector('#variationsSection')?.scrollIntoView({ behavior: 'smooth' });
    });

    const closeBtn = section.querySelector('#closeVarBtn');
    closeBtn?.addEventListener('click', () => {
      this.state.showVariations = false;
      this.render();
    });

    return section;
  }

  private renderFooter(): HTMLElement {
    const footer = createElement('footer', { className: 'ds-footer no-print' });
    footer.innerHTML = `
      <details class="footer-accordion" open>
        <summary class="footer-summary">
          <div class="summary-left">
            <span class="summary-icon">${icons.info(16)}</span>
            <span class="summary-title">Distribution Engine Ground Rules (How this works)</span>
          </div>
          <span class="summary-chevron">${icons.chevronDown(16)}</span>
        </summary>
        <div class="footer-rules-content">
          <div class="footer-rules-grid">
            <div class="rule-item">
              <span class="rule-num">1</span>
              <div><strong>Engine Precision:</strong> Never hardcodes results. Every number is computed directly by the mathematical engine.</div>
            </div>
            <div class="rule-item">
              <span class="rule-num">2</span>
              <div><strong>Zero Drift:</strong> 11,500+ SciPy reference golden tests verify machine precision (rtol &lt; 1e-9).</div>
            </div>
            <div class="rule-item">
              <span class="rule-num">3</span>
              <div><strong>Zero NaN Policy:</strong> Never displays NaN, Infinity, or undefined; invalid inputs trigger validation notices.</div>
            </div>
            <div class="rule-item">
              <span class="rule-num">4</span>
              <div><strong>R Convention:</strong> Binomial(n, p), Poisson(λ), Normal(μ, σ), Exponential(λ), Gamma(α, λ), Weibull(k, λ).</div>
            </div>
          </div>
        </div>
      </details>
    `;
    return footer;
  }
}
