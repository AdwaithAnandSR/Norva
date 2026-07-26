import { create } from "zustand";

export interface Message {
    _id: string;
    tempId?: string;
    conversation: string;
    sender: any;
    text: string;
    image?: string;
    isDeliveredTo?: string[];
    isReadBy?: string[];
    createdAt?: string;
    isTemp?: boolean;
    status?: "sending" | "sent" | "delivered" | "read" | "failed";
}

export interface Conversation {
    _id: string;
    participants: any[];
    isGroup?: boolean;
    lastMessage?: Message;
    updatedAt?: string;
    unreadCountForMe?: number;
    [key: string]: any;
}

export interface ChatState {
    conversations: Conversation[];
    messagesByConversation: Record<string, Message[]>;

    setConversations: (conversations: Conversation[]) => void;
    updateConversation: (conversation: Partial<Conversation> & { _id: string }) => void;

    hydrateConversationMessages: (conversationId: string, fetchedMessages: Message[]) => void;
    prependOlderMessages: (conversationId: string, olderMessages: Message[]) => void;

    addOptimisticMessage: (conversationId: string, tempMessage: Message) => void;
    replaceTempMessage: (conversationId: string, tempId: string, actualMessage: Message) => void;
    retryMessage: (conversationId: string, tempId: string) => void;
    markMessageFailed: (conversationId: string, tempId: string) => void;
    addIncomingMessage: (conversationId: string, message: Message, myId?: string) => void;

    markDelivered: (conversationId: string, deliveredTo: string) => void;
    markRead: (conversationId: string, readBy: string, myId?: string) => void;

    clearConversation: (conversationId: string) => void;
}

const getSenderId = (sender: any): string => {
    if (!sender) return "";
    if (typeof sender === "string") return sender;
    return sender._id || "";
};

const isIdInArray = (arr: any[] | undefined, targetId: string): boolean => {
    if (!arr || arr.length === 0) return false;
    for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        const id = typeof item === "string" ? item : item?._id;
        if (id === targetId) return true;
    }
    return false;
};

