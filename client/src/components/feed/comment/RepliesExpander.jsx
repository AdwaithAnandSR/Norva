import { View, TouchableOpacity, Text } from "react-native";

import CommentCard from "./CommentCard.jsx";
import Loader from "../../common/Loader.tsx";
import { useRepliesQuery } from "../../../hooks/comment/useRepliesQuery.js";

const RepliesExpander = ({ comment, onReply, isExpanded, onToggleExpand }) => {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
        useRepliesQuery(comment._id, isExpanded);

    const replies = data?.pages.flatMap(p => p.replies) ?? [];

    if (comment.repliesCount === 0 && !isExpanded) return null;

    return (
        <View>
            {!isExpanded && (
                <TouchableOpacity
                    className="pl-10 py-1"
                    onPress={onToggleExpand}
                >
                    <Text className="text-zinc-500 text-xs">View replies</Text>
                </TouchableOpacity>
            )}

            {isExpanded && isLoading ? (
                <Loader size="small" />
            ) : (
                isExpanded &&
                replies.map(reply => (
                    <CommentCard
                        key={reply._id}
                        comment={reply}
                        isReply
                        onReply={onReply}
                        postId={comment.postId} // or pass postId from parent sheet
                        parentId={comment._id}
                    />
                ))
            )}

            {isExpanded && hasNextPage && (
                <TouchableOpacity
                    className="pl-10 pt-1"
                    onPress={fetchNextPage}
                >
                    {isFetchingNextPage ? (
                        <Loader size="small" />
                    ) : (
                        <Text className="text-zinc-500 text-xs">
                            Load more replies
                        </Text>
                    )}
                </TouchableOpacity>
            )}
        </View>
    );
};

export default RepliesExpander;
