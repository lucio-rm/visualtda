// Comprehensive English Translation Engine for Theoretical Foundations
// Ensures 100% academic English parity in Phase 3 (Understand)

export const ENGLISH_THEORY_OVERRIDES: Record<string, string> = {
  'interval-scheduling': `# Interval Scheduling: Theoretical Analysis, Correctness, and Complexity

## 1. Problem Statement
Given a set of $N$ jobs or intervals $I = \\{i_1, i_2, \\dots, i_n\\}$, where each interval $i$ has a start time $s_i$ and a finish time $f_i$ with $s_i < f_i$.
Two intervals $i$ and $j$ are **compatible** if they do not overlap, that is:
$$f_i \\le s_j \\quad \\text{or} \\quad f_j \\le s_i$$
The objective is to find a compatible subset $S \\subseteq I$ of **maximum cardinality** ($|S|$ maximum).

---

## 2. Greedy Rule: Earliest Finish Time (EFT)

### Why Do Other Intuitive Rules Fail?
1. **Earliest start time**: Can pick an interval that starts first but lasts indefinitely, blocking all other tasks.
2. **Shortest duration ($f_i - s_i$)**: Can pick a short task in the middle that overlaps two long ones on either side, obtaining 1 instead of 2.
3. **Fewest conflicts**: Does not guarantee optimality across general interval graphs.

**Optimal Rule**: Always pick the compatible interval that **finishes earliest** ($f_i$ minimum). This leaves the maximum possible free time to accommodate subsequent tasks.

---

## 3. Correctness Proof: Greedy Stays Ahead

Let:
- $A = \\{a_1, a_2, \\dots, a_k\\}$ be the set of intervals chosen by the Greedy algorithm, ordered by finish time.
- $O = \\{o_1, o_2, \\dots, o_m\\}$ be an arbitrary optimal solution, also ordered by finish time.

We want to prove that $|A| = |O|$, that is, $k = m$.

### Lemma (Greedy Stays Ahead):
For all $r \\le k$, it holds that:
$$f(a_r) \\le f(o_r)$$

**Proof by Induction on $r$**:
1. **Base Case ($r=1$)**: The Greedy algorithm selects $a_1$ as the interval with the minimum finish time among all available intervals. Therefore, $f(a_1) \\le f(o_1)$ by definition.
2. **Inductive Step**: Assume $f(a_{r-1}) \\le f(o_{r-1})$.
   Since $O$ is compatible:
   $$s(o_r) \\ge f(o_{r-1})$$
   Applying the inductive hypothesis:
   $$s(o_r) \\ge f(a_{r-1})$$
   This implies that interval $o_r$ was already compatible with the Greedy selection when choosing the $r$-th element. Since Greedy greedily selects the compatible interval with the earliest finish time:
   $$f(a_r) \\le f(o_r)$$

### Conclusion:
If $k < m$, the optimal solution would contain an element $o_{k+1}$. By the lemma, $f(a_k) \\le f(o_k) \\le s(o_{k+1})$, which means $o_{k+1}$ was compatible with $a_k$, contradicting that Greedy stopped at step $k$. Thus, $k = m$ and Greedy is strictly optimal.

---

## 4. Complexity Analysis

- **Time Complexity**: $O(N \\log N)$ dominated by sorting the $N$ intervals by finish time. The subsequent linear greedy scan takes $O(N)$.
- **Space Complexity**: $O(N)$ auxiliary space to store the sorted array and output solution list.

---

## 5. Naive Intuition Traps & Counterexamples

Interval scheduling is the quintessential paradigm where seemingly "natural" heuristics fail decisively on simple test cases:

### Naive Heuristic 1: Earliest Start Time ($s_i$ minimum)
- Counterexample: One task spanning $[0, 100]$ and many small tasks $[1, 2], [2, 3], [3, 4]$. Earliest start picks $[0, 100]$ (yielding 1 task), whereas the optimal schedule achieves 3 tasks.

### Naive Heuristic 2: Shortest Processing Time ($f_i - s_i$ minimum)
- Counterexample: Tasks $[0, 10], [9, 11], [10, 20]$. The shortest task is $[9, 11]$ (length 2). Picking it blocks both $[0, 10]$ and $[10, 20]$, yielding 1 task instead of 2.
`,

  'road-antennas-greedy': `# Wireless Road Antennas: Theoretical Analysis, Correctness, and Complexity

## 1. Problem Statement
Given a highway modeled as the 1D real line $[0, L]$ with $n$ houses located at positions $X = \\{x_1, x_2, \\dots, x_n\\}$ where $0 \\le x_1 \\le x_2 \\le \\dots \\le x_n$.
Antennas can be installed at any position $y \\in [0, L]$. Each antenna covers the interval $[y - R, y + R]$, providing coverage to all houses within distance $R$.
The objective is to find a set of antenna positions $A$ of **minimum cardinality** ($|A|$ minimum) such that every house $x_i$ is covered by at least one antenna.

---

## 2. Greedy Rule: Rightmost Feasible Placement

1. Identify the leftmost uncovered house $x_{\\text{first}}$.
2. Place an antenna at position $y = x_{\\text{first}} + R$.
3. Mark all houses covered by $[y - R, y + R] = [x_{\\text{first}}, x_{\\text{first}} + 2R]$ as satisfied.
4. Repeat until all houses are covered.

**Intuition**: Placing the antenna any further to the left would waste forward reach without covering any additional houses to the left (since all previous houses are already covered). Placing it at $x_{\\text{first}} + R$ reaches the first uncovered house at the boundary of its backward coverage and maximizes coverage for upcoming houses to the right.

---

## 3. Correctness Proof: Greedy Stays Ahead

Let $A = \\{a_1, a_2, \\dots, a_k\\}$ be the antennas placed by Greedy, and $O = \\{o_1, o_2, \\dots, o_m\\}$ be an arbitrary optimal solution, both sorted in increasing order of position.

### Lemma (Rightmost Reach):
For every step $j \\in \\{1, \\dots, k\\}$, the $j$-th Greedy antenna reaches at least as far to the right as the $j$-th optimal antenna:
$$a_j \\ge o_j$$

**Proof by Induction on $j$**:
1. **Base Case ($j=1$)**: Let $x_1$ be the first house. Any feasible solution must cover $x_1$, so $o_1 \\ge x_1 - R$ and $o_1 \\le x_1 + R$. Greedy places $a_1 = x_1 + R$. Hence $a_1 \\ge o_1$.
2. **Inductive Step**: Assume $a_{j-1} \\ge o_{j-1}$.
   The rightmost coverage boundary of $a_{j-1}$ is $a_{j-1} + R \\ge o_{j-1} + R$.
   Therefore, the first house uncovered by the first $j-1$ Greedy antennas, $x_{\\text{uncovered}}$, must be greater than or equal to the first house uncovered by the first $j-1$ optimal antennas.
   To cover $x_{\\text{uncovered}}$, the optimal antenna must satisfy $o_j \\le x_{\\text{uncovered}} + R$.
   Greedy sets $a_j = x_{\\text{uncovered}} + R$. Thus $a_j \\ge o_j$.

### Optimality:
Since $a_k$ reaches at least as far as $o_k$, and $A$ covers all houses, $k \\le m$. Since $O$ is optimal, $m \\le k$, so $k = m$.

---

## 4. Complexity Analysis

- **Time Complexity**: $O(N \\log N)$ to sort houses if unsorted, or $O(N)$ linear scan if already sorted.
- **Space Complexity**: $O(N)$ to store the placed antenna coordinates.

---

## 5. Naive Intuition Traps & Counterexamples

### Centering the Antenna Directly on the House
Placing an antenna centered at $x_i$ (coverage $[x_i - R, x_i + R]$) wastes $R$ kilometers of coverage to the left where no uncovered houses exist, causing premature placements and strictly suboptimal antenna counts.
`,

  'linear-programming': `# Linear Programming and Integer Linear Programming (LP / ILP)

## 1. Mathematical Foundations

A **Linear Programming (LP) Problem** consists of optimizing a linear objective function subject to a finite set of linear inequalities and equalities:

$$\\begin{aligned}
\\text{Maximize (or Minimize)} \\quad & z = \\mathbf{c}^T \\mathbf{x} = \\sum_{j=1}^n c_j x_j \\\\
\\text{Subject to} \\quad & A \\mathbf{x} \\le \\mathbf{b} \\\\
& \\mathbf{x} \\ge \\mathbf{0}
\\end{aligned}$$

Where:
- $\\mathbf{x} \\in \\mathbb{R}^n$ is the vector of decision variables.
- $\\mathbf{c} \\in \\mathbb{R}^n$ is the objective coefficient vector (gradient direction).
- $A \\in \\mathbb{R}^{m \\times n}$ and $\\mathbf{b} \\in \\mathbb{R}^m$ define the linear constraint system.

---

## 2. Geometry of the Feasible Region

1. **Hyperplanes and Half-Spaces**: Each linear constraint $a_1 x_1 + a_2 x_2 \\le b$ divides the affine space into two closed half-spaces.
2. **Convex Polytope**: The feasible region $\\mathcal{F} = \\{\\mathbf{x} \\in \\mathbb{R}^n : A \\mathbf{x} \\le \\mathbf{b}, \\mathbf{x} \\ge \\mathbf{0}\\}$ is the intersection of a finite number of convex half-spaces; therefore, $\\mathcal{F}$ is always a **convex set**.
3. **Level Curves (Iso-profit / Iso-cost lines)**: The objective function $z = \\mathbf{c}^T \\mathbf{x}$ defines parallel hyperplanes orthogonal to the gradient vector $\\mathbf{c}$. Maximizing $z$ corresponds to translating the hyperplane along $\\mathbf{c}$ to the farthest extreme point that still intersects $\\mathcal{F}$.
4. **Fundamental Theorem of Linear Programming**:
   If a linear programming problem has a finite optimal solution, then there exists at least one **extreme vertex** (basic feasible solution) of the feasible region that is optimal.
   For this reason, the **Simplex Algorithm** traverses from vertex to vertex along adjacent edges monotonically improving the objective function.

---

## 3. Integer Linear Programming (ILP) and LP Relaxation

When decision variables must take discrete or binary values ($\\mathbf{x} \\in \\{0, 1\\}^n$ or $\\mathbf{x} \\in \\mathbb{Z}^n$), the problem is called **Integer Linear Programming (ILP)**.
- The general ILP problem is **NP-hard**.
- **LP Relaxation** replaces the integer constraint $x_i \\in \\{0, 1\\}$ with the continuous constraint $0 \\le x_i \\le 1$.
- Solving the continuous relaxation takes polynomial time and provides an **upper bound** (for maximization) on the optimal integer value.
- The difference between the relaxed continuous optimum $z_{\\text{LP}}^*$ and the integer optimum $z_{\\text{ILP}}^*$ is known as the **Integrality Gap**.

---

## 4. Canonical Modeling of Classic TDA Problems

### Juan el Vago as ILP
- **Variables**: $x_i \\in \\{0, 1\\}$ for $i = 0, \\dots, n-1$ ($x_i = 1$ if working on day $i$).
- **Objective Function**: $\\max \\sum_{i=0}^{n-1} g_i x_i$.
- **Constraints**: $x_i + x_{i+1} \\le 1$ for all $i \\in \\{0, \\dots, n-2\\}$ (cannot work two consecutive days).

### 0/1 Knapsack as ILP
- **Variables**: $x_i \\in \\{0, 1\\}$ ($x_i = 1$ if item $i$ is included).
- **Objective**: $\\max \\sum_{i=1}^n v_i x_i$.
- **Constraint**: $\\sum_{i=1}^n w_i x_i \\le W$.

---

## 5. Naive Rounding Trap & Duality

Rounding fractional solutions obtained from LP relaxation (e.g. setting $x_i = 1$ if $x_i \\ge 0.5$) can yield severely infeasible solutions or solutions far from the integer optimum. Approximation algorithms require rigorous randomized rounding or primal-dual schemes to preserve bounded guarantees.
`,

  'merge-sort': `# Merge Sort: Theoretical Foundations and Proof

## 1. The Divide-and-Conquer Paradigm

Merge Sort (developed by John von Neumann in 1945) is the canonical textbook example of the **Divide-and-Conquer** technique:

1. **Divide**: Split the sequence of $n$ elements into two subsequences of size $\\lfloor n/2 \\rfloor$ and $\\lceil n/2 \\rceil$.
2. **Conquer**: Recursively sort both subsequences using Merge Sort. The base case is reached when a subsegment has length $\\le 1$, which is already trivially sorted.
3. **Combine**: Merge the two sorted subsequences to produce a single sorted sequence of length $n$.

---

## 2. Invariant of the Merge Procedure

The overall correctness of Merge Sort rests upon the \`merge(A[p..q], A[q+1..r])\` routine.

**Loop Invariant**: At the start of each iteration of the main loop:
- The auxiliary subarray \`result[0..k-1]\` contains the $k$ smallest elements of $A[p..q]$ and $A[q+1..r]$, in non-decreasing order.
- $A[i]$ and $A[j]$ are the smallest elements of their respective halves that have not yet been copied to \`result\`.

**Initialization ($k=0$)**: \`result\` is empty. Pointers $i$ and $j$ point to the heads of both sorted halves.

**Maintenance**: If $A[i] \\le A[j]$, then because $A[i]$ is the smallest in the left half and $A[i] \\le A[j]$ (the smallest in the right half), $A[i]$ is smaller than or equal to all remaining unmerged elements. Appending it maintains sorted order. Increment $i$ and $k$. The argument is symmetric when $A[j] < A[i]$.

**Termination**: When one half is exhausted, the remaining elements of the other half are all greater than or equal to the last element in \`result\` and already sorted among themselves. They are directly appended.

---

## 3. Asymptotic Time Complexity Proof

### Recurrence Relation
For sorting $n$ elements:
$$T(n) = \\begin{cases}
c_1 & \\text{if } n = 1 \\\\
2 T(n/2) + c_2 n & \\text{if } n > 1
\\end{cases}$$
where $c_2 n$ captures linear-time division ($O(1)$) and linear-time merging ($O(n)$ comparisons and assignments).

### Proof via Recursion Tree
1. **Level 0**: 1 problem of size $n \\implies$ merge cost = $c n$.
2. **Level 1**: 2 subproblems of size $n/2 \\implies$ merge cost = $2 \\times c(n/2) = c n$.
3. **Level $j$**: $2^j$ subproblems of size $n/2^j \\implies$ merge cost = $2^j \\times c(n/2^j) = c n$.
4. **Tree Depth**: The recursion bottoms out when $n / 2^k = 1 \\implies k = \\log_2 n$.
5. **Total Cost**: Summing across all levels:
$$T(n) = \\sum_{j=0}^{\\log_2 n} c n = c n (\\log_2 n + 1) = \\Theta(n \\log n)$$

### Application of the Master Theorem
For $T(n) = a T(n/b) + f(n)$ with $a = 2, b = 2$, and $f(n) = \\Theta(n)$:
- Calculate $\\log_b a = \\log_2 2 = 1$.
- Since $f(n) = \\Theta(n^1) = \\Theta(n^{\\log_b a})$, **Case 2 of the Master Theorem** applies:
$$T(n) = \\Theta(n^{\\log_b a} \\log n) = \\Theta(n \\log n)$$

---

## 4. Lower Bound and Optimality

In the decision-tree model for comparison-based sorting:
- There are $n!$ possible permutations of the input.
- Any correct decision tree must have at least $n!$ leaves.
- Height $h$ represents worst-case comparisons:
$$2^h \\ge n! \\implies h \\ge \\log_2(n!) \\ge \\frac{n}{2} (\\log_2 n - 1) = \\Omega(n \\log n)$$
Thus, Merge Sort achieves the information-theoretic lower bound and is asymptotically optimal.
`,

  'knapsack-dp': `# 0/1 Knapsack (Dynamic Programming): Theoretical Foundations and Proof

## 1. Problem Statement

Given a set of $n$ items $\\{1, 2, \\dots, n\\}$, where each item $i$ has:
- An integer weight $w_i \\in \\mathbb{Z}^+$
- A positive value $v_i \\in \\mathbb{R}^+$

And a knapsack with maximum integer capacity $W \\in \\mathbb{Z}^+$.

The goal is to select a subset of items $S \\subseteq \\{1, \\dots, n\\}$ maximizing total value without exceeding capacity:
$$\\max \\sum_{i \\in S} v_i \\quad \\text{subject to} \\quad \\sum_{i \\in S} w_i \\le W$$

Equivalently, defining decision variables $x_i \\in \\{0, 1\\}$:
$$\\max \\sum_{i=1}^n v_i x_i \\quad \\text{subject to} \\quad \\sum_{i=1}^n w_i x_i \\le W, \\quad x_i \\in \\{0, 1\\}$$

---

## 2. Optimal Substructure (Bellman's Principle of Optimality)

Let $S^*$ be an optimal subset for the first $i$ items with capacity $w$. Consider item $i$:

- **Case 1: Item $i$ is NOT in $S^*$ ($x_i = 0$).**
  Then $S^*$ must be optimal for the first $i-1$ items with the same capacity $w$.
  *Proof by contradiction*: If a feasible subset $S' \\subseteq \\{1, \\dots, i-1\\}$ had strictly higher value with weight $\\le w$, substituting $S'$ for $S^*$ would yield a superior solution for the first $i$ items, contradicting optimality of $S^*$.

- **Case 2: Item $i$ IS in $S^*$ ($x_i = 1$).**
  Then $S^* \\setminus \\{i\\}$ must be optimal for the first $i-1$ items with reduced capacity $w - w_i$.
  *Proof by contradiction*: If a feasible subset $S'' \\subseteq \\{1, \\dots, i-1\\}$ had strictly higher value with weight $\\le w - w_i$, then $S'' \\cup \\{i\\}$ would be feasible for weight $\\le w$ and strictly superior to $S^*$, again contradicting optimality.

---

## 3. Recurrence Relation

We define $DP[i][w]$ as the maximum value achievable using a subset of the first $i$ items with capacity $w$, for $0 \\le i \\le n$ and $0 \\le w \\le W$:

$$DP[i][w] = \\begin{cases}
0 & \\text{if } i = 0 \\text{ or } w = 0 \\\\
DP[i-1][w] & \\text{if } w_i > w \\\\
\\max\\Big(DP[i-1][w], \\; DP[i-1][w - w_i] + v_i\\Big) & \\text{if } w_i \\le w
\\end{cases}$$

---

## 4. Table Invariant and Correctness

**Loop Invariant**: Upon completing row $i$, cell $DP[i][w]$ stores the exact optimal value for the subproblem over the first $i$ items and capacity $w$, for all $w \\in \\{0, \\dots, W\\}$.

**Base Step ($i=0$)**: With 0 available items, total value is 0 for any capacity $w$. $DP[0][w] = 0$ satisfies the invariant trivially.

**Inductive Step ($i-1 \\to i$)**: Assuming rows $0, \\dots, i-1$ are correct:
- If $w_i > w$, item $i$ cannot fit. The only choice is exclusion: $DP[i][w] = DP[i-1][w]$, optimal by hypothesis.
- If $w_i \\le w$, the recurrence takes the maximum between inclusion and exclusion, both evaluated on optimal subproblems.

By mathematical induction, upon completing row $n$, $DP[n][W]$ contains the global optimal solution value.

---

## 5. Reconstruction of the Optimal Solution

Once the DP table is computed, the optimal subset $S^*$ is recovered in $O(n)$ time by backtracking from $(n, W)$ to $(0, 0)$:

\`\`\`
w = W
For i from n down to 1:
    If DP[i][w] != DP[i-1][w]:
        Item i was included (x_i = 1)
        w = w - w_i
    Else:
        Item i was excluded (x_i = 0)
\`\`\`

---

## 6. Complexity Analysis

- **Time Complexity**: $\\Theta(n \\cdot W)$ to fill $(n+1) \\times (W+1)$ cells in $O(1)$ time each, plus $O(n)$ reconstruction.
- **Space Complexity**: $O(n \\cdot W)$ for the table. Can be reduced to $O(W)$ if only the optimal value is needed.

### Why Is It Pseudopolynomial?
The bit-length of integer $W$ is $\\approx \\log_2 W$. A truly polynomial algorithm runs in polynomial time in bit length $(\\log W)^k$. Here, $O(n \\cdot W) = O(n \\cdot 2^{\\log W})$ is exponential in the input size of $W$. Thus, 0/1 Knapsack is weakly NP-complete.

---

## 7. Naive Intuition Traps: Why Greedy Fails

### Value Density Counterexample ($v_i / w_i$)
In Fractional Knapsack, sorting by density $v_i / w_i$ is optimal. In 0/1 integer Knapsack, indivisibility breaks greedy:
- **Instance**: Capacity $W = 50$.
  - Item 1: $w_1 = 10, v_1 = 60$ (density $6.0$)
  - Item 2: $w_2 = 20, v_2 = 100$ (density $5.0$)
  - Item 3: $w_3 = 30, v_3 = 120$ (density $4.0$)
- **Greedy by density**: Takes Item 1 and Item 2. Remaining capacity is $20$. Item 3 does not fit. Total value: $160$ with weight $30$.
- **Optimal Solution**: Take Items 2 and 3. Weight is $20 + 30 = 50 \\le W$. Optimal value: $100 + 120 = 220$.
Greedy leaves wasted capacity that outweighs local density gain. Only DP guarantees optimality.
`,

  'coin-change-dp': `# Coin Change (Dynamic Programming): Theoretical Foundations and Proof

## 1. Problem Statement

Given a coin denomination system with $n$ positive denominations $C = \\{c_1, c_2, \\dots, c_n\\}$ (where each denomination may be used an unlimited number of times) and a target amount $V \\in \\mathbb{N}$, find the **minimum number of coins** needed to make change for $V$.

---

## 2. Why Greedy Strategy Fails

In canonical currency systems (like US Dollar, Euro, or Argentine Peso), the greedy algorithm of picking the largest coin $\\le v$ finds the optimal solution.

However, for arbitrary denomination systems, **Greedy fails decisively**:

### Canonical Counterexample:
- **Denominations**: $C = \\{1, 3, 4\\}$
- **Target**: $V = 6$
- **Greedy Choices**:
  1. Largest coin $\\le 6$: picks $4$. Remaining: $6 - 4 = 2$.
  2. Largest coin $\\le 2$: picks $1$. Remaining: $2 - 1 = 1$.
  3. Largest coin $\\le 1$: picks $1$. Remaining: $1 - 1 = 0$.
  - **Greedy Output**: $\\{4, 1, 1\\}$ totaling **3 coins**.
- **Optimal DP Solution**:
  - Pick two $3$-coins: $3 + 3 = 6$.
  - **Optimal Output**: $\\{3, 3\\}$ totaling **2 coins**.

Greedy's myopic choice of $4$ forced an unfavorable subproblem ($V = 2$), missing the balanced combination $\\{3, 3\\}$.

---

## 3. Optimal Substructure and Bellman Recurrence

Any optimal coin combination for amount $v$ must have selected some last coin $c_i \\in C$.
By Bellman's principle of optimality, the remaining coins must form an optimal solution for $v - c_i$.

We define $\\text{OPT}(v)$ as the minimum number of coins to form value $v$:

$$\\text{OPT}(v) = \\begin{cases}
0 & \\text{if } v = 0 \\\\
\\infty & \\text{if } v \\text{ cannot be formed} \\\\
1 + \\min_{\\{c \\in C : c \\le v\\}} \\text{OPT}(v - c) & \\text{if } v > 0
\\end{cases}$$

---

## 4. Solution Reconstruction

To recover the concrete coins used, we store in an auxiliary array:
$$\\text{choice}[v] = c^*$$
where $c^*$ is the coin achieving the minimum in $\\text{OPT}(v - c) + 1$.

Once the table is computed up to $V$:
1. Start at $\\text{curr} = V$.
2. While $\\text{curr} > 0$:
   - Append coin $c = \\text{choice}[\\text{curr}]$ to the result list.
   - Transition to $\\text{curr} \\leftarrow \\text{curr} - c$.

---

## 5. Complexity Analysis

- **Time Complexity**: $O(V \\cdot |C|)$ since the table has $V + 1$ states and each state evaluates at most $|C|$ transitions. Reconstruction takes $O(V)$ steps.
- **Space Complexity**: $O(V)$ auxiliary space for \`dp\` and \`choice\` arrays.
`,

  'juan-el-vago': `# Juan el Vago (1D Dynamic Programming): Theoretical Foundations and Proof

## 1. Problem Statement

Juan has a sequence of $n$ consecutive daily job offers represented by expected earnings:
$$G = [g_0, g_1, g_2, \\dots, g_{n-1}]$$
where each $g_i \\ge 0$ is the payout if he works on day $i$.

### Constraint
Juan is ambitious but lazy: **under no circumstances will he work two consecutive days** ($i$ and $i+1$).

### Objective
1. Determine the **maximum total earnings** achievable.
2. Reconstruct the exact sequence of working days.

---

## 2. Optimal Substructure and Bellman Recurrence

Consider day $i$ ($i \\ge 2$). There are exactly two mutually exclusive choices:

1. **Do not work on day $i$**:
   Juan earns nothing on day $i$, but is free to work on day $i-1$. The optimal payout up to day $i$ is identical to the optimal payout up to day $i-1$:
   $$\\text{OPT}(i-1)$$

2. **Work on day $i$**:
   Juan earns $g_i$. Due to the constraint, **he cannot have worked on day $i-1$**. The rest of his working schedule must be chosen optimally among days $0, \\dots, i-2$:
   $$\\text{OPT}(i-2) + g_i$$

### Bellman Recurrence
$$\\text{OPT}(i) = \\max\\Big(\\text{OPT}(i-1),\\; \\text{OPT}(i-2) + g_i\\Big) \\quad \\text{for } i \\ge 2$$

### Base Cases
- $n = 1$: Only one day available $\\implies \\text{OPT}(0) = g_0$.
- $n = 2$: Cannot work both days $\\implies \\text{OPT}(1) = \\max(g_0, g_1)$.

---

## 3. Connection to Integer Linear Programming (ILP)

This problem is isomorphic to **Maximum Weight Independent Set** on a path graph $P_n$:

$$\\begin{aligned}
\\text{Maximize} \\quad & \\sum_{i=0}^{n-1} g_i \\cdot x_i \\\\
\\text{Subject to} \\quad & x_i + x_{i+1} \\le 1 \\quad \\forall i \\in \\{0, \\dots, n-2\\} \\\\
& x_i \\in \\{0, 1\\} \\quad \\forall i \\in \\{0, \\dots, n-1\\}
\\end{aligned}$$

where $x_i = 1$ if working on day $i$, and $0$ otherwise.

---

## 4. Complexity Analysis

- **Time Complexity**: Filling an array of size $n$ takes $\\Theta(n)$ time with $O(1)$ operations per cell. Reconstruction takes $O(n)$ backward steps. Total: **$\\Theta(n)$**.
- **Space Complexity**: $\\Theta(n)$ with reconstruction, or $O(1)$ auxiliary space without reconstruction by maintaining only the two prior state values.

---

## 5. Naive Intuition Traps: Why Greedy Fails

### Myopic Choice Counterexample
A greedy heuristic that picks the globally largest day and blocks its neighbors fails on simple instances:
- **Instance**: $G = [10, 11, 10]$.
- **Greedy**: Picks $11$ on day 1. Days 0 and 2 are blocked. Total earnings: $11$.
- **Optimal DP**: Works days 0 and 2. Total earnings: $10 + 10 = 20$.
Dynamic programming exhaustively balances the trade-off in linear time $\\Theta(n)$.
`,

  'huffman-coding-greedy': `# Huffman Coding: Theoretical Foundations and Proof

## 1. Prefix-Free Codes and Data Compression

Given an alphabet $C$ of $k$ characters with known frequencies $f(c)$, we seek a binary prefix-free code minimizing total encoded message length.

### Prefix-Free Property
To decode continuously without delimiters, no codeword may be a prefix of another. In any prefix-free code, codewords correspond to **leaves of a binary tree** $T$.

---

## 2. Weighted Tree Cost Function

Let $d_T(c)$ be the depth of character $c$ in tree $T$ (length of its binary codeword). The total cost in bits is:
$$B(T) = \\sum_{c \\in C} f(c) \\cdot d_T(c)$$
The goal is to find a binary tree $T$ that **minimizes $B(T)$**.

---

## 3. Huffman's Greedy Bottom-Up Strategy (1952)

1. Insert each symbol $c$ as a leaf node in a **Min-Priority Queue** with priority $f(c)$.
2. While more than one node remains:
   - Extract the two nodes with minimum frequencies $x$ and $y$.
   - Create a parent node $z$ with children $x$ (branch '0') and $y$ (branch '1'), and frequency $f(z) = f(x) + f(y)$.
   - Reinsert $z$ into the heap.
3. The final remaining node is the **root** of the optimal prefix tree.

---

## 4. Correctness Proof (Exchange Argument & Induction)

### Lemma 1 (Greedy-Choice Property — CLRS 16.3 / K&T 4.8)
*Let $x$ and $y$ be the two symbols with lowest frequencies in $C$. There exists an optimal prefix code for $C$ in which $x$ and $y$ are siblings at maximum depth.*

**Proof**:
Let $T$ be an optimal tree, and let $a$ and $b$ be two sibling leaves at maximum depth. Assume without loss of generality that $f(x) \\le f(y)$ and $f(a) \\le f(b)$. Since $x$ and $y$ have lowest frequencies:
$$f(x) \\le f(a) \\quad \\text{and} \\quad f(y) \\le f(b)$$

Swapping $x$ with $a$ to produce $T'$, and then $y$ with $b$ to produce $T''$, yields:
$$B(T) - B(T') = (f(a) - f(x))(d_T(a) - d_T(x)) \\ge 0$$
Since $T$ was optimal, $T'$ and $T''$ must also be optimal. Thus, lowest-frequency characters can always be merged as deepest siblings.

### Lemma 2 (Optimal Substructure)
Replacing $x$ and $y$ with composite character $z$ of frequency $f(z) = f(x) + f(y)$ preserves weighted cost:
$$B(T) = B(T') + f(x) + f(y)$$
An optimal tree for the reduced $(k-1)$-symbol alphabet directly extends to an optimal tree for $C$.

---

## 5. Complexity Analysis

- **Time Complexity**: $O(k \\log k)$ using a binary min-heap for $k$ characters.
- **Space Complexity**: $O(k)$ to store the tree nodes and prefix dictionary.
`,

  'n-queens': `# N-Queens (Backtracking and Pruning): Theoretical Foundations and Proof

## 1. Problem Statement

Place $N$ non-attacking queens on an $N \\times N$ chessboard such that no two queens share the same row, column, or diagonal.

### Formal Constraints
Let $Q = [q_0, q_1, \\dots, q_{N-1}]$ where $q_r \\in \\{0, \\dots, N-1\\}$ represents the column of the queen on row $r$:
1. **Row constraint**: Implicitly satisfied by placing at most one queen per row.
2. **Column constraint**: $q_r \\neq q_k$ for all $r \\neq k$.
3. **Diagonal constraint**: $|q_r - q_k| \\neq |r - k|$ for all $r \\neq k$.

---

## 2. Exhaustive Search vs. Backtracking with Pruning

- **Naive Brute Force**: Placing $N$ queens on $N^2$ squares checks $\\binom{N^2}{N}$ configurations. For $N = 8$, this is $\\approx 4.4 \\times 10^9$ combinations.
- **Permutation Search**: Assigning distinct columns reduces state space to $N!$ (for $N=8$, $40\\,320$).
- **Backtracking with Early Diagonal Pruning**: Pruning as soon as a partial assignment violates diagonal constraints cuts the search tree exponentially, exploring only valid branches.

---

## 3. Invariant and Correctness

**Search Invariant**: At depth $r$, queens on rows $0, \\dots, r-1$ form a mutually non-attacking partial configuration.
- If $r = N$, all $N$ queens are placed without conflict, yielding a valid global solution.
- If no column $c \\in \\{0, \\dots, N-1\\}$ on row $r$ is conflict-free, the algorithm safely backtracks, guaranteed that no extension of the partial assignment can lead to a valid configuration.

---

## 4. Complexity Analysis

- **Worst-Case Time Complexity**: $O(N!)$ in the theoretical worst case. In practice, early pruning evaluates orders of magnitude fewer states.
- **Space Complexity**: $O(N)$ recursion depth and constraint tracking bitmasks.
`,

  'linear-programming-formulation': `# Linear Programming (2D Geometry & Simplex): Theoretical Foundations and Proof

## 1. Problem Statement
A **Linear Programming (LP)** problem in standard two-variable form seeks to maximize or minimize a linear objective function subject to a finite set of linear inequality constraints:
$$\\max \\; c_1 x + c_2 y \\quad \\text{subject to} \\quad A \\begin{bmatrix} x \\\\ y \\end{bmatrix} \\le b, \\; x \\ge 0, \\; y \\ge 0$$

---

## 2. Geometry of the Feasible Region
Each linear inequality $a_{i1} x + a_{i2} y \\le b_i$ defines a closed half-plane in $\\mathbb{R}^2$.
The intersection of finitely many closed half-planes forms a **convex polygon (polyhedron)** $\\mathcal{P}$.
- **Convexity**: For any two feasible points $u, v \\in \\mathcal{P}$ and $\\lambda \\in [0, 1]$, the convex combination $\\lambda u + (1-\\lambda)v \\in \\mathcal{P}$.
- **Vertices (Extreme Points)**: Points formed by the intersection of two linearly independent active constraints.

---

## 3. Fundamental Theorem of Linear Programming
**Theorem**: If the feasible region $\\mathcal{P}$ is non-empty and bounded, the linear objective function $f(x, y) = c_1 x + c_2 y$ attains its global maximum at least at one **vertex (extreme point)** of $\\mathcal{P}$.

**Proof Sketch**:
Suppose $p \\in \\mathcal{P}$ is an interior point. Moving along the gradient direction $\\nabla f = (c_1, c_2)$ strictly increases $f$ until hitting a boundary face, and sliding along that boundary edge monotonically increases or maintains $f$ until reaching a corner vertex $v^*$.

---

## 4. Complexity Analysis
- **2D Vertex Enumeration**:With $m$ constraints, there are at most $\\binom{m}{2} = O(m^2)$ candidate intersections; checking feasibility of each takes $O(m)$, yielding $O(m^3)$ in 2D.
- **General $n$-Dimensional LP**: Dantzig's Simplex method traverses adjacent vertices efficiently in practice, while Interior Point methods guarantee worst-case polynomial time.
`,

  'max-subarray-dyc': `# Maximum Contiguous Subarray (Divide and Conquer): Theoretical Analysis and Proof

## 1. Problem Statement
Given an array $A[0 \\dots n-1]$ of real numbers (including negative values), find indices $0 \\le i^* \\le j^* < n$ maximizing the contiguous sum:
$$S(i, j) = \\sum_{k=i}^{j} A[k]$$

---

## 2. Divide and Conquer Strategy
Let $m = \\lfloor (low + high) / 2 \\rfloor$ bisect $A[low \\dots high]$ into left subarray $A[low \\dots m]$ and right subarray $A[m+1 \\dots high]$.
Any contiguous subarray $A[i \\dots j] \\subseteq A[low \\dots high]$ falls into **exactly one** of three mutually exclusive cases:
1. **Entirely in the left half**: $low \\le i \\le j \\le m$ (solved recursively).
2. **Entirely in the right half**: $m+1 \\le i \\le j \\le high$ (solved recursively).
3. **Crossing the midpoint $m$**: $low \\le i \\le m < j \\le high$.

### Linear-Time Crossing Subarray
A crossing subarray decomposes into a suffix of the left half $A[i \\dots m]$ and a prefix of the right half $A[m+1 \\dots j]$. Since both share the fixed boundary $m$:
$$\\max_{low \\le i \\le m < j \\le high} S(i, j) = \\left( \\max_{low \\le i \\le m} \\sum_{k=i}^{m} A[k] \\right) + \\left( \\max_{m+1 \\le j \\le high} \\sum_{k=m+1}^{j} A[k] \\right)$$
Both independent maxima are found in $\\Theta(n)$ time via two linear scans outward from $m$.

---

## 3. Correctness Proof by Induction
- **Base Case ($n = 1$)**: For $low = high$, the only non-empty subarray is $A[low \\dots low]$ with sum $A[low]$.
- **Inductive Step**: By trichotomy of index intervals $[i, j]$, the global maximum is $\\max(S_{\\text{left}}, S_{\\text{right}}, S_{\\text{cross}})$. By inductive hypothesis, $S_{\\text{left}}$ and $S_{\\text{right}}$ are optimal in their halves, and the decoupled suffix/prefix scan finds the exact maximum crossing sum $S_{\\text{cross}}$.

---

## 4. Complexity Analysis
- **Recurrence**: $T(n) = 2T(n/2) + \\Theta(n)$.
- **Time Complexity**: By the Master Theorem ($a=2, b=2, f(n)=\\Theta(n)$), $T(n) = \\Theta(n \\log n)$ (note: Kadane's DP achieves $\\Theta(n)$).
- **Space Complexity**: $\\Theta(\\log n)$ recursion stack depth.
`,

  'peak-finding-dyc': `# 1D Peak Finding (Binary Search Divide and Conquer): Theoretical Analysis and Proof

## 1. Problem Statement
Given an array $A[0 \\dots n-1]$, an index $p$ is a **local peak** if $A[p] \\ge A[p-1]$ (for $p > 0$) and $A[p] \\ge A[p+1]$ (for $p < n-1$), where out-of-bounds boundaries are treated as $-\\infty$.
Find **any** peak index $p \\in \\{0, \\dots, n-1\\}$ in $O(\\log n)$ time.

---

## 2. Divide and Conquer Strategy
At range $[low, high]$, inspect midpoint $m = \\lfloor (low + high) / 2 \\rfloor$:
1. If $A[m]$ is greater than or equal to both neighbors, return $m$.
2. If $m > 0$ and $A[m - 1] > A[m]$, recurse on the left half $[low, m - 1]$.
3. Otherwise ($A[m + 1] > A[m]$), recurse on the right half $[m + 1, high]$.

---

## 3. Correctness Proof: Boundary Rise Invariant
**Invariant**: The active search interval $[low, high]$ always satisfies:
$$A[low] \\ge A[low - 1] \\quad \\text{and} \\quad A[high] \\ge A[high + 1]$$
(where $A[-1] = A[n] = -\\infty$).

**Proof**:
- Initially $[0, n-1]$ satisfies the invariant because $A[-1] = A[n] = -\\infty$.
- If $A[m-1] > A[m]$, the new subproblem $[low, m-1]$ preserves the left boundary $low$ and gains right boundary $m-1$ with $A[m-1] > A[m]$, satisfying the invariant.
- Every finite discrete interval with inward-rising boundaries must contain a maximum element $p^* \\in [low, high]$, which is guaranteed to be a local peak in $A$.

---

## 4. Complexity Analysis
- **Recurrence**: $T(n) = T(n/2) + \\Theta(1)$.
- **Time Complexity**: $\\Theta(\\log n)$, exponentially faster than an $O(n)$ linear scan.
- **Space Complexity**: $\\Theta(1)$ iterative or $\\Theta(\\log n)$ recursive.
`,

  'inversion-counting-dyc': `# Inversion Counting (Divide and Conquer): Theoretical Analysis and Proof

## 1. Problem Statement
Given an array $A[0 \\dots n-1]$, an **inversion** is a pair of indices $(i, j)$ such that:
$$i < j \\quad \\text{and} \\quad A[i] > A[j]$$
The number of inversions measures how far $A$ is from being sorted ($0$ if sorted ascending, $\\binom{n}{2}$ if sorted descending).

---

## 2. Piggybacking on Merge Sort
Divide $A$ at $m = \\lfloor n/2 \\rfloor$ into $L = A[0 \\dots m-1]$ and $R = A[m \\dots n-1]$. Every inversion $(i, j)$ falls into one of three disjoint sets:
1. **Left inversion**: $i, j < m$ (counted recursively in $L$).
2. **Right inversion**: $i, j \\ge m$ (counted recursively in $R$).
3. **Split inversion**: $i < m \\le j$ and $A[i] > A[j]$.

### Counting Split Inversions in $\\Theta(n)$
Suppose $L$ and $R$ are already sorted. During the standard Merge step comparing $L[p]$ and $R[q]$:
- If $L[p] \\le R[q]$, then $L[p]$ is smaller than all remaining elements in $R$, contributing $0$ split inversions.
- If $L[p] > R[q]$, then because $L$ is sorted ascending, **every remaining element** $L[p, p+1, \\dots, |L|-1]$ is also strictly greater than $R[q]$. Thus $R[q]$ forms exactly $(|L| - p)$ split inversions at once!

---

## 3. Correctness and Complexity
- **Correctness**: Sorting $L$ and $R$ permutes elements *within* each half without changing which elements lie in $L$ versus $R$; hence the set of split inversions between $L$ and $R$ is invariant under internal sorting.
- **Time Complexity**: $T(n) = 2T(n/2) + \\Theta(n) \\implies \\Theta(n \\log n)$.
- **Space Complexity**: $\\Theta(n)$ auxiliary merge buffer.
`,

  'closest-pair-dyc': `# Closest Pair of Points in 2D (Divide and Conquer): Theoretical Analysis and Proof

## 1. Problem Statement
Given $n$ points $P = \\{p_1, \\dots, p_n\\}$ in the Euclidean plane $\\mathbb{R}^2$, find a pair of distinct points $p_i \\neq p_j$ minimizing the Euclidean distance $d(p_i, p_j) = \\sqrt{(x_i-x_j)^2 + (y_i-y_j)^2}$.

---

## 2. Divide and Conquer Strategy
1. Pre-sort points by $x$-coordinate ($P_x$) and by $y$-coordinate ($P_y$) in $O(n \\log n)$.
2. Bisect $P_x$ by a vertical line $L: x = x_{\\text{mid}}$ into left subset $Q$ and right subset $R$.
3. Recursively compute $\\delta_L = \\text{ClosestPair}(Q)$ and $\\delta_R = \\text{ClosestPair}(R)$, setting $\\delta = \\min(\\delta_L, \\delta_R)$.
4. **Strip Filter**: Filter $P_y$ to form $S_y = \\{p \\in P_y : |p_x - x_{\\text{mid}}| < \\delta\\}$ in $O(n)$ time.
5. **Bounded Neighborhood Scan**: For each point $p_i \\in S_y$, compare $p_i$ only against the **next 7 points** $p_{i+1}, \\dots, p_{i+7}$ in $S_y$.

---

## 3. Correctness Proof: The $\\delta \\times 2\\delta$ Packing Lemma
**Lemma**: For any point $p_i \\in S_y$, any point $p_j \\in S_y$ with $y_j \\ge y_i$ and $d(p_i, p_j) < \\delta$ must lie inside a $2\\delta \\times \\delta$ rectangle centered on $L$.
By partitioning this $2\\delta \\times \\delta$ rectangle into eight $(\\delta/2) \\times (\\delta/2)$ squares (four on the left of $L$, four on the right), each square has diagonal $\\frac{\\sqrt{2}}{2}\\delta < \\delta$.
Since points on the same side of $L$ are at least $\\delta$ apart, **at most one point** can reside in each of the 8 boxes. Thus at most 7 subsequent points in $S_y$ need to be checked!

---

## 4. Complexity Analysis
- **Recurrence**: $T(n) = 2T(n/2) + \\Theta(n)$ (maintaining $P_y$ sorted via linear partitioning).
- **Time Complexity**: $\\Theta(n \\log n)$, compared to $\\Theta(n^2)$ brute force.
- **Space Complexity**: $\\Theta(n)$.
`,

  'karatsuba-dyc': `# Karatsuba Fast Multiplication: Theoretical Analysis and Proof

## 1. Problem Statement
Multiply two $n$-digit integers $X$ and $Y$ in base $B$ in sub-quadratic time $o(n^2)$.

---

## 2. Gauss-Karatsuba Algebraic Decomposition
Let $m = \\lfloor n/2 \\rfloor$ and write:
$$X = x_1 B^m + x_0, \\qquad Y = y_1 B^m + y_0$$
The product expands as:
$$X \\cdot Y = \\underbrace{(x_1 y_1)}_{z_2} B^{2m} + \\underbrace{(x_1 y_0 + x_0 y_1)}_{z_1} B^m + \\underbrace{(x_0 y_0)}_{z_0}$$
Naive divide-and-conquer computes 4 half-size products ($x_1 y_1, x_1 y_0, x_0 y_1, x_0 y_0$), yielding $T(n) = 4T(n/2) + \\Theta(n) = \\Theta(n^2)$.

### Karatsuba's 3-Multiplication Identity
Observe that the middle coefficient $z_1$ can be recovered using **one** additional product $P = (x_1 + x_0)(y_1 + y_0)$:
$$z_1 = (x_1 + x_0)(y_1 + y_0) - z_2 - z_0 = P - z_2 - z_0$$
This trades one recursive multiplication for a constant number of $\\Theta(n)$ additions and subtractions.

---

## 3. Complexity Analysis
- **Recurrence**: $T(n) = 3T(n/2) + \\Theta(n)$.
- **Time Complexity**: By the Master Theorem ($a=3, b=2$), $T(n) = \\Theta(n^{\\log_2 3}) \\approx \\Theta(n^{1.585})$.
- **Space Complexity**: $\\Theta(n)$ work space across the $\\Theta(\\log n)$ recursion tree depth.
`,

  'median-of-medians-dyc': `# Median of Medians (Deterministic Linear Selection): Theoretical Analysis and Proof

## 1. Problem Statement
Given an unsorted array $A$ of $n$ elements and an integer $k \\in \\{0, \\dots, n-1\\}$, find the $k$-th smallest element (order statistic) in **worst-case deterministic $\\Theta(n)$ time**.

---

## 2. Algorithm (BFPRT — Blum, Floyd, Pratt, Rivest, Tarjan)
1. Partition $A$ into $\\lceil n/5 \\rceil$ groups of at most 5 elements each.
2. Find the median of each 5-element group by sorting it in $O(1)$ time, collecting medians $M = [m_1, m_2, \\dots, m_{\\lceil n/5 \\rceil}]$.
3. Recursively compute the true median of $M$: $p = \\text{Select}(M, \\lfloor |M|/2 \\rfloor)$.
4. Partition $A$ around pivot $p$ into $L = \\{x < p\\}$, $E = \\{x = p\\}$, and $G = \\{x > p\\}$.
5. Recurse into at most one of $L$ or $G$ depending on $k$ vs. $|L|$ and $|L| + |E|$.

---

## 3. Correctness & Pivot Balance Guarantee
Why groups of 5?
- At least half of the $\\lceil n/5 \\rceil$ group medians are $\\ge p$.
- In each such group (except possibly the remainder group and $p$'s own group), at least 3 of the 5 elements are $\\ge p$.
- Therefore, at least $\\frac{3}{10}n - 6$ elements are $\\ge p$, and symmetrically at least $\\frac{3}{10}n - 6$ elements are $\\le p$.
- Consequently, the recursive step eliminates at least $30\\%$ of the array in the worst case, leaving at most $\\frac{7}{10}n + 6$ elements!

---

## 4. Complexity Analysis
- **Recurrence**: $T(n) \\le T(\\lceil n/5 \\rceil) + T(7n/10 + 6) + \\Theta(n)$.
- Since $\\frac{1}{5} + \\frac{7}{10} = \\frac{9}{10} < 1$, the geometric series of work per level decays by factor $0.9$, proving $T(n) = \\Theta(n)$ in the worst case.
`,

  'majority-element-dyc': `# Majority Element (Divide and Conquer & Boyer-Moore): Theoretical Analysis and Proof

## 1. Problem Statement
Given an array $A[0 \\dots n-1]$, an element $x$ is the **strict majority element** if its frequency satisfies:
$$\\text{count}(x, A) > \\lfloor n / 2 \\rfloor$$

---

## 2. Divide and Conquer Strategy
1. Base case ($n = 1$): Return $A[0]$.
2. Recursively find the majority candidates $c_L$ in $A[0 \\dots m-1]$ and $c_R$ in $A[m \\dots n-1]$.
3. If $c_L = c_R$, return $c_L$.
4. Otherwise, count occurrences of $c_L$ and $c_R$ in $A[0 \\dots n-1]$ in $\\Theta(n)$ time and return whichever exceeds $\\lfloor n/2 \\rfloor$ (or ` + '`None`' + `).

---

## 3. Correctness Proof: Pigeonhole Preservation Lemma
**Lemma**: If $A$ has a strict majority element $x^*$, then $x^*$ **must** be the strict majority element of at least one half ($L$ or $R$).

**Proof by Contradiction**:
Suppose $\\text{count}(x^*, L) \\le |L|/2$ and $\\text{count}(x^*, R) \\le |R|/2$. Summing both inequalities gives:
$$\\text{count}(x^*, A) = \\text{count}(x^*, L) + \\text{count}(x^*, R) \\le \\frac{|L| + |R|}{2} = \\frac{n}{2}$$
contradicting that $x^*$ is a strict majority element of $A$.

---

## 4. Complexity Analysis
- **Divide and Conquer**: $T(n) = 2T(n/2) + \\Theta(n) \\implies \\Theta(n \\log n)$ time and $O(\\log n)$ space (works even when elements only support equality ` + '`==`' + ` without total ordering).
- **Boyer-Moore Voting**: Achieves $\\Theta(n)$ time and $\\Theta(1)$ space via pairwise cancellation of distinct elements.
`,

  'knapsack-greedy': `# Fractional Knapsack (Greedy by Value Density): Theoretical Analysis and Proof

## 1. Problem Statement
Given $n$ divisible materials with weights $w_i > 0$ and values $v_i \\ge 0$, and a knapsack capacity $W > 0$, choose fractions $x_i \\in [0, 1]$ maximizing total value:
$$\\max \\sum_{i=1}^n v_i x_i \\quad \\text{subject to} \\quad \\sum_{i=1}^n w_i x_i \\le W$$

---

## 2. Greedy Strategy: Value Density Ordering
Compute the specific value (density) $d_i = v_i / w_i$ for each item and sort items in non-increasing order $d_1 \\ge d_2 \\ge \\dots \\ge d_n$.
Take as much as possible of the highest-density item until the knapsack is full, taking a fraction of the boundary item if necessary.

---

## 3. Correctness Proof: Exchange Argument
Suppose items are sorted so $v_1/w_1 \\ge v_2/w_2 \\ge \\dots \\ge v_n/w_n$. Let $X = (x_1, \\dots, x_n)$ be the Greedy solution and $Y = (y_1, \\dots, y_n)$ be any optimal solution.
If $X \\neq Y$, let $k$ be the first index where $x_k \\neq y_k$. By definition of Greedy, $x_k > y_k$, and there must exist some $j > k$ with $y_j > 0$.
Transfer a small weight $\\Delta w = \\min(w_k(x_k - y_k), w_j y_j) > 0$ from item $j$ to item $k$ in $Y$. The change in total value is:
$$\\Delta V = \\Delta w \\left( \\frac{v_k}{w_k} - \\frac{v_j}{w_j} \\right) \\ge 0$$
Thus the modified solution is at least as valuable as $Y$ and agrees with $X$ further. Repeating finitely many times transforms $Y$ into $X$ without loss of optimality.

---

## 4. Complexity & 0/1 Counterexample
- **Time Complexity**: $\\Theta(n \\log n)$ for sorting by density, plus $\\Theta(n)$ linear packing.
- **Why Greedy Fails for 0/1 Knapsack**: For $W=50$ and items $(w=10, v=60, d=6)$, $(w=20, v=100, d=5)$, $(w=30, v=120, d=4)$, 0/1 Greedy picks $(10,60)+(20,100)=160$ leaving $20$ idle capacity, whereas $(20,100)+(30,120)=220$ is optimal.
`,

  'interval-partitioning-greedy': `# Interval Partitioning (Classroom Allocation): Theoretical Analysis and Proof

## 1. Problem Statement
Given $n$ lectures with start and finish times $[s_i, f_i)$, assign each lecture to a classroom such that no two overlapping lectures share a room, using the **minimum total number of classrooms** $d$.

---

## 2. Structural Lower Bound: Depth $d$
The **depth** $d$ of a set of intervals is the maximum number of intervals passing through any single point $t \\in \\mathbb{R}$.
**Observation**: Every valid partitioning satisfies $\\text{rooms} \\ge d$, because at the moment $t^*$ where $d$ lectures overlap, each must occupy a distinct classroom.

---

## 3. Greedy Rule: Earliest Start Time (EST)
1. Sort all lectures by start time $s_1 \\le s_2 \\le \\dots \\le s_n$.
2. For each lecture $i$, if there exists an already-opened classroom whose last scheduled lecture finishes at $f \\le s_i$, assign lecture $i$ to that room; otherwise open a new room.

### Correctness Proof
Suppose Greedy opens a $k$-th classroom when examining lecture $i = [s_i, f_i)$.
Why couldn't lecture $i$ be placed in any of the existing $k-1$ classrooms? Because each of the $k-1$ rooms has a lecture finishing strictly after $s_i$.
Since lectures were processed in non-decreasing order of start time, all $k-1$ blocking lectures started at or before $s_i$.
Therefore, at time $t = s_i + \\epsilon$, those $k-1$ lectures plus lecture $i$ all overlap simultaneously! Hence $k \\le d$. Combined with $k \\ge d$, we get $k = d$ (strictly optimal).

---

## 4. Complexity Analysis
- **Time Complexity**: $\\Theta(n \\log n)$ sorting + $\\Theta(n \\log d)$ using a Min-Heap keyed by classroom finish time.
- **Space Complexity**: $\\Theta(n)$.
`,

  'minimize-lateness-greedy': `# Scheduling to Minimize Maximum Lateness (EDD): Theoretical Analysis and Proof

## 1. Problem Statement
Given $n$ jobs where job $i$ has processing duration $t_i > 0$ and deadline $d_i$, schedule them sequentially on a single machine. If job $i$ finishes at $f_i$, its lateness is $L_i = \\max(0, f_i - d_i)$.
Minimize the **maximum lateness** $L_{\\max} = \\max_{1 \\le i \\le n} L_i$.

---

## 2. Greedy Rule: Earliest Deadline First (EDD)
Sort jobs in non-decreasing order of deadline: $d_1 \\le d_2 \\le \\dots \\le d_n$, and execute them contiguously without idle time.

---

## 3. Correctness Proof: Adjacent Inversion Exchange Argument
An **inversion** in a schedule is a pair of jobs $(i, j)$ such that $d_i < d_j$ but job $j$ is scheduled before job $i$.
- **Lemma 1**: Any schedule with inversions has at least one *adjacent* pair of inverted jobs $(j, i)$ with $d_i < d_j$.
- **Lemma 2**: Swapping adjacent inverted jobs $(j, i)$ does not increase $L_{\\max}$.
  *Proof*: Let $s$ be the start time of $j$, so $f_j = s + t_j$ and $f_i = s + t_j + t_i$. After swapping to $(i, j)$, job $i$ finishes earlier ($f'_i = s + t_i < f_j$), and job $j$ finishes at $f'_j = f_i$. Then:
  $$f'_j - d_j = f_i - d_j < f_i - d_i$$
  because $d_i < d_j$. Thus the new lateness of $j$ is bounded by the old lateness of $i$, and all other jobs are unaffected!
Since bubble-swapping adjacent inversions transforms any optimal schedule into the EDD schedule without increasing $L_{\\max}$, EDD is globally optimal.

---

## 4. Complexity Analysis
- **Time Complexity**: $\\Theta(n \\log n)$ dominated by sorting deadlines.
- **Space Complexity**: $\\Theta(n)$.
`,

  'dijkstra-greedy': `# Dijkstra's Shortest Paths Algorithm: Theoretical Analysis and Proof

## 1. Problem Statement
Given a directed or undirected graph $G = (V, E)$ with **non-negative edge weights** $w(u, v) \\ge 0$ and a source vertex $s \\in V$, compute the shortest-path distance $\\delta(s, v)$ from $s$ to every $v \\in V$.

---

## 2. Greedy Strategy & Edge Relaxation
Maintain a settled set $S \\subseteq V$ and tentative upper-bound distances $d[v]$ initialized to $d[s] = 0$ and $d[v] = \\infty$ for $v \\neq s$.
At each step, extract $u \\in V \\setminus S$ minimizing $d[u]$, add $u$ to $S$, and **relax** all outgoing edges $(u, v) \\in E$:
$$d[v] \\leftarrow \\min(d[v], d[u] + w(u, v))$$

---

## 3. Correctness Proof: Settled Set Invariant
**Invariant**: For every vertex $u \\in S$, $d[u] = \\delta(s, u)$.

**Proof by Induction**:
Suppose $u$ is the first vertex added to $S$ for which $d[u] > \\delta(s, u)$. Let $P$ be a true shortest $s \\leadsto u$ path, and let $(x, y)$ be the first edge along $P$ leaving $S$ ($x \\in S, y \\notin S$).
Since $x$ was settled earlier, $d[x] = \\delta(s, x)$ and edge $(x, y)$ was relaxed, so $d[y] \\le \\delta(s, x) + w(x, y) = \\delta(s, y)$.
Because all edge weights on the remainder of $P$ from $y$ to $u$ are **non-negative** ($w \\ge 0$):
$$d[y] \\le \\delta(s, y) \\le \\delta(s, u) < d[u]$$
which contradicts that Dijkstra selected $u$ over $y$ as the minimum tentative distance in $V \\setminus S$!

---

## 4. Complexity & Negative Weight Counterexample
- **Time Complexity**: $O((|V| + |E|) \\log |V|)$ using a binary min-heap.
- **Why Negative Weights Break Dijkstra**: If $w(y, u) < 0$, $\\delta(s, y) \\le \\delta(s, u)$ fails, allowing a longer initial path to later drop below an already-settled distance. Use Bellman-Ford for negative weights.
`,

  'kruskal-mst-greedy': `# Kruskal's Minimum Spanning Tree (MST): Theoretical Analysis and Proof

## 1. Problem Statement
Given a connected undirected graph $G = (V, E)$ with edge weights $w: E \\to \\mathbb{R}$, find a spanning tree $T \\subseteq E$ connecting all $|V|$ vertices with minimum total weight $w(T) = \\sum_{e \\in T} w(e)$.

---

## 2. Greedy Strategy with Union-Find
1. Sort all edges in non-decreasing order of weight: $w(e_1) \\le w(e_2) \\le \\dots \\le w(e_m)$.
2. Initialize forest $T = \\emptyset$ and a Disjoint-Set (Union-Find) data structure with $|V|$ singleton components.
3. For each edge $e = (u, v)$, if $\\text{Find}(u) \\neq \\text{Find}(v)$, add $e$ to $T$ and execute $\\text{Union}(u, v)$.

---

## 3. Correctness Proof: The Cut Property
**Cut Property Lemma**: Let $S \\subset V$ be any non-empty proper subset of vertices, and let $e = (u, v)$ be a minimum-weight edge crossing the cut $(S, V \\setminus S)$. Then $e$ belongs to some MST of $G$.

**Proof**:
When Kruskal considers edge $e = (u, v)$ connecting two distinct components $C_u$ and $C_v$, consider the cut $(C_u, V \\setminus C_u)$.
Every edge previously examined by Kruskal had weight $\\le w(e)$, and none of them crossed $(C_u, V \\setminus C_u)$ (otherwise $C_u$ would already be merged with another component).
Thus $e$ is a minimum-weight edge crossing $(C_u, V \\setminus C_u)$, so by the Cut Property $e$ is safe!

---

## 4. Complexity Analysis
- **Time Complexity**: $O(|E| \\log |E|) = O(|E| \\log |V|)$ dominated by edge sorting; Union-Find operations with path compression and union by rank take $O(|E| \\alpha(|V|))$.
- **Space Complexity**: $\\Theta(|V| + |E|)$.
`,

  'lcs-dp': `# Longest Common Subsequence (LCS): Theoretical Analysis and Proof

## 1. Problem Statement
Given two strings $X = x_1 x_2 \\dots x_m$ and $Y = y_1 y_2 \\dots y_n$, find the longest sequence $Z$ that appears as a (not necessarily contiguous) subsequence of both $X$ and $Y$.

---

## 2. Optimal Substructure & Recurrence
Let $OPT[i][j]$ denote the length of the LCS of prefixes $X[1 \\dots i]$ and $Y[1 \\dots j]$:
$$OPT[i][j] = \\begin{cases} 0 & \\text{if } i = 0 \\text{ or } j = 0 \\\\ 1 + OPT[i-1][j-1] & \\text{if } x_i = y_j \\\\ \\max(OPT[i-1][j], OPT[i][j-1]) & \\text{if } x_i \\neq y_j \\end{cases}$$

---

## 3. Correctness Proof
- **Case 1 ($x_i = y_j$)**: If any common subsequence of $X[1 \\dots i]$ and $Y[1 \\dots j]$ did not end at $(x_i, y_j)$, we could either append $x_i = y_j$ or replace its final character with $x_i = y_j$ without decreasing its length, leaving an LCS subproblem on $X[1 \\dots i-1]$ and $Y[1 \\dots j-1]$.
- **Case 2 ($x_i \\neq y_j$)**: An LCS of $X[1 \\dots i]$ and $Y[1 \\dots j]$ cannot simultaneously use both $x_i$ and $y_j$ as its final character. Therefore it must be a common subsequence of $(X[1 \\dots i-1], Y[1 \\dots j])$ or $(X[1 \\dots i], Y[1 \\dots j-1])$.

---

## 4. Complexity & Traceback
- **Time Complexity**: $\\Theta(m \\cdot n)$ to fill the $(m+1) \\times (n+1)$ table, plus $O(m + n)$ backward reconstruction from $(m, n)$ to $(0, 0)$.
- **Space Complexity**: $\\Theta(m \\cdot n)$ for full sequence reconstruction (or $\\Theta(\\min(m, n))$ for length only, or via Hirschberg's divide-and-conquer algorithm).
`,

  'weighted-interval-scheduling': `# Weighted Interval Scheduling: Theoretical Analysis and Proof

## 1. Problem Statement
Given $n$ intervals where interval $i$ has start time $s_i$, finish time $f_i$, and **weight (value) $v_i > 0$**, find a subset $S$ of mutually compatible intervals maximizing total weight $\\sum_{i \\in S} v_i$.

---

## 2. Why Greedy Fails & Predecessor Function $p(i)$
Unlike unweighted Interval Scheduling, choosing the earliest-finishing interval can discard a slightly longer interval of arbitrarily large weight $v_i \\gg 1$.
Sort intervals by finish time $f_1 \\le f_2 \\le \\dots \\le f_n$ and define $p(i)$ as the largest index $j < i$ such that $f_j \\le s_i$ ($0$ if none exists), computable for all $i$ in $O(n \\log n)$ via binary search.

---

## 3. Bellman Recurrence & Optimal Substructure
Let $OPT[i]$ be the maximum weight achievable using a compatible subset of $\\{1, \\dots, i\\}$. Considering whether interval $i$ belongs to the optimal subset:
1. **Include $i$**: We gain $v_i$, and all remaining intervals must finish by $s_i$, which is exactly the subproblem on $\\{1, \\dots, p(i)\\}$ with value $OPT[p(i)]$.
2. **Exclude $i$**: We solve the subproblem on $\\{1, \\dots, i-1\\}$ with value $OPT[i-1]$.

$$OPT[i] = \\max\\big( OPT[i-1], \\; v_i + OPT[p(i)] \\big), \\qquad OPT[0] = 0$$

---

## 4. Complexity Analysis
- **Time Complexity**: $\\Theta(n \\log n)$ for sorting and binary-searching $p(i)$, plus $\\Theta(n)$ table evaluation and traceback.
- **Space Complexity**: $\\Theta(n)$.
`,

  'segmented-least-squares-dp': `# Segmented Least Squares (Piecewise Linear Regression): Theoretical Analysis and Proof

## 1. Problem Statement
Given $n$ points $P = \\{(x_1, y_1), \\dots, (x_n, y_n)\\}$ in $\\mathbb{R}^2$ sorted by $x_1 < x_2 < \\dots < x_n$ and a penalty $C > 0$ per line segment, partition $P$ into $k$ contiguous segments $S_1, \\dots, S_k$ minimizing:
$$\\text{Cost} = \\sum_{m=1}^{k} e(S_m) + C \\cdot k$$
where $e(i, j)$ is the minimum sum of squared vertical residuals of a single line fitted to points $p_i, \\dots, p_j$.

---

## 2. Bellman Recurrence
Consider the last segment $[i, j]$ ending at point $p_j$ ($1 \\le i \\le j$). The remaining prefix $p_1, \\dots, p_{i-1}$ must be partitioned optimally:
$$OPT[j] = \\min_{1 \\le i \\le j} \\big( e(i, j) + C + OPT[i - 1] \\big), \\qquad OPT[0] = 0$$

---

## 3. Role of Penalty Parameter $C$ (Model Selection)
- **As $C \\to 0$**: The algorithm fits a separate segment to every pair of points ($e = 0$, severe overfitting).
- **As $C \\to \\infty$**: The algorithm uses a single global regression line ($k = 1$, underfitting).
- **Intermediate $C$**: Automatically discovers structural changepoints in the data.

---

## 4. Complexity Analysis
- **Precomputing $e(i, j)$**: Using prefix sums of $x, y, x^2, xy, y^2$, all $\\binom{n}{2}$ segment errors $e(i, j)$ are computed in $O(n^2)$ total time.
- **DP Evaluation**: $O(n^2)$ time and $\\Theta(n^2)$ space (or $\\Theta(n)$ if $e(i,j)$ is computed on the fly).
`,

  'rna-secondary-structure-dp': `# RNA Secondary Structure Prediction (Interval DP): Theoretical Analysis and Proof

## 1. Problem Statement
Given an RNA nucleotide string $B = b_1 b_2 \\dots b_n \\in \\{\\text{A, U, C, G}\\}^n$, a **secondary structure** is a set of base pairs $S = \\{(i, j)\\}$ satisfying:
1. **Watson-Crick Complementarity**: Each pair is $(\\text{A}, \\text{U})$ or $(\\text{C}, \\text{G})$.
2. **No Sharp Turns**: $i < j - 4$ (at least 4 intervening bases in every hairpin loop).
3. **Disjointness**: Each base index appears in at most one pair.
4. **No Knots (Non-Crossing)**: There are no pairs $(i, j)$ and $(k, l)$ with $i < k < j < l$.
Maximize the number of base pairs $|S|$.

---

## 2. Interval Dynamic Programming Recurrence
Because of the non-crossing condition, matching base $j$ with some $t \\in [i, j-5]$ splits $[i, j]$ into two independent sub-intervals $[i, t-1]$ and $[t+1, j-1]$:
$$OPT[i][j] = \\max \\left( OPT[i][j-1], \\; \\max_{\\substack{i \\le t < j - 4 \\\\ (b_t, b_j) \\text{ valid}}} \\big( 1 + OPT[i][t-1] + OPT[t+1][j-1] \\big) \\right)$$
with base case $OPT[i][j] = 0$ whenever $j - i \\le 4$.

---

## 3. Evaluation Order & Complexity
- **Evaluation Order**: By increasing interval length $k = j - i$ from $5$ to $n - 1$.
- **Time Complexity**: There are $\\Theta(n^2)$ subproblems $[i, j]$, each scanning $O(n)$ split points $t$, giving $\\Theta(n^3)$ time.
- **Space Complexity**: $\\Theta(n^2)$ for the upper-triangular matrix.
`,

  'bellman-ford-dp': `# Bellman-Ford Shortest Paths & Negative Cycles: Theoretical Analysis and Proof

## 1. Problem Statement
Given a directed weighted graph $G = (V, E)$ with arbitrary real weights $w(u, v) \\in \\mathbb{R}$ (possibly negative) and source $s$, compute shortest paths $\\delta(s, v)$ for all $v \\in V$, or detect a **negative-weight cycle** reachable from $s$.

---

## 2. Dynamic Programming Over Edge Budget
Let $OPT(i, v)$ be the minimum weight of a walk from $s$ to $v$ using **at most $i$ edges**:
$$OPT(i, v) = \\min \\left( OPT(i-1, v), \\; \\min_{(u, v) \\in E} \\big( OPT(i-1, u) + w(u, v) \\big) \\right)$$
with $OPT(0, s) = 0$ and $OPT(0, v) = \\infty$ for $v \\neq s$.

---

## 3. Correctness & Negative Cycle Detection
- **Simple Path Bound**: If no negative cycles are reachable from $s$, every shortest path is simple and contains at most $|V| - 1$ edges. Thus after $|V| - 1$ relaxation passes over all edges in $E$, $d[v] = OPT(|V|-1, v) = \\delta(s, v)$.
- **$V$-th Pass Certificate**: A negative cycle reachable from $s$ exists **if and only if** at least one edge $(u, v) \\in E$ can still be strictly relaxed on the $|V|$-th pass ($d[u] + w(u, v) < d[v]$).

---

## 4. Complexity Analysis
- **Time Complexity**: $\\Theta(|V| \\cdot |E|)$ across $|V|$ passes over $|E|$ edges.
- **Space Complexity**: $\\Theta(|V|)$ using in-place distance array relaxation.
`,

  'subset-sum-backtracking': `# Subset Sum (Backtracking & Pruning): Theoretical Foundations and Proof

## 1. Problem Statement
Given a set of non-negative integers $S = \\{x_1, x_2, \\dots, x_n\\}$ and a target sum $T \\ge 0$, determine whether there exists a subset $A \\subseteq S$ whose elements sum to $T$:
$$\\sum_{x \\in A} x = T$$

---

## 2. State-Space Tree & Pruning Rules
At depth $i$ with current partial sum $s$ and remaining suffix sum $R_i = \\sum_{k=i}^{n} x_k$, the binary decision tree branches on including ($+x_i$) or excluding ($+0$) element $x_i$:
1. **Target Reached**: If $s = T$, return solution immediately.
2. **Overshoot Pruning (Feasibility)**: If $s > T$ (assuming $x_k \\ge 0$), prune the entire subtree because adding further non-negative elements can never decrease $s$.
3. **Bounding Pruning (Remaining Capacity)**: If $s + R_i < T$, prune the subtree because even taking every remaining element cannot reach $T$.

---

## 3. Complexity Analysis
- **Time Complexity**: $O(2^n)$ in the worst case; pruning dramatically reduces explored nodes when $T$ is small or elements vary widely.
- **Space Complexity**: $\\Theta(n)$ recursion stack depth.
`,

  'graph-coloring-backtracking': `# m-Graph Coloring (Constraint Satisfaction Backtracking): Theoretical Foundations and Proof

## 1. Problem Statement
Given an undirected graph $G = (V, E)$ and $m$ colors $\\{1, \\dots, m\\}$, assign a color $c(v) \\in \\{1, \\dots, m\\}$ to every vertex $v \\in V$ such that no adjacent vertices share the same color:
$$\\forall (u, v) \\in E, \\quad c(u) \\neq c(v)$$

---

## 2. Backtracking with Forward Constraint Checking
Vertices $v_0, v_1, \\dots, v_{n-1}$ are colored sequentially. Before assigning color $k$ to $v_i$, verify ` + '`isSafe(v_i, k)`' + ` against all already-colored neighbors $u \\in N(v_i)$ with $u < i$.
If a conflict exists, color $k$ is pruned immediately without expanding the remaining $m^{n-1-i}$ completions of that branch.
If no color in $\\{1, \\dots, m\\}$ is valid for $v_i$, backtrack to $v_{i-1}$.

---

## 3. Why Greedy Coloring Fails on Bipartite & Planar Graphs
A myopic greedy coloring depends heavily on vertex ordering and can use more than the chromatic number $\\chi(G)$ colors, whereas backtracking systematically explores alternative assignments to guarantee finding an $m$-coloring whenever $\\chi(G) \\le m$.

---

## 4. Complexity Analysis
- **Worst-Case Time Complexity**: $O(m^{|V|} \\cdot |V|)$ upper bound, reduced substantially in practice by early adjacency conflict pruning and degree ordering heuristics.
- **Space Complexity**: $\\Theta(|V|)$ color assignment array and recursion stack.
`,

  'sudoku-backtracking': `# Sudoku Solver (CSP Backtracking & MRV Heuristic): Theoretical Foundations and Proof

## 1. Problem Statement
Given a partially filled $9 \\times 9$ grid, fill all empty cells with digits $d \\in \\{1, \\dots, 9\\}$ such that every row, every column, and every $3 \\times 3$ subgrid contains each digit $1 \\dots 9$ exactly once (all-different constraints).

---

## 2. Constraint Propagation & Minimum Remaining Values (MRV)
At each step, an empty cell $(r, c)$ has candidate domain:
$$D(r, c) = \\{1, \\dots, 9\\} \\setminus \\big( \\text{Row}(r) \\cup \\text{Col}(c) \\cup \\text{Box}(\\lfloor r/3 \\rfloor, \\lfloor c/3 \\rfloor) \\big)$$
- **Dead-End Pruning**: If $|D(r, c)| = 0$ for any empty cell, the current partial assignment is unsatisfiable; backtrack immediately.
- **MRV (Fail-First) Variable Ordering**: Selecting the empty cell with the smallest domain $|D(r, c)|$ minimizes the branching factor at upper levels of the search tree, detecting contradictions as early as possible.

---

## 3. Complexity Analysis
- **Worst-Case Time Complexity**: Exponential in the number of empty cells $k$ ($O(9^k)$ naive bound), reduced to milliseconds on standard puzzles via constraint bitmasks and MRV ordering.
- **Space Complexity**: $\\Theta(k)$ recursion depth.
`,

  'hamiltonian-cycle-backtracking': `# Hamiltonian Cycle (Backtracking on Graphs): Theoretical Foundations and Proof

## 1. Problem Statement
Given an undirected or directed graph $G = (V, E)$ with $n = |V|$ vertices, find a simple cycle $P = (v_0, v_1, \\dots, v_{n-1}, v_0)$ that visits every vertex in $V$ **exactly once** and returns to the starting vertex $v_0$.

---

## 2. Symmetry Breaking & Pruning Conditions
Without loss of generality, fix the starting vertex $v_0 = 0$ to eliminate $n$-fold rotational symmetry (reducing $(n)!$ permutations to $(n-1)!$).
At step $k$, extend path $P[0 \\dots k-1]$ by trying candidate $u \\in V$:
1. **Adjacency Check**: $(P[k-1], u) \\in E$ must hold.
2. **Visited Check**: $u \\notin \\{P[0], \\dots, P[k-1]\\}$.
3. **Cycle Closure at $k = n$**: Verify $(P[n-1], P[0]) \\in E$.

---

## 3. Complexity & NP-Completeness
- **NP-Completeness**: Determining whether a Hamiltonian cycle exists is one of Karp's 21 NP-complete problems (in contrast to Eulerian circuits, which are solvable in $O(|V| + |E|)$ time via degree parity).
- **Time Complexity**: $O((n-1)!)$ in the worst case; pruned to $O(\\prod_{v} \\deg(v))$ on sparse graphs.
- **Space Complexity**: $\\Theta(n)$ path array and visited set.
`,

  'tsp-branch-and-bound': `# Traveling Salesperson Problem (Branch and Bound): Theoretical Foundations and Proof

## 1. Problem Statement
Given a complete weighted graph $G = (V, E, w)$ with $n$ cities and non-negative distances $w(u, v) \\ge 0$, find a Hamiltonian tour visiting all $n$ cities and returning to the origin with **minimum total cost**.

---

## 2. Branch and Bound vs. Pure Backtracking
Pure backtracking only prunes *infeasible* partial paths. **Branch and Bound** tracks the best complete tour cost found so far (**incumbent upper bound** $U = z^*$) and computes an optimistic **lower bound** $LB(N)$ for every partial tour node $N = (v_0, \\dots, v_k)$:
$$LB(N) = \\text{cost}(v_0 \\dots v_k) + \\sum_{u \\notin \\text{visited}} \\min_{w \\neq u} d(u, w)$$
(or half the sum of the two minimum incident edges per unvisited vertex).

### Optimality Pruning Rule
If $LB(N) \\ge z^*$, no completion of partial tour $N$ can improve upon the current incumbent $z^*$. The entire subtree rooted at $N$ is **safely pruned** without sacrificing global optimality!

---

## 3. Complexity Analysis
- **Worst-Case Time Complexity**: $O((n-1)!)$, but optimistic lower bounds and Best-First / DFS-with-bound search prune the vast majority of suboptimal permutations.
- **Space Complexity**: $\\Theta(n)$ for DFS Branch and Bound.
`,

  'knapsack-branch-and-bound': `# 0/1 Knapsack (Branch and Bound with Linear Relaxation): Theoretical Foundations and Proof

## 1. Problem Statement
Given $n$ indivisible items with weights $w_i > 0$ and values $v_i > 0$ and capacity $W$, select a subset $S \\subseteq \\{1, \\dots, n\\}$ with $\\sum_{i \\in S} w_i \\le W$ maximizing $\\sum_{i \\in S} v_i$.

---

## 2. Upper Bound via Fractional Knapsack Relaxation
Sort items by value density $v_1/w_1 \\ge v_2/w_2 \\ge \\dots \\ge v_n/w_n$.
At search tree node $N$ (at level $k$ with accumulated weight $w$ and value $v$), compute the **Dantzig linear relaxation upper bound** $UB(N)$ by greedily filling the remaining capacity $W - w$ with items $k+1, \\dots, n$ allowing a fractional part of the boundary item:
$$UB(N) = v + \\sum_{j=k+1}^{r-1} v_j + (W - w_{\\text{used}}) \\cdot \\frac{v_r}{w_r}$$

### Soundness of Bounding & Pruning
Since the 0/1 integer problem is a restriction of the fractional problem, every valid 0/1 completion of node $N$ has value $\\le UB(N)$.
Whenever $UB(N) \\le z^*$ (where $z^*$ is the best integer solution found so far), node $N$ is pruned immediately!

---

## 3. Complexity Analysis
- **Time Complexity**: $O(2^n)$ worst-case theoretical bound; in practice, sorting by density and fractional bounding solves typical instances by visiting only a tiny fraction of nodes.
- **Space Complexity**: $\\Theta(n)$ recursion stack.
`,

  'knights-tour-backtracking': `# Knight's Tour (Backtracking & Warnsdorff's Heuristic): Theoretical Foundations and Proof

## 1. Problem Statement
On an $N \\times N$ chessboard, move a chess knight starting from $(r_0, c_0)$ through a sequence of $N^2 - 1$ legal L-shaped moves $(\\pm 1, \\pm 2)$ or $(\\pm 2, \\pm 1)$ such that every square on the board is visited **exactly once**.

---

## 2. Warnsdorff's Minimum-Degree Heuristic (1823)
Uninformed backtracking explores up to $8^{N^2}$ paths and easily isolates corner squares that become unreachable later.
**Warnsdorff's Rule**: From the current square $u$, order the unvisited legal next squares $v \\in N(u)$ in ascending order of their **onward degree** (number of unvisited squares reachable from $v$):
$$\\text{deg}^+(v) = |\\{w \\in N(v) : w \\text{ is unvisited}\\}|$$
By visiting constrained squares (corners and edges with low onward degree) first, the knight avoids stranding dead-end squares late in the tour.

---

## 3. Complexity Analysis
- **Uninformed Backtracking**: $O(8^{N^2})$ worst case.
- **Warnsdorff-Guided Backtracking**: Finds a complete tour in nearly linear $O(N^2)$ steps with almost zero backtracks on standard $8 \\times 8$ boards, while retaining complete backtracking to guarantee correctness if a tie-break dead-ends.
`,

  'max-flow': `# Maximum Flow & Minimum Cut (Ford-Fulkerson / Edmonds-Karp): Theoretical Analysis and Proof

## 1. Problem Statement
Given a directed flow network $G = (V, E)$ with source $s$, sink $t$, and non-negative capacities $c(u, v) \\ge 0$, a **flow** $f: V \\times V \\to \\mathbb{R}_{\\ge 0}$ satisfies:
1. **Capacity Constraint**: $0 \\le f(u, v) \\le c(u, v)$ for all $(u, v) \\in E$.
2. **Flow Conservation**: $\\sum_{u} f(u, v) = \\sum_{w} f(v, w)$ for all $v \\in V \\setminus \\{s, t\\}$.
Maximize the net flow value $|f| = \\sum_{v} f(s, v) - \\sum_{u} f(u, s)$.

---

## 2. Residual Graph $G_f$ & Augmenting Paths
For flow $f$, the **residual network** $G_f = (V, E_f)$ provides:
- **Forward residual edges**: $c_f(u, v) = c(u, v) - f(u, v)$ (remaining unused capacity).
- **Backward residual edges**: $c_f(v, u) = f(u, v)$ (allowing cancellation/rerouting of previously sent flow).
**Edmonds-Karp** finds a shortest $s \\leadsto t$ augmenting path $P$ in $G_f$ using **BFS** and pushes bottleneck flow $\\Delta = \\min_{(u,v) \\in P} c_f(u, v)$ along $P$.

---

## 3. Max-Flow Min-Cut Theorem (Ford & Fulkerson, 1956)
**Theorem**: The following three statements are equivalent:
1. $f$ is a maximum flow in $G$.
2. The residual network $G_f$ contains **no** augmenting path from $s$ to $t$.
3. $|f| = c(S, T)$ for some $(s, t)$-cut $(S, T)$, where $S = \\{v \\in V : s \\leadsto v \\text{ in } G_f\\}$ and $T = V \\setminus S$.

---

## 4. Complexity Analysis
- **Edmonds-Karp (BFS)**: Every augmenting step saturates at least one critical edge, and BFS distances in $G_f$ never decrease, bounding augmentations to $O(|V| \\cdot |E|)$ and total time to $O(|V| \\cdot |E|^2)$ independently of capacity magnitudes.
`,

  'vertex-cover-reduction': `# Polynomial Reduction: Independent Set $\\le_p$ Vertex Cover

## 1. Problem Statement & Dual Definitions
Given an undirected graph $G = (V, E)$:
- **Independent Set ($IS$)**: A subset $I \\subseteq V$ such that no two vertices in $I$ are joined by an edge in $E$.
- **Vertex Cover ($VC$)**: A subset $C \\subseteq V$ such that every edge $(u, v) \\in E$ has at least one endpoint in $C$.

---

## 2. Complement Duality Lemma (Gallai's Identity)
**Theorem**: For any graph $G = (V, E)$ and any subset $S \\subseteq V$:
$$S \\text{ is an Independent Set of } G \\iff V \\setminus S \\text{ is a Vertex Cover of } G$$

**Proof**:
- $(\\Rightarrow)$ Suppose $S$ is an Independent Set. Take any edge $(u, v) \\in E$. Since $S$ cannot contain both $u$ and $v$, at least one of $u$ or $v$ does not belong to $S$, meaning at least one belongs to $V \\setminus S$. Thus $V \\setminus S$ covers every edge in $E$.
- $(\\Leftarrow)$ Suppose $V \\setminus S$ is a Vertex Cover. For any pair $u, v \\in S$, neither endpoint is in $V \\setminus S$; hence $(u, v)$ cannot be an edge in $E$. Thus $S$ is independent.

---

## 3. Karp Reduction Construction ($\\text{IS} \\le_p \\text{VC}$)
Given an instance $(G, k)$ asking whether $G$ has an Independent Set of size $\\ge k$, construct in $O(1)$ time the Vertex Cover instance $(G, |V| - k)$.
By the Duality Lemma, $G$ has an Independent Set of size $\\ge k$ if and only if $G$ has a Vertex Cover of size $\\le |V| - k$.
`,

  'vertex-cover-approx': `# Minimum Vertex Cover: Maximal Matching 2-Approximation

## 1. Problem Statement
Given an undirected graph $G = (V, E)$, find a Vertex Cover $C \\subseteq V$ of minimum cardinality $|C|$. Since Minimum Vertex Cover is NP-hard, we seek a polynomial-time algorithm with a provable approximation ratio $\\rho = 2$.

---

## 2. Gavril's Maximal Matching Algorithm
1. Initialize $C = \\emptyset$ and matching $M = \\emptyset$.
2. While uncovered edges remain in $E$:
   - Pick an arbitrary uncovered edge $e = (u, v) \\in E$.
   - Add $e$ to $M$, and add **both** endpoints $u$ and $v$ to $C$.
   - Remove all edges incident to $u$ or $v$.
3. Return $C$.

---

## 3. Proof of the 2-Approximation Guarantee
Let $M$ be the set of edges chosen by the algorithm and let $C^*$ be an optimal Minimum Vertex Cover of size $OPT = |C^*|$:
1. **Disjointness of $M$**: No two edges in $M$ share a common vertex (because picking $(u, v)$ removes all edges incident to $u$ and $v$). Thus $M$ is a **matching**.
2. **Lower Bound on $OPT$**: Any valid vertex cover $C^*$ must cover every edge in $M$. Since the edges in $M$ are vertex-disjoint, no single vertex in $C^*$ can cover more than one edge of $M$. Therefore:
   $$|C^*| \\ge |M|$$
3. **Ratio Bound**: The algorithm adds exactly 2 vertices to $C$ for each edge in $M$, so $|C| = 2|M|$. Combining both inequalities yields:
   $$|C| = 2|M| \\le 2|C^*| = 2 \\cdot OPT$$

---

## 4. Why Taking Only One Endpoint Fails
Picking only the highest-degree endpoint can be tricked on star graphs ($K_{1, k}$), and on general graphs the best known polynomial approximation ratio remains $2 - o(1)$ under the Unique Games Conjecture.
`,

  'randomized-fair-coin': `# Von Neumann's Fair Coin Extractor (Las Vegas Randomized Algorithm): Theoretical Analysis and Proof

## 1. Problem Statement
Given a biased coin that lands Heads ($1$) with unknown probability $p \\in (0, 1)$ and Tails ($0$) with probability $q = 1 - p$, generate an **exact $50/50$ unbiased bit** without knowing $p$.

---

## 2. Von Neumann's Symmetry Protocol (1951)
Toss the biased coin twice independently to observe pair $(X_1, X_2)$:
- If $(X_1, X_2) = (1, 0)$ (Heads then Tails), output **$1$**.
- If $(X_1, X_2) = (0, 1)$ (Tails then Heads), output **$0$**.
- If $(X_1, X_2) \\in \\{(0, 0), (1, 1)\\}$, **discard both tosses** and repeat.

---

## 3. Correctness Proof: Exact Conditional Equiprobability
By independence of tosses:
$$\\Pr[(1, 0)] = p(1 - p), \\qquad \\Pr[(0, 1)] = (1 - p)p$$
Notice that $p(1 - p) = (1 - p)p$ holds identically for **every** $p \\in (0, 1)$!
Conditioned on termination (event $E = \\{(1, 0), (0, 1)\\}$ with probability $2p(1-p) > 0$):
$$\\Pr[\\text{Output} = 1 \\mid E] = \\frac{p(1 - p)}{2p(1 - p)} = \\frac{1}{2}, \\qquad \\Pr[\\text{Output} = 0 \\mid E] = \\frac{(1 - p)p}{2p(1 - p)} = \\frac{1}{2}$$

---

## 4. Expected Running Time (Las Vegas Analysis)
Each round succeeds with probability $s = 2p(1 - p)$. The number of rounds $R \\sim \\text{Geometric}(s)$, so:
$$\\mathbb{E}[\\text{Rounds}] = \\frac{1}{2p(1 - p)}, \\qquad \\mathbb{E}[\\text{Coin Tosses}] = \\frac{1}{p(1 - p)} = O(1) \\text{ for fixed } p \\in (0, 1)$$
`
};

