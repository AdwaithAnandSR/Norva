import { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Pressable,
    Dimensions
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, AntDesign, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ReelPlayer from "./ReelPlayer.jsx";
import HeartAnim from "../common/HeartAnim.tsx";
import PostOptions from "./PostOptions.jsx";
import FollowButton from "./FollowButton.jsx";

import { setLike, deletePost } from "../../controllers/post/feed.controller.js";
import { useUser } from "../../store/user.store.js";
import { useComments } from "../../store/comment.store.js";
import { useApp } from "../../store/app.store.js";

const { height: vh } = Dimensions.get("window");
const DOUBLE_TAP_DELAY = 300;

const ReelCard = ({ post, isActive, pageHeight }) => {
    const currentUserId = useUser(state => state.userId);
    const onOpen = useComments(state => state.onOpen);
    const setOnCommentAdded = useComments(state => state.setOnCommentAdded);
    const muted = useApp(s => s.muted);
    const toggleMuted = useApp(s => s.toggleMuted);
    const qc = useQueryClient();
    const insets = useSafeAreaInsets();

    const top = vh - insets.top;

    const heartRef = useRef(null);
    const lastPress = useRef(0);
    const singleTapTimeout = useRef(null);
    const requestRef = useRef(false);

    const isOwner =
        post.userId?._id === currentUserId || post.userId === currentUserId;
    const author = post.userId;

    const [liked, setLiked] = useState(
        () => post.likes?.includes(currentUserId) ?? false
    );
    const [likesCount, setLikesCount] = useState(post.likesCount ?? 0);
    const [commentsCount, setCommentsCount] = useState(post.commentsCount ?? 0);
    const [paused, setPaused] = useState(false);
    const [optionsVisible, setOptionsVisible] = useState(false);

    useEffect(() => {
        return () => {
            if (singleTapTimeout.current)
                clearTimeout(singleTapTimeout.current);
        };
    }, []);

    const handleLike = async (doublePress = false) => {
        if (requestRef.current) return;
        if (doublePress && liked) return;

        const previousLiked = liked;
        const previousLikesCount = likesCount;
        const nextLiked = doublePress ? true : !liked;

        if (nextLiked === previousLiked) return;
        requestRef.current = true;
        setLiked(nextLiked);
        setLikesCount(previousLikesCount + (nextLiked ? 1 : -1));

        try {
            const result = await setLike(post._id, nextLiked);
            setLiked(result.liked);
            setLikesCount(result.likesCount);
        } catch {
            setLiked(previousLiked);
            setLikesCount(previousLikesCount);
        } finally {
            requestRef.current = false;
        }
    };

    const handleOpenComments = () => {
        setOnCommentAdded(() => setCommentsCount(c => c + 1));
        onOpen(post._id);
    };

    const handlePressVideo = () => {
        const now = Date.now();

        if (now - lastPress.current < DOUBLE_TAP_DELAY) {
            if (singleTapTimeout.current) {
                clearTimeout(singleTapTimeout.current);
                singleTapTimeout.current = null;
            }
            handleLike(true);
            heartRef.current?.triggerHeart();
        } else {
            singleTapTimeout.current = setTimeout(() => {
                setPaused(p => !p);
            }, DOUBLE_TAP_DELAY);
        }

        lastPress.current = now;
    };

    const handleDelete = async () => {
        setOptionsVisible(false);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        qc.setQueryData(["reels"], old => {
            if (!old?.pages) return old;
            return {
                ...old,
                pages: old.pages.map(page => ({
                    ...page,
                    posts: page.posts.filter(p => p._id !== post._id)
                }))
            };
        });

        try {
            await deletePost(post._id);
        } catch {
            qc.invalidateQueries({ queryKey: ["reels"] });
        }
    };

    const handleEdit = () => {
        setOptionsVisible(false);
        router.push({
            pathname: "/EditPost",
            params: {
                postId: post._id,
                title: post.title ?? "",
                description: post.description ?? "",
                tags: JSON.stringify(post.tags ?? [])
            }
        });
    };

    return (
        <View
            style={{
                width: "100%",
                height: pageHeight,
                backgroundColor: "#000"
            }}
        >
            <Pressable
                style={{ flex: 1 }}
                onPress={handlePressVideo}
                onLongPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setOptionsVisible(true);
                }}
                delayLongPress={400}
            >
                <ReelPlayer
                    uri={post.url}
                    isActive={isActive}
                    paused={paused}
                    muted={muted}
                    style={{ width: "100%", height: "100%" }}
                />

                {/* Pause indicator */}
                {paused && (
                    <View
                        pointerEvents="none"
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                    >
                        <View className="bg-black/40 rounded-full p-4">
                            <Feather name="play" size={32} color="#fff" />
                        </View>
                    </View>
                )}

                <HeartAnim ref={heartRef} />

                {/* Bottom scrim for legibility */}
                <LinearGradient
                    colors={[
                        "rgba(0,0,0,0.971)",
                        "transparent",
                        "transparent",
                        "transparent",
                        "transparent",
                        "rgba(0,0,0,0.971)"
                    ]}
                    style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: pageHeight,
                        pointerEvents: "none"
                    }}
                />
            </Pressable>

            {/* Bottom-left: author + caption */}
            <View
                className="absolute px-3 bottom-0 py-3"
                pointerEvents="box-none"
            >
                <View className="flex-row items-center gap-2 mb-2">
                    <View className="w-9 h-9 rounded-full bg-card-selected border-2 border-btn/30 items-center justify-center">
                        <Text
                            className="text-btn text-base"
                            style={{ fontFamily: "WinkyRoughExtraBold" }}
                        >
                            {author?.fullname?.[0]?.toUpperCase() ?? "?"}
                        </Text>
                    </View>
                    <Text
                        onPress={() =>
                            router.push(`/UserProfile/${author._id}`)
                        }
                        className="text-white text-md"
                        style={{ fontFamily: "WinkyRoughExtraBold" }}
                        numberOfLines={1}
                    >
                        @{author?.username ?? "unknown"}
                    </Text>
                    {!isOwner && author?._id && (
                        <FollowButton userId={author._id} />
                    )}
                </View>

                {!!post.title && (
                    <Text
                        className="text-white text-md mb-1"
                        style={{ fontFamily: "WinkyRoughExtraBold" }}
                        numberOfLines={1}
                    >
                        {post.title}
                    </Text>
                )}

                {!!post.description && (
                    <Text
                        className="text-white/70 text-xs "
                        style={{ fontFamily: "SpaceMono" }}
                        numberOfLines={2}
                    >
                        {post.description}
                    </Text>
                )}

                {post.tags?.length > 0 && (
                    <View className="flex-row gap-1.5">
                        {post.tags.slice(0, 4).map(
                            tag =>
                                tag?.trim() && (
                                    <Text
                                        key={tag}
                                        className="text-btn text-[11px]"
                                    >
                                        #{tag}
                                    </Text>
                                )
                        )}
                    </View>
                )}
            </View>

            {/* Right action rail */}
            <View
                style={{
                    position: "absolute",
                    right: 12,
                    bottom: 100,
                    alignItems: "center",
                    gap: 20,
                    zIndex: 999
                }}
            >
                <TouchableOpacity
                    onPress={() => handleLike(false)}
                    activeOpacity={0.7}
                    className="items-center gap-1"
                >
                    <AntDesign
                        name="heart"
                        size={30}
                        color={liked ? "#f43f5e" : "#fff"}
                    />
                    <Text
                        className="text-white text-[11px]"
                        style={{ fontFamily: "SpaceMono" }}
                    >
                        {likesCount}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleOpenComments}
                    activeOpacity={0.7}
                    className="items-center gap-1"
                >
                    <Feather name="message-circle" size={28} color="#fff" />
                    <Text
                        className="text-white text-[11px]"
                        style={{ fontFamily: "SpaceMono" }}
                    >
                        {commentsCount}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={toggleMuted}
                    activeOpacity={0.7}
                    className="items-center gap-1"
                >
                    <Ionicons
                        name={muted ? "volume-mute" : "volume-high"}
                        size={26}
                        color="#fff"
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setOptionsVisible(true)}
                    hitSlop={10}
                >
                    <Feather name="more-horizontal" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

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

export default ReelCard;
