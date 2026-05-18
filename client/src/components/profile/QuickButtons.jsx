import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";

import { buttonGlow } from "@constants/style.js";

const QuickButtons = () => {
    const handleCreateFirstPost = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push("/CreatePost");
    };

    return (
        <>
            <TouchableOpacity
                style={buttonGlow}
                className="mt-3 rounded-3xl w-[80%] py-3 justify-center items-center self-center"
            >
                <Text className="text-xl font-bold text-text">
                    Edit profile
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={buttonGlow}
                className="mt-3 w-[80%] py-3 rounded-3xl bg-btn justify-center items-center self-center"
                onPress={handleCreateFirstPost}
            >
                <Text className="text-xl font-bold text-text">
                    Create My First Post
                </Text>
            </TouchableOpacity>
        </>
    );
};
export default QuickButtons;
