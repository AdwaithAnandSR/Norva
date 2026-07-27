import { Server } from "socket.io";
import chalk from "chalk";
import Message from "../models/message.models.js";
import Conversation from "../models/conversation.models.js";
import { sendNewMessageNotification } from "./notification.service.js";

let io;

export const initIo = server => {
    try {
        if (!server) {
            throw new Error(
                "server instance created using createServer from http must be passed as an argument for initIo()!"
            );
        }

        io = new Server(server, {
            cors: {
                origin: "*"
            }
        });

        console.log(chalk.hex("#f82dbb")("\nsocket initialised 🎊"));

        io.on("connection", socket => {
            console.log(chalk.hex("#2ef8ad")(`Socket connected: ${socket.id}`));

            // User joins their personal room
            socket.on("setup", async userId => {
                if (userId) {
                    socket.join(`user:${userId}`);
                    console.log(`Socket ${socket.id} joined user:${userId}`);
                    
                    // Automatically mark any pending undelivered messages as delivered
                    try {
                        const userConversations = await Conversation.find({ participants: userId }).select("_id");
                        const convIds = userConversations.map(c => c._id);
                        if (convIds.length > 0) {
                            const undeliveredMessages = await Message.find({
                                conversation: { $in: convIds },
                                sender: { $ne: userId },
                                isDeliveredTo: { $ne: userId }
                            }).select("conversation");

                            if (undeliveredMessages.length > 0) {
                                await Message.updateMany(
                                    {
                                        conversation: { $in: convIds },
                                        sender: { $ne: userId },
                                        isDeliveredTo: { $ne: userId }
                                    },
                                    { $addToSet: { isDeliveredTo: userId } }
                                );

                                const affectedConvIds = Array.from(new Set(undeliveredMessages.map(m => m.conversation.toString())));
                                affectedConvIds.forEach(convId => {
                                    io.to(`conversation:${convId}`).emit("messages_delivered", {
                                        conversationId: convId,
                                        deliveredTo: userId
                                    });
                                });
                            }
                        }
                    } catch (err) {
                        console.error("setup delivery check error:", err);
                    }
                }
            });

            // Join a specific conversation room
            socket.on("join_conversation", conversationId => {
                if (conversationId) {
                    socket.join(`conversation:${conversationId}`);
                    console.log(`Socket ${socket.id} joined conversation:${conversationId}`);
                }
            });

            // Leave a specific conversation room
            socket.on("leave_conversation", conversationId => {
                if (conversationId) {
                    socket.leave(`conversation:${conversationId}`);
                    console.log(`Socket ${socket.id} left conversation:${conversationId}`);
                }
            });

            // Real-time Socket Message Sending
            socket.on("send_message", async (data, callback) => {
                try {
                    const { tempId, conversationId, senderId, text, image } = data || {};
                    if (!conversationId || !senderId || (!text && !image)) {
                        if (typeof callback === "function") {
                            callback({ success: false, error: "Missing required fields" });
                        }
                        return;
                    }

                    const conversation = await Conversation.findById(conversationId);
                    if (!conversation) {
                        if (typeof callback === "function") {
                            callback({ success: false, error: "Conversation not found" });
                        }
                        return;
                    }

                    // Check which participants are online right now
                    const initialDeliveredTo = [senderId];
                    conversation.participants.forEach(participantId => {
                        const pStr = participantId.toString();
                        if (pStr !== senderId) {
                            const userRoom = io.sockets.adapter.rooms.get(`user:${pStr}`);
                            if (userRoom && userRoom.size > 0) {
                                initialDeliveredTo.push(pStr);
                            }
                        }
                    });

                    let newMessage = await Message.create({
                        conversation: conversationId,
                        sender: senderId,
                        text: text || "",
                        image: image || "",
                        isDeliveredTo: initialDeliveredTo,
                        isReadBy: [senderId]
                    });

                    newMessage = await Message.findById(newMessage._id).populate(
                        "sender",
                        "username fullname profileImage"
                    );

                    const messageObj = {
                        ...newMessage.toObject(),
                        ...(tempId ? { tempId } : {})
                    };

                    const updateOps = {
                        lastMessage: newMessage._id,
                        updatedAt: new Date()
                    };

                    const incOps = {};
                    conversation.participants.forEach(participantId => {
                        const pStr = participantId.toString();
                        if (pStr !== senderId) {
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

                    // Broadcast to conversation room (including sender)
                    io.to(`conversation:${conversationId}`).emit("new_message", messageObj);

                    // If delivered to other online participants, emit messages_delivered
                    initialDeliveredTo.forEach(deliveredUserId => {
                        if (deliveredUserId !== senderId) {
                            io.to(`conversation:${conversationId}`).emit("messages_delivered", {
                                conversationId,
                                deliveredTo: deliveredUserId
                            });
                        }
                    });

                    // Notify other participants via their user room & push notification
                    const recipientIds = [];
                    conversation.participants.forEach(participantId => {
                        const pStr = participantId.toString();
                        if (pStr !== senderId) {
                            recipientIds.push(pStr);
                            io.to(`user:${pStr}`).emit("new_message_notification", {
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
                        }).catch(err => console.error("Socket message push notification error:", err));
                    }

                    // ACK returns only success confirmation (no message payload)
                    if (typeof callback === "function") {
                        callback({ success: true });
                    }
                } catch (err) {
                    console.error("socket send_message error:", err);
                    if (typeof callback === "function") {
                        callback({ success: false, error: err.message });
                    }
                }
            });

            // Socket Mark Delivered ACK
            socket.on("mark_delivered", async ({ conversationId, userId }) => {
                try {
                    if (!conversationId || !userId) return;

                    await Message.updateMany(
                        { conversation: conversationId, isDeliveredTo: { $ne: userId } },
                        { $addToSet: { isDeliveredTo: userId } }
                    );

                    io.to(`conversation:${conversationId}`).emit("messages_delivered", {
                        conversationId,
                        deliveredTo: userId
                    });

                    const conversation = await Conversation.findById(conversationId).select("participants");
                    if (conversation?.participants) {
                        conversation.participants.forEach(p => {
                            io.to(`user:${p.toString()}`).emit("messages_delivered", {
                                conversationId,
                                deliveredTo: userId
                            });
                        });
                    }
                } catch (err) {
                    console.error("socket mark_delivered error:", err);
                }
            });

            // Socket Mark Read ACK
            socket.on("mark_read", async ({ conversationId, userId }) => {
                try {
                    if (!conversationId || !userId) return;

                    await Message.updateMany(
                        { conversation: conversationId, isDeliveredTo: { $ne: userId } },
                        { $addToSet: { isDeliveredTo: userId } }
                    );

                    await Message.updateMany(
                        { conversation: conversationId, isReadBy: { $ne: userId } },
                        { $addToSet: { isReadBy: userId } }
                    );

                    await Conversation.updateOne(
                        { _id: conversationId },
                        { $set: { [`unreadCount.${userId}`]: 0 } },
                        { timestamps: false }
                    );

                    io.to(`conversation:${conversationId}`).emit("messages_read", {
                        conversationId,
                        readBy: userId
                    });

                    const conversation = await Conversation.findById(conversationId).select("participants");
                    if (conversation?.participants) {
                        conversation.participants.forEach(p => {
                            io.to(`user:${p.toString()}`).emit("messages_read", {
                                conversationId,
                                readBy: userId
                            });
                            io.to(`user:${p.toString()}`).emit("unread_count_updated", {
                                conversationId,
                                userId,
                                unreadCount: 0
                            });
                        });
                    }
                } catch (err) {
                    console.error("socket mark_read error:", err);
                }
            });

            // Typing indicators
            socket.on("typing", data => {
                const { conversationId, userId, username } = data || {};
                if (conversationId) {
                    socket.to(`conversation:${conversationId}`).emit("typing", {
                        conversationId,
                        userId,
                        username
                    });
                }
            });

            socket.on("stop_typing", data => {
                const { conversationId, userId } = data || {};
                if (conversationId) {
                    socket.to(`conversation:${conversationId}`).emit("stop_typing", {
                        conversationId,
                        userId
                    });
                }
            });

            socket.on("disconnect", () => {
                console.log(chalk.hex("#ff5555")(`Socket disconnected: ${socket.id}`));
            });
        });

        return io;
    } catch (err) {
        console.error("initIo error:", err);
    }
};

export const getIo = () => {
    if (io) return io;
    throw new Error("io not initialised yet!");
};

export const emitToUser = (userId, event, data) => {
    try {
        if (io) {
            io.to(`user:${userId}`).emit(event, data);
        }
    } catch (err) {
        console.error("emitToUser error:", err);
    }
};

export const emitToConversation = (conversationId, event, data) => {
    try {
        if (io) {
            io.to(`conversation:${conversationId}`).emit(event, data);
        }
    } catch (err) {
        console.error("emitToConversation error:", err);
    }
};
