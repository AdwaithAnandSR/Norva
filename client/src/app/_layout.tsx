import "../global.css";

import { Stack } from "expo-router";
import { View } from "react-native";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import {
    QueryClient,
    QueryClientProvider,
    useQueryClient
} from "@tanstack/react-query";

import React, { useEffect } from "react";
import { useUser } from "../store/user.store.js";
import Toast from "../components/common/Toast.jsx";
import { connectSocket } from "../utils/socket.js";
import { usePushNotifications } from "../utils/notification";

const client = new QueryClient({
    defaultOptions: {
        queries: {
            retry: (failureCount, error) => {
                const status = error?.response?.status || error?.status;
                if (status === 401) return false;
                else return failureCount < 3;
            }
        }
    }
});

const SocketInitializer = () => {
    const userId = useUser(state => state.userId);
    const queryClient = useQueryClient();

    usePushNotifications(userId);

    useEffect(() => {
        if (userId) {
            const socket = connectSocket();

            const handleNewNotification = ({
                conversationId,
                message
            }: any) => {
                if (!message) return;
                queryClient.setQueryData(["conversations"], (old: any) => {
                    if (!old?.conversations) return old;
                    const senderId =
                        typeof message.sender === "string"
                            ? message.sender
                            : message.sender?._id;
                    const isFromOther = senderId !== userId;

                    let updatedConv: any = null;
                    const otherConvs = old.conversations.filter((c: any) => {
                        if (c._id === conversationId) {
                            updatedConv = {
                                ...c,
                                lastMessage: message,
                                updatedAt:
                                    message.createdAt ||
                                    new Date().toISOString(),
                                unreadCountForMe: isFromOther
                                    ? (c.unreadCountForMe || 0) + 1
                                    : c.unreadCountForMe || 0
                            };
                            return false;
                        }
                        return true;
                    });

                    if (!updatedConv) return old;
                    return {
                        ...old,
                        conversations: [updatedConv, ...otherConvs]
                    };
                });
            };

            const handleUnreadUpdate = ({ conversationId, readBy }: any) => {
                queryClient.setQueryData(["conversations"], (old: any) => {
                    if (!old?.conversations) return old;
                    return {
                        ...old,
                        conversations: old.conversations.map((c: any) => {
                            if (c._id === conversationId) {
                                return {
                                    ...c,
                                    unreadCountForMe:
                                        readBy === userId
                                            ? 0
                                            : c.unreadCountForMe
                                };
                            }
                            return c;
                        })
                    };
                });
            };

            socket.on("new_message_notification", handleNewNotification);
            socket.on("unread_count_updated", handleUnreadUpdate);

            return () => {
                socket.off("new_message_notification", handleNewNotification);
                socket.off("unread_count_updated", handleUnreadUpdate);
            };
        }
    }, [userId, queryClient]);

    return null;
};

const Layout = () => {
    const isLoggedIn = useUser(state => !!state.userId);

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: "slide_from_right"
            }}
        >
            <Stack.Protected guard={!isLoggedIn}>
                <Stack.Screen name="auth" />
            </Stack.Protected>
            <Stack.Protected guard={isLoggedIn}>
                <Stack.Screen name="(secure)/(tabs)" />
                <Stack.Screen name="(secure)/(others)" />
                <Stack.Screen
                    options={{
                        animation: "fade",
                        presentation: "transparentModal"
                    }}
                    name="(secure)/(models)"
                />
            </Stack.Protected>
        </Stack>
    );
};

export default function RootLayout() {
    const [loaded] = useFonts({
        SpaceMono: require("../../assets/fonts/SpaceMono-Regular.ttf"),
        BebasRegular: require("../../assets/fonts/BebasNeue-Regular.ttf"),
        GloriaRegular: require("../../assets/fonts/GloriaHallelujah-Regular.ttf"),
        LuckiestGuyRegular: require("../../assets/fonts/LuckiestGuy-Regular.ttf"),
        WinkyRoughExtraBold: require("../../assets/fonts/WinkyRough-ExtraBold.ttf")
    });

    if (!loaded) return null;

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: "black"
            }}
        >
            <StatusBar style="auto" translucent animated />
            <QueryClientProvider client={client}>
                <SocketInitializer />
                <Layout />
            </QueryClientProvider>
            <Toast />
        </View>
    );
}
