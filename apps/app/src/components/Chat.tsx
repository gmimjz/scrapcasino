"use client";

import { ChatMessageResponse, Role, UserResponse } from "../client/api";
import { useChatMessageContext } from "../hooks/useChatMessageContext";
import { useMuteUser } from "../mutations/useMuteUser";
import { useRemoveChatMessage } from "../mutations/useRemoveChatMessage";
import { useSendMessage } from "../mutations/useSendMessage";
import { useUnmuteUser } from "../mutations/useUnmuteUser";
import { useMessages } from "../queries/useMessages";
import { USER_QUERY_KEY, useUser } from "../queries/useUser";
import { useChatStore } from "../store/chatStore";
import { useUsersStore } from "../store/usersStore";
import { Color } from "../utils/enums";
import {
  formatTimestamp,
  getBlockedUsers,
  saveBlockedUsers,
} from "../utils/functions";
import { Button } from "./Button";
import { ChatMessage } from "./ChatMessage";
import { Context } from "./Context";
import { Input } from "./Input";
import { Item } from "./Item";
import { useQueryClient } from "@tanstack/react-query";
import ms, { StringValue } from "ms";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FaComments } from "react-icons/fa";
import { io } from "socket.io-client";
import { twMerge } from "tailwind-merge";

export const Chat = () => {
  const [currentTimestamp, setCurrentTimestamp] = useState(() => +Date.now());
  const [message, setMessage] = useState("");
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const [muteDuration, setMuteDuration] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const user = useUser();
  const queryClient = useQueryClient();
  const {
    context,
    contextRef,
    contextChatMessage,
    contextUser,
    handleRightClick,
  } = useChatMessageContext();

  const {
    isOpen,
    isOpenOnMobile,
    chatMessages,
    setIsOpen,
    setChatMessages,
    addChatMessage,
    updateChatMessage,
  } = useChatStore();
  const { users, setUsers, addUser } = useUsersStore();

  const [blockedUsers, setBlockedUsers] = useState<Set<string>>(() =>
    getBlockedUsers(),
  );

  const { mutate: muteUser } = useMuteUser();
  const { mutate: unmuteUser } = useUnmuteUser();
  const { mutate: removeChatMessage } = useRemoveChatMessage();
  const { mutate: sendMessage } = useSendMessage();
  const messages = useMessages();

  useEffect(() => {
    setInterval(() => {
      setCurrentTimestamp(+Date.now());
    }, 1000);
  }, []);

  useEffect(() => {
    if (!messages) return;

    const chatMessagesWithBlocked = messages.chatMessages.map(
      (chatMessage) => ({
        ...chatMessage,
        isBlocked: blockedUsers.has(chatMessage.userId),
      }),
    );

    chatMessagesWithBlocked.reverse();
    setChatMessages(chatMessagesWithBlocked);
    setUsers(messages.users);
  }, [messages, setChatMessages, setUsers, blockedUsers]);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL, {
      withCredentials: true,
      transports: ["websocket"],
    });

    const newMessageListener = ({
      chatMessage,
      user,
    }: {
      chatMessage: ChatMessageResponse;
      user: UserResponse;
    }) => {
      if (!blockedUsers.has(chatMessage.userId)) {
        addChatMessage({ ...chatMessage, isBlocked: false });
      }

      addUser(user);
    };
    socket.on("chat:message:created", newMessageListener);

    const messageRemovedListener = ({
      chatMessage,
    }: {
      chatMessage: ChatMessageResponse;
    }) => {
      updateChatMessage(chatMessage.id, { isRemoved: true });
    };
    socket.on("chat:message:deleted", messageRemovedListener);

    const muteListener = ({ mutedUntil }: { mutedUntil: string }) => {
      queryClient.setQueryData<UserResponse | null>(USER_QUERY_KEY, (old) =>
        old ? { ...old, mutedUntil } : old,
      );
    };
    socket.on("chat:user:muted", muteListener);

    const unmuteListener = () => {
      queryClient.setQueryData<UserResponse | null>(USER_QUERY_KEY, (old) =>
        old ? { ...old, mutedUntil: null } : old,
      );
    };
    socket.on("chat:user:unmuted", unmuteListener);

    return () => {
      socket.off("chat:message:created", newMessageListener);
      socket.off("chat:message:deleted", messageRemovedListener);
      socket.off("chat:user:muted", muteListener);
      socket.off("chat:user:unmuted", unmuteListener);
    };
  }, [addChatMessage, addUser, updateChatMessage, queryClient, blockedUsers]);

  const handleSendMessage = useCallback(async () => {
    if (!user || message === "") {
      return;
    }

    sendMessage(message);
    setMessage("");
  }, [user, message, sendMessage, setMessage]);

  const handleRemoveChatMessage = async () => {
    if (contextChatMessage) {
      removeChatMessage(contextChatMessage.id);
    }
  };

  const handleMute = async () => {
    if (contextChatMessage) {
      muteUser({
        userId: contextChatMessage.userId,
        duration: muteDurationInSeconds,
      });

      setMuteDuration("");
    }
  };

  const handleUnmute = async () => {
    if (contextChatMessage) {
      unmuteUser(contextChatMessage.userId);
    }
  };

  const handleBlock = () => {
    if (contextChatMessage) {
      blockedUsers.add(contextChatMessage.userId);
      saveBlockedUsers(blockedUsers);
      setBlockedUsers(blockedUsers);

      chatMessages.forEach((chatMessage) => {
        if (chatMessage.userId === contextChatMessage.userId) {
          updateChatMessage(chatMessage.id, { isBlocked: true });
        }
      });
    }
  };

  const handleUnblock = () => {
    if (contextChatMessage) {
      blockedUsers.delete(contextChatMessage.userId);
      saveBlockedUsers(blockedUsers);
      setBlockedUsers(blockedUsers);

      chatMessages.forEach((chatMessage) => {
        if (chatMessage.userId === contextChatMessage.userId) {
          updateChatMessage(chatMessage.id, { isBlocked: false });
        }
      });
    }
  };

  useLayoutEffect(() => {
    const listner = () => {
      if (
        containerRef.current &&
        containerRef.current.scrollTop + containerRef.current.clientHeight >=
          containerRef.current.scrollHeight
      ) {
        setIsScrolledToBottom(true);
      } else {
        setIsScrolledToBottom(false);
      }
    };

    containerRef.current?.addEventListener("scroll", listner);

    const container = containerRef.current;
    return () => container?.removeEventListener("scroll", listner);
  }, []);

  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [containerRef]);

  useEffect(() => {
    if (containerRef.current && isScrolledToBottom) {
      scrollToBottom();
    }
  }, [containerRef, isScrolledToBottom, scrollToBottom, chatMessages]);

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (
        event.key === "Enter" &&
        document.activeElement === inputRef.current
      ) {
        handleSendMessage();
        scrollToBottom();
      }
    };

    document.addEventListener("keypress", listener);
    return () => document.removeEventListener("keypress", listener);
  }, [inputRef, handleSendMessage, scrollToBottom]);

  const muteDurationInSeconds = useMemo(() => {
    return muteDuration !== "" ? ms(muteDuration as StringValue) / 1000 : 0;
  }, [muteDuration]);

  const { isMuteDurationValid, muteDurationError } = useMemo(() => {
    if (muteDuration === "") {
      return {
        isMuteDurationValid: false,
        muteDurationError: "Enter duration",
      };
    }

    if (ms(muteDuration as StringValue) === undefined) {
      return {
        isMuteDurationValid: false,
        muteDurationError: "Invalid duration",
      };
    }

    return { isMuteDurationValid: true, muteDurationError: null };
  }, [muteDuration]);

  const { isInputDisabled, inputPlaceholder } = useMemo(() => {
    if (!user) {
      return { isInputDisabled: true, inputPlaceholder: "Log in to chat" };
    }

    if (user.mutedUntil && currentTimestamp <= +new Date(user.mutedUntil)) {
      return {
        isInputDisabled: true,
        inputPlaceholder: `Muted until ${formatTimestamp(+new Date(user.mutedUntil))}`,
      };
    }

    return {
      isInputDisabled: false,
      inputPlaceholder: "Enter message here...",
    };
  }, [user, currentTimestamp]);

  const inputValue = isInputDisabled ? "" : message;

  return (
    <>
      <div
        className={twMerge(
          "fixed top-[72px] z-20 flex h-[calc(100vh-132px)] w-full -translate-x-full flex-col overflow-hidden bg-black transition-transform duration-250 lg:h-[calc(100vh-72px)] lg:w-[320px]",
          isOpen && "lg:translate-x-0",
          isOpenOnMobile && "translate-x-0",
        )}
      >
        <div className="flex h-full flex-col bg-white/5">
          <div className="pointer-events-none fixed h-[200px] w-full bg-linear-to-b from-black to-transparent lg:w-[320px]"></div>
          {!isScrolledToBottom && (
            <button
              className="bg-red absolute right-[8px] bottom-[48px] left-0 z-10 h-8 cursor-pointer text-xs font-semibold text-white"
              onClick={() => scrollToBottom()}
            >
              Scroll to bottom
            </button>
          )}
          <div
            className="scrollbar-thin flex h-full flex-col overflow-y-auto"
            ref={containerRef}
          >
            {chatMessages.map(
              ({ id, userId, message, isRemoved, isBlocked }) => (
                <ChatMessage
                  key={id}
                  id={id}
                  user={users.find((user) => user.id === userId)}
                  message={message}
                  onContextMenu={(e, id) => handleRightClick(e, id)}
                  isRemoved={isRemoved || isBlocked}
                />
              ),
            )}
          </div>
          <div className="flex gap-2 p-2">
            <Input
              value={inputValue}
              placeholder={inputPlaceholder}
              disabled={isInputDisabled}
              onChange={(value) => setMessage(value)}
              ref={inputRef}
            />
            <Button color={Color.Blue} onClick={() => handleSendMessage()}>
              SEND
            </Button>
          </div>
        </div>
      </div>

      <div
        className={twMerge(
          "fixed bottom-[16px] left-[336px] hidden -translate-x-[320px] transition-transform duration-250 lg:block",
          isOpen && "lg:translate-x-0",
          isOpenOnMobile && "translate-x-0",
        )}
      >
        <Button
          icon={<FaComments size={16} />}
          color={Color.Blue}
          onClick={() => setIsOpen(!isOpen)}
        />
      </div>

      <Context
        x={context.x}
        y={context.y}
        visible={context.visible}
        ref={contextRef}
      >
        <div className="w-[256px]">
          <Item onClick={() => {}} isHighlighted>
            PROFILE
          </Item>
          {user?.steamId !== contextChatMessage?.userId && (
            <Item
              onClick={() =>
                blockedUsers.has(contextChatMessage?.userId ?? "")
                  ? handleUnblock()
                  : handleBlock()
              }
              isHighlighted
            >
              {blockedUsers.has(contextChatMessage?.userId ?? "")
                ? "UNBLOCK"
                : "BLOCK"}
            </Item>
          )}
          {user?.role !== Role.User &&
            contextChatMessage &&
            !contextChatMessage?.isRemoved && (
              <Item onClick={() => handleRemoveChatMessage()} isHighlighted>
                REMOVE
              </Item>
            )}
          {user?.role !== Role.User && (
            <div className="mt-2">
              {!contextUser?.mutedUntil ||
              currentTimestamp >= +new Date(contextUser.mutedUntil) ? (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Input
                      value={muteDuration}
                      type="text"
                      onChange={(value) => setMuteDuration(value)}
                      placeholder="15 min, 2h, 3days, etc."
                    />
                    <Button color={Color.Blue} onClick={() => handleMute()}>
                      MUTE
                    </Button>
                  </div>
                  <p className="text-xs text-white">
                    {isMuteDurationValid ? (
                      <>
                        Mute until:{" "}
                        {formatTimestamp(
                          currentTimestamp + muteDurationInSeconds * 1000,
                        )}
                      </>
                    ) : (
                      <>{muteDurationError}</>
                    )}
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Button color={Color.Blue} onClick={() => handleUnmute()}>
                        UNMUTE
                      </Button>
                    </div>
                    <p className="text-xs text-white">
                      Muted until:{" "}
                      {formatTimestamp(
                        +(new Date(contextUser?.mutedUntil) ?? 0),
                      )}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </Context>
    </>
  );
};
