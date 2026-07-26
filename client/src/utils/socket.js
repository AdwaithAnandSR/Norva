import { io } from "socket.io-client";
import { useUser } from "../store/user.store.js";
import { useChatStore } from "../store/chat.store";
import { getConversations } from "../controllers/chat/chat.controller.js";

const SOCKET_URL = "http://192.0.0.2:3000";

let socket = null;

export const getSocket = () => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            autoConnect: true,
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000
        });

        socket.on("connect", async () => {
            console.log("[Socket] Connected with ID:", socket?.id);
            const userId = useUser.getState().userId;
            if (userId && socket) {
                socket.emit("setup", userId);

                // On reconnect: sync latest conversations in background into Zustand
                try {
                    const data = await getConversations();
                    if (data?.conversations) {
                        useChatStore.getState().setConversations(data.conversations);
                    }
                } catch (e) {
                    console.log("[Socket] Reconnect sync error:", e);
                }
            }
        });

        socket.on("new_message", (message) => {
            if (!message?.conversation) return;
            const convId =
                typeof message.conversation === "string"
                    ? message.conversation
                    : message.conversation?._id;
            const myId = useUser.getState().userId;

            if (message.tempId) {
                useChatStore
                    .getState()
                    .replaceTempMessage(convId, message.tempId, message);
            } else {
                useChatStore
                    .getState()
                    .addIncomingMessage(convId, message, myId);
            }
        });

        socket.on("new_message_notification", ({ conversationId, message }) => {
            if (!conversationId || !message) return;
            const myId = useUser.getState().userId;

            if (message?.tempId) {
                useChatStore
                    .getState()
                    .replaceTempMessage(conversationId, message.tempId, message);
            } else {
                useChatStore
                    .getState()
                    .addIncomingMessage(conversationId, message, myId);
            }
        });

        socket.on("messages_delivered", ({ conversationId, deliveredTo }) => {
            if (conversationId && deliveredTo) {
                useChatStore.getState().markDelivered(conversationId, deliveredTo);
            }
        });

        socket.on("messages_read", ({ conversationId, readBy }) => {
            if (conversationId && readBy) {
                const myId = useUser.getState().userId;
                useChatStore.getState().markRead(conversationId, readBy, myId);
            }
        });

        socket.on("unread_count_updated", ({ conversationId, userId }) => {
            if (conversationId && userId) {
                const myId = useUser.getState().userId;
                useChatStore.getState().markRead(conversationId, userId, myId);
            }
        });

        socket.on("connect_error", (err) => {
            console.log("[Socket] Connection error:", err.message);
        });

        socket.on("disconnect", (reason) => {
            console.log("[Socket] Disconnected:", reason);
        });
    }

    const userId = useUser.getState().userId;
    if (userId && socket) {
        if (!socket.connected) {
            socket.connect();
        } else {
            socket.emit("setup", userId);
        }
    }

    return socket;
};

export const connectSocket = () => {
    return getSocket();
};

export const disconnectSocket = () => {
    if (socket && socket.connected) {
        socket.disconnect();
    }
};

export default getSocket;
