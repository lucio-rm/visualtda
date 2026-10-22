# Visual TDA — Curriculum Academic Audit (20 Foundational Exercises)

**Document Version**: 1.0  
**Scope**: Auditoría Curricular y Cobertura Académica de Visual TDA — Principios de Rigor Pedagógico y Explicación del *Por Qué*  
**Academic References**:
- Jon Kleinberg & Éva Tardos, *Algorithm Design*, Pearson / Addison-Wesley.
- Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein, *Introduction to Algorithms (CLRS)*, 3rd/4th Edition, MIT Press.
- Cátedras de *Teoría de Algoritmos* y *Algoritmos y Programación II/III*, Facultad de Ingeniería, Universidad de Buenos Aires (FIUBA).

---

## 1. Executive Summary & Curriculum Methodology

Visual TDA is an interactive educational platform designed to build deep algorithmic intuition and formal rigor for undergraduate computer science and engineering students.

### 1.1 The 3-Phase Pedagogical Progression
Every exercise adheres strictly to the decoupled 3-phase learning architecture:
1. **Discover (*Descubrir*)**: Fosters perceptual intuition through direct manipulation in an interactive playground before writing code. Students confront edge cases and constraints visually.
2. **Solve (*Resolver*)**: Engages active recall and coding synthesis in standard Python 3. Supported by progressive 3-tiered hints, immediate test execution in an isolated Web Worker sandbox, and descriptive validator feedback.
3. **Understand (*Comprender*)**: Bridges practice to mathematical formalism. Features synchronized, bidirectional trace timeline playback, formal correctness arguments (invariants, exchange arguments, inductive hypotheses), and asymptotic time/space complexities.

### 1.2 Syllabus Coverage Across Algorithmic Paradigms
The 20 foundational exercises span 9 fundamental paradigms:

| Paradigm | Exercise Count | Foundational Problem Set |
|:---|:---:|:---|
| **Divide & Conquer** | 4 | Merge Sort, Maximum Subarray, Peak Finding, Inversion Counting |
| **Greedy Algorithms** | 4 | Interval Scheduling, Fractional Knapsack, Highway Antennas, Huffman Coding |
| **Dynamic Programming** | 5 | 0/1 Knapsack, Juan el Vago (MWIS path), Coin Change, Longest Common Subsequence, Weighted Interval Scheduling |
| **Backtracking** | 3 | N-Queens, Subset Sum (with bounding prunings), Graph Coloring (k-Coloring) |
| **Network Flow** | 1 | Maximum Flow & Minimum Cut (Edmonds-Karp / Ford-Fulkerson) |
| **Linear Programming** | 1 | Feasible Region Convex Polytope & Integer Modeling (ILP) |
| **Problem Reductions** | 1 | Independent Set $\le_P$ Vertex Cover (NP-completeness duality) |
| **Approximation Algorithms** | 1 | 2-Approximation for Vertex Cover (Maximal Matching bound) |
| **Randomized Algorithms** | 1 | Fair Coin from Biased Coin (Von Neumann randomness extraction) |
| **Total** | **21** | **Complete Core Undergraduate Syllabus** |

---

## 2. In-Depth Exercise-by-Exercise Academic Audit

---

### Exercise 01: N-Reinas (`n-queens`)
- **Paradigm**: Backtracking (Exhaustive Search with Pruning)
- **Textbook References**:
  - Kleinberg & Tardos: Chapter 8 (Backtracking principles)
  - CLRS: Chapter 35 (State-space trees and constraint satisfaction)
  - FIUBA: Guía de Backtracking (Problemas de satisfacción de restricciones)
- **Difficulty**: 2 / 5 (Foundational introductory backtracking problem)
- **Learning Objectives**:
  - Understand the state-space recursion tree where depth represents board rows and branching represents column placement.
  - Implement $O(1)$ constraint checking via row, column, and diagonal bitsets/sets.
  - Understand the backtracking invariant: undoing state mutations upon unwinding recursion.
- **Formal Correctness & Key Invariant**:
  - *State Invariant*: At depth $k$, queens on rows $0 \dots k-1$ mutually do not attack horizontally, vertically, or diagonally.
  - *Conflict Identity*: Two queens at $(r_1, c_1)$ and $(r_2, c_2)$ conflict if $c_1 = c_2$ or $|r_1 - r_2| = |c_1 - c_2|$. Tracking $r - c$ (main diagonal) and $r + c$ (anti-diagonal) guarantees non-interference in $O(1)$ per cell test.
  - *Pruning Condition*: If col $c \in \text{cols}$ or $(r - c) \in \text{diag}_1$ or $(r + c) \in \text{diag}_2$, branch exploration aborts immediately without traversing descendants.
- **Asymptotic Complexity**:
  - *Time Complexity*: $O(N!)$ worst case (bounded above by $N^N$, tightly bounded by $\approx O(N! / c^N)$ due to diagonal pruning).
  - *Space Complexity*: $O(N)$ auxiliary space (recursion stack depth $N$ plus tracking sets of size $O(N)$).
- **Visualizer Pedagogical Value**:
  - SVG chessboard renders attack rays dynamically. Red conflict lines demonstrate visually why a subtree was pruned.
- **Independent Verification Oracle**:
  - Validated by independent board attack matrix checker (`tests/oracles/referenceSolvers.ts`) verifying zero attacks for all reported configurations.

---

### Exercise 02: Suma de Subconjuntos (`subset-sum-backtracking`)
- **Paradigm**: Backtracking / Branch & Bound
- **Textbook References**:
  - Kleinberg & Tardos: Section 6.4 & Section 8.8 (Backtracking search on NP-hard instances)
  - CLRS: Chapter 35 (Approximation and Branch & Bound)
  - FIUBA: Guía de Técnicas Algorítmicas — Backtracking con Podas
