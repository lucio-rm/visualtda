/**
 * Offline Academic Portfolio Export & Import Engine
 * 
 * Enables 100% private, serverless backup and restoration of student solutions,
 * progress records, and attempts across machines.
 */

import { ExerciseProgressRecord } from '../context/StudentProgressContext';
import { StudentAttemptRecord } from './studentAttempts';
import { registry } from '../engine/registry';

export interface PortfolioDataPackage {
  schemaVersion: '1.0';
  app: 'Visual TDA';
  exportedAt: string;
  summary: {
    totalExercises: number;
    completedCount: number;
    passedCount: number;
    attemptsCount: number;
    totalMeaningfulLines: number;
  };
  records: Record<string, ExerciseProgressRecord>;
  completedExerciseIds: string[];
  attempts: Record<string, StudentAttemptRecord[]>;
  approvedSolutions: Record<string, StudentAttemptRecord>;
}

const STORAGE_KEY_COMPLETED = 'visual_tda_completed_exercises';
const STORAGE_KEY_RECORDS = 'visual_tda_student_progress_records';
const STORAGE_PREFIX_ATTEMPTS = 'visual_tda_attempts_';
const STORAGE_PREFIX_APPROVED = 'visual_tda_approved_solution_';

export function exportPortfolioData(): PortfolioDataPackage {
  const records: Record<string, ExerciseProgressRecord> = {};
  const completedIds: string[] = [];
  const attempts: Record<string, StudentAttemptRecord[]> = {};
  const approvedSolutions: Record<string, StudentAttemptRecord> = {};

  try {
    const rawRecords = localStorage.getItem(STORAGE_KEY_RECORDS);
    if (rawRecords) {
      const parsed = JSON.parse(rawRecords);
      if (parsed && typeof parsed === 'object') {
        Object.assign(records, parsed);
      }
    }
  } catch {
    // Ignore read errors
  }

  try {
    const rawCompleted = localStorage.getItem(STORAGE_KEY_COMPLETED);
    if (rawCompleted) {
      const parsed = JSON.parse(rawCompleted);
      if (Array.isArray(parsed)) {
        completedIds.push(...parsed);
      }
    }
  } catch {
    // Ignore read errors
  }

  const allExercises = registry.getExercises();
  let totalAttempts = 0;
  let totalMeaningfulLines = 0;

  for (const ex of allExercises) {
    try {
      const rawAttempts = localStorage.getItem(`${STORAGE_PREFIX_ATTEMPTS}${ex.id}`);
      if (rawAttempts) {
        const parsed = JSON.parse(rawAttempts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          attempts[ex.id] = parsed;
          totalAttempts += parsed.length;
          for (const att of parsed) {
            totalMeaningfulLines += att.meaningfulLinesCount || 0;
          }
        }
      }
    } catch {
      // Ignore
    }

    try {
      const rawApproved = localStorage.getItem(`${STORAGE_PREFIX_APPROVED}${ex.id}`);
      if (rawApproved) {
        const parsed = JSON.parse(rawApproved);
        if (parsed && typeof parsed.code === 'string') {
          approvedSolutions[ex.id] = parsed;
        }
      }
    } catch {
      // Ignore
    }
  }

  const passedCount = Object.values(records).filter(
    (r) => r.state === 'passed' || r.state === 'completed'
  ).length;

  return {
    schemaVersion: '1.0',
    app: 'Visual TDA',
    exportedAt: new Date().toISOString(),
    summary: {
      totalExercises: allExercises.length,
      completedCount: completedIds.length,
      passedCount,
      attemptsCount: totalAttempts,
      totalMeaningfulLines
    },
    records,
    completedExerciseIds: completedIds,
    attempts,
    approvedSolutions
  };
}

