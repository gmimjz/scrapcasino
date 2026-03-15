import type { CrateItem } from '../../../database/types';
import { hmacToRoll, selectItem } from '../utils';

const makeItem = (
  chance: number,
  overrides: Partial<CrateItem> = {},
): CrateItem => ({
  id: 'item-id',
  crateId: 'crate-id',
  itemId: 'item-id',
  value: 100,
  chance,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('hmacToRoll', () => {
  it('converts the first 8 hex chars to a roll in [0, 9999]', () => {
    expect(hmacToRoll('00000000' + 'f'.repeat(56))).toBe(0);
    expect(hmacToRoll('ffffffff' + '0'.repeat(56))).toBe(9999);
  });

  it('only uses the first 8 characters and ignores the rest', () => {
    const roll1 = hmacToRoll('abcd1234' + '0'.repeat(56));
    const roll2 = hmacToRoll('abcd1234' + 'f'.repeat(56));
    expect(roll1).toBe(roll2);
  });
});

describe('selectItem', () => {
  const items = [
    makeItem(3000, { id: 'a' }),
    makeItem(5000, { id: 'b' }),
    makeItem(2000, { id: 'c' }),
  ];

  it('selects the first item when roll is below its chance', () => {
    expect(selectItem(0, items).id).toBe('a');
    expect(selectItem(2999, items).id).toBe('a');
  });

  it('selects the second item when roll falls in its range', () => {
    expect(selectItem(3000, items).id).toBe('b');
    expect(selectItem(7999, items).id).toBe('b');
  });

  it('selects the last item when roll is at the top of the range', () => {
    expect(selectItem(8000, items).id).toBe('c');
    expect(selectItem(9999, items).id).toBe('c');
  });

  it('works with a single item regardless of roll', () => {
    const single = [makeItem(10000, { id: 'a' })];
    expect(selectItem(0, single).id).toBe('a');
    expect(selectItem(9999, single).id).toBe('a');
  });
});
