import { ErrorLoggerFilter } from '../../../../test/error-logger.filter';
import { createChatMessageFactory } from '../../../../test/factories/chat-message.factory';
import { createUserFactory } from '../../../../test/factories/user.factory';
import { clearDatabase, createCookie } from '../../../../test/helpers';
import type { Database } from '../../../database';
import { Role } from '../../../database/types';
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

describe('ChatController (e2e)', () => {
  let app: NestFastifyApplication;
  let db: Database;
  let userFactory: ReturnType<typeof createUserFactory>;
  let chatMessageFactory: ReturnType<typeof createChatMessageFactory>;

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
    chatMessageFactory = createChatMessageFactory(db);
  });

  afterAll(async () => {
    await app.close();
    await clearDatabase(db);
    await db.$client.end();
  });

  describe('GET /chat/messages', () => {
    it('should return chat messages', async () => {
      const user = await userFactory.create();
      const chatMessage = await chatMessageFactory.create({
        userId: user.id,
      });

      const response = await request(app.getHttpServer())
        .get('/chat/messages')
        .set('Cookie', createCookie(user.session!.id))
        .expect(200);

      expect(response.body.chatMessages).toBeDefined();
      expect(response.body.chatMessages).toHaveLength(1);
      expect(response.body.chatMessages).toContainEqual({
        id: chatMessage.id,
        userId: chatMessage.userId,
        message: chatMessage.message,
        isRemoved: false,
      });
      expect(response.body.users).toBeDefined();
      expect(response.body.users).toHaveLength(1);
      expect(response.body.users).toContainEqual({
        id: user.id,
        steamId: user.steamId,
        username: user.username,
        avatarUrl: user.avatarUrl,
        xp: user.xp,
        role: user.role,
        steamTradeUrl: user.steamTradeUrl,
      });
    });

    it('should return full user info when requester is a mod', async () => {
      const user = await userFactory.create({ role: Role.Mod });
      await chatMessageFactory.create({ userId: user.id });

      const response = await request(app.getHttpServer())
        .get('/chat/messages')
        .set('Cookie', createCookie(user.session!.id))
        .expect(200);

      expect(response.body.users).toContainEqual({
        id: user.id,
        steamId: user.steamId,
        username: user.username,
        avatarUrl: user.avatarUrl,
        xp: user.xp,
        balance: user.balance,
        role: user.role,
        mutedUntil: null,
        steamTradeUrl: user.steamTradeUrl,
        hashedServerSeed: user.hashedServerSeed,
        clientSeed: user.clientSeed,
        nonce: user.nonce,
      });
    });

    it('should return chat messages without being logged in', async () => {
      const response = await request(app.getHttpServer())
        .get('/chat/messages')
        .expect(200);

      expect(response.body.chatMessages).toBeDefined();
      expect(response.body.users).toBeDefined();
    });
  });

  describe('POST /chat/message', () => {
    it('should send a message', async () => {
      const user = await userFactory.create();
      const message = faker.lorem.sentence();

      const response = await request(app.getHttpServer())
        .post('/chat/message')
        .set('Cookie', createCookie(user.session!.id))
        .send({ message })
        .expect(201);

      expect(response.body.chatMessage).toBeDefined();
      expect(response.body.chatMessage).toEqual({
        id: response.body.chatMessage.id,
        userId: user.id,
        message,
        isRemoved: false,
      });
    });

    it('should return 401 when not logged in', async () => {
      await request(app.getHttpServer())
        .post('/chat/message')
        .send({ message: faker.lorem.sentence() })
        .expect(401);
    });

    it('should return 403 if the user is muted', async () => {
      const user = await userFactory.create({
        mutedUntil: new Date(Date.now() + 60 * 1000),
      });

      await request(app.getHttpServer())
        .post('/chat/message')
        .set('Cookie', createCookie(user.session!.id))
        .send({ message: faker.lorem.sentence() })
        .expect(403);
    });
  });

  describe('DELETE /chat/message/:id', () => {
    it('should delete a message', async () => {
      const user = await userFactory.create({ role: Role.Mod });
      const chatMessage = await chatMessageFactory.create({
        userId: user.id,
      });

      const response = await request(app.getHttpServer())
        .delete(`/chat/message/${chatMessage.id}`)
        .set('Cookie', createCookie(user.session!.id))
        .expect(200);

      expect(response.body.chatMessage).toBeDefined();
      expect(response.body.chatMessage).toEqual({
        id: chatMessage.id,
        userId: user.id,
        message: chatMessage.message,
        isRemoved: true,
      });
    });

    it('should return 401 when not logged in', async () => {
      const user = await userFactory.create();
      const chatMessage = await chatMessageFactory.create({ userId: user.id });

      await request(app.getHttpServer())
        .delete(`/chat/message/${chatMessage.id}`)
        .expect(401);
    });

    it('should return 403 for a user without required role', async () => {
      const user = await userFactory.create();
      const chatMessage = await chatMessageFactory.create({ userId: user.id });

      await request(app.getHttpServer())
        .delete(`/chat/message/${chatMessage.id}`)
        .set('Cookie', createCookie(user.session!.id))
        .expect(403);
    });

    it('should return 404 for a non-existent message', async () => {
      const user = await userFactory.create({ role: Role.Mod });

      await request(app.getHttpServer())
        .delete(`/chat/message/${faker.string.uuid()}`)
        .set('Cookie', createCookie(user.session!.id))
        .expect(404);
    });
  });

  describe('POST /chat/mute/:userId', () => {
    it('should mute a user', async () => {
      const user = await userFactory.create({ role: Role.Mod });
      const targetUser = await userFactory.create();

      const timestamp = +new Date();
      const duration = 60;
      const response = await request(app.getHttpServer())
        .post(`/chat/mute/${targetUser.id}`)
        .set('Cookie', createCookie(user.session!.id))
        .send({ duration })
        .expect(201);

      expect(response.body.user).toBeDefined();
      expect(response.body.user).toEqual({
        id: targetUser.id,
        steamId: targetUser.steamId,
        username: targetUser.username,
        avatarUrl: targetUser.avatarUrl,
        xp: targetUser.xp,
        balance: targetUser.balance,
        role: targetUser.role,
        mutedUntil: expect.any(String),
        steamTradeUrl: targetUser.steamTradeUrl,
        hashedServerSeed: targetUser.hashedServerSeed,
        clientSeed: targetUser.clientSeed,
        nonce: targetUser.nonce,
      });
      expect(
        +new Date(response.body.user.mutedUntil as string),
      ).toBeGreaterThan(+new Date(timestamp + duration * 1000));
    });

    it('should return 401 when not logged in', async () => {
      const targetUser = await userFactory.create();

      await request(app.getHttpServer())
        .post(`/chat/mute/${targetUser.id}`)
        .send({ duration: 60 })
        .expect(401);
    });

    it('should return 403 for a user without required role', async () => {
      const user = await userFactory.create();
      const targetUser = await userFactory.create();

      await request(app.getHttpServer())
        .post(`/chat/mute/${targetUser.id}`)
        .set('Cookie', createCookie(user.session!.id))
        .send({ duration: 60 })
        .expect(403);
    });
  });

  describe('POST /chat/unmute/:userId', () => {
    it('should unmute a user', async () => {
      const user = await userFactory.create({ role: Role.Mod });
      const targetUser = await userFactory.create({
        mutedUntil: new Date(Date.now() + 60 * 1000),
      });

      const response = await request(app.getHttpServer())
        .post(`/chat/unmute/${targetUser.id}`)
        .set('Cookie', createCookie(user.session!.id))
        .expect(201);

      expect(response.body.user).toBeDefined();
      expect(response.body.user).toEqual({
        id: targetUser.id,
        steamId: targetUser.steamId,
        username: targetUser.username,
        avatarUrl: targetUser.avatarUrl,
        xp: targetUser.xp,
        balance: targetUser.balance,
        role: targetUser.role,
        mutedUntil: null,
        steamTradeUrl: targetUser.steamTradeUrl,
        hashedServerSeed: targetUser.hashedServerSeed,
        clientSeed: targetUser.clientSeed,
        nonce: targetUser.nonce,
      });
    });

    it('should return 401 when not logged in', async () => {
      const targetUser = await userFactory.create({
        mutedUntil: new Date(Date.now() + 60 * 1000),
      });

      await request(app.getHttpServer())
        .post(`/chat/unmute/${targetUser.id}`)
        .expect(401);
    });

    it('should return 403 for a user without required role', async () => {
      const user = await userFactory.create();
      const targetUser = await userFactory.create({
        mutedUntil: new Date(Date.now() + 60 * 1000),
      });

      await request(app.getHttpServer())
        .post(`/chat/unmute/${targetUser.id}`)
        .set('Cookie', createCookie(user.session!.id))
        .expect(403);
    });
  });
});