- **Difficulty**: 2 / 5
- **Learning Objectives**:
  - Distinguish between brute-force generate-and-test ($2^n$) and intelligent search with dual-direction pruning.
  - Formulate bounding functions: excess sum pruning ($current\_sum + item > target$) and deficit reachability pruning ($current\_sum + \sum remaining < target$).
- **Formal Correctness & Key Invariant**:
  - *Search Tree*: Binary decision tree (include vs. exclude element $i$).
  - *Pruning Invariant 1 (Excess)*: For positive integers, if $\text{partial\_sum} > S$, no continuation can sum to $S$.
  - *Pruning Invariant 2 (Sufficiency)*: If $\text{partial\_sum} + \sum_{k=i}^{n-1} w_k < S$, the maximum possible sum from this branch is strictly less than $S$.
- **Asymptotic Complexity**:
  - *Time Complexity*: $O(2^n)$ worst-case; average-case pruned tree is drastically smaller on typical instances.
  - *Space Complexity*: $O(n)$ recursion stack and current branch accumulator.
- **Visualizer Pedagogical Value**:
  - Shows binary decision nodes colored green (valid target reached), red (pruned by excess/deficit), or blue (active exploration).
- **Independent Verification Oracle**:
  - Validated against $2^n$ exhaustive power-set generator in `referenceSolvers.ts`.

---

### Exercise 03: Ordenamiento por Fusión (`merge-sort`)
- **Paradigm**: Divide & Conquer
- **Textbook References**:
  - Kleinberg & Tardos: Section 5.1 (A First Recurrence: The Merge-Sort Algorithm)
  - CLRS: Section 2.3 (Designing algorithms: Divide and Conquer)
  - FIUBA: Guía de División y Conquista — Teorema Maestro
- **Difficulty**: 1 / 5
- **Learning Objectives**:
  - Grasp the recursive divide step (partition in half) and linear combination step (`merge`).
  - Apply the Master Theorem ($T(n) = 2T(n/2) + O(n)$) to derive $O(n \log n)$ deterministically.
  - Understand the concept of algorithm stability during the merge step ($A[i] \le A[j]$ preserves relative order).
- **Formal Correctness & Key Invariant**:
  - *Merge Loop Invariant*: At the start of each iteration of `merge(L, R)`, array `merged[0 \dots k-1]` contains the $k$ smallest elements of $L \cup R$ in sorted order.
  - *Termination*: By induction on array size $n$. Base case $n \le 1$ is trivially sorted. Inductive step: by induction hypothesis, $L$ and $R$ are sorted; the two-pointer comparison correctly selects the global minimum remaining.
- **Asymptotic Complexity**:
  - *Time Complexity*: $O(n \log n)$ in all cases (best, average, worst). Recurrence $T(n) = 2T(n/2) + \Theta(n)$.
  - *Space Complexity*: $O(n)$ auxiliary array space for merging, plus $O(\log n)$ call stack frames.
- **Visualizer Pedagogical Value**:
  - Visualizes recursion tree split levels followed by animated two-pointer merge into sorted auxiliary slots.

---

### Exercise 04: Subarreglo de Máxima Suma (`max-subarray-dyc`)
- **Paradigm**: Divide & Conquer
- **Textbook References**:
  - CLRS: Section 4.1 (The maximum-subarray problem)
  - Kleinberg & Tardos: Chapter 5 (Divide and Conquer recurrences)
  - FIUBA: Guía División y Conquista — Problema de Bentley
- **Difficulty**: 2 / 5
- **Learning Objectives**:
  - Identify how any optimal contiguous subarray must either lie entirely in the left half, entirely in the right half, or cross the midpoint.
  - Implement linear $O(n)$ midpoint crossing expansion using two independent prefix/suffix scans.
- **Formal Correctness & Key Invariant**:
  - *Exhaustive Partition Theorem*: For array $A[low \dots high]$ with midpoint $mid$, any contiguous subarray $A[i \dots j]$ satisfies exactly one of: (1) $j \le mid$ (left), (2) $i > mid$ (right), or (3) $i \le mid < j$ (crossing).
  - *Crossing Optimality*: Max crossing subarray is the concatenation of the maximum suffix ending at $mid$ and the maximum prefix starting at $mid+1$.
- **Asymptotic Complexity**:
  - *Time Complexity*: $O(n \log n)$ via recurrence $T(n) = 2T(n/2) + O(n)$ (Master Theorem Case 2: $a=2, b=2, d=1$).
  - *Space Complexity*: $O(\log n)$ recursion stack frames.
- **Visualizer Pedagogical Value**:
  - Displays array split into left/right blocks with a distinct highlight on the crossing window expanding outward from $mid$.

---

### Exercise 05: Búsqueda de un Pico (`peak-finding-dyc`)
- **Paradigm**: Divide & Conquer (Decrease & Conquer / Binary Search)
- **Textbook References**:
  - MIT 6.006 (Lecture 1: Peak Finding 1D & 2D)
  - Kleinberg & Tardos: Chapter 5 (Binary search principles)
  - FIUBA: Guía División y Conquista — Reducción geométrica
- **Difficulty**: 1 / 5
- **Learning Objectives**:
  - Realize that finding *a* local maximum (peak) does not require sorting or inspecting all elements.
  - Follow the ascending gradient: if $A[mid] < A[mid+1]$, at least one peak is guaranteed to exist in the right subproblem.
