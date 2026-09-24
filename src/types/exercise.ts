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

export function formatTechniqueLabel(techniqueId: string, language: 'es' | 'en'): string {
  switch (techniqueId) {
    case 'divide-and-conquer':
      return language === 'es' ? 'División y Conquista' : 'Divide & Conquer';
    case 'dynamic-programming':
      return language === 'es' ? 'Programación Dinámica' : 'Dynamic Programming';
    case 'greedy':
      return 'Greedy';
    case 'backtracking':
      return 'Backtracking';
    case 'branch-and-bound':
      return 'Branch & Bound';
    case 'network-flow':
      return language === 'es' ? 'Redes de Flujo' : 'Network Flow';
    case 'linear-programming':
      return language === 'es' ? 'Programación Lineal' : 'Linear Programming';
    case 'reductions':
      return language === 'es' ? 'Reducciones NP' : 'NP Reductions';
    case 'approximation':
      return language === 'es' ? 'Aproximación' : 'Approximation';
    case 'randomized':
      return language === 'es' ? 'Randomizado' : 'Randomized';
    default:
      return techniqueId.replace(/-/g, ' ');
  }
}

