import express from "express";
import {
    accessConversation,
    getConversations,
    getMessages,
    sendMessage,
    markAsRead,
    markAsDelivered,
    getChatContacts
} from "../controllers/chat/chat.controller.js";

const router = express.Router();

router.post("/conversation", accessConversation);
router.get("/conversations", getConversations);
router.get("/messages/:conversationId", getMessages);
router.post("/message", sendMessage);
router.put("/read/:conversationId", markAsRead);
router.put("/delivered/:conversationId", markAsDelivered);
router.get("/contacts", getChatContacts);

export default router;
