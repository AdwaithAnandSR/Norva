import { Expo } from "expo-server-sdk";
import User from "../models/user.models.js";

const expo = new Expo();

/**
 * Send push notification to a recipient user or list of recipient user IDs
 */
export const sendPushNotification = async ({ recipientId, recipientIds, title, body, data }) => {
    try {
        const ids = recipientIds ? recipientIds : [recipientId];
        const uniqueIds = [...new Set(ids.map(id => id?.toString()))].filter(Boolean);

        console.log(`[NotificationService] sendPushNotification called for recipientIds:`, uniqueIds, `| Title: "${title}", Body: "${body}"`);

        if (uniqueIds.length === 0) {
            console.warn(`[NotificationService] Warning: sendPushNotification received empty recipient list.`);
            return;
        }

        const users = await User.find({ _id: { $in: uniqueIds } })
            .select("expoPushToken pushTokens username")
            .lean();

        console.log(`[NotificationService] DB query returned ${users.length} user(s) for recipientIds:`, uniqueIds);

        const messages = [];
        for (const user of users) {
            const tokens = new Set();

            if (user.expoPushToken) {
                const isValid = Expo.isExpoPushToken(user.expoPushToken);
                console.log(`[NotificationService] User ${user._id} (${user.username || "no-username"}) expoPushToken: "${user.expoPushToken}" | isValidExpoToken: ${isValid}`);
                if (isValid) {
                    tokens.add(user.expoPushToken);
                }
            } else {
                console.log(`[NotificationService] User ${user._id} (${user.username || "no-username"}) has no main expoPushToken registered.`);
            }

            if (Array.isArray(user.pushTokens) && user.pushTokens.length > 0) {
                console.log(`[NotificationService] User ${user._id} has ${user.pushTokens.length} token(s) in pushTokens array:`, user.pushTokens);
                user.pushTokens.forEach(token => {
                    const isValid = token && Expo.isExpoPushToken(token);
                    console.log(`[NotificationService] Checking pushTokens entry: "${token}" | isValidExpoToken: ${isValid}`);
                    if (isValid) {
                        tokens.add(token);
                    }
                });
            }

            console.log(`[NotificationService] Total unique valid tokens for user ${user._id}: ${tokens.size}`);

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

        if (messages.length === 0) {
            console.warn(`[NotificationService] Warning: No valid Expo push tokens found for recipient(s):`, uniqueIds);
            return;
        }

        console.log(`[NotificationService] Dispatching ${messages.length} message(s) to Expo Push Service...`);
        const chunks = expo.chunkPushNotifications(messages);
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            try {
                console.log(`[NotificationService] Sending chunk ${i + 1}/${chunks.length} containing ${chunk.length} notification(s)...`);
                const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                console.log(`[NotificationService] Expo Push response (chunk ${i + 1}):`, JSON.stringify(ticketChunk, null, 2));
            } catch (error) {
                console.error(`[NotificationService] Error sending Expo push chunk ${i + 1}:`, error);
            }
        }
    } catch (err) {
        console.error("[NotificationService] sendPushNotification error:", err);
    }
};

/**
 * Helper for New Message Notification
 */
export const sendNewMessageNotification = async ({ recipientIds, senderName, messageText, conversationId }) => {
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
export const sendFollowNotification = async ({ recipientId, followerName, followerId }) => {
    console.log(`[NotificationService] sendFollowNotification triggered: recipientId=${recipientId}, followerName=${followerName}, followerId=${followerId}`);
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
export const sendLikeNotification = async ({ recipientId, likerName, postId }) => {
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
export const sendCommentNotification = async ({ recipientId, commenterName, commentText, postId, commentId }) => {
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
