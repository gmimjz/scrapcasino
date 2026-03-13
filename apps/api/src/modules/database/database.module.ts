import { DatabaseProvider } from './database.provider';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  providers: [DatabaseProvider],
  exports: [DatabaseProvider],
})
export class DatabaseModule {}