- **Formal Correctness & Key Invariant**:
  - *Definition*: Index $i$ is a peak if $A[i] \ge A[i-1]$ (or $i=0$) and $A[i] \ge A[i+1]$ (or $i=n-1$).
  - *Gradient Invariant*: If $A[mid] < A[mid+1]$, the right subsegment $A[mid+1 \dots high]$ contains at least one peak. Proof: either the subarray values strictly increase until the boundary $high$ (which is then a peak because it is bounded by $-\infty$), or there is some interior drop, creating a local peak.
- **Asymptotic Complexity**:
  - *Time Complexity*: $O(\log n)$ via recurrence $T(n) = T(n/2) + O(1)$.
  - *Space Complexity*: $O(1)$ iterative; $O(\log n)$ recursive stack.
- **Visualizer Pedagogical Value**:
  - Interactive bar chart showing current inspection point, slope arrows pointing uphill, and graying out the discarded half.

---

### Exercise 06: Contar Inversiones (`inversion-counting-dyc`)
- **Paradigm**: Divide & Conquer
- **Textbook References**:
  - Kleinberg & Tardos: Section 5.3 (Counting Inversions)
  - CLRS: Chapter 5 / Exercise 2-4
  - FIUBA: Guía División y Conquista — Ranking y similitud colaborativa
- **Difficulty**: 2 / 5
- **Learning Objectives**:
  - Apply Divide & Conquer to count relational pairs rather than just sort.
  - Count split inversions in $O(1)$ time per element during the merge step: when $R[j] < L[i]$, exactly $(|L| - i)$ inversions are formed.
- **Formal Correctness & Key Invariant**:
  - *Partition of Inversions*: Any inversion pair $(i, j)$ with $i < j$ and $A[i] > A[j]$ belongs to: (1) left half, (2) right half, or (3) split across halves ($i \le mid < j$).
  - *Split Counting Invariant*: Because $L$ and $R$ are sorted, if $R[j] < L[i]$, then $R[j]$ is smaller than all remaining elements $L[i], L[i+1], \dots, L[|L|-1]$. Hence, exactly $|L| - i$ split inversions cross $mid$ with $R[j]$ as second element.
- **Asymptotic Complexity**:
  - *Time Complexity*: $O(n \log n)$ via recurrence $T(n) = 2T(n/2) + O(n)$.
  - *Space Complexity*: $O(n)$ auxiliary array buffer.
- **Visualizer Pedagogical Value**:
  - Highlights inversion lines connecting transposed pairs across subarrays as merge steps execute.
- **Independent Verification Oracle**:
  - Validated against independent $O(n^2)$ pairwise reference solver in `referenceSolvers.ts`.

---

### Exercise 07: Selección de Intervalos (`interval-scheduling`)
- **Paradigm**: Greedy Algorithm
- **Textbook References**:
  - Kleinberg & Tardos: Section 4.1 (Interval Scheduling: The Greedy Algorithm Stays Ahead)
  - CLRS: Section 16.1 (An activity-selection problem)
  - FIUBA: Guía de Algoritmos Greedy — Lema de Adelanto (Greedy Stays Ahead)
- **Difficulty**: 2 / 5
- **Learning Objectives**:
  - Formulate the greedy choice criterion: select by earliest finish time ($f_i$).
  - Contrast with intuitive but flawed greedy heuristics (shortest duration, fewest conflicts, earliest start).
  - Master the formal proof by induction using the *Greedy Stays Ahead* lemma.
- **Formal Correctness & Key Invariant**:
  - *Greedy Rule*: Repeatedly choose the compatible interval that finishes first.
  - *Lemma (Greedy Stays Ahead)*: Let $i_1, i_2, \dots, i_k$ be the greedy selections, and $j_1, j_2, \dots, j_m$ be the intervals of an arbitrary optimal solution sorted by finish time. For all $r \le k$:
    $$f(i_r) \le f(j_r)$$
  - *Proof by Induction*: Base case $r=1$: greedy picks interval with minimum finish time over all intervals, so $f(i_1) \le f(j_1)$. Inductive step: assuming $f(i_{r-1}) \le f(j_{r-1})$, since $j_r$ is compatible with $j_{r-1}$, $s(j_r) \ge f(j_{r-1}) \ge f(i_{r-1})$. Hence $j_r$ is available to greedy at step $r$. Greedy picks $i_r$ with minimal finish time among available, so $f(i_r) \le f(j_r)$.
  - *Optimality*: If $m > k$, interval $j_{k+1}$ starts after $f(j_k) \ge f(i_k)$, meaning $j_{k+1}$ would be compatible and available to greedy, contradicting termination. Thus $k = m$.
- **Asymptotic Complexity**:
  - *Time Complexity*: $O(n \log n)$ dominated by sorting intervals by end time. Selection pass is $O(n)$.
  - *Space Complexity*: $O(n)$ to store sorted intervals and output list.
- **Visualizer Pedagogical Value**:
  - Timeline view with horizontal bars. Discarded conflicting intervals turn red with a timeline collision indicator; accepted intervals turn green.

---

### Exercise 08: Mochila Fraccionaria (`knapsack-greedy`)
- **Paradigm**: Greedy Algorithm (with counterexample for 0/1)
- **Textbook References**:
  - Kleinberg & Tardos: Chapter 4 (Greedy strategies vs. Dynamic Programming)
  - CLRS: Section 16.2 (Elements of the greedy strategy: Fractional vs 0-1 Knapsack)
  - FIUBA: Guía Greedy — Análisis de contraejemplos
- **Difficulty**: 2 / 5
- **Learning Objectives**:
  - Recognize when the greedy choice property holds (divisible goods) versus when it fails (discrete/indivisible 0/1 goods).
  - Prove optimality of the value-to-weight density ratio ($v_i / w_i$) via an exchange argument.
  - Construct a concrete counterexample demonstrating that greedy density fails for 0/1 Knapsack.
