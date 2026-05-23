import { View, Text, TouchableOpacity } from "react-native";
import { FlashList } from "@shopify/flash-list";

import CommentRow from "./CommentRow.jsx";
import Loader from "../../common/Loader.tsx";

const CommentList = ({ commentsQuery, onReply }) => {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
        commentsQuery;

    const comments = data?.pages.flatMap(p => p.comments) ?? [];

    const renderItem = ({ item }) => (
        <CommentRow comment={item} onReply={onReply} />
    );

    return (
        <View className="flex-1 px-4">
            <FlashList
                data={comments}
                renderItem={renderItem}
                keyExtractor={item => item._id}
                estimatedItemSize={80}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <Text className="text-white text-lg py-3">Comments</Text>
                }
                ListEmptyComponent={
                    isLoading ? (
                        <View className="py-10 items-center">
                            <Loader />
                        </View>
                    ) : (
                        <View className="py-10 items-center">
                            <Text className="text-zinc-500">No comments</Text>
                        </View>
                    )
                }
                ListFooterComponent={
                    hasNextPage ? (
                        <TouchableOpacity
                            className="py-4 items-center"
                            onPress={fetchNextPage}
                        >
                            {isFetchingNextPage ? (
                                <Loader size="small" />
                            ) : (
                                <Text className="text-zinc-400">Load more</Text>
                            )}
                        </TouchableOpacity>
                    ) : null
                }
            />
        </View>
    );
};

export default CommentList;
