import { ErrorLoggerFilter } from '../../../../test/error-logger.filter';
import { createCrateItemFactory } from '../../../../test/factories/crate-item.factory';
import { createCrateFactory } from '../../../../test/factories/crate.factory';
import { createItemFactory } from '../../../../test/factories/item.factory';
import { createUserFactory } from '../../../../test/factories/user.factory';
import { clearDatabase, createCookie } from '../../../../test/helpers';
import type { Database } from '../../../database';
import { users } from '../../../database/schema';
import { AppModule } from '../../app/app.module';
import { DATABASE_PROVIDER } from '../../database/database.provider';
import { MAX_CRATE_OPEN_COUNT } from '../consts';
import { faker } from '@faker-js/faker';
import fastifyCookie from '@fastify/cookie';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { eq } from 'drizzle-orm';
import request from 'supertest';

describe('CrateController (e2e)', () => {
  let app: NestFastifyApplication;
  let db: Database;
  let userFactory: ReturnType<typeof createUserFactory>;
  let crateFactory: ReturnType<typeof createCrateFactory>;
  let itemFactory: ReturnType<typeof createItemFactory>;
  let crateItemFactory: ReturnType<typeof createCrateItemFactory>;

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
    crateFactory = createCrateFactory(db);
    itemFactory = createItemFactory(db);
    crateItemFactory = createCrateItemFactory(db);
  });

  afterAll(async () => {
    await app.close();
    await clearDatabase(db);
    await db.$client.end();
  });

  describe('GET /crates', () => {
    it('should return a list of crates', async () => {
      const crate = await crateFactory.create();

      const response = await request(app.getHttpServer())
        .get('/crates')
        .expect(200);

      expect(response.body.crates).toContainEqual({
        id: crate.id,
        name: crate.name,
        imageUrl: crate.imageUrl,
        cost: crate.cost,
      });
    });

    it('should return crates without being logged in', async () => {
      const response = await request(app.getHttpServer())
        .get('/crates')
        .expect(200);

      expect(response.body.crates).toBeDefined();
    });
  });

  describe('GET /crates/:id', () => {
    it('should return a crate with its items', async () => {
      const crate = await crateFactory.create();
      const item = await itemFactory.create();
      const crateItem = await crateItemFactory.create({
        crateId: crate.id,
        itemId: item.id,
      });

      const response = await request(app.getHttpServer())
        .get(`/crates/${crate.id}`)
        .expect(200);

      expect(response.body.crate).toEqual({
        id: crate.id,
        name: crate.name,
        imageUrl: crate.imageUrl,
        cost: crate.cost,
      });
      expect(response.body.crateItems).toHaveLength(1);
      expect(response.body.crateItems).toContainEqual({
        id: crateItem.id,
        crateId: crate.id,
        itemId: item.id,
        value: crateItem.value,
        chance: crateItem.chance,
      });
    });

    it('should return crate without being logged in', async () => {
      const crate = await crateFactory.create();

      const response = await request(app.getHttpServer())
        .get(`/crates/${crate.id}`)
        .expect(200);

      expect(response.body.crate).toBeDefined();
    });

    it('should return 404 for a non-existent crate', async () => {
      await request(app.getHttpServer())
        .get(`/crates/${faker.string.uuid()}`)
        .expect(404);
    });
  });

  describe('POST /crates/:id/open', () => {
    it('should open a crate, return the won item, deduct cost, add item value, and increment nonce', async () => {
      const cost = 1000;
      const itemValue = 500;
      const initialBalance = 10000;

      const user = await userFactory.create({
        balance: initialBalance,
        nonce: 0,
      });
      const crate = await crateFactory.create({ cost });
      const item = await itemFactory.create();
      const crateItem = await crateItemFactory.create({
        crateId: crate.id,
        itemId: item.id,
        value: itemValue,
        chance: 10000,
      });

      const response = await request(app.getHttpServer())
        .post(`/crates/${crate.id}/open`)
        .set('Cookie', createCookie(user.session!.id))
        .send({ count: 1 })
        .expect(201);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0]).toEqual({
        id: crateItem.id,
        crateId: crate.id,
        itemId: item.id,
        value: itemValue,
        chance: 10000,
      });

      const [userObject] = await db
        .select()
        .from(users)
        .where(eq(users.id, user.id));

      const expectedBalance = initialBalance - cost + itemValue;
      const expectedXp = user.xp + cost;
      expect(userObject.balance).toBe(expectedBalance);
      expect(userObject.xp).toBe(expectedXp);
      expect(userObject.nonce).toBe(1);
    });

    it('should open multiple crates, return all won items, deduct total cost, and increment nonce by count', async () => {
      const count = 3;
      const cost = 1000;
      const itemValue = 500;
      const initialBalance = 10000;

      const user = await userFactory.create({
        balance: initialBalance,
        nonce: 0,
      });
      const crate = await crateFactory.create({ cost });
      const item = await itemFactory.create();
      const crateItem = await crateItemFactory.create({
        crateId: crate.id,
        itemId: item.id,
        value: itemValue,
        chance: 10000,
      });

      const response = await request(app.getHttpServer())
        .post(`/crates/${crate.id}/open`)
        .set('Cookie', createCookie(user.session!.id))
        .send({ count })
        .expect(201);

      expect(response.body.items).toHaveLength(count);
      for (const wonItem of response.body.items) {
        expect(wonItem).toEqual({
          id: crateItem.id,
          crateId: crate.id,
          itemId: item.id,
          value: itemValue,
          chance: 10000,
        });
      }

      const [userObject] = await db
        .select()
        .from(users)
        .where(eq(users.id, user.id));

      const expectedBalance = initialBalance - cost * count + itemValue * count;
      const expectedXp = user.xp + cost * count;
      expect(userObject.balance).toBe(expectedBalance);
      expect(userObject.xp).toBe(expectedXp);
      expect(userObject.nonce).toBe(count);
    });

    it('should return 400 when count exceeds max crate open count', async () => {
      const user = await userFactory.create({ balance: 100000 });
      const crate = await crateFactory.create({ cost: 1000 });
      const item = await itemFactory.create();
      await crateItemFactory.create({
        crateId: crate.id,
        itemId: item.id,
        chance: 10000,
      });

      await request(app.getHttpServer())
        .post(`/crates/${crate.id}/open`)
        .set('Cookie', createCookie(user.session!.id))
        .send({ count: MAX_CRATE_OPEN_COUNT + 1 })
        .expect(400);
    });

    it('should return 401 when not logged in', async () => {
      const crate = await crateFactory.create();

      await request(app.getHttpServer())
        .post(`/crates/${crate.id}/open`)
        .expect(401);
    });

    it('should return 404 for a non-existent crate', async () => {
      const user = await userFactory.create();

      await request(app.getHttpServer())
        .post(`/crates/${faker.string.uuid()}/open`)
        .set('Cookie', createCookie(user.session!.id))
        .send({ count: 1 })
        .expect(404);
    });

    it('should return 400 when the crate has no items', async () => {
      const user = await userFactory.create({ balance: 10000 });
      const crate = await crateFactory.create({ cost: 1000 });

      await request(app.getHttpServer())
        .post(`/crates/${crate.id}/open`)
        .set('Cookie', createCookie(user.session!.id))
        .send({ count: 1 })
        .expect(400);
    });

    it('should return 500 when crate item chances do not add up to 10000', async () => {
      const user = await userFactory.create({ balance: 10000 });
      const crate = await crateFactory.create({ cost: 1000 });
      const item = await itemFactory.create();
      await crateItemFactory.create({
        crateId: crate.id,
        itemId: item.id,
        chance: 5000,
      });

      await request(app.getHttpServer())
        .post(`/crates/${crate.id}/open`)
        .set('Cookie', createCookie(user.session!.id))
        .send({ count: 1 })
        .expect(500);
    });

    it('should return 400 when the user has insufficient balance', async () => {
      const user = await userFactory.create({ balance: 500 });
      const crate = await crateFactory.create({ cost: 1000 });
      const item = await itemFactory.create();
      await crateItemFactory.create({
        crateId: crate.id,
        itemId: item.id,
        chance: 10000,
      });

      await request(app.getHttpServer())
        .post(`/crates/${crate.id}/open`)
        .set('Cookie', createCookie(user.session!.id))
        .send({ count: 1 })
        .expect(400);
    });
  });
});
