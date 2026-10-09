import { LocalizedString } from '../../types/category';

export interface ExerciseHint {
  es: string;
  en: string;
}

export interface TestCaseResult {
  testId: string;
  description: LocalizedString;
  passed: boolean;
  message?: string;
  expected?: string;
  actual?: string;
}

export interface ExerciseSolveContent {
  exerciseId: string;
  entryFunction: string;
  starterCode: string;
  hints: ExerciseHint[];
  runTests: (code: string) => Promise<{
    passed: boolean;
    results: TestCaseResult[];
    totalPassed: number;
    totalTests: number;
  }>;
}

import { analyzeStudentCodeEffort } from '../../utils/codeEffortAnalyzer';
import { ENGLISH_STARTER_CODES } from './englishStarterCodes';

export function stripCode(rawCode: string): string {
  return rawCode
    .replace(/"""[\s\S]*?"""/g, '')
    .replace(/'''[\s\S]*?'''/g, '')
    .replace(/#.*$/gm, '')
    .trim();
}

export function isUnimplementedStub(code: string, starterCode?: string, exerciseId?: string): boolean {
  if (!code || !code.trim()) return true;
  const stripped = stripCode(code);
  if (!stripped) return true;

  // 1. Exact or stripped match with Spanish starter code
  if (starterCode) {
    if (code.trim() === starterCode.trim()) return true;
    if (stripCode(code) === stripCode(starterCode)) return true;
  }

  // 2. Exact or stripped match with English starter code (by exerciseId or general pool)
  if (exerciseId && ENGLISH_STARTER_CODES[exerciseId]) {
    const engCode = ENGLISH_STARTER_CODES[exerciseId];
    if (code.trim() === engCode.trim()) return true;
    if (stripCode(code) === stripCode(engCode)) return true;
  }

  for (const engCode of Object.values(ENGLISH_STARTER_CODES)) {
    if (code.trim() === engCode.trim() || stripCode(code) === stripCode(engCode)) {
      return true;
    }
  }

  // 3. Meaningful effort analysis: must add at least 2 meaningful non-starter lines
  const refStarter = starterCode || (exerciseId ? ENGLISH_STARTER_CODES[exerciseId] : undefined);
  const effort = analyzeStudentCodeEffort(code, refStarter);
  if (effort.meaningfulLinesAdded < 2 && !effort.hasRealLogic) {
    return true;
  }

  const lines = stripped
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('import ') && !l.startsWith('from '));

  const bodyStatements = lines.filter((l) =>
    !l.startsWith('def ') &&
    !l.startsWith('class ') &&
    !l.endsWith(' = kth_element') &&
    !l.includes(' = ')
  );
  if (bodyStatements.length === 0) return true;

  const allStubs = bodyStatements.every((stmt) =>
    [
      'pass',
      '...',
      'return []',
      'return None',
      'return 0',
      'return 0, []',
      'return [], []',
      'return {}',
      'return ""',
      'return arr',
      'return -1'
    ].includes(stmt)
  );

  return allStubs;
}

