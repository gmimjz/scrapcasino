import database from '../../database';
import { Inject } from '@nestjs/common';

export const DATABASE_PROVIDER = 'DatabaseProvider';

export const InjectDatabase = () => Inject(DATABASE_PROVIDER);

export const DatabaseProvider = {
  provide: DATABASE_PROVIDER,
  useValue: database,
};
