import React, { memo } from "react";
import { Text, StyleSheet } from "react-native";
import { useFollow } from "../../hooks/user/useFollow.js";
import AnimatedPressable from "../common/AnimatedPressable.jsx";

const FollowButton = ({ userId, style, textStyle }) => {
    const { isFollowing, toggle, isPending } = useFollow(userId);

    return (
        <AnimatedPressable
            onPress={toggle}
            disabled={isPending}
            scaleTo={0.92}
            style={[
                styles.button,
                isFollowing ? styles.followingButton : styles.followButton,
                style
            ]}
        >
            <Text
                style={[
                    styles.text,
                    isFollowing ? styles.followingText : styles.followText,
                    textStyle
                ]}
            >
                {isFollowing ? "Following" : "Follow"}
            </Text>
        </AnimatedPressable>
    );
};

FollowButton.displayName = "FollowButton";

export default FollowButton;

const styles = StyleSheet.create({
    button: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        minWidth: 80
    },
    followButton: {
        borderColor: "#6437ff",
        backgroundColor: "rgba(100,55,255,0.12)"
    },
    followingButton: {
        borderColor: "rgba(196,196,224,0.2)",
        backgroundColor: "transparent"
    },
    text: {
        fontFamily: "SpaceMono",
        fontSize: 11,
        fontWeight: "600"
    },
    followText: {
        color: "#a78bfa"
    },
    followingText: {
        color: "rgba(196,196,224,0.5)"
    }
});
