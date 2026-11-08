import {
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator
} from "react-native";
import { useState } from "react";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Entypo, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useQueryClient } from "@tanstack/react-query";

import { useUser } from "../../store/user.store.js";
import { deletePost } from "../../controllers/post/feed.controller.js";
import PostOptions from "../feed/PostOptions.jsx";

const { width: vw } = Dimensions.get("window");
const TILE = (vw - 48) / 3; // 3 columns with padding

const blurhash = "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azay";

const PostTile = ({ post, onLongPress }) => (
    <TouchableOpacity
        onPress={() =>
            post.url &&
            router.push({
                pathname: "/FullScreenImage",
                params: {
                    postId: post._id,
                    uri: post.url,
                    mediaType: post.mediaType,
                    height: post.height,
                    width: post.width,
                    title: post.title ?? "",
                    description: post.description ?? "",
                    tags: JSON.stringify(post.tags ?? []),
                    userId: typeof post.userId === "object" ? post.userId?._id : post.userId
                }
            })
        }
        onLongPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onLongPress?.(post);
        }}
        delayLongPress={400}
        activeOpacity={0.8}
        style={{
            width: TILE,
            height: TILE,
            borderRadius: 12,
            overflow: "hidden",
            backgroundColor: "#1a1a2e"
        }}
    >
        {post.url ? (
            <Image
                source={{ uri: post.url }}
                style={{ width: "100%", height: "100%" }}
                placeholder={{ blurhash }}
                contentFit="cover"
                transition={300}
                recyclingKey={post._id}
            />
        ) : (
            // Text-only post
            <View className="flex-1 justify-center items-center p-2">
                <Text numberOfLines={4} className="text-text font-lg text-bold text-center">
                    {post.title || post.description}
                </Text>
            </View>
        )}
        {post.mediaType === "video" && (
            <Entypo
                name="controller-play"
                size={20}
                color="white"
                className="absolute top-1 left-1 rounded-full bg-[#37373793] p-1"
            />
        )}
    </TouchableOpacity>
);

const PostsGrid = ({ postsQuery }) => {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
        postsQuery;

    const currentUserId = useUser(state => state.userId);
    const qc = useQueryClient();

    const [selectedPost, setSelectedPost] = useState(null);
    const [optionsVisible, setOptionsVisible] = useState(false);

    const posts = data?.pages.flatMap(p => p.posts) ?? [];

    const handleLongPress = post => {
        setSelectedPost(post);
        setOptionsVisible(true);
    };

    const isOwner = selectedPost
        ? selectedPost.userId?._id === currentUserId ||
          selectedPost.userId === currentUserId ||
          !selectedPost.userId
        : false;

    const handleEdit = () => {
        setOptionsVisible(false);
        if (!selectedPost) return;
        router.push({
            pathname: "/EditPost",
            params: {
                postId: selectedPost._id,
                title: selectedPost.title ?? "",
                description: selectedPost.description ?? "",
                tags: JSON.stringify(selectedPost.tags ?? [])
            }
        });
    };

    const handleDelete = async () => {
        setOptionsVisible(false);
        if (!selectedPost) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        const targetId = selectedPost._id;
        qc.setQueryData(["posts", "me"], old => {
            if (!old?.pages) return old;
            return {
                ...old,
                pages: old.pages.map(page => ({
                    ...page,
                    posts: page.posts.filter(p => p._id !== targetId)
                }))
            };
        });

        try {
            await deletePost(targetId);
            qc.invalidateQueries({ queryKey: ["posts"] });
            qc.invalidateQueries({ queryKey: ["feed"] });
            qc.invalidateQueries({ queryKey: ["reels"] });
            qc.invalidateQueries({ queryKey: ["profile"] });
        } catch {
            qc.invalidateQueries({ queryKey: ["posts"] });
        }
    };

    if (isLoading) {
        return (
            <View style={{ paddingVertical: 40, alignItems: "center" }}>
                <ActivityIndicator color="#6437ff" />
            </View>
        );
    }

    if (!posts.length) {
        return (
            <View
                style={{ paddingVertical: 40, alignItems: "center", gap: 10 }}
            >
                <Feather name="camera-off" size={32} color="#333" />
                <Text
                    style={{
                        color: "rgba(196,196,224,0.3)",
                        fontFamily: "SpaceMono",
                        fontSize: 13
                    }}
                >
                    No posts yet
                </Text>
            </View>
        );
    }

    return (
        <View style={{ paddingHorizontal: 16 }}>
            {/* Grid */}
            <View
                style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 8
                }}
            >
                {posts.map(post => (
                    <PostTile
                        key={post._id}
                        post={post}
                        onLongPress={handleLongPress}
                    />
                ))}
            </View>

            {/* Load more */}
            {hasNextPage && (
                <TouchableOpacity
                    onPress={fetchNextPage}
                    disabled={isFetchingNextPage}
                    style={{
                        marginTop: 16,
                        paddingVertical: 12,
                        alignItems: "center"
                    }}
                >
                    {isFetchingNextPage ? (
                        <ActivityIndicator color="#6437ff" size="small" />
                    ) : (
                        <Text
                            style={{
                                color: "rgba(196,196,224,0.4)",
                                fontFamily: "SpaceMono",
                                fontSize: 12
                            }}
                        >
                            Load more
                        </Text>
                    )}
                </TouchableOpacity>
            )}

            <PostOptions
                visible={optionsVisible}
                isOwner={isOwner}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onClose={() => setOptionsVisible(false)}
            />
        </View>
    );
};

export default PostsGrid;
