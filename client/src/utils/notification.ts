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

    if (Platform.OS === "android") {
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

            if (existingStatus !== "granted") {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== "granted") {
                console.log("Failed to get push token for push notification: permission not granted");
                return null;
            }

            const projectId =
                Constants?.expoConfig?.extra?.eas?.projectId ||
                Constants?.easConfig?.projectId;

            const pushTokenData = await Notifications.getExpoPushTokenAsync(
                projectId ? { projectId } : undefined
            );
            token = pushTokenData.data;

            if (token) {
                await updatePushTokenApi(token);
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
                console.log("Expo Push Token registration warning/error:", error);
            }
        }
    } else {
        console.log("Must use native device for Expo Push Notifications");
    }

    return token;
}

/**
 * Custom React Hook to register push notifications and set up notification interaction observers
 */
export function usePushNotifications(userId?: string) {
    const router = useRouter();

    useEffect(() => {
        if (!userId) return;

        // Register push token upon login/app start
        registerForPushNotificationsAsync();

        // Observer for foreground notification delivery
        const notificationListener = Notifications.addNotificationReceivedListener(notification => {
            console.log("Notification received in foreground:", notification.request.content);
        });

        // Observer for user tapping/interacting with a notification
        const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
            const data = response.notification.request.content.data;
            console.log("Notification response received:", data);

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
            notificationListener.remove();
            responseListener.remove();
        };
    }, [userId]);
}
