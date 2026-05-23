import { useState } from "react";
import { View, TouchableOpacity, Text } from "react-native";

import CommentCard from "./CommentCard.jsx";
import Loader from "../../common/Loader.tsx";

import { useRepliesQuery } from "../../../hooks/useRepliesQuery.js";

const RepliesExpander = ({ comment, onReply }) => {
    const [open, setOpen] = useState(false);

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useRepliesQuery(comment._id, open);

    const replies = data?.pages.flatMap(p => p.replies) ?? [];

    if (comment.repliesCount === 0 && !open) return null;

    return (
        <View>
            {!open && (
                <TouchableOpacity
                    className="pl-10 py-1"
                    onPress={() => setOpen(true)}
                >
                    <Text className="text-zinc-500 text-xs">View replies</Text>
                </TouchableOpacity>
            )}

            {open && !replies.length ? (
                <Loader size="small" />
            ) : (
                replies.map(reply => (
                    <CommentCard key={reply._id} comment={reply} isReply onReply={onReply} />
                ))
            )}

            {open && hasNextPage && (
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