- **Formal Correctness & Key Invariant**:
  - *Exchange Argument*: If an optimal solution $OPT$ does not take the maximum possible fraction of the highest-density available item $k$, replacing an amount $\Delta w$ of a lower-density item $j$ with item $k$ increases total value by $\Delta w (v_k/w_k - v_j/w_j) \ge 0$, maintaining feasibility.
  - *Counterexample for 0/1*: Capacity $W=50$. Items: (A: $v=60, w=10$, density 6), (B: $v=100, w=20$, density 5), (C: $v=120, w=30$, density 4). Greedy picks A then B, remaining capacity 20 cannot take C; total value $160$. Optimal 0/1 takes B and C for value $220$ and weight $50$.
- **Asymptotic Complexity**:
  - *Time Complexity*: $O(n \log n)$ to sort items by density ratio $v_i / w_i$.
  - *Space Complexity*: $O(n)$ storage for items and fraction assignments.
- **Visualizer Pedagogical Value**:
  - Side-by-side visualizer showing fractional fill percentage of items alongside the discrete failure counterexample.

---

### Exercise 09: Antenas en una Ruta (`road-antennas-greedy`)
- **Paradigm**: Greedy Algorithm (Interval Covering)
- **Textbook References**:
  - Kleinberg & Tardos: Chapter 4, Exercise 2 (Base station placement along a road)
  - FIUBA: Guía de Algoritmos Greedy — Problema de las Antenas / Torres de Telefonía
- **Difficulty**: 2 / 5
- **Learning Objectives**:
  - Formulate greedy coverage: position antenna as far to the right as possible while still covering the leftmost uncovered house.
  - Prove optimality through an exchange argument showing any other placement covers a subset of houses covered by the greedy placement.
- **Formal Correctness & Key Invariant**:
  - *Greedy Strategy*: Let $x$ be the leftmost uncovered house. Place an antenna at $x + R$. This covers all houses in $[x, x + 2R]$.
  - *Exchange Argument*: Consider an optimal solution $OPT$. Let its first antenna be at position $p_1$. Since $x$ must be covered, $p_1 \ge x - R$. Moving $p_1$ rightward to $x + R$ cannot uncover $x$ (since $(x+R)-R = x$) and can only cover houses further to the right. Thus the set of covered houses remains equal or expands without requiring extra antennas.
- **Asymptotic Complexity**:
  - *Time Complexity*: $O(n \log n)$ to sort house coordinates; $O(n)$ single-pass placement.
  - *Space Complexity*: $O(1)$ auxiliary memory (in-place scan).
- **Visualizer Pedagogical Value**:
  - 1D highway line with interactive house markers and translucent circular/interval coverage zones placed at $x + R$.

---

### Exercise 10: Codificación de Huffman (`huffman-coding-greedy`)
- **Paradigm**: Greedy Algorithm (Min-Priority Queue)
- **Textbook References**:
  - Kleinberg & Tardos: Section 4.8 (Huffman Codes and Data Compression)
  - CLRS: Section 16.3 (Huffman codes)
  - FIUBA: Guía de Algoritmos Greedy — Árboles de prefijo óptimos
- **Difficulty**: 2 / 5
- **Learning Objectives**:
  - Understand prefix-free variable length character encoding.
  - Grasp why lowest frequency characters must be placed at the deepest level of the binary prefix tree.
  - Implement a min-heap priority queue to iteratively combine the two smallest nodes.
- **Formal Correctness & Key Invariant**:
  - *Theorem (CLRS 16.3 / K&T 4.8)*: Let $x, y$ be the two characters with lowest frequencies. There exists an optimal prefix code tree in which $x$ and $y$ are sibling leaves at the maximum depth.
  - *Proof by Exchange Argument*: If an optimal tree $T$ has sibling leaves $a, b$ at maximum depth with $f(a) \ge f(x)$ and $f(b) \ge f(y)$, swapping $x$ with $a$ and $y$ with $b$ yields a new tree $T'$ whose expected cost is $B(T) - (f(a) - f(x))(d(a) - d(x)) - (f(b) - f(y))(d(b) - d(y)) \le B(T)$. By optimal substructure, merging $x$ and $y$ into a meta-character $z$ with $f(z) = f(x) + f(y)$ reduces the problem to alphabet size $k-1$. By induction on $k$, Huffman produces an optimal tree.
- **Asymptotic Complexity**:
  - *Time Complexity*: $O(k \log k)$ for alphabet of size $k$ using a binary min-heap ($k-1$ insertions and $2(k-1)$ extractions).
  - *Space Complexity*: $O(k)$ for tree nodes and prefix code map.
- **Visualizer Pedagogical Value**:
  - Animated hierarchical tree graph builder fusing pairs of subtrees step-by-step from bottom leaves to root.
- **Independent Verification Oracle**:
  - Tested against independent prefix-free validation oracle in `referenceSolvers.ts`.

---

### Exercise 11: Mochila 0/1 (`knapsack-dp`)
- **Paradigm**: Dynamic Programming (2D Table)
- **Textbook References**:
  - Kleinberg & Tardos: Section 6.4 (Subset Sum and Knapsack: Adding a Variable)
  - CLRS: Section 16.2 / Chapter 15
  - FIUBA: Guía de Programación Dinámica — Problemas de Optimización con Capacidad
- **Difficulty**: 3 / 5
- **Learning Objectives**:
  - Recognize pseudo-polynomial time: $O(n W)$ depends on the numeric magnitude of $W$, not just input length.
  - Formulate the 2-variable recurrence relation based on the decision to take or leave item $i$.
  - Reconstruct the optimal item subset by tracing back through the DP matrix.
