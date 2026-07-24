import { View } from "react-native";

import CommentCard from "./CommentCard.jsx";
import RepliesExpander from "./RepliesExpander.jsx";

const CommentRow = ({ comment, onReply, isExpanded, onToggleExpand, postId }) => {
    return (
        <View className="pb-1">
            <CommentCard comment={comment} onReply={onReply} postId={postId} />

            <RepliesExpander
                comment={comment}
                onReply={onReply}
                postId={postId}
                isExpanded={isExpanded}
                onToggleExpand={onToggleExpand}
            />
        </View>
    );
};

export default CommentRow;
