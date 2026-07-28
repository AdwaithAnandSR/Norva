import {
    View,
    Text,
    TouchableOpacity,
    Pressable,
    Image as RNImage,
    Dimensions
} from "react-native";
import { useState, useRef, useEffect, useCallback } from "react";
import { Image } from "expo-image";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, AntDesign } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence } from "react-native-reanimated";
import { EaseView } from "react-native-ease";
import { useQueryClient } from "@tanstack/react-query";

import { setLike, deletePost } from "../../controllers/post/feed.controller.js";

import { useUser } from "../../store/user.store.js";
import { useComments } from "../../store/comment.store.js";

import HeartAnim from "../common/HeartAnim.tsx";
import PostOptions from "./PostOptions.jsx";
import FollowButton from "./FollowButton.jsx";
import InitialsAvatar from "../search/InitialsAvatar.jsx";
import AnimatedPressable from "../common/AnimatedPressable.jsx";

const blurhash = "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azay";
const AImage = Animated.createAnimatedComponent(Image);
const { height: vh } = Dimensions.get("window");

const PostCard = ({ post }) => {
    const currentUserId = useUser(state => state.userId);
    const onOpen = useComments(state => state.onOpen);
    const setOnCommentAdded = useComments(state => state.setOnCommentAdded);
    const qc = useQueryClient();

    const heartRef = useRef(null);
    const lastPress = useRef(0);
    const singleTapTimeout = useRef(null);
    const navigating = useRef(false);
    const requestRef = useRef(false);

    const isOwner =
        post.userId?._id === currentUserId || post.userId === currentUserId;

    const [liked, setLiked] = useState(
        () => post.likes?.includes(currentUserId) ?? false
    );
    const [likesCount, setLikesCount] = useState(post.likesCount ?? 0);
    const [commentsCount, setCommentsCount] = useState(post.commentsCount ?? 0);
    const [ratio, setRatio] = useState(1);
    const [optionsVisible, setOptionsVisible] = useState(false);

    const author = post.userId;

    // Sync when feed refetches
    useEffect(() => {
        if (!requestRef.current) {
            setLiked(post.likes?.includes(currentUserId) ?? false);
            setLikesCount(post.likesCount ?? 0);
        }
        setCommentsCount(post.commentsCount ?? 0);
    }, [post._id, post.likesCount, post.commentsCount]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (singleTapTimeout.current)
                clearTimeout(singleTapTimeout.current);
        };
    }, []);

    // Image ratio
    useEffect(() => {
        if (post.url) {
            RNImage.getSize(post.url, (width, height) => {
                setRatio(width / height);
            });
        }
    }, [post.url]);

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

        const postId = post._id;
        try {
            const result = await setLike(post._id, nextLiked);
            if (postId !== post._id) return;
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
        setOnCommentAdded(() => {
            setCommentsCount(c => c + 1);
        });
        onOpen(post._id);
    };

    const handlePressImage = () => {
        if (navigating.current) return;

        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;

        if (now - lastPress.current < DOUBLE_TAP_DELAY) {
            if (singleTapTimeout.current) {
                clearTimeout(singleTapTimeout.current);
                singleTapTimeout.current = null;
            }
            handleLike(true);
            heartRef.current?.triggerHeart();
        } else {
            singleTapTimeout.current = setTimeout(() => {
                navigating.current = true;
                router.push({
                    pathname: "/FullScreenImage",
                    params: {
                        postId: post._id,
                        uri: post.url,
                        title: post.title ?? "",
                        description: post.description ?? "",
                        tags: JSON.stringify(post.tags ?? []),
                        userId: typeof post.userId === "object" ? post.userId?._id : post.userId
                    }
                });
                setTimeout(() => {
                    navigating.current = false;
                }, 1000);
            }, DOUBLE_TAP_DELAY);
        }

        lastPress.current = now;
    };

    const handleDelete = async () => {
        setOptionsVisible(false);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // Optimistic remove from feed cache
        qc.setQueryData(["feed"], old => {
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
            // Rollback — refetch to restore
            qc.invalidateQueries({ queryKey: ["feed"] });
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
        <Pressable
            onLongPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setOptionsVisible(true);
            }}
            delayLongPress={400}
        >
            <EaseView
                initialAnimate={{ opacity: 0, translateY: 16, scale: 0.97 }}
                animate={{ opacity: 1, translateY: 0, scale: 1 }}
                transition={{ type: "spring", damping: 22, stiffness: 220 }}
                useHardwareLayer={true}
                className="w-full bg-card/60 rounded-[20px] mb-4 overflow-hidden border border-border self-center"
                style={{
                    shadowColor: "#6437ff",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.12,
                    shadowRadius: 16
                }}
            >
                {/* Author row */}
                <View className="flex-row items-center justify-between px-3.5 pt-3.5 pb-2.5">
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => {
                            if (author?._id) {
                                router.push(`/(UserProfile)/${author._id}`);
                            }
                        }}
                        className="flex-row items-center gap-[10px]"
                    >
                        <InitialsAvatar
                            fullname={author?.fullname || author?.username}
                            profileImage={author?.profileImage}
                            size={40}
                        />
                        <View>
                            <Text
                                className="text-text text-[15px]"
                                style={{ fontFamily: "WinkyRoughExtraBold" }}
                            >
                                {author?.fullname ?? "Unknown"}
                            </Text>
                            <Text
                                className="text-text/30 text-xs"
                                style={{ fontFamily: "SpaceMono" }}
                            >
                                @{author?.username ?? "unknown"}
                            </Text>
                        </View>
                    </TouchableOpacity>

                    {/* Options trigger */}
                    <View className="flex-row items-center gap-3">
                        {/* Follow button — hidden on own posts */}
                        {!isOwner && author?._id && (
                            <FollowButton userId={author._id} />
                        )}

                        {/* Options */}
                        <AnimatedPressable
                            onPress={() => setOptionsVisible(true)}
                            hitSlop={12}
                            scaleTo={0.85}
                        >
                            <Feather
                                name="more-horizontal"
                                size={20}
                                color="#555"
                            />
                        </AnimatedPressable>
                    </View>
                </View>

                {/* Title */}
                {!!post.title && (
                    <Text
                        className="text-text text-lg px-3.5 pb-2.5"
                        style={{ fontFamily: "WinkyRoughExtraBold" }}
                        numberOfLines={2}
                    >
                        {post.title}
                        {post.isEdited && (
                            <Text className="text-text/30 text-xs">
                                {" "}
                                · edited
                            </Text>
                        )}
                    </Text>
                )}

                {/* Media */}
                {!!post.url && (
                    <Pressable
                        onPress={handlePressImage}
                        className="rounded-xl overflow-hidden items-center w-full"
                        style={{ maxHeight: vh * 0.8 }}
                    >
                        <AImage
                            source={{ uri: post.url }}
                            sharedTransitionTag={`image-${post._id}`}
                            style={{ width: "100%", aspectRatio: ratio }}
                            placeholder={{ blurhash }}
                            contentFit="cover"
                            transition={400}
                            key={post.url}
                            recyclingKey={post.url}
                        />
                        <HeartAnim ref={heartRef} />
                    </Pressable>
                )}

                {/* Description */}
                {!!post.description && (
                    <Text
                        className="text-text-secondary text-xs leading-[18px] px-3.5 pt-3"
                        style={{ fontFamily: "SpaceMono" }}
                        numberOfLines={3}
                    >
                        {post.description}
                    </Text>
                )}

                {/* Tags */}
                {post.tags?.length > 0 && (
                    <View className="flex-row flex-wrap gap-1.5 px-3.5 pt-2.5">
                        {post.tags.slice(0, 4).map(
                            tag =>
                                tag?.trim() && (
                                    <View
                                        key={tag}
                                        className="bg-card-selected rounded-2xl px-2.5 py-0.5 border border-border"
                                    >
                                        <Text
                                            className="text-btn text-[10px]"
                                            style={{ fontFamily: "SpaceMono" }}
                                        >
                                            #{tag}
                                        </Text>
                                    </View>
                                )
                        )}
                    </View>
                )}

                {/* Actions */}
                <View className="flex-row gap-4 px-3.5 py-3.5">
                    <AnimatedPressable
                        className="flex-row items-center gap-1"
                        onPress={() => handleLike(false)}
                        scaleTo={0.88}
                    >
                        <AntDesign
                            name="heart"
                            size={20}
                            color={liked ? "#f43f5e" : "#c4c4e0"}
                        />
                        <Text
                            className={
                                liked
                                    ? "text-[#f43f5e] text-xs"
                                    : "text-text-secondary text-xs"
                            }
                            style={{ fontFamily: "SpaceMono" }}
                        >
                            {likesCount}
                        </Text>
                    </AnimatedPressable>

                    <AnimatedPressable
                        className="flex-row items-center gap-1"
                        onPress={handleOpenComments}
                        scaleTo={0.88}
                    >
                        <Feather
                            name="message-circle"
                            size={20}
                            color="#c4c4e0"
                        />
                        <Text
                            className="text-text-secondary text-xs"
                            style={{ fontFamily: "SpaceMono" }}
                        >
                            {commentsCount}
                        </Text>
                    </AnimatedPressable>

                    <View className="flex-row items-center gap-1">
                        <Feather name="eye" size={18} color="#c4c4e0" />
                        <Text
                            className="text-text-secondary text-xs"
                            style={{ fontFamily: "SpaceMono" }}
                        >
                            {post.viewsCount ?? 0}
                        </Text>
                    </View>
                </View>
            </EaseView>

            <PostOptions
                visible={optionsVisible}
                isOwner={isOwner}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onClose={() => setOptionsVisible(false)}
            />
        </Pressable>
    );
};

export default PostCard;