- **Formal Correctness & Key Invariant**:
  - *Recurrence*:
    $$OPT(i, w) = \begin{cases} 
      0 & \text{if } i = 0 \text{ or } w = 0 \\
      OPT(i-1, w) & \text{if } w_i > w \\
      \max(OPT(i-1, w), v_i + OPT(i-1, w - w_i)) & \text{if } w_i \le w 
    \end{cases}$$
  - *Optimal Substructure Invariant*: $OPT(i, w)$ is the maximum value achievable using a subset of items $\{1, \dots, i\}$ with total weight $\le w$. If optimal solution contains item $i$, the remaining subset must be optimal for $\{1, \dots, i-1\}$ with capacity $w - w_i$.
- **Asymptotic Complexity**:
  - *Time Complexity*: $O(n W)$ operations to fill an $(n+1) \times (W+1)$ table.
  - *Space Complexity*: $O(n W)$ to preserve backtrack pointers; reducible to $O(W)$ if only optimal value is needed.
- **Visualizer Pedagogical Value**:
  - Interactive 2D matrix highlighting the comparison between cell $(i-1, w)$ (exclude) and cell $(i-1, w - w_i)$ (include).
- **Independent Verification Oracle**:
  - Tested against exhaustive $2^n$ power set generator for small instances in `referenceSolvers.ts`.

---

### Exercise 12: Juan el Vago (`juan-el-vago`)
- **Paradigm**: Dynamic Programming (1D Table / MWIS on Path Graph)
- **Textbook References**:
  - Kleinberg & Tardos: Section 6.1 (Maximum-Weight Independent Set on a Path)
  - FIUBA: Guía de Programación Dinámica — Ejercicio clásico "Juan el Vago" / House Robber
- **Difficulty**: 2 / 5
- **Learning Objectives**:
  - Model linear non-consecutive choice optimization (cannot work two consecutive days).
  - Formulate 1D recurrence and space optimization from $O(n)$ to $O(1)$ variables.
  - Reconstruct selected days in $O(n)$ by backtracking from the table end.
- **Formal Correctness & Key Invariant**:
  - *Recurrence*:
    $$OPT(i) = \max(OPT(i-1), w_i + OPT(i-2))$$
  - *Optimal Substructure*: For any prefix of days $1 \dots i$, either day $i$ is not worked (best value is $OPT(i-1)$) or day $i$ is worked, which forbids day $i-1$, yielding $w_i + OPT(i-2)$. No other case exists.
- **Asymptotic Complexity**:
  - *Time Complexity*: $O(n)$ single linear pass.
  - *Space Complexity*: $O(n)$ table for full reconstruction; $O(1)$ auxiliary variables for optimal value.
- **Visualizer Pedagogical Value**:
  - Daily calendar cards with gain tags. Shows pointers indicating the chosen comparison between $OPT(i-1)$ and $w_i + OPT(i-2)$.

---

### Exercise 13: Cambio de Monedas (`coin-change-dp`)
- **Paradigm**: Dynamic Programming (Fewest Coins)
- **Textbook References**:
  - CLRS: Chapter 15 / Problem 16-1 (Coin changing)
  - Kleinberg & Tardos: Chapter 6 (Dynamic programming formulations)
  - FIUBA: Guía de Programación Dinámica — Monedas y reconstrucción
- **Difficulty**: 2 / 5
- **Learning Objectives**:
  - Model unbounded knapsack variant (each coin denomination can be reused infinitely).
  - Identify when greedy fails (e.g., coins $[1, 3, 4]$ for amount 6: greedy gives $4+1+1=3$ coins; DP gives $3+3=2$ coins).
  - Reconstruct the coin bag by storing the last chosen denomination in an auxiliary `first_coin[v]` array.
- **Formal Correctness & Key Invariant**:
  - *Recurrence*:
    $$OPT(v) = \begin{cases} 
      0 & \text{if } v = 0 \\
      \infty & \text{if } v < 0 \\
      1 + \min_{c \in C, c \le v} OPT(v - c) & \text{if } v > 0 
    \end{cases}$$
  - *Subproblem Invariant*: For every integer amount $0 \le v \le V$, $OPT(v)$ contains the absolute minimum number of coins needed to sum to $v$.
- **Asymptotic Complexity**:
  - *Time Complexity*: $O(V \cdot |C|)$ where $V$ is target amount and $|C|$ is the number of coin denominations.
  - *Space Complexity*: $O(V)$ for DP value array and reconstruction decision array.
- **Visualizer Pedagogical Value**:
  - 1D visual tape from 0 to $V$. Highlights backward lookups at $v - c_i$ for each denomination candidate.
- **Independent Verification Oracle**:
  - Verified against recursive memoized brute-force search in `referenceSolvers.ts`.

---

### Exercise 14: Subsecuencia Común Más Larga (`lcs-dp`)
- **Paradigm**: Dynamic Programming (2D Sequence Alignment)
- **Textbook References**:
  - Kleinberg & Tardos: Section 6.6 (Sequence Alignment)
  - CLRS: Section 15.4 (Longest common subsequence)
  - FIUBA: Guía de Programación Dinámica — Alineamiento de Cadenas y Bioinformática
- **Difficulty**: 2 / 5
- **Learning Objectives**:
  - Model sequence matching across two strings using a 2D grid of prefix subproblems.
  - Understand the match transition (diagonal step $+1$) versus mismatch transition ($\max$ of left and top).
  - Reconstruct the LCS string by tracing diagonal jumps in the table.
