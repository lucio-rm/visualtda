"""
Algoritmo de Von Neumann para Simulación de Moneda Equilibrada (1951)
Referencia de Cátedra: Algoritmos RW / FIUBA (Guía Algoritmos Randomizados, Ej. 3).
"""

import random
from typing import Callable, Tuple

def simulate_biased_coin(prob_1: float = 0.4) -> int:
    """
    Simulates a biased coin: returns 1 with probability prob_1, 0 with probability 1 - prob_1.
    """
    return 1 if random.random() < prob_1 else 0


def fair_coin(biased_source: Callable[[], int]) -> int:
    """
    John von Neumann's unbiased Bernoulli generator (1951).
    Tosses the biased coin in pairs (t1, t2):
        P(t1=0, t2=1) = (1 - p) * p
        P(t1=1, t2=0) = p * (1 - p)
    Returns:
        0 if (0, 1)
        1 if (1, 0)
        Repeats on (0, 0) or (1, 1).
    """
    while True:
        t1 = biased_source()
        t2 = biased_source()

        if t1 == 0 and t2 == 1:
            return 0
        elif t1 == 1 and t2 == 0:
            return 1


def run_experiment(num_trials: int = 10000, bias: float = 0.4) -> Tuple[float, float, float]:
    """
    Runs Monte Carlo experiment verifying the empirical fair coin distribution.
    Returns (pct_zeros, pct_ones, avg_tosses_per_bit).
    """
    source = lambda: simulate_biased_coin(bias)
    zeros = 0
    ones = 0
    total_tosses = 0

    for _ in range(num_trials):
        round_tosses = 0
        while True:
            t1 = source()
            t2 = source()
            round_tosses += 2
            if t1 == 0 and t2 == 1:
                zeros += 1
                break
            elif t1 == 1 and t2 == 0:
                ones += 1
                break
        total_tosses += round_tosses

    pct_zeros = zeros / num_trials
    pct_ones = ones / num_trials
    avg_tosses = total_tosses / num_trials
    return pct_zeros, pct_ones, avg_tosses


# Backward-compatible entry-point aliases
moneda_cargada_simulada = simulate_biased_coin
moneda_equilibrada = fair_coin
simular_experimento = run_experiment
