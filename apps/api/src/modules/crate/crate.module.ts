import { CrateController } from './crate.controller';
import { CrateService } from './crate.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [CrateController],
  providers: [CrateService],
})
export class CrateModule {}
