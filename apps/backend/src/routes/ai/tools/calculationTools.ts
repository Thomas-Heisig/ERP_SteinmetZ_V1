/**
 * calculationTools.ts
 * Erweiterte mathematische, finanzielle und wissenschaftliche Berechnungswerkzeuge.
 * Voll kompatibel mit der globalen ToolRegistry (erweiterte registry.ts).
 */

import type { ToolFunction } from './registry.js';

export function registerTools(toolRegistry: { register: (name: string, fn: ToolFunction) => void }) {
  /* ─────────────────────────────────────────────
   * 🧮 Allgemeiner Ausdrucksrechner
   * ───────────────────────────────────────────── */
  const calculateTool = (async ({ expression }: { expression: string }) => {
    try {
      if (!expression || typeof expression !== 'string') throw new Error('Kein gültiger Ausdruck.');

      const safeExpr = expression.replace(/[^0-9+\-*/().,^√%πe\s]/gi, '');
      const parsed = safeExpr
        .replace(/π/g, 'Math.PI')
        .replace(/√/g, 'Math.sqrt')
        .replace(/\^/g, '**')
        .replace(/%/g, '/100');

      const result = Function(`"use strict"; return (${parsed})`)();

      if (typeof result !== 'number' || isNaN(result)) throw new Error('Ungültiges Ergebnis.');

      return {
        success: true,
        expression,
        parsed,
        result,
        formatted: `= ${result.toLocaleString('de-DE', { maximumFractionDigits: 10 })}`,
        type: typeof result,
      };
    } catch (err) {
      return { success: false, error: String(err), message: 'Berechnung fehlgeschlagen.' };
    }
  }) as ToolFunction;

  calculateTool.description = 'Führt sichere mathematische Berechnungen durch (mit √, π, %, ^ usw.)';
  calculateTool.parameters = { expression: 'Mathematischer Ausdruck (z. B. "√(9)+3^2")' };
  calculateTool.category = 'calculations';
  calculateTool.version = '2.1';

  toolRegistry.register('calculate', calculateTool);

  /* ─────────────────────────────────────────────
   * 📊 Statistik
   * ───────────────────────────────────────────── */
  const statisticsTool = (async ({ values }: { values: number[] }) => {
    try {
      if (!Array.isArray(values) || values.length === 0) throw new Error('Leere Werte-Liste.');

      const sorted = [...values].sort((a, b) => a - b);
      const n = values.length;
      const sum = values.reduce((a, b) => a + b, 0);
      const mean = sum / n;
      const median = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
      const min = sorted[0];
      const max = sorted[n - 1];
      const variance = values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / n;
      const stdDev = Math.sqrt(variance);

      return { success: true, count: n, sum, mean, median, min, max, variance, stdDev };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }) as ToolFunction;

  statisticsTool.description = 'Berechnet statistische Kennzahlen (Mittelwert, Median, Varianz, etc.)';
  statisticsTool.parameters = { values: 'Array numerischer Werte' };
  statisticsTool.category = 'calculations';
  statisticsTool.version = '1.0';
  toolRegistry.register('statistics', statisticsTool);

  /* ─────────────────────────────────────────────
   * 💱 Prozentrechner
   * ───────────────────────────────────────────── */
  const percentTool = (async ({
    value,
    percent,
    mode = 'of',
  }: {
    value: number;
    percent: number;
    mode?: 'of' | 'increase' | 'decrease';
  }) => {
    try {
      let result: number;
      if (mode === 'increase') result = value * (1 + percent / 100);
      else if (mode === 'decrease') result = value * (1 - percent / 100);
      else result = (value * percent) / 100;

      return {
        success: true,
        value,
        percent,
        mode,
        result,
        formatted:
          mode === 'of'
            ? `${percent}% von ${value} = ${result.toFixed(2)}`
            : `${mode === 'increase' ? '+' : '-'}${percent}% ergibt ${result.toFixed(2)}`,
      };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }) as ToolFunction;

  percentTool.description = 'Berechnet Prozentwerte oder prozentuale Zu-/Abnahmen.';
  percentTool.parameters = { value: 'Grundwert', percent: 'Prozentwert', mode: 'of|increase|decrease' };
  percentTool.category = 'financial';
  percentTool.version = '1.0';
  toolRegistry.register('percent', percentTool);

  /* ─────────────────────────────────────────────
   * 🌐 Einheitenkonverter
   * ───────────────────────────────────────────── */
  const convertUnitTool = (async ({ value, from, to }: { value: number; from: string; to: string }) => {
    try {
      const units: Record<string, number> = {
        m: 1,
        cm: 0.01,
        mm: 0.001,
        km: 1000,
        inch: 0.0254,
        ft: 0.3048,
        yd: 0.9144,
      };

      const base = units[from.toLowerCase()];
      const target = units[to.toLowerCase()];

      if (!base || !target) throw new Error('Unbekannte Einheit.');

      const result = (value * base) / target;
      return { success: true, value, from, to, result, formatted: `${value} ${from} = ${result.toFixed(6)} ${to}` };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }) as ToolFunction;

  convertUnitTool.description = 'Konvertiert Längen zwischen gängigen Einheiten (m, cm, inch, km, ft, yd).';
  convertUnitTool.parameters = { value: 'Zahl', from: 'Einheit', to: 'Zieleinheit' };
  convertUnitTool.category = 'conversions';
  toolRegistry.register('convert_unit', convertUnitTool);

  /* ─────────────────────────────────────────────
   * 🧠 Gleichungslöser
   * ───────────────────────────────────────────── */
  const solveEquationTool = (async ({ equation }: { equation: string }) => {
    try {
      const [lhs, rhs] = equation.split('=');
      if (!lhs || !rhs) throw new Error('Ungültige Gleichung. Beispiel: 2*x+4=10');
      const variable = (lhs.match(/[a-zA-Z]/) || [])[0];
      if (!variable) throw new Error('Keine Variable gefunden.');

      const f = (x: number) => Function(`"use strict"; const ${variable}=${x}; return (${lhs})-(${rhs})`)();
      let x = 1;
      for (let i = 0; i < 20; i++) {
        const fx = f(x);
        const dfx = (f(x + 1e-6) - fx) / 1e-6;
        if (Math.abs(dfx) < 1e-10) break;
        x -= fx / dfx;
      }

      return { success: true, equation, variable, solution: x, formatted: `${variable} ≈ ${x.toFixed(6)}` };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }) as ToolFunction;

  solveEquationTool.description = 'Löst einfache Gleichungen (z. B. 2*x+4=10).';
  solveEquationTool.parameters = { equation: 'Algebraische Gleichung mit einer Variablen' };
  solveEquationTool.category = 'algebra';
  toolRegistry.register('solve_equation', solveEquationTool);

  /* ─────────────────────────────────────────────
   * 🧮 Batch Berechnungen
   * ───────────────────────────────────────────── */
  const batchCalcTool = (async ({ expressions }: { expressions: string[] }) => {
    try {
      if (!Array.isArray(expressions) || expressions.length === 0) throw new Error('Keine Ausdrücke.');

      const results = expressions.map(expr => {
        const clean = expr.replace(/[^0-9+\-*/().,^√%πe\s]/gi, '');
        const parsed = clean
          .replace(/π/g, 'Math.PI')
          .replace(/√/g, 'Math.sqrt')
          .replace(/\^/g, '**')
          .replace(/%/g, '/100');
        const result = Function(`"use strict"; return (${parsed})`)();
        return { expression: expr, result };
      });

      return { success: true, count: results.length, results };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }) as ToolFunction;

  batchCalcTool.description = 'Berechnet mehrere mathematische Ausdrücke gleichzeitig.';
  batchCalcTool.parameters = { expressions: 'Array mathematischer Ausdrücke' };
  batchCalcTool.category = 'calculations';
  toolRegistry.register('batch_calculate', batchCalcTool);
}
