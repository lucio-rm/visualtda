import React, { useState, useMemo, useRef } from 'react';
import { ExerciseMetadata } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { EXERCISE_SOLVE_CONTENT, TestCaseResult } from '../engine/exerciseContent';
import { runPythonTests } from '../runtime/pythonTestRunner';
import { pythonService } from '../runtime/pythonExecutionService';
import { useStudentProgress } from '../context/StudentProgressContext';
import { useInstructorMode } from '../context/InstructorModeContext';
import { recordLegitimateExercisePass, recordHonestSkipPass } from '../utils/cryptoAuth';
import { recordStudentAttempt, getStudentAttempts, getApprovedStudentSolution } from '../utils/studentAttempts';
import { analyzeStudentCodeEffort } from '../utils/codeEffortAnalyzer';
import { getHintUnlockStatus } from '../utils/hintGating';
import { HintRequirementWidget } from './HintRequirementWidget';
import { StudentAttemptsViewer } from './StudentAttemptsViewer';
import { highlightPythonCode } from '../utils/pythonSyntaxHighlighter';

function localizeStarterCode(rawCode: string, lang: 'es' | 'en'): string {
  if (lang === 'es') return rawCode;

  return rawCode
    .replace(/# Escribí tu solución aquí en Python 3/g, '# Write your solution here in Python 3')
    .replace(/# Escribe tu algoritmo de backtracking con podas aquí/g, '# Write your backtracking algorithm with pruning here')
    .replace(/# Escribe tu algoritmo de programación dinámica aquí/g, '# Write your dynamic programming algorithm here')
    .replace(/# Escribe tu algoritmo divide y vencerás aquí/g, '# Write your divide-and-conquer algorithm here')
    .replace(/# Escribe tu lógica (?:voraz|greedy) aquí/g, '# Write your greedy logic here')
    .replace(/# Escribe tu algoritmo aquí/g, '# Write your algorithm here')
    .replace(/# Tu implementación aquí/g, '# Your implementation here')
    .replace(/# Implementación aquí/g, '# Implementation here')
    .replace(/Coloca n reinas en un tablero de n x n sin que se amenacen\./g, 'Place n queens on an n x n chessboard with no threats.')
    .replace(/Retorna la lista de todas las soluciones válidas\./g, 'Return the list of all valid solutions.')
    .replace(/Encuentra todos los subconjuntos cuya suma sea igual al objetivo\./g, 'Find all subsets whose sum equals target.')
    .replace(/Asigna a cada vértice un color del 1 al k sin aristas monocromáticas\./g, 'Assign each vertex a color 1..k without monochromatic edges.')
    .replace(/Resuelve el tablero de Sudoku in-place respetando restricciones\./g, 'Solve Sudoku board in-place satisfying constraints.')
    .replace(/Encuentra un ciclo simple cerrado que visite todos los vértices\./g, 'Find a simple closed cycle visiting all vertices.')
    .replace(/Calcula el costo del tour de costo mínimo para el TSP\./g, 'Compute the minimum cost tour for TSP.')
    .replace(/Maximiza el valor de los objetos empacados sin exceder la capacidad\./g, 'Maximize packed items value without exceeding capacity.')
    .replace(/Encuentra un recorrido de caballo completo en tablero n x n\./g, "Find a complete knight's tour on an n x n chessboard.")
    .replace(/Ordena el arreglo utilizando el paradigma divide y vencerás\./g, 'Sort the array using divide and conquer paradigm.')
    .replace(/Encuentra el subarreglo contiguo de máxima suma\./g, 'Find contiguous subarray with maximum sum.')
    .replace(/Encuentra un elemento que sea mayor o igual a sus vecinos contiguos\./g, 'Find an element greater than or equal to adjacent neighbors.')
    .replace(/Cuenta la cantidad de inversiones en tiempo O\(n log n\)\./g, 'Count inversions in O(n log n) time.')
    .replace(/Selecciona el conjunto máximo de intervalos compatibles\./g, 'Select maximum set of mutually compatible intervals.')
    .replace(/Resuelve la mochila fraccionaria con estrategia (?:voraz|greedy)\./g, 'Solve fractional knapsack with greedy strategy.')
    .replace(/Calcula posiciones óptimas de antenas para cubrir todas las casas\./g, 'Compute optimal antenna positions to cover all houses.')
    .replace(/Construye los códigos de Huffman para los caracteres dados\./g, 'Build Huffman codes for given characters.')
    .replace(/Minimiza la cantidad de aulas para dar todas las clases\./g, 'Minimize number of classrooms to schedule all lectures.')
    .replace(/Minimiza el retraso máximo de las tareas planificadas\./g, 'Minimize maximum lateness of scheduled jobs.')
    .replace(/Calcula distancias mínimas desde el vértice origen\./g, 'Compute shortest path distances from source vertex.')
    .replace(/Encuentra el árbol generador mínimo utilizando el algoritmo de Kruskal\./g, 'Find minimum spanning tree using Kruskal algorithm.')
    .replace(/Maximiza ganancias sin trabajar dos días consecutivos\./g, 'Maximize earnings without working consecutive days.')
    .replace(/Calcula la menor cantidad de monedas para dar cambio exacto\./g, 'Compute minimum coins to give exact change.')
    .replace(/Encuentra la subsecuencia común más larga entre dos cadenas\./g, 'Find longest common subsequence between two strings.')
    .replace(/Maximiza el peso total de intervalos compatibles ponderados\./g, 'Maximize total weight of compatible weighted intervals.')
    .replace(/Calcula la partición óptima balanceando error y penalización\./g, 'Compute optimal partition balancing error and penalty.')
    .replace(/Calcula el flujo máximo desde la fuente hasta el sumidero\./g, 'Compute maximum flow from source to sink.');
}

function formatTestOutput(text: string | undefined, lang: 'es' | 'en'): string {
  if (!text) return '';
  if (lang === 'es') return text;
  return text
    .replace(/Código incompleto o sin implementar \(plantilla inicial\)/g, 'Incomplete code or unimplement stub (starter template)')
    .replace(/Exploración sistemática con podas de columnas y diagonales/g, 'Systematic exploration with pruning of columns and diagonals')
    .replace(/Exploración exhaustiva de ramas con backtracking y podas/g, 'Exhaustive exploration with backtracking and pruning')
    .replace(/Búsqueda exhaustiva sistemática con poda de filas, columnas y subcuadrículas 3x3/g, 'Exhaustive search with pruning of rows, columns, and 3x3 boxes')
    .replace(/Sin colisiones en columnas ni diagonales/g, 'No collisions in columns or diagonals')
    .replace(/Sin días adyacentes/g, 'No adjacent days')
    .replace(/soluciones válidas/g, 'valid solutions')
    .replace(/subconjuntos/g, 'subsets')
    .replace(/monedas/g, 'coins')
    .replace(/aulas/g, 'classrooms')
    .replace(/tareas disjuntas/g, 'disjoint jobs')
    .replace(/Antenas en/g, 'Antennas at')
    .replace(/Costo total/g, 'Total cost')
    .replace(/Flujo máximo/g, 'Maximum flow')
    .replace(/Retraso máximo/g, 'Maximum lateness')
    .replace(/Valor óptimo/g, 'Optimal value')
    .replace(/Costo óptimo/g, 'Optimal cost')
    .replace(/Vértice óptimo/g, 'Optimal vertex');
}

interface SolveViewProps {
  exercise: ExerciseMetadata;
  onSuccess: () => void;
  onAdvanceToUnderstand?: () => void;
  onSkipToUnderstand: () => void;
  starterCode?: string;
}

export const SolveView: React.FC<SolveViewProps> = ({
  exercise,
  onSuccess,
  onAdvanceToUnderstand,
  onSkipToUnderstand,
  starterCode
}) => {
  const { language, t, dict } = useLanguage();
  const { markAttempted, markTesting, markPassed } = useStudentProgress();
  const { isInstructorMode } = useInstructorMode();

  const [attempts, setAttempts] = useState(() => getStudentAttempts(exercise.id));
  const [showAttemptsViewer, setShowAttemptsViewer] = useState(false);

  const content = useMemo(() => {
    return EXERCISE_SOLVE_CONTENT[exercise.id] || null;
  }, [exercise.id]);

  const storageKey = `visual_tda_code_${exercise.id}`;
  const rawStarter = starterCode || content?.starterCode || '# Escribí tu solución aquí en Python 3\ndef resolver():\n    pass\n';
  const defaultCode = useMemo(() => localizeStarterCode(rawStarter, language), [rawStarter, language]);

  const [code, setCodeState] = useState<string>(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      return saved !== null ? saved : defaultCode;
    } catch {
      return defaultCode;
    }
  });

  const gutterRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const lineCount = useMemo(() => Math.max(code.split('\n').length, 1), [code]);
  const highlightedHtml = useMemo(() => highlightPythonCode(code), [code]);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const { scrollTop, scrollLeft } = e.currentTarget;
    if (highlightRef.current) {
      highlightRef.current.scrollTop = scrollTop;
      highlightRef.current.scrollLeft = scrollLeft;
    }
    if (gutterRef.current) {
      gutterRef.current.scrollTop = scrollTop;
    }
  };

  const setCode = (newCode: string) => {
    setCodeState(newCode);
    markAttempted(exercise.id);
    try {
      sessionStorage.setItem(storageKey, newCode);
    } catch {
      // Ignore quota error
    }
  };

  const handleResetCode = () => {
    setCode(defaultCode);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    const start = target.selectionStart;
    const end = target.selectionEnd;

    if (e.key === 'Tab') {
      e.preventDefault();

      if (e.shiftKey) {
        // Shift + Tab: Unindent selected lines or current line
        const beforeSelection = code.substring(0, start);
        const lineStartIndex = beforeSelection.lastIndexOf('\n') + 1;
        let lineEndIndex = code.indexOf('\n', end);
        if (lineEndIndex === -1) lineEndIndex = code.length;

        const affectedBlock = code.substring(lineStartIndex, lineEndIndex);
        const lines = affectedBlock.split('\n');

        let removedFromFirstLine = 0;
        let totalRemoved = 0;

        const unindentedLines = lines.map((line, idx) => {
          let spacesToRemove = 0;
          if (line.startsWith('    ')) {
            spacesToRemove = 4;
          } else if (line.startsWith('\t')) {
            spacesToRemove = 1;
          } else {
            const match = line.match(/^ +/);
            if (match) spacesToRemove = match[0].length;
          }

          if (spacesToRemove > 0) {
            totalRemoved += spacesToRemove;
            if (idx === 0) removedFromFirstLine = spacesToRemove;
            return line.substring(spacesToRemove);
          }
          return line;
        });

        const newBlock = unindentedLines.join('\n');
        const newCode = code.substring(0, lineStartIndex) + newBlock + code.substring(lineEndIndex);
        setCode(newCode);

        requestAnimationFrame(() => {
          const newStart = Math.max(lineStartIndex, start - removedFromFirstLine);
          const newEnd = Math.max(newStart, end - totalRemoved);
          target.setSelectionRange(newStart, newEnd);
        });
      } else {
        // Tab: Indent
        if (start !== end) {
          // Multi-line selection: indent all selected lines
          const beforeSelection = code.substring(0, start);
          const lineStartIndex = beforeSelection.lastIndexOf('\n') + 1;
          let lineEndIndex = code.indexOf('\n', end);
          if (lineEndIndex === -1) lineEndIndex = code.length;

          const affectedBlock = code.substring(lineStartIndex, lineEndIndex);
          const lines = affectedBlock.split('\n');
          const indentedLines = lines.map((line) => '    ' + line);
          const newBlock = indentedLines.join('\n');

          const newCode = code.substring(0, lineStartIndex) + newBlock + code.substring(lineEndIndex);
          setCode(newCode);

          requestAnimationFrame(() => {
            target.setSelectionRange(start + 4, end + (4 * lines.length));
          });
        } else {
          // Single cursor: insert 4 spaces
          const spaces = '    ';
          const newCode = code.substring(0, start) + spaces + code.substring(end);
          setCode(newCode);
          requestAnimationFrame(() => {
            target.setSelectionRange(start + 4, start + 4);
          });
        }
      }
    } else if (e.key === 'Backspace' && start === end) {
      // Smart dedent on Backspace if preceded only by 4 spaces
      const currentLineBeforeCursor = code.substring(0, start).split('\n').pop() || '';
      if (/^ {2,4}$/.test(currentLineBeforeCursor)) {
        e.preventDefault();
        const removeCount = currentLineBeforeCursor.length;
        const newCode = code.substring(0, start - removeCount) + code.substring(end);
        setCode(newCode);
        requestAnimationFrame(() => {
          target.setSelectionRange(start - removeCount, start - removeCount);
        });
      }
    } else if (e.key === 'Enter') {
      const currentLine = code.substring(0, start).split('\n').pop() || '';
      const indentMatch = currentLine.match(/^\s*/);
      let indent = indentMatch ? indentMatch[0] : '';
      if (currentLine.trim().endsWith(':')) {
        indent += '    ';
      }
      if (indent.length > 0) {
        e.preventDefault();
        const newCode = code.substring(0, start) + '\n' + indent + code.substring(end);
        setCode(newCode);
        requestAnimationFrame(() => {
          target.setSelectionRange(start + 1 + indent.length, start + 1 + indent.length);
        });
      }
    }
  };

  const [revealedHints, setRevealedHints] = useState<number[]>([]);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'running' | 'passed' | 'failed'>('idle');
  const [testSummary, setTestSummary] = useState<string>('');
  const [testResults, setTestResults] = useState<TestCaseResult[]>([]);
  const [stdout, setStdout] = useState<string | null>(null);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [executionTimeMs, setExecutionTimeMs] = useState<number | null>(null);
  const [execEngine, setExecEngine] = useState<'ts' | 'pyodide'>('ts');

  const hints = content?.hints || [
    {
      es: 'Pista 1: Identificá qué subproblemas se repiten o qué propiedad invariante debe mantenerse en cada paso.',
      en: 'Hint 1: Identify repeating subproblems or invariant properties that must hold at each step.'
    },
    {
      es: 'Pista 2: Analizá si podés podar ramas inviables tempranamente o si una elección local miope conduce al óptimo.',
      en: 'Hint 2: Analyze early pruning of infeasible branches or whether a greedy choice leads to global optimality.'
    },
    {
      es: 'Pista 3: Comprobá los casos base antes de generalizar el paso recursivo o inductivo.',
      en: 'Hint 3: Verify base cases before generalizing the recursive or inductive step.'
    }
  ];

  const toggleHint = (index: number) => {
    if (revealedHints.includes(index)) {
      setRevealedHints(revealedHints.filter((h) => h !== index));
    } else {
      setRevealedHints([...revealedHints, index]);
    }
  };

  const handleRunTests = async () => {
    setExecEngine('ts');
    setTestStatus('running');
    setStdout(null);
    setRuntimeError(null);
    setExecutionTimeMs(null);
    setTestSummary(t(dict.testsRunning));

    // Async execution simulation
    await new Promise((resolve) => setTimeout(resolve, 200));

    if (content?.runTests) {
      const evaluation = await content.runTests(code);
      setTestResults(evaluation.results);

      if (evaluation.passed) {
        setTestStatus('passed');
        recordLegitimateExercisePass(exercise.id);
        markPassed(exercise.id, evaluation.totalPassed, evaluation.totalTests);
        setTestSummary(
          language === 'es'
            ? `${evaluation.totalPassed} / ${evaluation.totalTests} casos de prueba superados con éxito.`
            : `${evaluation.totalPassed} / ${evaluation.totalTests} test cases passed successfully.`
        );
        onSuccess();
      } else {
        setTestStatus('failed');
        markTesting(exercise.id, evaluation.totalPassed, evaluation.totalTests);
        setTestSummary(
          language === 'es'
            ? `${evaluation.totalPassed} / ${evaluation.totalTests} pruebas superadas. Revisá las condiciones y salidas fallidas en la tabla de abajo.`
            : `${evaluation.totalPassed} / ${evaluation.totalTests} tests passed. Check failed conditions and outputs below.`
        );
      }

      const effort = analyzeStudentCodeEffort(code, rawStarter);
      recordStudentAttempt(exercise.id, {
        exerciseId: exercise.id,
        code,
        passed: evaluation.passed,
        passedTestsCount: evaluation.totalPassed,
        totalTestsCount: evaluation.totalTests,
        meaningfulLinesCount: effort.meaningfulLinesAdded,
        engine: 'ts',
        executionTimeMs: null
      });
      setAttempts(getStudentAttempts(exercise.id));
    } else {
      // Evaluate against Python test runner with real test cases
      const evalResult = await runPythonTests(exercise.id, code);
      setTestResults(evalResult.results);
      if (evalResult.passed) {
        setTestStatus('passed');
        recordLegitimateExercisePass(exercise.id);
        markPassed(exercise.id, evalResult.totalPassed, evalResult.totalTests);
        setTestSummary(
          language === 'es'
            ? `${evalResult.totalPassed} / ${evalResult.totalTests} casos de prueba superados con éxito.`
            : `${evalResult.totalPassed} / ${evalResult.totalTests} test cases passed successfully.`
        );
        onSuccess();
      } else {
        setTestStatus('failed');
        markTesting(exercise.id, evalResult.totalPassed, evalResult.totalTests);
        setTestSummary(
          language === 'es'
            ? `${evalResult.totalPassed} / ${evalResult.totalTests} casos superados. El código no satisfizo todas las restricciones o contiene errores.`
            : `${evalResult.totalPassed} / ${evalResult.totalTests} passed. Code did not satisfy all constraints or contains errors.`
        );
      }

      const effort = analyzeStudentCodeEffort(code, rawStarter);
      recordStudentAttempt(exercise.id, {
        exerciseId: exercise.id,
        code,
        passed: evalResult.passed,
        passedTestsCount: evalResult.totalPassed,
        totalTestsCount: evalResult.totalTests,
        meaningfulLinesCount: effort.meaningfulLinesAdded,
        engine: 'ts',
        executionTimeMs: null
      });
      setAttempts(getStudentAttempts(exercise.id));
    }
  };

  const handleRunPyodide = async () => {
    setExecEngine('pyodide');
    setTestStatus('running');
    setStdout(null);
    setRuntimeError(null);
    setExecutionTimeMs(null);
    setTestSummary(
      language === 'es'
        ? 'Iniciando Web Worker y ejecutando en entorno Python (Pyodide)...'
        : 'Starting Web Worker and running in Python (Pyodide) environment...'
    );

    const evalResult = await runPythonTests(exercise.id, code);
    setStdout(evalResult.stdout || null);
    setRuntimeError(evalResult.runtimeError || null);
    setExecutionTimeMs(evalResult.executionTimeMs);

    const effectiveResults: TestCaseResult[] =
      evalResult.results && evalResult.results.length > 0
        ? evalResult.results
        : [
            {
              testId: 'py-runtime-error',
              description: {
                es: 'Compilación y Ejecución en Entorno Python',
                en: 'Compilation and Execution in Python Environment'
              },
              passed: false,
              message: evalResult.runtimeError || (language === 'es' ? 'El código no pudo ejecutarse correctamente.' : 'Code failed to execute cleanly.'),
              expected: language === 'es' ? 'Ejecución limpia sin excepciones' : 'Clean execution without exceptions',
              actual: evalResult.runtimeError
                ? (language === 'es' ? 'Excepción / Error en ejecución' : 'Exception / Runtime error')
                : (language === 'es' ? 'Fallo en la ejecución' : 'Execution failure')
            }
          ];

    setTestResults(effectiveResults);

    if (evalResult.isEnvironmentError) {
      setTestStatus('failed');
      markTesting(exercise.id, evalResult.totalPassed, evalResult.totalTests);
      setTestSummary(
        language === 'es'
          ? 'El entorno Python no pudo inicializarse. Este fallo no corresponde a un error en tu código sino a la inicialización de WebAssembly/Pyodide. Podés reintentar la ejecución o validar con el motor TypeScript.'
          : 'The Python environment could not be initialized. This failure is an infrastructure/WebAssembly issue, not an error in your code. You can retry or run local TypeScript validation.'
      );
    } else if (evalResult.runtimeError) {
      setTestStatus('failed');
      markTesting(exercise.id, evalResult.totalPassed, evalResult.totalTests);
      setTestSummary(
        language === 'es'
          ? 'Error detectado durante la ejecución en Python. Revisa la traza abajo y los casos fallidos.'
          : 'Error detected during Python execution. Check the traceback and failed test cases below.'
      );
    } else if (evalResult.passed) {
      setTestStatus('passed');
      recordLegitimateExercisePass(exercise.id);
      markPassed(exercise.id, evalResult.totalPassed, evalResult.totalTests);
      setTestSummary(
        language === 'es'
          ? `${evalResult.totalPassed} / ${evalResult.totalTests} pruebas superadas exitosamente en ${Math.round(evalResult.executionTimeMs)} ms.`
          : `${evalResult.totalPassed} / ${evalResult.totalTests} tests passed successfully in ${Math.round(evalResult.executionTimeMs)} ms.`
      );
      onSuccess();
    } else {
      setTestStatus('failed');
      markTesting(exercise.id, evalResult.totalPassed, evalResult.totalTests);
      setTestSummary(
        language === 'es'
          ? `${evalResult.totalPassed} / ${evalResult.totalTests} pruebas superadas. Revisa los casos fallidos en la tabla.`
          : `${evalResult.totalPassed} / ${evalResult.totalTests} tests passed. Check failed test cases in table.`
      );
    }

    const effort = analyzeStudentCodeEffort(code, rawStarter);
    recordStudentAttempt(exercise.id, {
      exerciseId: exercise.id,
      code,
      passed: evalResult.passed,
      passedTestsCount: evalResult.totalPassed,
      totalTestsCount: evalResult.totalTests,
      meaningfulLinesCount: effort.meaningfulLinesAdded,
      engine: 'pyodide',
      executionTimeMs: evalResult.executionTimeMs
    });
    setAttempts(getStudentAttempts(exercise.id));
  };

  return (
    <section className="phase-view solve-view" aria-labelledby="solve-heading">
      <div className="view-intro">
        <h3 id="solve-heading" className="view-title">
          {t(dict.solveTitle)}
        </h3>
        <p className="view-lead">
          {t(dict.solveLead)}
        </p>
      </div>

      <div className="solve-layout">
        <div className="solve-editor-column">
          <div className="editor-card">
            <div className="editor-header">
              <div className="editor-header-left" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="editor-lang-badge">Python 3</span>
                <span className="editor-filename">{language === 'es' ? 'solucion.py' : 'solution.py'}</span>
              </div>
              <button
                type="button"
                className="btn-reset-code"
                onClick={handleResetCode}
                title={t(dict.resetTemplateAriaLabel)}
                aria-label={t(dict.resetTemplateAriaLabel)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted, #94a3b8)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  padding: '0.25rem 0.5rem'
                }}
              >
                {t(dict.resetTemplate)}
              </button>
            </div>
            <div className="editor-input-wrapper">
              <div ref={gutterRef} className="editor-gutter" aria-hidden="true">
                {Array.from({ length: lineCount }, (_, i) => (
                  <span key={i + 1} className="editor-line-number">
                    {i + 1}
                  </span>
                ))}
              </div>
              <div className="code-editor-stage">
                <pre ref={highlightRef} className="code-highlight-layer" aria-hidden="true">
                  <code dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
                </pre>
                <textarea
                  id={`vtda_code_${exercise.id}`}
                  name={`vtda_code_${exercise.id}`}
                  className="code-editor-input"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onScroll={handleScroll}
                  rows={18}
                  aria-label={t(dict.codeEditorAriaLabel)}
                  spellCheck={false}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  data-lpignore="true"
                  data-form-type="other"
                />
              </div>
            </div>
            <div className="editor-actions">
              <button
                type="button"
                className="btn-fast-tests"
                onClick={handleRunTests}
                disabled={testStatus === 'running'}
                title={t(dict.tsValidationTitle)}
              >
                {testStatus === 'running' && execEngine === 'ts' ? t(dict.testsRunning) : t(dict.runTests)}
              </button>

              {pythonService.isSupported && (
                <button
                  type="button"
                  className="btn-pyodide"
                  onClick={handleRunPyodide}
                  disabled={testStatus === 'running'}
                  title={t(dict.pyodideValidationTitle)}
                >
                  {testStatus === 'running' && execEngine === 'pyodide' ? t(dict.testsRunning) : t(dict.runPyodideTests)}
                </button>
              )}
            </div>
          </div>

          {testStatus !== 'idle' && (
            <div className={`test-feedback-card ${testStatus}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0 }}>{t(dict.evaluationResult)}</h4>
                {executionTimeMs !== null && (
                  <div className="test-meta-bar">
                    <span className="test-meta-badge">
                      {execEngine === 'pyodide' ? 'Python Web Worker' : 'TypeScript Validator'}
                    </span>
                    <span>{t(dict.executionTime)} {Math.round(executionTimeMs)} ms</span>
                  </div>
                )}
              </div>

              <p className="test-summary-message">{testSummary}</p>

              {runtimeError && (() => {
                const isInfraError =
                  runtimeError.includes('Pyodide') ||
                  runtimeError.includes('Web Worker') ||
                  runtimeError.includes('CDN') ||
                  runtimeError.includes('WebAssembly') ||
                  runtimeError.includes('estrategia de pruebas') ||
                  runtimeError.includes('El entorno Python no pudo inicializarse');

                return (
                  <div className={`python-output-card ${isInfraError ? 'infra-error' : 'student-error'}`}>
                    <div className="python-output-header">
                      {isInfraError
                        ? (language === 'es' ? 'Fallo de Inicialización del Entorno (Infraestructura)' : 'Environment Initialization Failure (Infrastructure)')
                        : (language === 'es' ? 'Excepción / Error en Tiempo de Ejecución en tu Código' : 'Runtime Exception / Error in Your Code')}
                    </div>
                    <pre className="python-error-box">{runtimeError}</pre>
                    {isInfraError && (
                      <p style={{ marginTop: '0.5rem', marginBottom: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {language === 'es'
                          ? 'Este fallo se debe a la inicialización de WebAssembly/Pyodide, no a un error de lógica en tu solución. Podés reintentar la ejecución o usar las Pruebas Rápidas locales.'
                          : 'This failure is due to WebAssembly/Pyodide initialization, not your solution logic. You can retry or use Fast local tests.'}
                      </p>
                    )}
                  </div>
                );
              })()}

              {stdout && (
                <div className="python-output-card">
                  <div className="python-output-header">{t(dict.pythonStdOutput)}</div>
                  <pre className="python-stdout-box">{stdout}</pre>
                </div>
              )}

              {testResults.length > 0 && (
                <div className="test-case-results-list">
                  {testResults.map((tr) => (
                    <div key={tr.testId} className={`test-case-item ${tr.passed ? 'pass' : 'fail'}`}>
                      <span className="test-case-badge">{tr.passed ? 'PASS' : 'FAIL'}</span>
                      <div className="test-case-details">
                        <span className="test-case-desc">{t(tr.description)}</span>
                        {tr.message && <span className="test-case-msg">{tr.message}</span>}
                        {tr.actual && !tr.passed && (
                          <span className="test-case-actual">
                            {language === 'es' ? 'Obtenido' : 'Actual'}: {formatTestOutput(tr.actual, language)} | {language === 'es' ? 'Esperado' : 'Expected'}: {formatTestOutput(tr.expected, language)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {testStatus === 'passed' && (
                <button
                  type="button"
                  className="btn-primary mt-2"
                  onClick={onAdvanceToUnderstand || onSuccess}
                >
                  {t(dict.proceedToUnderstand)}
                </button>
              )}
            </div>
          )}

          {/* Attempt History Card */}
          <div className="card-panel attempts-history-card" style={{ marginTop: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color: 'var(--accent)' }}>
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                </svg>
                <h4 style={{ margin: 0, fontSize: '0.95rem' }}>
                  {language === 'es' ? 'Historial de Intentos' : 'Attempt History'}
                </h4>
                <span
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--surface-hover)',
                    border: '1px solid var(--border)'
                  }}
                >
                  {attempts.length}{' '}
                  {attempts.length === 1
                    ? (language === 'es' ? 'intento' : 'attempt')
                    : (language === 'es' ? 'intentos' : 'attempts')}
                </span>
              </div>
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '0.8125rem', padding: '0.35rem 0.75rem' }}
                onClick={() => setShowAttemptsViewer(!showAttemptsViewer)}
              >
                {showAttemptsViewer
                  ? (language === 'es' ? 'Ocultar Historial' : 'Hide History')
                  : (language === 'es' ? 'Ver Intentos' : 'View Attempts')}
              </button>
            </div>
            {showAttemptsViewer && (
              <StudentAttemptsViewer
                attempts={attempts}
                language={language}
                onRestoreCode={(restoredCode) => setCode(restoredCode)}
                approvedSolution={getApprovedStudentSolution(exercise.id)}
              />
            )}
          </div>
        </div>

        <aside className="solve-sidebar">
          <div className="hints-card">
            <h4>{t(dict.hintsTitle)}</h4>
            <p className="hints-desc">
              {t(dict.hintsDesc)}
            </p>
            <div className="hints-list">
              {hints.map((hint, idx) => {
                const isRevealed = revealedHints.includes(idx);
                const unlockStatus = getHintUnlockStatus(
                  exercise.id,
                  idx,
                  code,
                  rawStarter,
                  isInstructorMode
                );

                return (
                  <div key={idx} className={`hint-item ${unlockStatus.isUnlocked ? 'hint-unlocked' : 'hint-locked'}`}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.35rem' }}>
                      <button
                        type="button"
                        className={`btn-toggle-hint ${isRevealed ? 'revealed' : ''} ${!unlockStatus.isUnlocked ? 'locked' : ''}`}
                        onClick={() => {
                          if (unlockStatus.isUnlocked) toggleHint(idx);
                        }}
                        disabled={!unlockStatus.isUnlocked}
                        aria-expanded={isRevealed}
                      >
                        {!unlockStatus.isUnlocked ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                            <span style={{ fontSize: '0.75rem', padding: '0.1rem 0.35rem', background: 'var(--surface-hover)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              {language === 'es' ? 'Bloqueada' : 'Locked'}
                            </span>
                            <span>{t(dict.hintLabel)} {idx + 1}</span>
                          </span>
                        ) : isRevealed ? (
                          `${t(dict.hintLabel)} ${idx + 1}`
                        ) : (
                          `${t(dict.viewHintLabel)} ${idx + 1}`
                        )}
                      </button>
                      <HintRequirementWidget status={unlockStatus} language={language} />
                    </div>
                    {unlockStatus.isUnlocked && isRevealed && (
                      <div className="hint-content">{t(hint)}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="skip-solution-card">
            <h4>{t(dict.skipSolutionTitle)}</h4>
            <p>
              {t(dict.skipSolutionDesc)}
            </p>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowSkipModal(true)}
            >
              {t(dict.viewCanonicalSolution)}
            </button>
          </div>
        </aside>
      </div>

      {showSkipModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="skip-dialog-title">
          <div className="modal-card">
            <h4 id="skip-dialog-title">{t(dict.skipModalTitle)}</h4>
            <p>{t(dict.skipModalBody)}</p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowSkipModal(false)}
              >
                {t(dict.skipModalCancel)}
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  setShowSkipModal(false);
                  recordHonestSkipPass(exercise.id);
                  onSkipToUnderstand();
                }}
              >
                {t(dict.skipModalConfirm)} &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