- **Formal Correctness & Key Invariant**:
  - *Recurrence*:
    $$OPT(i, j) = \begin{cases}
      0 & \text{if } i=0 \text{ or } j=0 \\
      OPT(i-1, j-1) + 1 & \text{if } s_1[i-1] == s_2[j-1] \\
      \max(OPT(i-1, j), OPT(i, j-1)) & \text{if } s_1[i-1] \ne s_2[j-1]
    \end{cases}$$
  - *Theorem (CLRS 15.4)*: If $s_1[i-1] == s_2[j-1]$, then this character must be part of an optimal alignment of the prefixes, reducing the subproblem to $(i-1, j-1)$. If they differ, any common subsequence either does not use $s_1[i-1]$ or does not use $s_2[j-1]$.
- **Asymptotic Complexity**:
  - *Time Complexity*: $O(m \cdot n)$ where $m = |s_1|$ and $n = |s_2|$.
  - *Space Complexity*: $O(m \cdot n)$ for table and reconstruction path.
- **Visualizer Pedagogical Value**:
  - 2D character grid with color-coded arrows showing diagonal match moves versus horizontal/vertical carry-forwards.

---

### Exercise 15: Intervalos Ponderados (`weighted-interval-scheduling`)
- **Paradigm**: Dynamic Programming with Binary Search
- **Textbook References**:
  - Kleinberg & Tardos: Section 6.1 & 6.2 (Weighted Interval Scheduling: A Recursive Procedure & Memoization)
  - CLRS: Chapter 15
  - FIUBA: Guía de Programación Dinámica — Intervalos con Peso
- **Difficulty**: 3 / 5
- **Learning Objectives**:
  - Understand why the greedy earliest-finish-time heuristic fails when intervals have arbitrary weights/values.
  - Define the predecessor function $p(j)$: the largest index $i < j$ such that interval $i$ does not overlap with interval $j$.
  - Efficiently compute $p(j)$ for all intervals in $O(n \log n)$ via binary search over sorted finish times.
- **Formal Correctness & Key Invariant**:
  - *Recurrence*:
    $$OPT(j) = \max(OPT(j-1), v_j + OPT(p(j)))$$
  - *Optimal Substructure*: For sorted intervals $1 \dots j$, either interval $j$ is excluded (leaving subproblem $OPT(j-1)$) or interval $j$ is included, yielding value $v_j$ plus the optimal solution on all non-overlapping intervals prior to $j$, which is precisely $OPT(p(j))$ by definition of $p(j)$.
- **Asymptotic Complexity**:
  - *Time Complexity*: $O(n \log n)$ ($O(n \log n)$ sort by finish time, $n$ binary searches of $O(\log n)$ to find $p(j)$, and $O(n)$ DP scan).
  - *Space Complexity*: $O(n)$ for sorted intervals, $p(j)$ array, and DP table.
- **Visualizer Pedagogical Value**:
  - Displays interval bars with arrows pointing back to their computed $p(j)$ predecessor, highlighting the two decision branches.
- **Independent Verification Oracle**:
  - Tested against independent $2^n$ exhaustive power-set search over all compatible subsets in `referenceSolvers.ts`.

---

### Exercise 16: Flujo Máximo y Corte Mínimo (`max-flow`)
- **Paradigm**: Network Flow (Edmonds-Karp / Ford-Fulkerson)
- **Textbook References**:
  - Kleinberg & Tardos: Sections 7.1, 7.2, 7.3 (The Maximum-Flow Problem, Ford-Fulkerson, and Max-Flow Min-Cut Theorem)
  - CLRS: Chapter 26 (Maximum Flow)
  - FIUBA: Guía de Redes de Flujo — Teorema de Corte Mínimo
- **Difficulty**: 4 / 5
- **Learning Objectives**:
  - Understand residual graphs ($G_f$), forward capacity edges, and backward cancellation edges.
  - Trace augmenting paths using BFS to ensure Edmonds-Karp polynomial termination in $O(V E^2)$.
  - Prove and visualize the Max-Flow Min-Cut Theorem ($f^* = C(A, B)$) by finding vertices reachable from source in $G_f$.
- **Formal Correctness & Key Invariant**:
  - *Flow Conservation Invariant*: For all vertices $u \ne s, t$: $\sum_v f(v, u) = \sum_w f(u, w)$.
  - *Capacity Constraint*: For every edge $(u, v)$: $0 \le f(u, v) \le c(u, v)$.
  - *Max-Flow Min-Cut Theorem*: The following three conditions are strictly equivalent:
    1. $f$ is a maximum flow in $G$.
    2. The residual network $G_f$ contains no augmenting path from $s$ to $t$.
    3. $|f| = c(A, B)$ for some cut $(A, B)$ where $A$ is the set of vertices reachable from $s$ in $G_f$ and $B = V \setminus A$.
- **Asymptotic Complexity**:
  - *Time Complexity*: $O(V E^2)$ with Edmonds-Karp (BFS augmenting path selection). Each augmentation takes $O(E)$, and at most $O(V E)$ total augmentations occur because shortest augmenting path distance increases monotonically.
  - *Space Complexity*: $O(V + E)$ for residual adjacency structure and parent search pointers.
- **Visualizer Pedagogical Value**:
  - Directed SVG graph showing dual labels: flow / capacity ($f/c$), residual edges with dynamic color updates, and a dashed line highlighting the minimum cut partition $(A, B)$.

---

### Exercise 17: Programación Lineal (`linear-programming-formulation`)
- **Paradigm**: Linear Programming & Modeling (Optimization & Convex Polytopes)
- **Textbook References**:
  - Kleinberg & Tardos: Section 11.6 (Linear Programming and Rounding: An Introduction)
  - CLRS: Chapter 29 (Linear Programming)
  - FIUBA: Guía de Modelado y Programación Lineal — Región factible y Simplex
