import { User } from '../database/types';
import 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    user?: User;
  }
}
