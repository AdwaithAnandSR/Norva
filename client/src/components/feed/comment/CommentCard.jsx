import { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { toggleCommentLike } from "../../../controllers/post/comment.controller.js";
import { useCommentDelete } from "../../../hooks/comment/useCommentDelete.js";
import { useUser } from "../../../store/user.store.js"; // Adjust path to your auth store

const CommentCard = ({
    comment,
    postId,
    onReply,
    isReply = false,
    parentId = null
}) => {
    const author = comment.userId;
    const currentUserId = useUser(state => state.userId); // Fetch current logged-in user ID
    const isMyComment = currentUserId && author?._id === currentUserId;

    const [liked, setLiked] = useState(comment.likedByMe ?? false);
    const [likesCount, setLikesCount] = useState(comment.likesCount ?? 0);
    const [likeLoading, setLikeLoading] = useState(false);

    const deleteMutation = useCommentDelete({
        postId,
        parentId: isReply ? parentId : null
    });

    const handleLike = async () => {
        if (likeLoading) return;
        const wasLiked = liked;
        setLiked(p => !p);
        setLikesCount(p => p + (wasLiked ? -1 : 1));
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setLikeLoading(true);
        try {
            const res = await toggleCommentLike(comment._id);
            setLiked(res.liked);
            setLikesCount(res.likesCount);
        } catch {
            setLiked(wasLiked);
            setLikesCount(p => p + (wasLiked ? 1 : -1));
        } finally {
            setLikeLoading(false);
        }
    };

    const handleLongPress = () => {
        // Only trigger deletion modal if it's the user's own comment
        if (!isMyComment) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        Alert.alert(
            "Delete Comment",
            "Are you sure you want to delete this comment?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => deleteMutation.mutate(comment._id)
                }
            ]
        );
    };

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onLongPress={handleLongPress}
            delayLongPress={250}
            className={`flex-row gap-2.5 ${isReply ? "pl-10 pt-2" : "pt-3.5"}`}
        >
            {/* Avatar */}
            <View
                className="items-center justify-center rounded-full bg-card-selected border border-btn/20"
                style={{
                    width: isReply ? 28 : 34,
                    height: isReply ? 28 : 34,
                    borderRadius: 99
                }}
            >
                <Text
                    className="text-btn"
                    style={{
                        fontFamily: "WinkyRoughExtraBold",
                        fontSize: isReply ? 12 : 15
                    }}
                >
                    {author?.fullname?.[0]?.toUpperCase() ?? "?"}
                </Text>
            </View>

            {/* Bubble & Actions */}
            <View className="flex-1">
                <View
                    className="bg-card-selected rounded-2xl px-3 py-2.5"
                    style={{ borderTopLeftRadius: 4 }}
                >
                    <View className="flex-row items-center gap-1.5 mb-1">
                        <Text
                            className="text-text text-[13px]"
                            style={{ fontFamily: "WinkyRoughExtraBold" }}
                        >
                            {author?.fullname ?? "Unknown"}
                        </Text>
                        <Text
                            className="text-text/40 text-[10px]"
                            style={{ fontFamily: "SpaceMono" }}
                        >
                            @{author?.username ?? "unknown"}
                        </Text>
                    </View>

                    <Text
                        className="text-text-secondary text-[13px] leading-[19px]"
                        style={{ fontFamily: "SpaceMono" }}
                    >
                        {comment.content}
                    </Text>
                </View>

                {/* Actions */}
                <View className="flex-row items-center gap-4 mt-1.5 px-1">
                    <TouchableOpacity
                        className="flex-row items-center gap-1"
                        onPress={handleLike}
                        activeOpacity={0.7}
                    >
                        <AntDesign
                            name={"heart"}
                            size={12}
                            color={liked ? "#f43f5e" : "rgba(196,196,224,0.5)"}
                        />
                        {likesCount > 0 && (
                            <Text
                                className="text-[10px]"
                                style={{
                                    fontFamily: "SpaceMono",
                                    color: liked
                                        ? "#f43f5e"
                                        : "rgba(196,196,224,0.5)"
                                }}
                            >
                                {likesCount}
                            </Text>
                        )}
                    </TouchableOpacity>

                    {!isReply && (
                        <TouchableOpacity
                            onPress={() => onReply?.(comment)}
                            activeOpacity={0.7}
                        >
                            <Text
                                className="text-btn/60 text-[10px]"
                                style={{ fontFamily: "SpaceMono" }}
                            >
                                Reply
                                {comment.repliesCount > 0
                                    ? ` · ${comment.repliesCount}`
                                    : ""}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default CommentCard;
