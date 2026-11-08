import { useEffect, useState } from "react";
import { connectSocket } from "../../utils/socket.js";
import { useChatStore } from "../../store/chat.store";

export const useChatRoomSocket = (conversationId, myId) => {
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        if (!conversationId || !myId) return;

        const socket = connectSocket();
        socket.emit("join_conversation", conversationId);
        socket.emit("mark_read", { conversationId, userId: myId });

        // Mark read in local Zustand store
        useChatStore.getState().markRead(conversationId, myId, myId);

        const handleNewMessage = (newMessage) => {
            if (!newMessage) return;
            const convId =
                typeof newMessage.conversation === "string"
                    ? newMessage.conversation
                    : newMessage.conversation?._id;

            if (convId === conversationId) {
                if (newMessage.tempId) {
                    useChatStore
                        .getState()
                        .replaceTempMessage(conversationId, newMessage.tempId, newMessage);
                } else {
                    useChatStore
                        .getState()
                        .addIncomingMessage(conversationId, newMessage, myId);
                }

                const senderId =
                    typeof newMessage.sender === "string"
                        ? newMessage.sender
                        : newMessage.sender?._id;

                if (senderId !== myId) {
                    socket.emit("mark_read", { conversationId, userId: myId });
                }
            }
        };

        const handleMessagesDelivered = (data) => {
            if (data?.conversationId === conversationId && data?.deliveredTo) {
                useChatStore.getState().markDelivered(conversationId, data.deliveredTo);
            }
        };

        const handleMessagesRead = (data) => {
            if (data?.conversationId === conversationId && data?.readBy) {
                useChatStore.getState().markRead(conversationId, data.readBy, myId);
            }
        };

        const handleTyping = (data) => {
            if (data.conversationId === conversationId && data.userId !== myId) {
                setIsTyping(true);
            }
        };

        const handleStopTyping = (data) => {
            if (data.conversationId === conversationId && data.userId !== myId) {
                setIsTyping(false);
            }
        };

        const handleChatCleared = (data) => {
            if (data?.conversationId === conversationId) {
                useChatStore.getState().clearConversation(conversationId);
            }
        };

        socket.on("new_message", handleNewMessage);
        socket.on("messages_delivered", handleMessagesDelivered);
        socket.on("messages_read", handleMessagesRead);
        socket.on("typing", handleTyping);
        socket.on("stop_typing", handleStopTyping);
        socket.on("chat_cleared", handleChatCleared);

        return () => {
            socket.emit("leave_conversation", conversationId);
            socket.off("new_message", handleNewMessage);
            socket.off("messages_delivered", handleMessagesDelivered);
            socket.off("messages_read", handleMessagesRead);
            socket.off("typing", handleTyping);
            socket.off("stop_typing", handleStopTyping);
            socket.off("chat_cleared", handleChatCleared);
        };
    }, [conversationId, myId]);

    return { isTyping };
};
