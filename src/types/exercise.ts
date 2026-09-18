import { LocalizedString } from './category';

export type ExercisePhase = 'discover' | 'solve' | 'understand';

export type ExerciseDifficulty = 1 | 2 | 3 | 4 | 5;

export interface ExerciseMetadata {
  id: string;
  problemId: string;
  techniqueId: string;
  categoryId: string;
  order: number;
  difficulty: ExerciseDifficulty;
  title: LocalizedString;
  subtitle: LocalizedString;
  supportedPhases: ExercisePhase[];
  tags: string[];
}
