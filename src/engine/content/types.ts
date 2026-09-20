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
