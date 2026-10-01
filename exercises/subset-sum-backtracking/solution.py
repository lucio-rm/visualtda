"""
Suma de Subconjuntos (Subset Sum con Backtracking y Podas)
Referencia de Cátedra: Algoritmos RW / FIUBA (Guía Backtracking, Ejercicio 11 ★).
"""

from typing import List

def subset_sum(numbers: List[int], target: int) -> List[List[int]]:
    """
    Given an array of positive integers and a target sum S,
    finds all disjoint subsets of numbers that sum up to exactly S.

    Backtracking with Pruning:
      1. Sort numbers in descending order to test larger elements first,
         triggering surplus prunings higher up in the recursion tree.
      2. For each element at idx:
         - Branch 1 (Include): add numbers[idx] to partial solution.
           * Surplus Pruning: if current_sum + numbers[idx] > target, prune.
         - Branch 2 (Exclude): skip numbers[idx].
           * Deficit Pruning: if current_sum + remaining < target, prune.
      3. Base case: if current_sum == target, record copy of current subset.

    Complexity:
      - Worst-case: O(2^n).
      - Average case with pruning: drastically lower than 2^n.
      - Auxiliary space: O(n) for recursion stack.
    """
    if target <= 0 or not numbers:
        return []

    # Filter out non-positives or numbers larger than target
    elements = [x for x in numbers if 0 < x <= target]
    elements.sort(reverse=True)

    solutions: List[List[int]] = []
    current_subset: List[int] = []

    def backtrack(idx: int, current_sum: int, remaining: int) -> None:
        if current_sum == target:
            solutions.append(list(current_subset))
            return

        if idx >= len(elements):
            return

        # Surplus pruning
        val = elements[idx]
        new_remaining = remaining - val

        # Branch 1: Include element
        if current_sum + val <= target:
            current_subset.append(val)
            backtrack(idx + 1, current_sum + val, new_remaining)
            current_subset.pop()

        # Branch 2: Exclude element (check deficit pruning)
        if current_sum + new_remaining >= target:
            backtrack(idx + 1, current_sum, new_remaining)

    total_remaining = sum(elements)
    backtrack(0, 0, total_remaining)
    return solutions


# Backward-compatible entry-point alias
subconjuntos_que_suman = subset_sum
