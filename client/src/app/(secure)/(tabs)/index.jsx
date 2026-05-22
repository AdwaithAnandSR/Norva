import {
    useCallback
} from "react";
import {
    View,
    Text,
    ActivityIndicator
} from "react-native";
import {
    LinearGradient
} from "expo-linear-gradient";
import {
    useInfiniteQuery
} from "@tanstack/react-query";
import {
    FlashList
} from "@shopify/flash-list";

import Header from "../../../components/common/HomeHeader.jsx";
import PostCard from "../../../components/feed/FeedCard.jsx";
import {
    fetchFeed
} from "../../../controllers/post/feed.controller.js";

const LIMIT = 10;
const HEADER_HEIGHT = 80;

const useFeed = () =>
useInfiniteQuery( {
    queryKey: ["feed"],
    queryFn: ({
        pageParam
    }) => fetchFeed( {
        cursor: pageParam, limit: LIMIT
    }),
    initialPageParam: null,
    getNextPageParam: lastPage =>
    lastPage.hasMore ? lastPage.nextCursor: undefined,
    staleTime: 1000 * 60 * 2
});

// ─── Sub-components ────────────────────────────────────────────────────────────

const Spinner = () => (
    <View className="py-5 items-center">
        <ActivityIndicator size="small" color="#8B5CF6" />
    </View>
);

const EmptyFeed = () => (
    <View className="flex-1 pt-20 items-center px-10">
        <Text className="text-[48px] mb-3">🌌</Text>
        <Text
            className="text-text text-[22px] text-center mb-2"
            style={ { fontFamily: "WinkyRoughExtraBold" }}
            >
            Nothing here yet
        </Text>
        <Text
            className="text-text/50 text-[13px] text-center leading-5"
            style={ { fontFamily: "SpaceMono" }}
            >
            Be the first to post something into the void.
        </Text>
    </View>
);

const ErrorFeed = ({
    onRetry
}) => (
    <View className="flex-1 pt-20 items-center px-10">
        <Text className="text-[48px] mb-3">⚠️</Text>
        <Text
            className="text-text text-[22px] text-center mb-2"
            style={ { fontFamily: "WinkyRoughExtraBold" }}
            >
            Couldn't load posts
        </Text>
        <Text
            className="text-text/50 text-[13px] text-center leading-5"
            style={ { fontFamily: "SpaceMono" }}
            onPress={onRetry}
            >
            Tap to retry
        </Text>
    </View>
);

// ─── Screen ────────────────────────────────────────────────────────────────────

const Home = () => {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        refetch
    } = useFeed();

    const posts = data?.pages.flatMap(p => p.posts) ?? [];

    const onEndReached = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
    },
        [hasNextPage,
            isFetchingNextPage,
            fetchNextPage]);

    const renderItem = useCallback(({
        item
    }) => <PostCard post={item} />,
        []);
    const keyExtractor = useCallback(item => item._id,
        []);

    const ListFooter = isFetchingNextPage ? <Spinner />: null;

    const ListEmpty = isError ? (
        <ErrorFeed onRetry={refetch} />
    ): isLoading ? (
        <View className="flex-1 pt-20 items-center">
            <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
    ): (
        <EmptyFeed />
    );

    return (
        <View className="flex-1 bg-primary">
            {/* Top gradient bleed behind the floating header */}
            <LinearGradient
                colors={["#0d0d1a",
                    "transparent"]}
                style={ {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 10,
                    pointerEvents: "none"
                }}
                start={ { x: 0,
                    y: 0 }}
                end={ { x: 0,
                    y: 1 }}
                />

            {/* Floating header */}
            <View
                className="absolute left-0 right-0 z-20"
                style={ { top: 0,
                }}
                pointerEvents="box-none"
                >
                <Header />
            </View>

            <FlashList
                data={posts}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                estimatedItemSize={380}
                onEndReached={onEndReached}
                onEndReachedThreshold={0.4}
                ListFooterComponent={ListFooter}
                ListEmptyComponent={ListEmpty}
                contentContainerStyle={ {

                    paddingHorizontal: 12
                }}
                showsVerticalScrollIndicator={false}
                />
        </View>
    );
};

export default Home;