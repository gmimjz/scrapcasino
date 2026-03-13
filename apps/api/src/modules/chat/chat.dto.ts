import { MAX_MESSAGE_LENGTH } from '../../database/consts';
import { ChatMessage } from '../../database/types';
import { PartialUserResponse, UserResponse } from '../user/user.dto';
import { Exclude } from 'class-transformer';
import { IsNumber, IsString, Length, Min } from 'class-validator';

export class MuteUserBody {
  @IsNumber()
  @Min(1)
  duration: number;
}

export class SendMessageBody {
  @IsString()
  @Length(1, MAX_MESSAGE_LENGTH)
  message: string;
}

export class ChatMessageResponse implements ChatMessage {
  id: string;
  userId: string;
  message: string;
  isRemoved: boolean;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  constructor(partial: Partial<ChatMessageResponse>) {
    Object.assign(this, partial);
  }
}

export class GetMessagesResponse {
  chatMessages: ChatMessageResponse[];
  users: PartialUserResponse[];
}

export class ChatMessageWrappedResponse {
  chatMessage: ChatMessageResponse;
}

export class UserWrappedResponse {
  user: UserResponse;
}
