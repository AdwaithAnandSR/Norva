import { Keyboard } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";

import { createComment } from "../controllers/post/comment.controller.js";
import { optimisticCommentUpdate } from "../utils/feed/optimisticCommentUpdate.js";

export const useCommentSubmit = ({
    postId,
    text,
    replyingTo,
    resetInput,
    onCommentAdded
}) => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: () =>
            createComment({
                postId,
                content: text.trim(),
                parentId: replyingTo?._id ?? null
            }),

        onSuccess: res => {
            if (!res.success) return;

            const newComment = {
                ...res.comment,
                likedByMe: false
            };

            optimisticCommentUpdate({
                qc,
                postId,
                replyingTo,
                newComment
            });

            resetInput();

            Keyboard.dismiss();

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            onCommentAdded?.();
        }
    });
};
