/**
 * Utility for 1D label staggering when markers or pins have close or identical horizontal coordinates.
 * Assigns discrete vertical offset levels (0, 1, 2, ...) to prevent label collisions.
 */
export interface StaggerItem {
  id: string;
  x: number;
}

export function compute1DLabelLevels(
  items: StaggerItem[],
  proximityThreshold = 36
): Record<string, number> {
  const sorted = [...items].sort((a, b) => a.x - b.x || a.id.localeCompare(b.id));
  const levels: Record<string, number> = {};

  for (let i = 0; i < sorted.length; i++) {
    const curr = sorted[i];
    const usedLevels = new Set<number>();

    for (let j = 0; j < i; j++) {
      const prev = sorted[j];
      if (curr.x - prev.x < proximityThreshold) {
        usedLevels.add(levels[prev.id]);
      }
    }

    let lvl = 0;
    while (usedLevels.has(lvl)) {
      lvl++;
    }
    levels[curr.id] = lvl;
  }

  return levels;
}
