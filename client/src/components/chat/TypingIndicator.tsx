import React from "react";
import { View, Text } from "react-native";

interface TypingIndicatorProps {
    isTyping: boolean;
    username?: string;
}

const TypingIndicator = ({ isTyping, username }: TypingIndicatorProps) => {
    if (!isTyping) return null;

    return (
        <View className="px-4 py-1">
            <Text className="text-text/60 text-xs italic">
                @{username || "user"} is typing...
            </Text>
        </View>
    );
};

export default TypingIndicator;
