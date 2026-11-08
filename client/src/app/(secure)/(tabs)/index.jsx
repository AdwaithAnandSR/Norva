import { useRef, useEffect } from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useInfiniteQuery } from "@tanstack/react-query";
import { FlashList } from "@shopify/flash-list";

import Header from "../../../components/common/HomeHeader.jsx";
import Loader from "../../../components/common/Loader";
import PostCard from "../../../components/feed/FeedCard.jsx";
import CommentSheet from "../../../components/feed/comment//CommentSheet.jsx";

import { incrementView } from "../../../controllers/post/feed.controller.js";
import { fetchFeed } from "../../../controllers/post/feed.controller.js";

import { useFollowStore } from "../../../store/follow.store.js";

const LIMIT = 10;

const useFeed = () =>
    useInfiniteQuery({
        queryKey: ["feed"],
        queryFn: ({ pageParam }) =>
            fetchFeed({
                cursor: pageParam,
                limit: LIMIT
            }),
        initialPageParam: null,
        getNextPageParam: lastPage =>
            lastPage.hasMore ? lastPage.nextCursor : undefined,
        staleTime: 1000 * 60 * 2
    });

// ─── Sub-components ────────────────────────────────────────────────────────────

const Spinner = () => (
    <View className="py-5 items-center">
        <Loader size="small" />
    </View>
);

const EmptyFeed = () => (
    <View className="flex-1 pt-20 items-center px-10">
        <Text className="text-[48px] mb-3">🌌</Text>
        <Text
            className="text-text text-[22px] text-center mb-2"
            style={{ fontFamily: "WinkyRoughExtraBold" }}
        >
            Nothing here yet
        </Text>
        <Text
            className="text-text/50 text-[13px] text-center leading-5"
            style={{ fontFamily: "SpaceMono" }}
        >
            Be the first to post something into the void.
        </Text>
    </View>
);

const ErrorFeed = ({ onRetry }) => (
    <View className="flex-1 pt-20 items-center px-10">
        <Text className="text-[48px] mb-3">⚠️</Text>
        <Text
            className="text-text text-[22px] text-center mb-2"
            style={{ fontFamily: "WinkyRoughExtraBold" }}
        >
            Couldn't load posts
        </Text>
        <Text
            className="text-text/50 text-[13px] text-center leading-5"
            style={{ fontFamily: "SpaceMono" }}
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
        refetch,
        isRefetching
    } = useFeed();
    
    const seedFromPosts = useFollowStore(s => s.seedFromPosts);

    const posts = data?.pages.flatMap(p => p.posts) ?? [];
    const viewedPosts = useRef(new Set());

    const ListFooter = isFetchingNextPage ? <Spinner /> : null;

    const ListEmpty = isError ? (
        <ErrorFeed onRetry={refetch} />
    ) : isLoading ? (
        <View className="flex-1 items-center">
            <Loader size="large" />
        </View>
    ) : (
        <EmptyFeed />
    );

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
        minimumViewTime: 1000
    }).current;

    const onViewableItemsChanged = ({ viewableItems }) => {
        viewableItems.forEach(({ item }) => {
            if (!viewedPosts.current.has(item._id)) {
                viewedPosts.current.add(item._id);
                incrementView(item._id).catch(() => {});
            }
        });
    }

    useEffect(() => {
        if (posts.length) seedFromPosts(posts);
    }, [posts]);
    
    return (
        <View className="flex-1 bg-primary">
            {/* Top gradient bleed behind the floating header */}
            <LinearGradient
                colors={["#0d0d1a", "transparent"]}
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 10,
                    pointerEvents: "none"
                }}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            />

            {/* Floating header */}
            <View
                className="absolute left-0 right-0 z-20 flex-row"
                style={{ top: 0 }}
                pointerEvents="box-none"
            >
                <Header />
            </View>

            <FlashList
                data={posts}
                renderItem={({ item }) => <PostCard post={item} />}
                keyExtractor={item => item._id}
                estimatedItemSize={380}
                onEndReached={() => {
                    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
                }}
                onEndReachedThreshold={0.4}
                ListFooterComponent={ListFooter}
                ListEmptyComponent={ListEmpty}
                ListHeaderComponent={
                    isRefetching && !isFetchingNextPage ? <Loader /> : null
                }
                className="pt-24"
                contentContainerStyle={{
                    paddingBottom: 150
                }}
                refreshing={isRefetching}
                onRefresh={refetch}
                showsVerticalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
            />
            <CommentSheet />
        </View>
    );
};

export default Home;
