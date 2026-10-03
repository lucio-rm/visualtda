export const ENGLISH_STARTER_CODES: Record<string, string> = {
  'bellman-ford-dp': `def bellman_ford(num_vertices: int, edges: list[tuple[int, int, int]], source: int) -> tuple[dict[int, float], bool]:
    """
    num_vertices: number of vertices indexed 0 .. n-1.
    edges: list of (u, v, weight). Can include negative edge weights.
    source: source vertex.
    Computes shortest path distances and detects negative cost cycles.
    Returns (distances, has_negative_cycle).
    """
    dist = {v: float('inf') for v in range(num_vertices)}
    dist[source] = 0.0

    # 1. Perform V - 1 iterations relaxing all edges (Bellman-Ford recurrence)
    # 2. On a V-th iteration, if any edge can still be relaxed, a reachable negative cycle exists

    return dist, False

# Compatibility alias
bellman_ford = bellman_ford
`,

  'closest-pair-dyc': `def closest_pair(points: list[tuple[float, float]]) -> float:
    """
    Computes the minimum Euclidean distance among n points in R^2 in O(n log n).
    Returns the minimum distance found (float).
    """
    if len(points) < 2:
        return 0.0

    # 1. Divide points into left and right halves by median X coordinate
    # 2. Conquer recursively by computing delta = min(dist_left, dist_right)
    # 3. Combine by filtering points within the strip |x - x_med| < delta and checking at most 7 neighbors in Y

    return 0.0

# Compatibility alias
par_mas_cercano = closest_pair
`,

  'coin-change-dp': `def min_coin_change(coins: list[int], target: int) -> list[int]:
    """
    Given a set of denominations 'coins' and an amount 'target',
    returns the list of coins summing exactly to target using the minimum number of coins.
    If the target amount cannot be formed, returns [].

    Example:
      coins = [1, 3, 4], target = 6
      Returns: [3, 3]  (Greedy would return [4, 1, 1], which is suboptimal)
    """
    if target <= 0 or not coins:
        return []

    # Write your Dynamic Programming solution with back-pointers here:

    return []

# Compatibility alias
cambio_monedas_minimo = min_coin_change
`,

  'dijkstra-greedy': `def dijkstra(graph: dict[str, list[tuple[str, int]]], source: str) -> dict[str, int]:
    """
    graph: adjacency dictionary {node: [(neighbor, weight), ...]}.
    source: starting source node.
    Computes shortest path distances in graphs with non-negative edge weights.
    Returns {node: min_distance}.
    """
    distances = {node: float('inf') for node in graph}
    if source in distances:
        distances[source] = 0

    # 1. Initialize min-heap with tuple (0, source)
    # 2. Greedily extract node with smallest tentative distance
    # 3. Relax outgoing edges updating distances and pushing to heap

    return distances

# Compatibility alias
dijkstra = dijkstra
`,

  'graph-coloring-backtracking': `def color_graph(graph: dict[str, list[str]], k: int) -> dict[str, int] | None:
    """
    Determines whether a valid k-coloring exists for the undirected graph.
    Returns a dictionary {vertex: color} with colors between 1 and k,
    or None if coloring with k colors is impossible.

    Example:
      graph = {"A": ["B"], "B": ["A"]}
      k = 2
      -> {"A": 1, "B": 2}
    """
    vertices = list(graph.keys())
    colors = {}

    # Write your backtracking algorithm with pruning here

    return None

# Compatibility alias
colorear_grafo = color_graph
`,

  'hamiltonian-cycle-backtracking': `def hamiltonian_cycle(num_v: int, graph: dict[int, list[int]]) -> list[int] | None:
    """
    Finds a simple Hamiltonian cycle visiting every vertex exactly once
    and returning to the starting vertex 0.
    Returns the vertex list [0, v1, v2, ..., vn-1, 0] or None if no cycle exists.
    """
    path = [0]
    visited = {0}

    # Write your recursive backtracking function with adjacency pruning here:

    return None

# Compatibility alias
ciclo_hamiltoniano = hamiltonian_cycle
`,

  'huffman-coding-greedy': `import heapq

def huffman_encoding(frequencies: dict[str, int]) -> dict[str, str]:
    """
    Constructs prefix-free binary Huffman codes for a set of characters
    given their integer frequencies.

    Required Time Complexity: O(k log k) using a Min-Heap priority queue.
    Returns a dictionary {char: binary_code}.
    """
    if not frequencies:
        return {}

    if len(frequencies) == 1:
        single = next(iter(frequencies))
        return {single: '0'}

    # Write your greedy Min-Heap Huffman implementation here:

    return {}

# Compatibility alias
codificar_huffman = huffman_encoding
`,

  'interval-partitioning-greedy': `def interval_partitioning(intervals: list[tuple[int, int]]) -> int:
    """
    Computes the minimum number of classrooms or resources required to schedule
    all intervals without any overlapping conflicts.
    Returns the minimum number of classrooms (int).
    """
    if not intervals:
        return 0

    # 1. Sort intervals in ascending order by start time (earliest start time first)
    # 2. Maintain a min-heap of classroom finish times currently in use
    # 3. If earliest classroom becomes free <= current interval start, reuse it (heappop)
    # 4. Allocate interval by pushing its end time to the heap (heappush)

    return 0

# Compatibility alias
particionar_intervalos = interval_partitioning
`,

  'interval-scheduling': `def interval_scheduling(intervals: list[tuple[int, int]]) -> list[tuple[int, int]]:
    """
    Selects the maximum cardinality subset of mutually compatible disjoint intervals.
    Returns the list of chosen intervals [(start, finish), ...].
    """
    selected = []
    # 1. Apply the Earliest Finish Time (EFT) greedy rule
    # 2. Iterate and select compatible tasks

    return selected

# Compatibility alias
seleccion_intervalos = interval_scheduling
`,

  'inversion-counting-dyc': `def count_inversions(arr: list[int]) -> int:
    """
    Counts total number of inversions in the given array:
    pairs of indices (i, j) such that i < j and arr[i] > arr[j].

    Required Time Complexity: O(n log n) via Divide and Conquer (Merge and Count).
    Returns total count of inversions (integer >= 0).
    """
    if len(arr) <= 1:
        return 0

    # Write your Divide and Conquer (Merge and Count) implementation here:

    return 0

# Compatibility alias
contar_inversiones = count_inversions
`,

  'juan-el-vago': `def lazy_juan(earnings: list[int]) -> tuple[int, list[int]]:
    """
    Determines the maximum earnings for Juan knowing he will never accept
    working two consecutive days.
    Returns (max_profit, days_worked) where days_worked are the indices.
    """
    n = len(earnings)
    if n == 0:
        return 0, []
    if n == 1:
        return earnings[0], [0]

    # 1. Initialize memoization table for subproblems
    # 2. Define base cases for the initial days
    # 3. Evaluate optimal recurrence for each subsequent day
    # 4. Reconstruct backward to recover the days worked

    return 0, []

# Compatibility alias
juan_el_vago = lazy_juan
`,

  'karatsuba-dyc': `def karatsuba_multiply(x: int, y: int) -> int:
    """
    Multiplies two large integers x and y in O(n^1.585) via Karatsuba algorithm.
    Returns the product x * y.
    """
    if x < 10 or y < 10:
        return x * y

    # 1. Determine number of digits m = max_digits // 2
    # 2. Split x into x1, x0 and y into y1, y0 using power = 10**m
    # 3. 3 recursive calls: z2 = K(x1, y1), z0 = K(x0, y0), z1 = K(x1+x0, y1+y0) - z2 - z0
    # 4. Combine: z2 * 10^(2m) + z1 * 10^m + z0

    return 0

# Compatibility alias
multiplicar_karatsuba = karatsuba_multiply
`,

  'knapsack-branch-and-bound': `def knapsack_branch_and_bound(capacity: int, weights: list[int], values: list[int]) -> int:
    """
    Solves 0/1 Knapsack using Branch and Bound.
    Prunes subtrees whose upper bound (continuous linear relaxation) is less than
    or equal to the best integer value found so far.
    Returns the optimal integer value.
    """
    n = len(weights)
    # Sort items by descending density (value / weight)
    items = sorted(zip(weights, values), key=lambda x: x[1] / x[0], reverse=True)
    best_value = [0]

    # Write your recursive function with upper-bound pruning here:

    return best_value[0]

# Compatibility alias
mochila_branch_and_bound = knapsack_branch_and_bound
`,

  'knapsack-dp': `def knapsack_dp(items: list[dict], capacity: int) -> tuple[int, list[dict]]:
    """
    Solves 0/1 Knapsack via Bottom-Up Dynamic Programming.
    Each item has 'id', 'weight', and 'value'.
    Returns (max_value, selected_items).
    """
    n = len(items)
    # 1. Initialize DP table of size (n + 1) x (capacity + 1)
    # 2. Apply recurrence DP[i][w] = max(exclude, include)
    # 3. Reconstruct selected items starting from dp[n][capacity]

    return 0, []

# Compatibility alias
mochila_dp = knapsack_dp
`,

  'knapsack-greedy': `def fractional_knapsack(items: list[dict], capacity: float) -> tuple[float, list[dict]]:
    """
    Solves fractional knapsack by greedily picking items by value density (value / weight).
    Returns (total_value, fractional_assignments).
    """
    # 1. Calculate density for each item
    # 2. Sort by descending density
    # 3. Fill the knapsack taking whole items or fractions

    return 0.0, []

# Compatibility alias
mochila_fraccionaria = fractional_knapsack
`,

  'knights-tour-backtracking': `def knights_tour(n: int) -> list[list[int]] | None:
    """
    Computes an open knight's tour on an n x n chessboard starting at (0, 0).
    Every square must be visited exactly once via legal L-shaped knight moves.
    Returns the n x n board where board[r][c] is the visit order (0 to n^2 - 1),
    or None if no tour exists.
    """
    board = [[-1] * n for _ in range(n)]

    # Write your backtracking algorithm with Warnsdorff's heuristic here:

    return None

# Compatibility alias
recorrido_caballo = knights_tour
`,

  'kruskal-mst-greedy': `def kruskal_mst(num_vertices: int, edges: list[tuple[int, int, int]]) -> tuple[int, list[tuple[int, int, int]]]:
    """
    num_vertices: number of vertices indexed 0 .. n-1.
    edges: list of (u, v, weight).
    Computes the Minimum Spanning Tree (MST) using Kruskal's algorithm.
    Returns (total_cost, list_of_selected_edges).
    """
    # 1. Sort all edges in ascending order of weight
    # 2. Initialize Union-Find (Disjoint Set Union with path compression and rank)
    # 3. Greedily add edges connecting disjoint components until V - 1 edges are added

    return 0, []

# Compatibility alias
kruskal_mst = kruskal_mst
`,

  'lcs-dp': `def longest_common_subsequence(s1: str, s2: str) -> str:
    """
    Given two strings s1 and s2, finds their Longest Common Subsequence (LCS).
    A subsequence is not required to occupy contiguous positions.

    Required Time Complexity: O(m * n) via 2D Dynamic Programming.
    Returns the string corresponding to the LCS. If no common characters, returns "".
    """
    m = len(s1)
    n = len(s2)
    if m == 0 or n == 0:
        return ""

    # Write your Dynamic Programming solution with back-pointers here:

    return ""

# Compatibility alias
subsecuencia_comun_mas_larga = longest_common_subsequence
`,

  'linear-programming-formulation': `def solve_lp_2d(c: tuple[float, float], constraints: list[tuple[float, float, float]]) -> dict:
    """
    Solves a 2-variable linear programming problem:
        Maximize z = c[0]*x + c[1]*y
        Subject to: a*x + b*y <= d  (for each (a, b, d) in constraints)
                    x >= 0, y >= 0
    Returns {'optimo': (x_opt, y_opt), 'valor_maximo': z_opt, 'vertices_factibles': list}
    """
    # 1. Add non-negativity constraints (-x <= 0, -y <= 0)
    # 2. Find intersection points between non-parallel boundary lines
    # 3. Filter feasible vertices satisfying all constraints
    # 4. Evaluate objective function at feasible vertices (Fundamental Theorem of LP)
    return {'optimo': (0.0, 0.0), 'valor_maximo': 0.0, 'vertices_factibles': []}

# Compatibility alias
resolver_lp_2d = solve_lp_2d
`,

  'majority-element-dyc': `def majority_element(arr: list[int]) -> int | None:
    """
    Finds the majority element (appearing strictly more than n // 2 times).
    If none exists, returns None.
    Required Time Complexity: O(n log n) via Divide and Conquer.
    """
    if not arr:
        return None

    # 1. Base case: if len(arr) == 1, the single element is the candidate
    # 2. Divide the array into two halves and recursively conquer each half
    # 3. If both halves agree on the candidate, that is the winner
    # 4. If they differ, count occurrences of both candidates and verify if either exceeds len // 2

    return None

# Compatibility alias
elemento_mayoritario = majority_element
`,

  'max-flow': `def edmonds_karp(vertices: list[str], edges: list[dict], source: str, sink: str) -> dict:
    """
    Computes maximum flow and minimum cut using Edmonds-Karp.
    edges is a list of dicts: [{'source': 'u', 'target': 'v', 'capacity': c}, ...]
    Returns {'flujo_maximo': int, 'flujo_aristas': dict, 'corte_S': set, 'corte_T': set}
    """
    # 1. Build residual network
    # 2. Find augmenting paths s -> t using BFS (shortest path in edge count)
    # 3. Augment flow along the bottleneck capacity
    # 4. Find minimum cut by reachability in final residual network

    return {'flujo_maximo': 0, 'flujo_aristas': {}}
`,

  'max-subarray-dyc': `def max_crossing_subarray(arr: list[int]) -> list[int]:
    """
    Finds the contiguous subarray with maximum sum crossing the midpoint m = len(arr) // 2.
    Required Time Complexity: O(n).
    """
    mid = len(arr) // 2
    # Traverse left from mid - 1 down to 0
    # Traverse right from mid up to len(arr) - 1
    return []

def max_subarray(arr: list[int]) -> list[int]:
    """
    Finds the contiguous subarray with maximum sum using Divide and Conquer.
    Returns the list of elements of the optimal subarray.
    """
    if len(arr) <= 1:
        return arr

    mid = len(arr) // 2
    # 1. Recursive call on left half
    # 2. Recursive call on right half
    # 3. Max crossing subarray
    # 4. Return candidate with largest sum among the 3

    return []

# Compatibility alias
subarreglo_cruzado = max_crossing_subarray
subarreglo_maxima_suma = max_subarray
`,

  'median-of-medians-dyc': `def kth_element(arr: list[int], k: int) -> int:
    """
    Finds the k-th smallest element (0-indexed) in deterministic linear time O(n)
    using the Median of Medians algorithm (BFPRT).
    """
    if len(arr) <= 5:
        return sorted(arr)[k]

    # 1. Group into blocks of 5 elements and find their medians
    # 2. Recursively pick pivot as the median of those medians
    # 3. Partition arr into less, equal, and greater than pivot
    # 4. Recursively descend to the partition corresponding to position k

    return 0

# Compatibility alias
k_esimo_elemento = kth_element
`,

  'merge-sort': `def merge_sort(arr: list[int]) -> list[int]:
    """
    Sorts a list of integers in ascending order using Merge Sort.
    Returns a new sorted list.
    """
    if len(arr) <= 1:
        return list(arr)

    # 1. Divide: compute midpoint
    # 2. Conquer: recursive calls on left and right halves
    # 3. Combine: merge function interleaving both sorted halves

    return []
`,

  'minimize-lateness-greedy': `def minimize_lateness(jobs: list[tuple[int, int]]) -> int:
    """
    jobs: list of tuples (duration t_i, deadline d_i).
    Schedules jobs on a single machine to minimize maximum lateness.
    Returns the optimal maximum lateness (int).
    """
    if not jobs:
        return 0

    # 1. Sort jobs using Earliest Deadline First (EDF, smallest d_i first)
    # 2. Iterate accumulating current time and calculate lateness max(0, current_time - d_i)
    # 3. Update and return the maximum lateness observed

    return 0

# Compatibility alias
minimizar_retraso_maximo = minimize_lateness
`,

  'n-queens': `def solve_n_queens(n: int) -> list[list[int]]:
    """
    Places n queens on an n x n chessboard with no two queens threatening each other.
    Returns the list of all valid solutions.
    """
    solutions = []
    # Write your backtracking algorithm with pruning here

    return solutions

# Compatibility alias
resolver_n_reinas = solve_n_queens
`,

  'peak-finding-dyc': `def find_peak(arr: list[int]) -> int:
    """
    Given an array of n unsorted integers, finds the index of a peak.
    An element arr[i] is a peak if it is greater than or equal to its neighbors:
      - If i > 0: arr[i] >= arr[i - 1]
      - If i < len(arr) - 1: arr[i] >= arr[i + 1]

    Required Time Complexity: O(log n) via Divide and Conquer.
    Returns peak index i. If array is empty, returns -1.
    """
    if not arr:
        return -1

    # Write your divide-and-conquer binary search algorithm here:

    return 0

# Compatibility alias
buscar_pico = find_peak
`,

  'randomized-fair-coin': `def fair_coin(biased_coin) -> int:
    """
    Von Neumann Algorithm (1951):
    Given a function biased_coin() returning 1 with prob p and 0 with prob 1-p,
    generates an unbiased bit 0 or 1 with probability exactly 50% each in expected O(1) time.
    """
    # Flip the biased coin in successive pairs (t1, t2)
    # If t1 == 0 and t2 == 1 -> return 0
    # If t1 == 1 and t2 == 0 -> return 1
    # If t1 == t2 -> discard pair and repeat
    return 0

# Compatibility alias
moneda_equilibrada = fair_coin
`,

  'rna-secondary-structure-dp': `def rna_secondary_structure(sequence: str) -> int:
    """
    sequence: string of RNA nitrogenous bases in {A, U, C, G}.
    Allowed complementary pairs: (A, U), (U, A), (C, G), (G, C).
    Biological constraints:
      1. No crossing pairs (no pseudoknots).
      2. Minimum separation: if (i, j) pair, j - i > 4.
      3. Each base participates in at most one base pair.
    Returns the maximum number of matched base pairs.
    """
    n = len(sequence)
    if n < 5:
        return 0

    # 1. Initialize interval DP table (n x n)
    # 2. Iterate over increasing substring lengths (respecting hairpin loop spacing)
    # 3. Evaluate transitions: base j unpaired vs valid pairing with t < j - 4

    return 0

# Compatibility alias
estructura_secundaria_arn = rna_secondary_structure
`,

  'road-antennas-greedy': `def build_antennas(houses: list[float], radius: float) -> list[float]:
    """
    Inputs:
      - houses: unsorted list of kilometers where houses are located
      - radius: coverage radius R of each antenna
    Returns:
      - list with positions (kilometers) of constructed antennas
    """
    if not houses:
        return []

    # 1. Sort houses from left to right
    # 2. Place antenna at earliest_uncovered_house + radius
    # 3. Skip houses already covered by this antenna and repeat until all covered

    return []

# Compatibility alias
construir_antenas = build_antennas
place_antennas = build_antennas
`,

  'segmented-least-squares-dp': `def segmented_least_squares(points: list[tuple[float, float]], cost_c: float) -> tuple[float, list[int]]:
    """
    points: list of (x, y) coordinates sorted by X coordinate.
    cost_c: fixed penalty C for opening a new line segment.
    Minimizes E + C*L where E is accumulated squared error and L is number of segments.
    Returns (optimal_cost, partitions).
    """
    n = len(points)
    if n == 0:
        return 0.0, []

    # 1. Precompute squared error matrix e[i][j] for best-fit line of points[i..j]
    # 2. Bellman recurrence: OPT[j] = min_{1 <= i <= j} (e[i][j] + C + OPT[i-1]) with OPT[0] = 0
    # 3. Trace back segment split indices

    return 0.0, []

# Compatibility alias
minimos_cuadrados_segmentados = segmented_least_squares
`,

  'subset-sum-backtracking': `def subsets_summing_to(numbers: list[int], target: int) -> list[list[int]]:
    """
    Given an array of positive integers and a target sum S,
    finds all subsets summing exactly to S.
    Uses systematic backtracking with upper-bound and deficit pruning.
    """
    items = [x for x in numbers if 0 < x <= target]
    items.sort(reverse=True)
    solutions = []

    # Write your recursive backtracking helper function with pruning here:

    return solutions

# Compatibility alias
subconjuntos_que_suman = subsets_summing_to
subset_sum = subsets_summing_to
`,

  'sudoku-backtracking': `def solve_sudoku(board: list[list[int]]) -> bool:
    """
    Solves a 9x9 Sudoku board in-place via Backtracking with constraint propagation.
    Empty cells are represented by 0.
    Returns True if the board has a valid solution (mutating it in-place), False otherwise.
    """
    # Write your recursive search function with pruning (optional MRV) here:

    return False

# Compatibility alias
resolver_sudoku = solve_sudoku
`,

  'tsp-branch-and-bound': `def tsp_branch_and_bound(distances: list[list[int]]) -> int:
    """
    Computes the optimal tour cost for the Traveling Salesperson Problem (TSP)
    using Branch and Bound with lower-bound pruning.
    distances: symmetric n x n matrix of pairwise distances/costs.
    Returns the minimum integer cost to visit all cities and return to origin.
    """
    n = len(distances)
    if n <= 1:
        return 0

    best_cost = [float('inf')]

    # Write your recursive function with lower-bound pruning here:

    return int(best_cost[0])

# Compatibility alias
tsp_bb = tsp_branch_and_bound
`,

  'vertex-cover-approx': `def vertex_cover_2approx(vertices: list[str], edges: list[tuple[str, str]]) -> tuple[list[str], list[tuple[str, str]]]:
    """
    Computes a 2-approximation for Vertex Cover using Maximal Matching.
    Returns (vertex_cover_C, matching_M).
    """
    cover = set()
    matching = []

    # Iterate edges: if neither u nor v in cover:
    # add (u, v) to matching and both u and v to cover

    return sorted(list(cover)), matching

# Compatibility alias
cobertura_vertices_2aprox = vertex_cover_2approx
`,

  'vertex-cover-reduction': `def reduce_is_to_vc(vertices: list[str], edges: list[tuple[str, str]], k: int) -> tuple[list[str], list[tuple[str, str]], int]:
    """
    Transforms an Independent Set instance (G, k)
    into an equivalent Vertex Cover instance (G, k').
    Returns (vertices, edges, k_prime).
    """
    n = len(vertices)
    k_prime = 0  # Compute k' = |V| - k
    return vertices, edges, k_prime


def transform_vc_solution_to_is(vertices: list[str], cover: list[str]) -> list[str]:
    """
    Given vertex cover C of graph G, reconstructs Independent Set S = V \\ C.
    """
    return []

# Compatibility alias
reducir_instancia_is_a_vc = reduce_is_to_vc
transformar_solucion_vc_a_is = transform_vc_solution_to_is
`,

  'weighted-interval-scheduling': `def weighted_interval_scheduling(intervals: list[list[int]]) -> list[list[int]]:
    """
    Given a set of intervals where each interval is [start, finish, weight],
    finds a mutually compatible subset of intervals maximizing the total weight.

    Required Time Complexity: O(n log n) via sorting + binary search predecessor p(j).
    Returns the list of intervals selected in the optimal subset.
    """
    if not intervals:
        return []

    # Write your Dynamic Programming solution here:

    return []

# Compatibility alias
planificar_intervalos_ponderados = weighted_interval_scheduling
`
};
