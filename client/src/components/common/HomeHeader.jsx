import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const Home = () => {
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
            >
                <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={28}
                    color="#c4c4e0"
                />
            </TouchableOpacity>
        </View>
    );
};

export default Home;
