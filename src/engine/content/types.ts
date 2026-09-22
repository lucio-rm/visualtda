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

export function stripCode(rawCode: string): string {
  return rawCode
    .replace(/"""[\s\S]*?"""/g, '')
    .replace(/'''[\s\S]*?'''/g, '')
    .replace(/#.*$/gm, '')
    .trim();
}

export function isUnimplementedStub(code: string, starterCode?: string): boolean {
  if (!code || !code.trim()) return true;
  if (starterCode && code.trim() === starterCode.trim()) return true;

  const stripped = stripCode(code);
  if (!stripped) return true;

  const lines = stripped
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('import ') && !l.startsWith('from '));

  const bodyStatements = lines.filter((l) => !l.startsWith('def ') && !l.startsWith('class '));
  if (bodyStatements.length === 0) return true;

  const allStubs = bodyStatements.every((stmt) =>
    [
      'pass',
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

