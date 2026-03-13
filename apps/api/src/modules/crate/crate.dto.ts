import { Crate, CrateItem, Item } from '../../database/types';
import { Exclude } from 'class-transformer';

export class CrateResponse implements Crate {
  id: string;
  name: string;
  imageUrl: string;
  cost: string;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  constructor(partial: Partial<CrateResponse>) {
    Object.assign(this, partial);
  }
}

export class CrateItemResponse implements CrateItem {
  id: string;
  crateId: string;
  itemId: string;
  value: string;
  chance: number;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  constructor(partial: Partial<CrateItemResponse>) {
    Object.assign(this, partial);
  }
}

export class ItemResponse implements Item {
  id: string;
  name: string;
  imageUrl: string;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  constructor(partial: Partial<ItemResponse>) {
    Object.assign(this, partial);
  }
}

export class GetCratesResponse {
  crates: CrateResponse[];
}

export class GetCrateResponse {
  crate: CrateResponse;
  crateItems: CrateItemResponse[];
  items: ItemResponse[];
}
