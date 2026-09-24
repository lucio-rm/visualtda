import React from 'react';
import { RAW_EXERCISE_ASSETS } from './rawExerciseAssets';

import { NQueensVisualizer } from '../components/visualizers/NQueensVisualizer';
import { NQueensPlayground } from '../components/visualizers/NQueensPlayground';
import { IntervalSchedulingVisualizer } from '../components/visualizers/IntervalSchedulingVisualizer';
import { IntervalSchedulingPlayground } from '../components/visualizers/IntervalSchedulingPlayground';
import { KnapsackDpVisualizer } from '../components/visualizers/KnapsackDpVisualizer';
import { KnapsackPlayground } from '../components/visualizers/KnapsackPlayground';
import { JuanElVagoVisualizer } from '../components/visualizers/JuanElVagoVisualizer';
import { JuanElVagoPlayground } from '../components/visualizers/JuanElVagoPlayground';
import { KnapsackGreedyVisualizer } from '../components/visualizers/KnapsackGreedyVisualizer';
import { MergeSortVisualizer } from '../components/visualizers/MergeSortVisualizer';
import { MergeSortPlayground } from '../components/visualizers/MergeSortPlayground';
import { MaxSubarrayVisualizer } from '../components/visualizers/MaxSubarrayVisualizer';
import { MaxSubarrayPlayground } from '../components/visualizers/MaxSubarrayPlayground';
import { MaxFlowVisualizer } from '../components/visualizers/MaxFlowVisualizer';
import { MaxFlowPlayground } from '../components/visualizers/MaxFlowPlayground';
import { LinearProgrammingVisualizer } from '../components/visualizers/LinearProgrammingVisualizer';
import { LinearProgrammingPlayground } from '../components/visualizers/LinearProgrammingPlayground';
import { ReductionIsVcVisualizer } from '../components/visualizers/ReductionIsVcVisualizer';
import { ReductionIsVcPlayground } from '../components/visualizers/ReductionIsVcPlayground';
import { VertexCoverApproxVisualizer } from '../components/visualizers/VertexCoverApproxVisualizer';
import { VertexCoverApproxPlayground } from '../components/visualizers/VertexCoverApproxPlayground';
import { RandomizedFairCoinVisualizer } from '../components/visualizers/RandomizedFairCoinVisualizer';
import { RandomizedFairCoinPlayground } from '../components/visualizers/RandomizedFairCoinPlayground';
import { RoadAntennasVisualizer } from '../components/visualizers/RoadAntennasVisualizer';
import { RoadAntennasPlayground } from '../components/visualizers/RoadAntennasPlayground';
import { SubsetSumVisualizer } from '../components/visualizers/SubsetSumVisualizer';
import { SubsetSumPlayground } from '../components/visualizers/SubsetSumPlayground';
import { CoinChangeVisualizer } from '../components/visualizers/CoinChangeVisualizer';
import { CoinChangePlayground } from '../components/visualizers/CoinChangePlayground';
import { PeakFindingVisualizer } from '../components/visualizers/PeakFindingVisualizer';
import { PeakFindingPlayground } from '../components/visualizers/PeakFindingPlayground';
import { LcsVisualizer } from '../components/visualizers/LcsVisualizer';
import { LcsPlayground } from '../components/visualizers/LcsPlayground';
import { WeightedIntervalVisualizer } from '../components/visualizers/WeightedIntervalVisualizer';
import { WeightedIntervalPlayground } from '../components/visualizers/WeightedIntervalPlayground';
import { InversionCountingVisualizer } from '../components/visualizers/InversionCountingVisualizer';
import { InversionCountingPlayground } from '../components/visualizers/InversionCountingPlayground';
import { HuffmanVisualizer } from '../components/visualizers/HuffmanVisualizer';
import { HuffmanPlayground } from '../components/visualizers/HuffmanPlayground';
import { GraphColoringVisualizer } from '../components/visualizers/GraphColoringVisualizer';
import { GraphColoringPlayground } from '../components/visualizers/GraphColoringPlayground';
import { SudokuVisualizer } from '../components/visualizers/SudokuVisualizer';
import { SudokuPlayground } from '../components/visualizers/SudokuPlayground';
import { KnightsTourVisualizer } from '../components/visualizers/KnightsTourVisualizer';
import { KnightsTourPlayground } from '../components/visualizers/KnightsTourPlayground';
import { DijkstraVisualizer } from '../components/visualizers/DijkstraVisualizer';
import { DijkstraPlayground } from '../components/visualizers/DijkstraPlayground';
import { KruskalVisualizer } from '../components/visualizers/KruskalVisualizer';
import { KruskalPlayground } from '../components/visualizers/KruskalPlayground';
import { BellmanFordVisualizer } from '../components/visualizers/BellmanFordVisualizer';
import { BellmanFordPlayground } from '../components/visualizers/BellmanFordPlayground';
import { ClosestPairVisualizer } from '../components/visualizers/ClosestPairVisualizer';
import { ClosestPairPlayground } from '../components/visualizers/ClosestPairPlayground';
import { KnapsackBranchAndBoundVisualizer } from '../components/visualizers/KnapsackBranchAndBoundVisualizer';
import { KnapsackBranchAndBoundPlayground } from '../components/visualizers/KnapsackBranchAndBoundPlayground';
import { IntervalPartitioningVisualizer } from '../components/visualizers/IntervalPartitioningVisualizer';
import { IntervalPartitioningPlayground } from '../components/visualizers/IntervalPartitioningPlayground';
import { MinimizeLatenessVisualizer } from '../components/visualizers/MinimizeLatenessVisualizer';
import { MinimizeLatenessPlayground } from '../components/visualizers/MinimizeLatenessPlayground';
import { KaratsubaVisualizer } from '../components/visualizers/KaratsubaVisualizer';
import { KaratsubaPlayground } from '../components/visualizers/KaratsubaPlayground';
import { MajorityElementVisualizer } from '../components/visualizers/MajorityElementVisualizer';
import { MajorityElementPlayground } from '../components/visualizers/MajorityElementPlayground';
import { MedianOfMediansVisualizer } from '../components/visualizers/MedianOfMediansVisualizer';
import { MedianOfMediansPlayground } from '../components/visualizers/MedianOfMediansPlayground';
import { SegmentedLeastSquaresVisualizer } from '../components/visualizers/SegmentedLeastSquaresVisualizer';
import { SegmentedLeastSquaresPlayground } from '../components/visualizers/SegmentedLeastSquaresPlayground';
import { RnaSecondaryStructureVisualizer } from '../components/visualizers/RnaSecondaryStructureVisualizer';
import { RnaSecondaryStructurePlayground } from '../components/visualizers/RnaSecondaryStructurePlayground';
import { HamiltonianCycleVisualizer } from '../components/visualizers/HamiltonianCycleVisualizer';
import { HamiltonianCyclePlayground } from '../components/visualizers/HamiltonianCyclePlayground';
import { TspBranchAndBoundVisualizer } from '../components/visualizers/TspBranchAndBoundVisualizer';
import { TspBranchAndBoundPlayground } from '../components/visualizers/TspBranchAndBoundPlayground';

