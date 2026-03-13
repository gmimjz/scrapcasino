import { Role, User } from '../../database/types';
import { MAX_CLIENT_SEED_LENGTH } from '../../utils/consts';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsString, Length, Matches } from 'class-validator';

export class SetClientSeedBody {
  @IsString()
  @Length(1, MAX_CLIENT_SEED_LENGTH)
  clientSeed: string;
}

export class SetSteamTradeUrlBody {
  @IsString()
  @Matches(
    /^https:\/\/steamcommunity\.com\/tradeoffer\/new\/\?partner=(\d+)&token=([a-zA-Z0-9_-]+)$/,
  )
  steamTradeUrl: string;
}

export class UserResponse implements User {
  id: string;
  steamId: string | null;
  username: string;
  avatarUrl: string | null;
  xp: number;
  balance: string;
  @ApiProperty({ enum: Role, enumName: 'Role' })
  role: Role;
  mutedUntil: Date | null;
  steamTradeUrl: string | null;
  hashedServerSeed: string;
  clientSeed: string;
  nonce: number;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  constructor(partial: Partial<UserResponse>) {
    Object.assign(this, partial);
  }
}

export class PublicUserResponse extends UserResponse {
  @Exclude()
  declare balance: string;

  @Exclude()
  declare mutedUntil: Date | null;

  @Exclude()
  declare clientSeed: string;

  @Exclude()
  declare hashedServerSeed: string;

  @Exclude()
  declare nonce: number;
}

export class UserWrappedResponse {
  user: UserResponse;
}

export class PublicUserWrappedResponse {
  user: PublicUserResponse;
}

export class PartialUserResponse implements Partial<User> {
  id: string;
  steamId: string | null;
  username: string;
  avatarUrl: string | null;
  xp: number;
  balance?: string;
  @ApiProperty({ enum: Role, enumName: 'Role' })
  role: Role;
  mutedUntil?: Date | null;
  steamTradeUrl?: string | null;
  hashedServerSeed?: string;
  clientSeed?: string;
  nonce?: number;
}
