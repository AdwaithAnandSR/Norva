import api from "../../utils/axios.js";

// Access or create direct conversation with user
export const accessConversation = async targetUserId => {
    const { data } = await api.post("/chat/conversation", { targetUserId });
    return data; // { success, conversation }
};

// Get list of conversations
export const getConversations = async () => {
    const { data } = await api.get("/chat/conversations");
    return data; // { success, conversations }
};

// Get message history for a conversation with pagination
export const getMessages = async ({ conversationId, before, limit = 15 }) => {
    const params = { limit };
    if (before) params.before = before;
    const { data } = await api.get(`/chat/messages/${conversationId}`, { params });
    return data; // { success, conversation, messages, hasMore, nextCursor }
};

// Send a message
export const sendMessage = async ({ conversationId, text, image, tempId }) => {
    const { data } = await api.post("/chat/message", {
        conversationId,
        text,
        image,
        tempId
    });
    return data; // { success, message }
};

// Mark conversation messages as read
export const markAsRead = async conversationId => {
    const { data } = await api.put(`/chat/read/${conversationId}`);
    return data; // { success }
};

// Get contacts to chat with
export const getChatContacts = async (q = "") => {
    const { data } = await api.get("/chat/contacts", { params: { q } });
    return data; // { success, users }
};

// Clear all messages in a conversation
export const clearChat = async conversationId => {
    const { data } = await api.delete(`/chat/clear/${conversationId}`);
    return data; // { success, message }
};