export const useChatStore = create<ChatState>((set) => ({
    conversations: [],
    messagesByConversation: {},

    setConversations: (conversations) =>
        set((state) => {
            const incoming = conversations || [];
            if (state.conversations.length === incoming.length) {
                let match = true;
                for (let i = 0; i < incoming.length; i++) {
                    const c1 = state.conversations[i];
                    const c2 = incoming[i];
                    if (
                        c1._id !== c2._id ||
                        c1.updatedAt !== c2.updatedAt ||
                        c1.unreadCountForMe !== c2.unreadCountForMe ||
                        c1.lastMessage?._id !== c2.lastMessage?._id
                    ) {
                        match = false;
                        break;
                    }
                }
                if (match) return state;
            }
            return { conversations: incoming };
        }),

    updateConversation: (convUpdate) =>
        set((state) => {
            let changed = false;
            const updated = state.conversations.map((c) => {
                if (c._id === convUpdate._id) {
                    changed = true;
                    return { ...c, ...convUpdate };
                }
                return c;
            });
            return changed ? { conversations: updated } : state;
        }),

    hydrateConversationMessages: (conversationId, fetchedMessages) =>
        set((state) => {
            const existing = state.messagesByConversation[conversationId] || [];
            const fetched = fetchedMessages || [];

            if (existing.length === 0) {
                return {
                    messagesByConversation: {
                        ...state.messagesByConversation,
                        [conversationId]: fetched
                    }
                };
            }

            const temps = existing.filter((m) => m.isTemp);
            const map = new Map<string, Message>();
            fetched.forEach((m) => {
                if (m._id) map.set(m._id, m);
            });
            existing.forEach((m) => {
                if (!m.isTemp && m._id && !map.has(m._id)) {
                    map.set(m._id, m);
                }
            });

            const mergedReal = Array.from(map.values()).sort((a, b) => {
                const timeA = new Date(a.createdAt || 0).getTime();
                const timeB = new Date(b.createdAt || 0).getTime();
                return timeB - timeA;
            });

            const newArr = temps.length > 0 ? [...temps, ...mergedReal] : mergedReal;

            if (newArr.length === existing.length) {
                let same = true;
                for (let i = 0; i < existing.length; i++) {
                    if (
                        newArr[i]._id !== existing[i]._id ||
                        newArr[i].status !== existing[i].status ||
                        newArr[i].isTemp !== existing[i].isTemp
                    ) {
                        same = false;
                        break;
                    }
                }
                if (same) return state;
            }

            return {
                messagesByConversation: {
                    ...state.messagesByConversation,
                    [conversationId]: newArr
                }
            };
        }),

    prependOlderMessages: (conversationId, olderMessages) =>
        set((state) => {
            const existing = state.messagesByConversation[conversationId] || [];
            const older = olderMessages || [];
            if (older.length === 0) return state;

            const existingIds = new Set<string>();
            for (let i = 0; i < existing.length; i++) {
                if (existing[i]._id) existingIds.add(existing[i]._id);
            }

            const uniqueOlder: Message[] = [];
            for (let i = 0; i < older.length; i++) {
                if (older[i]._id && !existingIds.has(older[i]._id)) {
                    uniqueOlder.push(older[i]);
                }
            }

            if (uniqueOlder.length === 0) return state;

            return {
                messagesByConversation: {
                    ...state.messagesByConversation,
                    [conversationId]: [...existing, ...uniqueOlder]
                }
            };
        }),

    addOptimisticMessage: (conversationId, tempMessage) =>
        set((state) => {
            const existing = state.messagesByConversation[conversationId] || [];
            const updatedMessages = [tempMessage, ...existing];

            const conversations = state.conversations;
            let targetConv: Conversation | null = null;
            let targetIdx = -1;

            for (let i = 0; i < conversations.length; i++) {
                if (conversations[i]._id === conversationId) {
                    targetIdx = i;
                    targetConv = {
                        ...conversations[i],
                        lastMessage: tempMessage,
                        updatedAt: tempMessage.createdAt || new Date().toISOString()
                    };
                    break;
                }
            }

            let newConvs: Conversation[];
            if (targetConv) {
                if (targetIdx === 0) {
                    newConvs = [targetConv, ...conversations.slice(1)];
                } else {
                    newConvs = [
                        targetConv,
                        ...conversations.slice(0, targetIdx),
                        ...conversations.slice(targetIdx + 1)
                    ];
                }
            } else {
                newConvs = conversations;
            }

            return {
                messagesByConversation: {
                    ...state.messagesByConversation,
                    [conversationId]: updatedMessages
                },
                conversations: newConvs
            };
        }),

    replaceTempMessage: (conversationId, tempId, actualMessage) =>
        set((state) => {
            const existing = state.messagesByConversation[conversationId] || [];
            let replaced = false;

            const updatedMessages = existing.map((m) => {
                if (m.tempId === tempId || m._id === tempId) {
                    replaced = true;
                    return {
                        ...actualMessage,
                        tempId: undefined,
                        isTemp: false,
                        status: actualMessage.status || "sent"
                    };
                }
                return m;
            });

            if (!replaced) {
                const alreadyHasActual = existing.some((m) => m._id === actualMessage._id);
                if (!alreadyHasActual) {
                    updatedMessages.unshift({
                        ...actualMessage,
                        tempId: undefined,
                        isTemp: false,
                        status: actualMessage.status || "sent"
                    });
                }
            }

            const conversations = state.conversations;
            let targetConv: Conversation | null = null;
            let targetIdx = -1;

            for (let i = 0; i < conversations.length; i++) {
                if (conversations[i]._id === conversationId) {
                    targetIdx = i;
                    targetConv = {
                        ...conversations[i],
                        lastMessage: actualMessage,
                        updatedAt: actualMessage.createdAt || new Date().toISOString()
                    };
                    break;
                }
            }

            let newConvs: Conversation[];
            if (targetConv) {
                if (targetIdx === 0) {
                    newConvs = [targetConv, ...conversations.slice(1)];
                } else {
                    newConvs = [
                        targetConv,
                        ...conversations.slice(0, targetIdx),
                        ...conversations.slice(targetIdx + 1)
                    ];
                }
            } else {
                newConvs = conversations;
            }

            return {
                messagesByConversation: {
                    ...state.messagesByConversation,
                    [conversationId]: updatedMessages
                },
                conversations: newConvs
            };
        }),

    retryMessage: (conversationId, tempId) =>
        set((state) => {
            const existing = state.messagesByConversation[conversationId] || [];
            let changed = false;
            const updatedMessages = existing.map((m) => {
                if ((m.tempId === tempId || m._id === tempId) && m.status !== "sending") {
                    changed = true;
                    return { ...m, status: "sending" as const };
                }
                return m;
            });

            return changed
                ? {
                      messagesByConversation: {
                          ...state.messagesByConversation,
                          [conversationId]: updatedMessages
                      }
                  }
                : state;
        }),

    markMessageFailed: (conversationId, tempId) =>
        set((state) => {
            const existing = state.messagesByConversation[conversationId] || [];
            let changed = false;
            const updatedMessages = existing.map((m) => {
                if ((m.tempId === tempId || m._id === tempId) && m.status !== "failed") {
                    changed = true;
                    return { ...m, status: "failed" as const };
                }
                return m;
            });

            return changed
                ? {
                      messagesByConversation: {
                          ...state.messagesByConversation,
                          [conversationId]: updatedMessages
                      }
                  }
                : state;
        }),

    addIncomingMessage: (conversationId, message, myId) =>
        set((state) => {
            const existing = state.messagesByConversation[conversationId] || [];

            if (message.tempId) {
                const tempIndex = existing.findIndex(
                    (m) => m.tempId === message.tempId || m._id === message.tempId
                );
                if (tempIndex !== -1) {
                    const updated = [...existing];
                    updated[tempIndex] = {
                        ...message,
                        tempId: undefined,
                        isTemp: false,
                        status: message.status || "sent"
                    };

                    const conversations = state.conversations;
                    let targetConv: Conversation | null = null;
                    let targetIdx = -1;

                    for (let i = 0; i < conversations.length; i++) {
                        if (conversations[i]._id === conversationId) {
                            targetIdx = i;
                            targetConv = {
                                ...conversations[i],
                                lastMessage: message,
                                updatedAt: message.createdAt || new Date().toISOString()
                            };
                            break;
                        }
                    }

                    let newConvs = conversations;
                    if (targetConv) {
                        if (targetIdx === 0) {
                            newConvs = [targetConv, ...conversations.slice(1)];
                        } else {
                            newConvs = [
                                targetConv,
                                ...conversations.slice(0, targetIdx),
                                ...conversations.slice(targetIdx + 1)
                            ];
                        }
                    }

                    return {
                        messagesByConversation: {
                            ...state.messagesByConversation,
                            [conversationId]: updated
                        },
                        conversations: newConvs
                    };
                }
            }

            const msgIndex = existing.findIndex((m) => m._id === message._id);
            if (msgIndex === 0) {
                return state;
            }

            let updatedMessages: Message[];
            if (msgIndex !== -1) {
                updatedMessages = [...existing];
                updatedMessages[msgIndex] = message;
            } else {
                updatedMessages = [message, ...existing];
            }

            const senderId = getSenderId(message.sender);
            const isFromOther = myId ? senderId !== myId : false;

            const conversations = state.conversations;
            let targetConv: Conversation | null = null;
            let targetIdx = -1;

            for (let i = 0; i < conversations.length; i++) {
                if (conversations[i]._id === conversationId) {
                    targetIdx = i;
                    const currentUnread = conversations[i].unreadCountForMe || 0;
                    targetConv = {
                        ...conversations[i],
                        lastMessage: message,
                        updatedAt: message.createdAt || new Date().toISOString(),
                        unreadCountForMe: isFromOther ? currentUnread + 1 : currentUnread
                    };
                    break;
                }
            }

            let newConvs: Conversation[];
            if (targetConv) {
                if (targetIdx === 0) {
                    newConvs = [targetConv, ...conversations.slice(1)];
                } else {
                    newConvs = [
                        targetConv,
                        ...conversations.slice(0, targetIdx),
                        ...conversations.slice(targetIdx + 1)
                    ];
                }
            } else {
                newConvs = conversations;
            }

            return {
                messagesByConversation: {
                    ...state.messagesByConversation,
                    [conversationId]: updatedMessages
                },
                conversations: newConvs
            };
        }),

    markDelivered: (conversationId, deliveredTo) =>
        set((state) => {
            const existing = state.messagesByConversation[conversationId] || [];
            let anyMessageChanged = false;

            const updatedMessages = existing.map((m) => {
                if (isIdInArray(m.isDeliveredTo, deliveredTo)) return m;
                anyMessageChanged = true;
                const deliveredArr = m.isDeliveredTo || [];
                return {
                    ...m,
                    isDeliveredTo: [...deliveredArr, deliveredTo]
                };
            });

            let conversationChanged = false;
            const updatedConvs = state.conversations.map((c) => {
                if (c._id === conversationId && c.lastMessage) {
                    if (isIdInArray(c.lastMessage.isDeliveredTo, deliveredTo)) return c;
                    conversationChanged = true;
                    const deliveredArr = c.lastMessage.isDeliveredTo || [];
                    return {
                        ...c,
                        lastMessage: {
                            ...c.lastMessage,
                            isDeliveredTo: [...deliveredArr, deliveredTo]
                        }
                    };
                }
                return c;
            });

            if (!anyMessageChanged && !conversationChanged) return state;

            return {
                messagesByConversation: anyMessageChanged
                    ? {
                          ...state.messagesByConversation,
                          [conversationId]: updatedMessages
                      }
                    : state.messagesByConversation,
                conversations: conversationChanged ? updatedConvs : state.conversations
            };
        }),

    markRead: (conversationId, readBy, myId) =>
        set((state) => {
            const existing = state.messagesByConversation[conversationId] || [];
            let anyMessageChanged = false;

            const updatedMessages = existing.map((m) => {
                const alreadyRead = isIdInArray(m.isReadBy, readBy);
                const isDelivered = isIdInArray(m.isDeliveredTo, readBy);
                if (alreadyRead && isDelivered) return m;

                anyMessageChanged = true;
                const readArr = m.isReadBy || [];
                const deliveredArr = m.isDeliveredTo || [];
                return {
                    ...m,
                    isDeliveredTo: isDelivered ? deliveredArr : [...deliveredArr, readBy],
                    isReadBy: alreadyRead ? readArr : [...readArr, readBy]
                };
            });

            let conversationChanged = false;
            const updatedConvs = state.conversations.map((c) => {
                if (c._id === conversationId) {
                    const lastMsg = c.lastMessage;
                    let updatedLastMsg = lastMsg;
                    if (lastMsg) {
                        const alreadyRead = isIdInArray(lastMsg.isReadBy, readBy);
                        const isDelivered = isIdInArray(lastMsg.isDeliveredTo, readBy);
                        if (!alreadyRead || !isDelivered) {
                            conversationChanged = true;
                            const readArr = lastMsg.isReadBy || [];
                            const deliveredArr = lastMsg.isDeliveredTo || [];
                            updatedLastMsg = {
                                ...lastMsg,
                                isDeliveredTo: isDelivered ? deliveredArr : [...deliveredArr, readBy],
                                isReadBy: alreadyRead ? readArr : [...readArr, readBy]
                            };
                        }
                    }
                    const shouldClearUnread = myId && readBy === myId && c.unreadCountForMe !== 0;
                    if (shouldClearUnread) conversationChanged = true;

                    if (updatedLastMsg !== lastMsg || shouldClearUnread) {
                        return {
                            ...c,
                            lastMessage: updatedLastMsg,
                            unreadCountForMe: shouldClearUnread ? 0 : c.unreadCountForMe
                        };
                    }
                }
                return c;
            });

            if (!anyMessageChanged && !conversationChanged) return state;

            return {
                messagesByConversation: anyMessageChanged
                    ? {
                          ...state.messagesByConversation,
                          [conversationId]: updatedMessages
                      }
                    : state.messagesByConversation,
                conversations: conversationChanged ? updatedConvs : state.conversations
            };
        }),

    clearConversation: (conversationId) =>
        set((state) => {
            if (!state.messagesByConversation[conversationId]) return state;
            const newMessages = { ...state.messagesByConversation };
            delete newMessages[conversationId];
            return { messagesByConversation: newMessages };
        })
}));
