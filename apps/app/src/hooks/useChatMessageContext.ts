import { useChatStore } from "../store/chatStore";
import { useUsersStore } from "../store/usersStore";
import { useEffect, useMemo, useRef, useState } from "react";

export const useChatMessageContext = () => {
  const { users } = useUsersStore();
  const { chatMessages } = useChatStore();

  const [context, setContext] = useState<{
    visible: boolean;
    x: number;
    y: number;
    chatMessageId: string | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    chatMessageId: null,
  });
  const contextRef = useRef<HTMLDivElement>(null);

  const handleRightClick = (e: React.MouseEvent, id: string) => {
    setContext({
      visible: true,
      x: e.pageX + 1,
      y: e.pageY + 1,
      chatMessageId: id,
    });
  };

  useEffect(() => {
    const listener = (event: MouseEvent) => {
      const target = event.target as Node;
      if (contextRef.current && !contextRef.current.contains(target)) {
        setContext({
          visible: false,
          x: context.x,
          y: context.y,
          chatMessageId: context.chatMessageId,
        });
      }
    };

    document.addEventListener("mousedown", listener);

    return () => document.removeEventListener("mousedown", listener);
  }, [context]);

  const { chatMessage: contextChatMessage, user: contextUser } = useMemo(() => {
    const chatMessage = chatMessages.find(
      (chatMessage) => chatMessage.id === context.chatMessageId,
    );
    const user = users.find((user) => user.id === chatMessage?.userId);

    return { chatMessage, user };
  }, [chatMessages, context.chatMessageId, users]);

  return {
    context,
    contextRef,
    contextChatMessage,
    contextUser,
    handleRightClick,
  };
};
