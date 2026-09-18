import { ValidationResult, Validator } from '../../types/validation';

export interface KnapsackItem {
  id: string;
  name: string;
  weight: number;
  value: number;
}

export interface KnapsackInput {
  items: KnapsackItem[];
  capacity: number;
}

export class KnapsackDpValidator implements Validator<KnapsackInput, KnapsackItem[]> {
  validate(input: KnapsackInput, selected: KnapsackItem[]): ValidationResult {
    const { items, capacity } = input;
    const errors: string[] = [];

    if (!Array.isArray(selected)) {
      return { valid: false, errors: ['La solución debe ser una lista de ítems seleccionados.'] };
    }

    // 1. Verify capacity non-negativity
    if (capacity < 0) {
      return { valid: false, errors: ['La capacidad de la mochila no puede ser negativa.'] };
    }

    // 2. Verify all selected items belong to the input pool without duplication
    const poolMap = new Map<string, KnapsackItem>();
    const itemCounts = new Map<string, number>();

    for (const item of items) {
      poolMap.set(item.id, item);
      itemCounts.set(item.id, (itemCounts.get(item.id) || 0) + 1);
    }

    let totalWeight = 0;
    let totalValue = 0;

    for (const item of selected) {
      if (!item || !item.id) {
        errors.push('Ítem inválido o sin identificador en la selección.');
        continue;
      }

      const available = itemCounts.get(item.id) || 0;
      if (available <= 0) {
        errors.push(`El ítem "${item.name || item.id}" no pertenece al conjunto disponible o fue duplicado.`);
      } else {
        itemCounts.set(item.id, available - 1);
      }

      totalWeight += item.weight;
      totalValue += item.value;
    }

    // 3. Verify total weight does not exceed capacity
    if (totalWeight > capacity) {
      errors.push(
        `Capacidad excedida: El peso total seleccionado es ${totalWeight}, pero la capacidad máxima es ${capacity} (exceso: ${totalWeight - capacity}).`
      );
    }

    // 4. Verify optimality against true DP solution
    const optimalValue = this.computeOptimalValue(items, capacity);
    if (errors.length === 0 && totalValue < optimalValue) {
      errors.push(
        `Subóptimo: El valor total obtenido es $${totalValue}, pero la solución óptima alcanza $${optimalValue}.`
      );
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  computeOptimalValue(items: KnapsackItem[], capacity: number): number {
    const n = items.length;
    if (n === 0 || capacity <= 0) return 0;

    const dp: number[][] = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));

    for (let i = 1; i <= n; i++) {
      const { weight, value } = items[i - 1];
      for (let w = 0; w <= capacity; w++) {
        if (weight <= w) {
          dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - weight] + value);
        } else {
          dp[i][w] = dp[i - 1][w];
        }
      }
    }

    return dp[n][capacity];
  }
}

export const knapsackDpValidator = new KnapsackDpValidator();
