import { View } from "react-native";

import CommentCard from "./CommentCard.jsx";
import RepliesExpander from "./RepliesExpander.jsx";

const CommentRow = ({ comment, onReply }) => {
    return (
        <View className="pb-1">
            <CommentCard
                comment={comment}
                onReply={onReply}
            />

            <RepliesExpander
                comment={comment}
                onReply={onReply}
            />
        </View>
    );
};

export default CommentRow