export function translateSpanishTheoryToEnglish(text: string): string {
  let res = text;

  // Document and section headings
  res = res
    .replace(/# (.+): Análisis Teórico, Correctness y Complejidad/g, '# $1: Theoretical Analysis, Correctness, and Complexity')
    .replace(/# (.+) [—–] Teoría y Fundamentos/g, '# $1 — Theory and Foundations')
    .replace(/# (.+): Fundamento Teórico y Demostración/g, '# $1: Theoretical Foundations and Proof')
    .replace(/## 1\. Planteo del Problema/g, '## 1. Problem Statement')
    .replace(/## 1\. Fundamentos Matemáticos/g, '## 1. Mathematical Foundations')
    .replace(/## 2\. Estrategia Algorítmica/g, '## 2. Algorithmic Strategy')
    .replace(/## 2\. Geometría de la Región Factible/g, '## 2. Geometry of the Feasible Region')
    .replace(/## 2\. Regla Greedy/g, '## 2. Greedy Rule')
    .replace(/## 3\. Demostración de Corrección \(Correctness\)/g, '## 3. Correctness Proof')
    .replace(/## 3\. Demostración de Corrección/g, '## 3. Correctness Proof')
    .replace(/## 3\. Demostración de Correctitud/g, '## 3. Correctness Proof')
    .replace(/## 3\. Programación Lineal Entera/g, '## 3. Integer Linear Programming')
    .replace(/## 4\. Análisis de Complejidad/g, '## 4. Complexity Analysis')
    .replace(/## 4\. Complejidad/g, '## 4. Complexity Analysis')
    .replace(/## 4\. Modelado Canónico de Problemas Clásicos de TDA/g, '## 4. Canonical Modeling of Classic TDA Problems')
    .replace(/## 5\. Trampa de la Intuición Ingenua y Contraejemplos/g, '## 5. Naive Intuition Traps & Counterexamples')
    .replace(/## 5\. Trampa de la Intuición Ingenua/g, '## 5. Naive Intuition Traps')
    .replace(/## 5\. Trampa de la Fuerza Bruta Cuadrática/g, '## 5. Quadratic Brute Force Trap')
    .replace(/## 5\. Análisis de Complejidad Asintótica/g, '## 5. Asymptotic Complexity Analysis')
    .replace(/## 5\. Análisis de Complejidad/g, '## 5. Complexity Analysis')
    .replace(/## 6\. Trampa de la Intuición Ingenua/g, '## 6. Naive Intuition Traps')
    .replace(/## 6\. Análisis de Complejidad/g, '## 6. Complexity Analysis');

  // Subsection Headings
  res = res
    .replace(/### ¿Por qué no Fuerza Bruta\?/g, '### Why Not Brute Force?')
    .replace(/### ¿Por qué fallan otras reglas intuitivas\?/g, '### Why Do Other Intuitive Rules Fail?')
    .replace(/### Invariante de Bucle \/ Recursión/g, '### Loop / Recursion Invariant')
    .replace(/### Invariante de Bucle/g, '### Loop Invariant')
    .replace(/### Invariante de Corrección/g, '### Correctness Invariant')
    .replace(/### Invariante de Búsqueda/g, '### Search Invariant')
    .replace(/### Pasos de Inducción:/g, '### Induction Steps:')
    .replace(/### Pasos de Inducción/g, '### Induction Steps')
    .replace(/### Complejidad Temporal:/g, '### Time Complexity:')
    .replace(/### Complejidad Espacial:/g, '### Space Complexity:')
    .replace(/### Complejidad Temporal/g, '### Time Complexity')
    .replace(/### Complejidad Espacial/g, '### Space Complexity')
    .replace(/### Argumento de Intercambio/g, '### Exchange Argument')
    .replace(/### Propiedad de Elección Voraz/g, '### Greedy-Choice Property')
    .replace(/### Subestructura Óptima/g, '### Optimal Substructure')
    .replace(/### Recurrencia y Casos Base/g, '### Recurrence and Base Cases')
    .replace(/### Garantía de 2-Aproximación/g, '### 2-Approximation Guarantee')
    .replace(/### Teorema de Reducción Polinomial/g, '### Polynomial Reduction Theorem')
    .replace(/### Demostración por Inducción sobre/g, '### Proof by Induction on')
    .replace(/### Demostración Formal de Correctitud/g, '### Formal Correctness Proof')
    .replace(/### Demostración Formal:/g, '### Formal Proof:')
    .replace(/### Conclusión:/g, '### Conclusion:')
    .replace(/### Contraejemplo Canónico:/g, '### Canonical Counterexample:')
    .replace(/### Contraejemplo de la Elección Miope/g, '### Myopic Choice Counterexample')
    .replace(/### El Fracaso del Coloreo Voraz/g, '### Failure of Greedy Coloring')
    .replace(/### Por Qué Falla la Estrategia Voraz/g, '### Why the Greedy Strategy Fails');

  // Academic Labels & Formats
  res = res
    .replace(/\*\*Invariante\*\*:/g, '**Invariant**:')
    .replace(/\*\*Base\*\*:/g, '**Base Case**:')
    .replace(/\*\*Paso Inductivo\*\*:/g, '**Inductive Step**:')
    .replace(/\*\*Terminación\*\*:/g, '**Termination**:')
    .replace(/\*\*Teorema\*\*:/g, '**Theorem**:')
    .replace(/\*\*Demostración\*\*:/g, '**Proof**:')
    .replace(/\*\*Lema\*\*:/g, '**Lemma**:')
    .replace(/\*\*Corolario\*\*:/g, '**Corollary**:')
    .replace(/Teorema:/g, 'Theorem:')
    .replace(/Demostración:/g, 'Proof:')
    .replace(/En el peor caso,/g, 'In the worst case,')
    .replace(/En el mejor caso,/g, 'In the best case,')
    .replace(/por inducción sobre/g, 'by induction on')
    .replace(/Hipótesis inductiva/g, 'Inductive hypothesis')
    .replace(/Caso base/g, 'Base case')
    .replace(/Caso inductivo/g, 'Inductive case')
    .replace(/Paso inductivo/g, 'Inductive step')
    .replace(/Cota superior/g, 'Upper bound')
    .replace(/Cota inferior/g, 'Lower bound')
    .replace(/Teorema Maestro/g, 'Master Theorem')
    .replace(/Árbol de recursión/g, 'Recursion tree')
    .replace(/Entrada:/g, 'Input:')
    .replace(/Salida:/g, 'Output:')
    .replace(/Definición:/g, 'Definition:')
    .replace(/Propiedad:/g, 'Property:')
    .replace(/Observación:/g, 'Remark:')
    .replace(/Donde:/g, 'Where:')
    .replace(/El objetivo es/g, 'The objective is to')
    .replace(/Dado un conjunto de/g, 'Given a set of')
    .replace(/Queremos demostrar que/g, 'We want to prove that')
    .replace(/Supongamos por el absurdo/g, 'Assume for contradiction')
    .replace(/Por lo tanto,/g, 'Therefore,')
    .replace(/Contradicción\./g, 'Contradiction.')
    .replace(/Subestructura óptima/g, 'Optimal substructure')
    .replace(/Propiedad de elección voraz/g, 'Greedy-choice property')
    .replace(/Argumento de intercambio/g, 'Exchange argument')
    // Mathematical condition and objective keywords
    .replace(/\bMaximizar\b/g, 'Maximize')
    .replace(/\bMinimizar\b/g, 'Minimize')
    .replace(/\bSujeto a\b/g, 'Subject to')
    .replace(/\\text\{si \}/g, '\\text{if }')
    .replace(/\\text\{si\}/g, '\\text{if}')
    .replace(/\\text\{ o \}/g, '\\text{ or }')
    .replace(/\\text\{o \}/g, '\\text{or }')
    .replace(/\\text\{si no es posible formar \}/g, '\\text{if impossible to form }');

  return res;
}