export interface ExerciseViewConfig {
  visualizerSlot?: React.ReactNode;
  discoverPlaygroundSlot?: React.ReactNode;
  canonicalPython?: string;
  pseudocode?: string;
  correctnessExplanation?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
}

export const EXERCISE_VIEW_REGISTRY: Record<string, ExerciseViewConfig> = {
  'n-queens': {
    visualizerSlot: <NQueensVisualizer />,
    discoverPlaygroundSlot: <NQueensPlayground />,
    canonicalPython: RAW_EXERCISE_ASSETS['n-queens'].solution,
    pseudocode: RAW_EXERCISE_ASSETS['n-queens'].pseudocode,
    correctnessExplanation: RAW_EXERCISE_ASSETS['n-queens'].theory,
    timeComplexity: 'O(N!) en el peor caso (recorrido exhaustivo con poda)',
    spaceComplexity: 'O(N) (pila de recursión y conjuntos de restricciones)'
  },

  'interval-scheduling': {
    visualizerSlot: <IntervalSchedulingVisualizer />,
    discoverPlaygroundSlot: <IntervalSchedulingPlayground />,
    canonicalPython: RAW_EXERCISE_ASSETS['interval-scheduling'].solution,
    pseudocode: RAW_EXERCISE_ASSETS['interval-scheduling'].pseudocode,
    correctnessExplanation: RAW_EXERCISE_ASSETS['interval-scheduling'].theory,
    timeComplexity: 'O(N log N) por el ordenamiento inicial',
    spaceComplexity: 'O(N) para la lista de salida'
  },

  'knapsack-dp': {
    visualizerSlot: <KnapsackDpVisualizer />,
    discoverPlaygroundSlot: <KnapsackPlayground />,
    canonicalPython: RAW_EXERCISE_ASSETS['knapsack-dp'].solution,
    pseudocode: RAW_EXERCISE_ASSETS['knapsack-dp'].pseudocode,
    correctnessExplanation: RAW_EXERCISE_ASSETS['knapsack-dp'].theory,
    timeComplexity: 'O(N · W) pseudopolinomial',
    spaceComplexity: 'O(N · W) para la tabla de programación dinámica'
  },

  'juan-el-vago': {
    visualizerSlot: <JuanElVagoVisualizer />,
    discoverPlaygroundSlot: <JuanElVagoPlayground />,
    canonicalPython: RAW_EXERCISE_ASSETS['juan-el-vago'].solution,
    pseudocode: RAW_EXERCISE_ASSETS['juan-el-vago'].pseudocode,
    correctnessExplanation: RAW_EXERCISE_ASSETS['juan-el-vago'].theory,
    timeComplexity: 'O(N) lineal',
    spaceComplexity: 'O(N) para el arreglo de memoización'
  },

  'knapsack-greedy': {
    visualizerSlot: <KnapsackGreedyVisualizer />,
    discoverPlaygroundSlot: <KnapsackPlayground />,
    canonicalPython: RAW_EXERCISE_ASSETS['knapsack-greedy'].solution,
    pseudocode: RAW_EXERCISE_ASSETS['knapsack-greedy'].pseudocode,
    correctnessExplanation: RAW_EXERCISE_ASSETS['knapsack-greedy'].theory,
    timeComplexity: 'O(N log N) ordenamiento por densidad valor/peso',
    spaceComplexity: 'O(N) lista de ítems'
  },

  'merge-sort': {
    visualizerSlot: <MergeSortVisualizer />,
    discoverPlaygroundSlot: <MergeSortPlayground />,
    canonicalPython: RAW_EXERCISE_ASSETS['merge-sort'].solution,
    pseudocode: RAW_EXERCISE_ASSETS['merge-sort'].pseudocode,
    correctnessExplanation: RAW_EXERCISE_ASSETS['merge-sort'].theory,
    timeComplexity: 'O(N log N) en mejor, promedio y peor caso',
    spaceComplexity: 'O(N) para el arreglo auxiliar de fusión'
  },

  'max-subarray-dyc': {
    visualizerSlot: <MaxSubarrayVisualizer />,
    discoverPlaygroundSlot: <MaxSubarrayPlayground />,
    canonicalPython: RAW_EXERCISE_ASSETS['max-subarray-dyc'].solution,
    pseudocode: RAW_EXERCISE_ASSETS['max-subarray-dyc'].pseudocode,
    correctnessExplanation: RAW_EXERCISE_ASSETS['max-subarray-dyc'].theory,
    timeComplexity: 'O(N log N) D&C estándar / O(N) vía Kadane',
    spaceComplexity: 'O(log N) para la pila de recursión'
  },

  'max-flow': {
    visualizerSlot: <MaxFlowVisualizer />,
    discoverPlaygroundSlot: <MaxFlowPlayground />,
    canonicalPython: RAW_EXERCISE_ASSETS['max-flow'].solution,
    pseudocode: RAW_EXERCISE_ASSETS['max-flow'].pseudocode,
    correctnessExplanation: RAW_EXERCISE_ASSETS['max-flow'].theory,
    timeComplexity: 'O(E · |f*|) Ford-Fulkerson / O(V · E²) Edmonds-Karp',
    spaceComplexity: 'O(V + E) para la red residual'
  },

  'linear-programming': {
    visualizerSlot: <LinearProgrammingVisualizer />,
    discoverPlaygroundSlot: <LinearProgrammingPlayground />,
    canonicalPython: RAW_EXERCISE_ASSETS['linear-programming'].solution,
    pseudocode: RAW_EXERCISE_ASSETS['linear-programming'].pseudocode,
    correctnessExplanation: RAW_EXERCISE_ASSETS['linear-programming'].theory,
    timeComplexity: 'O(2^m · poly(n)) Simplex en peor caso / O(poly(n)) métodos de punto interior',
    spaceComplexity: 'O(m · n) matriz del tablero Simplex'
  },
  'linear-programming-formulation': {
    visualizerSlot: <LinearProgrammingVisualizer />,
    discoverPlaygroundSlot: <LinearProgrammingPlayground />,
    canonicalPython: RAW_EXERCISE_ASSETS['linear-programming'].solution,
    pseudocode: RAW_EXERCISE_ASSETS['linear-programming'].pseudocode,
    correctnessExplanation: RAW_EXERCISE_ASSETS['linear-programming'].theory,
    timeComplexity: 'O(2^m · poly(n)) Simplex en peor caso / O(poly(n)) métodos de punto interior',
    spaceComplexity: 'O(m · n) matriz del tablero Simplex'
  },

  'vertex-cover-reduction': {
    visualizerSlot: <ReductionIsVcVisualizer />,
    discoverPlaygroundSlot: <ReductionIsVcPlayground />,
    canonicalPython: RAW_EXERCISE_ASSETS['vertex-cover-reduction'].solution,
    pseudocode: RAW_EXERCISE_ASSETS['vertex-cover-reduction'].pseudocode,
    correctnessExplanation: RAW_EXERCISE_ASSETS['vertex-cover-reduction'].theory,
    timeComplexity: 'O(V + E) tiempo polinomial de transformación',
    spaceComplexity: 'O(V) para el conjunto complementario'
  },

  'vertex-cover-approx': {
    visualizerSlot: <VertexCoverApproxVisualizer />,
    discoverPlaygroundSlot: <VertexCoverApproxPlayground />,
    canonicalPython: RAW_EXERCISE_ASSETS['vertex-cover-approx'].solution,
    pseudocode: RAW_EXERCISE_ASSETS['vertex-cover-approx'].pseudocode,
    correctnessExplanation: RAW_EXERCISE_ASSETS['vertex-cover-approx'].theory,
    timeComplexity: 'O(V + E) lineal',
    spaceComplexity: 'O(V) conjunto de vértices de la cubierta'
  },

  'randomized-fair-coin': {
    visualizerSlot: <RandomizedFairCoinVisualizer />,
    discoverPlaygroundSlot: <RandomizedFairCoinPlayground />,
    canonicalPython: RAW_EXERCISE_ASSETS['randomized-fair-coin'].solution,
    pseudocode: RAW_EXERCISE_ASSETS['randomized-fair-coin'].pseudocode,
    correctnessExplanation: RAW_EXERCISE_ASSETS['randomized-fair-coin'].theory,
    timeComplexity: 'O(1) valor esperado (distribución geométrica con parámetro p(1-p))',
    spaceComplexity: 'O(1) espacio constante'
  },

  'road-antennas-greedy': {
    visualizerSlot: <RoadAntennasVisualizer />,
    discoverPlaygroundSlot: <RoadAntennasPlayground />,
    canonicalPython: RAW_EXERCISE_ASSETS['road-antennas-greedy'].solution,
    pseudocode: RAW_EXERCISE_ASSETS['road-antennas-greedy'].pseudocode,
    correctnessExplanation: RAW_EXERCISE_ASSETS['road-antennas-greedy'].theory,
    timeComplexity: 'O(N log N) dominado por el ordenamiento de las casas',
    spaceComplexity: 'O(N) arreglo de posiciones de antenas'
  },

  'subset-sum-backtracking': {
    visualizerSlot: <SubsetSumVisualizer />,
    discoverPlaygroundSlot: <SubsetSumPlayground />,
    canonicalPython: RAW_EXERCISE_ASSETS['subset-sum-backtracking'].solution,
    pseudocode: RAW_EXERCISE_ASSETS['subset-sum-backtracking'].pseudocode,
    correctnessExplanation: RAW_EXERCISE_ASSETS['subset-sum-backtracking'].theory,
    timeComplexity: 'O(2^N) en el peor caso sin poda',
    spaceComplexity: 'O(N) profundidad máxima del árbol de recursión'
  },

  'coin-change-dp': {
    visualizerSlot: <CoinChangeVisualizer />,
    discoverPlaygroundSlot: <CoinChangePlayground />,
    canonicalPython: RAW_EXERCISE_ASSETS['coin-change-dp'].solution,
    pseudocode: RAW_EXERCISE_ASSETS['coin-change-dp'].pseudocode,
    correctnessExplanation: RAW_EXERCISE_ASSETS['coin-change-dp'].theory,
    timeComplexity: 'O(N · V) donde V es el monto objetivo y N la cantidad de denominaciones',
    spaceComplexity: 'O(V) tabla unidimensional de cantidades mínimas'
  },

  'peak-finding-dyc': {
    visualizerSlot: <PeakFindingVisualizer />,
    discoverPlaygroundSlot: <PeakFindingPlayground />,
    canonicalPython: RAW_EXERCISE_ASSETS['peak-finding-dyc'].solution,
    pseudocode: RAW_EXERCISE_ASSETS['peak-finding-dyc'].pseudocode,
    correctnessExplanation: RAW_EXERCISE_ASSETS['peak-finding-dyc'].theory,
    timeComplexity: 'O(log N) 1D / O(N log M) 2D',
    spaceComplexity: 'O(log N) pila de recursión'
  },

  'lcs-dp': {
    visualizerSlot: <LcsVisualizer />,
    discoverPlaygroundSlot: <LcsPlayground />,
    canonicalPython: RAW_EXERCISE_ASSETS['lcs-dp'].solution,
    pseudocode: RAW_EXERCISE_ASSETS['lcs-dp'].pseudocode,
    correctnessExplanation: RAW_EXERCISE_ASSETS['lcs-dp'].theory,
    timeComplexity: 'O(M · N) cuadrático',
    spaceComplexity: 'O(M · N) para la matriz de longitud de subcadenas'
  },

  'weighted-interval-scheduling': {
    visualizerSlot: <WeightedIntervalVisualizer />,
    discoverPlaygroundSlot: <WeightedIntervalPlayground />,
    canonicalPython: RAW_EXERCISE_ASSETS['weighted-interval-scheduling'].solution,
    pseudocode: RAW_EXERCISE_ASSETS['weighted-interval-scheduling'].pseudocode,
    correctnessExplanation: RAW_EXERCISE_ASSETS['weighted-interval-scheduling'].theory,
    timeComplexity: 'O(N log N) por ordenamiento y búsqueda binaria de p(j)',
    spaceComplexity: 'O(N) tabla memoizada opt'
  },

  'inversion-counting-dyc': {
    visualizerSlot: <InversionCountingVisualizer />,
    discoverPlaygroundSlot: <InversionCountingPlayground />,
    canonicalPython: RAW_EXERCISE_ASSETS['inversion-counting-dyc'].solution,
    pseudocode: RAW_EXERCISE_ASSETS['inversion-counting-dyc'].pseudocode,
    correctnessExplanation: RAW_EXERCISE_ASSETS['inversion-counting-dyc'].theory,
    timeComplexity: 'O(N log N) idéntico a Merge Sort',
    spaceComplexity: 'O(N) buffers de fusión'
  },

  'huffman-coding-greedy': {
    visualizerSlot: <HuffmanVisualizer />,
    discoverPlaygroundSlot: <HuffmanPlayground />,
    canonicalPython: RAW_EXERCISE_ASSETS['huffman-coding-greedy'].solution,
    pseudocode: RAW_EXERCISE_ASSETS['huffman-coding-greedy'].pseudocode,
    correctnessExplanation: RAW_EXERCISE_ASSETS['huffman-coding-greedy'].theory,
    timeComplexity: 'O(N log N) con min-heap binario (N-1 extracciones dobles)',
    spaceComplexity: 'O(N) para la estructura arbórea de prefijo'
  },

  'graph-coloring-backtracking': {
    visualizerSlot: <GraphColoringVisualizer />,
    discoverPlaygroundSlot: <GraphColoringPlayground />,
    canonicalPython: RAW_EXERCISE_ASSETS['graph-coloring-backtracking']?.solution,
    pseudocode: RAW_EXERCISE_ASSETS['graph-coloring-backtracking']?.pseudocode,
    correctnessExplanation: RAW_EXERCISE_ASSETS['graph-coloring-backtracking']?.theory,
    timeComplexity: 'O(K^V) en el peor caso exponencial',
    spaceComplexity: 'O(V) vector de asignación de colores'
  },

  'sudoku-backtracking': {
    visualizerSlot: <SudokuVisualizer />,
    discoverPlaygroundSlot: <SudokuPlayground />,
    canonicalPython: RAW_EXERCISE_ASSETS['sudoku-backtracking']?.solution,
    pseudocode: RAW_EXERCISE_ASSETS['sudoku-backtracking']?.pseudocode,
    correctnessExplanation: RAW_EXERCISE_ASSETS['sudoku-backtracking']?.theory,
    timeComplexity: 'O(9^m) en el peor caso sin podas / MRV resuelve en milisegundos',
    spaceComplexity: 'O(1) tablero 9x9 constante (81 celdas)'
  },

  'knights-tour-backtracking': {
    visualizerSlot: <KnightsTourVisualizer />,
    discoverPlaygroundSlot: <KnightsTourPlayground />,
    canonicalPython: RAW_EXERCISE_ASSETS['knights-tour-backtracking']?.solution,
    pseudocode: RAW_EXERCISE_ASSETS['knights-tour-backtracking']?.pseudocode,
    correctnessExplanation: RAW_EXERCISE_ASSETS['knights-tour-backtracking']?.theory,
    timeComplexity: 'O(8^(N²)) en el peor caso / O(N²) tiempo lineal casi seguro con Warnsdorff',
    spaceComplexity: 'O(N²) para la matriz del tablero y la pila de recursión'
  },

  'dijkstra-greedy': {
    visualizerSlot: <DijkstraVisualizer />,
    discoverPlaygroundSlot: <DijkstraPlayground />,
    canonicalPython: RAW_EXERCISE_ASSETS['dijkstra-greedy']?.solution,
    pseudocode: RAW_EXERCISE_ASSETS['dijkstra-greedy']?.pseudocode,
    correctnessExplanation: RAW_EXERCISE_ASSETS['dijkstra-greedy']?.theory,
    timeComplexity: 'O((V + E) log V) con min-heap binario / O(V²) con arreglo simple',
    spaceComplexity: 'O(V) para distancias, predecesores y cola de prioridad'
  },

  'kruskal-mst-greedy': {
    visualizerSlot: <KruskalVisualizer />,
    discoverPlaygroundSlot: <KruskalPlayground />,
    canonicalPython: RAW_EXERCISE_ASSETS['kruskal-mst-greedy']?.solution,
    pseudocode: RAW_EXERCISE_ASSETS['kruskal-mst-greedy']?.pseudocode,
    correctnessExplanation: RAW_EXERCISE_ASSETS['kruskal-mst-greedy']?.theory,
    timeComplexity: 'O(E log E) dominado por el ordenamiento de las aristas',
    spaceComplexity: 'O(V) para la estructura de Conjuntos Disjuntos (Union-Find)'
  },

  'bellman-ford-dp': {
    visualizerSlot: <BellmanFordVisualizer />,
    discoverPlaygroundSlot: <BellmanFordPlayground />,
    canonicalPython: RAW_EXERCISE_ASSETS['bellman-ford-dp']?.solution,
    pseudocode: RAW_EXERCISE_ASSETS['bellman-ford-dp']?.pseudocode,
    correctnessExplanation: RAW_EXERCISE_ASSETS['bellman-ford-dp']?.theory,
    timeComplexity: 'O(V · E) tiempo polinomial / detecta ciclos negativos en la iteración |V|',
    spaceComplexity: 'O(V · E) tabla 2D completa o O(V) con optimización de espacio'
  },

  'closest-pair-dyc': {
    visualizerSlot: <ClosestPairVisualizer />,
    discoverPlaygroundSlot: <ClosestPairPlayground />,
    canonicalPython: RAW_EXERCISE_ASSETS['closest-pair-dyc']?.solution,
    pseudocode: RAW_EXERCISE_ASSETS['closest-pair-dyc']?.pseudocode,
    correctnessExplanation: RAW_EXERCISE_ASSETS['closest-pair-dyc']?.theory,
    timeComplexity: 'O(N log N) recurrencia T(N) = 2T(N/2) + O(N) vía ordenamiento previo en Y',
    spaceComplexity: 'O(N) arreglos auxiliares para la banda de fusión'
  },

  'knapsack-branch-and-bound': {
    visualizerSlot: <KnapsackBranchAndBoundVisualizer />,
    discoverPlaygroundSlot: <KnapsackBranchAndBoundPlayground />,
    canonicalPython: RAW_EXERCISE_ASSETS['knapsack-branch-and-bound']?.solution,
    pseudocode: RAW_EXERCISE_ASSETS['knapsack-branch-and-bound']?.pseudocode,
    correctnessExplanation: RAW_EXERCISE_ASSETS['knapsack-branch-and-bound']?.theory,
    timeComplexity: 'O(2^N) en el peor caso / poda drástica en la práctica mediante cota fraccionaria',
    spaceComplexity: 'O(N) profundidad máxima del árbol de búsqueda'
  },

  'interval-partitioning-greedy': {
    visualizerSlot: <IntervalPartitioningVisualizer />,
    discoverPlaygroundSlot: <IntervalPartitioningPlayground />,
    canonicalPython: RAW_EXERCISE_ASSETS['interval-partitioning-greedy']?.solution,
    pseudocode: RAW_EXERCISE_ASSETS['interval-partitioning-greedy']?.pseudocode,
    correctnessExplanation: RAW_EXERCISE_ASSETS['interval-partitioning-greedy']?.theory,
    timeComplexity: 'O(N log N) dominado por ordenamiento y min-heap de aulas',
    spaceComplexity: 'O(N) para la cola de prioridad de aulas abiertas'
  },

  'minimize-lateness-greedy': {
    visualizerSlot: <MinimizeLatenessVisualizer />,
    discoverPlaygroundSlot: <MinimizeLatenessPlayground />,
    canonicalPython: RAW_EXERCISE_ASSETS['minimize-lateness-greedy']?.solution,
    pseudocode: RAW_EXERCISE_ASSETS['minimize-lateness-greedy']?.pseudocode,
    correctnessExplanation: RAW_EXERCISE_ASSETS['minimize-lateness-greedy']?.theory,
    timeComplexity: 'O(N log N) ordenamiento por fecha límite d_i (EDF)',
    spaceComplexity: 'O(N) para el cronograma secuencial'
  },

  'karatsuba-dyc': {
    visualizerSlot: <KaratsubaVisualizer />,
    discoverPlaygroundSlot: <KaratsubaPlayground />,
    canonicalPython: RAW_EXERCISE_ASSETS['karatsuba-dyc']?.solution,
    pseudocode: RAW_EXERCISE_ASSETS['karatsuba-dyc']?.pseudocode,
    correctnessExplanation: RAW_EXERCISE_ASSETS['karatsuba-dyc']?.theory,
    timeComplexity: 'O(N^{log_2 3}) ≈ O(N^{1.585}) mediante 3 multiplicaciones recursivas',
    spaceComplexity: 'O(N) para buffers y pila de recursión'
  },

  'majority-element-dyc': {
    visualizerSlot: <MajorityElementVisualizer />,
    discoverPlaygroundSlot: <MajorityElementPlayground />,
    canonicalPython: RAW_EXERCISE_ASSETS['majority-element-dyc']?.solution,
    pseudocode: RAW_EXERCISE_ASSETS['majority-element-dyc']?.pseudocode,
    correctnessExplanation: RAW_EXERCISE_ASSETS['majority-element-dyc']?.theory,
    timeComplexity: 'O(N log N) D&C estándar / O(N) Boyer-Moore',
    spaceComplexity: 'O(log N) pila de recursión'
  },

  'median-of-medians-dyc': {
    visualizerSlot: <MedianOfMediansVisualizer />,
    discoverPlaygroundSlot: <MedianOfMediansPlayground />,
    canonicalPython: RAW_EXERCISE_ASSETS['median-of-medians-dyc']?.solution,
    pseudocode: RAW_EXERCISE_ASSETS['median-of-medians-dyc']?.pseudocode,
    correctnessExplanation: RAW_EXERCISE_ASSETS['median-of-medians-dyc']?.theory,
    timeComplexity: 'O(N) lineal determinístico estricto en el peor caso',
    spaceComplexity: 'O(N) para sublistas de medianas y particiones'
  },

  'segmented-least-squares-dp': {
    visualizerSlot: <SegmentedLeastSquaresVisualizer />,
    discoverPlaygroundSlot: <SegmentedLeastSquaresPlayground />,
    canonicalPython: RAW_EXERCISE_ASSETS['segmented-least-squares-dp']?.solution,
    pseudocode: RAW_EXERCISE_ASSETS['segmented-least-squares-dp']?.pseudocode,
    correctnessExplanation: RAW_EXERCISE_ASSETS['segmented-least-squares-dp']?.theory,
    timeComplexity: 'O(N²) con precomputación de errores / O(N³) sin precomputación',
    spaceComplexity: 'O(N) para el vector OPT y origen de particiones'
  },

  'rna-secondary-structure-dp': {
    visualizerSlot: <RnaSecondaryStructureVisualizer />,
    discoverPlaygroundSlot: <RnaSecondaryStructurePlayground />,
    canonicalPython: RAW_EXERCISE_ASSETS['rna-secondary-structure-dp']?.solution,
    pseudocode: RAW_EXERCISE_ASSETS['rna-secondary-structure-dp']?.pseudocode,
    correctnessExplanation: RAW_EXERCISE_ASSETS['rna-secondary-structure-dp']?.theory,
    timeComplexity: 'O(N³) por búsqueda del punto de enlace t en cada intervalo',
    spaceComplexity: 'O(N²) para la matriz DP triangular superior'
  },

  'hamiltonian-cycle-backtracking': {
    visualizerSlot: <HamiltonianCycleVisualizer />,
    discoverPlaygroundSlot: <HamiltonianCyclePlayground />,
    canonicalPython: RAW_EXERCISE_ASSETS['hamiltonian-cycle-backtracking']?.solution,
    pseudocode: RAW_EXERCISE_ASSETS['hamiltonian-cycle-backtracking']?.pseudocode,
    correctnessExplanation: RAW_EXERCISE_ASSETS['hamiltonian-cycle-backtracking']?.theory,
    timeComplexity: 'O(N!) en el peor caso exponencial (problema NP-completo)',
    spaceComplexity: 'O(N) para la pila de recursión y conjunto de visitados'
  },

  'tsp-branch-and-bound': {
    visualizerSlot: <TspBranchAndBoundVisualizer />,
    discoverPlaygroundSlot: <TspBranchAndBoundPlayground />,
    canonicalPython: RAW_EXERCISE_ASSETS['tsp-branch-and-bound']?.solution,
    pseudocode: RAW_EXERCISE_ASSETS['tsp-branch-and-bound']?.pseudocode,
    correctnessExplanation: RAW_EXERCISE_ASSETS['tsp-branch-and-bound']?.theory,
    timeComplexity: 'O(N!) en el peor caso / poda drástica con cotas 1-tree o asignación',
    spaceComplexity: 'O(N) para la pila del recorrido Branch & Bound'
  }
};

export function getExerciseViewConfig(exerciseId: string): ExerciseViewConfig {
  const specific = EXERCISE_VIEW_REGISTRY[exerciseId] || {};
  const raw = RAW_EXERCISE_ASSETS[exerciseId];
  if (!raw) return specific;
  return {
    ...specific,
    canonicalPython: specific.canonicalPython || raw.solution,
    pseudocode: specific.pseudocode || raw.pseudocode,
    correctnessExplanation: specific.correctnessExplanation || raw.theory,
    timeComplexity: specific.timeComplexity || 'O(n log n) / O(n)',
    spaceComplexity: specific.spaceComplexity || 'O(n)'
  };
}
