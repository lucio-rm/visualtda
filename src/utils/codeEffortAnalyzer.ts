/**
 * Student Code Effort Analyzer
 * 
 * Accurately analyzes student Python code to determine genuine effort,
 * filtering out garbage/filler lines ("lineas basura"), comments, docstrings,
 * empty lines, bare pass/prints, and duplicate boilerplate.
 */

export interface CodeEffortAnalysis {
  totalLines: number;
  starterLinesCount: number;
  meaningfulLinesCount: number;
  meaningfulLinesAdded: number;
  hasRealLogic: boolean;
  effectiveLines: string[];
}

/**
 * Strips comments and docstrings from Python source code.
 */
function stripPythonCommentsAndDocstrings(source: string): string[] {
  const lines = source.split(/\r?\n/);
  const cleaned: string[] = [];
  let inMultiDocstring: 'double' | 'single' | null = null;

  for (const rawLine of lines) {
    let line = rawLine;

    // Handle multiline docstrings
    if (inMultiDocstring) {
      const endDelimiter = inMultiDocstring === 'double' ? '"""' : "'''";
      const endIndex = line.indexOf(endDelimiter);
      if (endIndex !== -1) {
        line = line.substring(endIndex + 3);
        inMultiDocstring = null;
      } else {
        continue; // Still inside docstring
      }
    }

    // Check for start of multiline docstring
    if (!inMultiDocstring) {
      const doubleIdx = line.indexOf('"""');
      const singleIdx = line.indexOf("'''");

      if (doubleIdx !== -1 && (singleIdx === -1 || doubleIdx < singleIdx)) {
        const secondIdx = line.indexOf('"""', doubleIdx + 3);
        if (secondIdx !== -1) {
          // Both starts and ends on same line
          line = line.substring(0, doubleIdx) + line.substring(secondIdx + 3);
        } else {
          line = line.substring(0, doubleIdx);
          inMultiDocstring = 'double';
        }
      } else if (singleIdx !== -1) {
        const secondIdx = line.indexOf("'''", singleIdx + 3);
        if (secondIdx !== -1) {
          line = line.substring(0, singleIdx) + line.substring(secondIdx + 3);
        } else {
          line = line.substring(0, singleIdx);
          inMultiDocstring = 'single';
        }
      }
    }

    // Strip single-line comments (# ...)
    const commentIdx = line.indexOf('#');
    if (commentIdx !== -1) {
      line = line.substring(0, commentIdx);
    }

    const trimmed = line.trim();
    if (trimmed.length > 0) {
      cleaned.push(trimmed);
    }
  }

  return cleaned;
}

/**
 * Checks whether a single trimmed line represents meaningful algorithmic logic
 * vs trivial boilerplate / filler / debugging print statements.
 */
function isMeaningfulLine(line: string): boolean {
  const trimmed = line.trim();

  // 1. Trivial single-token keywords
  if (
    trimmed === 'pass' ||
    trimmed === '...' ||
    trimmed === 'break' ||
    trimmed === 'continue' ||
    trimmed === 'return' ||
    trimmed === 'return None'
  ) {
    return false;
  }

  // 2. Pure print or logging statements (debugging lines do not count as algorithm logic)
  if (/^print\s*\(.*\)$/.test(trimmed) || /^logging\./.test(trimmed)) {
    return false;
  }

  // 3. Trivial identity assignments (e.g. x = x, a = 1 repeated)
  if (/^([a-zA-Z_]\w*)\s*=\s*\1$/.test(trimmed)) {
    return false;
  }

  // 4. Must have at least some minimal substance (> 2 characters)
  if (trimmed.length <= 2) {
    return false;
  }

  // 5. Check for valid Python syntax tokens or constructs
  const hasAlgorithmicKeyword = /^(def\s+|for\s+|while\s+|if\s+|elif\s+|else:|with\s+|try:|except(\s+.*)?:|return\s+|yield\s+)/.test(
    trimmed
  );
  const hasAssignmentOrOp = /[=+\-*/%<>&|^]/.test(trimmed) || trimmed.includes('[') || trimmed.includes('(');

  return hasAlgorithmicKeyword || hasAssignmentOrOp;
}

/**
 * Analyzes student code effort compared to the exercise's starter template.
 */
export function analyzeStudentCodeEffort(
  code: string,
  starterCode?: string
): CodeEffortAnalysis {
  const studentCleanLines = stripPythonCommentsAndDocstrings(code || '');
  const starterCleanLines = starterCode ? stripPythonCommentsAndDocstrings(starterCode) : [];

  // Create a lookup set of normalized starter lines to exclude template lines
  const starterSet = new Set(starterCleanLines.map((l) => l.replace(/\s+/g, ' ')));

  // Filter student lines: must be meaningful, not in starter, and deduplicated
  const seenLinePatterns = new Map<string, number>();
  const effectiveLines: string[] = [];

  for (const line of studentCleanLines) {
    if (!isMeaningfulLine(line)) continue;

    const normalized = line.replace(/\s+/g, ' ');
    if (starterSet.has(normalized)) continue;

    // Guard against artificial copy-paste inflation: allow at most 2 duplicate occurrences of a line
    const count = seenLinePatterns.get(normalized) || 0;
    if (count >= 2) {
      continue;
    }
    seenLinePatterns.set(normalized, count + 1);
    effectiveLines.push(line);
  }

  const meaningfulLinesAdded = effectiveLines.length;
  const hasRealLogic =
    meaningfulLinesAdded >= 3 &&
    effectiveLines.some((l) => /^(def |for |while |if |return )/.test(l));

  return {
    totalLines: (code || '').split('\n').length,
    starterLinesCount: starterCleanLines.length,
    meaningfulLinesCount: studentCleanLines.filter(isMeaningfulLine).length,
    meaningfulLinesAdded,
    hasRealLogic,
    effectiveLines
  };
}
