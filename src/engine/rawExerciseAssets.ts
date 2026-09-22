// Single Source of Truth: Canonical assets imported at build time via Vite ?raw
// Eliminates duplication between exercises/<id>/ files and TypeScript registries

import nQueensSolution from '../../exercises/n-queens/solution.py?raw';
import nQueensPseudocode from '../../exercises/n-queens/pseudocode.md?raw';
import nQueensTheory from '../../exercises/n-queens/theory.md?raw';

import intervalSchedulingSolution from '../../exercises/interval-scheduling/solution.py?raw';
import intervalSchedulingPseudocode from '../../exercises/interval-scheduling/pseudocode.md?raw';
import intervalSchedulingTheory from '../../exercises/interval-scheduling/theory.md?raw';

import knapsackDpSolution from '../../exercises/knapsack-dp/solution.py?raw';
import knapsackDpPseudocode from '../../exercises/knapsack-dp/pseudocode.md?raw';
import knapsackDpTheory from '../../exercises/knapsack-dp/theory.md?raw';

import juanElVagoSolution from '../../exercises/juan-el-vago/solution.py?raw';
import juanElVagoPseudocode from '../../exercises/juan-el-vago/pseudocode.md?raw';
import juanElVagoTheory from '../../exercises/juan-el-vago/theory.md?raw';

import knapsackGreedySolution from '../../exercises/knapsack-greedy/solution.py?raw';
import knapsackGreedyPseudocode from '../../exercises/knapsack-greedy/pseudocode.md?raw';
import knapsackGreedyTheory from '../../exercises/knapsack-greedy/theory.md?raw';

import mergeSortSolution from '../../exercises/merge-sort/solution.py?raw';
import mergeSortPseudocode from '../../exercises/merge-sort/pseudocode.md?raw';
import mergeSortTheory from '../../exercises/merge-sort/theory.md?raw';

import maxSubarraySolution from '../../exercises/max-subarray-dyc/solution.py?raw';
import maxSubarrayPseudocode from '../../exercises/max-subarray-dyc/pseudocode.md?raw';
import maxSubarrayTheory from '../../exercises/max-subarray-dyc/theory.md?raw';

import maxFlowSolution from '../../exercises/max-flow/solution.py?raw';
import maxFlowPseudocode from '../../exercises/max-flow/pseudocode.md?raw';
import maxFlowTheory from '../../exercises/max-flow/theory.md?raw';

import linearProgrammingSolution from '../../exercises/linear-programming/solution.py?raw';
import linearProgrammingPseudocode from '../../exercises/linear-programming/pseudocode.md?raw';
import linearProgrammingTheory from '../../exercises/linear-programming/theory.md?raw';

import vertexCoverReductionSolution from '../../exercises/vertex-cover-reduction/solution.py?raw';
import vertexCoverReductionPseudocode from '../../exercises/vertex-cover-reduction/pseudocode.md?raw';
import vertexCoverReductionTheory from '../../exercises/vertex-cover-reduction/theory.md?raw';

import vertexCoverApproxSolution from '../../exercises/vertex-cover-approx/solution.py?raw';
import vertexCoverApproxPseudocode from '../../exercises/vertex-cover-approx/pseudocode.md?raw';
import vertexCoverApproxTheory from '../../exercises/vertex-cover-approx/theory.md?raw';

import randomizedFairCoinSolution from '../../exercises/randomized-fair-coin/solution.py?raw';
import randomizedFairCoinPseudocode from '../../exercises/randomized-fair-coin/pseudocode.md?raw';
import randomizedFairCoinTheory from '../../exercises/randomized-fair-coin/theory.md?raw';

import roadAntennasSolution from '../../exercises/road-antennas-greedy/solution.py?raw';
import roadAntennasPseudocode from '../../exercises/road-antennas-greedy/pseudocode.md?raw';
import roadAntennasTheory from '../../exercises/road-antennas-greedy/theory.md?raw';

import subsetSumSolution from '../../exercises/subset-sum-backtracking/solution.py?raw';
import subsetSumPseudocode from '../../exercises/subset-sum-backtracking/pseudocode.md?raw';
import subsetSumTheory from '../../exercises/subset-sum-backtracking/theory.md?raw';

import coinChangeSolution from '../../exercises/coin-change-dp/solution.py?raw';
import coinChangePseudocode from '../../exercises/coin-change-dp/pseudocode.md?raw';
import coinChangeTheory from '../../exercises/coin-change-dp/theory.md?raw';

import peakFindingSolution from '../../exercises/peak-finding-dyc/solution.py?raw';
import peakFindingPseudocode from '../../exercises/peak-finding-dyc/pseudocode.md?raw';
import peakFindingTheory from '../../exercises/peak-finding-dyc/theory.md?raw';

import lcsSolution from '../../exercises/lcs-dp/solution.py?raw';
import lcsPseudocode from '../../exercises/lcs-dp/pseudocode.md?raw';
import lcsTheory from '../../exercises/lcs-dp/theory.md?raw';

