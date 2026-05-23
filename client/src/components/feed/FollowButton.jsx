import { TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { useFollow } from "../../hooks/user/useFollow.js";

const FollowButton = ({ userId }) => {
    const { isFollowing, toggle, isPending } = useFollow(userId);

    return (
        <TouchableOpacity
            onPress={toggle}
            disabled={isPending}
            style={{
                paddingHorizontal: 14,
                paddingVertical: 5,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: isFollowing ? "rgba(196,196,224,0.2)" : "#6437ff",
                backgroundColor: isFollowing
                    ? "transparent"
                    : "rgba(100,55,255,0.12)",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 76
            }}
        >
            {isPending ? (
                <ActivityIndicator size="small" color="#6437ff" />
            ) : (
                <Text
                    style={{
                        fontFamily: "SpaceMono",
                        fontSize: 11,
                        color: isFollowing ? "rgba(196,196,224,0.5)" : "#a78bfa"
                    }}
                >
                    {isFollowing ? "Following" : "Follow"}
                </Text>
            )}
        </TouchableOpacity>
    );
};

export default FollowButton;
