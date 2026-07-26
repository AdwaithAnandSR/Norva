import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useConversations } from "../../hooks/chat/useChatQuery.js";

const Home = () => {
    const { data } = useConversations();
    const totalUnread = (data?.conversations || []).reduce(
        (acc, conv) => acc + (conv.unreadCountForMe || 0),
        0
    );

    return (
        <View className="w-full px-4 flex-row items-start justify-between absolute z-20 top-10 left-0">
            <Text
                style={{
                    fontFamily: "LuckiestGuyRegular"
                }}
                className="text-5xl text-text-secondary"
            >
                Norva
            </Text>
            <TouchableOpacity
                onPress={() => router.push("/chats/ChatList")}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                className="relative"
            >
                <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={28}
                    color="#c4c4e0"
                />
                {totalUnread > 0 && (
                    <View className="absolute -top-1 -right-1.5 bg-btn min-w-[18px] h-[18px] px-1 rounded-full items-center justify-center border border-primary">
                        <Text className="text-white text-[10px] font-bold">
                            {totalUnread > 99 ? "99+" : totalUnread}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
};

export default Home;
