import {
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";

const { width: vw } = Dimensions.get("window");
const TILE = (vw - 48) / 3; // 3 columns with padding

const blurhash = "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azay";

const PostTile = ({ post }) => (
    <TouchableOpacity
        onPress={() =>
            router.push({
                pathname: "/FullScreenImage",
                params: { postId: post._id, uri: post.url }
            })
        }
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
            <View
                style={{
                    flex: 1,
                    padding: 8,
                    justifyContent: "center"
                }}
            >
                <Text
                    numberOfLines={4}
                    style={{
                        color: "#c4c4e0",
                        fontSize: 10,
                        fontFamily: "SpaceMono"
                    }}
                >
                    {post.title || post.description}
                </Text>
            </View>
        )}
    </TouchableOpacity>
);

const PostsGrid = ({ postsQuery }) => {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading
    } = postsQuery;

    const posts = data?.pages.flatMap(p => p.posts) ?? [];

    if (isLoading) {
        return (
            <View style={{ paddingVertical: 40, alignItems: "center" }}>
                <ActivityIndicator color="#6437ff" />
            </View>
        );
    }

    if (!posts.length) {
        return (
            <View style={{ paddingVertical: 40, alignItems: "center", gap: 10 }}>
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
                    <PostTile key={post._id} post={post} />
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
        </View>
    );
};

export default PostsGrid;