- **Difficulty**: 2 / 5
- **Learning Objectives**:
  - Formulate problems as linear objective functions subject to linear inequality constraints ($A x \le b, x \ge 0$).
  - Grasp the Fundamental Theorem of Linear Programming: if an optimal solution exists, at least one extreme point (vertex) of the convex feasible region is optimal.
  - Formulate integer constraints (ILP) and understand continuous relaxations.
- **Formal Correctness & Key Invariant**:
  - *Convexity of Feasible Region*: The set of solutions $\mathcal{F} = \{x \in \mathbb{R}^n : A x \le b, x \ge 0\}$ is the intersection of half-spaces, hence a convex polyhedron.
  - *Extreme Point Optimality*: Because the objective function $f(x) = c^T x$ is linear, its level curves (hyperplanes) achieve their maximum over a bounded non-empty polytope at one or more vertices of $\mathcal{F}$.
- **Asymptotic Complexity**:
  - *Time Complexity*: $O(V_{poly})$ vertex enumeration in 2D; polynomial time in general via Interior Point methods ($O(n^{3.5} L)$) or Simplex in practice.
  - *Space Complexity*: $O(m + n)$ for constraint representation.
- **Visualizer Pedagogical Value**:
  - Interactive 2D coordinate plane plotting constraint lines, shaded convex feasible polygon, and level curve vector $\nabla z$ touching the optimal vertex.

---

### Exercise 18: Reducción: Conjunto Independiente a Cobertura de Vértices (`vertex-cover-reduction`)
- **Paradigm**: Computational Complexity & Reductions ($IS \le_P VC$)
- **Textbook References**:
  - Kleinberg & Tardos: Section 8.1 (Polynomial-Time Reductions: Independent Set and Vertex Cover)
  - CLRS: Section 34.5 (NP-completeness proofs)
  - FIUBA: Guía de Complejidad y Reducciones Polinomiales
- **Difficulty**: 3 / 5
- **Learning Objectives**:
  - Master polynomial-time problem reduction: transform an arbitrary instance of problem $A$ into an equivalent instance of problem $B$ in $poly(n)$ time.
  - Prove the bidirectional equivalence (if and only if $\iff$): $S$ is an Independent Set of size $k$ $\iff$ $V \setminus S$ is a Vertex Cover of size $|V| - k$.
- **Formal Correctness & Key Invariant**:
  - *Theorem (K&T 8.1)*: Let $G = (V, E)$ be an undirected graph. A subset $S \subseteq V$ is an independent set if and only if its complement $V \setminus S$ is a vertex cover.
  - *Proof ($\implies$)*: Suppose $S$ is an independent set. Consider any edge $e = (u, v) \in E$. Since $S$ is independent, $u$ and $v$ cannot both be in $S$. Therefore, at least one of $u$ or $v$ must be in $V \setminus S$. Since this holds for every edge $e \in E$, the set $V \setminus S$ covers all edges in $E$, so $V \setminus S$ is a vertex cover.
  - *Proof ($\impliedby$)*: Suppose $V \setminus S$ is a vertex cover. If $S$ were not independent, there would exist an edge $(u, v) \in E$ with both $u, v \in S$. But then neither $u$ nor $v$ would be in $V \setminus S$, contradicting that $V \setminus S$ covers all edges.
- **Asymptotic Complexity**:
  - *Reduction Time Complexity*: $O(|V| + |E|)$ identity transformation on the graph; budget maps $k \mapsto |V| - k$.
  - *Space Complexity*: $O(|V|)$ complement vertex set representation.
- **Visualizer Pedagogical Value**:
  - Dual graph visualizer where clicking a node to include it in $S$ (Independent Set) simultaneously places its complement in $V \setminus S$ (Vertex Cover), demonstrating the bijection interactively.

---

### Exercise 19: 2-Aproximación de Cobertura de Vértices (`vertex-cover-approx`)
- **Paradigm**: Approximation Algorithms (NP-hard Optimization)
- **Textbook References**:
  - Kleinberg & Tardos: Section 11.1 (A Greedy 2-Approximation Algorithm for Vertex Cover)
  - CLRS: Section 35.1 (The vertex-cover problem)
  - FIUBA: Guía de Algoritmos de Aproximación — Cotas Inferiores y Factores de Aproximación
- **Difficulty**: 3 / 5
- **Learning Objectives**:
  - Understand the concept of approximation ratios: $|C| \le \alpha \cdot |C^*|$ with $\alpha = 2$.
  - Understand the role of an intractable optimum ($|C^*|$) and how to bound it via an efficient lower bound: Maximal Matching ($|C^*| \ge |M|$).
  - Implement the greedy maximal matching selection: take both endpoints of mutually disjoint edges.
- **Formal Correctness & Key Invariant**:
  - *Algorithm*: Find a maximal matching $M \subseteq E$ greedily. Return $C = \bigcup_{(u,v) \in M} \{u, v\}$.
  - *Cover Validity*: If any edge $e \in E$ were uncovered by $C$, neither of its endpoints would be in $C$, meaning neither endpoint is incident to any edge in $M$. Thus $e$ could be added to $M$, contradicting that $M$ is a *maximal* matching.
  - *Approximation Bound*:
    1. Every edge in $M$ requires at least one distinct vertex in any valid vertex cover, because edges in a matching share no vertices. Therefore, $|C^*| \ge |M|$.
    2. The algorithm takes exactly two vertices per edge in $M$: $|C| = 2 |M|$.
    3. Combining: $|C| = 2 |M| \le 2 |C^*|$. Hence, $\alpha = 2$.
- **Asymptotic Complexity**:
  - *Time Complexity*: $O(|V| + |E|)$ linear pass over edges using a boolean marked array.
  - *Space Complexity*: $O(|V|)$ for the cover set and visited flags.
