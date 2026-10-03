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
