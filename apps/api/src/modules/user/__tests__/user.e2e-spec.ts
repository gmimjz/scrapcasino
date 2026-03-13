import { ErrorLoggerFilter } from '../../../../test/error-logger.filter';
import { createUserFactory } from '../../../../test/factories/user.factory';
import { clearDatabase, createCookie } from '../../../../test/helpers';
import type { Database } from '../../../database';
import { STEAM_ID_BASE } from '../../../utils/consts';
import { AppModule } from '../../app/app.module';
import { DATABASE_PROVIDER } from '../../database/database.provider';
import { faker } from '@faker-js/faker';
import fastifyCookie from '@fastify/cookie';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

describe('UserController (e2e)', () => {
  let app: NestFastifyApplication;
  let db: Database;
  let userFactory: ReturnType<typeof createUserFactory>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    app.useGlobalFilters(new ErrorLoggerFilter());
    await app.register(fastifyCookie);
    await app.listen(0);

    db = moduleFixture.get<Database>(DATABASE_PROVIDER);
    await clearDatabase(db);

    userFactory = createUserFactory(db);
  });

  afterAll(async () => {
    await app.close();
    await clearDatabase(db);
    await db.$client.end();
  });

  describe('GET /user', () => {
    it('should return the authenticated user', async () => {
      const user = await userFactory.create();

      const response = await request(app.getHttpServer())
        .get('/user')
        .set('Cookie', createCookie(user.session!.id))
        .expect(200);

      expect(response.body.user).toBeDefined();
      expect(response.body.user).toEqual({
        id: user.id,
        steamId: user.steamId,
        username: user.username,
        avatarUrl: user.avatarUrl,
        xp: user.xp,
        balance: user.balance,
        role: user.role,
        mutedUntil: user.mutedUntil,
        steamTradeUrl: user.steamTradeUrl,
        hashedServerSeed: user.hashedServerSeed,
        clientSeed: user.clientSeed,
        nonce: user.nonce,
      });
    });

    it('should return 401 when not logged in', async () => {
      await request(app.getHttpServer()).get('/user').expect(401);
    });
  });

  describe('GET /user/:id', () => {
    it('should return the user by id', async () => {
      const user = await userFactory.create();

      const response = await request(app.getHttpServer())
        .get(`/user/${user.id}`)
        .set('Cookie', createCookie(user.session!.id))
        .expect(200);

      expect(response.body.user).toBeDefined();
      expect(response.body.user).toEqual({
        id: user.id,
        steamId: user.steamId,
        username: user.username,
        avatarUrl: user.avatarUrl,
        xp: user.xp,
        role: user.role,
        steamTradeUrl: user.steamTradeUrl,
      });
    });

    it('should return 404 if user is not found', async () => {
      const user = await userFactory.create();

      await request(app.getHttpServer())
        .get(`/user/${faker.string.uuid()}`)
        .set('Cookie', createCookie(user.session!.id))
        .expect(404);
    });
  });

  describe('POST /user/steam-trade-url', () => {
    it('should set the steam trade url', async () => {
      const partner = faker.number.int({ min: 0, max: 1000000000 });
      const steamId = (STEAM_ID_BASE + BigInt(partner)).toString();

      const user = await userFactory.create({
        steamId,
      });

      const steamTradeUrl = `https://steamcommunity.com/tradeoffer/new/?partner=${partner}&token=${faker.string.alphanumeric(8)}`;

      const response = await request(app.getHttpServer())
        .post('/user/steam-trade-url')
        .set('Cookie', createCookie(user.session!.id))
        .send({
          steamTradeUrl,
        })
        .expect(201);

      expect(response.body.user).toBeDefined();
      expect(response.body.user).toEqual({
        id: user.id,
        steamId: user.steamId,
        username: user.username,
        avatarUrl: user.avatarUrl,
        xp: user.xp,
        balance: user.balance,
        role: user.role,
        mutedUntil: user.mutedUntil,
        steamTradeUrl,
        hashedServerSeed: user.hashedServerSeed,
        clientSeed: user.clientSeed,
        nonce: user.nonce,
      });
    });

    it('should return 400 if steam trade url does not belong to user', async () => {
      const user = await userFactory.create();

      const otherPartner = faker.number.int({ min: 0, max: 1000000000 });
      const steamTradeUrl = `https://steamcommunity.com/tradeoffer/new/?partner=${otherPartner}&token=${faker.string.alphanumeric(8)}`;

      await request(app.getHttpServer())
        .post('/user/steam-trade-url')
        .set('Cookie', createCookie(user.session!.id))
        .send({ steamTradeUrl })
        .expect(400);
    });

    it('should return 401 when not logged in', async () => {
      await request(app.getHttpServer())
        .post('/user/steam-trade-url')
        .send({
          steamTradeUrl:
            'https://steamcommunity.com/tradeoffer/new/?partner=1&token=abc',
        })
        .expect(401);
    });
  });

  describe('POST /user/server-seed/rotate', () => {
    it('should rotate the server seed', async () => {
      const user = await userFactory.create();

      const response = await request(app.getHttpServer())
        .post('/user/server-seed/rotate')
        .set('Cookie', createCookie(user.session!.id))
        .expect(201);

      expect(response.body.user).toBeDefined();
      expect(response.body.user).toEqual({
        id: user.id,
        steamId: user.steamId,
        username: user.username,
        avatarUrl: user.avatarUrl,
        xp: user.xp,
        balance: user.balance,
        role: user.role,
        mutedUntil: user.mutedUntil,
        steamTradeUrl: user.steamTradeUrl,
        hashedServerSeed: response.body.user.hashedServerSeed,
        clientSeed: user.clientSeed,
        nonce: user.nonce,
      });
    });

    it('should return 401 when not logged in', async () => {
      await request(app.getHttpServer())
        .post('/user/server-seed/rotate')
        .expect(401);
    });
  });

  describe('PUT /user/client-seed', () => {
    it('should set the client seed', async () => {
      const user = await userFactory.create();

      const clientSeed = faker.string.alphanumeric(32);

      const response = await request(app.getHttpServer())
        .put('/user/client-seed')
        .set('Cookie', createCookie(user.session!.id))
        .send({
          clientSeed,
        })
        .expect(200);

      expect(response.body.user).toBeDefined();
      expect(response.body.user).toEqual({
        id: user.id,
        steamId: user.steamId,
        username: user.username,
        avatarUrl: user.avatarUrl,
        xp: user.xp,
        balance: user.balance,
        role: user.role,
        mutedUntil: user.mutedUntil,
        steamTradeUrl: user.steamTradeUrl,
        hashedServerSeed: user.hashedServerSeed,
        clientSeed,
        nonce: user.nonce,
      });
    });

    it('should return 401 when not logged in', async () => {
      await request(app.getHttpServer())
        .put('/user/client-seed')
        .send({ clientSeed: faker.string.alphanumeric(32) })
        .expect(401);
    });
  });
});