import weightedIntervalSolution from '../../exercises/weighted-interval-scheduling/solution.py?raw';
import weightedIntervalPseudocode from '../../exercises/weighted-interval-scheduling/pseudocode.md?raw';
import weightedIntervalTheory from '../../exercises/weighted-interval-scheduling/theory.md?raw';

import inversionCountingSolution from '../../exercises/inversion-counting-dyc/solution.py?raw';
import inversionCountingPseudocode from '../../exercises/inversion-counting-dyc/pseudocode.md?raw';
import inversionCountingTheory from '../../exercises/inversion-counting-dyc/theory.md?raw';

import huffmanSolution from '../../exercises/huffman-coding-greedy/solution.py?raw';
import huffmanPseudocode from '../../exercises/huffman-coding-greedy/pseudocode.md?raw';
import huffmanTheory from '../../exercises/huffman-coding-greedy/theory.md?raw';

import graphColoringSolution from '../../exercises/graph-coloring-backtracking/solution.py?raw';
import graphColoringPseudocode from '../../exercises/graph-coloring-backtracking/pseudocode.md?raw';
import graphColoringTheory from '../../exercises/graph-coloring-backtracking/theory.md?raw';

export interface RawExerciseAsset {
  solution: string;
  pseudocode: string;
  theory: string;
}

export const RAW_EXERCISE_ASSETS: Record<string, RawExerciseAsset> = {
  'n-queens': {
    solution: nQueensSolution,
    pseudocode: nQueensPseudocode,
    theory: nQueensTheory
  },
  'interval-scheduling': {
    solution: intervalSchedulingSolution,
    pseudocode: intervalSchedulingPseudocode,
    theory: intervalSchedulingTheory
  },
  'knapsack-dp': {
    solution: knapsackDpSolution,
    pseudocode: knapsackDpPseudocode,
    theory: knapsackDpTheory
  },
  'juan-el-vago': {
    solution: juanElVagoSolution,
    pseudocode: juanElVagoPseudocode,
    theory: juanElVagoTheory
  },
  'knapsack-greedy': {
    solution: knapsackGreedySolution,
    pseudocode: knapsackGreedyPseudocode,
    theory: knapsackGreedyTheory
  },
  'merge-sort': {
    solution: mergeSortSolution,
    pseudocode: mergeSortPseudocode,
    theory: mergeSortTheory
  },
  'max-subarray-dyc': {
    solution: maxSubarraySolution,
    pseudocode: maxSubarrayPseudocode,
    theory: maxSubarrayTheory
  },
  'max-flow': {
    solution: maxFlowSolution,
    pseudocode: maxFlowPseudocode,
    theory: maxFlowTheory
  },
  'linear-programming-formulation': {
    solution: linearProgrammingSolution,
    pseudocode: linearProgrammingPseudocode,
    theory: linearProgrammingTheory
  },
  'vertex-cover-reduction': {
    solution: vertexCoverReductionSolution,
    pseudocode: vertexCoverReductionPseudocode,
    theory: vertexCoverReductionTheory
  },
  'vertex-cover-approx': {
    solution: vertexCoverApproxSolution,
    pseudocode: vertexCoverApproxPseudocode,
    theory: vertexCoverApproxTheory
  },
  'randomized-fair-coin': {
    solution: randomizedFairCoinSolution,
    pseudocode: randomizedFairCoinPseudocode,
    theory: randomizedFairCoinTheory
  },
  'road-antennas-greedy': {
    solution: roadAntennasSolution,
    pseudocode: roadAntennasPseudocode,
    theory: roadAntennasTheory
  },
  'subset-sum-backtracking': {
    solution: subsetSumSolution,
    pseudocode: subsetSumPseudocode,
    theory: subsetSumTheory
  },
  'coin-change-dp': {
    solution: coinChangeSolution,
    pseudocode: coinChangePseudocode,
    theory: coinChangeTheory
  },
  'peak-finding-dyc': {
    solution: peakFindingSolution,
    pseudocode: peakFindingPseudocode,
    theory: peakFindingTheory
  },
  'lcs-dp': {
    solution: lcsSolution,
    pseudocode: lcsPseudocode,
    theory: lcsTheory
  },
  'weighted-interval-scheduling': {
    solution: weightedIntervalSolution,
    pseudocode: weightedIntervalPseudocode,
    theory: weightedIntervalTheory
  },
  'inversion-counting-dyc': {
    solution: inversionCountingSolution,
    pseudocode: inversionCountingPseudocode,
    theory: inversionCountingTheory
  },
  'huffman-coding-greedy': {
    solution: huffmanSolution,
    pseudocode: huffmanPseudocode,
    theory: huffmanTheory
  },
  'graph-coloring-backtracking': {
    solution: graphColoringSolution,
    pseudocode: graphColoringPseudocode,
    theory: graphColoringTheory
  }
};