- **Visualizer Pedagogical Value**:
  - Graph SVG highlighting matched edges in orange and their dual endpoint vertices in purple, showing the ratio $2|M|$ visibly against the optimal cover.
- **Independent Verification Oracle**:
  - Validated against exact brute-force minimum vertex cover solver in `tests/oracles/referenceSolvers.ts`.

---

### Exercise 20: Moneda Equilibrada con Moneda Cargada (`randomized-fair-coin`)
- **Paradigm**: Randomized Algorithms (Las Vegas / Randomness Extraction)
- **Textbook References**:
  - John von Neumann, *Various techniques used in connection with random digits*, 1951.
  - Kleinberg & Tardos: Chapter 13 (Randomized Algorithms)
  - FIUBA: Guía de Algoritmos Probabilísticos — Variables Aleatorias y Esperanza
- **Difficulty**: 2 / 5
- **Learning Objectives**:
  - Understand randomness extraction: producing unbiased uniform bits from an unknown Bernoulli source with bias $p \in (0, 1)$.
  - Differentiate between Las Vegas algorithms (always correct, random execution time) and Monte Carlo algorithms (deterministic time, probabilistic error).
  - Calculate expected number of trials using the geometric distribution.
- **Formal Correctness & Key Invariant**:
  - *Von Neumann Procedure*: Flip the biased coin twice:
    - Sequence $HT$: probability $p(1-p) \implies$ output $0$.
    - Sequence $TH$: probability $(1-p)p \implies$ output $1$.
    - Sequences $HH$ or $TT$: probabilities $p^2$ and $(1-p)^2 \implies$ discard and repeat.
  - *Symmetry Proof*: Because independent trials commute under multiplication:
    $$P(HT) = p(1-p) = (1-p)p = P(TH)$$
    Conditioned on an outcome being produced:
    $$P(\text{Output } 0 \mid \text{Stop}) = \frac{P(HT)}{P(HT) + P(TH)} = \frac{p(1-p)}{2p(1-p)} = \frac{1}{2}$$
    The output distribution is strictly uniform $\text{Bernoulli}(0.5)$, regardless of the value of $p$ ($0 < p < 1$).
  - *Expected Rounds*: Probability of stopping in any pair of flips is $P_{stop} = 2p(1-p)$. The number of pairs follows a Geometric distribution $\text{Geom}(P_{stop})$.
    $$\mathbb{E}[\text{Pairs}] = \frac{1}{2p(1-p)} = O(1) \quad (\text{for constant } p)$$
- **Asymptotic Complexity**:
  - *Expected Time Complexity*: $O(1)$ expected flips.
  - *Space Complexity*: $O(1)$ memory.
- **Visualizer Pedagogical Value**:
  - Interactive coin flip simulator with real-time empirical histogram converging to exact 50.0% / 50.0% as sample size grows, illustrating the Law of Large Numbers.

---

### Exercise 21: Coloreo de Grafos (`graph-coloring-backtracking`)
- **Paradigm**: Backtracking / Constraint Satisfaction
- **Textbook References**:
  - Kleinberg & Tardos: Section 8.4 (NP-Completeness and Graph Coloring)
  - CLRS: Chapter 34 & 35 (State-space search in constraint satisfaction)
  - FIUBA: Guía de Backtracking — Problemas de Coloreo y Decisión
- **Difficulty**: 3 / 5
- **Learning Objectives**:
  - Understand graph coloring as a constraint satisfaction problem (CSP) where variables are vertices and domains are color sets $\{1, \dots, k\}$.
  - Apply immediate edge conflict pruning ($O(\text{deg}(v))$) to eliminate subtrees of size $k^{|V| - idx - 1}$.
  - Recognize NP-completeness for $k \ge 3$ versus polynomial time for $k = 2$ (bipartite graphs).
- **Formal Correctness & Key Invariant**:
  - *Adjacency Invariant*: For all vertices assigned colors at recursion depth $idx$, no adjacent edge is monochromatic.
  - *Pruning Completeness*: If a vertex cannot be safely colored with any color in $\{1, \dots, k\}$, the branch terminates and backtracks, restoring state. If all branches exhaust without reaching depth $|V|$, it is proven that $\chi(G) > k$.
- **Asymptotic Complexity**:
  - *Time Complexity*: $O(k^{|V|})$ worst case; dramatically accelerated on sparse/planar graphs by early pruning.
  - *Space Complexity*: $O(|V|)$ auxiliary recursion stack and color map.
- **Visualizer Pedagogical Value**:
  - Interactive SVG canvas highlighting conflict edges in dashed red with dynamic conflict pins; color assignments update synchronously with backtracking pulses.
- **Independent Verification Oracle**:
  - Verified by independent combinatorial oracle in `tests/oracles/referenceSolvers.ts`.

---

## 3. Curriculum Audit Summary & Quality Gate Status

### 3.1 Academic Balance
All 21 foundational exercises have been rigorously mapped to their theoretical origins in Kleinberg & Tardos, CLRS, and FIUBA engineering coursework.
- Every algorithm includes a formal inductive or exchange correctness proof.
- Every algorithm includes exact asymptotic time and space bounds.
- All algorithms are verified by independent reference oracles (`tests/oracles/referenceSolvers.ts`), property tests (`tests/adversarialAndOracles.test.ts`), and unit test suites.

### 3.2 Gate G11 Compliance
Visual TDA satisfies Quality Gate **G11 (`GATE-CORRECTNESS`)**:
- Zero pedagogical hand-waving: implementations strictly match theoretical standards.
- Animations never distort or alter canonical semantics for visual effect (Principle P11).
- Platform explicitly conveys the mathematical *why* behind correctness and cost (Principle P12).
