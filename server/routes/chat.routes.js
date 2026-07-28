import express from "express";
import {
    accessConversation,
    getConversations,
    getMessages,
    sendMessage,
    markAsRead,
    markAsDelivered,
    getChatContacts,
    clearChat
} from "../controllers/chat/chat.controller.js";

const router = express.Router();

router.post("/conversation", accessConversation);
router.get("/conversations", getConversations);
router.get("/messages/:conversationId", getMessages);
router.post("/message", sendMessage);
router.put("/read/:conversationId", markAsRead);
router.put("/delivered/:conversationId", markAsDelivered);
router.get("/contacts", getChatContacts);
router.delete("/clear/:conversationId", clearChat);

export default router;
