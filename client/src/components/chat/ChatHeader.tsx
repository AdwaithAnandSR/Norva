import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import InitialsAvatar from "../search/InitialsAvatar.jsx";

interface ChatHeaderProps {
    otherUser: any;
    isTyping: boolean;
    recipientId?: string;
}

const ChatHeader = ({ otherUser, isTyping, recipientId }: ChatHeaderProps) => {
    return (
        <View
            className="flex-row items-center justify-between px-4 py-3 border-b border-white/10"
            style={{ paddingTop: Platform.OS === "ios" ? 54 : 44 }}
        >
            <TouchableOpacity
                onPress={() => router.back()}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                className="p-1 mr-2"
            >
                <Feather name="arrow-left" size={24} color="#c4c4e0" />
            </TouchableOpacity>

            <TouchableOpacity
                activeOpacity={recipientId ? 0.7 : 1}
                onPress={() => {
                    if (recipientId) {
                        router.push({
                            pathname: "/(UserProfile)/[id]" as any,
                            params: { id: recipientId }
                        });
                    }
                }}
                className="flex-row items-center flex-1 mr-2"
            >
                <InitialsAvatar
                    fullname={
                        otherUser?.fullname || otherUser?.username || "User"
                    }
                    profileImage={otherUser?.profileImage}
                    size={40}
                />
                <View className="ml-3 flex-1">
                    <Text
                        style={{ fontFamily: "WinkyRoughExtraBold" }}
                        className="text-text text-base"
                        numberOfLines={1}
                    >
                        {otherUser?.fullname || otherUser?.username || "Chat"}
                    </Text>
                    <Text
                        className="text-text/60 text-xs"
                        numberOfLines={1}
                    >
                        {isTyping
                            ? "typing..."
                            : `@${otherUser?.username || "user"}`}
                    </Text>
                </View>
            </TouchableOpacity>

            <View className="flex-row items-center space-x-2">
                <TouchableOpacity className="p-2">
                    <Feather
                        name="more-vertical"
                        size={20}
                        color="#c4c4e0"
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default ChatHeader;
