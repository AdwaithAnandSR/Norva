import {
    useState,
    useCallback
} from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Dimensions
} from "react-native";
import {
    Image
} from "expo-image";
import {
    LinearGradient
} from "expo-linear-gradient";
import {
    Feather,
    AntDesign
} from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import {
    toggleLike
} from "../../controllers/post/feed.controller.js";
import {
    useUser
} from "../../store/user.store.js";

const {
    width: vw
} = Dimensions.get("window");
const MEDIA_HEIGHT = (vw - 24) * 0.65;

const blurhash = "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azay";

const PostCard = ({
    post
}) => {
    const currentUserId = useUser(state => state.userId);

    const [liked,
        setLiked] = useState(
        () => post.likes?.includes(currentUserId) ?? false
    );
    const [likesCount,
        setLikesCount] = useState(post.likesCount ?? 0);
    const [likeLoading,
        setLikeLoading] = useState(false);

    const author = post.userId; // populated: { username, fullname }

    const handleLike = useCallback(async () => {
        if (likeLoading) return;
        const wasLiked = liked;
        setLiked(prev => !prev);
        setLikesCount(prev => prev + (wasLiked ? -1: 1));
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setLikeLoading(true);
        try {
            const result = await toggleLike(post._id);
            setLiked(result.liked);
            setLikesCount(result.likesCount);
        } catch {
            setLiked(wasLiked);
            setLikesCount(prev => prev + (wasLiked ? 1: -1));
        } finally {
            setLikeLoading(false);
        }
    },
        [liked,
            likeLoading,
            post._id]);

    return (
        <View
            className="bg-card rounded-[20px] mb-4 overflow-hidden border border-border self-center"
            style={ {
                width: vw - 24,
                shadowColor: "#6437ff",
                shadowOffset: { width: 0,
                    height: 2 },
                shadowOpacity: 0.12,
                shadowRadius: 16,
                elevation: 6
            }}
            >
            {/* Author row */}
            <View className="flex-row items-center gap-[10px] px-3.5 pt-3.5 pb-2.5">
                <View className="w-10 h-10 rounded-full bg-card-selected border-2 border-btn/30 items-center justify-center">
                    <Text
                        className="text-btn text-lg"
                        style={ { fontFamily: "WinkyRoughExtraBold" }}
                        >
                        {author?.fullname?.[0]?.toUpperCase() ?? "?"}
                    </Text>
                </View>
                <View>
                    <Text
                        className="text-text text-[15px]"
                        style={ { fontFamily: "WinkyRoughExtraBold" }}
                        >
                        {author?.fullname ?? "Unknown"}
                    </Text>
                    <Text
                        className="text-text/60 text-[11px]"
                        style={ { fontFamily: "SpaceMono" }}
                        >
                        @{author?.username ?? "unknown"}
                    </Text>
                </View>
            </View>

            {/* Title */}
            {!!post.title && (
                <Text
                    className="text-text text-lg px-3.5 pb-2.5"
                    style={ { fontFamily: "WinkyRoughExtraBold" }}
                    numberOfLines={2}
                    >
                    {post.title}
                </Text>
            )}

            {/* Media */}
            {!!post.url && (
                <View style={ { width: "100%", height: MEDIA_HEIGHT }}>
                    <Image
                        source={ { uri: post.url }}
                        style={ { width: "100%", height: "100%" }}
                        placeholder={ { blurhash }}
                        contentFit="cover"
                        transition={400}
                        />
                    <LinearGradient
                        colors={["transparent", "rgba(3,3,8,0.72)"]}
                        style={ { position: "absolute", bottom: 0, left: 0, right: 0, height: 60 }}
                        start={ { x: 0, y: 0 }}
                        end={ { x: 0, y: 1 }}
                        pointerEvents="none"
                        />
                </View>
            )}

            {/* Description */}
            {!!post.description && (
                <Text
                    className="text-text-secondary text-xs leading-[18px] px-3.5 pt-3"
                    style={ { fontFamily: "SpaceMono" }}
                    numberOfLines={3}
                    >
                    {post.description}
                </Text>
            )}

            {/* Tags */}
            {post.tags?.length > 0 && (
                <View className="flex-row flex-wrap gap-1.5 px-3.5 pt-2.5">
                    {post.tags.slice(0, 4).map(tag => (
                        <View key={tag} className="bg-card-selected rounded-2xl px-2.5 py-0.5 border border-border">
                            <Text
                                className="text-btn text-[10px]"
                                style={ { fontFamily: "SpaceMono" }}
                                >
                                #{tag}
                            </Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Actions */}
            <View className="flex-row gap-5 px-3.5 py-3.5">
                <TouchableOpacity
                    className="flex-row items-center gap-1"
                    onPress={handleLike}
                    activeOpacity={0.7}
                    >
                    <AntDesign
                        name={liked ? "heart": "hearto"}
                        size={20}
                        color={liked ? "#f43f5e": "#c4c4e0"}
                        />
                    <Text
                        className={liked ? "text-[#f43f5e] text-xs": "text-text-secondary text-xs"}
                        style={ { fontFamily: "SpaceMono" }}
                        >
                        {likesCount}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity className="flex-row items-center gap-1" activeOpacity={0.7}>
                    <Feather name="message-circle" size={20} color="#c4c4e0" />
                    <Text
                        className="text-text-secondary text-xs"
                        style={ { fontFamily: "SpaceMono" }}
                        >
                        {post.commentsCount ?? 0}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity className="flex-row items-center gap-1" activeOpacity={0.7}>
                    <Feather name="eye" size={18} color="#c4c4e0" />
                    <Text
                        className="text-text-secondary text-xs"
                        style={ { fontFamily: "SpaceMono" }}
                        >
                        {post.viewsCount ?? 0}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default PostCard;