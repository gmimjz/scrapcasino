import { CHAT_MESSAGES_QUERY_LIMIT } from "../utils/consts";
import { ChatMessageWithBlocked } from "../utils/types";
import { create } from "zustand";

interface ChatState {
  isOpen: boolean;
  isOpenOnMobile: boolean;
  chatMessages: ChatMessageWithBlocked[];
  setIsOpen: (isOpen: boolean) => void;
  setIsOpenOnMobile: (isOpenOnMobile: boolean) => void;
  setChatMessages: (chatMessages: ChatMessageWithBlocked[]) => void;
  addChatMessage: (chatMessage: ChatMessageWithBlocked) => void;
  updateChatMessage: (
    id: string,
    chatMessage: Partial<ChatMessageWithBlocked>,
  ) => void;
}

export const useChatStore = create<ChatState>()((set) => ({
  isOpen: true,
  isOpenOnMobile: false,
  chatMessages: [],
  setIsOpen: (isOpen) => set((state) => ({ ...state, isOpen })),
  setIsOpenOnMobile: (isOpenOnMobile) =>
    set((state) => ({ ...state, isOpenOnMobile })),
  setChatMessages: (chatMessages) =>
    set((state) => ({ ...state, chatMessages })),
  addChatMessage: (chatMessage) =>
    set((state) => {
      const chatMessages = state.chatMessages;

      if (chatMessages.length >= CHAT_MESSAGES_QUERY_LIMIT) {
        chatMessages.shift();
      }

      return { ...state, chatMessages: [...chatMessages, chatMessage] };
    }),
  updateChatMessage: (id, updatedChatMessage) =>
    set((state) => {
      const chatMessages = state.chatMessages;
      const newChatMessages = chatMessages.map((chatMessage) => {
        if (chatMessage.id === id) {
          return { ...chatMessage, ...updatedChatMessage };
        }

        return chatMessage;
      });

      return { ...state, chatMessages: newChatMessages };
    }),
}));
