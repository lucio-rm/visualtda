"""
Algoritmo de Von Neumann para Simulación de Moneda Equilibrada (1951)
Referencia de Cátedra: Algoritmos RW / FIUBA (Guía Algoritmos Randomizados, Ej. 3).
"""

import random
from typing import Callable, Tuple

def moneda_cargada_simulada(prob_1: float = 0.4) -> int:
    """
    Función de caja negra: devuelve 1 con probabilidad prob_1 y 0 con probabilidad 1 - prob_1.
    """
    return 1 if random.random() < prob_1 else 0


def moneda_equilibrada(fuente_cargada: Callable[[], int]) -> int:
    """
    Algoritmo de Las Vegas ideado por John von Neumann (1951).
    
    Lanza la moneda cargada en pares sucesivos (t1, t2):
        P(t1=0, t2=1) = (1 - p) * p
        P(t1=1, t2=0) = p * (1 - p)
    Como (1 - p) * p == p * (1 - p), ambos eventos son exactamente equiprobables.
    
    Retorna:
        0 si el par obtenido es (0, 1)
        1 si el par obtenido es (1, 0)
        Repite si el par es (0, 0) o (1, 1).
        
    Complejidad: O(1) tiempo esperado; espacio auxiliar O(1).
    """
    while True:
        tiro1 = fuente_cargada()
        tiro2 = fuente_cargada()

        if tiro1 == 0 and tiro2 == 1:
            return 0
        elif tiro1 == 1 and tiro2 == 0:
            return 1
        # Si tiro1 == tiro2, se descarta y continúa el ciclo


def simular_experimento(n_repeticiones: int = 10000, sesgo: float = 0.4) -> Tuple[float, float, float]:
    """
    Ejecuta un experimento de Monte Carlo para verificar la distribución empírica.
    Retorna (pct_ceros, pct_unos, promedio_tiros_por_bit).
    """
    fuente = lambda: moneda_cargada_simulada(sesgo)
    ceros = 0
    unos = 0
    total_tiros = 0

    for _ in range(n_repeticiones):
        tiros_esta_ronda = 0
        while True:
            t1 = fuente()
            t2 = fuente()
            tiros_esta_ronda += 2
            if t1 == 0 and t2 == 1:
                ceros += 1
                break
            elif t1 == 1 and t2 == 0:
                unos += 1
                break
        total_tiros += tiros_esta_ronda

    return (
        ceros / n_repeticiones * 100,
        unos / n_repeticiones * 100,
        total_tiros / n_repeticiones
    )
