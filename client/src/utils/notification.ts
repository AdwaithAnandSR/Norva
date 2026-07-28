import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { updatePushTokenApi } from "../controllers/user/user.controller.js";

// Configure how notifications present when app is running in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true
    })
});

/**
 * Register device for push notifications and send Expo Push Token to backend server
 */
export async function registerForPushNotificationsAsync() {
    let token = null;
    console.log("[PushNotification] Starting registerForPushNotificationsAsync...");

    if (Platform.OS === "android") {
        console.log("[PushNotification] Setting Android notification channel 'default'...");
        await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#FF2366"
        });
    }

    if (Platform.OS !== "web") {
        try {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            console.log(`[PushNotification] Existing notification permission status: ${existingStatus}`);

            if (existingStatus !== "granted") {
                console.log("[PushNotification] Requesting notification permissions...");
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
                console.log(`[PushNotification] Requested permission result status: ${finalStatus}`);
            }

            if (finalStatus !== "granted") {
                console.log("[PushNotification] Failed to get push token: permission not granted (finalStatus !== 'granted')");
                return null;
            }

            const projectId =
                Constants?.expoConfig?.extra?.eas?.projectId ||
                Constants?.easConfig?.projectId;

            console.log(`[PushNotification] Fetching Expo Push Token with projectId: ${projectId || "undefined"}`);

            const pushTokenData = await Notifications.getExpoPushTokenAsync(
                projectId ? { projectId } : undefined
            );
            token = pushTokenData.data;
            console.log("[PushNotification] Fetched Expo Push Token:", token);

            if (token) {
                console.log("[PushNotification] Sending token to backend via updatePushTokenApi...");
                const apiRes = await updatePushTokenApi(token);
                console.log("[PushNotification] Backend updatePushTokenApi response:", JSON.stringify(apiRes, null, 2));
                console.log("Expo Push Token registered successfully:", token);
            }
        } catch (error: any) {
            if (error?.message?.includes("FirebaseApp is not initialized")) {
                console.warn(
                    "[Expo Notifications] Firebase is not initialized for Android push notifications.\n" +
                    "To enable Android push notifications on standalone/dev builds:\n" +
                    "1. Download google-services.json from your Firebase Console.\n" +
                    "2. Place google-services.json in your client folder.\n" +
                    "3. Add \"googleServicesFile\": \"./google-services.json\" under \"android\" in app.json."
                );
            } else {
                console.log("[PushNotification] Expo Push Token registration warning/error:", error);
            }
        }
    } else {
        console.log("[PushNotification] Must use native device for Expo Push Notifications");
    }

    return token;
}

/**
 * Custom React Hook to register push notifications and set up notification interaction observers
 */
export function usePushNotifications(userId?: string) {
    const router = useRouter();

    useEffect(() => {
        console.log(`[PushNotification] usePushNotifications hook executed for userId: ${userId || "undefined"}`);
        if (!userId) {
            console.log("[PushNotification] No userId provided to usePushNotifications. Skipping registration.");
            return;
        }

        // Register push token upon login/app start
        registerForPushNotificationsAsync();

        // Observer for foreground notification delivery
        const notificationListener = Notifications.addNotificationReceivedListener(notification => {
            console.log("[PushNotification] Notification received in foreground:", JSON.stringify(notification.request.content, null, 2));
        });

        // Observer for user tapping/interacting with a notification
        const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
            const data = response.notification.request.content.data;
            console.log("[PushNotification] Notification response (user tapped notification):", JSON.stringify(data, null, 2));

            if (!data || typeof data !== "object") return;

            switch (data.type) {
                case "message":
                    if (data.conversationId) {
                        router.push(`/chats/${data.conversationId}`);
                    }
                    break;
                case "follow":
                    if (data.userId) {
                        router.push(`/(UserProfile)/${data.userId}`);
                    }
                    break;
                case "like":
                case "comment":
                    if (data.postId) {
                        router.push("/(tabs)/Feeds");
                    }
                    break;
                default:
                    break;
            }
        });

        return () => {
            console.log(`[PushNotification] Cleaning up notification listeners for userId: ${userId}`);
            notificationListener.remove();
            responseListener.remove();
        };
    }, [userId]);
}
