import React, { memo } from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useFollow } from "../../hooks/user/useFollow.js";

const FollowButton = ({ userId }) => {
    const { isFollowing, toggle, isPending } = useFollow(userId);

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={toggle}
            disabled={isPending}
            style={[
                styles.button,
                isFollowing ? styles.followingButton : styles.followButton
            ]}
        >
            <Text
                style={[
                    styles.text,
                    isFollowing ? styles.followingText : styles.followText
                ]}
            >
                {isFollowing ? "Following" : "Follow"}
            </Text>
        </TouchableOpacity>
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
