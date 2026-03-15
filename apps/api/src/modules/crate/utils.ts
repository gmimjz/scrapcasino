import type { CrateItem } from '../../database/types';

export function hmacToRoll(hmac: string): number {
  return Math.floor((parseInt(hmac.slice(0, 8), 16) / 0x100000000) * 10000);
}

export function selectItem(roll: number, items: CrateItem[]): CrateItem {
  let cumulative = 0;
  for (const item of items) {
    cumulative += item.chance;
    if (roll < cumulative) return item;
  }
  return items[items.length - 1];
}
