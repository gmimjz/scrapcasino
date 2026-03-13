import { Database } from '../../src/database';
import { MAX_MESSAGE_LENGTH } from '../../src/database/consts';
import { chatMessages } from '../../src/database/schema';
import { ChatMessage } from '../../src/database/types';
import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

export const createChatMessageFactory = (db: Database) => {
  return Factory.define<ChatMessage>(({ onCreate }) => {
    onCreate(async (chatMessage) => {
      const [insertedChatMessage] = await db
        .insert(chatMessages)
        .values(chatMessage)
        .returning();

      return insertedChatMessage;
    });

    return {
      id: faker.string.uuid(),
      userId: faker.string.uuid(),
      message: faker.lorem.sentence().slice(0, MAX_MESSAGE_LENGTH),
      isRemoved: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });
};
