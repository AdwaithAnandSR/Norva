import { useState } from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";

import CommentList from "./CommentList.jsx";
import CommentInput from "./CommentInput.jsx";
import ReplyBanner from "./ReplyBanner.jsx";
import SheetBackdrop from "./SheetBackdrop.jsx";

import { useComments } from "../../../store/comment.store.js";

import { useCommentSheetAnimation } from "../../../hooks/comment/useCommentSheetAnimation.js";
import { useCommentsQuery } from "../../../hooks/comment/useCommentQuery.js";
import { useCommentSubmit } from "../../../hooks/comment/useCommentSubmit.js";

const CommentSheet = () => {
    const visible = useComments(state => state.visible);
    const postId = useComments(state => state.postId);
    const onClose = useComments(state => state.onClose);
    const onCommentAdded = useComments(state => state.onCommentAdded);

    const [text, setText] = useState("");
    const [replyingTo, setReplyingTo] = useState(null);

    const { sheetStyle, backdropStyle } = useCommentSheetAnimation(visible);

    const commentsQuery = useCommentsQuery(postId, visible && !!postId);

    const resetInput = () => {
        setText("");
        setReplyingTo(null);
    };

    const handleReply = comment => {
        setReplyingTo(comment);
    };

    const cancelReply = () => {
        setReplyingTo(null);
    };

    const submitMutation = useCommentSubmit({
        postId,
        text,
        replyingTo,
        resetInput,
        onCommentAdded
    });

    if (!visible) return null;

    return (
        <View
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 99
            }}
            pointerEvents="box-none"
        >
            <SheetBackdrop backdropStyle={backdropStyle} onClose={onClose} />

            <Animated.View
                style={[
                    {
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: "72%",
                        borderTopLeftRadius: 28,
                        borderTopRightRadius: 28,
                        overflow: "hidden",
                        backgroundColor: "#121212"
                    },
                    sheetStyle
                ]}
            >
                <CommentList
                    commentsQuery={commentsQuery}
                    onReply={handleReply}
                />

                <ReplyBanner replyingTo={replyingTo} onCancel={cancelReply} />

                <CommentInput
                    text={text}
                    setText={setText}
                    replyingTo={replyingTo}
                    submitMutation={submitMutation}
                />
            </Animated.View>
        </View>
    );
};

export default CommentSheet;
