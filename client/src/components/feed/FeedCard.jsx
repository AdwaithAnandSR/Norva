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
import Animated from "react-native-reanimated";

import { setLike } from "../../controllers/post/feed.controller.js";
import { useUser } from "../../store/user.store.js";
import { useComments } from "../../store/comment.store.js";

import HeartAnim from "../common/HeartAnim.tsx";

const blurhash = "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azay";
const AImage = Animated.createAnimatedComponent(Image);

const { height: vh } = Dimensions.get("window");

const PostCard = ({ post }) => {
    const currentUserId = useUser(state => state.userId);
    const onOpen = useComments(state => state.onOpen);
    const setOnCommentAdded = useComments(state => state.setOnCommentAdded);

    const heartRef = useRef(null);
    const lastPress = useRef(0);
    const singleTapTimeout = useRef(null);
    const navigating = useRef(false);
    const requestRef = useRef(false);

    const [liked, setLiked] = useState(
        () => post.likes?.includes(currentUserId) ?? false
    );
    const [likesCount, setLikesCount] = useState(post.likesCount ?? 0);
    const [commentsCount, setCommentsCount] = useState(post.commentsCount ?? 0);
    const [likeLoading, setLikeLoading] = useState(false);
    const [ratio, setRatio] = useState(1);

    const author = post.userId;

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
        } catch (e) {
            setLiked(previousLiked);
            setLikesCount(previousLikesCount);
        } finally {
            requestRef.current = false;
        }
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
                        uri: post.url
                    }
                });

                setTimeout(() => {
                    navigating.current = false;
                }, 1000);
            }, DOUBLE_TAP_DELAY);
        }

        lastPress.current = now;
    };

    const handleOpenComments = () => {
        setOnCommentAdded(() => {
            setCommentsCount(c => c + 1);
        });
        onOpen(post._id);
    };

    useEffect(() => {
        return () => {
            if (singleTapTimeout.current) {
                clearTimeout(singleTapTimeout.current);
            }
        };
    }, []);
    
    useEffect(() => {
        if (!requestRef.current) {
            setLiked(post.likes?.includes(currentUserId) ?? false);
            setLikesCount(post.likesCount ?? 0);
        }
        setCommentsCount(post.commentsCount ?? 0);
    }, [post._id, post.likesCount, post.commentsCount]);

    useEffect(() => {
        if (post.url) {
            RNImage.getSize(post.url, (width, height) => {
                setRatio(width / height);
            });
        }
    }, [post.url]);

    return (
        <View
            className="w-full bg-card/60 rounded-[20px] mb-4 overflow-hidden border border-border self-center"
            style={{
                shadowColor: "#6437ff",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.12,
                shadowRadius: 16
            }}
        >
            {/* Author row */}
            <View className="flex-row items-center gap-[10px] px-3.5 pt-3.5 pb-2.5">
                <View className="w-10 h-10 rounded-full bg-card-selected border-2 border-btn/30 items-center justify-center">
                    <Text
                        className="text-btn text-lg"
                        style={{ fontFamily: "WinkyRoughExtraBold" }}
                    >
                        {author?.fullname?.[0]?.toUpperCase() ?? "?"}
                    </Text>
                </View>
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
            </View>

            {/* Title */}
            {!!post.title && (
                <Text
                    className="text-text text-lg px-3.5 pb-2.5"
                    style={{ fontFamily: "WinkyRoughExtraBold" }}
                    numberOfLines={2}
                >
                    {post.title}
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
                <TouchableOpacity
                    className="flex-row items-center gap-1"
                    onPress={() => handleLike(false)}
                    activeOpacity={0.7}
                >
                    <AntDesign
                        name={"heart"}
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
                </TouchableOpacity>

                {/* ④ comment button now opens the sheet */}
                <TouchableOpacity
                    className="flex-row items-center gap-1"
                    onPress={handleOpenComments}
                    activeOpacity={0.7}
                >
                    <Feather name="message-circle" size={20} color="#c4c4e0" />
                    <Text
                        className="text-text-secondary text-xs"
                        style={{ fontFamily: "SpaceMono" }}
                    >
                        {commentsCount}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="flex-row items-center gap-1"
                    activeOpacity={0.7}
                >
                    <Feather name="eye" size={18} color="#c4c4e0" />
                    <Text
                        className="text-text-secondary text-xs"
                        style={{ fontFamily: "SpaceMono" }}
                    >
                        {post.viewsCount ?? 0}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default PostCard;
