export interface TranslationsDictionary {
  brandSubtitle: { es: string; en: string };
  welcomeTitle: { es: string; en: string };
  welcomeLead: { es: string; en: string };
  catalogTitle: { es: string; en: string };
  allCategoriesTab: { es: string; en: string };
  backToCatalog: { es: string; en: string };
  exploreExercise: { es: string; en: string };
  phaseDiscover: { es: string; en: string };
  phaseSolve: { es: string; en: string };
  phaseUnderstand: { es: string; en: string };
  runTests: { es: string; en: string };
  startImplementation: { es: string; en: string };
  viewCanonicalSolution: { es: string; en: string };
  skipToUnderstand: { es: string; en: string };
  skipModalTitle: { es: string; en: string };
  skipModalBody: { es: string; en: string };
  skipModalCancel: { es: string; en: string };
  skipModalConfirm: { es: string; en: string };
  testsRunning: { es: string; en: string };
  testsSuccess: { es: string; en: string };
  testsPassed: { es: string; en: string };
  runPyodideTests: { es: string; en: string };
  pythonStdOutput: { es: string; en: string };
  executionTime: { es: string; en: string };
  hintsTitle: { es: string; en: string };
  nextHint: { es: string; en: string };
  allHintsRevealed: { es: string; en: string };
  codeToggleLabel: { es: string; en: string };
  speedLabel: { es: string; en: string };
  footerText: { es: string; en: string };
}

export const TRANSLATIONS: TranslationsDictionary = {
  brandSubtitle: {
    es: 'Teoría y Diseño de Algoritmos',
    en: 'Theory & Design of Algorithms'
  },
  welcomeTitle: {
    es: 'Diseño y Análisis de Algoritmos',
    en: 'Algorithm Design and Analysis'
  },
  welcomeLead: {
    es: 'Aprende algoritmos fundamentales de forma interactiva y rigurosa. Observa su ejecución, comprende los invariantes de corrección y analiza su complejidad computacional.',
    en: 'Learn fundamental algorithms interactively and rigorously. Observe step execution, understand correctness invariants, and analyze computational complexity.'
  },
  catalogTitle: {
    es: 'Categorías y Técnicas',
    en: 'Categories and Techniques'
  },
  allCategoriesTab: {
    es: 'Todos',
    en: 'All'
  },
  backToCatalog: {
    es: '← Volver al catálogo de ejercicios',
    en: '← Back to exercise catalog'
  },
  exploreExercise: {
    es: 'Explorar ejercicio →',
    en: 'Explore exercise →'
  },
  phaseDiscover: {
    es: '1. Descubrir',
    en: '1. Discover'
  },
  phaseSolve: {
    es: '2. Resolver',
    en: '2. Solve'
  },
  phaseUnderstand: {
    es: '3. Comprender',
    en: '3. Understand'
  },
  runTests: {
    es: '▶ Ejecutar Tests Locales',
    en: '▶ Run Local Tests'
  },
  startImplementation: {
    es: 'Comenzar a Resolver →',
    en: 'Start Solving →'
  },
  viewCanonicalSolution: {
    es: 'Ver Solución Canónica',
    en: 'View Canonical Solution'
  },
  skipToUnderstand: {
    es: 'Saltar a la solución explicada',
    en: 'Skip to explained solution'
  },
  skipModalTitle: {
    es: '¿Ver la solución ahora?',
    en: 'View the solution now?'
  },
  skipModalBody: {
    es: 'Se desbloqueará la solución canónica oficial y el análisis formal. Puedes intentar resolverlo tú mismo primero, o acceder directamente si deseas estudiar la técnica.',
    en: 'The official canonical solution and formal analysis will be unlocked. You can try solving it yourself first, or proceed directly to study the technique.'
  },
  skipModalCancel: {
    es: 'Seguir intentando',
    en: 'Keep trying'
  },
  skipModalConfirm: {
    es: 'Ver solución oficial',
    en: 'View official solution'
  },
  testsRunning: {
    es: 'Ejecutando suite de pruebas...',
    en: 'Running test suite...'
  },
  testsSuccess: {
    es: '✓ ¡Todos los tests pasaron exitosamente! Has desbloqueado la fase de comprensión.',
    en: '✓ All tests passed successfully! You unlocked the understand phase.'
  },
  testsPassed: {
    es: 'Tests pasados',
    en: 'Tests passed'
  },
  runPyodideTests: {
    es: '⚡ Ejecutar en Python (Web Worker)',
    en: '⚡ Run in Python (Web Worker)'
  },
  pythonStdOutput: {
    es: 'Salida de consola (stdout):',
    en: 'Console output (stdout):'
  },
  executionTime: {
    es: 'Tiempo de ejecución:',
    en: 'Execution time:'
  },
  hintsTitle: {
    es: 'Pistas Progresivas',
    en: 'Progressive Hints'
  },
  nextHint: {
    es: 'Revelar Siguiente Pista',
    en: 'Reveal Next Hint'
  },
  allHintsRevealed: {
    es: 'Todas las pistas reveladas',
    en: 'All hints revealed'
  },
  codeToggleLabel: {
    es: 'Modo de código',
    en: 'Code mode'
  },
  speedLabel: {
    es: 'Velocidad:',
    en: 'Speed:'
  },
  footerText: {
    es: 'Visual TDA — Principios: KISS · Separación Algoritmo/UI · Correctness Pedagógica',
    en: 'Visual TDA — Principles: KISS · Algorithm/UI Separation · Pedagogical Correctness'
  }
};
