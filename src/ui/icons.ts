import {
  AlertCircle,
  BookOpen,
  Calculator,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Dices,
  Download,
  Eye,
  FileSpreadsheet,
  HelpCircle,
  Info,
  MessageSquare,
  Moon,
  Printer,
  Search,
  ShieldCheck,
  Shuffle,
  Sparkles,
  Sun,
  X,
  Zap,
} from 'lucide';

type LucideIconNode = [string, Record<string, string>];

function renderSvg(iconNodes: LucideIconNode[], size = 16, className = ''): string {
  const children = iconNodes
    .map(([tag, attrs]) => {
      const attrStr = Object.entries(attrs)
        .map(([k, v]) => `${k}="${v}"`)
        .join(' ');
      return `<${tag} ${attrStr}></${tag}>`;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon ${className}">${children}</svg>`;
}

export const icons = {
  sun: (size = 18, cls = '') => renderSvg(Sun as unknown as LucideIconNode[], size, cls),
  moon: (size = 18, cls = '') => renderSvg(Moon as unknown as LucideIconNode[], size, cls),
  book: (size = 16, cls = '') => renderSvg(BookOpen as unknown as LucideIconNode[], size, cls),
  printer: (size = 16, cls = '') => renderSvg(Printer as unknown as LucideIconNode[], size, cls),
  calculator: (size = 16, cls = '') => renderSvg(Calculator as unknown as LucideIconNode[], size, cls),
  messageSquare: (size = 16, cls = '') => renderSvg(MessageSquare as unknown as LucideIconNode[], size, cls),
  zap: (size = 16, cls = '') => renderSvg(Zap as unknown as LucideIconNode[], size, cls),
  sparkles: (size = 16, cls = '') => renderSvg(Sparkles as unknown as LucideIconNode[], size, cls),
  dices: (size = 16, cls = '') => renderSvg(Dices as unknown as LucideIconNode[], size, cls),
  shuffle: (size = 16, cls = '') => renderSvg(Shuffle as unknown as LucideIconNode[], size, cls),
  search: (size = 16, cls = '') => renderSvg(Search as unknown as LucideIconNode[], size, cls),
  copy: (size = 16, cls = '') => renderSvg(Copy as unknown as LucideIconNode[], size, cls),
  check: (size = 16, cls = '') => renderSvg(Check as unknown as LucideIconNode[], size, cls),
  download: (size = 16, cls = '') => renderSvg(Download as unknown as LucideIconNode[], size, cls),
  eye: (size = 16, cls = '') => renderSvg(Eye as unknown as LucideIconNode[], size, cls),
  x: (size = 16, cls = '') => renderSvg(X as unknown as LucideIconNode[], size, cls),
  shieldCheck: (size = 16, cls = '') => renderSvg(ShieldCheck as unknown as LucideIconNode[], size, cls),
  alertCircle: (size = 16, cls = '') => renderSvg(AlertCircle as unknown as LucideIconNode[], size, cls),
  chevronDown: (size = 16, cls = '') => renderSvg(ChevronDown as unknown as LucideIconNode[], size, cls),
  chevronUp: (size = 16, cls = '') => renderSvg(ChevronUp as unknown as LucideIconNode[], size, cls),
  info: (size = 16, cls = '') => renderSvg(Info as unknown as LucideIconNode[], size, cls),
  spreadsheet: (size = 16, cls = '') => renderSvg(FileSpreadsheet as unknown as LucideIconNode[], size, cls),
  helpCircle: (size = 16, cls = '') => renderSvg(HelpCircle as unknown as LucideIconNode[], size, cls),
};
