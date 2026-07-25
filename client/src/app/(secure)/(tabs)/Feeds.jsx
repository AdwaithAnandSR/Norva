import { useRef, useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useInfiniteQuery } from "@tanstack/react-query";
import { FlashList } from "@shopify/flash-list";
import { router, useFocusEffect, useIsFocused } from "expo-router";
import { Feather } from "@expo/vector-icons";
import Loader from "../../../components/common/Loader";
import ReelCard from "../../../components/feed/ReelCard.jsx";
import CommentSheet from "../../../components/feed/comment/CommentSheet.jsx";

import {
    fetchReels,
    incrementView
} from "../../../controllers/post/feed.controller.js";
import { useFollowStore } from "../../../store/follow.store.js";

const LIMIT = 6;

const useReels = () =>
    useInfiniteQuery({
        queryKey: ["reels"],
        queryFn: ({ pageParam }) =>
            fetchReels({ cursor: pageParam, limit: LIMIT }),
        initialPageParam: null,
        getNextPageParam: lastPage =>
            lastPage.hasMore ? lastPage.nextCursor : undefined,
        staleTime: 1000 * 60 * 2
    });

const Reels = () => {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        refetch,
        isRefetching
    } = useReels();

    const isFocused = useIsFocused();
    const seedFromPosts = useFollowStore(s => s.seedFromPosts);

    const reels = data?.pages.flatMap(p => p.posts) ?? [];
    const viewedReels = useRef(new Set());

    const [activeId, setActiveId] = useState(null);
    const [pageHeight, setPageHeight] = useState(0);

    useEffect(() => {
        if (reels.length) seedFromPosts(reels);
    }, [reels]);


    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 70,
        minimumViewTime: 150
    }).current;

    const onViewableItemsChanged = useRef(({ viewableItems }) => {
        const top = viewableItems.find(v => v.isViewable);

        if (!top) return;

        setActiveId(top.item._id);

        if (!viewedReels.current.has(top.item._id)) {
            viewedReels.current.add(top.item._id);
            incrementView(top.item._id).catch(() => {});
        }
    }).current;
    
    if (pageHeight === 0) {
        return (
            <View
                className="flex-1 bg-primary"
                onLayout={e => setPageHeight(e.nativeEvent.layout.height)}
            />
        );
    }

    return (
        <View
            className="flex-1 bg-primary"
            onLayout={e => setPageHeight(e.nativeEvent.layout.height)}
        >
            <View
                className="absolute left-0 right-0 z-20 flex-row items-start justify-between px-4"
                style={{ top: 56 }}
                pointerEvents="box-none"
            >
                <Text
                    className="text-white text-2xl"
                    style={{ fontFamily: "LuckiestGuyRegular" }}
                >
                    Reels
                </Text>

                <TouchableOpacity
                    onPress={() => router.push("/CreatePost")}
                    hitSlop={10}
                >
                    <Feather name="camera" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <FlashList
                data={reels}
                renderItem={({ item }) => (
                    <ReelCard
                        post={item}
                        pageHeight={pageHeight}
                        isActive={isFocused && item._id === activeId}
                    />
                )}
                keyExtractor={item => item._id}
                estimatedItemSize={pageHeight}
                pagingEnabled
                refreshing={isRefetching}
                onRefresh={refetch}
                showsVerticalScrollIndicator={false}
                onEndReached={() => {
                    if (hasNextPage && !isFetchingNextPage) {
                        fetchNextPage();
                    }
                }}
                onEndReachedThreshold={1.5}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                ListEmptyComponent={
                    isLoading ? (
                        <View
                            style={{
                                height: pageHeight,
                                justifyContent: "center",
                                alignItems: "center"
                            }}
                        >
                            <Loader size="large" />
                        </View>
                    ) : isError ? (
                        <View
                            style={{
                                height: pageHeight,
                                justifyContent: "center",
                                alignItems: "center"
                            }}
                        >
                            <Text className="text-white" onPress={refetch}>
                                Tap to retry
                            </Text>
                        </View>
                    ) : (
                        <View
                            style={{
                                height: pageHeight,
                                justifyContent: "center",
                                alignItems: "center"
                            }}
                        >
                            <Text className="text-white">No reels yet</Text>
                        </View>
                    )
                }
            />

            <CommentSheet />
        </View>
    );
};

export default Reels;
