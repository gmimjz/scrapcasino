import type { User } from '../../database/types';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { IsPublic } from '../../decorators/is-public.decorator';
import {
  GetCrateResponse,
  GetCratesResponse,
  OpenCrateBody,
  OpenCrateResponse,
} from './crate.dto';
import { CrateService } from './crate.service';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common';

@Controller('crates')
@UseInterceptors(ClassSerializerInterceptor)
export class CrateController {
  constructor(private readonly crateService: CrateService) {}

  @Get()
  @IsPublic()
  async getCrates(): Promise<GetCratesResponse> {
    return this.crateService.getCrates();
  }

  @Get(':id')
  @IsPublic()
  async getCrate(@Param('id') id: string): Promise<GetCrateResponse> {
    return this.crateService.getCrate(id);
  }

  @Post(':id/open')
  async openCrate(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() body: OpenCrateBody,
  ): Promise<OpenCrateResponse> {
    const { count } = body;

    return this.crateService.openCrate(user, id, count);
  }
}