export function exportPortfolioMarkdown(lang: 'es' | 'en' = 'es'): string {
  const pkg = exportPortfolioData();
  const allExercises = registry.getExercises();

  let md = `# Visual TDA — ${lang === 'es' ? 'Portafolio Académico de Soluciones' : 'Academic Solutions Portfolio'}\n\n`;
  md += `> ${lang === 'es' ? 'Exportado el' : 'Exported on'}: ${new Date(pkg.exportedAt).toLocaleString()}\n\n`;

  md += `## ${lang === 'es' ? '1. Resumen de Dominio' : '1. Mastery Summary'}\n\n`;
  md += `| ${lang === 'es' ? 'Métrica' : 'Metric'} | ${lang === 'es' ? 'Valor' : 'Value'} |\n`;
  md += `| :--- | :--- |\n`;
  md += `| ${lang === 'es' ? 'Ejercicios Completados' : 'Completed Exercises'} | **${pkg.summary.completedCount}** / ${pkg.summary.totalExercises} |\n`;
  md += `| ${lang === 'es' ? 'Intentos Totales Registrados' : 'Total Recorded Attempts'} | ${pkg.summary.attemptsCount} |\n`;
  md += `| ${lang === 'es' ? 'Líneas Significativas de Código' : 'Meaningful Code Lines'} | ${pkg.summary.totalMeaningfulLines} |\n\n`;

  md += `## ${lang === 'es' ? '2. Soluciones Aprobadas' : '2. Approved Solutions'}\n\n`;

  let solutionCount = 0;
  for (const ex of allExercises) {
    const solution = pkg.approvedSolutions[ex.id];
    if (solution && solution.code) {
      solutionCount++;
      const title = ex.title[lang] || ex.title.es;
      md += `### ${solutionCount}. ${title} (\`${ex.id}\`)\n\n`;
      md += `- **${lang === 'es' ? 'Categoría' : 'Category'}**: ${ex.categoryId}\n`;
      md += `- **${lang === 'es' ? 'Dificultad' : 'Difficulty'}**: ${ex.difficulty} / 5\n`;
      md += `- **${lang === 'es' ? 'Pruebas Superadas' : 'Passed Tests'}**: ${solution.passedTestsCount} / ${solution.totalTestsCount}\n`;
      md += `- **${lang === 'es' ? 'Fecha de Aprobación' : 'Approval Date'}**: ${new Date(solution.timestamp).toLocaleString()}\n\n`;
      md += `\`\`\`python\n${solution.code.trim()}\n\`\`\`\n\n`;
    }
  }

  if (solutionCount === 0) {
    md += `*${lang === 'es' ? 'Aún no hay soluciones aprobadas en este dispositivo.' : 'No approved solutions on this device yet.'}*\n\n`;
  }

  return md;
}

export function importPortfolioData(rawJson: string): {
  success: boolean;
  importedCount: number;
  error?: string;
} {
  try {
    if (!rawJson || typeof rawJson !== 'string') {
      return { success: false, importedCount: 0, error: 'JSON vacío o inválido' };
    }

    const data = JSON.parse(rawJson);
    if (!data || typeof data !== 'object') {
      return { success: false, importedCount: 0, error: 'Estructura de paquete inválida' };
    }

    if (data.app !== 'Visual TDA') {
      return { success: false, importedCount: 0, error: 'El archivo no corresponde a un portafolio de Visual TDA' };
    }

    let count = 0;

    // 1. Restore records
    if (data.records && typeof data.records === 'object') {
      const currentRaw = localStorage.getItem(STORAGE_KEY_RECORDS);
      const current = currentRaw ? JSON.parse(currentRaw) : {};
      const merged = { ...current, ...data.records };
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(merged));
      count += Object.keys(data.records).length;
    }

    // 2. Restore completed list
    if (Array.isArray(data.completedExerciseIds)) {
      const currentRaw = localStorage.getItem(STORAGE_KEY_COMPLETED);
      const current: string[] = currentRaw ? JSON.parse(currentRaw) : [];
      const set = new Set([...current, ...data.completedExerciseIds]);
      localStorage.setItem(STORAGE_KEY_COMPLETED, JSON.stringify(Array.from(set)));
    }

    // 3. Restore attempts
    if (data.attempts && typeof data.attempts === 'object') {
      for (const [exId, attList] of Object.entries(data.attempts)) {
        if (Array.isArray(attList)) {
          const currentRaw = localStorage.getItem(`${STORAGE_PREFIX_ATTEMPTS}${exId}`);
          const current: StudentAttemptRecord[] = currentRaw ? JSON.parse(currentRaw) : [];
          // Deduplicate by timestamp/id
          const ids = new Set(current.map((a) => a.id));
          const toAdd = attList.filter((a: StudentAttemptRecord) => a && !ids.has(a.id));
          const merged = [...toAdd, ...current].slice(0, 50);
          localStorage.setItem(`${STORAGE_PREFIX_ATTEMPTS}${exId}`, JSON.stringify(merged));
        }
      }
    }

    // 4. Restore approved solutions
    if (data.approvedSolutions && typeof data.approvedSolutions === 'object') {
      for (const [exId, sol] of Object.entries(data.approvedSolutions)) {
        if (sol && typeof sol === 'object' && typeof (sol as StudentAttemptRecord).code === 'string') {
          localStorage.setItem(`${STORAGE_PREFIX_APPROVED}${exId}`, JSON.stringify(sol));
        }
      }
    }

    // Dispatch custom event to notify React contexts
    window.dispatchEvent(new Event('storage'));

    return {
      success: true,
      importedCount: count
    };
  } catch (err) {
    return {
      success: false,
      importedCount: 0,
      error: err instanceof Error ? err.message : 'Error desconocido al procesar el archivo'
    };
  }
}

export function triggerDownload(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
