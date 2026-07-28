import { Expo } from "expo-server-sdk";
import User from "../models/user.models.js";

const expo = new Expo();

/**
 * Send push notification to a recipient user or list of recipient user IDs
 */
export const sendPushNotification = async ({
    recipientId,
    recipientIds,
    title,
    body,
    data
}) => {
    try {
        const ids = recipientIds ? recipientIds : [recipientId];
        const uniqueIds = [...new Set(ids.map(id => id?.toString()))].filter(
            Boolean
        );

        if (uniqueIds.length === 0) return;

        const users = await User.find({ _id: { $in: uniqueIds } })
            .select("expoPushToken pushTokens username")
            .lean();

        const messages = [];
        for (const user of users) {
            const tokens = new Set();

            if (user.expoPushToken) {
                const isValid = Expo.isExpoPushToken(user.expoPushToken);
                if (isValid) {
                    tokens.add(user.expoPushToken);
                }
            }

            if (Array.isArray(user.pushTokens) && user.pushTokens.length > 0) {
                user.pushTokens.forEach(token => {
                    const isValid = token && Expo.isExpoPushToken(token);
                    if (isValid) tokens.add(token);
                });
            }

            for (const pushToken of tokens) {
                messages.push({
                    to: pushToken,
                    sound: "default",
                    title,
                    body,
                    data: data || {},
                    badge: 1,
                    priority: "high"
                });
            }
        }

        if (messages.length === 0) return;

        const chunks = expo.chunkPushNotifications(messages);
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            try {
                const ticketChunk =
                    await expo.sendPushNotificationsAsync(chunk);
            } catch (error) {
                console.error(
                    `[NotificationService] Error sending Expo push chunk ${i + 1}:`,
                    error
                );
            }
        }
    } catch (err) {
        console.error("[NotificationService] sendPushNotification error:", err);
    }
};

/**
 * Helper for New Message Notification
 */
export const sendNewMessageNotification = async ({
    recipientIds,
    senderName,
    messageText,
    conversationId
}) => {
    const textSnippet = messageText
        ? messageText.length > 80
            ? messageText.substring(0, 77) + "..."
            : messageText
        : "Sent a photo";

    await sendPushNotification({
        recipientIds,
        title: senderName || "New Message",
        body: textSnippet,
        data: { type: "message", conversationId }
    });
};

/**
 * Helper for Follow Notification
 */
export const sendFollowNotification = async ({
    recipientId,
    followerName,
    followerId
}) => {
    await sendPushNotification({
        recipientId,
        title: "New Follower",
        body: `${followerName || "Someone"} started following you`,
        data: { type: "follow", userId: followerId }
    });
};

/**
 * Helper for Like Post Notification
 */
export const sendLikeNotification = async ({
    recipientId,
    likerName,
    postId
}) => {
    await sendPushNotification({
        recipientId,
        title: "New Like",
        body: `${likerName || "Someone"} liked your post`,
        data: { type: "like", postId }
    });
};

/**
 * Helper for Comment Notification
 */
export const sendCommentNotification = async ({
    recipientId,
    commenterName,
    commentText,
    postId,
    commentId
}) => {
    const snippet = commentText
        ? commentText.length > 50
            ? commentText.substring(0, 47) + "..."
            : commentText
        : "";

    await sendPushNotification({
        recipientId,
        title: "New Comment",
        body: `${commenterName || "Someone"} commented: "${snippet}"`,
        data: { type: "comment", postId, commentId }
    });
};
