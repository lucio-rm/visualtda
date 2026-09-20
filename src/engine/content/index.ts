export * from './types';
import { ExerciseSolveContent } from './types';
import { backtrackingContent } from './backtrackingContent';
import { greedyContent } from './greedyContent';
import { dpContent } from './dpContent';
import { divideAndConquerContent } from './divideAndConquerContent';
import { advancedContent } from './advancedContent';

export const EXERCISE_SOLVE_CONTENT: Record<string, ExerciseSolveContent> = {
  ...backtrackingContent,
  ...greedyContent,
  ...dpContent,
  ...divideAndConquerContent,
  ...advancedContent
};
