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
  understandTitle: { es: string; en: string };
  solveTitle: { es: string; en: string };
  solveLead: { es: string; en: string };
  hintsDesc: { es: string; en: string };
  hintLabel: { es: string; en: string };
  viewHintLabel: { es: string; en: string };
  skipSolutionTitle: { es: string; en: string };
  skipSolutionDesc: { es: string; en: string };
  evaluationResult: { es: string; en: string };
  resetTemplate: { es: string; en: string };
  codeEditorAriaLabel: { es: string; en: string };
  resetTemplateAriaLabel: { es: string; en: string };
  tsValidationTitle: { es: string; en: string };
  pyodideValidationTitle: { es: string; en: string };
  understandLead: { es: string; en: string };
  understandVisualizerHeading: { es: string; en: string };
  understandCanonicalHeading: { es: string; en: string };
  understandPython3: { es: string; en: string };
  understandPseudocode: { es: string; en: string };
  understandCorrectnessHeading: { es: string; en: string };
  understandTimeComplexity: { es: string; en: string };
  understandSpaceComplexity: { es: string; en: string };
  understandVisualizerPlaceholder: { es: string; en: string };
  resetCode: { es: string; en: string };
  proceedToUnderstand: { es: string; en: string };
  instructorMode: { es: string; en: string };
  instructorModeActive: { es: string; en: string };
  instructorModeTooltip: { es: string; en: string };
  instructorModeBanner: { es: string; en: string };
  discoverTitle: { es: string; en: string };
  discoverLead: { es: string; en: string };
  discoverProblemStatement: { es: string; en: string };
  discoverRulesHeading: { es: string; en: string };
  discoverRule1: { es: string; en: string };
  discoverRule2: { es: string; en: string };
  discoverRule3: { es: string; en: string };
  discoverPlaygroundHeading: { es: string; en: string };
  discoverPlaygroundPlaceholder: { es: string; en: string };
  discoverProceedBtn: { es: string; en: string };
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
    es: 'Aprendé algoritmos fundamentales de forma interactiva y rigurosa. Observá su ejecución, comprendé los invariantes de corrección y analizá su complejidad computacional.',
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
    es: 'Empezar a Resolver →',
    en: 'Start Solving →'
  },
  viewCanonicalSolution: {
    es: 'Ver Solución Oficial',
    en: 'View Official Solution'
  },
  skipToUnderstand: {
    es: 'Saltar a la solución explicada',
    en: 'Skip to explained solution'
  },
  skipModalTitle: {
    es: '¿Revelar la solución explicada?',
    en: 'Reveal the explained solution?'
  },
  skipModalBody: {
    es: 'Intentar resolver el problema por tu propia cuenta maximiza la retención y comprensión profunda. Sin embargo, en Visual TDA el objetivo es el aprendizaje honesto: podés consultar la solución comentada, la traza paso a paso y la demostración formal en cualquier momento sin penalización.',
    en: 'Attempting the problem on your own maximizes retention and deep comprehension. However, Visual TDA is dedicated to honest learning: you can consult the annotated solution, step-by-step trace, and formal proof at any time without penalty.'
  },
  skipModalCancel: {
    es: 'Seguir intentando',
    en: 'Keep trying'
  },
  skipModalConfirm: {
    es: 'Revelar solución oficial',
    en: 'Reveal official solution'
  },
  testsRunning: {
    es: 'Ejecutando suite de pruebas...',
    en: 'Running test suite...'
  },
  testsSuccess: {
    es: 'Pruebas automatizadas superadas con éxito. Fase de comprensión desbloqueada.',
    en: 'Automated tests passed successfully. Understand phase unlocked.'
  },
  testsPassed: {
    es: 'Tests pasados',
    en: 'Tests passed'
  },
  runPyodideTests: {
    es: 'Ejecutar en Python (Web Worker)',
    en: 'Run in Python (Web Worker)'
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
    es: 'Visual TDA — Principios: KISS · Separación Algoritmo/UI · Correctness Pedagógica · FIUBA',
    en: 'Visual TDA — Principles: KISS · Algorithm/UI Separation · Pedagogical Correctness · FIUBA'
  },
  solveTitle: {
    es: '2. Resolver: Planteá tu Solución Algorítmica',
    en: '2. Solve: Formulate Your Algorithmic Solution'
  },
  solveLead: {
    es: 'Implementá el algoritmo. Si te trabás, podés consultar pistas progresivas o solicitar ver la solución oficial en cualquier momento.',
    en: 'Implement the algorithm. If you get stuck, use progressive hints or view the official solution at any time.'
  },
  hintsDesc: {
    es: 'Descubrí pistas sólo si las necesitás para destrabar tu razonamiento:',
    en: 'Unlock hints only if you need guidance to unblock your reasoning:'
  },
  hintLabel: {
    es: 'Pista',
    en: 'Hint'
  },
  viewHintLabel: {
    es: 'Ver Pista',
    en: 'View Hint'
  },
  skipSolutionTitle: {
    es: '¿Preferís ver la solución directa?',
    en: 'Prefer to see the solution directly?'
  },
  skipSolutionDesc: {
    es: 'El objetivo es pedagógico. Podés consultar la solución comentada y el análisis formal sin penalización.',
    en: 'The goal is educational. You can view the annotated solution and formal analysis anytime without being blocked.'
  },
  evaluationResult: {
    es: 'Resultado de la Evaluación',
    en: 'Evaluation Result'
  },
  resetTemplate: {
    es: '↺ Reiniciar plantilla',
    en: '↺ Reset template'
  },
  codeEditorAriaLabel: {
    es: 'Editor de código Python para tu solución',
    en: 'Python code editor for your solution'
  },
  resetTemplateAriaLabel: {
    es: 'Restaurar plantilla inicial del ejercicio',
    en: 'Reset to initial exercise template'
  },
  tsValidationTitle: {
    es: 'Validación inmediata en navegador (TypeScript)',
    en: 'Instant client validation (TypeScript)'
  },
  pyodideValidationTitle: {
    es: 'Ejecutá tu código en Python real compilado a WebAssembly en un Web Worker',
    en: 'Runs your code in real Python compiled to WebAssembly inside a Web Worker'
  },
  understandTitle: {
    es: '3. Comprender: Solución en Python, Correctness y Complejidad',
    en: '3. Understand: Python Solution, Correctness & Complexity'
  },
  understandLead: {
    es: 'Analizá en detalle cómo opera el algoritmo óptimo. Observá la traza paso a paso y comprendé la demostración de corrección formal.',
    en: 'Analyze in detail how the optimal algorithm works. Observe the step-by-step trace and understand the correctness proof.'
  },
  understandVisualizerHeading: {
    es: 'Ejecución Visual y Traza de Estados',
    en: 'Visual Execution & State Trace'
  },
  understandCanonicalHeading: {
    es: 'Solución en Python',
    en: 'Python Solution'
  },
  understandPython3: {
    es: 'Python 3',
    en: 'Python 3'
  },
  understandPseudocode: {
    es: 'Pseudocódigo',
    en: 'Pseudocode'
  },
  understandCorrectnessHeading: {
    es: '¿Por qué funciona? (Invariante y Corrección)',
    en: 'Why does it work? (Invariant & Correctness)'
  },
  understandTimeComplexity: {
    es: 'Complejidad Temporal:',
    en: 'Time Complexity:'
  },
  understandSpaceComplexity: {
    es: 'Complejidad Espacial:',
    en: 'Space Complexity:'
  },
  understandVisualizerPlaceholder: {
    es: 'El visualizador interactivo se monta aquí.',
    en: 'The interactive visualizer mounts here.'
  },
  resetCode: {
    es: 'Reiniciar Código',
    en: 'Reset Code'
  },
  proceedToUnderstand: {
    es: 'Continuar a Comprender la Solución →',
    en: 'Proceed to Understand Solution →'
  },
  instructorMode: {
    es: 'Modo Docente',
    en: 'Instructor Mode'
  },
  instructorModeActive: {
    es: 'Modo Docente Activo',
    en: 'Instructor Mode Active'
  },
  instructorModeTooltip: {
    es: 'Modo Docente (Demostración): acceso libre e inmediato a todas las fases y soluciones.',
    en: 'Instructor Mode (Demo): free and immediate access to all phases and solutions.'
  },
  instructorModeBanner: {
    es: 'Modo Docente activo: Demostración de soluciones y trazas desbloqueada en todo el catálogo.',
    en: 'Instructor Mode active: Solution demonstration and traces unlocked across the entire catalog.'
  },
  discoverTitle: {
    es: '1. Descubrir: Intuición y Planteo del Problema',
    en: '1. Discover: Intuition & Problem Setup'
  },
  discoverLead: {
    es: 'Explorá el comportamiento del problema y las restricciones del modelo. Experimentá con distintas instancias para identificar invariantes y casos límite.',
    en: 'Explore the problem behavior and model constraints. Experiment with different instances to identify invariants and boundary cases.'
  },
  discoverProblemStatement: {
    es: 'Planteo del Problema',
    en: 'Problem Statement'
  },
  discoverRulesHeading: {
    es: 'Restricciones Fundamentales:',
    en: 'Fundamental Constraints:'
  },
  discoverRule1: {
    es: 'Todas las decisiones deben cumplir con las reglas del dominio sin violar restricciones.',
    en: 'All decisions must comply with domain rules without violating constraints.'
  },
  discoverRule2: {
    es: 'Existen múltiples estados intermedios y configuraciones posibles.',
    en: 'There are multiple intermediate states and candidate configurations.'
  },
  discoverRule3: {
    es: 'El objetivo es encontrar una configuración válida o la óptima según corresponda.',
    en: 'The objective is to find a valid or optimal configuration as required.'
  },
  discoverPlaygroundHeading: {
    es: 'Espacio de Exploración Interactiva',
    en: 'Interactive Exploration Playground'
  },
  discoverPlaygroundPlaceholder: {
    es: 'Manipulador interactivo del estado del problema.',
    en: 'Interactive manipulator of the problem state.'
  },
  discoverProceedBtn: {
    es: 'Tengo una idea: Pasar a Resolver →',
    en: 'I have an idea: Proceed to Solve →'
  }
};
