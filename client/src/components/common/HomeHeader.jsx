import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { EaseView } from "react-native-ease";
import { useConversations } from "../../hooks/chat/useChatQuery.js";
import AnimatedPressable from "./AnimatedPressable.jsx";

const Home = () => {
    const { data } = useConversations();
    const totalUnread = (data?.conversations || []).reduce(
        (acc, conv) => acc + (conv.unreadCountForMe || 0),
        0
    );

    return (
        <EaseView
            initialAnimate={{ opacity: 0, translateY: -15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 180 }}
            useHardwareLayer={true}
            style={{
                flexDirection: "row",
                width: "100%",
                justifyContent: "space-between",
                alignItems: "flex-start",
                position: "absolute",
                left: 0,
                top: 45,
                paddingHorizontal: 15,
                zIndex: 999
            }}
        >
            <Text
                style={{
                    fontFamily: "LuckiestGuyRegular"
                }}
                className="text-5xl text-text-secondary"
            >
                Norva
            </Text>
            <AnimatedPressable
                onPress={() => router.push("/chats/ChatList")}
                scaleTo={0.88}
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
            </AnimatedPressable>
        </EaseView>
    );
};

export default Home;
