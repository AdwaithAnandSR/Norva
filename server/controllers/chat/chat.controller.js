import Conversation from "../../models/conversation.models.js";
import Message from "../../models/message.models.js";
import User from "../../models/user.models.js";
import {
    emitToConversation,
    emitToUser
} from "../../services/socket.service.js";
import { sendNewMessageNotification } from "../../services/notification.service.js";

// Access or create a 1-on-1 direct conversation with target user
export const accessConversation = async (req, res) => {
    try {
        const myId = req.user.userId;
        const { targetUserId } = req.body;

        if (!targetUserId) {
            return res.status(400).json({
                success: false,
                message: "targetUserId is required"
            });
        }

        if (targetUserId === myId) {
            return res.status(400).json({
                success: false,
                message: "Cannot create conversation with yourself"
            });
        }

        // Check if target user exists
        const targetUserExists = await User.exists({ _id: targetUserId });
        if (!targetUserExists) {
            return res.status(404).json({
                success: false,
                message: "Target user not found"
            });
        }

        // Search for existing 1-on-1 conversation
        let conversation = await Conversation.findOne({
            isGroup: false,
            participants: { $all: [myId, targetUserId], $size: 2 }
        })
            .populate("participants", "username fullname profileImage")
            .populate({
                path: "lastMessage",
                populate: {
                    path: "sender",
                    select: "username fullname profileImage"
                }
            });

        if (!conversation) {
            // Create new conversation
            conversation = await Conversation.create({
                participants: [myId, targetUserId],
                isGroup: false,
                unreadCount: { [myId]: 0, [targetUserId]: 0 }
            });

            conversation = await Conversation.findById(
                conversation._id
            ).populate("participants", "username fullname profileImage");
        }

        return res.status(200).json({
            success: true,
            conversation
        });
    } catch (error) {
        console.error("accessConversation error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get all conversations for the authenticated user
export const getConversations = async (req, res) => {
    try {
        const myId = req.user.userId;

        const conversations = await Conversation.find({
            participants: myId
        })
            .populate("participants", "username fullname profileImage")
            .populate({
                path: "lastMessage",
                populate: {
                    path: "sender",
                    select: "username fullname profileImage"
                }
            })
            .sort({ updatedAt: -1 })
            .lean();

        // Format unread count for current user
        const formatted = conversations.map(conv => {
            const unread = conv.unreadCount
                ? conv.unreadCount[myId] || conv.unreadCount.get?.(myId) || 0
                : 0;
            return {
                ...conv,
                unreadCountForMe: unread
            };
        });

        return res.status(200).json({
            success: true,
            conversations: formatted
        });
    } catch (error) {
        console.error("getConversations error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get messages for a specific conversation (paginated by limit, default 15)
export const getMessages = async (req, res) => {
    try {
        const myId = req.user.userId;
        const { conversationId } = req.params;
        const { before, limit = 15 } = req.query;
        const parsedLimit = parseInt(limit, 10) || 15;

        const conversation = await Conversation.findById(conversationId)
            .populate("participants", "username fullname profileImage")
            .lean();

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found"
            });
        }

        const isParticipant = conversation.participants.some(
            p => p._id.toString() === myId
        );
        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized access to conversation"
            });
        }

        // Mark messages as delivered and read by current user
        await Message.updateMany(
            { conversation: conversationId, isDeliveredTo: { $ne: myId } },
            { $addToSet: { isDeliveredTo: myId } }
        );

        await Message.updateMany(
            { conversation: conversationId, isReadBy: { $ne: myId } },
            { $addToSet: { isReadBy: myId } }
        );

        // Reset unread count for this user in conversation
        await Conversation.updateOne(
            { _id: conversationId },
            { $set: { [`unreadCount.${myId}`]: 0 } },
            { timestamps: false }
        );

        // Query for messages
        const query = { conversation: conversationId };
        if (before) {
            query._id = { $lt: before };
        }

        // Fetch limit + 1 to check if there are more messages
        const fetchedMessages = await Message.find(query)
            .populate("sender", "username fullname profileImage")
            .sort({ createdAt: -1 })
            .limit(parsedLimit + 1)
            .lean();

        const hasMore = fetchedMessages.length > parsedLimit;
        const messagesBatch = hasMore
            ? fetchedMessages.slice(0, parsedLimit)
            : fetchedMessages;

        const cursorMessage = messagesBatch[messagesBatch.length - 1];
        const messages = messagesBatch;
        const nextCursor = hasMore ? cursorMessage._id : null;

        // Emit real-time status update to conversation
        emitToConversation(conversationId, "messages_read", {
            conversationId,
            readBy: myId
        });

        conversation.participants.forEach(p => {
            const pStr = p._id ? p._id.toString() : p.toString();
            if (pStr !== myId) {
                emitToUser(pStr, "messages_read", {
                    conversationId,
                    readBy: myId
                });
            }
        });

        return res.status(200).json({
            success: true,
            conversation,
            messages,
            hasMore,
            nextCursor
        });
    } catch (error) {
        console.error("getMessages error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Send a message via REST fallback
export const sendMessage = async (req, res) => {
    try {
        const myId = req.user.userId;
        const { conversationId, text, image, tempId } = req.body;

        if (!conversationId) {
            return res.status(400).json({
                success: false,
                message: "conversationId is required"
            });
        }

        if (!text && !image) {
            return res.status(400).json({
                success: false,
                message: "Message must contain text or an image"
            });
        }

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found"
            });
        }

        const isParticipant = conversation.participants.some(
            id => id.toString() === myId
        );
        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            });
        }

        // Check which participants are online right now
        const initialDeliveredTo = [myId];

        // Create message
        let newMessage = await Message.create({
            conversation: conversationId,
            sender: myId,
            text: text || "",
            image: image || "",
            isDeliveredTo: initialDeliveredTo,
            isReadBy: [myId]
        });

        newMessage = await Message.findById(newMessage._id).populate(
            "sender",
            "username fullname profileImage"
        );

        const messageObj = {
            ...newMessage.toObject(),
            ...(tempId ? { tempId } : {})
        };

        // Update conversation's lastMessage and increment unread count for other participants
        const updateOps = {
            lastMessage: newMessage._id,
            updatedAt: new Date()
        };

        const incOps = {};
        conversation.participants.forEach(participantId => {
            const pStr = participantId.toString();
            if (pStr !== myId) {
                incOps[`unreadCount.${pStr}`] = 1;
            }
        });

        await Conversation.updateOne(
            { _id: conversationId },
            {
                $set: updateOps,
                $inc: incOps
            }
        );

        // Emit socket events
        emitToConversation(conversationId, "new_message", messageObj);

        initialDeliveredTo.forEach(deliveredUserId => {
            if (deliveredUserId !== myId) {
                emitToConversation(conversationId, "messages_delivered", {
                    conversationId,
                    deliveredTo: deliveredUserId
                });
            }
        });

        const recipientIds = [];
        conversation.participants.forEach(participantId => {
            const pStr = participantId.toString();
            if (pStr !== myId) {
                recipientIds.push(pStr);
                emitToUser(pStr, "new_message_notification", {
                    conversationId,
                    message: messageObj
                });
            }
        });

        if (recipientIds.length > 0) {
            sendNewMessageNotification({
                recipientIds,
                senderName: newMessage.sender?.fullname || newMessage.sender?.username,
                messageText: text,
                conversationId
            }).catch(err => console.error("Message push notification error:", err));
        }

        return res.status(201).json({
            success: true,
            message: messageObj
        });
    } catch (error) {
        console.error("sendMessage error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Mark conversation messages as read
export const markAsRead = async (req, res) => {
    try {
        const myId = req.user.userId;
        const { conversationId } = req.params;

        await Message.updateMany(
            { conversation: conversationId, isDeliveredTo: { $ne: myId } },
            { $addToSet: { isDeliveredTo: myId } }
        );

        await Message.updateMany(
            { conversation: conversationId, isReadBy: { $ne: myId } },
            { $addToSet: { isReadBy: myId } }
        );

        await Conversation.updateOne(
            { _id: conversationId },
            { $set: { [`unreadCount.${myId}`]: 0 } },
            { timestamps: false }
        );

        emitToConversation(conversationId, "messages_read", {
            conversationId,
            readBy: myId
        });

        emitToUser(myId, "unread_count_updated", {
            conversationId,
            unreadCount: 0
        });

        return res.status(200).json({
            success: true
        });
    } catch (error) {
        console.error("markAsRead error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Mark conversation messages as delivered
export const markAsDelivered = async (req, res) => {
    try {
        const myId = req.user.userId;
        const { conversationId } = req.params;

        await Message.updateMany(
            { conversation: conversationId, isDeliveredTo: { $ne: myId } },
            { $addToSet: { isDeliveredTo: myId } }
        );

        emitToConversation(conversationId, "messages_delivered", {
            conversationId,
            deliveredTo: myId
        });

        return res.status(200).json({
            success: true
        });
    } catch (error) {
        console.error("markAsDelivered error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get contacts (followers & following) for starting new chats
export const getChatContacts = async (req, res) => {
    try {
        const myId = req.user.userId;
        const q = (req.query.q ?? "").trim();

        const userDoc = await User.findById(myId)
            .select("following followers")
            .lean();
        const contactIds = Array.from(
            new Set([
                ...(userDoc?.following || []).map(id => id.toString()),
                ...(userDoc?.followers || []).map(id => id.toString())
            ])
        );

        let query = {
            _id: { $ne: myId }
        };

        if (q) {
            const regex = new RegExp(
                q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                "i"
            );
            query.$or = [{ username: regex }, { fullname: regex }];
        } else if (contactIds.length > 0) {
            query._id = { $in: contactIds, $ne: myId };
        }

        const users = await User.find(query)
            .select("username fullname profileImage followersCount")
            .limit(30)
            .lean();

        return res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        console.error("getChatContacts error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
