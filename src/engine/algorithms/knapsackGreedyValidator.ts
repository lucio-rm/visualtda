import { ValidationResult, Validator } from '../../types/validation';
import { KnapsackItem } from './knapsackDpValidator';

export interface FractionalAssignment {
  itemId: string;
  fraction: number; // 0.0 to 1.0
}

export interface FractionalKnapsackInput {
  items: KnapsackItem[];
  capacity: number;
}

export class KnapsackGreedyValidator
  implements Validator<FractionalKnapsackInput, FractionalAssignment[]>
{
  validate(
    input: FractionalKnapsackInput,
    assignments: FractionalAssignment[]
  ): ValidationResult {
    const { items, capacity } = input;
    const errors: string[] = [];

    if (!Array.isArray(assignments)) {
      return {
        valid: false,
        errors: ['La solución debe ser una lista de asignaciones fraccionarias [{ itemId, fraction }].']
      };
    }

    if (capacity < 0) {
      return { valid: false, errors: ['La capacidad no puede ser negativa.'] };
    }

    const itemMap = new Map<string, KnapsackItem>();
    for (const item of items) {
      itemMap.set(item.id, item);
    }

    const seenIds = new Set<string>();
    let totalWeight = 0;
    let totalValue = 0;
    const EPS = 1e-6;

    for (const asgn of assignments) {
      if (!asgn || typeof asgn.fraction !== 'number') {
        errors.push('Asignación con formato inválido.');
        continue;
      }

      if (!itemMap.has(asgn.itemId)) {
        errors.push(`El ítem con ID "${asgn.itemId}" no existe en el conjunto de entrada.`);
        continue;
      }

      if (seenIds.has(asgn.itemId)) {
        errors.push(`El ítem "${asgn.itemId}" está repetido en la solución.`);
      }
      seenIds.add(asgn.itemId);

      if (asgn.fraction < -EPS || asgn.fraction > 1.0 + EPS) {
        errors.push(
          `Fracción inválida (${asgn.fraction.toFixed(2)}) para ítem "${asgn.itemId}". Debe estar entre 0.0 y 1.0.`
        );
      }

      const item = itemMap.get(asgn.itemId)!;
      const effectiveFraction = Math.max(0, Math.min(1, asgn.fraction));
      totalWeight += effectiveFraction * item.weight;
      totalValue += effectiveFraction * item.value;
    }

    if (totalWeight > capacity + EPS) {
      errors.push(
        `Capacidad excedida: peso total tomado ${totalWeight.toFixed(2)} > capacidad máxima ${capacity}.`
      );
    }

    const optimalValue = this.computeOptimalFractionalValue(items, capacity);
    if (errors.length === 0 && Math.abs(totalValue - optimalValue) > EPS) {
      errors.push(
        `Subóptimo: El valor total obtenido es $${totalValue.toFixed(2)}, pero el valor óptimo fraccionario es $${optimalValue.toFixed(2)}.`
      );
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  computeOptimalFractionalValue(items: KnapsackItem[], capacity: number): number {
    if (items.length === 0 || capacity <= 0) return 0;

    // Sort descending by value / weight ratio
    const sorted = [...items].sort((a, b) => b.value / b.weight - a.value / a.weight);

    let remCap = capacity;
    let totalVal = 0;

    for (const it of sorted) {
      if (remCap <= 0) break;
      if (it.weight <= remCap) {
        totalVal += it.value;
        remCap -= it.weight;
      } else {
        totalVal += it.value * (remCap / it.weight);
        remCap = 0;
      }
    }

    return totalVal;
  }
}

export const knapsackGreedyValidator = new KnapsackGreedyValidator();
